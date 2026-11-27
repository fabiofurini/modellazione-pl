/* Laboratorio di «Modellazione PL / LP Modelling»: i modelli svolti del capitolo 4 «Tecniche di modellazione»
 * (pagine tecniche-modelli-01 … 09, EN techniques-models-01 … 09), un'app per modello (regola di Fabio, 26/11/2026).
 *
 *   pl-straordinario (4.4) · pl-dieta (4.6) · pl-dieta-classi (4.7) · pl-piu-periodi (4.8) · pl-dolci (4.9)
 *   pl-torte (4.10) · pl-raffineria (4.11) · pl-farmaci (4.12)
 *   Il trasporto (4.5) è l'app «pl-trasporto» (gi-pl-trasporto.js).
 *
 * Ogni app: due cursori sui dati principali, il simplesso in JS (GI_OTT.lp, gi-ott.js) risolve l'LP e l'app mostra
 * il problema, i dati con la tabella, il modello simbolico, la figura, la soluzione ottima e, in
 * fondo, il modello numerico; i numeri non interi come frazioni (GI_PL_FR di gi-pl-app.js). Con i valori iniziali
 * dei cursori i dati sono quelli delle pagine. Si carica dopo gi-ott.js e gi-comune.js (usa GI, GI_MIP, GI_OTT e la
 * ricetta «a voci» GI_OTT.ricettaVoci, come gi-pl-app.js); lo stile dei blocchi del modello (plm-…) sta in extra.css.
 */
(function () {
  "use strict";
  const GI = window.GI, M = window.GI_MIP, O = window.GI_OTT;
  if (!GI || !M || !O) return;
  const T = GI.T;
  window.GI_RICETTE = window.GI_RICETTE || {};
  // numeri non interi come frazioni (Fabio, 25/11/2026): GI_PL_FR di gi-pl-app.js, letto al momento del disegno
  // denominatori fino a 1000 (GI_PL_FR si ferma a 12): le soluzioni di questi LP hanno denominatori come 16 o 32
  const FRL = {
    rz: (x) => (window.GI_PL_FR && isFinite(x) ? window.GI_PL_FR.razionale(x, 1000, 1e-7) : null),
    tex(x, c = 2) {
      const r = FRL.rz(x);
      if (!r) return GI.num(x, c);
      if (r[1] === 1) return window.GI_PL_DV.f(r[0], 0);
      return `${r[0] < 0 ? "-" : ""}\\frac{${Math.abs(r[0])}}{${r[1]}}`;
    },
    txt(x, c = 2) {
      const r = FRL.rz(x);
      if (!r) return GI.numTxt(x, c);
      if (r[1] === 1) return GI.numTxt(r[0], 0);
      return `${r[0] < 0 ? "−" : ""}${Math.abs(r[0])}/${r[1]}`;
    },
    L: (a) => a.map((x) => FRL.tex(x)).join(GI.EN ? ",\\ " : ";\\ "),
    z: (x) => (Math.abs(x) < 1e-7 ? "—" : FRL.txt(x)),
  };
  const FRx = () => (window.GI_PL_FR ? FRL : null);
  const n = (x, c = 2) => (FRx() ? FRx().tex(x, c) : GI.num(x, c)), nt = (x, c = 2) => (FRx() ? FRx().txt(x, c) : GI.numTxt(x, c));
  /** i valori dei dati nella riga «Dati:» (GI_PL_DV), con le frazioni al posto dei decimali */
  const DVF = () => Object.assign({}, window.GI_PL_DV, FRx() ? { f: (x) => FRx().tex(x), L: (a) => FRx().L(a), t: (x) => FRx().txt(x) } : {});
  const tx = (s) => `\\(${s}\\)`;
  const mig = (x) => { const s = nt(x, 0); return s.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F"); };
  const nz = (a) => a && Math.abs(a) > 1e-12;
  /** numero nel testo: migliaia separate da uno spazio per i valori grandi e interi */
  const fq = (x, c = 2) => (Math.abs(x) >= 1000 && Math.abs(x - Math.round(x)) < 1e-6 ? mig(x) : nt(x, c));

  // ================================================================ lo stile delle figure dei capitoli (come gi-pl-app.js)
  const FIG = () => (M.scuro()
    ? { blu: "#D6E4F0", teal: "#22A6C7", rosso: "#E5675A", verde: "#3DBB6E", arancio: "#E8923F", grigio: "#A3AFB0", navy: "#9CC3E6" }
    : { blu: "#16324A", teal: "#0E7490", rosso: "#C0392B", verde: "#1E8449", arancio: "#CA6F1E", grigio: "#7F8C8D", navy: "#16324A" });
  const MF = { sx: 66, dx: 14, basso: 54, alto: 30 };
  function figura(crea, P, C, opz = {}) {
    const Q = O.pannello(crea, Object.assign({}, P, { nx: "", ny: "" }), C, opz);
    if (!crea) return Q;
    const F = FIG();
    if (P.titolo) M.scritta(crea, (P.X0 + P.X1) / 2, P.Y1 + 7, P.titolo, { anchorY: "bottom", fontSize: 13.5, strokeColor: F.blu, cssStyle: "font-weight:700" });
    if (P.nx) M.scritta(crea, (P.X0 + P.X1) / 2, P.Y0 - 30, P.nx, { anchorY: "top", fontSize: 12, strokeColor: C.testo });
    if (P.ny) M.scritta(crea, P.X0 - 44, (P.Y0 + P.Y1) / 2, P.ny, { fontSize: 12, strokeColor: C.testo, rotate: 90 });
    return Q;
  }
  /** legenda dentro il pannello; voci: [colore, testo, tipo] con tipo "barra", "linea", "lineaPunti", "tratteggio", "punteggiata", "punto", "rombo", "baffo" */
  function legendaIn(crea, P, voci, C, dove = "sx") {
    const fs = 11.5, passo = 17, lung = 20;
    const largo = Math.max(...voci.map((v) => v[1].length)) * fs * 0.56 + lung + 10;
    const x0 = dove === "sx" ? P.X0 + 12 : Math.max(P.X0 + 12, P.X1 - largo - 6);
    voci.forEach(([col, testo, tipo], k) => {
      const y = P.Y1 - 12 - k * passo;
      if (tipo === "barra") M.rett(crea, x0 + 2, y - 5, x0 + lung - 2, y + 5, { fillColor: col, fillOpacity: 1, strokeColor: col, strokeWidth: 0.5 });
      else if (tipo === "punto") M.pallino(crea, x0 + lung / 2, y, { size: 4, fillColor: col, strokeColor: col });
      else if (tipo === "rombo") M.pallino(crea, x0 + lung / 2, y, { size: 3.5, face: "<>", fillColor: C.card || "#ffffff", strokeColor: col, strokeWidth: 1.5 });
      else if (tipo === "area") M.rett(crea, x0 + 2, y - 5, x0 + lung - 2, y + 5, { fillColor: col, fillOpacity: 0.22, strokeColor: col, strokeWidth: 1 });
      else if (tipo === "baffo") {
        M.linea(crea, x0 + lung / 2, y - 6, x0 + lung / 2, y + 6, { strokeColor: col, strokeWidth: 1.6 });
        M.linea(crea, x0 + lung / 2 - 4, y - 6, x0 + lung / 2 + 4, y - 6, { strokeColor: col, strokeWidth: 1.6 });
        M.linea(crea, x0 + lung / 2 - 4, y + 6, x0 + lung / 2 + 4, y + 6, { strokeColor: col, strokeWidth: 1.6 });
      } else {
        const dash = tipo.startsWith("tratteggio") ? 2 : tipo === "punteggiata" ? 1 : 0;
        M.linea(crea, x0, y, x0 + lung, y, { strokeColor: col, strokeWidth: 2.2, dash });
        if (tipo.endsWith("Punti")) M.pallino(crea, x0 + lung / 2, y, { size: 3.5, fillColor: col, strokeColor: col });
      }
      M.scritta(crea, x0 + lung + 7, y, testo, { anchorX: "left", fontSize: fs, strokeColor: C.testo });
    });
  }
  /** etichette delle categorie sotto l'asse x (pannello con nTx: 0) */
  const categorie = (crea, P, voci, C) => voci.forEach(([x, s]) =>
    M.scritta(crea, P.X(x), P.Y0 - 8, s, { anchorY: "top", fontSize: 11.5, strokeColor: C.muted }));
  const barra = (crea, P, x, y0, y1, larg, col) => {
    if (Math.abs(y1 - y0) > 1e-9) M.rett(crea, P.X(x - larg / 2), P.Y(y0), P.X(x + larg / 2), P.Y(y1), { fillColor: col, fillOpacity: 1, strokeColor: col, strokeWidth: 0.5 });
  };
  /** intervallo ammesso [lo, hi]: segmento verticale con le stanghette */
  const baffo = (crea, P, x, lo, hi, col) => {
    const w = (P.xb - P.xa) * 0.03;
    M.linea(crea, P.X(x), P.Y(lo), P.X(x), P.Y(hi), { strokeColor: col, strokeWidth: 1.6 });
    [lo, hi].forEach((y) => M.linea(crea, P.X(x - w), P.Y(y), P.X(x + w), P.Y(y), { strokeColor: col, strokeWidth: 1.6 }));
  };
  /** tratto orizzontale (capacità) sopra una barra */
  const tetto = (crea, P, x, y, larg, col) => M.linea(crea, P.X(x - larg / 2), P.Y(y), P.X(x + larg / 2), P.Y(y), { strokeColor: col, strokeWidth: 2.2, dash: 2 });
  const lineaPunti = (crea, P, xs, ys, col) => {
    crea("curve", [xs.map(P.X), ys.map(P.Y)], { strokeColor: col, strokeWidth: 2.2, fixed: true, highlight: false });
    xs.forEach((x, k) => M.pallino(crea, P.X(x), P.Y(ys[k]), { size: 4, fillColor: col, strokeColor: col }));
  };
  const rombo = (crea, P, x, y, col, C) => M.pallino(crea, P.X(x), P.Y(y), { size: 5.5, face: "<>", fillColor: C.card || "#ffffff", strokeColor: col, strokeWidth: 1.5 });
  /** un pannello a tutta larghezza (una figura per app: Fabio, 26/11/2026) */
  const pieno = (S) => ({ X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto });
  /** due pannelli affiancati: frazione della larghezza al primo */
  const affiancati = (S, frac = 0.5, gap = 84) => {
    const L = S.W - MF.sx - MF.dx - gap, a = L * frac;
    return [{ X0: MF.sx, X1: MF.sx + a, Y0: MF.basso, Y1: S.H - MF.alto }, { X0: MF.sx + a + gap, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto }];
  };
  /** due pannelli uno sopra l'altro: frazione dell'altezza a quello in alto */
  const sovrapposti = (S, frac = 0.56, gap = 70) => {
    const H = S.H - MF.basso - MF.alto - gap, a = H * frac;
    return [{ X0: MF.sx, X1: S.W - MF.dx, Y0: S.H - MF.alto - a, Y1: S.H - MF.alto }, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: MF.basso + H - a }];
  };
  const avviso = (crea, S, C, testo) => M.scritta(crea, S.W / 2, S.H / 2, testo, { fontSize: 15, strokeColor: C.rosso, cssStyle: "font-weight:700" });

  // ================================================================ la pagina che spiega il modello
  const PAGINA = {
    "01": ["Esempio 4.4 — Produzione in orario ordinario e in straordinario", "Example 4.4 — Production with regular time and overtime"],
    "02": ["Esempio 4.5 — Trasporto dai magazzini ai clienti", "Example 4.5 — Transportation from warehouses to clients"],
    "03": ["Esempio 4.6 — Pianificazione della dieta", "Example 4.6 — Diet planning"],
    "04": ["Esempio 4.7 — Pianificazione della dieta per più classi", "Example 4.7 — Diet planning for several classes"],
    "05": ["Esempio 4.8 — Produzione su più periodi con acquisti e stoccaggio", "Example 4.8 — Multi-period production with purchases and storage"],
    "06": ["Esempio 4.9 — Scelta dei dolci", "Example 4.9 — Choice of desserts"],
    "07": ["Esempio 4.10 — Produzione e stoccaggio di torte di frutta", "Example 4.10 — Production and storage of fruit cakes"],
    "08": ["Esempio 4.11 — Miscelazione di petrolio greggio in una raffineria", "Example 4.11 — Blending of crude oil in a refinery"],
    "09": ["Esempio 4.12 — Produzione di tre farmaci", "Example 4.12 — Production of three drugs"],
  };
  const radice = () => {
    try { if (window.__md_scope) return new URL(window.__md_scope); } catch (e) { /* sotto */ }
    const cfg = document.getElementById("__config");
    try { return new URL(JSON.parse(cfg.textContent).base + "/", location.href); } catch (e) { return new URL("./", location.href); }
  };
  const rigaPagina = (k) => {
    const url = new URL((GI.EN ? "techniques-models-" : "tecniche-modelli-") + k + "/", radice()).href;
    return `<p class="plm-cap">${T("Il modello è spiegato nella pagina", "The model is explained on the page")} <a href="${url}">${GI.EN ? PAGINA[k][1] : PAGINA[k][0]}</a>.</p>`;
  };

  // ================================================================ il modello sopra il grafico
  const NUM = { aperto: false };
  document.addEventListener("toggle", (e) => {
    const d = e.target;
    if (d && d.classList && d.classList.contains("plm-num") && d.closest('.gi')) NUM.aperto = d.open;
  }, true);
  const SA = () => T("\\text{soggetto a}", "\\text{subject to}");
  const PER = (i, m) => `\\forall ${i} \\in \\{1, 2, \\dots, ${m}\\}`;
  const REL = { "<=": "\\le", "=": "=", ">=": "\\ge" };
  /** Il modello numerico nello stile delle pagine tecniche-modelli: \begin{array}{rrcrcr…cr}, una colonna per
   *  variabile con i segni in colonne proprie, relazione e termine noto a destra, \\[1ex] fra le righe.
   *  Con «per» (righe lunghe, come nell'Esempio 4.8) ogni riga va a capo ogni «per» variabili: {rcrcr…cr},
   *  il segno ha sempre la sua colonna, \\[1.5ex] fra le righe.
   *  righe: { lab, c: [coefficienti], tex: {j: termine già scritto}, rel, rhs (TeX) } oppure { dominio: [colonne], rel, rhs } */
  function griglia(vars, righe, per) {
    const N = vars.length, avvolto = !!per && N > per, P = avvolto ? per : N;
    const pezzi = [];
    for (let k = 0; k < N; k += P) pezzi.push([...Array(Math.min(P, N - k)).keys()].map((q) => q + k));
    const br = (s) => (s === "" ? "" : /^\\text/.test(s) ? s : `{${s}}`);
    const out = [];
    righe.forEach((r, ir) => {
      const pieno = (g) => (r.dominio ? g.some((j) => r.dominio.includes(j)) : g.some((j) => nz(r.c[j])));
      let fine = 0;
      pezzi.forEach((g, k) => { if (pieno(g)) fine = k; });
      const ultimoDom = r.dominio ? Math.max(...r.dominio) : -1;
      let visto = false;
      pezzi.forEach((g, k) => {
        if (k > fine || (k > 0 && !pieno(g))) return;
        const celle = [k === 0 ? r.lab || "" : ""];
        for (let q = 0; q < P; q++) {
          const j = g[q];
          let s = "", t = "";
          if (j !== undefined) {
            if (r.dominio) { if (r.dominio.includes(j)) t = vars[j] + (j === ultimoDom ? "" : ","); }
            else if (nz(r.c[j])) {
              const a = r.c[j], termine = (r.tex && r.tex[j]) || (Math.abs(Math.abs(a) - 1) < 1e-12 ? "" : n(Math.abs(a), r.cifre ?? 3) + "\\,") + vars[j];
              s = visto ? (a < 0 ? "-" : "+") : a < 0 ? "-" : "";
              t = termine;
              visto = true;
            }
          }
          if (!avvolto && q === 0) celle.push(s === "-" ? "-" + t : t);   // prima colonna senza colonna del segno
          else celle.push(s, t);
        }
        const ultima = k === fine;
        celle.push(ultima && r.rel ? REL[r.rel] : "", ultima && r.rhs !== undefined ? r.rhs : "");
        while (celle.length && celle[celle.length - 1] === "") celle.pop();
        const sep = !ultima ? " \\\\\n" : ir === righe.length - 1 ? "\n" : avvolto ? " \\\\[1.5ex]\n" : " \\\\[1ex]\n";
        out.push(celle.map(br).join(" & ") + sep);
      });
    });
    const spec = avvolto ? "r" + "cr".repeat(P) + "cr" : "rr" + "cr".repeat(P - 1) + "cr";
    return `\\begin{array}{${spec}} ${out.join("")}\\end{array}`;
  }
  /** il modello numerico di una voce, dalle stesse righe passate al simplesso (quindi sempre coerente) */
  function numerico(P, opz = {}) {
    const N = P.vars.length;
    const righe = [{ lab: P.senso === "max" ? "\\max" : "\\min", c: P.c, tex: P.texObj, cifre: P.cifre }];
    P.righe.forEach((r, i) => righe.push({ lab: i ? "" : SA(), c: r.a, rel: r.rel, rhs: r.rhsTex ?? n(r.b, 3), cifre: P.cifre }));
    righe.push({ dominio: [...Array(N).keys()], rel: ">=", rhs: "0" });
    return griglia(P.vars, righe, opz.per);
  }
  const modello = (k, testo, simbolico, num, nota) =>
    `<div class="plm"><p class="plm-testo">${testo}</p>${rigaPagina(k)}` +
    `<div class="plm-sim">\\(\\displaystyle \\begin{aligned} ${simbolico} \\end{aligned}\\)</div>` +
    `<details class="plm-num"${NUM.aperto ? " open" : ""}><summary>${T("Modello numerico con i dati attuali", "Numerical model with the current data")}</summary>` +
    `<div class="plm-num-corpo"><p class="plm-tit">${T("Il modello LP dell'istanza, come nella pagina dell'esempio", "The LP model of the instance, as on the page of the example")}</p>` +
    `<div class="plm-riga plm-array">\\(\\displaystyle ${num}\\)</div>${nota ? `<p class="plm-nota">${nota}</p>` : ""}</div></details></div>`;

  // ================================================================ risoluzione e letture comuni
  /** risolve l'LP P = {vars, c, senso, righe: [{a, rel, b, nome, duale, unita}], costante} */
  function risolvi(D, P) {
    const r = O.lp({ c: P.c, A: P.righe.map((q) => q.a), rel: P.righe.map((q) => q.rel), b: P.righe.map((q) => q.b), senso: P.senso });
    const R = { stato: r.stato, D, P };
    if (r.stato !== "ottimo") return R;
    const pul = (v) => (Math.abs(v) < 1e-9 ? 0 : v);
    R.x = r.x.map(pul);
    R.z = r.z + (P.costante || 0);
    R.y = r.y.map(pul);
    R.lhs = P.righe.map((q) => q.a.reduce((s, a, j) => s + a * R.x[j], 0));
    return R;
  }
  const stato = (R, C) => M.tinta(C.rosso, R.stato === "illimitato" ? T("Illimitato.", "Unbounded.") : T("Inammissibile.", "Infeasible.")) + " " +
    (R.stato === "illimitato" ? T("Il valore della funzione obiettivo cresce senza limite.", "The objective function value grows without bound.")
      : T("Con questi dati nessuna soluzione rispetta tutti i vincoli: il simplesso si ferma alla fase 1.", "With these data no solution satisfies all the constraints: the simplex method stops in phase 1."));
  const valore = (testo, R, unita, cifre = 2) => `${testo} \\(z(\\text{LP})\\) = <b>${fq(R.z, cifre)} ${unita}</b>`;
  /** \\(\tilde x_{i}(\text{LP})\\): la notazione della soluzione dei capitoli (GI_PL_SOL.tilT) */
  const tl = (v, i = "") => SOL().tilT(v, i);
  /** la tabellina «Dimensioni» (GI_PL_DV.dim) */
  const DIM = (...c) => window.GI_PL_DV.dim(...c);
  /** il blocco «Soluzione ottima» sotto il grafico (GI_PL_SOL, gi-pl-app.js): prima le variabili, sotto il valore ottimo */
  const SOL = () => window.GI_PL_SOL;
  const z = (x, c = 2) => (FRx() ? FRx().z(x, c) : SOL().z(x, c));
  const NULLO = () => T("«—»: valore nullo.", "«—»: zero value.");
  const nota = (s) => `<div style="margin-top:.3em">${s}</div>`;

  // ================================================================ 4.4 produzione in orario ordinario e in straordinario
  const D01 = { w: [35, 30, 25], a: [3, 2, 2], b: [6, 4, 4], c: [5, 3, 3], d: 30, e: 20 };
  const vStraordinario = {
    etichetta: T("Ordinario e straordinario", "Regular time and overtime"),
    cursori: [
      { nome: "d", min: 0, max: 90, step: 2.5, val: 30, fmt: (x) => `${GI.numTxt(x, 1)} ${T("L/giorno", "L/day")}`,   // passi di 2,5: anche soluzioni frazionarie
        descr: T("litri trattabili al giorno in orario ordinario, per tutti i prodotti insieme", "liters that can be treated per day in regular time, all products together") },
      { nome: "e", min: 0, max: 90, step: 2.5, val: 20, fmt: (x) => `${GI.numTxt(x, 1)} ${T("L/giorno", "L/day")}`,
        descr: T("litri trattabili al giorno in straordinario", "liters that can be treated per day in overtime") },
    ],
    calcola(v) {
      const D = Object.assign({}, D01, { d: v[0], e: v[1], b: D01.b.slice() });
      const vars = [], righe = [];
      ["x", "y", "z"].forEach((s) => [1, 2, 3].forEach((i) => vars.push(`${s}_{${i}}`)));
      const z9 = () => new Array(9).fill(0);
      for (let i = 0; i < 3; i++) {
        const a = z9(); a[i] = a[3 + i] = a[6 + i] = 1;
        righe.push({ a, rel: "<=", b: D.w[i], nome: T(`produzione del prodotto ${i + 1}`, `production of product ${i + 1}`), duale: `\\lambda_{${i + 1}}`, unita: "€/L" });
      }
      righe.push({ a: [0, 0, 0, 1, 1, 1, 0, 0, 0], rel: "<=", b: D.d, nome: T("trattamento in orario ordinario", "treatment in regular time"), duale: "\\pi", unita: "€/L" });
      righe.push({ a: [0, 0, 0, 0, 0, 0, 1, 1, 1], rel: "<=", b: D.e, nome: T("trattamento in straordinario", "treatment in overtime"), duale: "\\varrho", unita: "€/L" });
      return risolvi(D, { vars, c: [...D.a, ...D.b, ...D.c], senso: "max", righe });
    },
    formula(R, v, st) {
      const d = st.col("a", "d"), e = st.col("b", "e"), b = "b_i", ir = PER("i", "r");
      const sim = `\\max ~~ \\sum_{i=1}^{r} a_i\\, x_i + \\sum_{i=1}^{r} ${b}\\, y_i + \\sum_{i=1}^{r} c_i\\, z_i & & \\\\
        ${SA()} \\quad x_i + y_i + z_i &\\le w_i, & ${ir}, \\\\
        \\sum_{i=1}^{r} y_i &\\le ${d}, & \\\\
        \\sum_{i=1}^{r} z_i &\\le ${e}, & \\\\
        x_i &\\ge 0, & ${ir}, \\\\
        y_i &\\ge 0, & ${ir}, \\\\
        z_i &\\ge 0, & ${ir}.`;
      const DV = DVF(), QD = R.D;
      return modello("01", T(`<b>Il problema.</b> Decidiamo quanti litri di ogni prodotto vendere al giorno non trattati, trattati in orario ordinario e trattati in straordinario. L'obiettivo è il profitto massimo. I vincoli: produzione massima di ogni prodotto, capacità di trattamento in orario ordinario e in straordinario, per tutti i prodotti insieme.` +
        `<br><b>Variabili:</b> \\(x_i \\ge 0\\): litri del prodotto \\(i\\) venduti al giorno non trattati; \\(y_i \\ge 0\\): litri trattati in orario ordinario; \\(z_i \\ge 0\\): litri trattati in straordinario; con \\(i \\in \\{1, \\dots, r\\}\\).` +
        `<br><b>Dati:</b> \\(r\\): numero di prodotti; \\(a_i\\), \\(b_i\\), \\(c_i\\): profitto di un litro venduto non trattato, trattato in orario ordinario, trattato in straordinario (€); \\(w_i\\): produzione massima del prodotto \\(i\\) (L al giorno); \\(d\\), \\(e\\): litri trattabili al giorno in orario ordinario e in straordinario; con \\(i \\in \\{1, \\dots, r\\}\\).`,
      `<b>The problem.</b> We decide how many liters of each product to sell per day untreated, treated in regular time and treated in overtime. The objective is the maximum profit. The constraints: maximum production of each product, treatment capacity in regular time and in overtime, all products together.` +
        `<br><b>Variables:</b> \\(x_i \\ge 0\\): liters of product \\(i\\) sold per day untreated; \\(y_i \\ge 0\\): liters treated in regular time; \\(z_i \\ge 0\\): liters treated in overtime; with \\(i \\in \\{1, \\dots, r\\}\\).` +
        `<br><b>Data:</b> \\(r\\): number of products; \\(a_i\\), \\(b_i\\), \\(c_i\\): profit of one liter sold untreated, treated in regular time, treated in overtime (€); \\(w_i\\): maximum production of product \\(i\\) (L per day); \\(d\\), \\(e\\): liters that can be treated per day in regular time and in overtime; with \\(i \\in \\{1, \\dots, r\\}\\).`),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile", "No feasible plan"));
      const F = FIG(), D = R.D, x = R.x, b1 = pieno(S);
      const ymax = Math.max(...D.w, D.d, D.e, 10) * 1.5;
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 3.6, ya: 0, yb: ymax, titolo: T("Litri al giorno per prodotto nella soluzione ottima", "Liters per day by product in the optimal solution"),
        nx: T("prodotto", "product"), ny: T("litri al giorno", "liters per day") }), C, { nTx: 0, nTy: 5 });
      for (let i = 0; i < 3; i++) {
        let y0 = 0;
        [[x[i], F.grigio], [x[3 + i], F.teal], [x[6 + i], F.arancio]].forEach(([q, col]) => { barra(crea, A, i + 1, y0, y0 + q, 0.5, col); y0 += q; });
        tetto(crea, A, i + 1, D.w[i], 0.7, F.rosso);
      }
      categorie(crea, A, [1, 2, 3].map((i) => [i, String(i)]), C);
      legendaIn(crea, A, [[F.grigio, T("non trattato x̃(LP)", "untreated x̃(LP)"), "barra"], [F.teal, T("orario ordinario ỹ(LP)", "regular time ỹ(LP)"), "barra"],
        [F.arancio, T("straordinario z̃(LP)", "overtime z̃(LP)"), "barra"], [F.rosso, T("produzione massima wᵢ", "maximum production wᵢ"), "tratteggio"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.grigio, T("litri venduti non trattati \\(x_i\\)", "liters sold untreated \\(x_i\\)"), "pieno"],
      [F.teal, T("litri trattati in orario ordinario \\(y_i\\)", "liters treated in regular time \\(y_i\\)"), "pieno"],
      [F.arancio, T("litri trattati in straordinario \\(z_i\\)", "liters treated in overtime \\(z_i\\)"), "pieno"],
      [F.rosso, T("produzione massima \\(w_i\\) e capacità di trattamento \\(d\\), \\(e\\)", "maximum production \\(w_i\\) and treatment capacities \\(d\\), \\(e\\)"), "dashed"]]; },
    letture(R, v, st, C) { return R.stato !== "ottimo" ? stato(R, C) : ""; },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x;
      return SOL().blocco(valore(T("Profitto massimo", "Maximum profit"), R, T("€ al giorno", "€ per day")), [
        SOL().tab(T("Litri al giorno per prodotto", "Liters per day by product"), ["\\(i\\)", tl("x", "i"), tl("y", "i"), tl("z", "i"), T("totale / \\(w_i\\)", "total / \\(w_i\\)")],
          [0, 1, 2].map((i) => [String(i + 1), z(x[i]), z(x[3 + i]), z(x[6 + i]), `${nt(x[i] + x[3 + i] + x[6 + i])} / ${nt(R.D.w[i])}`])),
      ], NULLO());
    },
    domanda: T("Porta \\(d\\) a 70: nessun litro resta non trattato e il profitto sale a 410 €. Porta \\(e\\) a 0: si vendono 5 L del prodotto 1 non trattati.",
      "Set \\(d\\) to 70: no liter stays untreated and the profit rises to 410 €. Set \\(e\\) to 0: 5 L of product 1 are sold untreated."),
    tabella: (R, DV) => DIM(["r", 3]) + DV.tab(T("Prodotti", "Products"), ["\\(i\\)", "\\(a_i\\) (€/L)", "\\(b_i\\) (€/L)", "\\(c_i\\) (€/L)", T("\\(w_i\\) (L al giorno)", "\\(w_i\\) (L per day)")],
      [0, 1, 2].map((i) => [String(i + 1), DV.t(R.D.a[i]), DV.t(R.D.b[i]), DV.t(R.D.c[i]), DV.t(R.D.w[i])])) + DV.tab(T("Trattamento", "Treatment"), ["", T("L al giorno", "L per day")],
      [[T("orario ordinario \\(d\\)", "regular time \\(d\\)"), DV.t(R.D.d)], [T("straordinario \\(e\\)", "overtime \\(e\\)"), DV.t(R.D.e)]]),
  };

  // ================================================================ 4.6 pianificazione della dieta
  const D03 = { w: [5, 8, 2, 2], g: [[2, 4, 2], [1, 1, 1], [4, 6, 4], [4, 6, 2]], a: [10, 20, 10], b: [40, 60, 50], c: [1, 1, 0, 1], d: [10, 15, 20, 10] };
  const vDieta = {
    etichetta: T("Dieta", "Diet"),
    cursori: [
      { nome: "a_2", min: 0, max: 60, step: 2, val: 20, fmt: (x) => `${nt(x, 0)} ${T("g/mese", "g/month")}`,
        descr: T("grammi minimi del nutriente 2 al mese", "minimum grams of nutrient 2 per month") },
      { nome: "a_3", min: 0, max: 50, step: 5, val: 10, fmt: (x) => `${nt(x, 0)} ${T("g/mese", "g/month")}`,
        descr: T("grammi minimi del nutriente 3 al mese", "minimum grams of nutrient 3 per month") },
    ],
    calcola(v) {
      const D = Object.assign({}, D03, { a: [10, v[0], v[1]], w: D03.w.slice() });
      const vars = [1, 2, 3, 4].map((i) => `x_{${i}}`), righe = [];
      for (let j = 0; j < 3; j++) righe.push({ a: D.g.map((r) => r[j]), rel: ">=", b: D.a[j], nome: T(`nutriente ${j + 1}, minimo`, `nutrient ${j + 1}, minimum`), duale: `\\alpha_{${j + 1}}`, unita: "€/g" });
      for (let j = 0; j < 3; j++) righe.push({ a: D.g.map((r) => r[j]), rel: "<=", b: D.b[j], nome: T(`nutriente ${j + 1}, massimo`, `nutrient ${j + 1}, maximum`), duale: `\\beta_{${j + 1}}`, unita: "€/g" });
      for (let i = 0; i < 4; i++) { const a = [0, 0, 0, 0]; a[i] = 1; righe.push({ a, rel: ">=", b: D.c[i], nome: T(`alimento ${i + 1}, minimo`, `food ${i + 1}, minimum`), duale: `\\gamma_{${i + 1}}`, unita: "€/kg" }); }
      for (let i = 0; i < 4; i++) { const a = [0, 0, 0, 0]; a[i] = 1; righe.push({ a, rel: "<=", b: D.d[i], nome: T(`alimento ${i + 1}, massimo`, `food ${i + 1}, maximum`), duale: `\\delta_{${i + 1}}`, unita: "€/kg" }); }
      return risolvi(D, { vars, c: D.w, senso: "min", righe });
    },
    formula(R, v, st) {
      const is = PER("i", "s"), jr = PER("j", "r");
      const sim = `\\min ~~ \\sum_{i=1}^{s} w_i\\, x_i & & \\\\
        ${SA()} \\quad \\sum_{i=1}^{s} g_{ij}\\, x_i &\\ge ${st.col("a", "a_j")}, & ${jr}, \\\\
        \\sum_{i=1}^{s} g_{ij}\\, x_i &\\le b_j, & ${jr}, \\\\
        x_i &\\ge c_i, & ${is}, \\\\
        x_i &\\le d_i, & ${is}, \\\\
        x_i &\\ge 0, & ${is}.`;
      const DV = DVF(), QD = R.D;
      const TABS = DV.tabelle(DV.tab(T("\\(g_{ij}\\) (g per kg)", "\\(g_{ij}\\) (g per kg)"), ["\\(i \\backslash j\\)", ...QD.g[0].map((q, j) => String(j + 1))], QD.g.map((r, i) => [String(i + 1), ...r.map((x) => DV.t(x, 2))])));
      return modello("03", T(`<b>Il problema.</b> Decidiamo quanti chilogrammi di ogni alimento mettere nella dieta mensile. L'obiettivo è il costo minimo. I vincoli: per ogni nutriente una quantità minima e una massima al mese; per ogni alimento una quantità minima e una massima.` +
        `<br><b>Variabili:</b> \\(x_i \\ge 0\\): chilogrammi dell'alimento \\(i\\) nella dieta mensile, con \\(i \\in \\{1, \\dots, s\\}\\).` +
        `<br><b>Dati:</b> \\(s\\): numero di alimenti; \\(r\\): numero di nutrienti; \\(g_{ij}\\): grammi di nutriente \\(j\\) in un chilogrammo di alimento \\(i\\); \\(w_i\\): costo di un chilogrammo di alimento \\(i\\) (€); \\(a_j\\), \\(b_j\\): grammi minimi e massimi di nutriente \\(j\\) al mese; \\(c_i\\), \\(d_i\\): chilogrammi minimi e massimi di alimento \\(i\\) al mese; con \\(i \\in \\{1, \\dots, s\\}\\) e \\(j \\in \\{1, \\dots, r\\}\\).` + TABS,
      `<b>The problem.</b> We decide how many kilograms of each food to put in the monthly diet. The objective is the minimum cost. The constraints: for each nutrient a minimum and a maximum amount per month; for each food a minimum and a maximum amount.` +
        `<br><b>Variables:</b> \\(x_i \\ge 0\\): kilograms of food \\(i\\) in the monthly diet, with \\(i \\in \\{1, \\dots, s\\}\\).` +
        `<br><b>Data:</b> \\(s\\): number of foods; \\(r\\): number of nutrients; \\(g_{ij}\\): grams of nutrient \\(j\\) in one kilogram of food \\(i\\); \\(w_i\\): cost of one kilogram of food \\(i\\) (€); \\(a_j\\), \\(b_j\\): minimum and maximum grams of nutrient \\(j\\) per month; \\(c_i\\), \\(d_i\\): minimum and maximum kilograms of food \\(i\\) per month; with \\(i \\in \\{1, \\dots, s\\}\\) and \\(j \\in \\{1, \\dots, r\\}\\).` + TABS),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessuna dieta ammissibile", "No feasible diet"));
      const F = FIG(), D = R.D, x = R.x, b1 = pieno(S);
      // i nutrienti forniti dalla dieta ottima, con i limiti [a_j, b_j]: i cursori spostano i minimi a_2 e a_3
      const B = figura(crea, Object.assign(b1, { xa: 0.4, xb: 3.6, ya: 0, yb: Math.max(...D.b) * 1.45, titolo: T("Nutrienti nella dieta ottima x̃(LP)", "Nutrients in the optimal diet x̃(LP)"),
        nx: T("nutriente", "nutrient"), ny: T("grammi al mese", "grams per month") }), C, { nTx: 0, nTy: 5 });
      R.lhs.slice(0, 3).forEach((q, j) => { barra(crea, B, j + 1, 0, q, 0.5, F.verde); baffo(crea, B, j + 1, D.a[j], D.b[j], F.blu); });
      categorie(crea, B, [1, 2, 3].map((j) => [j, String(j)]), C);
      legendaIn(crea, B, [[F.verde, T("grammi forniti Σᵢ gᵢⱼ x̃(LP)", "grams supplied Σᵢ gᵢⱼ x̃(LP)"), "barra"], [F.blu, T("intervallo [aⱼ, bⱼ]", "range [aⱼ, bⱼ]"), "baffo"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("chilogrammi \\(x_i\\) di ogni alimento", "kilograms \\(x_i\\) of each food"), "pieno"],
      [F.verde, T("grammi di nutriente \\(\\sum_i g_{ij} x_i\\)", "grams of nutrient \\(\\sum_i g_{ij} x_i\\)"), "pieno"],
      [F.blu, T("intervalli ammessi \\([c_i, d_i]\\) e \\([a_j, b_j]\\)", "allowed ranges \\([c_i, d_i]\\) and \\([a_j, b_j]\\)"), ""]]; },
    letture(R, v, st, C) { return R.stato !== "ottimo" ? stato(R, C) : ""; },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      return SOL().blocco(valore(T("Costo minimo", "Minimum cost"), R, T("€ al mese", "€ per month")), [
        SOL().tab(T("Chili al mese di ogni alimento", "Kilograms per month of each food"), [T("alimento \\(i\\)", "food \\(i\\)"), ...R.x.map((q, i) => String(i + 1))],
          [[`${tl("x", "i")} (kg)`, ...R.x.map((q) => z(q, 3))]]),
      ], NULLO());
    },
    domanda: T("Porta \\(a_2\\) a 30: l'alimento 3 sale a \\(19/6\\) kg e il costo a \\(64/3\\) €. Porta \\(a_3\\) a 40: la dieta diventa inammissibile.",
      "Set \\(a_2\\) to 30: food 3 rises to \\(19/6\\) kg and the cost to \\(64/3\\) €. Set \\(a_3\\) to 40: the diet becomes infeasible."),
    tabella: (R, DV) => DIM(["s", R.D.w.length], ["r", R.D.a.length]) + DV.tab(T("Alimenti", "Foods"), ["\\(i\\)", T("\\(w_i\\) (€/kg)", "\\(w_i\\) (€/kg)"), "\\(c_i\\) (kg)", "\\(d_i\\) (kg)"],
      R.D.w.map((w, i) => [String(i + 1), DV.t(w), DV.t(R.D.c[i]), DV.t(R.D.d[i])])) + DV.tab(T("Nutrienti", "Nutrients"), ["\\(j\\)", "\\(a_j\\) (g)", "\\(b_j\\) (g)"],
      R.D.a.map((q, j) => [String(j + 1), DV.t(q), DV.t(R.D.b[j])])),
  };

  // ================================================================ 4.7 dieta per più classi
  const D04 = { w: [5, 8, 6], g: [[6, 2], [2, 1], [2, 6]], a: [[20, 10], [10, 20]], b: [[40, 20], [20, 40]], c: [1, 1, 0], d: [5, 4, 10] };
  const vDietaClassi = {
    etichetta: T("Dieta per più classi", "Diet for several classes"),
    cursori: [
      { nome: "a_{11}", min: 0, max: 40, step: 2, val: 20, fmt: (x) => `${nt(x, 0)} ${T("g/mese", "g/month")}`,
        descr: T("grammi minimi del nutriente 1 nella dieta 1", "minimum grams of nutrient 1 in diet 1") },
      { nome: "w_3", min: 1, max: 12, step: 1, val: 6, fmt: (x) => `${nt(x, 0)} €/kg`,
        descr: T("costo di un chilogrammo dell'alimento 3", "cost of one kilogram of food 3") },
    ],
    calcola(v) {
      const D = { w: [5, 8, v[1]], g: D04.g, a: [[v[0], 10], [10, 20]], b: D04.b, c: D04.c.slice(), d: D04.d };
      const vars = [], righe = [], ix = (i, k) => 2 * i + k;
      for (let i = 1; i <= 3; i++) for (let k = 1; k <= 2; k++) vars.push(`x_{${i}${k}}`);
      [[">=", D.a, "\\alpha", T("minimo", "minimum")], ["<=", D.b, "\\beta", T("massimo", "maximum")]].forEach(([rel, L, sim, parola]) => {
        for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) {
          const a = new Array(6).fill(0); for (let i = 0; i < 3; i++) a[ix(i, k)] = D.g[i][j];
          righe.push({ a, rel, b: L[k][j], nome: T(`dieta ${k + 1}, nutriente ${j + 1}, ${parola}`, `diet ${k + 1}, nutrient ${j + 1}, ${parola}`), duale: `${sim}_{${k + 1}${j + 1}}`, unita: "€/g" });
        }
      });
      [[">=", D.c, "\\gamma", T("minimo", "minimum")], ["<=", D.d, "\\delta", T("massimo", "maximum")]].forEach(([rel, L, sim, parola]) => {
        for (let i = 0; i < 3; i++) {
          const a = new Array(6).fill(0); a[ix(i, 0)] = a[ix(i, 1)] = 1;
          righe.push({ a, rel, b: L[i], nome: T(`alimento ${i + 1}, ${parola}`, `food ${i + 1}, ${parola}`), duale: `${sim}_{${i + 1}}`, unita: "€/kg" });
        }
      });
      return risolvi(D, { vars, c: [0, 1, 2].flatMap((i) => [D.w[i], D.w[i]]), senso: "min", righe });
    },
    formula(R, v, st) {
      const is = PER("i", "s"), kn = PER("k", "n"), jr = PER("j", "r");
      const sim = `\\min ~~ \\sum_{i=1}^{s} \\sum_{k=1}^{n} ${st.col("b", "w_i")}\\, x_{ik} & & \\\\
        ${SA()} \\quad \\sum_{i=1}^{s} g_{ij}\\, x_{ik} &\\ge ${st.col("a", "a_{kj}")}, & ${kn},~${jr}, \\\\
        \\sum_{i=1}^{s} g_{ij}\\, x_{ik} &\\le b_{kj}, & ${kn},~${jr}, \\\\
        \\sum_{k=1}^{n} x_{ik} &\\ge c_i, & ${is}, \\\\
        \\sum_{k=1}^{n} x_{ik} &\\le d_i, & ${is}, \\\\
        x_{ik} &\\ge 0, & ${is},~${kn}.`;
      const DV = DVF(), QD = R.D;
      const TABS = DV.tabelle(DV.tab(T("\\(g_{ij}\\) (g per kg)", "\\(g_{ij}\\) (g per kg)"), ["\\(i \\backslash j\\)", "1", "2"], QD.g.map((r, i) => [String(i + 1), ...r.map((x) => DV.t(x, 2))])),
        DV.tab(T("Limiti delle diete (g)", "Bounds of the diets (g)"), ["\\(k\\)", "\\(a_{k1}\\)", "\\(a_{k2}\\)", "\\(b_{k1}\\)", "\\(b_{k2}\\)"], [0, 1].map((k) => [String(k + 1), ...QD.a[k].map((x) => DV.t(x, 2)), ...QD.b[k].map((x) => DV.t(x, 2))])));
      return modello("04", T(`<b>Il problema.</b> Decidiamo quanti chilogrammi di ogni alimento mettere in ognuna delle diete mensili. L'obiettivo è il costo minimo di tutte le diete. I vincoli: in ogni dieta, per ogni nutriente, una quantità minima e una massima; per ogni alimento, sommando le diete, una quantità minima e una massima.` +
        `<br><b>Variabili:</b> \\(x_{ik} \\ge 0\\): chilogrammi di alimento \\(i\\) nella dieta \\(k\\), con \\(i \\in \\{1, \\dots, s\\}\\) e \\(k \\in \\{1, \\dots, n\\}\\).` +
        `<br><b>Dati:</b> \\(n\\): numero di diete mensili; \\(s\\): numero di alimenti; \\(r\\): numero di nutrienti; \\(g_{ij}\\): grammi di nutriente \\(j\\) in un chilogrammo di alimento \\(i\\); \\(w_i\\): costo di un chilogrammo di alimento \\(i\\) (€); \\(a_{kj}\\), \\(b_{kj}\\): grammi minimi e massimi di nutriente \\(j\\) nella dieta \\(k\\); \\(c_i\\), \\(d_i\\): chilogrammi minimi e massimi di alimento \\(i\\) nelle diete insieme; con \\(i \\in \\{1, \\dots, s\\}\\), \\(j \\in \\{1, \\dots, r\\}\\) e \\(k \\in \\{1, \\dots, n\\}\\).` + TABS,
      `<b>The problem.</b> We decide how many kilograms of each food to put in each of the monthly diets. The objective is the minimum cost of all the diets. The constraints: in each diet, for each nutrient, a minimum and a maximum amount; for each food, over all the diets, a minimum and a maximum amount.` +
        `<br><b>Variables:</b> \\(x_{ik} \\ge 0\\): kilograms of food \\(i\\) in diet \\(k\\), with \\(i \\in \\{1, \\dots, s\\}\\) and \\(k \\in \\{1, \\dots, n\\}\\).` +
        `<br><b>Data:</b> \\(n\\): number of monthly diets; \\(s\\): number of foods; \\(r\\): number of nutrients; \\(g_{ij}\\): grams of nutrient \\(j\\) in one kilogram of food \\(i\\); \\(w_i\\): cost of one kilogram of food \\(i\\) (€); \\(a_{kj}\\), \\(b_{kj}\\): minimum and maximum grams of nutrient \\(j\\) in diet \\(k\\); \\(c_i\\), \\(d_i\\): minimum and maximum kilograms of food \\(i\\) over all the diets; with \\(i \\in \\{1, \\dots, s\\}\\), \\(j \\in \\{1, \\dots, r\\}\\) and \\(k \\in \\{1, \\dots, n\\}\\).` + TABS),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessuna coppia di diete ammissibile", "No feasible pair of diets"));
      const F = FIG(), D = R.D, x = R.x, col = [F.teal, F.arancio], b1 = pieno(S);
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 3.6, ya: 0, yb: Math.max(...D.d) * 1.5, titolo: T("Alimenti per dieta x̃(LP)", "Foods by diet x̃(LP)"),
        nx: T("alimento", "food"), ny: T("chilogrammi al mese", "kilograms per month") }), C, { nTx: 0, nTy: 5 });
      for (let i = 0; i < 3; i++) {
        barra(crea, A, i + 1, 0, x[2 * i], 0.5, col[0]); barra(crea, A, i + 1, x[2 * i], x[2 * i] + x[2 * i + 1], 0.5, col[1]);
        baffo(crea, A, i + 1, D.c[i], D.d[i], F.blu);
      }
      categorie(crea, A, [1, 2, 3].map((i) => [i, String(i)]), C);
      legendaIn(crea, A, [[col[0], T("dieta 1", "diet 1"), "barra"], [col[1], T("dieta 2", "diet 2"), "barra"], [F.blu, T("totale in [cᵢ, dᵢ]", "total in [cᵢ, dᵢ]"), "baffo"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("dieta 1: chilogrammi \\(x_{i1}\\) e grammi di nutriente", "diet 1: kilograms \\(x_{i1}\\) and grams of nutrient"), "pieno"],
      [F.arancio, T("dieta 2: chilogrammi \\(x_{i2}\\) e grammi di nutriente", "diet 2: kilograms \\(x_{i2}\\) and grams of nutrient"), "pieno"],
      [F.blu, T("intervalli ammessi \\([c_i, d_i]\\) e \\([a_{kj}, b_{kj}]\\)", "allowed ranges \\([c_i, d_i]\\) and \\([a_{kj}, b_{kj}]\\)"), ""]]; },
    letture(R, v, st, C) { return R.stato !== "ottimo" ? stato(R, C) : ""; },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x;
      return SOL().blocco(valore(T("Costo minimo", "Minimum cost"), R, T("€ al mese", "€ per month"), 4), [
        SOL().tab(T(`Chili ${tl("x", "ik")}`, `Kilograms ${tl("x", "ik")}`),
          [tx("i \\backslash k"), "1", "2", T("totale", "total")], [0, 1, 2].map((i) => [String(i + 1), z(x[2 * i], 4), z(x[2 * i + 1], 4), z(x[2 * i] + x[2 * i + 1], 4)])),
      ], NULLO());
    },
    domanda: T("Porta \\(w_3\\) a 1: la dieta 2 usa solo l'alimento 3. Porta \\(a_{11}\\) a 40: la dieta 1 prende tutti i 5 kg dell'alimento 1 e il costo sale a 93 €.",
      "Set \\(w_3\\) to 1: diet 2 uses food 3 only. Set \\(a_{11}\\) to 40: diet 1 takes all 5 kg of food 1 and the cost rises to 93 €."),
    tabella: (R, DV) => DIM(["n", R.D.a.length], ["s", R.D.w.length], ["r", R.D.g[0].length]) + DV.tab(T("Alimenti", "Foods"), ["\\(i\\)", T("\\(w_i\\) (€/kg)", "\\(w_i\\) (€/kg)"), "\\(c_i\\) (kg)", "\\(d_i\\) (kg)"],
      R.D.w.map((w, i) => [String(i + 1), DV.t(w), DV.t(R.D.c[i]), DV.t(R.D.d[i])])),
  };

  // ================================================================ 4.8 produzione su più periodi con acquisti e stoccaggio
  const D05 = { d: [45, 60, 75, 75], p: 10, u: 15, h: 2, m: [40, 50, 150, 40], l0: 10, ln: 5 };
  const vPiuPeriodi = {
    etichetta: T("Più periodi con acquisti", "Multi-period with purchases"),
    cursori: [
      { nome: "u_t", min: 10, max: 25, step: 1, val: 15, fmt: (x) => `${nt(x, 0)} €/L`,
        descr: T("costo di un litro acquistato, uguale in tutti i giorni", "cost of one liter bought, the same on all days") },
      { nome: "m_3", min: 0, max: 200, step: 2.5, val: 150, fmt: (x) => `${GI.numTxt(x, 1)} L`,   // passi di 2,5: anche soluzioni frazionarie
        descr: T("produzione massima del giorno 3", "maximum production of day 3") },
    ],
    calcola(v) {
      const D = Object.assign({}, D05, { u: v[0], m: [40, 50, v[1], 40] }), nT = 4;
      const vars = [...[1, 2, 3, 4].map((t) => `x_{${t}}`), ...[1, 2, 3, 4].map((t) => `b_{${t}}`), ...[1, 2, 3].map((t) => `s_{${t}}`)], righe = [];
      for (let t = 0; t < nT; t++) {
        const a = new Array(11).fill(0); a[t] = 1; a[4 + t] = 1;
        if (t > 0) a[8 + t - 1] = 1;
        if (t < nT - 1) a[8 + t] = -1;
        const b = D.d[t] - (t === 0 ? D.l0 : 0) + (t === nT - 1 ? D.ln : 0);
        righe.push({ a, rel: "=", b, nome: T(`bilancio del giorno ${t + 1}`, `balance of day ${t + 1}`), duale: `\\mu_{${t + 1}}`, unita: "€/L" });
      }
      for (let t = 0; t < nT; t++) { const a = new Array(11).fill(0); a[t] = 1; righe.push({ a, rel: "<=", b: D.m[t], nome: T(`capacità del giorno ${t + 1}`, `capacity of day ${t + 1}`), duale: `\\pi_{${t + 1}}`, unita: "€/L" }); }
      return risolvi(D, { vars, c: [...new Array(4).fill(D.p), ...new Array(4).fill(D.u), ...new Array(3).fill(D.h)], senso: "min", righe, costante: D.h * D.ln });
    },
    formula(R, v, st) {
      const tn = PER("t", "n"), u = st.col("a", "u_t"), h = "h_t";
      const sim = `h_n\\, \\ell_n + \\min ~~ \\sum_{t=1}^{n} p_t\\, x_t + \\sum_{t=1}^{n} ${u}\\, b_t + \\sum_{t=1}^{n-1} ${h}\\, s_t & & \\\\
        ${SA()} \\quad x_1 + b_1 - s_1 &= d_1 - \\ell_0, & \\\\
        x_t + b_t + s_{t-1} - s_t &= d_t, & \\forall t \\in \\{2, 3, \\dots, n-1\\}, \\\\
        x_n + b_n + s_{n-1} &= d_n + \\ell_n, & \\\\
        x_t &\\le ${st.col("b", "m_t")}, & ${tn}, \\\\
        x_t &\\ge 0, & ${tn}, \\\\
        b_t &\\ge 0, & ${tn}, \\\\
        s_t &\\ge 0, & \\forall t \\in \\{1, 2, \\dots, n-1\\}.`;
      const D = R.D;
      const DV = DVF(), QD = R.D;
      return modello("05", T(`<b>Il problema.</b> Decidiamo quanti litri produrre, quanti acquistare sul mercato e quanti tenere in magazzino ogni giorno. L'obiettivo è il costo minimo di produzione, acquisto e magazzino. I vincoli: ogni giorno la domanda è servita da produzione, acquisti e scorta del giorno prima; la scorta iniziale e quella finale sono fissate; la produzione giornaliera ha un limite.` +
        `<br><b>Variabili:</b> \\(x_t \\ge 0\\): litri prodotti nel giorno \\(t\\); \\(b_t \\ge 0\\): litri acquistati sul mercato nel giorno \\(t\\); con \\(t \\in \\{1, \\dots, n\\}\\); \\(s_t \\ge 0\\): litri in magazzino a fine giorno \\(t\\), con \\(t \\in \\{1, \\dots, n-1\\}\\).` +
        `<br><b>Dati:</b> \\(n\\): numero di giorni; \\(p_t\\), \\(u_t\\): costo di un litro prodotto e di un litro acquistato nel giorno \\(t\\) (€); \\(h_t\\): costo di un litro in magazzino a fine giorno \\(t\\) (€); \\(d_t\\): domanda del giorno \\(t\\) (L); \\(m_t\\): produzione massima del giorno \\(t\\) (L); \\(\\ell_0\\): scorta iniziale (L); \\(\\ell_n\\): scorta che deve restare alla fine (L); con \\(t \\in \\{1, \\dots, n\\}\\). Il termine costante \\(h_n\\, \\ell_n\\) è il costo di mantenimento della scorta finale.`,
      `<b>The problem.</b> We decide how many liters to produce, how many to buy on the market and how many to keep in stock each day. The objective is the minimum cost of production, purchase and storage. The constraints: each day demand is served by production, purchases and the stock of the day before; the initial and final stock are fixed; daily production has a limit.` +
        `<br><b>Variables:</b> \\(x_t \\ge 0\\): liters produced on day \\(t\\); \\(b_t \\ge 0\\): liters bought on the market on day \\(t\\); with \\(t \\in \\{1, \\dots, n\\}\\); \\(s_t \\ge 0\\): liters in stock at the end of day \\(t\\), with \\(t \\in \\{1, \\dots, n-1\\}\\).` +
        `<br><b>Data:</b> \\(n\\): number of days; \\(p_t\\), \\(u_t\\): cost of one liter produced and of one liter bought on day \\(t\\) (€); \\(h_t\\): cost of one liter in stock at the end of day \\(t\\) (€); \\(d_t\\): demand of day \\(t\\) (L); \\(m_t\\): maximum production of day \\(t\\) (L); \\(\\ell_0\\): initial stock (L); \\(\\ell_n\\): stock that must remain at the end (L); with \\(t \\in \\{1, \\dots, n\\}\\). The constant term \\(h_n\\, \\ell_n\\) is the holding cost of the final stock.`),
      sim, numerico(R.P),
      T(`Senza il termine costante \\(h_n\\, \\ell_n = ${n(D.h, 2)} \\cdot ${D.ln} = ${n(D.h * D.ln, 2)}\\), che il valore ottimo qui sotto include.`,
        `Without the constant term \\(h_n\\, \\ell_n = ${n(D.h, 2)} \\cdot ${D.ln} = ${n(D.h * D.ln, 2)}\\), which the optimal value below includes.`));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile", "No feasible plan"));
      const F = FIG(), D = R.D, x = R.x, b1 = pieno(S);
      const top = Math.max(...D.d.map((d, t) => d + (t === 3 ? D.ln : 0)), ...x.slice(0, 4).map((q, t) => q + x[4 + t]), ...D.m.map((m) => Math.min(m, 120))) * 1.5;
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 4.6, ya: 0, yb: top, titolo: T("Produzione e acquisti per giorno (il resto della domanda viene dalla scorta)", "Production and purchases by day (the rest of the demand comes from the stock)"),
        nx: T("giorno", "day"), ny: T("litri", "liters") }), C, { nTx: 0, nTy: 4 });
      for (let t = 0; t < 4; t++) {
        barra(crea, A, t + 1, 0, x[t], 0.5, F.teal); barra(crea, A, t + 1, x[t], x[t] + x[4 + t], 0.5, F.arancio);
        if (D.m[t] <= top) tetto(crea, A, t + 1, D.m[t], 0.7, F.rosso);
        rombo(crea, A, t + 1, D.d[t], F.blu, C);
      }
      categorie(crea, A, [1, 2, 3, 4].map((t) => [t, String(t)]), C);
      legendaIn(crea, A, [[F.teal, T("prodotti x̃(LP)", "produced x̃(LP)"), "barra"], [F.arancio, T("acquistati b̃(LP)", "bought b̃(LP)"), "barra"],
        [F.rosso, T("capacità mₜ", "capacity mₜ"), "tratteggio"], [F.blu, T("domanda dₜ", "demand dₜ"), "rombo"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("litri prodotti \\(x_t\\)", "liters produced \\(x_t\\)"), "pieno"], [F.arancio, T("litri acquistati \\(b_t\\)", "liters bought \\(b_t\\)"), "pieno"],
      [F.rosso, T("capacità produttiva \\(m_t\\)", "production capacity \\(m_t\\)"), "dashed"], [F.blu, T("domanda \\(d_t\\)", "demand \\(d_t\\)"), "punto"],
      [F.verde, T("scorta a fine giorno \\(s_t\\)", "stock at the end of the day \\(s_t\\)"), ""]]; },
    letture(R, v, st, C) { return R.stato !== "ottimo" ? stato(R, C) : ""; },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x, D = R.D;
      return SOL().blocco(valore(T("Costo minimo", "Minimum cost"), R, "€"), [
        SOL().tab(T("Litri prodotti, acquistati e in magazzino", "Liters produced, bought and in stock"),
          [T("giorno \\(t\\)", "day \\(t\\)"), "1", "2", "3", "4"],
          [[tl("x", "t"), ...[0, 1, 2, 3].map((t) => z(x[t]))], [tl("b", "t"), ...[0, 1, 2, 3].map((t) => z(x[4 + t]))],
            [tl("s", "t"), ...[0, 1, 2].map((t) => z(x[8 + t])), `${nt(D.ln)} (\\(\\ell_n\\))`]]),
      ], T("«—»: valore nullo. La scorta finale \\(\\ell_n\\) è un dato.", "«—»: zero value. The final stock \\(\\ell_n\\) is a given."));
    },
    domanda: T("Porta \\(u_t\\) a 12: il giorno 4 compra 40 L invece di produrli il giorno 3. Porta \\(m_3\\) a 0: il giorno 3 compra 75 L.",
      "Set \\(u_t\\) to 12: day 4 buys 40 L instead of producing them on day 3. Set \\(m_3\\) to 0: day 3 buys 75 L."),
    tabella: (R, DV) => DIM(["n", R.D.d.length]) + DV.tab(T("Giorni", "Days"), ["\\(t\\)", "1", "2", "3", "4"],
      [[T("\\(d_t\\) (L)", "\\(d_t\\) (L)"), ...R.D.d.map((x) => DV.t(x))], [T("\\(m_t\\) (L)", "\\(m_t\\) (L)"), ...R.D.m.map((x) => DV.t(x))],
        ["\\(p_t\\) (€)", ...R.D.d.map(() => DV.t(R.D.p))], ["\\(u_t\\) (€)", ...R.D.d.map(() => DV.t(R.D.u))], ["\\(h_t\\) (€)", ...R.D.d.map(() => DV.t(R.D.h))]]) +
      DV.tab(T("Scorte", "Stock"), ["", "L"], [[T("iniziale \\(\\ell_0\\)", "initial \\(\\ell_0\\)"), DV.t(R.D.l0)], [T("finale \\(\\ell_n\\)", "final \\(\\ell_n\\)"), DV.t(R.D.ln)]]),
  };

  // ================================================================ 4.9 scelta dei dolci (metodo grafico)
  const D06 = { a: [50, 75], b: [120, 160], c: [5, 10], s: [8, 9], u: 450, v: 25, m: 120 };
  /** vertici della regione ammissibile di un LP in 2 variabili (righe a x rel b, x >= 0), in ordine */
  function vertici(righe) {
    const L = [...righe.map((r) => [r.a[0], r.a[1], r.b]), [1, 0, 0], [0, 1, 0]];
    const amm = (p) => p[0] >= -1e-7 && p[1] >= -1e-7 && righe.every((r) => {
      const s = r.a[0] * p[0] + r.a[1] * p[1], tol = 1e-7 * (1 + Math.abs(r.b));
      return r.rel === "<=" ? s <= r.b + tol : r.rel === ">=" ? s >= r.b - tol : Math.abs(s - r.b) <= tol;
    });
    const P = [];
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const [a1, b1, c1] = L[i], [a2, b2, c2] = L[j], det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < 1e-12) continue;
      const p = [(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det];
      if (amm(p) && !P.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-7)) P.push(p);
    }
    const cx = P.reduce((s, p) => s + p[0], 0) / (P.length || 1), cy = P.reduce((s, p) => s + p[1], 0) / (P.length || 1);
    return P.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
  }
  /** la retta a1 x1 + a2 x2 = b dentro il riquadro [0, xb] x [0, yb] */
  function segmento(a1, a2, b, xb, yb) {
    const P = [];
    if (Math.abs(a2) > 1e-12) [0, xb].forEach((x) => P.push([x, (b - a1 * x) / a2]));
    if (Math.abs(a1) > 1e-12) [0, yb].forEach((y) => P.push([(b - a2 * y) / a1, y]));
    const Q = P.filter((p) => p[0] >= -1e-9 && p[0] <= xb + 1e-9 && p[1] >= -1e-9 && p[1] <= yb + 1e-9);
    if (Q.length < 2) return null;
    Q.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    return [Q[0], Q[Q.length - 1]];
  }
  const vDolci = {
    etichetta: T("Dolci", "Desserts"),
    cursori: [
      { nome: "u", min: 200, max: 700, step: 10, val: 450, fmt: (x) => `${nt(x, 0)} ${T("calorie", "calories")}`,
        descr: T("calorie massime dei dolci nella giornata", "maximum calories from desserts in the day") },
      { nome: "v", min: 10, max: 40, step: 1, val: 25, fmt: (x) => `${nt(x, 0)} ${T("g di grassi", "g of fat")}`,
        descr: T("grammi massimi di grassi", "maximum grams of fat") },
    ],
    calcola(v) {
      const D = Object.assign({}, D06, { u: v[0], v: v[1], s: D06.s.slice() });
      const righe = [
        { a: D.b.slice(), rel: "<=", b: D.u, nome: T("calorie", "calories"), duale: "\\pi", unita: T("punti/caloria", "points/calorie") },
        { a: D.c.slice(), rel: "<=", b: D.v, nome: T("grassi", "fat"), duale: "\\rho", unita: T("punti/g", "points/g") },
        { a: D.a.slice(), rel: ">=", b: D.m, nome: T("grammi di dolci", "grams of dessert"), duale: "\\mu", unita: T("punti/g", "points/g") },
      ];
      const P = { vars: ["x_{1}", "x_{2}"], c: [D.s[0] * D.a[0], D.s[1] * D.a[1]], senso: "max", righe };
      P.texObj = { 0: `\\overbrace{(${n(D.s[0], 1)} \\cdot ${D.a[0]})}^{=${n(P.c[0], 1)}}\\,x_{1}`, 1: `\\overbrace{(${n(D.s[1], 1)} \\cdot ${D.a[1]})}^{=${n(P.c[1], 1)}}\\,x_{2}` };
      const R = risolvi(D, P);
      R.V = vertici(righe);
      return R;
    },
    formula(R, v, st) {
      const ii = "\\forall i \\in \\{1, 2\\}";
      const sim = `\\max ~~ \\sum_{i=1}^{2} s_i\\, a_i\\, x_i & & \\\\
        ${SA()} \\quad \\sum_{i=1}^{2} b_i\\, x_i &\\le ${st.col("a", "u")}, & \\\\
        \\sum_{i=1}^{2} c_i\\, x_i &\\le ${st.col("b", "v")}, & \\\\
        \\sum_{i=1}^{2} a_i\\, x_i &\\ge m, & \\\\
        x_i &\\ge 0, & ${ii}.`;
      const DV = DVF(), QD = R.D;
      return modello("06", T(`<b>Il problema.</b> Decidiamo quante porzioni di ogni dolce servire. L'obiettivo è il gradimento massimo. I vincoli: un limite alle calorie, un limite ai grassi, una quantità minima di dolci.` +
        `<br><b>Variabili:</b> \\(x_i \\ge 0\\): porzioni del dolce \\(i\\), con \\(i \\in \\{1, 2\\}\\).` +
        `<br><b>Dati:</b> dolce 1: torta di frutta; dolce 2: gelato; \\(a_i\\): peso di una porzione del dolce \\(i\\) (g); \\(b_i\\): calorie di una porzione; \\(c_i\\): grammi di grassi di una porzione; \\(s_i\\): gradimento di un grammo (punti); \\(u\\): calorie massime; \\(v\\): grammi massimi di grassi; \\(m\\): grammi minimi di dolci; con \\(i \\in \\{1, 2\\}\\).`,
      `<b>The problem.</b> We decide how many portions of each dessert to serve. The objective is the maximum taste score. The constraints: a limit on calories, a limit on fat, a minimum amount of dessert.` +
        `<br><b>Variables:</b> \\(x_i \\ge 0\\): portions of dessert \\(i\\), with \\(i \\in \\{1, 2\\}\\).` +
        `<br><b>Data:</b> dessert 1: fruit cake; dessert 2: ice cream; \\(a_i\\): weight of a portion of dessert \\(i\\) (g); \\(b_i\\): calories of a portion; \\(c_i\\): grams of fat in a portion; \\(s_i\\): taste score of one gram (points); \\(u\\): maximum calories; \\(v\\): maximum grams of fat; \\(m\\): minimum grams of dessert; with \\(i \\in \\{1, 2\\}\\).`),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      const F = FIG(), D = R.D, righe = R.P.righe;
      const xs = [...(R.V || []).map((p) => p[0]), D.m / D.a[0]], ys = [...(R.V || []).map((p) => p[1]), D.m / D.a[1]];
      const xb = Math.max(...xs, 1) * 1.3, yb = Math.max(...ys, 1) * 1.45;
      const P = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto, xa: 0, xb, ya: 0, yb,
        titolo: T("Metodo grafico: regione ammissibile e soluzione ottima", "Graphical method: feasible region and optimal solution"),
        nx: T("x₁ porzioni di torta di frutta", "x₁ portions of fruit cake"), ny: T("x₂ porzioni di gelato", "x₂ portions of ice cream") }, C, { nTx: 6, nTy: 5 });
      if (R.V && R.V.length >= 3) M.area(crea, R.V.map((p) => [P.X(p[0]), P.Y(p[1])]), { fillColor: F.teal, fillOpacity: 0.2, strokeColor: F.teal, strokeWidth: 0 });
      const colV = [F.rosso, F.arancio, F.verde];
      righe.forEach((r, k) => {
        const sg = segmento(r.a[0], r.a[1], r.b, xb, yb);
        if (sg) M.linea(crea, P.X(sg[0][0]), P.Y(sg[0][1]), P.X(sg[1][0]), P.Y(sg[1][1]), { strokeColor: colV[k], strokeWidth: 2.2 });
      });
      if (R.stato === "ottimo") {
        const sg = segmento(R.P.c[0], R.P.c[1], R.z, xb, yb);
        if (sg) M.linea(crea, P.X(sg[0][0]), P.Y(sg[0][1]), P.X(sg[1][0]), P.Y(sg[1][1]), { strokeColor: F.blu, strokeWidth: 1.8, dash: 2 });
        M.pallino(crea, P.X(R.x[0]), P.Y(R.x[1]), { size: 6, fillColor: F.arancio, strokeColor: "#ffffff", strokeWidth: 1.5 });   // le coordinate stanno nella legenda (posto fisso)
      } else avviso(crea, S, C, T("Regione ammissibile vuota", "Empty feasible region"));
      legendaIn(crea, P, [[F.rosso, T("calorie: 120 x₁ + 160 x₂ = u", "calories: 120 x₁ + 160 x₂ = u"), "linea"],
        [F.arancio, T("grassi: 5 x₁ + 10 x₂ = v", "fat: 5 x₁ + 10 x₂ = v"), "linea"],
        [F.verde, T("grammi: 50 x₁ + 75 x₂ = m", "grams: 50 x₁ + 75 x₂ = m"), "linea"],
        [F.teal, T("regione ammissibile", "feasible region"), "area"],
        [F.blu, T("retta di livello z(LP)", "level line z(LP)"), "tratteggio"],
        [F.arancio, R.stato === "ottimo" ? T(`x̃(LP) = (${nt(R.x[0], 3)}; ${nt(R.x[1], 3)})`, `x̃(LP) = (${nt(R.x[0], 3)}, ${nt(R.x[1], 3)})`) : T("soluzione ottima", "optimal solution"), "punto"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.rosso, T("vincolo delle calorie", "calorie constraint"), ""], [F.arancio, T("vincolo dei grassi", "fat constraint"), ""],
      [F.verde, T("vincolo dei grammi minimi", "minimum grams constraint"), ""], [F.teal, T("regione ammissibile", "feasible region"), "pieno"],
      [F.blu, T("retta di livello \\(s_1 a_1 x_1 + s_2 a_2 x_2 = z^*\\)", "level line \\(s_1 a_1 x_1 + s_2 a_2 x_2 = z^*\\)"), "dashed"], [F.arancio, T("soluzione ottima", "optimal solution"), "punto"]]; },
    letture(R, v, st, C) { return R.stato !== "ottimo" ? stato(R, C) : ""; },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const D = R.D, x = R.x;
      return SOL().blocco(valore(T("Gradimento massimo", "Maximum taste score"), R, T("punti", "points"), 3), [
        SOL().tab(T("Porzioni di ogni dolce", "Portions of each dessert"), ["", tl("x", "i"), T("grammi", "grams")],
          [[T("torta di frutta", "fruit cake"), z(x[0], 4), z(D.a[0] * x[0], 2)], [T("gelato", "ice cream"), z(x[1], 4), z(D.a[1] * x[1], 2)]]),
      ], NULLO());
    },
    domanda: T("Porta \\(u\\) a 600: si sceglie solo la torta di frutta. Porta \\(v\\) a 31: si sceglie solo il gelato.",
      "Set \\(u\\) to 600: only the fruit cake is chosen. Set \\(v\\) to 31: only the ice cream is chosen."),
    tabella: (R, DV) => DIM([T("dolci", "desserts"), 2]) + DV.tab(T("Dolci", "Desserts"), ["\\(i\\)", "\\(a_i\\) (g)", "\\(b_i\\)", "\\(c_i\\) (g)", T("\\(s_i\\) (punti/g)", "\\(s_i\\) (points/g)")],
      [0, 1].map((i) => [T(["1. torta di frutta", "2. gelato"][i], ["1. fruit cake", "2. ice cream"][i]), DV.t(R.D.a[i]), DV.t(R.D.b[i]), DV.t(R.D.c[i]), DV.t(R.D.s[i])])) +
      DV.tab(T("Limiti", "Limits"), ["", ""], [[T("calorie massime \\(u\\)", "maximum calories \\(u\\)"), DV.t(R.D.u)], [T("grassi massimi \\(v\\) (g)", "maximum fat \\(v\\) (g)"), DV.t(R.D.v)],
        [T("dolci minimi \\(m\\) (g)", "minimum dessert \\(m\\) (g)"), DV.t(R.D.m)]]),
  };

  // ================================================================ 4.10 produzione e stoccaggio di torte di frutta
  const D07 = { d: [10, 20, 30, 20], c: [10, 20, 30, 40], l0: 5, m: 30, k: 10 };
  const vTorte = {
    etichetta: T("Torte di frutta", "Fruit cakes"),
    cursori: [
      { nome: "m", min: 15, max: 40, step: 0.5, val: 30, fmt: (x) => `${GI.numTxt(x, 1)} ${T("kg/giorno", "kg/day")}`,   // passi di 0,5: anche soluzioni frazionarie
        descr: T("produzione massima al giorno", "maximum production per day") },
      { nome: "k", min: 0, max: 20, step: 0.5, val: 10, fmt: (x) => `${GI.numTxt(x, 1)} kg`,
        descr: T("capacità del magazzino a fine giorno", "storage capacity at the end of the day") },
    ],
    calcola(v) {
      const D = Object.assign({}, D07, { m: v[0], k: v[1] });
      D.h = D.c.map((c) => c / 10);
      const vars = [...[1, 2, 3, 4].map((t) => `x_{${t}}`), ...[1, 2, 3].map((t) => `s_{${t}}`)], righe = [];
      for (let t = 0; t < 4; t++) {
        const a = new Array(7).fill(0); a[t] = 1;
        if (t > 0) a[4 + t - 1] = 1;
        if (t < 3) a[4 + t] = -1;
        righe.push({ a, rel: "=", b: D.d[t] - (t === 0 ? D.l0 : 0), rhsTex: t === 0 ? `${D.d[0]}-${D.l0}` : undefined,
          nome: T(`bilancio del giorno ${t + 1}`, `balance of day ${t + 1}`), duale: `\\mu_{${t + 1}}`, unita: "€/kg" });
      }
      for (let t = 0; t < 4; t++) { const a = new Array(7).fill(0); a[t] = 1; righe.push({ a, rel: "<=", b: D.m, nome: T(`produzione del giorno ${t + 1}`, `production of day ${t + 1}`), duale: `\\pi_{${t + 1}}`, unita: "€/kg" }); }
      for (let t = 0; t < 3; t++) { const a = new Array(7).fill(0); a[4 + t] = 1; righe.push({ a, rel: "<=", b: D.k, nome: T(`magazzino a fine giorno ${t + 1}`, `storage at the end of day ${t + 1}`), duale: `\\varrho_{${t + 1}}`, unita: "€/kg" }); }
      return risolvi(D, { vars, c: [...D.c, ...D.h.slice(0, 3)], senso: "min", righe });
    },
    formula(R, v, st) {
      const l0 = "\\ell_0";
      const sim = `\\min ~~ \\sum_{t=1}^{4} c_t\\, x_t + \\sum_{t=1}^{3} h_t\\, s_t & & \\\\
        ${SA()} \\quad x_1 - s_1 &= d_1 - ${l0}, & \\\\
        s_{t-1} + x_t - s_t &= d_t, & \\forall t \\in \\{2, 3\\}, \\\\
        s_3 + x_4 &= d_4, & \\\\
        x_t &\\le ${st.col("a", "m")}, & \\forall t \\in \\{1, 2, 3, 4\\}, \\\\
        s_t &\\le ${st.col("b", "k")}, & \\forall t \\in \\{1, 2, 3\\}, \\\\
        x_t &\\ge 0, & \\forall t \\in \\{1, 2, 3, 4\\}, \\\\
        s_t &\\ge 0, & \\forall t \\in \\{1, 2, 3\\}.`;
      const DV = DVF(), QD = R.D;
      return modello("07", T(`<b>Il problema.</b> Decidiamo quanti chilogrammi di torta di frutta produrre ogni giorno e quanti tenerne in magazzino a fine giorno. L'obiettivo è il costo minimo di produzione e magazzino. I vincoli: ogni giorno la domanda è servita dalla produzione e dalla scorta del giorno prima; la produzione giornaliera e il magazzino hanno un limite.` +
        `<br><b>Variabili:</b> \\(x_t \\ge 0\\): chilogrammi di torta prodotti nel giorno \\(t\\), con \\(t \\in \\{1, 2, 3, 4\\}\\); \\(s_t \\ge 0\\): chilogrammi in magazzino a fine giorno \\(t\\), con \\(t \\in \\{1, 2, 3\\}\\).` +
        `<br><b>Dati:</b> \\(d_t\\): domanda del giorno \\(t\\) (kg); \\(c_t\\): costo di un chilogrammo prodotto nel giorno \\(t\\) (€); \\(h_t\\): costo di un chilogrammo in magazzino a fine giorno \\(t\\), il 10% di \\(c_t\\) (€); \\(\\ell_0\\): scorta iniziale (kg); \\(m\\): produzione massima al giorno (kg); \\(k\\): capacità del magazzino (kg); con \\(t \\in \\{1, 2, 3, 4\\}\\).`,
      `<b>The problem.</b> We decide how many kilograms of fruit cake to produce each day and how many to keep in stock at the end of the day. The objective is the minimum cost of production and storage. The constraints: each day demand is served by production and by the stock of the day before; daily production and the warehouse have a limit.` +
        `<br><b>Variables:</b> \\(x_t \\ge 0\\): kilograms of cake produced on day \\(t\\), with \\(t \\in \\{1, 2, 3, 4\\}\\); \\(s_t \\ge 0\\): kilograms in stock at the end of day \\(t\\), with \\(t \\in \\{1, 2, 3\\}\\).` +
        `<br><b>Data:</b> \\(d_t\\): demand of day \\(t\\) (kg); \\(c_t\\): cost of one kilogram produced on day \\(t\\) (€); \\(h_t\\): cost of one kilogram in stock at the end of day \\(t\\), 10% of \\(c_t\\) (€); \\(\\ell_0\\): initial stock (kg); \\(m\\): maximum production per day (kg); \\(k\\): warehouse capacity (kg); with \\(t \\in \\{1, 2, 3, 4\\}\\).`),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile con questa capacità", "No feasible plan with this capacity"));
      const F = FIG(), D = R.D, x = R.x, b1 = pieno(S);
      const top = Math.max(D.m, ...D.d, ...x.slice(0, 4)) * 1.5;
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 4.6, ya: 0, yb: top, titolo: T("Produzione ottima x̃(LP) per giorno", "Optimal production x̃(LP) by day"), nx: T("giorno", "day"), ny: T("chilogrammi", "kilograms") }), C, { nTx: 0, nTy: 4 });
      for (let t = 0; t < 4; t++) { barra(crea, A, t + 1, 0, x[t], 0.5, F.teal); tetto(crea, A, t + 1, D.m, 0.7, F.rosso); rombo(crea, A, t + 1, D.d[t], F.blu, C); }
      categorie(crea, A, [1, 2, 3, 4].map((t) => [t, String(t)]), C);
      legendaIn(crea, A, [[F.teal, T("prodotti x̃(LP)", "produced x̃(LP)"), "barra"], [F.rosso, T("produzione massima m", "maximum production m"), "tratteggio"], [F.blu, T("domanda dₜ", "demand dₜ"), "rombo"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("chilogrammi prodotti \\(x_t\\)", "kilograms produced \\(x_t\\)"), "pieno"], [F.blu, T("domanda \\(d_t\\)", "demand \\(d_t\\)"), "punto"],
      [F.verde, T("scorta a fine giorno \\(s_t\\)", "stock at the end of the day \\(s_t\\)"), ""], [F.rosso, T("produzione massima \\(m\\) e capacità del magazzino \\(k\\)", "maximum production \\(m\\) and storage capacity \\(k\\)"), "dashed"]]; },
    letture(R, v, st, C) { return R.stato !== "ottimo" ? stato(R, C) : ""; },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x;
      return SOL().blocco(valore(T("Costo minimo", "Minimum cost"), R, "€"), [
        SOL().tab(T("Chili prodotti e in magazzino", "Kilograms produced and in stock"),
          [T("giorno \\(t\\)", "day \\(t\\)"), "1", "2", "3", "4"],
          [[tl("x", "t"), ...[0, 1, 2, 3].map((t) => z(x[t]))], [tl("s", "t"), ...[0, 1, 2].map((t) => z(x[4 + t])), ""]]),
      ], NULLO());
    },
    domanda: T("Porta \\(k\\) a 20: il giorno 4 non produce più e il costo scende a 1670 €. Porta \\(m\\) a 18: il problema diventa inammissibile.",
      "Set \\(k\\) to 20: day 4 no longer produces and the cost drops to 1670 €. Set \\(m\\) to 18: the problem becomes infeasible."),
    tabella: (R, DV) => DIM([T("giorni", "days"), R.D.d.length]) + DV.tab(T("Giorni", "Days"), ["\\(t\\)", "1", "2", "3", "4"],
      [["\\(d_t\\) (kg)", ...R.D.d.map((x) => DV.t(x))], ["\\(c_t\\) (€)", ...R.D.c.map((x) => DV.t(x))], ["\\(h_t\\) (€)", ...R.D.h.map((x, t) => (t < 3 ? DV.t(x) : "—"))]]) +
      DV.tab(T("Limiti", "Limits"), ["", "kg"], [[T("scorta iniziale \\(\\ell_0\\)", "initial stock \\(\\ell_0\\)"), DV.t(R.D.l0)], [T("produzione massima \\(m\\)", "maximum production \\(m\\)"), DV.t(R.D.m)],
        [T("magazzino \\(k\\)", "warehouse \\(k\\)"), DV.t(R.D.k)]]),
  };

  // ================================================================ 4.11 miscelazione di petrolio greggio
  const D08 = { w: [5000, 10000], q: [10, 5], g: [8, 6], p: [25, 20] };
  const vRaffineria = {
    etichetta: T("Raffineria", "Refinery"),
    cursori: [
      { nome: "w_1", min: 1000, max: 10000, step: 250, val: 5000, fmt: (x) => `${mig(x)} ${T("barili", "barrels")}`,
        descr: T("barili disponibili di greggio di tipo 1", "barrels available of type 1 crude") },
      { nome: "p_2", min: 10, max: 30, step: 1, val: 20, fmt: (x) => `${nt(x, 0)} $/${T("barile", "barrel")}`,
        descr: T("prezzo di un barile di gasolio da riscaldamento", "price of a barrel of heating oil") },
    ],
    calcola(v) {
      const D = { w: [v[0], D08.w[1]], q: D08.q, g: D08.g.slice(), p: [D08.p[0], v[1]] };
      const bar = T("$/barile", "$/barrel"), pt = T("$/(punto · barile)", "$/(point · barrel)");
      const righe = [
        { a: [1, 0, 1, 0], rel: "<=", b: D.w[0], nome: T("greggio di tipo 1", "type 1 crude"), duale: "\\pi_{1}", unita: bar },
        { a: [0, 1, 0, 1], rel: "<=", b: D.w[1], nome: T("greggio di tipo 2", "type 2 crude"), duale: "\\pi_{2}", unita: bar },
        { a: [D.q[0] - D.g[0], D.q[1] - D.g[0], 0, 0], rel: ">=", b: 0, nome: T("qualità della benzina", "gasoline quality"), duale: "\\rho_{1}", unita: pt },
        { a: [0, 0, D.q[0] - D.g[1], D.q[1] - D.g[1]], rel: ">=", b: 0, nome: T("qualità del gasolio", "heating oil quality"), duale: "\\rho_{2}", unita: pt },
      ];
      return risolvi(D, { vars: ["x_{1}", "x_{2}", "y_{1}", "y_{2}"], c: [D.p[0], D.p[0], D.p[1], D.p[1]], senso: "max", righe });
    },
    formula(R, v, st) {
      const ii = "\\forall i \\in \\{1, 2\\}";
      const sim = `\\max ~~ p_1\\, (x_1 + x_2) + ${st.col("b", "p_2")}\\, (y_1 + y_2) & & \\\\
        ${SA()} \\quad x_i + y_i &\\le ${st.col("a", "w_i")}, & ${ii}, \\\\
        (q_1 - g_1)\\, x_1 + (q_2 - g_1)\\, x_2 &\\ge 0, & \\\\
        (q_1 - g_2)\\, y_1 + (q_2 - g_2)\\, y_2 &\\ge 0, & \\\\
        x_i,~ y_i &\\ge 0, & ${ii}.`;
      const DV = DVF(), QD = R.D;
      return modello("08", T(`<b>Il problema.</b> Decidiamo quanti barili di ogni tipo di greggio usare per la benzina e per il gasolio da riscaldamento. L'obiettivo è il ricavo massimo. I vincoli: disponibilità di ogni greggio e qualità media minima della miscela per ogni prodotto. Il rapporto \\((q_1 x_1 + q_2 x_2)/(x_1 + x_2) \\ge g_1\\) diventa lineare moltiplicando per \\(x_1 + x_2\\).` +
        `<br><b>Variabili:</b> \\(x_i \\ge 0\\): barili di greggio \\(i\\) usati per la benzina; \\(y_i \\ge 0\\): barili di greggio \\(i\\) usati per il gasolio; con \\(i \\in \\{1, 2\\}\\).` +
        `<br><b>Dati:</b> \\(p_1\\), \\(p_2\\): prezzo di un barile di benzina e di gasolio da riscaldamento ($); \\(w_i\\): barili disponibili di greggio \\(i\\); \\(q_i\\): livello di qualità del greggio \\(i\\); \\(g_1\\), \\(g_2\\): qualità media minima della benzina e del gasolio; con \\(i \\in \\{1, 2\\}\\).`,
      `<b>The problem.</b> We decide how many barrels of each type of crude oil to use for gasoline and for heating oil. The objective is the maximum revenue. The constraints: availability of each crude and minimum average quality of the blend for each product. The ratio \\((q_1 x_1 + q_2 x_2)/(x_1 + x_2) \\ge g_1\\) becomes linear after multiplying by \\(x_1 + x_2\\).` +
        `<br><b>Variables:</b> \\(x_i \\ge 0\\): barrels of crude \\(i\\) used for gasoline; \\(y_i \\ge 0\\): barrels of crude \\(i\\) used for heating oil; with \\(i \\in \\{1, 2\\}\\).` +
        `<br><b>Data:</b> \\(p_1\\), \\(p_2\\): price of a barrel of gasoline and of heating oil ($); \\(w_i\\): barrels available of crude \\(i\\); \\(q_i\\): quality level of crude \\(i\\); \\(g_1\\), \\(g_2\\): minimum average quality of gasoline and of heating oil; with \\(i \\in \\{1, 2\\}\\).`),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile", "No feasible plan"));
      const F = FIG(), D = R.D, x = R.x, b1 = pieno(S);
      const tw = D.w[0] + D.w[1], top = tw * 1.35;   // scala fissata dai dati: le barre non arrivano oltre w₁ + w₂
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 2.6, ya: 0, yb: top, titolo: T("Miscele ottime x̃(LP) e ỹ(LP)", "Optimal blends x̃(LP) and ỹ(LP)"),
        ny: T("barili", "barrels") }), C, { nTx: 0, nTy: 5 });
      // la qualità della miscela sempre alla stessa altezza, sopra w₁ + w₂
      [[x[0], x[1]], [x[2], x[3]]].forEach(([u1, u2], k) => {
        barra(crea, A, k + 1, 0, u1, 0.55, F.teal); barra(crea, A, k + 1, u1, u1 + u2, 0.55, F.arancio);
        const tot = u1 + u2;
        if (tot > 1e-6) M.scritta(crea, A.X(k + 1), A.Y(tw * 1.04), T(`qualità ${nt((D.q[0] * u1 + D.q[1] * u2) / tot, 2)} (min ${nt(D.g[k], 1)})`, `quality ${nt((D.q[0] * u1 + D.q[1] * u2) / tot, 2)} (min ${nt(D.g[k], 1)})`),
          { anchorY: "bottom", fontSize: 11.5, strokeColor: C.testo });
      });
      categorie(crea, A, [[1, T("benzina", "gasoline")], [2, T("gasolio", "heating oil")]], C);
      legendaIn(crea, A, [[F.teal, T("greggio 1 (qualità 10)", "crude 1 (quality 10)"), "barra"], [F.arancio, T("greggio 2 (qualità 5)", "crude 2 (quality 5)"), "barra"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("barili di greggio di tipo 1 (\\(x_1\\), \\(y_1\\))", "barrels of type 1 crude (\\(x_1\\), \\(y_1\\))"), "pieno"],
      [F.arancio, T("barili di greggio di tipo 2 (\\(x_2\\), \\(y_2\\))", "barrels of type 2 crude (\\(x_2\\), \\(y_2\\))"), "pieno"],
      [F.rosso, T("barili disponibili \\(w_i\\)", "barrels available \\(w_i\\)"), "dashed"]]; },
    letture(R, v, st, C) { return R.stato !== "ottimo" ? stato(R, C) : ""; },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x, zm = (q) => (Math.abs(q) < 0.5 ? "—" : mig(q));
      return SOL().blocco(valore(T("Ricavo massimo", "Maximum revenue"), R, "$", 0), [
        SOL().tab(T("Barili di greggio \\(i\\) per prodotto", "Barrels of crude \\(i\\) by product"),
          ["", T("greggio 1", "crude 1"), T("greggio 2", "crude 2"), T("totale", "total")],
          [[T(`benzina ${tl("x", "i")}`, `gasoline ${tl("x", "i")}`), zm(x[0]), zm(x[1]), zm(x[0] + x[1])], [T(`gasolio ${tl("y", "i")}`, `heating oil ${tl("y", "i")}`), zm(x[2]), zm(x[3]), zm(x[2] + x[3])]]),
      ], NULLO());
    },
    domanda: T("Porta \\(p_2\\) a 26: tutto il greggio va nel gasolio. Porta \\(w_1\\) a 2000: la benzina non si produce più e 2000 barili di greggio 2 restano inutilizzati.",
      "Set \\(p_2\\) to 26: all the crude goes into heating oil. Set \\(w_1\\) to 2000: no gasoline is produced and 2000 barrels of crude 2 stay unused."),
    tabella: (R, DV) => DIM([T("greggi", "crudes"), 2], [T("prodotti", "products"), 2]) + DV.tab(T("Greggi", "Crude oils"), ["\\(i\\)", T("qualità \\(q_i\\)", "quality \\(q_i\\)"), T("\\(w_i\\) (barili)", "\\(w_i\\) (barrels)")],
      [0, 1].map((i) => [String(i + 1), DV.t(R.D.q[i]), DV.f(R.D.w[i]).replace(/\\,/g, " ")])) + DV.tab(T("Prodotti", "Products"), ["", T("prezzo \\(p\\) ($/barile)", "price \\(p\\) ($/barrel)"), T("qualità minima \\(g\\)", "minimum quality \\(g\\)")],
      [[T("benzina", "gasoline"), DV.t(R.D.p[0]), DV.t(R.D.g[0])], [T("gasolio", "heating oil"), DV.t(R.D.p[1]), DV.t(R.D.g[1])]]),
  };

  // ================================================================ 4.12 produzione di tre farmaci
  const D09 = { p: [8, 70, 100], h: [1, 2, 3], k: 4000 };
  const vFarmaci = {
    etichetta: T("Tre farmaci", "Three drugs"),
    cursori: [
      { nome: "p_3", min: 50, max: 200, step: 10, val: 100, fmt: (x) => `${nt(x, 0)} €`,
        descr: T("prezzo di un'unità di farmaco 3", "price of one unit of drug 3") },
      { nome: "p_2", min: 30, max: 150, step: 10, val: 70, fmt: (x) => `${nt(x, 0)} €`,
        descr: T("prezzo di un'unità di farmaco 2", "price of one unit of drug 2") },
    ],
    calcola(v) {
      const D = { p: [8, v[1], v[0]], h: D09.h, k: D09.k };
      const righe = [
        { a: D.h.slice(), rel: "<=", b: D.k, nome: T("ore di lavoro", "working hours"), duale: "\\pi", unita: T("€/ora", "€/hour") },
        { a: [-1, 2, 0], rel: "<=", b: 0, nome: T("farmaco 1 per il farmaco 2", "drug 1 for drug 2"), duale: "\\rho_{1}", unita: T("€/unità", "€/unit") },
        { a: [0, -1, 1], rel: "<=", b: 0, nome: T("farmaco 2 per il farmaco 3", "drug 2 for drug 3"), duale: "\\rho_{2}", unita: T("€/unità", "€/unit") },
      ];
      return risolvi(D, { vars: ["x_{1}", "x_{2}", "x_{3}"], c: [D.p[0], D.p[1] - 2 * D.p[0], D.p[2] - D.p[1]], senso: "max", righe });
    },
    formula(R, v, st) {
      const p2 = st.col("b", "p_2"), p3 = st.col("a", "p_3");
      const sim = `\\max ~~ p_1\\, (x_1 - 2\\, x_2) + ${p2}\\, (x_2 - x_3) + ${p3}\\, x_3 & & \\\\
        ${SA()} \\quad h_1\\, x_1 + h_2\\, x_2 + h_3\\, x_3 &\\le k, & \\\\
        -x_1 + 2\\, x_2 &\\le 0, & \\\\
        -x_2 + x_3 &\\le 0, & \\\\
        x_i &\\ge 0, & \\forall i \\in \\{1, 2, 3\\}.`;
      const DV = DVF(), QD = R.D;
      return modello("09", T(`<b>Il problema.</b> Decidiamo quante unità produrre di ogni farmaco; ogni farmaco, tranne il primo, si produce consumando il farmaco precedente. L'obiettivo è il ricavo massimo delle unità vendute, cioè prodotte e non consumate. I vincoli: le ore di lavoro disponibili e consumi interni non superiori alla produzione.` +
        `<br><b>Variabili:</b> \\(x_i \\ge 0\\): unità prodotte del farmaco \\(i\\), con \\(i \\in \\{1, 2, 3\\}\\); le unità vendute sono \\(x_1 - 2x_2\\), \\(x_2 - x_3\\) e \\(x_3\\).` +
        `<br><b>Dati:</b> \\(p_i\\): prezzo di vendita di un'unità del farmaco \\(i\\) (€); \\(h_i\\): ore di lavoro per unità prodotta; \\(k\\): ore di lavoro disponibili; con \\(i \\in \\{1, 2, 3\\}\\). Un'unità di farmaco 2 consuma 2 unità di farmaco 1; un'unità di farmaco 3 consuma 1 unità di farmaco 2.`,
      `<b>The problem.</b> We decide how many units of each drug to produce; each drug except the first is made by using the previous drug. The objective is the maximum revenue from the units sold, that is produced and not used internally. The constraints: the working hours available and internal use not above production.` +
        `<br><b>Variables:</b> \\(x_i \\ge 0\\): units produced of drug \\(i\\), with \\(i \\in \\{1, 2, 3\\}\\); the units sold are \\(x_1 - 2x_2\\), \\(x_2 - x_3\\) and \\(x_3\\).` +
        `<br><b>Data:</b> \\(p_i\\): selling price of one unit of drug \\(i\\) (€); \\(h_i\\): working hours per unit produced; \\(k\\): working hours available; with \\(i \\in \\{1, 2, 3\\}\\). One unit of drug 2 uses 2 units of drug 1; one unit of drug 3 uses 1 unit of drug 2.`),
      sim, numerico(R.P),
      T("I coefficienti della funzione obiettivo sono \\(p_1\\), \\(p_2 - 2p_1\\) e \\(p_3 - p_2\\).", "The objective function coefficients are \\(p_1\\), \\(p_2 - 2p_1\\) and \\(p_3 - p_2\\)."));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ottimo", "No optimal plan"));
      const F = FIG(), x = R.x, y = [x[0] - 2 * x[1], x[1] - x[2], x[2]].map((q) => (Math.abs(q) < 1e-7 ? 0 : q));
      const top = Math.max(...x, 100) * 1.45;
      const A = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto, xa: 0.4, xb: 3.6, ya: 0, yb: top,
        titolo: T("Unità prodotte x̃(LP) e vendute per farmaco", "Units produced x̃(LP) and sold by drug"), nx: T("farmaco", "drug"), ny: T("unità", "units") }, C, { nTx: 0, nTy: 5 });
      // i valori in una riga fissa sotto il titolo: non saltano quando cambia la soluzione
      for (let i = 0; i < 3; i++) {
        barra(crea, A, i + 1 - 0.17, 0, x[i], 0.32, F.teal); barra(crea, A, i + 1 + 0.17, 0, y[i], 0.32, F.arancio);
        if (x[i] > 1e-6) M.scritta(crea, A.X(i + 1 - 0.17), A.Y1 - 52, mig(x[i]), { anchorY: "bottom", fontSize: 11.5, strokeColor: F.teal });
        if (y[i] > 1e-6) M.scritta(crea, A.X(i + 1 + 0.17), A.Y1 - 52, mig(y[i]), { anchorY: "bottom", fontSize: 11.5, strokeColor: F.arancio });
      }
      categorie(crea, A, [1, 2, 3].map((i) => [i, String(i)]), C);
      legendaIn(crea, A, [[F.teal, T("prodotte x̃(LP)", "produced x̃(LP)"), "barra"], [F.arancio, T("vendute (prodotte meno consumate)", "sold (produced minus used)"), "barra"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("unità prodotte \\(x_i\\)", "units produced \\(x_i\\)"), "pieno"],
      [F.arancio, T("unità vendute \\(x_1 - 2x_2\\), \\(x_2 - x_3\\), \\(x_3\\)", "units sold \\(x_1 - 2x_2\\), \\(x_2 - x_3\\), \\(x_3\\)"), "pieno"]]; },
    letture(R, v, st, C) { return R.stato !== "ottimo" ? stato(R, C) : ""; },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x, y = [x[0] - 2 * x[1], x[1] - x[2], x[2]], zm = (q) => (Math.abs(q) < 0.5 ? "—" : mig(q));
      return SOL().blocco(valore(T("Ricavo massimo", "Maximum revenue"), R, "€", 0), [
        SOL().tab(T("Unità prodotte e vendute", "Units produced and sold"),
          [T("farmaco \\(i\\)", "drug \\(i\\)"), "1", "2", "3"],
          [[tl("x", "i"), ...x.map(zm)], [T("vendute", "sold"), ...y.map((q) => zm(Math.max(0, q)))]]),
      ], NULLO());
    },
    domanda: T("Porta \\(p_3\\) a 130: si vende solo il farmaco 3, non più il 2. Porta \\(p_2\\) a 50: accade lo stesso.",
      "Set \\(p_3\\) to 130: only drug 3 is sold, no longer drug 2. Set \\(p_2\\) to 50: the same happens."),
    tabella: (R, DV) => DIM([T("farmaci", "drugs"), 3]) + DV.tab(T("Farmaci", "Drugs"), ["\\(i\\)", T("\\(p_i\\) (€/unità)", "\\(p_i\\) (€/unit)"), T("\\(h_i\\) (ore/unità)", "\\(h_i\\) (hours/unit)")],
      [0, 1, 2].map((i) => [String(i + 1), DV.t(R.D.p[i]), DV.t(R.D.h[i])])) +
      DV.tab(T("Ore", "Hours"), ["", ""], [[T("ore disponibili \\(k\\)", "hours available \\(k\\)"), DV.t(R.D.k)]]),
  };

  // ================================================================ registrazione: un'app per modello
  /** la tabella dei dati della voce (vc.tabella) va subito dopo la riga «Dati:» */
  const conTabella = (vc) => {
    const f = vc.formula;
    vc.formula = function (R, v, st) {
      const h = f.call(vc, R, v, st);
      if (typeof h !== "string" || !vc.tabella || !R || !R.D) return h;
      const tab = `<div class="plm-dati"><p class="plm-dati-tit">${T("Dati", "Data")}</p>${vc.tabella(R, DVF())}</div>`;
      return h.replace('<p class="plm-cap">', `${tab}<p class="plm-cap">`);
    };
    return vc;
  };
  const APP = {
    "pl-straordinario": [T("Produzione in orario ordinario e in straordinario", "Production with regular time and overtime"), "straordinario", vStraordinario],
    "pl-dieta": [T("Pianificazione della dieta", "Diet planning"), "dieta", vDieta],
    "pl-dieta-classi": [T("Dieta per più classi", "Diet for several classes"), "dieta-classi", vDietaClassi],
    "pl-piu-periodi": [T("Produzione su più periodi con acquisti", "Multi-period production with purchases"), "piu-periodi", vPiuPeriodi],
    "pl-dolci": [T("Scelta dei dolci", "Choice of desserts"), "dolci", vDolci],
    "pl-torte": [T("Produzione e stoccaggio di torte", "Production and storage of cakes"), "torte", vTorte],
    "pl-raffineria": [T("Miscelazione in una raffineria", "Blending in a refinery"), "raffineria", vRaffineria],
    "pl-farmaci": [T("Produzione di tre farmaci", "Production of three drugs"), "farmaci", vFarmaci],
  };
  const VOCI = {};
  Object.entries(APP).forEach(([ricetta, [titolo, chiave, vc]]) => {
    VOCI[chiave] = conTabella(vc);
    window.GI_RICETTE[ricetta] = () => {
      if (window.GI_PL_SOL) window.GI_PL_SOL.voce(vc);
      return O.ricettaVoci({ titolo }, { [chiave]: vc });
    };
  });
  // per i test in node / in console
  window.GI_PL_TECNICHE = VOCI;
})();
