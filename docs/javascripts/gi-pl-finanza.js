/* Laboratorio di «Modellazione PL / LP Modelling»: le due app dei modelli finanziari.
 *
 *   pl-var-cvar     cap. 9: portafoglio a CVaR minimo, 3 titoli e 10 scenari annui equiprobabili: perdite
 *                   per scenario (cursori: livello alpha, rendimento richiesto b)
 *   pl-arbitraggio  cap. 10: LP normalizzato dell'arbitraggio e intervallo dei prezzi coerenti
 *                   (cursori: prezzi dei titoli 1 e 2; tasso r = 4%)
 *
 * Parte 1, PURA (niente DOM, si carica anche in node): i dati e i modelli, in window.GI_PL_FIN.
 * Ogni numero viene dal simplesso di gi-ott.js (GI_OTT.lp). Il portafoglio si risolve dal suo
 * duale (n + 1 righe di vincoli veri più i limiti p_s <= w_s/(1 - alpha)), che evita di spezzare la
 * soglia libera eta: stesso ottimo, le quote x_i sono i prezzi ombra del duale.
 * Parte 2, disegno: le ricette, registrate in window.GI_RICETTE con GI_OTT.ricettaVoci, nello
 * stile delle figure dei capitoli (python/stile.py) come le app di gi-pl-app.js.
 *
 * I rendimenti (in %) sono quelli di it/dati/cvar_scenari_rendimenti.csv (scritto da python/lab09_var_cvar.py);
 * i payoff quelli di it/dati/arbitraggio_payoff.csv.
 */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;
  const O = () => W.GI_OTT;

  // ================================================================ dati
  // rendimenti annui r_is (%): una riga per scenario s, una colonna per titolo i (TEC, UTL, ORO);
  // nello scenario 1 i mercati crollano e l'oro sale, negli scenari 2 e 9 l'oro scende
  const TITOLI = ["TEC", "UTL", "ORO"];
  const RENDIMENTI = [
    [-25, -8, 15], [5, 2, -10], [30, 6, -5], [5, 4, 4], [0, 5, -3],
    [-5, -6, 8], [20, 8, 0], [10, 3, 2], [25, 7, -6], [5, 9, 5],
  ];
  const K = RENDIMENTI.length, NT = TITOLI.length;
  /** rendimento atteso m_i (%): la media dei suoi r_is sugli scenari equiprobabili (7, 3, 1) */
  const MEDIE = TITOLI.map((t, i) => RENDIMENTI.reduce((s, r) => s + r[i], 0) / K);
  const MMAX = Math.max(...MEDIE);
  /** payoff s^1_ij dei titoli rischiosi 1 e 2 nei 3 stati; il titolo 0 paga R in ogni stato */
  const PAYOFF = [[10, 15, 13], [30, 15, 25]];
  const CALL = [0, 3, 1];          // call sul titolo 1 con strike 12: max(s^1_1j - 12, 0)
  const STRIKE = 12;

  // ================================================================ cap. 9: portafoglio a CVaR minimo
  /** min CVaR_alfa della perdita -sum_i r_is x_i (%), con sum_i m_i x_i >= b (%), sum_i x_i = 1, x >= 0.
   *  Si risolve il duale:  max u + b v  con  u + m_i v + sum_s r_is p_s <= 0 (i = 1..n),
   *  sum_s p_s = 1,  0 <= p_s <= 1/(k (1 - alfa)),  v >= 0,  u libera.
   *  Le quote x_i sono i prezzi ombra delle prime n righe, eta quello della riga sum_s p_s = 1,
   *  v è il prezzo ombra del vincolo di rendimento del primale. */
  function portafoglio(alfa, b) {
    if (b > MMAX + 1e-12) return { stato: "inammissibile", alfa, b };
    const nv = K + 3, U = 1 / (K * (1 - alfa)), c = new Array(nv).fill(0), A = [], rel = [], bb = [];
    c[K] = b; c[K + 1] = 1; c[K + 2] = -1;
    for (let i = 0; i < NT; i++) {
      const a = new Array(nv).fill(0);
      for (let s = 0; s < K; s++) a[s] = RENDIMENTI[s][i];
      a[K] = MEDIE[i]; a[K + 1] = 1; a[K + 2] = -1;
      A.push(a); rel.push("<="); bb.push(0);
    }
    let a = new Array(nv).fill(0);
    for (let s = 0; s < K; s++) a[s] = 1;
    A.push(a); rel.push("="); bb.push(1);
    for (let s = 0; s < K; s++) { a = new Array(nv).fill(0); a[s] = 1; A.push(a); rel.push("<="); bb.push(U); }
    const r = O().lp({ c, A, rel, b: bb, senso: "max" });
    if (r.stato !== "ottimo") return { stato: "inammissibile", alfa, b };
    const x = r.y.slice(0, NT).map((v) => (Math.abs(v) < 1e-10 ? 0 : v));
    const perdite = RENDIMENTI.map((rr) => -rr.reduce((s, v, i) => s + v * x[i], 0));
    const vaR = O().vaR(perdite, alfa);
    return {
      stato: "ottimo", alfa, b, x, perdite, cvar: r.z, eta: r.y[NT], ombra: Math.abs(r.x[K]) < 1e-10 ? 0 : r.x[K],
      var: vaR, xi: perdite.map((l) => Math.max(0, l - vaR)), media: perdite.reduce((s, v) => s + v, 0) / K,
      rend: x.reduce((s, v, i) => s + v * MEDIE[i], 0), coda: (1 - alfa) * K,
    };
  }
  /** frontiera rendimento-CVaR come nello script: b da 0 al rendimento massimo m_i, a passi di 0,25 punti */
  const FRONTIERE = new Map();
  function frontiera(alfa) {
    const chiave = alfa.toFixed(4);
    if (!FRONTIERE.has(chiave)) {
      const pts = [];
      for (let j = 0; j * 0.25 <= MMAX + 1e-9; j++) {
        const b = j * 0.25, R = portafoglio(alfa, b);
        if (R.stato === "ottimo") pts.push({ b, cvar: R.cvar });
      }
      FRONTIERE.set(chiave, pts);
    }
    return FRONTIERE.get(chiave);
  }

  // ================================================================ cap. 10: arbitraggio
  const payoffMatrice = (R) => [[R, R, R], ...PAYOFF];
  /** LP normalizzato: min sum_i s0_i x_i  con  sum_i s1_ij x_i >= 0 (stati),  sum_i s0_i x_i >= -1,
   *  x libere (x_i = x_i^+ - x_i^-). p = prezzi ombra dei vincoli di stato. */
  function lpArbitraggio(s0, R) {
    const S = payoffMatrice(R), n = S.length, m = S[0].length;
    const c = [], A = [], rel = [], b = [];
    for (let i = 0; i < n; i++) c.push(s0[i], -s0[i]);
    for (let j = 0; j < m; j++) { const a = []; for (let i = 0; i < n; i++) a.push(S[i][j], -S[i][j]); A.push(a); rel.push(">="); b.push(0); }
    A.push(c.slice()); rel.push(">="); b.push(-1);
    const r = O().lp({ c, A, rel, b, senso: "min" });
    const x = [];
    for (let i = 0; i < n; i++) x.push(r.x[2 * i] - r.x[2 * i + 1]);
    const payoff = [];
    for (let j = 0; j < m; j++) payoff.push(S.reduce((t, riga, i) => t + riga[j] * x[i], 0));
    const pul = (v) => (Math.abs(v) < 1e-9 ? 0 : v);
    return { stato: r.stato, z: pul(r.z), x: x.map(pul), payoff: payoff.map(pul), p: r.y.slice(0, m).map(pul), S };
  }
  /** arbitraggio di tipo B: costo 0 oggi, payoff >= 0 e non nullo. max sum_j payoff_j con payoff_j <= 1 */
  function tipoB(s0, R) {
    const S = payoffMatrice(R), n = S.length, m = S[0].length;
    const c = [], A = [], rel = [], b = [];
    for (let i = 0; i < n; i++) { let t = 0; for (let j = 0; j < m; j++) t += S[i][j]; c.push(t, -t); }
    for (let j = 0; j < m; j++) {
      const a = []; for (let i = 0; i < n; i++) a.push(S[i][j], -S[i][j]);
      A.push(a); rel.push(">="); b.push(0);
      A.push(a.slice()); rel.push("<="); b.push(1);
    }
    const a0 = []; for (let i = 0; i < n; i++) a0.push(s0[i], -s0[i]);
    A.push(a0); rel.push("="); b.push(0);
    const r = O().lp({ c, A, rel, b, senso: "max" });
    if (r.stato !== "ottimo" || r.z < 1e-7) return null;
    const x = []; for (let i = 0; i < n; i++) x.push(r.x[2 * i] - r.x[2 * i + 1]);
    const payoff = []; for (let j = 0; j < m; j++) payoff.push(S.reduce((t, riga, i) => t + riga[j] * x[i], 0));
    return { x, payoff: payoff.map((v) => (Math.abs(v) < 1e-9 ? 0 : v)) };
  }
  /** prezzi coerenti di un payoff: min e max di sum_j payoff_j p_j sulle p >= 0 con
   *  sum_j s1_ij p_j = s0_i per i titoli quotati (quotati = [[i, prezzo], ...]); null se non ce ne sono */
  function intervallo(payoff, quotati, R) {
    const S = payoffMatrice(R), m = S[0].length;
    const A = quotati.map(([i]) => S[i].slice()), rel = quotati.map(() => "="), b = quotati.map(([, v]) => v);
    const lo = O().lp({ c: payoff.slice(), A, rel, b, senso: "min" });
    const hi = O().lp({ c: payoff.slice(), A: A.map((r) => r.slice()), rel, b, senso: "max" });
    if (lo.stato !== "ottimo" || hi.stato !== "ottimo") return null;
    return [lo.z, hi.z];
  }
  /** valore dell'LP normalizzato al variare del prezzo del titolo 2 (griglia di passo 0,05) */
  const CURVE = new Map();
  function curva(s01, R, xa = 14, xb = 26) {
    const chiave = [s01, R, xa, xb].join("|");
    if (!CURVE.has(chiave)) {
      const xs = [], zs = [];
      for (let k = 0; k <= Math.round((xb - xa) / 0.05); k++) { const p = xa + 0.05 * k; xs.push(p); zs.push(lpArbitraggio([1, s01, p], R).z); }
      CURVE.set(chiave, { xs, zs });
      if (CURVE.size > 200) CURVE.delete(CURVE.keys().next().value);
    }
    return CURVE.get(chiave);
  }
  function arbitraggio(s01, s02, R) {
    const s0 = [1, s01, s02], lp = lpArbitraggio(s0, R);
    const tipoA = lp.z < -1e-7;
    const B = tipoA ? null : tipoB(s0, R);
    const q = lp.p.map((v) => R * v);
    return {
      s0, R, lp, tipoA, B, q,
      int2: intervallo(PAYOFF[1], [[0, 1], [1, s01]], R),
      callInc: intervallo(CALL, [[0, 1], [1, s01]], R),
      callCompl: tipoA ? null : intervallo(CALL, [[0, 1], [1, s01], [2, s02]], R),
    };
  }

  W.GI_PL_FIN = { TITOLI, RENDIMENTI, MEDIE, PAYOFF, CALL, STRIKE, portafoglio, frontiera, lpArbitraggio, tipoB, intervallo, curva, arbitraggio };
  if (typeof module !== "undefined" && module.exports) module.exports = W.GI_PL_FIN;
  if (typeof document === "undefined" || !W.GI || !W.GI_MIP || !W.GI_OTT) return;

  // ================================================================ parte 2: disegno
  const GI = W.GI, M = W.GI_MIP, FIN = W.GI_PL_FIN;
  const T = GI.T;
  W.GI_RICETTE = W.GI_RICETTE || {};
  const n = (x, c = 1) => GI.num(x, c);
  /** numero con un numero fisso di decimali, virgola in italiano e segno meno tipografico */
  const fx = (x, c = 2) => { let s = (Math.abs(x) < 0.5 * Math.pow(10, -c) ? 0 : x).toFixed(c); if (!GI.EN) s = s.replace(".", ","); return s.replace("-", "−"); };
  /** lo stesso per il TeX */
  const fxT = (x, c = 2) => fx(x, c).replace("−", "-").replace(",", "{,}");
  const pc = (x, c = 2) => fx(100 * x, c) + "%";
  const euro = (x, c = 2) => fx(x, c) + " €";
  const tx = (s) => `\\(${s}\\)`;
  /** «0,90» in pedice Unicode, per le scritte dei grafici: CVaR₀,₉₀ */
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  /** quanti scenari stanno nella coda di massa 1 - alfa: (1 - alfa) k, con un decimale se non è intero */
  const nCoda = (a) => { const c = (1 - a) * K; return fx(c, Math.abs(c - Math.round(c)) < 1e-9 ? 0 : 1); };
  const pedice = (a) => fx(a, 2).replace(/\d/g, (d) => SUB[+d]);

  // ---------------------------------------------------------------- lo stile delle figure dei capitoli
  /* come in gi-pl-app.js: palette della dispensa, titolo in grassetto blu notte sopra il pannello,
   * griglia orizzontale leggera, assi a sinistra e in basso, etichette degli assi fuori, legenda dentro */
  const FIG = () => (M.scuro()
    ? { blu: "#D6E4F0", teal: "#22A6C7", rosso: "#E5675A", verde: "#3DBB6E", arancio: "#E8923F", grigio: "#A3AFB0", navy: "#9CC3E6" }
    : { blu: "#16324A", teal: "#0E7490", rosso: "#C0392B", verde: "#1E8449", arancio: "#CA6F1E", grigio: "#7F8C8D", navy: "#16324A" });
  const MF = { sx: 66, dx: 14, basso: 54, alto: 30 };
  function figura(crea, P, C, opz = {}) {
    const Q = O().pannello(crea, Object.assign({}, P, { nx: "", ny: "" }), C, opz);
    if (!crea) return Q;
    const F = FIG();
    if (P.titolo) M.scritta(crea, (P.X0 + P.X1) / 2, P.Y1 + 7, P.titolo, { anchorY: "bottom", fontSize: 13.5, strokeColor: F.blu, cssStyle: "font-weight:700" });
    if (P.nx) M.scritta(crea, (P.X0 + P.X1) / 2, P.Y0 - 30, P.nx, { anchorY: "top", fontSize: 12, strokeColor: C.testo });
    if (P.ny) M.scritta(crea, P.X0 - 44, (P.Y0 + P.Y1) / 2, P.ny, { fontSize: 12, strokeColor: C.testo, rotate: 90 });
    return Q;
  }
  /** segmento tratto-punto (matplotlib "-."), disegnato a pezzi */
  function trattoPunto(crea, x0, y0, x1, y1, col, sp = 2) {
    const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, motivo = [[0, 8], [11, 13]], passo = 16;
    for (let t = 0; t < L; t += passo) for (const [a, b] of motivo) {
      const s0 = t + a, s1 = Math.min(L, t + b);
      if (s0 < L) M.linea(crea, x0 + ux * s0, y0 + uy * s0, x0 + ux * s1, y0 + uy * s1, { strokeColor: col, strokeWidth: sp });
    }
  }
  /** un tratto di linea con lo stile indicato: "linea", "tratteggio", "trattoPunto", "punteggiata" */
  function tratto(crea, x0, y0, x1, y1, col, tipo, sp = 2.2) {
    if (tipo === "trattoPunto") return trattoPunto(crea, x0, y0, x1, y1, col, sp);
    M.linea(crea, x0, y0, x1, y1, { strokeColor: col, strokeWidth: sp, dash: tipo === "tratteggio" ? 2 : tipo === "punteggiata" ? 1 : 0 });
  }
  /** legenda dentro il pannello: in alto a sinistra («sx») o a destra («dx»), oppure in basso a destra
   *  («basso»). voci: [colore, testo, tipo]; tipo come in tratto, più "barra", "area", "punto", "anello", "lineaPunti" */
  function legendaIn(crea, P, voci, C, dove = "sx") {
    const fs = 11.5, passo = 17, lung = 22;
    const largo = Math.max(...voci.map((v) => v[1].length)) * fs * 0.56 + lung + 10;
    const x0 = dove === "sx" ? P.X0 + 12 : Math.max(P.X0 + 12, P.X1 - largo - 6);
    const yTop = dove === "basso" ? P.Y0 + 12 + (voci.length - 1) * passo : P.Y1 - 12;
    voci.forEach(([col, testo, tipo], k) => {
      const y = yTop - k * passo;
      if (tipo === "barra" || tipo === "area") M.rett(crea, x0 + 2, y - 5, x0 + lung - 2, y + 5, { fillColor: col, fillOpacity: tipo === "area" ? 0.18 : 0.75, strokeColor: tipo === "area" ? "none" : col, strokeWidth: 0.5 });
      else if (tipo === "punto") M.pallino(crea, x0 + lung / 2, y, { size: 4, fillColor: col, strokeColor: col });
      else if (tipo === "anello") M.pallino(crea, x0 + lung / 2, y, { size: 5, fillColor: "none", fillOpacity: 0, strokeColor: col, strokeWidth: 2.5 });
      else {
        tratto(crea, x0, y, x0 + lung, y, col, tipo === "lineaPunti" ? "linea" : tipo);
        if (tipo === "lineaPunti") M.pallino(crea, x0 + lung / 2, y, { size: 3.5, fillColor: col, strokeColor: col });
      }
      M.scritta(crea, x0 + lung + 7, y, testo, { anchorX: "left", fontSize: fs, strokeColor: C.testo });
    });
  }
  const avviso = (crea, S, C, testo) => M.scritta(crea, S.W / 2, S.H / 2, testo, { fontSize: 15, strokeColor: C.rosso, cssStyle: "font-weight:700" });

  // ---------------------------------------------------------------- il capitolo che spiega il modello
  const CAPITOLO = {
    varcvar: ["var-cvar/", "var-cvar/", "VaR e CVaR: misurare e ottimizzare il rischio", "VaR and CVaR: measuring and optimizing risk"],
    arbitraggio: ["arbitraggio/", "arbitrage/", "Arbitraggio e prezzatura senza arbitraggio", "Arbitrage and arbitrage-free pricing"],
  };
  const radice = () => {
    try { if (W.__md_scope) return new URL(W.__md_scope); } catch (e) { /* sotto */ }
    const cfg = document.getElementById("__config");
    try { return new URL(JSON.parse(cfg.textContent).base + "/", location.href); } catch (e) { return new URL("./", location.href); }
  };
  const rigaCapitolo = (chiave) => {
    const c = CAPITOLO[chiave], url = new URL(GI.EN ? c[1] : c[0], radice()).href;
    return `<p class="plm-cap">${T("Il modello è spiegato nel capitolo", "The model is explained in the chapter")} <a href="${url}">${GI.EN ? c[3] : c[2]}</a>.</p>`;
  };

  // ---------------------------------------------------------------- il modello sopra il grafico
  /* come in gi-pl-app.js: il problema a parole, il modello simbolico impaginato come nel capitolo
   * (aligned) e, in un blocco richiudibile, il modello numerico nello stile delle dispense (array) */
  const NUM = { aperto: false };
  document.addEventListener("toggle", (e) => {
    const d = e.target;
    if (d && d.classList && d.classList.contains("plm-num") && d.closest(".plm-fin")) NUM.aperto = d.open;
  }, true);
  const SA = () => T("\\text{soggetto a}", "\\text{subject to}");
  const PER = (i, m) => `\\forall ${i} \\in \\{1, 2, \\dots, ${m}\\}`;
  const modello = (cap, testo, simbolico, num, nota) =>
    `<div class="plm plm-fin"><p class="plm-testo">${testo}</p>${rigaCapitolo(cap)}` +
    `<div class="plm-sim">\\(\\displaystyle \\begin{aligned} ${simbolico} \\end{aligned}\\)</div>` +
    `<details class="plm-num"${NUM.aperto ? " open" : ""}><summary>${T("Modello numerico con i dati attuali", "Numerical model with the current data")}</summary>` +
    `<div class="plm-num-corpo">${num}${nota ? `<p class="plm-nota">${nota}</p>` : ""}</div></details></div>`;

  // ================================================================ VaR e CVaR (cap. 9)
  /** i nomi dei titoli nella lingua del sito: l'oro è ORO in italiano, GLD in inglese */
  const NOMI = () => (GI.EN ? ["TEC", "UTL", "GLD"] : FIN.TITOLI);
  /** gli scenari in ordine di perdita crescente (a pari merito, quello con l'indice più alto dopo) */
  /** «1 scenario», «2 scenari», «1,5 scenari»: la coda di massa 1 - alpha, in scenari */
  const uno = (a) => Math.abs((1 - a) * K - 1) < 1e-9;
  const scen = (a) => (uno(a) ? T("1 scenario", "1 scenario") : T(`${nCoda(a)} scenari`, `${nCoda(a)} scenarios`));
  const ordinePerdite = (L) => L.map((l, s) => s).sort((a, b) => (Math.abs(L[a] - L[b]) < 1e-9 ? a - b : L[a] - L[b]));
  const vVarCvar = {
    etichetta: T("Portafoglio a CVaR minimo", "Minimum-CVaR portfolio"),
    cursori: [
      { nome: "\\alpha", min: 0.5, max: 0.9, step: 0.05, val: 0.8,
        fmt: (a) => T(`${fx(a, 2)} · coda ${scen(a)}`, `${fx(a, 2)} · tail ${scen(a)}`),
        descr: T("livello di confidenza: il CVaR\\(_\\alpha\\) è la perdita media nella frazione \\(1-\\alpha\\) degli anni peggiori",
          "confidence level: the CVaR\\(_\\alpha\\) is the average loss in the fraction \\(1-\\alpha\\) of the worst years") },
      { nome: "b", min: 0, max: 8, step: 0.25, val: 3,
        fmt: (x) => `${fx(x, 2)}%`,
        descr: T("rendimento atteso annuo minimo del portafoglio", "minimum expected annual return of the portfolio") },
    ],
    calcola(v) {
      return FIN.portafoglio(v[0], v[1]);
    },
    formula(R, v, st) {
      const al = st.col("a", "\\alpha"), bb = st.col("b", "b"), ks = PER("s", "k"), ni = PER("i", "n");
      const sim = `\\min ~~ \\eta + \\frac{1}{1-${al}} \\sum_{s=1}^{k} w_s\\, \\xi_s & & \\\\
        ${SA()} \\quad \\sum_{i=1}^{n} m_i\\, x_i &\\ge ${bb}, & \\\\
        \\sum_{i=1}^{n} x_i &= 1, & \\\\
        \\xi_s &\\ge -\\sum_{i=1}^{n} r_{is}\\, x_i - \\eta, & ${ks}, \\\\
        \\eta &\\gtreqless 0, & \\\\
        x_i &\\ge 0, & ${ni}, \\\\
        \\xi_s &\\ge 0, & ${ks}.`;
      // tutto il modello numerico in un array: colonne x_1, x_2, x_3, eta, xi_1, ..., xi_k; una riga di coda per scenario
      const a = v[0], U = 1 / (K * (1 - a)), NM = NOMI();
      const vars = [...NM.map((t, i) => `x_{${i + 1}}`), "\\eta", ...RENDIMENTI.map((r, s) => `\\xi_{${s + 1}}`)], z = () => new Array(vars.length).fill(0);
      const ie = NT, ix = (s) => NT + 1 + s;
      const ob = z(); ob[ie] = 1; RENDIMENTI.forEach((r, s) => { ob[ix(s)] = U; });
      const bud = z(), ren = z();
      for (let i = 0; i < NT; i++) { bud[i] = 1; ren[i] = MEDIE[i]; }
      const righe = [{ a: ren, rel: ">=", rhs: v[1], cifre: 2 }, { a: bud, rel: "=", rhs: 1 }];
      RENDIMENTI.forEach((rr, s) => {
        const c = z();
        for (let i = 0; i < NT; i++) c[i] = rr[i];
        c[ie] = 1; c[ix(s)] = 1;
        righe.push({ a: c, rel: ">=", rhs: 0 });
      });
      const num = W.GI_PL_NUM.numLP({ senso: "min", vars, c: ob, cifreObj: 4, cifre: 2, righe,
        dominio: [{ cols: [ie], rel: "><", rhs: "0" }, { cols: vars.map((x, j) => j).filter((j) => j !== ie), rel: ">=", rhs: "0" }] });
      const DV = W.GI_PL_DV;
      const TABS = DV.tabelle(DV.tab(T(`Rendimento annuo \\(r_{is}\\) (%) del titolo \\(i\\) nello scenario \\(s\\), e rendimento atteso \\(m_i\\) (%)`, `Annual return \\(r_{is}\\) (%) of asset \\(i\\) in scenario \\(s\\), and expected return \\(m_i\\) (%)`),
        [T("titolo", "asset"), ...RENDIMENTI.map((r, s) => `\\(s = ${s + 1}\\)`), "\\(m_i\\)"],
        NM.map((t, i) => [`${t} (\\(i = ${i + 1}\\))`, ...RENDIMENTI.map((r) => fx(r[i], 0)), fx(MEDIE[i], 0)])),
        DV.tab(T("Probabilità, rendimento richiesto e livello", "Probability, required return and level"), ["\\(w_s\\)", "\\(b\\) (%)", "\\(\\alpha\\)"], [[`1/${K}`, fx(v[1], 2), fx(a, 2)]]));
      const dati = (en) => en
        ? `<br><b>Data:</b> \\(n\\): number of assets (${NM.join(", ")}: technology, utilities, gold), index \\(i\\); \\(k\\): number of annual scenarios, index \\(s\\); \\(r_{is}\\): annual return (%) of asset \\(i\\) in scenario \\(s\\); \\(w_s\\): probability of scenario \\(s\\); \\(m_i\\): expected return (%) of asset \\(i\\), the mean of its \\(r_{is}\\); \\(b\\): minimum expected return (%) required of the portfolio; \\(\\alpha\\): confidence level; VaR\\(_\\alpha\\): loss threshold exceeded only in the fraction \\(1-\\alpha\\) of the scenarios; CVaR\\(_\\alpha\\): mean loss in that fraction of worst scenarios.`
        : `<br><b>Dati:</b> \\(n\\): numero di titoli (${NM.join(", ")}: tecnologia, servizi di pubblica utilità, oro), indice \\(i\\); \\(k\\): numero di scenari annui, indice \\(s\\); \\(r_{is}\\): rendimento annuo (%) del titolo \\(i\\) nello scenario \\(s\\); \\(w_s\\): probabilità dello scenario \\(s\\); \\(m_i\\): rendimento atteso (%) del titolo \\(i\\), la media dei suoi \\(r_{is}\\); \\(b\\): rendimento atteso minimo (%) richiesto al portafoglio; \\(\\alpha\\): livello di confidenza; VaR\\(_\\alpha\\): soglia di perdita superata solo nella frazione \\(1-\\alpha\\) degli scenari; CVaR\\(_\\alpha\\): perdita media in quella frazione di scenari peggiori.`;
      return modello("varcvar",
        T(`<b>Il problema.</b> Decidiamo quale quota del capitale investire in ogni titolo. L'obiettivo è minimizzare il CVaR\\(_\\alpha\\) della perdita annua del portafoglio, la perdita media negli scenari peggiori. I vincoli: rendimento atteso almeno pari a quello richiesto, quote che sommano a 1, nessuna vendita allo scoperto; le righe di coda misurano di quanto la perdita di ogni scenario supera la soglia.` +
        `<br><b>Variabili:</b> \\(x_i\\): quota del capitale nel titolo \\(i\\) (frazione: 0,25 = 25%); \\(\\eta\\): soglia di perdita (%), libera di segno, all'ottimo è un VaR\\(_\\alpha\\); \\(\\xi_s\\): di quanto la perdita \\(\\ell_s\\) supera \\(\\eta\\) (0 se non la supera); \\(\\ell_s = -\\sum_i r_{is} x_i\\): perdita annua (%) del portafoglio nello scenario \\(s\\) (negativa = guadagno), che dipende dalle \\(x_i\\).` +
        dati(false) + TABS,
      `<b>The problem.</b> We decide which share of the capital to invest in each asset. The objective is to minimize the CVaR\\(_\\alpha\\) of the annual portfolio loss, the average loss in the worst scenarios. The constraints: expected return at least the required one, shares summing to 1, no short selling; the tail rows measure how much the loss of each scenario exceeds the threshold.` +
        `<br><b>Variables:</b> \\(x_i\\): share of the capital in asset \\(i\\) (fraction: 0.25 = 25%); \\(\\eta\\): loss threshold (%), free in sign, at the optimum a VaR\\(_\\alpha\\); \\(\\xi_s\\): how much the loss \\(\\ell_s\\) exceeds \\(\\eta\\) (0 if it does not); \\(\\ell_s = -\\sum_i r_{is} x_i\\): annual portfolio loss (%) in scenario \\(s\\) (negative = gain), which depends on the \\(x_i\\).` +
        dati(true) + TABS),
        sim, num,
        T(`Coefficienti: nella funzione obiettivo ogni \\(\\xi_s\\) ha \\(w_s/(1-\\alpha) = 1/(${K} \\cdot ${fxT(1 - a, 2)}) = ${W.GI_PL_DV.f(U, 4)}\\); nella riga del rendimento i coefficienti sono le medie \\(m_i\\). La riga di coda \\(\\xi_s \\ge -\\sum_i r_{is} x_i - \\eta\\) è scritta con le variabili a sinistra: \\(\\sum_i r_{is} x_i + \\eta + \\xi_s \\ge 0\\).`,
          `Coefficients: in the objective function each \\(\\xi_s\\) has \\(w_s/(1-\\alpha) = 1/(${K} \\cdot ${fxT(1 - a, 2)}) = ${W.GI_PL_DV.f(U, 4)}\\); in the return row the coefficients are the means \\(m_i\\). The tail row \\(\\xi_s \\ge -\\sum_i r_{is} x_i - \\eta\\) is written with the variables on the left: \\(\\sum_i r_{is} x_i + \\eta + \\xi_s \\ge 0\\).`));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T(`Nessun portafoglio rende in media più del ${fx(MMAX, 0)}%`, `No portfolio returns more than ${fx(MMAX, 0)}% on average`));
      // come la figura del capitolo (cap09_perdite_frontiera): perdite per scenario a sinistra, frontiera a destra
      const F = FIG(), a = v[0], ped = pedice(a);
      const box = () => ({ X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto });
      // 1. le perdite dei 10 scenari in ordine crescente: in rosso la coda, chiaro lo scenario che ci sta in parte
      const L = R.perdite, ord = ordinePerdite(L), coda = R.coda, pieni = Math.floor(coda + 1e-9), parte = coda - pieni > 1e-9;
      const lo = Math.min(0, ...L), hi = Math.max(0, ...L, R.cvar), dy = hi - lo || 1;
      const A = figura(crea, Object.assign(box(0), { xa: 0.3, xb: K + 0.7, ya: lo - dy * 0.06, yb: hi + dy * 0.55,
        titolo: T(`Perdite del portafoglio ottimo (b = ${fx(v[1], 2)}%)`, `Losses of the optimal portfolio (b = ${fx(v[1], 2)}%)`),
        nx: T("scenario, in ordine di perdita crescente", "scenario, in increasing order of loss"), ny: T("perdita annua (%)", "annual loss (%)") }), C, { nTx: 0, nTy: 5 });
      ord.forEach((s, j) => {
        const dalFondo = K - 1 - j, inCoda = dalFondo < pieni, inParte = parte && dalFondo === pieni;
        const col = inCoda || inParte ? F.rosso : F.teal;
        M.rett(crea, A.X(j + 1 - 0.38), A.Y(0), A.X(j + 1 + 0.38), A.Y(L[s]), { fillColor: col, fillOpacity: inParte ? 0.35 : 0.8, strokeColor: col, strokeWidth: 0.8 });
        M.scritta(crea, A.X(j + 1), A.Y0 - 6, String(s + 1), { anchorY: "top", fontSize: 11, strokeColor: C.muted });
      });
      M.linea(crea, A.X0, A.Y(0), A.X1, A.Y(0), { strokeColor: C.muted, strokeWidth: 1 });
      const linee = [[F.verde, R.media, "tratteggio", T(`media ${fx(R.media)}%`, `mean ${fx(R.media)}%`)],
        [F.arancio, R.var, "trattoPunto", `VaR${ped} ${fx(R.var)}%`],
        [F.rosso, R.cvar, "linea", `CVaR${ped} ${fx(R.cvar)}%`]];
      linee.forEach(([col, y, tipo]) => tratto(crea, A.X0, A.Y(y), A.X1, A.Y(y), col, tipo, 2));
      legendaIn(crea, A, [...linee.map(([col, , tipo, testo]) => [col, testo, tipo]),
        [F.rosso, T(`coda: ${scen(a)}`, `tail: ${scen(a)}`), "barra"]], C, "sx");
    },
    legenda: () => {
      const F = FIG();
      return [[F.teal, T("perdite annue \\(\\ell_s\\) del portafoglio ottimo nei 10 scenari; frontiera: CVaR minimo per ogni rendimento richiesto \\(b\\)",
        "annual losses \\(\\ell_s\\) of the optimal portfolio in the 10 scenarios; frontier: minimum CVaR for each required return \\(b\\)"), "pieno"],
      [F.verde, T("perdita media \\(\\sum_s w_s \\ell_s\\)", "mean loss \\(\\sum_s w_s \\ell_s\\)"), "dashed"],
      [F.arancio, T("VaR\\(_\\alpha\\): quantile \\(\\alpha\\) delle perdite (tratto e punto)", "VaR\\(_\\alpha\\): \\(\\alpha\\)-quantile of the losses (dash-dot)"), "dashed"],
      [F.rosso, T("CVaR\\(_\\alpha\\): perdita media nella coda, valore ottimo dell'LP; il cerchio è il portafoglio con il \\(b\\) del cursore",
        "CVaR\\(_\\alpha\\): mean loss in the tail, optimal value of the LP; the circle is the portfolio with the slider \\(b\\)"), ""]];
    },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return M.tinta(C.rosso, T("Inammissibile.", "Infeasible.")) + " " +
        T(`Nessun titolo rende in media più del ${fx(MMAX, 0)}%: nessuna combinazione raggiunge \\(b = ${fx(v[1], 2)}\\%\\).`, `No asset returns more than ${fx(MMAX, 0)}% on average: no combination reaches \\(b = ${fx(v[1], 2)}\\%\\).`);
      return "";
    },
    soluzione(R, v, st, C) {
      if (R.stato !== "ottimo") return "";
      const SOL = W.GI_PL_SOL, F = FIG(), ped = fx(v[0], 2), NM = NOMI();
      const ord = ordinePerdite(R.perdite), pieni = Math.floor(R.coda + 1e-9);
      const rosso = (s, testo) => (ord.indexOf(s) >= K - Math.ceil(R.coda - 1e-9) ? M.tinta(C.rosso, testo) : testo);
      const quota = (x) => (x > 5e-5 ? pc(x, 1) : "—");
      return SOL.blocco(`${T("Valore ottimo", "Optimal value")}: ${M.tinta(F.rosso, `CVaR<sub>${ped}</sub>`)} = <b>${fx(R.cvar)}%</b> ${T("del capitale (perdita annua)", "of the capital (annual loss)")}`, [
        SOL.tab(T("Quote del portafoglio \\(\\tilde x_i\\) e soglia \\(\\tilde\\eta\\)", "Portfolio shares \\(\\tilde x_i\\) and threshold \\(\\tilde\\eta\\)"), [...NM, "\\(\\tilde\\eta\\)"],
          [[...R.x.map(quota), fx(R.var, 2) + "%"]]),
        SOL.tab(T(`Perdite \\(\\ell_s\\) ed eccessi \\(\\tilde\\xi_s\\) (%); in rosso la coda (${scen(v[0])}${pieni < R.coda - 1e-9 ? ", l'ultimo in parte" : ""})`,
          `Losses \\(\\ell_s\\) and excesses \\(\\tilde\\xi_s\\) (%); in red the tail (${scen(v[0])}${pieni < R.coda - 1e-9 ? ", the last one in part" : ""})`),
          ["\\(s\\)", "\\(\\ell_s\\)", "\\(\\tilde\\xi_s\\)"], R.perdite.map((l, s) => [String(s + 1), rosso(s, fx(l)), SOL.z(R.xi[s], 2)])),
      ], T("«—»: valore nullo.", "«—»: zero value."));
    },
    domanda: T("Porta \\(b\\) a 6%: UTL esce dal portafoglio e il CVaR sale a 10,58%. Porta \\(\\alpha\\) a 0,90: le quote diventano 20%, 40%, 40%.",
      "Set \\(b\\) to 6%: UTL leaves the portfolio and the CVaR rises to 10.58%. Set \\(\\alpha\\) to 0.90: the shares become 20%, 40%, 40%."),
  };

  // ================================================================ arbitraggio (cap. 10)
  const X_A = 14, X_B = 26;
  /** tasso privo di rischio del capitolo (4%): nell'app è un dato, i cursori sono i due prezzi */
  const R_FISSO = 0.04;
  const vArbitraggio = {
    etichetta: T("Arbitraggio e prezzatura", "Arbitrage and pricing"),
    cursori: [
      { nome: "s^0_1", min: 5, max: 17, step: 0.1, val: 13, fmt: (x) => euro(x),
        descr: T("prezzo oggi del titolo 1", "price today of asset 1") },
      { nome: "s^0_2", min: X_A, max: X_B, step: 0.01, val: 20, fmt: (x) => euro(x),
        descr: T("prezzo oggi del titolo 2", "price today of asset 2") },
    ],
    calcola(v) {
      const R = 1 + R_FISSO, A = FIN.arbitraggio(v[0], v[1], R);
      A.curva = FIN.curva(v[0], R, X_A, X_B);
      return A;
    },
    formula(A, v, st) {
      const s0 = st.col("a", "s^0_i"), sim = `\\min ~~ \\sum_{i=0}^{n} ${s0}\\, x_i & & \\\\
        ${SA()} \\quad \\sum_{i=0}^{n} s^1_{ij}\\, x_i &\\ge 0, & ${PER("j", "m")}, \\\\
        \\sum_{i=0}^{n} ${s0}\\, x_i &\\ge -1, & \\\\
        x_i &\\gtreqless 0, & \\forall i \\in \\{0, 1, \\dots, n\\}.`;
      const vars = ["x_{0}", "x_{1}", "x_{2}"], S = A.lp.S;
      const righe = [0, 1, 2].map((j) => ({ a: S.map((r) => r[j]), cifre: 3, rel: ">=", rhs: 0 }));
      righe.push({ a: A.s0, cifre: 2, rel: ">=", rhs: "-1" });
      const num = W.GI_PL_NUM.numLP({ senso: "min", vars, c: A.s0, cifreObj: 2, righe, dominio: [{ cols: [0, 1, 2], rel: "><", rhs: "0" }] },
        T("Il modello LP dell'istanza: 3 variabili, 4 vincoli. Colonne: le posizioni nei titoli 0, 1, 2. Righe: payoff negli stati 1, 2, 3, normalizzazione del costo.",
          "The LP model of the instance: 3 variables, 4 constraints. Columns: the positions in assets 0, 1, 2. Rows: payoff in states 1, 2, 3, normalization of the cost."));
      const DV = W.GI_PL_DV;
      const TABS = DV.tabelle(DV.tab(T("Prezzi oggi \\(s^0_i\\) e payoff domani \\(s^1_{ij}\\) (€): un titolo per riga, uno stato per colonna", "Prices today \\(s^0_i\\) and payoffs tomorrow \\(s^1_{ij}\\) (€): one asset per row, one state per column"),
        [T("titolo \\(i\\)", "asset \\(i\\)"), "\\(s^0_i\\)", "\\(j = 1\\)", "\\(j = 2\\)", "\\(j = 3\\)"], S.map((r, i) => [String(i), fx(A.s0[i], 2), ...r.map((x) => fx(x, i ? 0 : 3))])),
        DV.tab(T("Tasso privo di rischio", "Risk-free rate"), ["\\(r\\)", "\\(R = 1 + r\\)"], [[fx(R_FISSO, 2), fx(A.R, 2)]]));
      return modello("arbitraggio",
        T(`<b>Il problema.</b> Decidiamo quanto comprare o vendere allo scoperto oggi di ogni titolo, uno privo di rischio e gli altri rischiosi. L'obiettivo è minimizzare il costo oggi del portafoglio. I vincoli: payoff domani non negativo in ogni stato del mondo e incasso oggi al più 1 € (normalizzazione). Un arbitraggio di tipo A fa incassare oggi senza rischio di perdere domani (valore ottimo \\(-1\\)); uno di tipo B costa 0 oggi e ha payoff mai negativo e positivo in qualche stato. I prezzi sono coerenti se non creano arbitraggi.` +
        `<br><b>Variabili:</b> \\(x_i\\): posizione nel titolo \\(i\\), in unità (positiva: acquisto; negativa: vendita allo scoperto), per \\(i = 0, 1, \\dots, n\\).` +
        `<br><b>Dati:</b> \\(n\\): numero di titoli rischiosi, oltre al titolo 0 privo di rischio; \\(m\\): numero di stati del mondo possibili domani, indice \\(j\\); \\(s^0_i\\): prezzo oggi del titolo \\(i\\) (€); \\(s^1_{ij}\\): payoff domani del titolo \\(i\\) nello stato \\(j\\) (€); \\(r\\): tasso privo di rischio; \\(R = 1 + r\\): payoff del titolo 0 in ogni stato.` + TABS,
      `<b>The problem.</b> We decide how much of each asset to buy or sell short today, one risk-free asset and the others risky. The objective is to minimize the cost today of the portfolio. The constraints: non-negative payoff tomorrow in every state of the world and income today at most 1 € (normalization). A type A arbitrage cashes money today with no risk of losing tomorrow (optimal value \\(-1\\)); a type B one costs 0 today and has a payoff never negative and positive in some state. Prices are coherent if they create no arbitrage.` +
        `<br><b>Variables:</b> \\(x_i\\): position in asset \\(i\\), in units (positive: purchase; negative: short sale), for \\(i = 0, 1, \\dots, n\\).` +
        `<br><b>Data:</b> \\(n\\): number of risky assets, besides the risk-free asset 0; \\(m\\): number of possible states of the world tomorrow, index \\(j\\); \\(s^0_i\\): price today of asset \\(i\\) (€); \\(s^1_{ij}\\): payoff tomorrow of asset \\(i\\) in state \\(j\\) (€); \\(r\\): risk-free rate; \\(R = 1 + r\\): payoff of asset 0 in every state.` + TABS),
        sim, num,
        T(`Nel modello numerico: \\(s^0 = (1;\\ ${n(A.s0[1], 2)};\\ ${n(A.s0[2], 2)})\\); il titolo 0 paga \\(R = ${n(A.R, 3)}\\) in ogni stato, il titolo 1 paga \\((10;\\ 15;\\ 13)\\), il titolo 2 \\((30;\\ 15;\\ 25)\\).`,
          `In the numerical model: \\(s^0 = (1,\\ ${n(A.s0[1], 2)},\\ ${n(A.s0[2], 2)})\\); asset 0 pays \\(R = ${n(A.R, 3)}\\) in every state, asset 1 pays \\((10,\\ 15,\\ 13)\\), asset 2 \\((30,\\ 15,\\ 25)\\).`));
    },
    disegna(crea, A, v, C, S) {
      // in alto come la figura del capitolo (cap10_arbitraggio_curva); in basso payoff della strategia e misura q
      const F = FIG();
      const P = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto, xa: X_A - 0.4, xb: X_B + 0.4, ya: -1.1, yb: 0.12,
        titolo: T("Fuori dall'intervallo di prezzo coerente compare l'arbitraggio", "Outside the coherent price interval an arbitrage appears"),
        nx: T("prezzo del titolo 2, s⁰₂ (€)", "price of asset 2, s⁰₂ (€)"), ny: T("valore ottimo dell'LP", "optimal LP value") }, C, { nTx: 6, nTy: 5 });
      const I = A.int2;
      if (I) {
        const a = Math.max(I[0], P.xa), b = Math.min(I[1], P.xb);
        if (b > a) M.rett(crea, P.X(a), P.Y(P.ya), P.X(b), P.Y(P.yb), { fillColor: F.teal, fillOpacity: 0.12, strokeColor: "none", strokeWidth: 0 });
        I.forEach((x) => { if (x > P.xa && x < P.xb) M.linea(crea, P.X(x), P.Y(P.ya), P.X(x), P.Y(P.yb), { strokeColor: F.grigio, strokeWidth: 1.2, dash: 1 }); });
        const xm = (Math.max(I[0], X_A) + Math.min(I[1], X_B)) / 2;
        if (b > a) M.scritta(crea, P.X(xm), P.Y(-0.28), T("nessun arbitraggio", "no arbitrage") + "\n", { fontSize: 12.5, strokeColor: F.grigio, anchorY: "bottom" });
        if (b > a) M.scritta(crea, P.X(xm), P.Y(-0.3), `[${fx(I[0], 2)}; ${fx(I[1], 2)}]`, { fontSize: 12.5, strokeColor: F.grigio, anchorY: "top" });
      }
      M.linea(crea, P.X(P.xa), P.Y(0), P.X(P.xb), P.Y(0), { strokeColor: F.grigio, strokeWidth: 1 });
      crea("curve", [A.curva.xs.map(P.X), A.curva.zs.map(P.Y)], { strokeColor: F.teal, strokeWidth: 2.6, fixed: true, highlight: false });
      M.pallino(crea, P.X(v[1]), P.Y(A.lp.z), { size: 6, fillColor: F.arancio, strokeColor: "#ffffff", strokeWidth: 1.5 });
      legendaIn(crea, P, [[F.teal, T("valore ottimo dell'LP normalizzato", "optimal value of the normalized LP"), "linea"],
        [F.teal, I ? T("prezzi coerenti di s⁰₂", "coherent prices of s⁰₂") : T("nessun prezzo coerente: i titoli 0 e 1 danno già un arbitraggio", "no coherent price: assets 0 and 1 already give an arbitrage"), "area"],
        [F.arancio, T(`prezzo del cursore: s⁰₂ = ${fx(v[1], 2)} €`, `slider price: s⁰₂ = ${fx(v[1], 2)} €`), "punto"]], C, I && I[0] < 17.5 ? "basso" : "sx");
    },
    legenda: () => {
      const F = FIG();
      return [[F.teal, T("valore ottimo dell'LP normalizzato al variare di \\(s^0_2\\), con \\(s^0_1\\) del cursore: 0 senza arbitraggio, \\(-1\\) con arbitraggio", "optimal value of the normalized LP as \\(s^0_2\\) varies, with the slider \\(s^0_1\\): 0 without arbitrage, \\(-1\\) with arbitrage"), ""],
        [F.teal, T("intervallo dei prezzi coerenti di \\(s^0_2\\) (min e max di \\(\\sum_j s^1_{2j} p_j\\) su \\(p \\ge 0\\)); estremi punteggiati in grigio", "interval of coherent prices of \\(s^0_2\\) (min and max of \\(\\sum_j s^1_{2j} p_j\\) over \\(p \\ge 0\\)); end points dotted in grey"), "pieno"],
        [F.arancio, T("il prezzo \\(s^0_2\\) del cursore", "the slider price \\(s^0_2\\)"), "punto"],
        [F.verde, T("payoff \\(\\sum_i s^1_{ij} x_i\\) della strategia in ogni stato \\(j\\)", "payoff \\(\\sum_i s^1_{ij} x_i\\) of the strategy in each state \\(j\\)"), "pieno"]];
    },
    soluzione(A) {
      const SOL = W.GI_PL_SOL, x = A.lp.x, z = (q, c) => (Math.abs(q) < 0.5 * Math.pow(10, -c) ? "—" : fx(q, c));
      return SOL.blocco(`${T("Valore ottimo dell'LP normalizzato", "Optimal value of the normalized LP")}: <b>${fx(A.lp.z, 2)} €</b> ` +
        (A.tipoA ? T("(costo oggi della strategia: si incassa 1 €)", "(cost today of the strategy: one cashes 1 €)") : T("(nessuna strategia incassa denaro oggi senza rischio)", "(no strategy cashes money today without risk)")), [
        SOL.tab(T("Posizioni \\(\\tilde x_i\\) (quantità di titolo; negativa: vendita allo scoperto)", "Positions \\(\\tilde x_i\\) (amount of asset; negative: short sale)"),
          [T("titolo \\(i\\)", "asset \\(i\\)"), "0", "1", "2"],
          [[tx("\\tilde x_i"), ...x.map((q) => z(q, 3))], [T("costo oggi \\(s^0_i\\, \\tilde x_i\\) (€)", "cost today \\(s^0_i\\, \\tilde x_i\\) (€)"), ...x.map((q, i) => z(q * A.s0[i], 3))]]),
        SOL.tab(T("Payoff domani \\(\\sum_i s^1_{ij}\\, \\tilde x_i\\) (€)", "Payoff tomorrow \\(\\sum_i s^1_{ij}\\, \\tilde x_i\\) (€)"),
          [T("stato \\(j\\)", "state \\(j\\)"), ...A.lp.payoff.map((q, j) => String(j + 1))], [["", ...A.lp.payoff.map((q) => z(q, 2))]]),
      ], T("«—»: valore nullo.", "«—»: zero value."));
    },
    domanda: T("Porta \\(s^0_2\\) a 18,69 €: compare un arbitraggio e il valore ottimo scende a −1 €. Porta \\(s^0_1\\) a 6 €: c'è un arbitraggio per ogni prezzo \\(s^0_2\\).",
      "Set \\(s^0_2\\) to 18.69 €: an arbitrage appears and the optimal value drops to −1 €. Set \\(s^0_1\\) to 6 €: there is an arbitrage for every price \\(s^0_2\\)."),
  };

  // ================================================================ registrazione
  const reg = (nome, opz, voci) => { if (W.GI_PL_SOL) W.GI_PL_SOL.voci(voci); W.GI_RICETTE[nome] = () => O().ricettaVoci(opz, voci); };
  reg("pl-var-cvar", { titolo: T("VaR e CVaR di un portafoglio", "VaR and CVaR of a portfolio") }, { varcvar: vVarCvar });
  reg("pl-arbitraggio", { titolo: T("Arbitraggio e prezzatura", "Arbitrage and pricing") }, { arbitraggio: vArbitraggio });
})();
