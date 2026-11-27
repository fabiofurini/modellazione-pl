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
 * GI_PL_FONDO, GI_PL_DV, GI_PL_FR, letti al montaggio) e la ricetta a voci di gi-ott.js. La figura, al posto
 * del grafico della produzione, è il grafo bipartito delle spedizioni ottime.
 */
(function () {
  "use strict";
  const GI = window.GI, T = GI.T;
  window.GI_RICETTE = window.GI_RICETTE || {};
  const tx = (s) => `\\(${s}\\)`;
  const SA = () => T("\\text{soggetto a}", "\\text{subject to}");
  /** la radice del sito (come in gi-pl-app.js) */
  const radice = () => {
    try { if (window.__md_scope) return new URL(window.__md_scope); } catch (e) { /* sotto */ }
    const cfg = document.getElementById("__config");
    try { return new URL(JSON.parse(cfg.textContent).base + "/", location.href); } catch (e) { return new URL("./", location.href); }
  };

  const DATI = { f: [[1, 1, 5], [5, 3, 8]], d: [60, 50], e: [30, 20, 40] };
  const S = 2, R = 3;
  const dec = (x) => (Number.isInteger(x) ? String(x) : String(x).replace(".", T(",", ".")));   // dati: 62,5 e non 125/2

  // home (data-vetrina): il riquadro «Dati» va nella colonna dei cursori, sopra di essi, come nell'app di Modellazione PNL
  // (la soluzione sta già a destra, sotto i cursori: GI_PL_SOL)
  function datiDestra(st) {
    const ctrl = st.el.querySelector(".gi-ctrl");
    if (!ctrl) return;
    const dx = ctrl.parentElement;
    const dati = st.el.querySelector(".plm .plm-dati");   // il riquadro «Dati» appena ridisegnato: sopra i cursori
    if (dati) { dx.querySelectorAll(":scope > .plm-dati").forEach((e) => e.remove()); dx.insertBefore(dati, ctrl); }
  }

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
      { nome: T("\\text{capacità}\\ d_1", "\\text{capacity}\\ d_1"), min: 40, max: 100, step: 2.5, val: 60,   // passi di 2,5: anche soluzioni frazionarie (65/2, 15/2)
        fmt: (x) => T(`${String(x).replace(".", ",")} unità`, `${x} units`),
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
      const TAB = DV.tabelle(DV.tab(T("Dimensioni", "Sizes"), [tx("s"), tx("r")], [[String(S), String(R)]]), DV.tab(T("\\(f_{ij}\\) (€), \\(d_i\\) e \\(e_j\\) (unità)", "\\(f_{ij}\\) (€), \\(d_i\\) and \\(e_j\\) (units)"),
        [tx("i \\backslash j"), "1", "2", "3", tx("d_i")],
        [...Rr.f.map((r, i) => [String(i + 1), ...r.map(String), dec(Rr.d[i])]), [tx("e_j"), ...DATI.e.map(String), ""]]));
      const testo = T(
        "<b>Il problema.</b> Alcuni magazzini riforniscono alcuni clienti. Decidiamo quante unità spedire da ogni magazzino a ogni cliente, " +
        "con costo totale minimo, senza superare la capacità dei magazzini e servendo per intero la domanda dei clienti." +
        "<br><b>Variabili:</b> \\(x_{ij} \\ge 0\\): unità spedite dal magazzino \\(i\\) al cliente \\(j\\), con \\(i \\in \\{1, \\dots, s\\}\\) e \\(j \\in \\{1, \\dots, r\\}\\)." +
        `<br><b>Dati:</b> \\(s\\): numero di magazzini; \\(r\\): numero di clienti; \\(f_{ij}\\): costo di un'unità da \\(i\\) a \\(j\\); \\(d_i\\): capacità del magazzino \\(i\\); \\(e_j\\): domanda del cliente \\(j\\); con \\(i \\in \\{1, \\dots, s\\}\\) e \\(j \\in \\{1, \\dots, r\\}\\).` + TAB,
        "<b>The problem.</b> Some warehouses supply some customers. We decide how many units to ship from each warehouse to each customer, " +
        "at minimum total cost, without exceeding the capacity of the warehouses and serving the demand of the customers in full." +
        "<br><b>Variables:</b> \\(x_{ij} \\ge 0\\): units shipped from warehouse \\(i\\) to customer \\(j\\), with \\(i \\in \\{1, \\dots, s\\}\\) and \\(j \\in \\{1, \\dots, r\\}\\)." +
        `<br><b>Data:</b> \\(s\\): number of warehouses; \\(r\\): number of customers; \\(f_{ij}\\): cost of one unit from \\(i\\) to \\(j\\); \\(d_i\\): capacity of warehouse \\(i\\); \\(e_j\\): demand of customer \\(j\\); with \\(i \\in \\{1, \\dots, s\\}\\) and \\(j \\in \\{1, \\dots, r\\}\\).` + TAB);
      const V = !!st.el.dataset.vetrina;
      if (V) setTimeout(() => datiDestra(st), 0);
      const pag = new URL((GI.EN ? "techniques-models-02/" : "tecniche-modelli-02/"), radice()).href;
      const cap = V ? "" : `<p class="plm-cap">${T("Il modello è spiegato nella pagina", "The model is explained on the page")} <a href="${pag}">${T("Esempio 4.5 — Trasporto dai magazzini ai clienti", "Example 4.5 — Transportation from warehouses to clients")}</a>.</p>`;
      const html = `<div class="plm"><p class="plm-testo">${testo}</p>${cap}` +
        `<div class="plm-sim">\\(\\displaystyle \\begin{aligned} ${sim} \\end{aligned}\\)</div>` +
        `<details class="plm-num"><summary>${T("Modello numerico con i dati attuali", "Numerical model with the current data")}</summary>` +
        `<div class="plm-num-corpo">${num}</div></details></div>`;
      return FONDO.sposta(st, html);
    },
    // la figura: grafo bipartito magazzini → clienti; archi con x̃_ij > 0 pieni, spessi quanto la quantità e
    // con il valore, archi vuoti sottili, chiari e tratteggiati
    disegna(crea, Rr, v, C, Sz) {
      const M = window.GI_MIP, FR = window.GI_PL_FR, W = Sz.W, H = Sz.H;
      M.scritta(crea, W / 2, H - 16, T("Spedizioni ottime x̃ᵢⱼ(LP): lo spessore dell'arco cresce con la quantità", "Optimal shipments x̃ᵢⱼ(LP): the arc gets thicker with the quantity"),
        { fontSize: 13.5, strokeColor: C.testo, cssStyle: "font-weight:700" });
      if (Rr.stato !== "ottimo") return M.scritta(crea, W / 2, H / 2, T("Nessun piano ammissibile", "No feasible plan"), { fontSize: 15, strokeColor: C.rosso });
      const xs = W * 0.24, xc = W * 0.76, r = Math.max(15, Math.min(22, H / 22)), alto = H - 70, basso = 40;
      const ys = [0, 1].map((i) => alto - (alto - basso) * (0.2 + 0.6 * i)), yc = [0, 1, 2].map((j) => alto - (alto - basso) * j / 2);   // nodi distanziati su tutta l'altezza
      const qMax = Math.max(...DATI.e);
      // archi: prima quelli vuoti, poi quelli pieni (sopra)
      const archi = [];
      for (let i = 0; i < S; i++) for (let j = 0; j < R; j++) archi.push([i, j, Rr.x[i][j]]);
      archi.sort((a, b) => (a[2] > 1e-9) - (b[2] > 1e-9));
      for (const [i, j, q] of archi) {
        const dx = xc - xs, dy = yc[j] - ys[i], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        const p0 = [xs + ux * (r + 2), ys[i] + uy * (r + 2)], p1 = [xc - ux * (r + 4), yc[j] - uy * (r + 4)];
        const pieno = q > 1e-9;
        crea("arrow", [p0, p1], { strokeColor: pieno ? C.b : C.grigio, strokeOpacity: pieno ? 1 : 0.6, strokeWidth: pieno ? 2 + 7 * q / qMax : 1.2,
          dash: pieno ? 0 : 2, fixed: true, highlight: false, withLabel: false, lastArrow: { type: 2, size: pieno ? 3 : 6 } });
        // il valore sopra l'arco (spostato di lato perché l'arco spesso non lo copra): vicino al magazzino 1 per i suoi
        // archi, oltre la metà per quelli del magazzino 2, così i valori non si sovrappongono dove gli archi si incrociano
        const fr = 0.26;   // posizione fissa per ogni arco: il valore non si sposta quando cambia la soluzione
        if (pieno) M.scritta(crea, p0[0] + (p1[0] - p0[0]) * fr, p0[1] + (p1[1] - p0[1]) * fr, FR.txt(q), { fontSize: 13, strokeColor: C.b,
          display: "html", cssStyle: "font-weight:700;background:var(--md-default-bg-color);padding:0 .25em;border-radius:3px" });
      }
      // nodi: magazzini a sinistra (capacità d_i), clienti a destra (domanda e_j)
      ys.forEach((y, i) => {
        M.pallino(crea, xs, y, { size: r, fillColor: C.b, strokeColor: C.b });
        M.scritta(crea, xs, y, String(i + 1), { fontSize: 14, strokeColor: "#ffffff", cssStyle: "font-weight:700" });
        M.scritta(crea, xs - r - 10, y + 9, T(`magazzino ${i + 1}`, `warehouse ${i + 1}`), { anchorX: "right", fontSize: 12.5, strokeColor: C.testo });
        M.scritta(crea, xs - r - 10, y - 9, `d${"₁₂"[i]} = ${dec(Rr.d[i])}`, { anchorX: "right", fontSize: 12.5, strokeColor: C.testo });
      });
      yc.forEach((y, j) => {
        M.pallino(crea, xc, y, { size: r, fillColor: C.c, strokeColor: C.c });
        M.scritta(crea, xc, y, String(j + 1), { fontSize: 14, strokeColor: "#ffffff", cssStyle: "font-weight:700" });
        M.scritta(crea, xc + r + 10, y + 9, T(`cliente ${j + 1}`, `customer ${j + 1}`), { anchorX: "left", fontSize: 12.5, strokeColor: C.testo });
        M.scritta(crea, xc + r + 10, y - 9, `e${"₁₂₃"[j]} = ${FR.txt(DATI.e[j])}`, { anchorX: "left", fontSize: 12.5, strokeColor: C.testo });
      });
      M.scritta(crea, W / 2, 14, T("tratteggio: nessuna spedizione", "dashed: no shipment"), { fontSize: 11.5, strokeColor: C.muted });
    },
    soluzione(Rr) {
      if (Rr.stato !== "ottimo") return T("Nessun piano ammissibile.", "No feasible plan.");
      const SOL = window.GI_PL_SOL, FR = window.GI_PL_FR;
      return SOL.blocco(`${T("Costo ottimo", "Optimal cost")} \\(z(\\text{LP})\\) = <b>${FR.txt(Rr.z)} €</b>`, [
        SOL.tab(T("Spedizioni \\(\\tilde x_{ij}(\\text{LP})\\) (unità)", "Shipments \\(\\tilde x_{ij}(\\text{LP})\\) (units)"),
          [tx("i \\backslash j"), "1", "2", "3"], Rr.x.map((r, i) => [String(i + 1), ...r.map((q) => FR.z(q))])),
      ], T("«—»: nessuna spedizione.", "«—»: no shipment."));
    },
    domanda: T("Porta \\(f_{13}\\) a 7: il magazzino 1 serve anche il cliente 2. Porta \\(d_1\\) a 62,5: la soluzione diventa frazionaria, \\(\\tilde x_{13}(\\text{LP}) = 65/2\\).",
      "Set \\(f_{13}\\) to 7: warehouse 1 also serves customer 2. Set \\(d_1\\) to 62.5: the solution becomes fractional, \\(\\tilde x_{13}(\\text{LP}) = 65/2\\)."),
  };

  window.GI_RICETTE["pl-trasporto"] = () => {
    const voci = { trasporto: vTrasporto };
    window.GI_PL_SOL.voci(voci);
    return window.GI_OTT.ricettaVoci({ titolo: T("Trasporto dai magazzini ai clienti", "Transportation from warehouses to customers") }, voci);
  };
  // per le prove automatiche: solo il calcolo
  window.GI_PL_TRASPORTO = { calcola, DATI };
})();
