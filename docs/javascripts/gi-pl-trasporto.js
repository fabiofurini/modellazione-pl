/* Laboratorio di «Modellazione PL / LP Modelling»: l'app di copertina della home.
 *
 *   pl-trasporto   il problema del trasporto (Esempio 4.5, stessa notazione) su un'istanza piccola:
 *                  s = 2 magazzini, r = 3 clienti, 6 variabili, 5 vincoli.
 *                  f = [[1, 1, f13], [5, 3, 8]] € per unità, d = (d1, 50), e = (30, 20, 40) unità.
 *                  Cursori: il costo f13 (1, 3, ..., 11: i cambi di piano cadono sui valori pari 4, 6, 8,
 *                  dove due piani hanno lo stesso costo) e la capacità d1 (40..100).
 *                  Valori iniziali f13 = 5, d1 = 60: piano (30, 0, 30 | 0, 20, 10), costo 320 €.
 *
 * Stesso formato di «pl-produzione» (gi-pl-app.js): il problema a parole con variabili e dati, il modello
 * simbolico, il blocco «Soluzione ottima», il modello numerico in fondo al riquadro (GI_PL_NUM, GI_PL_SOL,
 * GI_PL_FONDO, GI_PL_DV, GI_PL_FR, letti al montaggio) e la ricetta a voci di gi-ott.js. Niente grafico: la
 * board resta nascosta.
 */
(function () {
  "use strict";
  const GI = window.GI, T = GI.T;
  window.GI_RICETTE = window.GI_RICETTE || {};
  const tx = (s) => `\\(${s}\\)`;
  const SA = () => T("\\text{soggetto a}", "\\text{subject to}");

  const DATI = { f: [[1, 1, 5], [5, 3, 8]], d: [60, 50], e: [30, 20, 40] };
  const S = 2, R = 3;

  /** l'LP sui dati dei cursori: colonne x_11, x_12, x_13, x_21, x_22, x_23 */
  function calcola(v) {
    const f = DATI.f.map((r) => r.slice()), d = DATI.d.slice();
    f[0][2] = v[0]; d[0] = v[1];
    const c = f.flat(), A = [], rel = [], b = [];
    for (let i = 0; i < S; i++) { const a = new Array(S * R).fill(0); for (let j = 0; j < R; j++) a[i * R + j] = 1; A.push(a); rel.push("<="); b.push(d[i]); }
    for (let j = 0; j < R; j++) { const a = new Array(S * R).fill(0); for (let i = 0; i < S; i++) a[i * R + j] = 1; A.push(a); rel.push("="); b.push(DATI.e[j]); }
    const lp = { c, A, rel, b }, r = window.GI_OTT.lp(Object.assign({ senso: "min" }, lp));
    const out = { stato: r.stato, f, d, lp };
    if (r.stato !== "ottimo") return out;
    out.x = [0, 1].map((i) => [0, 1, 2].map((j) => (Math.abs(r.x[i * R + j]) < 1e-7 ? 0 : r.x[i * R + j])));
    out.z = r.z;
    return out;
  }

  const vTrasporto = {
    etichetta: T("Trasporto", "Transportation"),
    cursori: [
      { nome: T("\\text{costo}\\ f_{13}", "\\text{cost}\\ f_{13}"), min: 1, max: 11, step: 2, val: 5,
        fmt: (x) => T(`${x} € per unità`, `${x} € per unit`),
        descr: T("costo di un'unità dal magazzino 1 al cliente 3", "cost of one unit from warehouse 1 to customer 3") },
      { nome: T("\\text{capacità}\\ d_1", "\\text{capacity}\\ d_1"), min: 40, max: 100, step: 5, val: 60,
        fmt: (x) => T(`${x} unità`, `${x} units`),
        descr: T("capacità del magazzino 1", "capacity of warehouse 1") },
    ],
    calcola,
    formula(Rr, v, st) {
      const NUM = window.GI_PL_NUM, DV = window.GI_PL_DV, FONDO = window.GI_PL_FONDO;
      const sim = `\\min ~~ \\sum_{i=1}^{s} \\sum_{j=1}^{r} ${st.col("a", "f_{ij}")}\\, x_{ij} & & \\\\
        ${SA()} \\quad \\sum_{j=1}^{r} x_{ij} &\\le ${st.col("b", "d_i")}, & \\forall i \\in \\{1, \\dots, s\\}, \\\\
        \\sum_{i=1}^{s} x_{ij} &= e_j, & \\forall j \\in \\{1, \\dots, r\\}, \\\\
        x_{ij} &\\ge 0, & \\forall i \\in \\{1, \\dots, s\\},~\\forall j \\in \\{1, \\dots, r\\}.`;
      const vars = [];
      for (let i = 0; i < S; i++) for (let j = 0; j < R; j++) vars.push(`x_{${i + 1}${j + 1}}`);
      const num = NUM.numLP({ senso: "min", vars, c: Rr.lp.c, cifre: 0,
        righe: Rr.lp.A.map((a, k) => ({ a, rel: Rr.lp.rel[k], rhs: Rr.lp.b[k] })) },
        T(`Il modello LP dell'istanza: ${vars.length} variabili, ${Rr.lp.b.length} vincoli.`, `The LP model of the instance: ${vars.length} variables, ${Rr.lp.b.length} constraints.`));
      const TAB = DV.tabelle(DV.tab(T("Costi \\(f_{ij}\\) (€ per unità), capacità \\(d_i\\) e domande \\(e_j\\) (unità)", "Costs \\(f_{ij}\\) (€ per unit), capacities \\(d_i\\) and demands \\(e_j\\) (units)"),
        [tx("i \\backslash j"), "1", "2", "3", tx("d_i")],
        [...Rr.f.map((r, i) => [String(i + 1), ...r.map(String), String(Rr.d[i])]), [tx("e_j"), ...DATI.e.map(String), ""]]));
      const testo = T(
        "<b>Il problema.</b> Due magazzini riforniscono tre clienti. Decidiamo quante unità spedire da ogni magazzino a ogni cliente, " +
        "con costo totale minimo, senza superare la capacità dei magazzini e servendo per intero la domanda dei clienti." +
        "<br><b>Variabili:</b> \\(x_{ij} \\ge 0\\): unità spedite dal magazzino \\(i\\) al cliente \\(j\\)." +
        `<br><b>Dati:</b> \\(s = ${S}\\) magazzini, \\(r = ${R}\\) clienti; \\(f_{ij}\\): costo di un'unità da \\(i\\) a \\(j\\); \\(d_i\\): capacità del magazzino \\(i\\); \\(e_j\\): domanda del cliente \\(j\\).` + TAB,
        "<b>The problem.</b> Two warehouses supply three customers. We decide how many units to ship from each warehouse to each customer, " +
        "at minimum total cost, without exceeding the capacity of the warehouses and serving the demand of the customers in full." +
        "<br><b>Variables:</b> \\(x_{ij} \\ge 0\\): units shipped from warehouse \\(i\\) to customer \\(j\\)." +
        `<br><b>Data:</b> \\(s = ${S}\\) warehouses, \\(r = ${R}\\) customers; \\(f_{ij}\\): cost of one unit from \\(i\\) to \\(j\\); \\(d_i\\): capacity of warehouse \\(i\\); \\(e_j\\): demand of customer \\(j\\).` + TAB);
      const html = `<div class="plm"><p class="plm-testo">${testo}</p>` +
        `<div class="plm-sim">\\(\\displaystyle \\begin{aligned} ${sim} \\end{aligned}\\)</div>` +
        `<details class="plm-num" open><summary>${T("Modello numerico con i dati attuali", "Numerical model with the current data")}</summary>` +
        `<div class="plm-num-corpo">${num}</div></details></div>`;
      return FONDO.sposta(st, html);
    },
    // niente grafico: la board resta nascosta
    disegna(crea, Rr, v, C, Sz, st, board) { if (board && board.containerObj) board.containerObj.style.display = "none"; },
    soluzione(Rr) {
      if (Rr.stato !== "ottimo") return T("Nessun piano ammissibile.", "No feasible plan.");
      const SOL = window.GI_PL_SOL, FR = window.GI_PL_FR;
      return SOL.blocco(`${T("Costo ottimo", "Optimal cost")}: <b>${FR.txt(Rr.z)} €</b>`, [
        SOL.tab(T("Spedizioni \\(\\tilde x_{ij}\\) (unità): magazzino \\(i\\) per riga, cliente \\(j\\) per colonna", "Shipments \\(\\tilde x_{ij}\\) (units): warehouse \\(i\\) by row, customer \\(j\\) by column"),
          [tx("i \\backslash j"), "1", "2", "3"], Rr.x.map((r, i) => [String(i + 1), ...r.map((q) => FR.z(q))])),
      ], T("«—»: nessuna spedizione.", "«—»: no shipment."));
    },
    domanda: T("Porta \\(f_{13}\\) a 7: il magazzino 1 serve anche il cliente 2. Porta \\(d_1\\) a 90: il magazzino 2 non spedisce più nulla.",
      "Set \\(f_{13}\\) to 7: warehouse 1 also serves customer 2. Set \\(d_1\\) to 90: warehouse 2 ships nothing any more."),
  };

  window.GI_RICETTE["pl-trasporto"] = () => {
    const voci = { trasporto: vTrasporto };
    window.GI_PL_SOL.voci(voci);
    return window.GI_OTT.ricettaVoci({ titolo: T("Trasporto dai magazzini ai clienti", "Transportation from warehouses to customers") }, voci);
  };
  // per le prove automatiche: solo il calcolo
  window.GI_PL_TRASPORTO = { calcola, DATI };
})();
