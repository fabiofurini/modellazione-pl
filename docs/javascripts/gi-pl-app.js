/* Laboratorio di «Modellazione PL / LP Modelling»: le ricette delle app.
 *
 *   pl-modelli     (home) tre modelli LP a voci: produzione, ricarica EV, newsvendor
 *   pl-produzione  cap. 4: piano ottimo, scorte, prezzi ombra della capacità
 *   pl-ricarica-ev cap. 5: ricarica notturna a costo minimo
 *   pl-dea         cap. 6: efficienza, peer e target di una filiale (CCR/BCC, 4 indicatori o personale→prestiti)
 *   pl-newsvendor  cap. 7: costo atteso e CVaR sui 600 scenari, ordine ottimo
 *   pl-regressione cap. 10: scarti assoluti e quantile, punti trascinabili
 *
 * I modelli (puri) stanno in gi-pl-modelli.js, i risolutori e le ricette «a voci» in gi-ott.js.
 * Ogni numero viene dal simplesso in JS sugli stessi dati degli script: python/test_laboratorio.py
 * lo confronta con Gurobi.
 */
(function () {
  "use strict";
  const GI = window.GI, M = window.GI_MIP, O = window.GI_OTT, PL = () => window.GI_PL, DD = () => window.GI_DATI_PL;
  const T = GI.T;
  window.GI_RICETTE = window.GI_RICETTE || {};
  const n = (x, c = 1) => GI.num(x, c), nt = (x, c = 1) => GI.numTxt(x, c);
  const pct = (v) => nt(v, 0) + "%";
  const euro = (x, c = 2) => nt(x, c) + " €";
  const tx = (s) => `\\(${s}\\)`;
  const margini = (S, alto = 22, basso = 36) => ({ X0: 54, X1: S.W - 14, alto, basso });

  /** messaggio al centro della board (modello inammissibile) */
  const avviso = (crea, S, C, testo) =>
    M.scritta(crea, S.W / 2, S.H / 2, testo, { fontSize: 15, strokeColor: C.rosso, cssStyle: "font-weight:700" });

  // ================================================================ il modello sopra il grafico
  /* Ogni app mostra, sopra il grafico: il problema a parole (dal capitolo), il modello simbolico
   * impaginato come nel capitolo (aligned: min, «soggetto a», un vincolo per riga, relazioni in
   * colonna, ∀ a destra) e, in un blocco richiudibile, il modello numerico con i dati dei cursori. */
  const NUM = { aperto: false };
  document.addEventListener("toggle", (e) => {
    const d = e.target;
    if (d && d.classList && d.classList.contains("plm-num")) { NUM.aperto = d.open; limita(d); window.dispatchEvent(new Event("resize")); }
  }, true);
  /** a tutta pagina il modello numerico si apre sopra il grafico: resta dentro il riquadro dell'app */
  function limita(d) {
    const app = d.closest(".gi-app-intera"), corpo = d.querySelector(".plm-num-corpo");
    if (!app || !corpo || !d.open || window.innerWidth < 860) { if (corpo) corpo.style.maxHeight = ""; return; }
    const spazio = app.getBoundingClientRect().bottom - d.getBoundingClientRect().bottom - 10;
    corpo.style.maxHeight = Math.max(200, Math.round(spazio)) + "px";
  }
  window.addEventListener("resize", () => document.querySelectorAll(".gi-app-intera details.plm-num[open]").forEach(limita));
  // le app a tutta pagina ricalcolano l'altezza del grafico quando il riquadro del modello cambia altezza
  if (window.ResizeObserver) {
    let attesa = 0;
    const ro = new ResizeObserver(() => { clearTimeout(attesa); attesa = setTimeout(() => window.dispatchEvent(new Event("resize")), 120); });
    const osserva = () => document.querySelectorAll(".gi-app-intera details.plm-num[open]:not([data-lim])").forEach((d) => { d.dataset.lim = "1"; limita(d); }) ||
      document.querySelectorAll(".gi-app-intera .gi-formula:not([data-plm])").forEach((f) => { f.dataset.plm = "1"; ro.observe(f); });
    new MutationObserver(osserva).observe(document.documentElement, { childList: true, subtree: true });
  }
  const SA = () => T("\\text{soggetto a}", "\\text{subject to}");
  const PER = (i, m) => `\\forall ${i} \\in \\{1, 2, \\dots, ${m}\\}`;
  const REL = { "<=": "\\le", "=": "=", ">=": "\\ge", "><": "\\gtreqless" };
  /** a·var con il segno: [[coeff, "x_1"], ...] -> "12\,x_1 - 3\,x_2"; coeff 1 omesso */
  const somma = (termini, c = 2) => termini.map(([a, x], k) => {
    const s = a < 0 ? (k ? " - " : "-") : (k ? " + " : ""), m = Math.abs(a);
    return s + (Math.abs(m - 1) < 1e-12 ? "" : n(m, c) + "\\,") + x;
  }).join("");
  /** modello numerico: obiettivo (righe) e vincoli [lhs, rel, rhs, nota], relazioni in colonna */
  const numerico = (senso, obiettivo, righe) => {
    const ob = obiettivo.length > 1 ? `\\begin{aligned}[t] ${obiettivo.map((l) => "& " + l).join(" \\\\ ")} \\end{aligned}` : obiettivo[0];
    const corpo = righe.map((r, k) =>
      `${k ? "" : SA()} & ${r[0]} & ${REL[r[1]] || ""} & ${r[2]} & ${r[3] ? "\\quad " + r[3] : ""} \\\\`).join("\n");
    return `<div class="plm-riga">\\(\\displaystyle \\${senso}\\ \\ ${ob}\\)</div>` +
      `<div class="plm-riga">\\(\\displaystyle \\begin{array}{lrcll} ${corpo} \\end{array}\\)</div>`;
  };
  /** il blocco completo: problema, modello simbolico, modello numerico richiudibile */
  const modello = (testo, simbolico, num, nota) =>
    `<div class="plm"><p class="plm-testo">${testo}</p>` +
    `<div class="plm-sim">\\(\\displaystyle \\begin{aligned} ${simbolico} \\end{aligned}\\)</div>` +
    `<details class="plm-num"${NUM.aperto ? " open" : ""}><summary>${T("Modello numerico con i dati attuali", "Numerical model with the current data")}</summary>` +
    `<div class="plm-num-corpo">${num}${nota ? `<p class="plm-nota">${nota}</p>` : ""}</div></details></div>`;

  // ================================================================ produzione (cap. 4)
  const PRODOTTO = (C) => [C.a, C.b, C.c];
  const vProduzione = {
    etichetta: T("Produzione e scorte", "Production and inventory"),
    cursori: [
      { nome: T("\\text{domanda}", "\\text{demand}"), min: 80, max: 105, step: 1, val: 100, fmt: pct,
        descr: T("tutte le domande \\(d_{it}\\), in % dei dati del capitolo", "all the demands \\(d_{it}\\), in % of the chapter data") },
      { nome: T("\\text{capacità}", "\\text{capacity}"), min: 95, max: 130, step: 1, val: 100, fmt: pct,
        descr: T("ore macchina \\(b_t\\) di ogni mese", "machine hours \\(b_t\\) of every month") },
      { nome: T("\\text{giacenza}", "\\text{holding}"), min: 25, max: 300, step: 25, val: 100, fmt: pct,
        descr: T("costo di giacenza \\(h_{it}\\)", "holding cost \\(h_{it}\\)") },
    ],
    calcola: (v) => PL().produzione(v[1] / 100, v[0] / 100, v[2] / 100),
    formula(R, v, st) {
      const P = DD().produzione, nI = P.prodotti.length, nT = P.mesi.length;
      const it = `${PER("i", "n")},~${PER("t", "m")}`;
      const sim = `\\min ~~ \\sum_{i=1}^{n} \\sum_{t=1}^{m} \\bigl( c_{it}\\, x_{it} + ${st.col("c", "h_{it}")}\\, s_{it} \\bigr) & & \\\\
        ${SA()} \\quad s_{i,t-1} + x_{it} &= ${st.col("a", "d_{it}")} + s_{it}, & ${it}, \\\\
        \\sum_{i=1}^{n} a_i\\, x_{it} &\\le ${st.col("b", "b_t")}, & ${PER("t", "m")}, \\\\
        x_{it} &\\ge 0, & ${it}, \\\\
        s_{it} &\\ge 0, & ${it}.`;
      const fD = v[0] / 100, fC = v[1] / 100, fH = v[2] / 100;
      const lista = (x, i) => P.mesi.map((m, t) => `${x}_{${i + 1},${t + 1}}`).join(" + ");
      const ob = P.prodotti.map((p, i) => `${i ? "+ " : ""}${n(P.cp[i], 2)}\\,(${lista("x", i)}) + ${n(P.ch[i] * fH, 3)}\\,(${lista("s", i)})`);
      const righe = [];
      for (let i = 0; i < nI; i++) for (let t = 0; t < nT; t++)
        righe.push([`${t ? `s_{${i + 1},${t}}` : n(P.s0[i], 1)} + x_{${i + 1},${t + 1}}`, "=", `${n(P.domanda[i][t] * fD, 1)} + s_{${i + 1},${t + 1}}`, `i = ${i + 1},~t = ${t + 1}`]);
      for (let t = 0; t < nT; t++)
        righe.push([somma(P.ore.map((a, i) => [a, `x_{${i + 1},${t + 1}}`])), "<=", n(P.cap[t] * fC, 1), `t = ${t + 1}`]);
      righe.push(["x_{it},~ s_{it}", ">=", "0", `i \\in \\{1, 2, 3\\},~ t \\in \\{1, 2, \\dots, 6\\}`]);
      return modello(T(`<b>Il problema.</b> Decidiamo quante unità di ognuno dei ${nI} prodotti produrre in ognuno dei ${nT} mesi e quante tenerne a scorta. ` +
        "L'obiettivo è minimizzare il costo di produzione e di giacenza. I vincoli: bilancio di magazzino mese per mese, con la domanda servita per intero, e ore macchina disponibili in ogni mese.",
      `<b>The problem.</b> We decide how many units of each of the ${nI} products to produce in each of the ${nT} months and how many to keep in inventory. ` +
        "The objective is to minimize production and holding cost. The constraints: inventory balance month by month, with demand served in full, and the machine hours available in each month."),
      sim, numerico("min", ob, righe),
      T("Righe: 18 vincoli di bilancio (per \\(t = 1\\) compare la scorta iniziale \\(s_{i0}\\)), poi i 6 vincoli di capacità.",
        "Rows: 18 balance constraints (for \\(t = 1\\) the initial inventory \\(s_{i0}\\) appears), then the 6 capacity constraints."));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile: la capacità non basta per la domanda", "No feasible plan: capacity does not cover demand"));
      const P0 = DD().produzione, mg = margini(S), col = PRODOTTO(C), nT = P0.mesi.length;
      const hTop = (S.H - mg.alto - mg.basso) * 0.6, gap = 42;
      const maxH = Math.max(...R.cap, ...R.ore) * 1.22;
      const top = O.pannello(crea, { X0: mg.X0, X1: mg.X1, Y0: S.H - mg.alto - hTop, Y1: S.H - mg.alto, xa: 0.4, xb: nT + 0.6, ya: 0, yb: maxH,
        ny: T("ore macchina al mese", "machine hours per month") }, C, { nTx: 0, nTy: 4 });
      O.barre(crea, top, P0.mesi.map((m, t) => ({ x: t + 1, pezzi: R.x.map((riga, i) => [P0.ore[i] * riga[t], col[i]]) })), 0.56);
      R.cap.forEach((c, t) => {
        M.linea(crea, top.X(t + 0.62), top.Y(c), top.X(t + 1.38), top.Y(c), { strokeColor: C.rosso, strokeWidth: 2.5, dash: 2 });
        if (R.ore[t] > c - 1e-6) M.scritta(crea, top.X(t + 1), top.Y(c) + 4, S.W > 520 ? T("satura", "binding") : "●", { fontSize: S.W > 520 ? 11 : 8, strokeColor: C.rosso, anchorY: "bottom" });
      });
      const maxS = Math.max(20, ...R.s.flat().map((x, k) => x)) * 1.0;
      const somma = P0.mesi.map((m, t) => R.s.reduce((a, r) => a + r[t], 0));
      const bassoTop = S.H - mg.alto - hTop - gap;
      const bot = O.pannello(crea, { X0: mg.X0, X1: mg.X1, Y0: mg.basso, Y1: bassoTop, xa: 0.4, xb: nT + 0.6, ya: 0, yb: Math.max(maxS, ...somma) * 1.15,
        ny: T("scorte a fine mese (unità)", "end-of-month inventory (units)") }, C, { nTx: 0, nTy: 3 });
      O.barre(crea, bot, P0.mesi.map((m, t) => ({ x: t + 1, pezzi: R.s.map((riga, i) => [riga[t], col[i]]) })), 0.56);
      P0.mesi.forEach((m, t) => M.scritta(crea, bot.X(t + 1), mg.basso - 6, (S.W > 520 ? T("mese ", "month ") : "") + m, { anchorY: "top", fontSize: 11, strokeColor: C.muted }));
    },
    legenda: (C) => [
      ...DD().produzione.prodotti.map((p, i) => [PRODOTTO(C)[i], T("prodotto ", "product ") + p, "pieno"]),
      [C.rosso, T("capacità \\(b_t\\)", "capacity \\(b_t\\)"), "dashed"],
    ],
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return M.tinta(C.rosso, T("Inammissibile.", "Infeasible.")) + " " +
        T("Con questa capacità la domanda non si può servire per intero: il simplesso si ferma alla fase 1.",
          "With this capacity demand cannot be served in full: the simplex stops in phase 1.");
      const righe = R.ombra.map((y, t) => [String(t + 1), `${nt(R.ore[t], 0)}/${nt(R.cap[t], 0)}`, tx(n(y, 3)),
        `[${nt(R.lo[t], 0)}, ${isFinite(R.up[t]) ? nt(R.up[t], 0) : "∞"}]`]);
      const att = R.ombra.map((y, t) => (Math.abs(y) > 1e-9 ? t : -1)).filter((t) => t >= 0);
      return `<div>${T("Costo ottimo", "Optimal cost")}: <b>${euro(R.costo)}</b></div>` +
        M.tab([T("mese", "month"), T("ore", "hours"), T("prezzo ombra", "shadow price"), T("valido per \\(b_t\\) in", "valid for \\(b_t\\) in")], righe, att.length ? att[att.length - 1] : -1, C.rosso) +
        `<div style="margin-top:.3em">${T("Un'ora in più nel mese", "One more hour in month")} ${att.length ? att[att.length - 1] + 1 : "—"} ` +
        `${T("fa risparmiare", "saves")} ${att.length ? euro(-R.ombra[att[att.length - 1]], 3) : "0 €"}: ` +
        T("i prezzi ombra crescono verso la fine, perché un'ora tardi evita giacenze accumulate prima.",
          "the shadow prices grow towards the end, because a late hour avoids inventory built up earlier.") + "</div>";
    },
    domanda: T("Il mese 1 ha prezzo ombra nullo: perché? Porta la capacità al 110%: quali mesi smettono di essere saturi? Sotto il 97% il piano non esiste più: perché? Poi triplica il costo di giacenza: il piano non cambia, i prezzi ombra sì. Perché?",
      "Month 1 has a zero shadow price: why? Set capacity to 110%: which months stop being binding? Below 97% there is no plan any more: why? Then triple the holding cost: the plan does not change, the shadow prices do. Why?"),
  };

  // ================================================================ ricarica EV (cap. 5)
  const ORDINE_ORE = [...Array(12).keys()].map((k) => k + 12).concat([...Array(12).keys()]);
  const VEICOLO = (C) => [C.a, C.b, C.c, C.d, C.e, C.viola];
  const vEv = {
    etichetta: T("Ricarica di veicoli elettrici", "Electric vehicle charging"),
    cursori: [
      { nome: "k", min: 80, max: 160, step: 5, val: 120, fmt: (x) => nt(x, 0) + " kW",
        descr: T("potenza massima prelevabile dal contatore", "maximum power drawn from the meter") },
      { nome: "e_v", min: 60, max: 130, step: 5, val: 100, fmt: pct,
        descr: T("fabbisogno di energia dei furgoni, in % dei dati", "energy needed by the vans, in % of the data") },
      { nome: T("\\pi_t\\ \\text{serale}", "\\pi_t\\ \\text{evening}"), min: 50, max: 200, step: 10, val: 100, fmt: pct,
        descr: T("prezzo dell'energia dalle 17 alle 21", "energy price from 5 pm to 9 pm") },
    ],
    calcola: (v) => PL().ricaricaEv(v[0], v[1] / 100, v[2] / 100),
    formula(R, v, st) {
      const E = DD().ev, V = E.veicoli, nV = V.length;
      const vt = `${PER("v", "n")},~${PER("t", "m")}`;
      const sim = `\\min ~~ \\sum_{v=1}^{n} \\sum_{t=1}^{m} ${st.col("c", "\\pi_t")}\\, \\Delta t\\, x_{vt} & & \\\\
        ${SA()} \\quad \\eta \\sum_{t=1}^{m} \\Delta t\\, x_{vt} &\\ge ${st.col("b", "e_v")}, & ${PER("v", "n")}, \\\\
        \\sum_{v=1}^{n} x_{vt} + b_t &\\le ${st.col("a", "k")}, & ${PER("t", "m")}, \\\\
        x_{vt} &\\le a_{vt}\\, \\bar p_v, & ${vt}, \\\\
        x_{vt} &\\ge 0, & ${vt}.`;
      const coll = (x, t) => x.arrivo <= t || t < x.partenza;
      const prezzo = (t) => E.prezzo[t] * (t >= 17 && t <= 20 ? v[2] / 100 : 1);
      const ore = (x) => ORDINE_ORE.filter((t) => coll(x, t));
      const xv = (j, t) => `x_{${j + 1},${t}}`;
      // obiettivo raggruppato per ora (Delta t = 1 h), al più 8 variabili per riga
      const gruppi = ORDINE_ORE.map((t) => [t, V.map((x, j) => (coll(x, t) ? xv(j, t) : null)).filter(Boolean)]).filter((q) => q[1].length);
      const ob = [];
      let riga = [], quante = 0;
      gruppi.forEach(([t, xs]) => {
        if (riga.length && quante + xs.length > 8) { ob.push((ob.length ? "+ " : "") + riga.join(" + ")); riga = []; quante = 0; }
        riga.push(`${n(prezzo(t), 3)}\\,(${xs.join(" + ")})`); quante += xs.length;
      });
      if (riga.length) ob.push((ob.length ? "+ " : "") + riga.join(" + "));
      const breve = (j, hh) => [xv(j, hh[0]), xv(j, hh[1]), "\\dots", xv(j, hh[hh.length - 1])].join(" + ");
      const righe = V.map((x, j) => [`${n(E.eta, 2)}\\,(${breve(j, ore(x))})`, ">=", n(x.energia * v[1] / 100, 1), `v = ${j + 1}`]);
      ORDINE_ORE.forEach((t) => {
        const xs = V.map((x, j) => (coll(x, t) ? xv(j, t) : null)).filter(Boolean);
        if (xs.length) righe.push([`${xs.join(" + ")} + ${n(E.base[t], 1)}`, "<=", n(v[0], 0), `t = ${t}`]);
      });
      V.forEach((x, j) => righe.push([`x_{${j + 1},t}`, "<=", n(x.pmax, 1), `t \\in \\{${x.arrivo}, \\dots, 23, 0, \\dots, ${x.partenza - 1}\\}`]));
      righe.push(["x_{vt}", "<=", "0", T("\\text{nelle ore con } a_{vt} = 0", "\\text{in the hours with } a_{vt} = 0")]);
      righe.push(["x_{vt}", ">=", "0", `v \\in \\{1, \\dots, ${nV}\\},~ t \\in \\{0, \\dots, 23\\}`]);
      return modello(T(`<b>Il problema.</b> Decidiamo la potenza \\(x_{vt}\\) assegnata a ognuno dei ${nV} furgoni in ogni ora \\(t\\) (\\(\\Delta t = 1\\) h). ` +
        "L'obiettivo è la minima spesa energetica. I vincoli: energia richiesta entro la partenza, ricarica solo quando il furgone è collegato e sotto la potenza del caricatore, prelievo totale sotto la potenza \\(k\\) del contatore.",
      `<b>The problem.</b> We decide the power \\(x_{vt}\\) assigned to each of the ${nV} vans in each hour \\(t\\) (\\(\\Delta t = 1\\) h). ` +
        "The objective is the minimum energy expenditure. The constraints: the energy required before departure, charging only while the van is plugged in and below the power of the charger, total draw below the power \\(k\\) of the meter."),
      sim, numerico("min", ob, righe),
      T("Le ore sono quelle dell'orologio (\\(x_{1,18}\\): furgone 1 alle 18); nei vincoli di energia la somma va dall'ora di arrivo all'ultima ora prima della partenza. I vincoli di rete sono scritti solo per le ore con almeno un furgone collegato.",
        "Hours are clock hours (\\(x_{1,18}\\): van 1 at 6 pm); in the energy constraints the sum runs from the arrival hour to the last hour before departure. The grid constraints are written only for the hours with at least one van plugged in."));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Inammissibile: con questo limite i furgoni non si ricaricano in tempo", "Infeasible: with this limit the vans cannot be charged in time"));
      const E = DD().ev, mg = margini(S, 22, 36), col = VEICOLO(C);
      const hTop = (S.H - mg.alto - mg.basso) * 0.68, gap = 34;
      const top = O.pannello(crea, { X0: mg.X0, X1: mg.X1, Y0: S.H - mg.alto - hTop, Y1: S.H - mg.alto, xa: -0.6, xb: 23.6, ya: 0, yb: Math.max(170, R.C * 1.08),
        ny: T("prelievo dalla rete (kW)", "power drawn from the grid (kW)") }, C, { nTx: 0, nTy: 4 });
      O.barre(crea, top, ORDINE_ORE.map((h, k) => ({ x: k, pezzi: [[E.base[h], C.grigio], ...R.x.map((riga, j) => [riga[h], col[j]])] })), 0.8);
      M.linea(crea, top.X(-0.6), top.Y(R.C), top.X(23.6), top.Y(R.C), { strokeColor: C.rosso, strokeWidth: 2.5, dash: 2 });
      M.scritta(crea, top.X(23.5), top.Y(R.C) + 4, `k = ${nt(R.C, 0)} kW`, { anchorX: "right", anchorY: "bottom", fontSize: 11, strokeColor: C.rosso });
      const bot = O.pannello(crea, { X0: mg.X0, X1: mg.X1, Y0: mg.basso, Y1: S.H - mg.alto - hTop - gap, xa: -0.6, xb: 23.6, ya: 0, yb: Math.max(...R.prezzo) * 100 * 1.15,
        ny: T("prezzo (c€/kWh)", "price (c€/kWh)") }, C, { nTx: 0, nTy: 2 });
      O.barre(crea, bot, ORDINE_ORE.map((h, k) => ({ x: k, pezzi: [[R.prezzo[h] * 100, C.grigio]] })), 0.8);
      ORDINE_ORE.forEach((h, k) => { if (h % 3 === 0) M.scritta(crea, bot.X(k), mg.basso - 6, h + ":00", { anchorY: "top", fontSize: 10, strokeColor: C.muted }); });
    },
    legenda: (C) => [[C.grigio, T("carico dell'edificio \\(b_t\\)", "building load \\(b_t\\)"), "pieno"],
      ...DD().ev.veicoli.map((x, j) => [VEICOLO(C)[j], x.nome, "pieno"]), [C.rosso, T("limite \\(k\\)", "limit \\(k\\)"), "dashed"]],
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return M.tinta(C.rosso, T("Inammissibile.", "Infeasible."));
      const E = DD().ev;
      const righe = E.veicoli.map((x, j) => [x.nome, `${x.arrivo}–${x.partenza}`, nt(x.energia * v[1] / 100, 1), tx(n(R.ombraEnergia[j] * 100, 2))]);
      const sature = R.ombraRete.map((y, t) => (Math.abs(y) > 1e-9 ? t : -1)).filter((t) => t >= 0);
      return `<div>${T("Costo", "Cost")}: <b>${euro(R.costo)}</b> · ${T("picco", "peak")} ${nt(R.picco, 1)} kW</div>` +
        M.tab([T("furgone", "van"), T("ore", "hours"), "kWh", T("ombra c€/kWh", "shadow c€/kWh")], righe) +
        `<div style="margin-top:.3em">${sature.length ? T("Limite di rete saturo alle ore ", "Grid limit binding at hours ") + sature.join(", ") +
          T(": un kW in più lì vale ", ": one more kW there is worth ") + sature.map((t) => nt(-R.ombraRete[t] * 100, 1)).join(", ") + " c€."
          : T("Il limite di rete non è mai saturo: ogni furgone carica nelle sue ore più economiche.", "The grid limit is never binding: every van charges in its cheapest hours.")}</div>`;
    },
    domanda: T("Abbassa \\(k\\) a 90 kW: in quali ore il limite diventa saturo e quanto sale il costo? Perché il prezzo ombra dell'energia di un furgone è il prezzo della sua ora più cara usata, diviso per \\(\\eta\\)?",
      "Lower \\(k\\) to 90 kW: in which hours does the limit become binding and how much does the cost grow? Why is the shadow price of a van's energy the price of its most expensive hour used, divided by \\(\\eta\\)?"),
  };

  // ================================================================ newsvendor (cap. 7)
  const ALFA = 0.9;
  const vNewsvendor = {
    etichetta: T("Newsvendor a scenari", "Scenario newsvendor"),
    cursori: [
      { nome: "p", min: 8, max: 30, step: 0.5, val: 15, fmt: (x) => euro(x, 1),
        descr: T("prezzo di vendita: \\(C_u = p - c\\), \\(C_o = c - v\\) con \\(c = 6\\), \\(v = 2\\)", "selling price: \\(C_u = p - c\\), \\(C_o = c - v\\) with \\(c = 6\\), \\(v = 2\\)") },
      { nome: "\\lambda", min: 0, max: 1, step: 0.05, val: 0, fmt: (x) => nt(x, 2),
        descr: T("avversione al rischio: peso del CVaR\\(_{0,9}\\) del costo", "risk aversion: weight of the CVaR\\(_{0.9}\\) of the cost") },
    ],
    calcola(v) {
      const R = PL().newsvendor(v[0], v[1], ALFA);
      const qs = [];
      for (let k = 0; k <= 130; k++) qs.push(40 + k);
      R.curve = { q: qs, media: qs.map(R.f.media), cv: qs.map(R.f.cv), ob: qs.map(R.f.obiettivo) };
      return R;
    },
    formula(R, v, st) {
      const N = DD().newsvendor, d = N.domanda, k = d.length, lam = st.col("b", "\\lambda");
      const ks = PER("s", "k");
      const sim = `\\min ~~ (1-${lam}) \\sum_{s=1}^{k} \\pi_s \\bigl( c_o\\, o_s + ${st.col("a", "c_u")}\\, u_s \\bigr) & & \\\\
        + ${lam} \\Bigl( \\eta + \\tfrac{1}{1-\\alpha} \\sum_{s=1}^{k} \\pi_s\\, \\xi_s \\Bigr) & & \\\\
        ${SA()} \\quad o_s &\\ge q - d_s, & ${ks}, \\\\
        u_s &\\ge d_s - q, & ${ks}, \\\\
        \\xi_s &\\ge c_o\\, o_s + ${st.col("a", "c_u")}\\, u_s - \\eta, & ${ks}, \\\\
        q &\\ge 0, & \\\\
        \\eta &\\gtreqless 0, & \\\\
        o_s,\\ u_s,\\ \\xi_s &\\ge 0, & ${ks}.`;
      const Co = N.c - N.v, Cu = v[0] - N.c, L = v[1];
      const ob = [`${n(1 - L, 2)} \\cdot \\frac{1}{${k}} \\sum_{s=1}^{${k}} \\bigl( ${n(Co, 2)}\\, o_s + ${n(Cu, 2)}\\, u_s \\bigr)`, `+ ${n(L, 2)} \\Bigl( \\eta + \\frac{1}{${n(1 - ALFA, 1)} \\cdot ${k}} \\sum_{s=1}^{${k}} \\xi_s \\Bigr)`];
      const righe = [];
      [0, 1, 2].forEach((s) => {
        const ds = n(d[s], 2), S = s + 1;
        righe.push([`o_{${S}}`, ">=", `q - ${ds}`, `s = ${S}`], [`u_{${S}}`, ">=", `${ds} - q`, `s = ${S}`],
          [`\\xi_{${S}}`, ">=", `${somma([[Co, `o_{${S}}`], [Cu, `u_{${S}}`]])} - \\eta`, `s = ${S}`]);
      });
      righe.push(["\\vdots", "", "", T(`\\text{analoghi per } s = 4, \\dots, ${k}`, `\\text{analogous for } s = 4, \\dots, ${k}`)]);
      righe.push(["q", ">=", "0", ""], ["\\eta", "><", "0", ""], ["o_s,~ u_s,~ \\xi_s", ">=", "0", `s \\in \\{1, \\dots, ${k}\\}`]);
      return modello(T(`<b>Il problema.</b> Decidiamo la quantità \\(q\\) da ordinare prima di osservare la domanda, descritta da ${k} scenari equiprobabili \\(d_s\\) (\\(\\pi_s = 1/${k}\\)). ` +
        "Ogni unità invenduta costa \\(c_o\\), ogni vendita persa \\(c_u\\). L'obiettivo è minimizzare \\((1-\\lambda)\\) volte il costo atteso più \\(\\lambda\\) volte il CVaR\\(_{0{,}9}\\) del costo.",
      `<b>The problem.</b> We decide the quantity \\(q\\) to order before observing demand, described by ${k} equally likely scenarios \\(d_s\\) (\\(\\pi_s = 1/${k}\\)). ` +
        "Each unsold unit costs \\(c_o\\), each lost sale \\(c_u\\). The objective is to minimize \\((1-\\lambda)\\) times the expected cost plus \\(\\lambda\\) times the CVaR\\(_{0.9}\\) of the cost."),
      sim, numerico("min", ob, righe),
      T(`Con ${k} scenari si scrivono per intero i vincoli dei primi tre; gli altri hanno la stessa forma con il proprio \\(d_s\\). Qui \\(c_o = c - v = ${n(Co, 2)}\\), \\(c_u = p - c = ${n(Cu, 2)}\\), \\(\\alpha = 0{,}9\\).`,
        `With ${k} scenarios the constraints of the first three are written in full; the others have the same form with their own \\(d_s\\). Here \\(c_o = c - v = ${n(Co, 2)}\\), \\(c_u = p - c = ${n(Cu, 2)}\\), \\(\\alpha = 0.9\\).`));
    },
    disegna(crea, R, v, C, S) {
      const mg = margini(S, 22, 40);
      const ymax = Math.max(R.cvar * 1.25, R.media * 3, ...R.curve.media.filter((y, k) => Math.abs(R.curve.q[k] - R.q) < 45));
      const P = O.pannello(crea, { X0: mg.X0, X1: mg.X1, Y0: mg.basso, Y1: S.H - mg.alto, xa: 40, xb: 170, ya: 0, yb: ymax,
        nx: T("quantità ordinata q", "order quantity q"), ny: T("costo (€)", "cost (€)") }, C, { nTx: 7, nTy: 5, nxSotto: false });
      // istogramma degli scenari, in basso
      const conta = new Array(26).fill(0);
      R.d.forEach((x) => { const k = Math.floor((x - 40) / 5); if (k >= 0 && k < 26) conta[k]++; });
      const hMax = Math.max(...conta), alt = (P.yb - P.ya) * 0.28;
      conta.forEach((c, k) => { if (c) M.rett(crea, P.X(40 + 5 * k + 0.4), P.Y(0), P.X(45 + 5 * k - 0.4), P.Y((c / hMax) * alt), { fillColor: C.grigio, fillOpacity: 0.35, strokeColor: C.grigio, strokeWidth: 0.5 }); });
      const curva = (ys, attr) => crea("curve", [R.curve.q.map(P.X), ys.map((y) => (y <= P.yb ? P.Y(y) : NaN))], Object.assign({ fixed: true, highlight: false }, attr));
      curva(R.curve.cv, { strokeColor: C.rosso, strokeWidth: 2, dash: 2 });
      curva(R.curve.media, { strokeColor: C.b, strokeWidth: 2.5 });
      if (v[1] > 0) curva(R.curve.ob, { strokeColor: C.blu, strokeWidth: 3.5 });
      M.linea(crea, P.X(100), P.Y(0), P.X(100), P.Y(P.yb), { strokeColor: C.grigio, strokeWidth: 1.5, dash: 2 });
      M.linea(crea, P.X(R.q), P.Y(0), P.X(R.q), P.Y(P.yb), { strokeColor: C.blu, strokeWidth: 2 });
      M.pallino(crea, P.X(R.q), P.Y(R.obiettivo), { size: 5, fillColor: C.blu, strokeColor: "#ffffff" });
      M.scritta(crea, P.X(R.q) + 4, P.Y(P.yb) - 4, `q* = ${nt(R.q, 1)}`, { anchorX: "left", anchorY: "top", fontSize: 13, strokeColor: C.blu, cssStyle: "font-weight:700" });
      M.scritta(crea, P.X(100) - 4, P.Y(P.yb) - 4, T("media 100", "mean 100"), { anchorX: "right", anchorY: "top", fontSize: 11, strokeColor: C.muted });
    },
    legenda: (C) => [[C.b, T("costo atteso", "expected cost"), ""], [C.rosso, "CVaR\\(_{0{,}9}\\)".replace("0{,}9", GI.EN ? "0.9" : "0{,}9"), "dashed"],
      [C.blu, T("obiettivo", "objective"), ""], [C.grigio, T("600 scenari di domanda", "600 demand scenarios"), "pieno"]],
    letture(R, v, st, C) {
      const vss = R.costoMedia - R.media;
      return `<div>${T("Frattile critico", "Critical fractile")} \\(\\alpha^* = C_u/(C_u + C_o) = ${n(R.Cu, 1)}/${n(R.Cu + R.Co, 1)} = ${n(R.alfaStar, 4)}\\)</div>` +
        M.tab(["", "q", T("costo atteso", "exp. cost"), "CVaR"], [
          [M.tinta(C.blu, T("ottimo", "optimal")), nt(R.q, 2), nt(R.media, 2), nt(R.cvar, 2)],
          [T("q = media", "q = mean"), "100", nt(R.costoMedia, 2), nt(R.f.cv(100), 2)],
        ]) +
        `<div style="margin-top:.3em">${v[1] === 0 ? T(`L'LP sceglie il quantile empirico al ${nt(100 * R.alfaStar, 2)}%: q* = ${nt(R.quantile, 2)}. ` +
          `Ordinare la media costerebbe ${euro(vss)} in più a ciclo (VSS).`, `The LP picks the empirical quantile at ${nt(100 * R.alfaStar, 2)}%: q* = ${nt(R.quantile, 2)}. ` +
          `Ordering the mean would cost ${euro(vss)} more per cycle (VSS).`)
          : T("Con \\(\\lambda > 0\\) si ordina di più: si paga in costo medio per proteggersi dagli scenari di coda.", "With \\(\\lambda > 0\\) one orders more: one pays in average cost to be protected from the tail scenarios.")}</div>`;
    },
    domanda: T("Con \\(\\lambda = 0\\) muovi \\(p\\): l'ordine ottimo segue il frattile critico \\(\\alpha^*\\). Poi porta \\(\\lambda\\) a 1: di quanto cresce \\(q^*\\), di quanto il costo medio, di quanto scende il CVaR?",
      "With \\(\\lambda = 0\\) move \\(p\\): the optimal order follows the critical fractile \\(\\alpha^*\\). Then set \\(\\lambda\\) to 1: how much does \\(q^*\\) grow, how much the average cost, how much does the CVaR drop?"),
  };

  // ================================================================ DEA (cap. 6)
  const deaVoce = (vrs, vista, etichetta) => ({
    etichetta,
    cursori: [{ nome: T("\\text{filiale}", "\\text{branch}"), min: 1, max: 12, step: 1, val: 1, fmt: (x) => String(Math.round(x)),
      descr: T("la filiale valutata \\(o\\)", "the branch under evaluation \\(o\\)") }],
    calcola(v) {
      const o = Math.round(v[0]) - 1, R = PL().dea(o, vrs, vista);
      R.o = o;
      if (vista === "1x1") {
        const d = DD().dea, nn = d.personale.length, front = [];
        for (let j = 0; j < nn; j++) { const r = PL().dea(j, true, "1x1"); if (Math.abs(r.theta - 1) < 1e-6 && r.sIn[0] + r.sOut[0] < 1e-6) front.push([d.personale[j], d.prestiti[j]]); }
        front.sort((a, b) => a[0] - b[0]);
        R.vrs = [[front[0][0], 0], ...front, [32, front[front.length - 1][1]]];
        R.pend = Math.max(...d.prestiti.map((y, j) => y / d.personale[j]));
      }
      return R;
    },
    formula(R, v, st) {
      const o = st.col("a", "o");
      const sim = `\\min ~~ \\theta & & \\\\
        ${SA()} \\quad \\theta\\, x_{i${o}} - \\sum_{j=1}^{n} \\lambda_j\\, x_{ij} &\\ge 0, & ${PER("i", "m")}, \\\\
        \\sum_{j=1}^{n} \\lambda_j\\, y_{rj} &\\ge y_{r${o}}, & ${PER("r", "p")}, \\\\
        ${vrs ? `\\sum_{j=1}^{n} \\lambda_j &= 1, & \\\\` : ""}
        \\theta &\\gtreqless 0, & \\\\
        \\lambda_j &\\ge 0, & ${PER("j", "n")}.`;
      // numerico: una colonna per variabile (theta, lambda_1..lambda_n), relazioni in colonna
      const d = DD().dea, oo = Math.round(v[0]) - 1;
      const X = vista === "1x1" ? [d.personale] : [d.personale, d.costi], Y = vista === "1x1" ? [d.prestiti] : [d.prestiti, d.depositi];
      const nI = X.length, nR = Y.length, nn = X[0].length;
      const nomiI = vista === "1x1" ? [T("personale", "staff")] : [T("personale", "staff"), T("costi", "costs")];
      const nomiR = vista === "1x1" ? [T("prestiti", "loans")] : [T("prestiti", "loans"), T("depositi", "deposits")];
      const cella = (a, x, primo) => (a === 0 ? "" : (a < 0 ? "-" : primo ? "" : "+") + (Math.abs(a) === 1 ? "" : n(Math.abs(a), 1) + "\\,") + x);
      const riga = (lab, th, coef, rel, rhs, nota) => `${lab} & ${th} & ${coef.map((a, j) => cella(a, `\\lambda_{${j + 1}}`, !th && j === 0)).join(" & ")} & ${rel} & ${rhs} & ${nota ? `\\quad \\text{${nota}}` : ""} \\\\`;
      const vuoto = new Array(nn).fill(0);
      const righe = [riga("\\min", "\\theta", vuoto, "", "", "")];
      X.forEach((r, i) => righe.push(riga(i ? "" : SA(), `${n(r[oo], 1)}\\,\\theta`, r.map((x) => -x), "\\ge", "0", nomiI[i])));
      Y.forEach((r, k) => righe.push(riga("", "", r, "\\ge", n(r[oo], 1), nomiR[k])));
      if (vrs) righe.push(riga("", "", new Array(nn).fill(1), "=", "1", ""));
      const num = `<div class="plm-riga plm-stretto">\\(\\displaystyle \\begin{array}{lr${"r".repeat(nn)}cll} ${righe.join("\n")} \\end{array}\\)</div>` +
        `<div class="plm-riga">\\(\\displaystyle \\theta \\gtreqless 0, \\qquad \\lambda_j \\ge 0 \\quad j \\in \\{1, 2, \\dots, ${nn}\\}\\)</div>`;
      return modello(T(`<b>Il problema.</b> Per la filiale valutata \\(o = ${oo + 1}\\) cerchiamo i pesi \\(\\lambda_j\\) delle ${nn} filiali e il fattore \\(\\theta\\): la combinazione pesata deve produrre almeno gli output di \\(o\\) (${nomiR.join(", ")}) usando al più \\(\\theta\\) volte i suoi input (${nomiI.join(", ")}). ` +
        `L'obiettivo è minimizzare \\(\\theta\\), l'efficienza della filiale${vrs ? "; il vincolo \\(\\sum_j \\lambda_j = 1\\) dà il modello BCC" : ""}.`,
      `<b>The problem.</b> For the branch under evaluation \\(o = ${oo + 1}\\) we look for the weights \\(\\lambda_j\\) of the ${nn} branches and the factor \\(\\theta\\): the weighted combination must produce at least the outputs of \\(o\\) (${nomiR.join(", ")}) using at most \\(\\theta\\) times its inputs (${nomiI.join(", ")}). ` +
        `The objective is to minimize \\(\\theta\\), the efficiency of the branch${vrs ? "; the constraint \\(\\sum_j \\lambda_j = 1\\) gives the BCC model" : ""}.`),
      sim, num);
    },
    disegna(crea, R, v, C, S) {
      const d = DD().dea, mg = margini(S, 22, 40), o = R.o;
      const P = O.pannello(crea, { X0: mg.X0, X1: mg.X1, Y0: mg.basso, Y1: S.H - mg.alto, xa: 0, xb: 32, ya: 0, yb: 72,
        nx: T("personale (FTE)", "staff (FTE)"), ny: T("prestiti (M€)", "loans (M€)") }, C, { nTx: 8, nTy: 6 });
      if (vista === "1x1") {
        crea("curve", [[P.X(0), P.X(32)], [P.Y(0), P.Y(Math.min(72, R.pend * 32))]], { strokeColor: vrs ? C.grigio : C.rosso, strokeWidth: vrs ? 1.5 : 2.5, dash: 2, fixed: true, highlight: false });
        crea("curve", [R.vrs.map((q) => P.X(q[0])), R.vrs.map((q) => P.Y(q[1]))], { strokeColor: vrs ? C.c : C.grigio, strokeWidth: vrs ? 2.8 : 1.5, fixed: true, highlight: false });
      }
      // target (input orientato) e peer
      const tx0 = R.tIn[0], ty0 = R.tOut[0];
      for (const [j, l] of R.peer) {
        if (j === o) continue;
        M.linea(crea, P.X(tx0), P.Y(ty0), P.X(d.personale[j]), P.Y(d.prestiti[j]), { strokeColor: C.c, strokeWidth: 1.2, dash: 1 });
        M.pallino(crea, P.X(d.personale[j]), P.Y(d.prestiti[j]), { size: 9, fillColor: "none", fillOpacity: 0, strokeColor: C.c, strokeWidth: 2 });
        M.scritta(crea, P.X(d.personale[j]) + 12, P.Y(d.prestiti[j]) - 12, "λ = " + nt(l, 3), { anchorX: "left", fontSize: 11, strokeColor: C.c });
      }
      d.personale.forEach((x, j) => {
        M.pallino(crea, P.X(x), P.Y(d.prestiti[j]), { size: j === o ? 6 : 4, fillColor: j === o ? C.a : C.blu, strokeColor: "#ffffff", strokeWidth: 1 });
        M.scritta(crea, P.X(x) + 7, P.Y(d.prestiti[j]) + 7, String(j + 1), { anchorX: "left", anchorY: "bottom", fontSize: j === o ? 14 : 11, strokeColor: j === o ? C.a : C.muted, cssStyle: j === o ? "font-weight:700" : "" });
      });
      if (Math.hypot(tx0 - d.personale[o], ty0 - d.prestiti[o]) > 0.05) {
        crea("arrow", [[P.X(d.personale[o]), P.Y(d.prestiti[o])], [P.X(tx0), P.Y(ty0)]], { strokeColor: C.a, strokeWidth: 2.5, fixed: true, highlight: false, lastArrow: { type: 2, size: 6 } });
        M.pallino(crea, P.X(tx0), P.Y(ty0), { size: 5, fillColor: C.card || "#fff", strokeColor: C.a, strokeWidth: 2 });
      }
    },
    legenda: (C) => [[C.blu, T("filiali", "branches"), "punto"], [C.a, T("filiale \\(o\\) e il suo target", "branch \\(o\\) and its target"), ""], [C.c, T("peer (\\(\\lambda_j > 0\\))", "peers (\\(\\lambda_j > 0\\))"), "dotted"],
      ...(vista === "1x1" ? [[C.rosso, T("frontiera CCR", "CCR frontier"), "dashed"], [vrs ? C.c : C.grigio, T("frontiera BCC", "BCC frontier"), ""]] : [])],
    letture(R, v, st, C) {
      const nomi = vista === "1x1" ? [T("personale", "staff"), T("prestiti", "loans")] : [T("personale", "staff"), T("costi", "costs"), T("prestiti", "loans"), T("depositi", "deposits")];
      const att = [...R.X.map((r) => r[R.o]), ...R.Y.map((r) => r[R.o])], tgt = [...R.tIn, ...R.tOut], sc = [...R.sIn, ...R.sOut];
      const eff = Math.abs(R.theta - 1) < 1e-6;
      return `<div>${T("Efficienza", "Efficiency")} \\(\\theta = ${n(R.theta, 4)}\\) · ${eff ? M.tinta(C.c, T("sulla frontiera", "on the frontier")) : M.tinta(C.a, T("inefficiente", "inefficient"))}</div>` +
        `<div>${T("Peer", "Peers")}: ${R.peer.map(([j, l]) => `${j + 1} (λ = ${nt(l, 3)})`).join(", ")}</div>` +
        M.tab(["", T("attuale", "actual"), "target", T("scarto", "slack")], nomi.map((nm, k) => [nm, nt(att[k], 1), nt(tgt[k], k < R.X.length ? 2 : 2), nt(sc[k], 2)])) +
        `<div style="margin-top:.3em">${eff ? T("Nessuna combinazione di filiali fa meglio con meno input.", "No combination of branches does better with fewer inputs.")
          : T(`Una combinazione dei peer produce almeno gli stessi output con il ${nt(100 * R.theta, 1)}% degli input.`, `A combination of the peers produces at least the same outputs with ${nt(100 * R.theta, 1)}% of the inputs.`)}</div>`;
    },
    domanda: T("Passa le filiali con ▶: quali sono efficienti nel modello CCR e quali solo nel BCC? Nella vista personale→prestiti la filiale 6 è lontana dalla frontiera CCR ma sulla BCC: che cosa dice dei rendimenti di scala?",
      "Go through the branches with ▶: which are efficient in the CCR model and which only in BCC? In the staff→loans view branch 6 is far from the CCR frontier but on the BCC one: what does it say about returns to scale?"),
  });

  // ================================================================ registrazione
  const R = (nome, opz, voci) => { window.GI_RICETTE[nome] = () => O.ricettaVoci(opz, voci); };
  R("pl-modelli", { titolo: T("Tre modelli LP", "Three LP models"), etichetta: T("Modello", "Model") },
    { produzione: vProduzione, ev: vEv, newsvendor: vNewsvendor });
  R("pl-produzione", { titolo: T("Piano di produzione", "Production plan") }, { produzione: vProduzione });
  R("pl-ricarica-ev", { titolo: T("Ricarica di veicoli elettrici", "Electric vehicle charging") }, { ev: vEv });
  R("pl-newsvendor", { titolo: "Newsvendor" }, { newsvendor: vNewsvendor });
  R("pl-dea", { titolo: "Data Envelopment Analysis", etichetta: T("Modello e indicatori", "Model and indicators") }, {
    ccr: deaVoce(false, "2x2", T("CCR · 4 indicatori", "CCR · 4 indicators")),
    bcc: deaVoce(true, "2x2", T("BCC · 4 indicatori", "BCC · 4 indicators")),
    ccr1: deaVoce(false, "1x1", T("CCR · personale→prestiti", "CCR · staff→loans")),
    bcc1: deaVoce(true, "1x1", T("BCC · personale→prestiti", "BCC · staff→loans")),
  });

  // ================================================================ regressione (cap. 10): punti trascinabili
  const DATI_REG = { t: null, y: null };
  window.GI_RICETTE["pl-regressione"] = () => O.ricettaRetta({
    titolo: T("Scarti assoluti e regressione quantile", "Least absolute deviations and quantile regression"),
    dati: () => DD().panetteria,
    parametri: [{ k: "tau", nome: "\\tau", min: 0.05, max: 0.95, step: 0.01, val: 0.69, colore: "c", cifre: 2,
      descr: T("quantile: \\(9/13 \\approx 0{,}69\\) è il frattile critico del newsvendor", "quantile: \\(9/13 \\approx 0.69\\) is the critical fractile of the newsvendor") }],
    rette(t, y, p, C) {
      DATI_REG.t = t; DATI_REG.y = y;
      const lad = PL().regressione(t, y, 0.5), q = PL().regressione(t, y, p.tau);
      return [
        { ...lad, colore: C.blu, nome: T("scarti assoluti (LP, \\(\\tau = 1/2\\))", "least absolute deviations (LP, \\(\\tau = 1/2\\))"), stile: { strokeWidth: 3 } },
        { ...q, colore: C.c, nome: T("quantile \\(\\tau\\)", "\\(\\tau\\)-quantile"), stile: { strokeWidth: 3, dash: 2 } },
      ];
    },
    appoggio: (rette) => rette[1].appoggio,
    formula(p, st) {
      const tau = st.col("c", "\\tau"), ni = PER("i", "n");
      const sim = `\\min ~ \\sum_{i=1}^{n} \\bigl[\\, ${tau}\\, u_i + (1 - ${tau})\\, v_i \\,\\bigr] & & \\\\
        ${SA()} \\quad w\\, x_i + b + u_i - v_i &= y_i, & ${ni}, \\\\
        w &\\gtreqless 0, & \\\\
        b &\\gtreqless 0, & \\\\
        u_i,\; v_i &\\ge 0, & ${ni}.`;
      const t = DATI_REG.t || [], y = DATI_REG.y || [], m = t.length;
      const ob = [`\\sum_{i=1}^{${m}} \\bigl( ${n(p.tau, 2)}\\, u_i + ${n(1 - p.tau, 2)}\\, v_i \\bigr)`];
      const righe = [0, 1, 2].filter((i) => i < m).map((i) => [`${n(t[i], 1)}\\, w + b + u_{${i + 1}} - v_{${i + 1}}`, "=", n(y[i], 1), `i = ${i + 1}`]);
      righe.push(["\\vdots", "", "", T(`\\text{analoghi per } i = 4, \\dots, ${m}`, `\\text{analogous for } i = 4, \\dots, ${m}`)]);
      righe.push(["w,~ b", "><", "0", ""], ["u_i,~ v_i", ">=", "0", `i \\in \\{1, \\dots, ${m}\\}`]);
      return modello(T(`<b>Il problema.</b> Decidiamo la pendenza \\(w\\) e l'intercetta \\(b\\) della retta che stima la domanda \\(y_i\\) dalla temperatura \\(x_i\\) degli ${m} giorni osservati; \\(u_i\\) e \\(v_i\\) sono gli scostamenti in eccesso e in difetto. ` +
        "L'obiettivo è minimizzare la somma degli scostamenti pesati \\(\\tau\\) e \\(1 - \\tau\\) (con \\(\\tau = 1/2\\) si ottengono gli scarti assoluti).",
      `<b>The problem.</b> We decide the slope \\(w\\) and the intercept \\(b\\) of the line that estimates demand \\(y_i\\) from the temperature \\(x_i\\) of the ${m} observed days; \\(u_i\\) and \\(v_i\\) are the deviations in excess and in defect. ` +
        "The objective is to minimize the sum of the deviations weighted by \\(\\tau\\) and \\(1 - \\tau\\) (with \\(\\tau = 1/2\\) one gets least absolute deviations)."),
      sim, numerico("min", ob, righe),
      T(`Il modello numerico è quello della retta \\(\\tau\\) con i punti attuali (anche quelli trascinati): si scrivono per intero i primi tre vincoli, gli altri hanno la stessa forma con il proprio \\((x_i, y_i)\\).`,
        `The numerical model is the one of the \\(\\tau\\) line with the current points (dragged ones included): the first three constraints are written in full, the others have the same form with their own \\((x_i, y_i)\\).`));
    },
    letture(rette, p, dati, C) {
      const [lad, q] = rette, m = dati.t.length;
      const eq = (r) => `\\(y = ${n(r.b, 2)} ${r.w < 0 ? "-" : "+"} ${n(Math.abs(r.w), 2)}\\, t\\)`;
      return `<div>${M.tinta(C.blu, T("Scarti assoluti", "Least abs. dev."))}: ${eq(lad)}</div>` +
        `<div>${M.tinta(C.c, T("Quantile", "Quantile") + " τ = " + nt(p.tau, 2))}: ${eq(q)}</div>` +
        `<div>${T("Sotto la retta τ", "Below the τ line")}: ${q.sotto}/${m} = ${nt(q.sotto / m, 3)}, ${T("sopra", "above")}: ${q.sopra}/${m}, ` +
        `${T("sulla retta", "on it")}: ${q.appoggio.length} (${T("i due punti di appoggio, cerchiati", "the two support points, circled")})</div>` +
        `<div style="margin-top:.3em">${T("La quota sotto la retta sta fra", "The share below the line lies between")} \\(${n(q.sotto / m, 3)}\\) ${T("e", "and")} \\(${n((q.sotto + q.appoggio.length) / m, 3)}\\): ${T("contiene sempre", "it always contains")} \\(\\tau\\).</div>`;
    },
    domanda: T("Trascina in basso un giorno caldo, di 100 pezzi: quanto si sposta la retta degli scarti assoluti? Poi muovi \\(\\tau\\): quanti giorni restano sotto la retta? Con i 5 scioperi e senza, le rette cambiano di poco: perché?",
      "Drag a hot day down by 100 pieces: how much does the least absolute deviations line move? Then move \\(\\tau\\): how many days stay below the line? With and without the 5 strike days the lines barely change: why?"),
  });
})();
