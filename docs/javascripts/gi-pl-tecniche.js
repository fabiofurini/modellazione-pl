/* Laboratorio di «Modellazione PL / LP Modelling»: i modelli svolti del capitolo 4 «Tecniche di modellazione»
 * (pagine tecniche-modelli-01 … 09, EN techniques-models-01 … 09), un'app per modello (regola di Fabio, 26/11/2026).
 *
 *   pl-straordinario (4.4) · pl-dieta (4.6) · pl-dieta-classi (4.7) · pl-piu-periodi (4.8) · pl-dolci (4.9)
 *   pl-torte (4.10) · pl-raffineria (4.11) · pl-farmaci (4.12)
 *   Il trasporto (4.5) è l'app «pl-trasporto» (gi-pl-trasporto.js).
 *
 * Ogni app: due cursori sui dati principali, il simplesso in JS (GI_OTT.lp, gi-ott.js) risolve l'LP e l'app mostra
 * il problema, i dati con la tabella, il modello simbolico, la figura, la soluzione ottima con i prezzi ombra e, in
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
  /** la riga dei prezzi ombra sotto il problema: che cosa misura ogni variabile duale, con le unità */
  const DUALI = (s) => `</p><p class="plm-testo"><b>${T("Prezzi ombra.", "Shadow prices.")}</b> ${s}`;
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
  /** tabella dei prezzi ombra: tutti i vincoli se sono pochi, altrimenti solo quelli con prezzo ombra non nullo */
  function tabOmbra(R) {
    const P = R.P, tutti = P.righe.length <= 8;
    const righe = [];
    P.righe.forEach((r, i) => {
      if (!tutti && !nz(R.y[i])) return;
      const usato = `${fq(R.lhs[i])} ${r.rel === "=" ? "=" : r.rel === "<=" ? "≤" : "≥"} ${fq(r.b)}`;
      righe.push([r.nome, tx(r.duale), `${tx(n(R.y[i], 4))} ${r.unita}`, usato]);
    });
    const nulli = P.righe.length - righe.length;
    return M.tab([T("vincolo", "constraint"), T("duale", "dual"), T("prezzo ombra", "shadow price"), T("valore e limite", "value and bound")], righe) +
      (!tutti ? `<div style="margin-top:.2em">${T(`Gli altri ${nulli} vincoli hanno prezzo ombra nullo.`, `The other ${nulli} constraints have a zero shadow price.`)}</div>` : "");
  }
  const valore = (testo, R, unita, cifre = 2) => `${testo}: <b>${fq(R.z, cifre)} ${unita}</b>`;
  /** il blocco «Soluzione ottima» sotto il grafico (GI_PL_SOL, gi-pl-app.js): valore ottimo e variabili; a destra prezzi ombra e note */
  const SOL = () => window.GI_PL_SOL;
  const z = (x, c = 2) => (FRx() ? FRx().z(x, c) : SOL().z(x, c));
  const NULLO = () => T("«—»: valore nullo.", "«—»: zero value.");
  const nota = (s) => `<div style="margin-top:.3em">${s}</div>`;

  // ================================================================ 4.4 produzione in orario ordinario e in straordinario
  const D01 = { w: [35, 30, 25], a: [3, 2, 2], b: [6, 4, 4], c: [5, 3, 3], d: 30, e: 20 };
  const vStraordinario = {
    etichetta: T("Ordinario e straordinario", "Regular time and overtime"),
    cursori: [
      { nome: "d", min: 0, max: 90, step: 5, val: 30, fmt: (x) => `${nt(x, 0)} ${T("L/giorno", "L/day")}`,
        descr: T("litri trattabili al giorno in orario ordinario, per tutti i prodotti insieme", "liters that can be treated per day in regular time, all products together") },
      { nome: "e", min: 0, max: 90, step: 5, val: 20, fmt: (x) => `${nt(x, 0)} ${T("L/giorno", "L/day")}`,
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
        `<br><b>Variabili:</b> \\(x_i\\): litri del prodotto \\(i\\) venduti al giorno non trattati; \\(y_i\\): litri trattati in orario ordinario; \\(z_i\\): litri trattati in straordinario.` +
        `<br><b>Dati:</b> \\(r = 3\\): numero di prodotti, indice \\(i\\); \\(a_i\\): profitto di un litro non trattato: \\(${DV.L(QD.a)}\\) €; \\(b_i\\): profitto di un litro trattato in orario ordinario: \\(${DV.L(QD.b)}\\) €; \\(c_i\\): profitto di un litro trattato in straordinario: \\(${DV.L(QD.c)}\\) €; \\(w_i\\): produzione massima del prodotto \\(i\\): \\(${DV.L(QD.w)}\\) L al giorno; \\(d = ${DV.f(QD.d)}\\) L: litri trattabili al giorno in orario ordinario; \\(e = ${DV.f(QD.e)}\\) L: litri trattabili al giorno in straordinario.` +
        DUALI("\\(\\lambda_i\\): profitto in più, in €/L, per un litro in più di produzione massima \\(w_i\\); \\(\\pi\\) e \\(\\varrho\\): lo stesso per un litro in più di capacità \\(d\\) e \\(e\\)."),
      `<b>The problem.</b> We decide how many liters of each product to sell per day untreated, treated in regular time and treated in overtime. The objective is the maximum profit. The constraints: maximum production of each product, treatment capacity in regular time and in overtime, all products together.` +
        `<br><b>Variables:</b> \\(x_i\\): liters of product \\(i\\) sold per day untreated; \\(y_i\\): liters treated in regular time; \\(z_i\\): liters treated in overtime.` +
        `<br><b>Data:</b> \\(r = 3\\): number of products, index \\(i\\); \\(a_i\\): profit of one untreated liter: \\(${DV.L(QD.a)}\\) €; \\(b_i\\): profit of one liter treated in regular time: \\(${DV.L(QD.b)}\\) €; \\(c_i\\): profit of one liter treated in overtime: \\(${DV.L(QD.c)}\\) €; \\(w_i\\): maximum production of product \\(i\\): \\(${DV.L(QD.w)}\\) L per day; \\(d = ${DV.f(QD.d)}\\) L: liters that can be treated per day in regular time; \\(e = ${DV.f(QD.e)}\\) L: liters that can be treated per day in overtime.` +
        DUALI("\\(\\lambda_i\\): extra profit, in €/L, for one more liter of maximum production \\(w_i\\); \\(\\pi\\) and \\(\\varrho\\): the same for one more liter of capacity \\(d\\) and \\(e\\).")),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile", "No feasible plan"));
      const F = FIG(), D = R.D, x = R.x, [b1, b2] = affiancati(S, 0.62);
      const ymax = Math.max(...D.w, D.d, D.e, 10) * 1.5;
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 3.6, ya: 0, yb: ymax, titolo: T("Litri al giorno per prodotto", "Liters per day by product"),
        nx: T("prodotto", "product"), ny: T("litri al giorno", "liters per day") }), C, { nTx: 0, nTy: 5 });
      for (let i = 0; i < 3; i++) {
        let y0 = 0;
        [[x[i], F.grigio], [x[3 + i], F.teal], [x[6 + i], F.arancio]].forEach(([q, col]) => { barra(crea, A, i + 1, y0, y0 + q, 0.5, col); y0 += q; });
        tetto(crea, A, i + 1, D.w[i], 0.7, F.rosso);
      }
      categorie(crea, A, [1, 2, 3].map((i) => [i, String(i)]), C);
      legendaIn(crea, A, [[F.grigio, T("non trattato xᵢ", "untreated xᵢ"), "barra"], [F.teal, T("orario ordinario yᵢ", "regular time yᵢ"), "barra"],
        [F.arancio, T("straordinario zᵢ", "overtime zᵢ"), "barra"], [F.rosso, T("produzione massima wᵢ", "maximum production wᵢ"), "tratteggio"]], C);
      const ord = x[3] + x[4] + x[5], str = x[6] + x[7] + x[8];
      const B = figura(crea, Object.assign(b2, { xa: 0.4, xb: 2.6, ya: 0, yb: ymax, titolo: T("Capacità di trattamento", "Treatment capacity"),
        ny: T("litri al giorno", "liters per day") }), C, { nTx: 0, nTy: 5 });
      barra(crea, B, 1, 0, ord, 0.55, F.teal); barra(crea, B, 2, 0, str, 0.55, F.arancio);
      tetto(crea, B, 1, D.d, 0.75, F.rosso); tetto(crea, B, 2, D.e, 0.75, F.rosso);
      categorie(crea, B, [[1, T("ordinario", "regular")], [2, T("straord.", "overtime")]], C);
      legendaIn(crea, B, [[F.rosso, T("capacità d ed e", "capacity d and e"), "tratteggio"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.grigio, T("litri venduti non trattati \\(x_i\\)", "liters sold untreated \\(x_i\\)"), "pieno"],
      [F.teal, T("litri trattati in orario ordinario \\(y_i\\)", "liters treated in regular time \\(y_i\\)"), "pieno"],
      [F.arancio, T("litri trattati in straordinario \\(z_i\\)", "liters treated in overtime \\(z_i\\)"), "pieno"],
      [F.rosso, T("produzione massima \\(w_i\\) e capacità di trattamento \\(d\\), \\(e\\)", "maximum production \\(w_i\\) and treatment capacities \\(d\\), \\(e\\)"), "dashed"]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return stato(R, C);
      const x = R.x;
      return tabOmbra(R) +
        nota(T("Il prezzo ombra \\(\\pi\\) è il profitto in più per un litro in più di capacità in orario ordinario, finché la base ottima non cambia.",
          "The shadow price \\(\\pi\\) is the extra profit for one more liter of regular-time capacity, as long as the optimal basis does not change."));
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x;
      return SOL().blocco(valore(T("Profitto massimo", "Maximum profit"), R, T("€ al giorno", "€ per day")), [
        SOL().tab(T("Litri al giorno per prodotto", "Liters per day by product"), [T("prodotto \\(i\\)", "product \\(i\\)"), "\\(\\tilde x_i\\)", "\\(\\tilde y_i\\)", "\\(\\tilde z_i\\)", T("totale / \\(w_i\\)", "total / \\(w_i\\)")],
          [0, 1, 2].map((i) => [String(i + 1), z(x[i]), z(x[3 + i]), z(x[6 + i]), `${nt(x[i] + x[3 + i] + x[6 + i])} / ${nt(R.D.w[i])}`])),
      ], NULLO());
    },
    domanda: T("Con \\(d = 70\\) L nessun litro resta non trattato e \\(\\pi\\) scende da 2 a 1 €/L. Con \\(e = 0\\) si vendono 5 L del prodotto 1 non trattati.",
      "With \\(d = 70\\) L no liter stays untreated and \\(\\pi\\) drops from 2 to 1 €/L. With \\(e = 0\\) 5 L of product 1 are sold untreated."),
    tabella: (R, DV) => DV.tab(T("Prodotti", "Products"), [T("prodotto \\(i\\)", "product \\(i\\)"), "\\(a_i\\) (€/L)", "\\(b_i\\) (€/L)", "\\(c_i\\) (€/L)", T("\\(w_i\\) (L al giorno)", "\\(w_i\\) (L per day)")],
      [0, 1, 2].map((i) => [String(i + 1), DV.t(R.D.a[i]), DV.t(R.D.b[i]), DV.t(R.D.c[i]), DV.t(R.D.w[i])])) + DV.tab(T("Capacità di trattamento", "Treatment capacity"), ["", T("L al giorno", "L per day")],
      [[T("orario ordinario \\(d\\)", "regular time \\(d\\)"), DV.t(R.D.d)], [T("straordinario \\(e\\)", "overtime \\(e\\)"), DV.t(R.D.e)]]),
  };

  // ================================================================ 4.6 pianificazione della dieta
  const D03 = { w: [5, 8, 2, 2], g: [[2, 4, 2], [1, 1, 1], [4, 6, 4], [4, 6, 2]], a: [10, 20, 10], b: [40, 60, 50], c: [1, 1, 0, 1], d: [10, 15, 20, 10] };
  const vDieta = {
    etichetta: T("Dieta", "Diet"),
    cursori: [
      { nome: "a_2", min: 0, max: 60, step: 2, val: 20, fmt: (x) => `${nt(x, 0)} ${T("g/mese", "g/month")}`,
        descr: T("grammi minimi del nutriente 2 al mese (massimo \\(b_2 = 60\\))", "minimum grams of nutrient 2 per month (maximum \\(b_2 = 60\\))") },
      { nome: "a_3", min: 0, max: 50, step: 5, val: 10, fmt: (x) => `${nt(x, 0)} ${T("g/mese", "g/month")}`,
        descr: T("grammi minimi del nutriente 3 al mese (massimo \\(b_3 = 50\\))", "minimum grams of nutrient 3 per month (maximum \\(b_3 = 50\\))") },
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
      const TABS = DV.tabelle(DV.tab(T("Contenuto \\(g_{ij}\\) (g per kg): alimento \\(i\\) per riga, nutriente \\(j\\) per colonna", "Content \\(g_{ij}\\) (g per kg): food \\(i\\) by row, nutrient \\(j\\) by column"), ["\\(i \\backslash j\\)", ...QD.g[0].map((q, j) => String(j + 1))], QD.g.map((r, i) => [String(i + 1), ...r.map((x) => DV.t(x, 2))])));
      return modello("03", T(`<b>Il problema.</b> Decidiamo quanti chilogrammi di ogni alimento mettere nella dieta mensile. L'obiettivo è il costo minimo. I vincoli: per ogni nutriente una quantità minima e una massima al mese; per ogni alimento una quantità minima e una massima.` +
        `<br><b>Variabili:</b> \\(x_i\\): chilogrammi dell'alimento \\(i\\) nella dieta mensile.` +
        `<br><b>Dati:</b> \\(s = 4\\): numero di alimenti, indice \\(i\\); \\(r = 3\\): numero di nutrienti, indice \\(j\\); \\(g_{ij}\\): grammi di nutriente \\(j\\) in un chilogrammo di alimento \\(i\\) (tabella qui sotto); \\(w_i\\): costo dell'alimento \\(i\\): \\(${DV.L(QD.w)}\\) € al kg; \\(a_j\\): grammi minimi di nutriente \\(j\\) al mese: \\(${DV.L(QD.a)}\\); \\(b_j\\): grammi massimi di nutriente \\(j\\) al mese: \\(${DV.L(QD.b)}\\); \\(c_i\\): chilogrammi minimi di alimento \\(i\\) al mese: \\(${DV.L(QD.c)}\\); \\(d_i\\): chilogrammi massimi di alimento \\(i\\) al mese: \\(${DV.L(QD.d)}\\).` + TABS +
        DUALI("costo in più per un'unità in più a destra del vincolo: \\(\\alpha_j \\ge 0\\) e \\(\\beta_j \\le 0\\) in €/g per i limiti \\(a_j\\) e \\(b_j\\), \\(\\gamma_i \\ge 0\\) e \\(\\delta_i \\le 0\\) in €/kg per i limiti \\(c_i\\) e \\(d_i\\)."),
      `<b>The problem.</b> We decide how many kilograms of each food to put in the monthly diet. The objective is the minimum cost. The constraints: for each nutrient a minimum and a maximum amount per month; for each food a minimum and a maximum amount.` +
        `<br><b>Variables:</b> \\(x_i\\): kilograms of food \\(i\\) in the monthly diet.` +
        `<br><b>Data:</b> \\(s = 4\\): number of foods, index \\(i\\); \\(r = 3\\): number of nutrients, index \\(j\\); \\(g_{ij}\\): grams of nutrient \\(j\\) in one kilogram of food \\(i\\) (table below); \\(w_i\\): cost of food \\(i\\): \\(${DV.L(QD.w)}\\) € per kg; \\(a_j\\): minimum grams of nutrient \\(j\\) per month: \\(${DV.L(QD.a)}\\); \\(b_j\\): maximum grams of nutrient \\(j\\) per month: \\(${DV.L(QD.b)}\\); \\(c_i\\): minimum kilograms of food \\(i\\) per month: \\(${DV.L(QD.c)}\\); \\(d_i\\): maximum kilograms of food \\(i\\) per month: \\(${DV.L(QD.d)}\\).` + TABS +
        DUALI("extra cost for one more unit on the right-hand side of the constraint: \\(\\alpha_j \\ge 0\\) and \\(\\beta_j \\le 0\\) in €/g for the bounds \\(a_j\\) and \\(b_j\\), \\(\\gamma_i \\ge 0\\) and \\(\\delta_i \\le 0\\) in €/kg for the bounds \\(c_i\\) and \\(d_i\\).")),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessuna dieta ammissibile", "No feasible diet"));
      const F = FIG(), D = R.D, x = R.x, [b1, b2] = affiancati(S, 0.5);
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 4.6, ya: 0, yb: Math.max(...D.d) * 1.45, titolo: T("Alimenti nella dieta", "Foods in the diet"),
        nx: T("alimento", "food"), ny: T("chilogrammi al mese", "kilograms per month") }), C, { nTx: 0, nTy: 5 });
      x.forEach((q, i) => { barra(crea, A, i + 1, 0, q, 0.5, F.teal); baffo(crea, A, i + 1, D.c[i], D.d[i], F.blu); });
      categorie(crea, A, [1, 2, 3, 4].map((i) => [i, String(i)]), C);
      legendaIn(crea, A, [[F.teal, T("kg di alimento xᵢ", "kg of food xᵢ"), "barra"], [F.blu, T("intervallo [cᵢ, dᵢ]", "range [cᵢ, dᵢ]"), "baffo"]], C);
      const B = figura(crea, Object.assign(b2, { xa: 0.4, xb: 3.6, ya: 0, yb: Math.max(...D.b) * 1.45, titolo: T("Nutrienti nella dieta", "Nutrients in the diet"),
        nx: T("nutriente", "nutrient"), ny: T("grammi al mese", "grams per month") }), C, { nTx: 0, nTy: 5 });
      R.lhs.slice(0, 3).forEach((q, j) => { barra(crea, B, j + 1, 0, q, 0.5, F.verde); baffo(crea, B, j + 1, D.a[j], D.b[j], F.blu); });
      categorie(crea, B, [1, 2, 3].map((j) => [j, String(j)]), C);
      legendaIn(crea, B, [[F.verde, T("grammi forniti", "grams supplied"), "barra"], [F.blu, T("intervallo [aⱼ, bⱼ]", "range [aⱼ, bⱼ]"), "baffo"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("chilogrammi \\(x_i\\) di ogni alimento", "kilograms \\(x_i\\) of each food"), "pieno"],
      [F.verde, T("grammi di nutriente \\(\\sum_i g_{ij} x_i\\)", "grams of nutrient \\(\\sum_i g_{ij} x_i\\)"), "pieno"],
      [F.blu, T("intervalli ammessi \\([c_i, d_i]\\) e \\([a_j, b_j]\\)", "allowed ranges \\([c_i, d_i]\\) and \\([a_j, b_j]\\)"), ""]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return stato(R, C);
      return tabOmbra(R) +
        nota(T("\\(\\alpha_j\\) è il costo in più per un grammo in più di fabbisogno minimo del nutriente \\(j\\).", "\\(\\alpha_j\\) is the extra cost for one more gram of minimum requirement of nutrient \\(j\\)."));
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      return SOL().blocco(valore(T("Costo minimo", "Minimum cost"), R, T("€ al mese", "€ per month")), [
        SOL().tab(T("Chili al mese di ogni alimento", "Kilograms per month of each food"), [T("alimento \\(i\\)", "food \\(i\\)"), ...R.x.map((q, i) => String(i + 1))],
          [[T("\\(\\tilde x_i\\) (kg)", "\\(\\tilde x_i\\) (kg)"), ...R.x.map((q) => z(q, 3))], ["\\([c_i, d_i]\\)", ...R.x.map((q, i) => `[${nt(R.D.c[i], 0)}, ${nt(R.D.d[i], 0)}]`)]]),
      ], NULLO());
    },
    domanda: T("Con \\(a_3 = 40\\) g la dieta diventa inammissibile. Con \\(a_2 = 30\\) g l'alimento 3 sale a \\(19/6\\) kg e il costo a \\(64/3\\) €.",
      "With \\(a_3 = 40\\) g the diet becomes infeasible. With \\(a_2 = 30\\) g food 3 rises to \\(19/6\\) kg and the cost to \\(64/3\\) €."),
    tabella: (R, DV) => DV.tab(T("Alimenti", "Foods"), [T("alimento \\(i\\)", "food \\(i\\)"), T("\\(w_i\\) (€ al kg)", "\\(w_i\\) (€ per kg)"), "\\(c_i\\) (kg)", "\\(d_i\\) (kg)"],
      R.D.w.map((w, i) => [String(i + 1), DV.t(w), DV.t(R.D.c[i]), DV.t(R.D.d[i])])) + DV.tab(T("Nutrienti", "Nutrients"), [T("nutriente \\(j\\)", "nutrient \\(j\\)"), "\\(a_j\\) (g)", "\\(b_j\\) (g)"],
      R.D.a.map((q, j) => [String(j + 1), DV.t(q), DV.t(R.D.b[j])])),
  };

  // ================================================================ 4.7 dieta per più classi
  const D04 = { w: [5, 8, 6], g: [[6, 2], [2, 1], [2, 6]], a: [[20, 10], [10, 20]], b: [[40, 20], [20, 40]], c: [1, 1, 0], d: [5, 4, 10] };
  const vDietaClassi = {
    etichetta: T("Dieta per più classi", "Diet for several classes"),
    cursori: [
      { nome: "a_{11}", min: 0, max: 40, step: 2, val: 20, fmt: (x) => `${nt(x, 0)} ${T("g/mese", "g/month")}`,
        descr: T("grammi minimi del nutriente 1 nella dieta 1 (massimo \\(b_{11} = 40\\))", "minimum grams of nutrient 1 in diet 1 (maximum \\(b_{11} = 40\\))") },
      { nome: "w_3", min: 1, max: 12, step: 1, val: 6, fmt: (x) => `${nt(x, 0)} €/kg`,
        descr: T("costo dell'alimento 3 (alimenti 1 e 2: 5 e 8 €/kg)", "cost of food 3 (foods 1 and 2: 5 and 8 €/kg)") },
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
      const TABS = DV.tabelle(DV.tab(T("Contenuto \\(g_{ij}\\) (g per kg): alimento \\(i\\) per riga, nutriente \\(j\\) per colonna", "Content \\(g_{ij}\\) (g per kg): food \\(i\\) by row, nutrient \\(j\\) by column"), ["\\(i \\backslash j\\)", "1", "2"], QD.g.map((r, i) => [String(i + 1), ...r.map((x) => DV.t(x, 2))])),
        DV.tab(T("Limiti \\(a_{kj}\\) e \\(b_{kj}\\) (g): dieta \\(k\\) per riga", "Bounds \\(a_{kj}\\) and \\(b_{kj}\\) (g): diet \\(k\\) by row"), ["\\(k\\)", "\\(a_{k1}\\)", "\\(a_{k2}\\)", "\\(b_{k1}\\)", "\\(b_{k2}\\)"], [0, 1].map((k) => [String(k + 1), ...QD.a[k].map((x) => DV.t(x, 2)), ...QD.b[k].map((x) => DV.t(x, 2))])));
      return modello("04", T(`<b>Il problema.</b> Decidiamo quanti chilogrammi di ogni alimento mettere in ognuna delle diete mensili. L'obiettivo è il costo minimo di tutte le diete. I vincoli: in ogni dieta, per ogni nutriente, una quantità minima e una massima; per ogni alimento, sommando le diete, una quantità minima e una massima.` +
        `<br><b>Variabili:</b> \\(x_{ik}\\): chilogrammi di alimento \\(i\\) nella dieta \\(k\\).` +
        `<br><b>Dati:</b> \\(n = 2\\): numero di diete mensili, indice \\(k\\); \\(s = 3\\): numero di alimenti, indice \\(i\\); \\(r = 2\\): numero di nutrienti, indice \\(j\\); \\(g_{ij}\\): grammi di nutriente \\(j\\) in un chilogrammo di alimento \\(i\\) (tabella qui sotto); \\(w_i\\): costo dell'alimento \\(i\\): \\(${DV.L(QD.w)}\\) € al kg; \\(a_{kj}\\) e \\(b_{kj}\\): grammi minimi e massimi di nutriente \\(j\\) nella dieta \\(k\\) (tabella); \\(c_i\\): chilogrammi minimi di alimento \\(i\\) nelle due diete insieme: \\(${DV.L(QD.c)}\\); \\(d_i\\): chilogrammi massimi: \\(${DV.L(QD.d)}\\).` + TABS +
        DUALI("costo in più per un'unità in più a destra del vincolo: \\(\\alpha_{kj} \\ge 0\\) e \\(\\beta_{kj} \\le 0\\) in €/g per i limiti \\(a_{kj}\\) e \\(b_{kj}\\), \\(\\gamma_i \\ge 0\\) e \\(\\delta_i \\le 0\\) in €/kg per i limiti \\(c_i\\) e \\(d_i\\)."),
      `<b>The problem.</b> We decide how many kilograms of each food to put in each of the monthly diets. The objective is the minimum cost of all the diets. The constraints: in each diet, for each nutrient, a minimum and a maximum amount; for each food, over all the diets, a minimum and a maximum amount.` +
        `<br><b>Variables:</b> \\(x_{ik}\\): kilograms of food \\(i\\) in diet \\(k\\).` +
        `<br><b>Data:</b> \\(n = 2\\): number of monthly diets, index \\(k\\); \\(s = 3\\): number of foods, index \\(i\\); \\(r = 2\\): number of nutrients, index \\(j\\); \\(g_{ij}\\): grams of nutrient \\(j\\) in one kilogram of food \\(i\\) (table below); \\(w_i\\): cost of food \\(i\\): \\(${DV.L(QD.w)}\\) € per kg; \\(a_{kj}\\) and \\(b_{kj}\\): minimum and maximum grams of nutrient \\(j\\) in diet \\(k\\) (table); \\(c_i\\): minimum kilograms of food \\(i\\) over both diets: \\(${DV.L(QD.c)}\\); \\(d_i\\): maximum kilograms: \\(${DV.L(QD.d)}\\).` + TABS +
        DUALI("extra cost for one more unit on the right-hand side of the constraint: \\(\\alpha_{kj} \\ge 0\\) and \\(\\beta_{kj} \\le 0\\) in €/g for the bounds \\(a_{kj}\\) and \\(b_{kj}\\), \\(\\gamma_i \\ge 0\\) and \\(\\delta_i \\le 0\\) in €/kg for the bounds \\(c_i\\) and \\(d_i\\).")),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessuna coppia di diete ammissibile", "No feasible pair of diets"));
      const F = FIG(), D = R.D, x = R.x, col = [F.teal, F.arancio], [b1, b2] = affiancati(S, 0.45);
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 3.6, ya: 0, yb: Math.max(...D.d) * 1.5, titolo: T("Alimenti per dieta", "Foods by diet"),
        nx: T("alimento", "food"), ny: T("chilogrammi al mese", "kilograms per month") }), C, { nTx: 0, nTy: 5 });
      for (let i = 0; i < 3; i++) {
        barra(crea, A, i + 1, 0, x[2 * i], 0.5, col[0]); barra(crea, A, i + 1, x[2 * i], x[2 * i] + x[2 * i + 1], 0.5, col[1]);
        baffo(crea, A, i + 1, D.c[i], D.d[i], F.blu);
      }
      categorie(crea, A, [1, 2, 3].map((i) => [i, String(i)]), C);
      legendaIn(crea, A, [[col[0], T("dieta 1", "diet 1"), "barra"], [col[1], T("dieta 2", "diet 2"), "barra"], [F.blu, T("totale in [cᵢ, dᵢ]", "total in [cᵢ, dᵢ]"), "baffo"]], C);
      const pos = [1, 2, 3.5, 4.5];
      const B = figura(crea, Object.assign(b2, { xa: 0.3, xb: 5.2, ya: 0, yb: 40 * 1.5, titolo: T("Nutrienti per dieta", "Nutrients by diet"),
        nx: T("dieta k, nutriente j", "diet k, nutrient j"), ny: T("grammi al mese", "grams per month") }), C, { nTx: 0, nTy: 5 });
      [0, 1, 2, 3].forEach((q) => {
        const k = q >> 1, j = q & 1;
        barra(crea, B, pos[q], 0, R.lhs[q], 0.6, col[k]);
        baffo(crea, B, pos[q], D.a[k][j], D.b[k][j], F.blu);
      });
      categorie(crea, B, [0, 1, 2, 3].map((q) => [pos[q], `${(q >> 1) + 1}, ${(q & 1) + 1}`]), C);
      legendaIn(crea, B, [[F.blu, T("intervallo [aₖⱼ, bₖⱼ]", "range [aₖⱼ, bₖⱼ]"), "baffo"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("dieta 1: chilogrammi \\(x_{i1}\\) e grammi di nutriente", "diet 1: kilograms \\(x_{i1}\\) and grams of nutrient"), "pieno"],
      [F.arancio, T("dieta 2: chilogrammi \\(x_{i2}\\) e grammi di nutriente", "diet 2: kilograms \\(x_{i2}\\) and grams of nutrient"), "pieno"],
      [F.blu, T("intervalli ammessi \\([c_i, d_i]\\) e \\([a_{kj}, b_{kj}]\\)", "allowed ranges \\([c_i, d_i]\\) and \\([a_{kj}, b_{kj}]\\)"), ""]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return stato(R, C);
      const x = R.x;
      return tabOmbra(R);
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x;
      return SOL().blocco(valore(T("Costo minimo", "Minimum cost"), R, T("€ al mese", "€ per month"), 4), [
        SOL().tab(T("Chili \\(\\tilde x_{ik}\\) dell'alimento \\(i\\) nella dieta \\(k\\)", "Kilograms \\(\\tilde x_{ik}\\) of food \\(i\\) in diet \\(k\\)"),
          [tx("i \\backslash k"), "1", "2", T("totale", "total")], [0, 1, 2].map((i) => [String(i + 1), z(x[2 * i], 4), z(x[2 * i + 1], 4), z(x[2 * i] + x[2 * i + 1], 4)])),
      ], NULLO());
    },
    domanda: T("Con \\(w_3 = 1\\) € la dieta 2 usa solo l'alimento 3. Con \\(a_{11} = 40\\) g la dieta 1 prende tutti i 5 kg dell'alimento 1 e il costo sale a 93 €.",
      "With \\(w_3 = 1\\) € diet 2 uses food 3 only. With \\(a_{11} = 40\\) g diet 1 takes all 5 kg of food 1 and the cost rises to 93 €."),
    tabella: (R, DV) => DV.tab(T("Alimenti", "Foods"), [T("alimento \\(i\\)", "food \\(i\\)"), T("\\(w_i\\) (€ al kg)", "\\(w_i\\) (€ per kg)"), "\\(c_i\\) (kg)", "\\(d_i\\) (kg)"],
      R.D.w.map((w, i) => [String(i + 1), DV.t(w), DV.t(R.D.c[i]), DV.t(R.D.d[i])])),
  };

  // ================================================================ 4.8 produzione su più periodi con acquisti e stoccaggio
  const D05 = { d: [45, 60, 75, 75], p: 10, u: 15, h: 2, m: [40, 50, 150, 40], l0: 10, ln: 5 };
  const vPiuPeriodi = {
    etichetta: T("Più periodi con acquisti", "Multi-period with purchases"),
    cursori: [
      { nome: "u_t", min: 10, max: 25, step: 1, val: 15, fmt: (x) => `${nt(x, 0)} €/L`,
        descr: T("costo di un litro acquistato, uguale nei 4 giorni (produzione: 10 €/L)", "cost of one liter bought, the same in the 4 days (production: 10 €/L)") },
      { nome: "m_3", min: 0, max: 200, step: 10, val: 150, fmt: (x) => `${nt(x, 0)} L`,
        descr: T("capacità produttiva del giorno 3 (giorni 1, 2, 4: 40, 50, 40 L)", "production capacity of day 3 (days 1, 2, 4: 40, 50, 40 L)") },
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
        `<br><b>Variabili:</b> \\(x_t\\): litri prodotti nel giorno \\(t\\); \\(b_t\\): litri acquistati sul mercato nel giorno \\(t\\); \\(s_t\\): litri in magazzino a fine giorno \\(t\\).` +
        `<br><b>Dati:</b> \\(n = 4\\): numero di giorni, indice \\(t\\); \\(p_t = ${DV.f(QD.p)}\\) €: costo di un litro prodotto, uguale tutti i giorni; \\(u_t = ${DV.f(QD.u)}\\) €: costo di un litro acquistato, uguale tutti i giorni; \\(h_t = ${DV.f(QD.h)}\\) €: costo di un litro tenuto in magazzino a fine giorno, uguale tutti i giorni; \\(d_t\\): domanda del giorno \\(t\\): \\(${DV.L(QD.d)}\\) L; \\(\\ell_0 = ${QD.l0}\\) L: scorta all'inizio; \\(\\ell_n = ${QD.ln}\\) L: scorta che deve restare alla fine; \\(m_t\\): produzione massima del giorno \\(t\\): \\(${DV.L(QD.m)}\\) L. Il termine costante \\(h_n\\, \\ell_n\\) è il costo di mantenimento della scorta finale.` +
        DUALI("\\(\\mu_t\\): costo in più, in €/L, per un litro in più di domanda nel giorno \\(t\\); \\(\\pi_t \\le 0\\): variazione del costo, in €/L, per un litro in più di capacità \\(m_t\\)."),
      `<b>The problem.</b> We decide how many liters to produce, how many to buy on the market and how many to keep in stock each day. The objective is the minimum cost of production, purchase and storage. The constraints: each day demand is served by production, purchases and the stock of the day before; the initial and final stock are fixed; daily production has a limit.` +
        `<br><b>Variables:</b> \\(x_t\\): liters produced on day \\(t\\); \\(b_t\\): liters bought on the market on day \\(t\\); \\(s_t\\): liters in stock at the end of day \\(t\\).` +
        `<br><b>Data:</b> \\(n = 4\\): number of days, index \\(t\\); \\(p_t = ${DV.f(QD.p)}\\) €: cost of one liter produced, the same every day; \\(u_t = ${DV.f(QD.u)}\\) €: cost of one liter bought, the same every day; \\(h_t = ${DV.f(QD.h)}\\) €: cost of one liter kept in stock at the end of the day, the same every day; \\(d_t\\): demand of day \\(t\\): \\(${DV.L(QD.d)}\\) L; \\(\\ell_0 = ${QD.l0}\\) L: stock at the start; \\(\\ell_n = ${QD.ln}\\) L: stock that must remain at the end; \\(m_t\\): maximum production of day \\(t\\): \\(${DV.L(QD.m)}\\) L. The constant term \\(h_n\\, \\ell_n\\) is the holding cost of the final stock.` +
        DUALI("\\(\\mu_t\\): extra cost, in €/L, for one more liter of demand on day \\(t\\); \\(\\pi_t \\le 0\\): change of the cost, in €/L, for one more liter of capacity \\(m_t\\).")),
      sim, numerico(R.P),
      T(`Senza il termine costante \\(h_n\\, \\ell_n = ${n(D.h, 2)} \\cdot ${D.ln} = ${n(D.h * D.ln, 2)}\\), che il valore ottimo qui sotto include.`,
        `Without the constant term \\(h_n\\, \\ell_n = ${n(D.h, 2)} \\cdot ${D.ln} = ${n(D.h * D.ln, 2)}\\), which the optimal value below includes.`));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile", "No feasible plan"));
      const F = FIG(), D = R.D, x = R.x, [b1, b2] = sovrapposti(S, 0.6);
      const top = Math.max(...D.d.map((d, t) => d + (t === 3 ? D.ln : 0)), ...x.slice(0, 4).map((q, t) => q + x[4 + t]), ...D.m.map((m) => Math.min(m, 120))) * 1.5;
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 4.6, ya: 0, yb: top, titolo: T("Produzione e acquisti per giorno (il resto della domanda viene dalla scorta)", "Production and purchases by day (the rest of the demand comes from the stock)"),
        ny: T("litri", "liters") }), C, { nTx: 0, nTy: 4 });
      for (let t = 0; t < 4; t++) {
        barra(crea, A, t + 1, 0, x[t], 0.5, F.teal); barra(crea, A, t + 1, x[t], x[t] + x[4 + t], 0.5, F.arancio);
        if (D.m[t] <= top) tetto(crea, A, t + 1, D.m[t], 0.7, F.rosso);
        rombo(crea, A, t + 1, D.d[t], F.blu, C);
      }
      categorie(crea, A, [1, 2, 3, 4].map((t) => [t, String(t)]), C);
      legendaIn(crea, A, [[F.teal, T("prodotti xₜ", "produced xₜ"), "barra"], [F.arancio, T("acquistati bₜ", "bought bₜ"), "barra"],
        [F.rosso, T("capacità mₜ", "capacity mₜ"), "tratteggio"], [F.blu, T("domanda dₜ", "demand dₜ"), "rombo"]], C);
      const sc = [D.l0, x[8], x[9], x[10], D.ln], smax = Math.max(10, ...sc) * 1.45;
      const B = figura(crea, Object.assign(b2, { xa: -0.4, xb: 4.6, ya: 0, yb: smax, titolo: T("Scorta a fine giorno (giorno 0: scorta iniziale)", "Stock at the end of the day (day 0: initial stock)"),
        nx: T("giorno", "day"), ny: T("litri", "liters") }), C, { nTx: 0, nTy: 3 });
      lineaPunti(crea, B, [0, 1, 2, 3, 4], sc, F.verde);
      categorie(crea, B, [0, 1, 2, 3, 4].map((t) => [t, String(t)]), C);
      legendaIn(crea, B, [[F.verde, T("scorta sₜ (s₀ = ℓ₀, s₄ = ℓₙ)", "stock sₜ (s₀ = ℓ₀, s₄ = ℓₙ)"), "lineaPunti"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("litri prodotti \\(x_t\\)", "liters produced \\(x_t\\)"), "pieno"], [F.arancio, T("litri acquistati \\(b_t\\)", "liters bought \\(b_t\\)"), "pieno"],
      [F.rosso, T("capacità produttiva \\(m_t\\)", "production capacity \\(m_t\\)"), "dashed"], [F.blu, T("domanda \\(d_t\\)", "demand \\(d_t\\)"), "punto"],
      [F.verde, T("scorta a fine giorno \\(s_t\\)", "stock at the end of the day \\(s_t\\)"), ""]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return stato(R, C);
      const x = R.x, D = R.D;
      return tabOmbra(R) +
        nota(T("\\(\\mu_t\\) è il costo del modo più economico di procurare un litro in più nel giorno \\(t\\): produrlo dove c'è capacità e tenerlo in magazzino, oppure comprarlo.",
          "\\(\\mu_t\\) is the cost of the cheapest way to obtain one more liter on day \\(t\\): producing it where there is capacity and keeping it in stock, or buying it."));
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x, D = R.D;
      return SOL().blocco(valore(T("Costo minimo", "Minimum cost"), R, "€"), [
        SOL().tab(T("Litri prodotti \\(\\tilde x_t\\), acquistati \\(\\tilde b_t\\) e in magazzino \\(\\tilde s_t\\) alla fine del giorno \\(t\\)", "Liters produced \\(\\tilde x_t\\), bought \\(\\tilde b_t\\) and in stock \\(\\tilde s_t\\) at the end of day \\(t\\)"),
          [T("giorno \\(t\\)", "day \\(t\\)"), "1", "2", "3", "4"],
          [["\\(\\tilde x_t\\)", ...[0, 1, 2, 3].map((t) => z(x[t]))], ["\\(\\tilde b_t\\)", ...[0, 1, 2, 3].map((t) => z(x[4 + t]))],
            ["\\(\\tilde s_t\\)", ...[0, 1, 2].map((t) => z(x[8 + t])), `${nt(D.ln)} (\\(\\ell_n\\))`]]),
      ], T("«—»: valore nullo. La scorta finale \\(\\ell_n\\) è un dato.", "«—»: zero value. The final stock \\(\\ell_n\\) is a given."));
    },
    domanda: T("Con \\(u_t = 12\\) € il giorno 4 compra 40 L invece di produrli il giorno 3. Con \\(m_3 = 0\\) L il giorno 3 compra 75 L.",
      "With \\(u_t = 12\\) € day 4 buys 40 L instead of producing them on day 3. With \\(m_3 = 0\\) L day 3 buys 75 L."),
    tabella: (R, DV) => DV.tab(T("Giorni", "Days"), [T("giorno \\(t\\)", "day \\(t\\)"), "1", "2", "3", "4"],
      [[T("\\(d_t\\) (L)", "\\(d_t\\) (L)"), ...R.D.d.map((x) => DV.t(x))], [T("\\(m_t\\) (L)", "\\(m_t\\) (L)"), ...R.D.m.map((x) => DV.t(x))]]),
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
        `<br><b>Variabili:</b> \\(x_i\\): porzioni del dolce \\(i\\).` +
        `<br><b>Dati:</b> \\(i = 1, 2\\): i due dolci, torta di frutta (1) e gelato (2); \\(a_i\\): peso di una porzione: \\(${DV.L(QD.a)}\\) g; \\(b_i\\): calorie di una porzione: \\(${DV.L(QD.b)}\\); \\(c_i\\): grammi di grassi di una porzione: \\(${DV.L(QD.c)}\\); \\(s_i\\): gradimento di un grammo: \\(${DV.L(QD.s)}\\) punti; \\(u = ${DV.f(QD.u)}\\): calorie massime; \\(v = ${DV.f(QD.v)}\\): grammi massimi di grassi; \\(m = ${DV.f(QD.m)}\\): grammi minimi di dolci.` +
        DUALI("gradimento in più per un'unità in più a destra del vincolo: \\(\\pi\\) in punti per caloria, \\(\\rho\\) in punti per grammo di grassi, \\(\\mu \\le 0\\) in punti per grammo di dolci richiesto."),
      `<b>The problem.</b> We decide how many portions of each dessert to serve. The objective is the maximum taste score. The constraints: a limit on calories, a limit on fat, a minimum amount of dessert.` +
        `<br><b>Variables:</b> \\(x_i\\): portions of dessert \\(i\\).` +
        `<br><b>Data:</b> \\(i = 1, 2\\): the two desserts, fruit cake (1) and ice cream (2); \\(a_i\\): weight of a portion: \\(${DV.L(QD.a)}\\) g; \\(b_i\\): calories of a portion: \\(${DV.L(QD.b)}\\); \\(c_i\\): grams of fat in a portion: \\(${DV.L(QD.c)}\\); \\(s_i\\): taste score of one gram: \\(${DV.L(QD.s)}\\) points; \\(u = ${DV.f(QD.u)}\\): maximum calories; \\(v = ${DV.f(QD.v)}\\): maximum grams of fat; \\(m = ${DV.f(QD.m)}\\): minimum grams of dessert.` +
        DUALI("extra taste score for one more unit on the right-hand side of the constraint: \\(\\pi\\) in points per calorie, \\(\\rho\\) in points per gram of fat, \\(\\mu \\le 0\\) in points per gram of dessert required.")),
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
        M.pallino(crea, P.X(R.x[0]), P.Y(R.x[1]), { size: 6, fillColor: F.arancio, strokeColor: "#ffffff", strokeWidth: 1.5 });
        M.scritta(crea, P.X(R.x[0]) + 10, P.Y(R.x[1]) + 12, `(${nt(R.x[0], 3)}; ${nt(R.x[1], 3)})`, { anchorX: "left", fontSize: 12, strokeColor: F.arancio, cssStyle: "font-weight:700" });
      } else avviso(crea, S, C, T("Regione ammissibile vuota", "Empty feasible region"));
      legendaIn(crea, P, [[F.rosso, T("calorie: 120 x₁ + 160 x₂ = u", "calories: 120 x₁ + 160 x₂ = u"), "linea"],
        [F.arancio, T("grassi: 5 x₁ + 10 x₂ = v", "fat: 5 x₁ + 10 x₂ = v"), "linea"],
        [F.verde, T("grammi: 50 x₁ + 75 x₂ = m", "grams: 50 x₁ + 75 x₂ = m"), "linea"],
        [F.teal, T("regione ammissibile", "feasible region"), "area"],
        [F.blu, T("retta di livello del valore ottimo", "level line of the optimal value"), "tratteggio"],
        [F.arancio, T("soluzione ottima", "optimal solution"), "punto"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.rosso, T("vincolo delle calorie", "calorie constraint"), ""], [F.arancio, T("vincolo dei grassi", "fat constraint"), ""],
      [F.verde, T("vincolo dei grammi minimi", "minimum grams constraint"), ""], [F.teal, T("regione ammissibile", "feasible region"), "pieno"],
      [F.blu, T("retta di livello \\(s_1 a_1 x_1 + s_2 a_2 x_2 = z^*\\)", "level line \\(s_1 a_1 x_1 + s_2 a_2 x_2 = z^*\\)"), "dashed"], [F.arancio, T("soluzione ottima", "optimal solution"), "punto"]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return stato(R, C);
      const D = R.D, x = R.x;
      return tabOmbra(R) +
        nota(T("La soluzione ottima è un vertice della regione ammissibile: lo trova anche il metodo grafico.", "The optimal solution is a vertex of the feasible region: the graphical method finds it too."));
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const D = R.D, x = R.x;
      return SOL().blocco(valore(T("Gradimento massimo", "Maximum taste score"), R, T("punti", "points"), 3), [
        SOL().tab(T("Porzioni \\(\\tilde x_i\\) di ogni dolce", "Portions \\(\\tilde x_i\\) of each dessert"), ["", "\\(\\tilde x_i\\)", T("grammi", "grams")],
          [[T("torta di frutta", "fruit cake"), z(x[0], 4), z(D.a[0] * x[0], 2)], [T("gelato", "ice cream"), z(x[1], 4), z(D.a[1] * x[1], 2)]]),
      ], NULLO());
    },
    domanda: T("Con \\(u = 600\\) calorie si sceglie solo la torta di frutta. Con \\(v = 31\\) g si sceglie solo il gelato.",
      "With \\(u = 600\\) calories only the fruit cake is chosen. With \\(v = 31\\) g only the ice cream is chosen."),
    tabella: (R, DV) => DV.tab(T("Dolci", "Desserts"), [T("dolce \\(i\\)", "dessert \\(i\\)"), "\\(a_i\\) (g)", "\\(b_i\\)", "\\(c_i\\) (g)", T("\\(s_i\\) (punti/g)", "\\(s_i\\) (points/g)")],
      [0, 1].map((i) => [T(["1. torta di frutta", "2. gelato"][i], ["1. fruit cake", "2. ice cream"][i]), DV.t(R.D.a[i]), DV.t(R.D.b[i]), DV.t(R.D.c[i]), DV.t(R.D.s[i])])),
  };

  // ================================================================ 4.10 produzione e stoccaggio di torte di frutta
  const D07 = { d: [10, 20, 30, 20], c: [10, 20, 30, 40], l0: 5, m: 30, k: 10 };
  const vTorte = {
    etichetta: T("Torte di frutta", "Fruit cakes"),
    cursori: [
      { nome: "m", min: 15, max: 40, step: 1, val: 30, fmt: (x) => `${nt(x, 0)} ${T("kg/giorno", "kg/day")}`,
        descr: T("produzione massima al giorno", "maximum production per day") },
      { nome: "k", min: 0, max: 20, step: 1, val: 10, fmt: (x) => `${nt(x, 0)} kg`,
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
        `<br><b>Variabili:</b> \\(x_t\\): chilogrammi di torta prodotti nel giorno \\(t\\); \\(s_t\\): chilogrammi in magazzino a fine giorno \\(t\\).` +
        `<br><b>Dati:</b> \\(t = 1, \\dots, 4\\): i 4 giorni; \\(d_t\\): domanda del giorno \\(t\\): \\(${DV.L(QD.d)}\\) kg; \\(c_t\\): costo di un chilogrammo prodotto: \\(${DV.L(QD.c)}\\) €; \\(h_t\\): costo di un chilogrammo in magazzino a fine giorno, il 10% di \\(c_t\\): \\(${DV.L(QD.h.slice(0, 3))}\\) € (\\(t = 1, 2, 3\\)); \\(\\ell_0 = ${DV.f(QD.l0)}\\) kg: scorta iniziale; \\(m = ${DV.f(QD.m)}\\) kg: produzione massima giornaliera; \\(k = ${DV.f(QD.k)}\\) kg: capacità del magazzino.` +
        DUALI("\\(\\mu_t\\): costo in più, in €/kg, per un chilogrammo in più di domanda nel giorno \\(t\\); \\(\\pi_t \\le 0\\) e \\(\\varrho_t \\le 0\\): variazione del costo, in €/kg, per un chilogrammo in più di produzione massima e di capacità del magazzino in quel giorno."),
      `<b>The problem.</b> We decide how many kilograms of fruit cake to produce each day and how many to keep in stock at the end of the day. The objective is the minimum cost of production and storage. The constraints: each day demand is served by production and by the stock of the day before; daily production and the warehouse have a limit.` +
        `<br><b>Variables:</b> \\(x_t\\): kilograms of cake produced on day \\(t\\); \\(s_t\\): kilograms in stock at the end of day \\(t\\).` +
        `<br><b>Data:</b> \\(t = 1, \\dots, 4\\): the 4 days; \\(d_t\\): demand of day \\(t\\): \\(${DV.L(QD.d)}\\) kg; \\(c_t\\): cost of one kilogram produced: \\(${DV.L(QD.c)}\\) €; \\(h_t\\): cost of one kilogram in stock at the end of the day, 10% of \\(c_t\\): \\(${DV.L(QD.h.slice(0, 3))}\\) € (\\(t = 1, 2, 3\\)); \\(\\ell_0 = ${DV.f(QD.l0)}\\) kg: initial stock; \\(m = ${DV.f(QD.m)}\\) kg: maximum daily production; \\(k = ${DV.f(QD.k)}\\) kg: warehouse capacity.` +
        DUALI("\\(\\mu_t\\): extra cost, in €/kg, for one more kilogram of demand on day \\(t\\); \\(\\pi_t \\le 0\\) and \\(\\varrho_t \\le 0\\): change of the cost, in €/kg, for one more kilogram of maximum production and of storage capacity on that day.")),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile con questa capacità", "No feasible plan with this capacity"));
      const F = FIG(), D = R.D, x = R.x, [b1, b2] = sovrapposti(S, 0.58);
      const top = Math.max(D.m, ...D.d, ...x.slice(0, 4)) * 1.5;
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 4.6, ya: 0, yb: top, titolo: T("Produzione per giorno", "Production by day"), ny: T("chilogrammi", "kilograms") }), C, { nTx: 0, nTy: 4 });
      for (let t = 0; t < 4; t++) { barra(crea, A, t + 1, 0, x[t], 0.5, F.teal); tetto(crea, A, t + 1, D.m, 0.7, F.rosso); rombo(crea, A, t + 1, D.d[t], F.blu, C); }
      categorie(crea, A, [1, 2, 3, 4].map((t) => [t, String(t)]), C);
      legendaIn(crea, A, [[F.teal, T("prodotti xₜ", "produced xₜ"), "barra"], [F.rosso, T("produzione massima m", "maximum production m"), "tratteggio"], [F.blu, T("domanda dₜ", "demand dₜ"), "rombo"]], C);
      const sc = [D.l0, x[4], x[5], x[6], 0], smax = Math.max(D.k, ...sc, 5) * 1.5;
      const B = figura(crea, Object.assign(b2, { xa: -0.4, xb: 4.6, ya: 0, yb: smax, titolo: T("Scorta a fine giorno (giorno 0: scorta iniziale)", "Stock at the end of the day (day 0: initial stock)"),
        nx: T("giorno", "day"), ny: T("chilogrammi", "kilograms") }), C, { nTx: 0, nTy: 3 });
      M.linea(crea, B.X(0.6), B.Y(D.k), B.X(3.4), B.Y(D.k), { strokeColor: F.rosso, strokeWidth: 2, dash: 2 });
      lineaPunti(crea, B, [0, 1, 2, 3, 4], sc, F.verde);
      categorie(crea, B, [0, 1, 2, 3, 4].map((t) => [t, String(t)]), C);
      legendaIn(crea, B, [[F.verde, T("scorta sₜ (s₀ = ℓ₀)", "stock sₜ (s₀ = ℓ₀)"), "lineaPunti"], [F.rosso, T("capacità del magazzino k", "storage capacity k"), "tratteggio"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("chilogrammi prodotti \\(x_t\\)", "kilograms produced \\(x_t\\)"), "pieno"], [F.blu, T("domanda \\(d_t\\)", "demand \\(d_t\\)"), "punto"],
      [F.verde, T("scorta a fine giorno \\(s_t\\)", "stock at the end of the day \\(s_t\\)"), ""], [F.rosso, T("produzione massima \\(m\\) e capacità del magazzino \\(k\\)", "maximum production \\(m\\) and storage capacity \\(k\\)"), "dashed"]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return stato(R, C);
      const x = R.x;
      return tabOmbra(R) +
        nota(T("Il costo di produzione cresce di giorno in giorno: conviene produrre prima e tenere a magazzino, finché la capacità \\(k\\) lo permette.",
          "The production cost grows day by day: it pays to produce earlier and keep the cakes in stock, as far as the capacity \\(k\\) allows."));
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x;
      return SOL().blocco(valore(T("Costo minimo", "Minimum cost"), R, "€"), [
        SOL().tab(T("Chili di torte prodotti \\(\\tilde x_t\\) e in magazzino \\(\\tilde s_t\\) alla fine del giorno \\(t\\)", "Kilograms of cakes produced \\(\\tilde x_t\\) and in stock \\(\\tilde s_t\\) at the end of day \\(t\\)"),
          [T("giorno \\(t\\)", "day \\(t\\)"), "1", "2", "3", "4"],
          [["\\(\\tilde x_t\\)", ...[0, 1, 2, 3].map((t) => z(x[t]))], ["\\(\\tilde s_t\\)", ...[0, 1, 2].map((t) => z(x[4 + t])), ""]]),
      ], NULLO());
    },
    domanda: T("Con \\(k = 20\\) kg il giorno 4 non produce più e il costo scende a 1670 €. Con \\(m = 18\\) kg il problema è inammissibile.",
      "With \\(k = 20\\) kg day 4 no longer produces and the cost drops to 1670 €. With \\(m = 18\\) kg the problem is infeasible."),
    tabella: (R, DV) => DV.tab(T("Giorni", "Days"), [T("giorno \\(t\\)", "day \\(t\\)"), "1", "2", "3", "4"],
      [["\\(d_t\\) (kg)", ...R.D.d.map((x) => DV.t(x))], ["\\(c_t\\) (€)", ...R.D.c.map((x) => DV.t(x))], ["\\(h_t\\) (€)", ...R.D.h.map((x, t) => (t < 3 ? DV.t(x) : "—"))]]),
  };

  // ================================================================ 4.11 miscelazione di petrolio greggio
  const D08 = { w: [5000, 10000], q: [10, 5], g: [8, 6], p: [25, 20] };
  const vRaffineria = {
    etichetta: T("Raffineria", "Refinery"),
    cursori: [
      { nome: "w_1", min: 1000, max: 10000, step: 250, val: 5000, fmt: (x) => `${mig(x)} ${T("barili", "barrels")}`,
        descr: T("barili disponibili di greggio di tipo 1, qualità 10 (tipo 2: 10 000 barili, qualità 5)", "barrels available of type 1 crude, quality 10 (type 2: 10 000 barrels, quality 5)") },
      { nome: "p_2", min: 10, max: 30, step: 1, val: 20, fmt: (x) => `${nt(x, 0)} $/${T("barile", "barrel")}`,
        descr: T("prezzo del gasolio da riscaldamento (benzina: 25 $/barile)", "price of heating oil (gasoline: 25 $/barrel)") },
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
        `<br><b>Variabili:</b> \\(x_i\\): barili di greggio \\(i\\) usati per la benzina; \\(y_i\\): barili di greggio \\(i\\) usati per il gasolio.` +
        `<br><b>Dati:</b> \\(i = 1, 2\\): i due tipi di greggio; i due prodotti sono benzina e gasolio da riscaldamento; \\(p_1 = ${DV.f(QD.p[0])}\\) $: prezzo di un barile di benzina; \\(p_2 = ${DV.f(QD.p[1])}\\) $: prezzo di un barile di gasolio; \\(w_i\\): barili disponibili di greggio \\(i\\): \\(${DV.L(QD.w, 0)}\\); \\(q_i\\): livello di qualità del greggio \\(i\\): \\(${DV.L(QD.q)}\\); \\(g_1 = ${DV.f(QD.g[0])}\\) e \\(g_2 = ${DV.f(QD.g[1])}\\): qualità media minima della benzina e del gasolio.` +
        DUALI("\\(\\pi_i\\): ricavo in più, in $/barile, per un barile in più di greggio \\(i\\); \\(\\rho_1 \\le 0\\) e \\(\\rho_2 \\le 0\\): variazione del ricavo, in $ per punto di qualità per barile, per un'unità in più a destra del vincolo di qualità."),
      `<b>The problem.</b> We decide how many barrels of each type of crude oil to use for gasoline and for heating oil. The objective is the maximum revenue. The constraints: availability of each crude and minimum average quality of the blend for each product. The ratio \\((q_1 x_1 + q_2 x_2)/(x_1 + x_2) \\ge g_1\\) becomes linear after multiplying by \\(x_1 + x_2\\).` +
        `<br><b>Variables:</b> \\(x_i\\): barrels of crude \\(i\\) used for gasoline; \\(y_i\\): barrels of crude \\(i\\) used for heating oil.` +
        `<br><b>Data:</b> \\(i = 1, 2\\): the two types of crude oil; the two products are gasoline and heating oil; \\(p_1 = ${DV.f(QD.p[0])}\\) $: price of a barrel of gasoline; \\(p_2 = ${DV.f(QD.p[1])}\\) $: price of a barrel of heating oil; \\(w_i\\): barrels available of crude \\(i\\): \\(${DV.L(QD.w, 0)}\\); \\(q_i\\): quality level of crude \\(i\\): \\(${DV.L(QD.q)}\\); \\(g_1 = ${DV.f(QD.g[0])}\\) and \\(g_2 = ${DV.f(QD.g[1])}\\): minimum average quality of gasoline and of heating oil.` +
        DUALI("\\(\\pi_i\\): extra revenue, in $/barrel, for one more barrel of crude \\(i\\); \\(\\rho_1 \\le 0\\) and \\(\\rho_2 \\le 0\\): change of the revenue, in $ per quality point per barrel, for one more unit on the right-hand side of the quality constraint.")),
      sim, numerico(R.P));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile", "No feasible plan"));
      const F = FIG(), D = R.D, x = R.x, [b1, b2] = affiancati(S, 0.55);
      const top = Math.max(x[0] + x[1], x[2] + x[3], ...D.w, 1000) * 1.5;
      const A = figura(crea, Object.assign(b1, { xa: 0.4, xb: 2.6, ya: 0, yb: top, titolo: T("Composizione delle miscele", "Composition of the blends"),
        ny: T("barili", "barrels") }), C, { nTx: 0, nTy: 5 });
      [[x[0], x[1]], [x[2], x[3]]].forEach(([u1, u2], k) => {
        barra(crea, A, k + 1, 0, u1, 0.55, F.teal); barra(crea, A, k + 1, u1, u1 + u2, 0.55, F.arancio);
        const tot = u1 + u2;
        if (tot > 1e-6) M.scritta(crea, A.X(k + 1), A.Y(tot) + 6, T(`qualità ${nt((D.q[0] * u1 + D.q[1] * u2) / tot, 2)} (min ${nt(D.g[k], 1)})`, `quality ${nt((D.q[0] * u1 + D.q[1] * u2) / tot, 2)} (min ${nt(D.g[k], 1)})`),
          { anchorY: "bottom", fontSize: 11.5, strokeColor: C.testo });
      });
      categorie(crea, A, [[1, T("benzina", "gasoline")], [2, T("gasolio", "heating oil")]], C);
      legendaIn(crea, A, [[F.teal, T("greggio 1 (qualità 10)", "crude 1 (quality 10)"), "barra"], [F.arancio, T("greggio 2 (qualità 5)", "crude 2 (quality 5)"), "barra"]], C);
      const B = figura(crea, Object.assign(b2, { xa: 0.4, xb: 2.6, ya: 0, yb: top, titolo: T("Greggio usato e disponibile", "Crude used and available"), ny: T("barili", "barrels") }), C, { nTx: 0, nTy: 5 });
      barra(crea, B, 1, 0, x[0] + x[2], 0.55, F.teal); barra(crea, B, 2, 0, x[1] + x[3], 0.55, F.arancio);
      tetto(crea, B, 1, D.w[0], 0.75, F.rosso); tetto(crea, B, 2, D.w[1], 0.75, F.rosso);
      categorie(crea, B, [[1, T("greggio 1", "crude 1")], [2, T("greggio 2", "crude 2")]], C);
      legendaIn(crea, B, [[F.rosso, T("disponibilità wᵢ", "availability wᵢ"), "tratteggio"]], C);
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("barili di greggio di tipo 1 (\\(x_1\\), \\(y_1\\))", "barrels of type 1 crude (\\(x_1\\), \\(y_1\\))"), "pieno"],
      [F.arancio, T("barili di greggio di tipo 2 (\\(x_2\\), \\(y_2\\))", "barrels of type 2 crude (\\(x_2\\), \\(y_2\\))"), "pieno"],
      [F.rosso, T("barili disponibili \\(w_i\\)", "barrels available \\(w_i\\)"), "dashed"]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return stato(R, C);
      const x = R.x;
      return tabOmbra(R) +
        nota(T("\\(\\pi_1\\) e \\(\\pi_2\\) sono il ricavo in più per un barile in più di ciascun greggio.", "\\(\\pi_1\\) and \\(\\pi_2\\) are the extra revenue for one more barrel of each crude."));
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x, zm = (q) => (Math.abs(q) < 0.5 ? "—" : mig(q));
      return SOL().blocco(valore(T("Ricavo massimo", "Maximum revenue"), R, "$", 0), [
        SOL().tab(T("Barili di greggio \\(j\\) destinati a benzina (\\(\\tilde x_j\\)) e gasolio (\\(\\tilde y_j\\))", "Barrels of crude \\(j\\) used for gasoline (\\(\\tilde x_j\\)) and heating oil (\\(\\tilde y_j\\))"),
          ["", T("greggio 1", "crude 1"), T("greggio 2", "crude 2"), T("totale", "total")],
          [[T("benzina \\(\\tilde x_j\\)", "gasoline \\(\\tilde x_j\\)"), zm(x[0]), zm(x[1]), zm(x[0] + x[1])], [T("gasolio \\(\\tilde y_j\\)", "heating oil \\(\\tilde y_j\\)"), zm(x[2]), zm(x[3]), zm(x[2] + x[3])]]),
      ], NULLO());
    },
    domanda: T("Con \\(p_2 = 26\\) $ tutto il greggio va nel gasolio. Con \\(w_1 = 2000\\) barili il prezzo ombra \\(\\pi_1\\) sale a 100 $.",
      "With \\(p_2 = 26\\) $ all the crude goes into heating oil. With \\(w_1 = 2000\\) barrels the shadow price \\(\\pi_1\\) rises to 100 $."),
    tabella: (R, DV) => DV.tab(T("Greggi", "Crude oils"), [T("tipo \\(i\\)", "type \\(i\\)"), T("qualità \\(q_i\\)", "quality \\(q_i\\)"), T("\\(w_i\\) (barili)", "\\(w_i\\) (barrels)")],
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
        descr: T("prezzo di un'unità di farmaco 2 (farmaco 1: 8 €)", "price of one unit of drug 2 (drug 1: 8 €)") },
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
        `<br><b>Variabili:</b> \\(x_i\\): unità prodotte del farmaco \\(i\\); le unità vendute sono \\(x_1 - 2x_2\\), \\(x_2 - x_3\\) e \\(x_3\\).` +
        `<br><b>Dati:</b> \\(i = 1, 2, 3\\): i tre farmaci; un'unità di farmaco 2 consuma 2 unità di farmaco 1, un'unità di farmaco 3 consuma 1 unità di farmaco 2; \\(p_i\\): prezzo di vendita del farmaco \\(i\\): \\(${DV.L(QD.p)}\\) € per unità; \\(k = ${DV.f(QD.k, 0)}\\): ore di lavoro disponibili; \\(h_i\\): ore di lavoro per unità prodotta: \\(${DV.L(QD.h)}\\).` +
        DUALI("\\(\\pi\\): ricavo in più, in €/ora, per un'ora di lavoro in più; \\(\\rho_1\\) e \\(\\rho_2\\): ricavo in più, in €/unità, se il farmaco 2 o il farmaco 3 potesse usare un'unità in meno del farmaco precedente."),
      `<b>The problem.</b> We decide how many units of each drug to produce; each drug except the first is made by using the previous drug. The objective is the maximum revenue from the units sold, that is produced and not used internally. The constraints: the working hours available and internal use not above production.` +
        `<br><b>Variables:</b> \\(x_i\\): units produced of drug \\(i\\); the units sold are \\(x_1 - 2x_2\\), \\(x_2 - x_3\\) and \\(x_3\\).` +
        `<br><b>Data:</b> \\(i = 1, 2, 3\\): the three drugs; one unit of drug 2 uses 2 units of drug 1, one unit of drug 3 uses 1 unit of drug 2; \\(p_i\\): selling price of drug \\(i\\): \\(${DV.L(QD.p)}\\) € per unit; \\(k = ${DV.f(QD.k, 0)}\\): working hours available; \\(h_i\\): working hours per unit produced: \\(${DV.L(QD.h)}\\).` +
        DUALI("\\(\\pi\\): extra revenue, in €/hour, for one more working hour; \\(\\rho_1\\) and \\(\\rho_2\\): extra revenue, in €/unit, if drug 2 or drug 3 could use one unit less of the previous drug.")),
      sim, numerico(R.P),
      T("I coefficienti della funzione obiettivo sono \\(p_1\\), \\(p_2 - 2p_1\\) e \\(p_3 - p_2\\).", "The objective function coefficients are \\(p_1\\), \\(p_2 - 2p_1\\) and \\(p_3 - p_2\\)."));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ottimo", "No optimal plan"));
      const F = FIG(), x = R.x, y = [x[0] - 2 * x[1], x[1] - x[2], x[2]].map((q) => (Math.abs(q) < 1e-7 ? 0 : q));
      const top = Math.max(...x, 100) * 1.45;
      const A = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto, xa: 0.4, xb: 3.6, ya: 0, yb: top,
        titolo: T("Unità prodotte e vendute per farmaco", "Units produced and sold by drug"), nx: T("farmaco", "drug"), ny: T("unità", "units") }, C, { nTx: 0, nTy: 5 });
      for (let i = 0; i < 3; i++) {
        barra(crea, A, i + 1 - 0.17, 0, x[i], 0.32, F.teal); barra(crea, A, i + 1 + 0.17, 0, y[i], 0.32, F.arancio);
        if (x[i] > 1e-6) M.scritta(crea, A.X(i + 1 - 0.17), A.Y(x[i]) + 5, mig(x[i]), { anchorY: "bottom", fontSize: 11.5, strokeColor: F.teal });
        if (y[i] > 1e-6) M.scritta(crea, A.X(i + 1 + 0.17), A.Y(y[i]) + 5, mig(y[i]), { anchorY: "bottom", fontSize: 11.5, strokeColor: F.arancio });
      }
      categorie(crea, A, [1, 2, 3].map((i) => [i, String(i)]), C);
      legendaIn(crea, A, [[F.teal, T("prodotte xᵢ", "produced xᵢ"), "barra"], [F.arancio, T("vendute (prodotte meno consumate)", "sold (produced minus used)"), "barra"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("unità prodotte \\(x_i\\)", "units produced \\(x_i\\)"), "pieno"],
      [F.arancio, T("unità vendute \\(x_1 - 2x_2\\), \\(x_2 - x_3\\), \\(x_3\\)", "units sold \\(x_1 - 2x_2\\), \\(x_2 - x_3\\), \\(x_3\\)"), "pieno"]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return stato(R, C);
      const x = R.x, y = [x[0] - 2 * x[1], x[1] - x[2], x[2]];
      return tabOmbra(R) +
        nota(T("\\(\\pi\\) è il ricavo in più per un'ora di lavoro in più: il farmaco che rende di più per ora, contando le ore dei farmaci consumati, prende tutte le ore.",
          "\\(\\pi\\) is the extra revenue for one more working hour: the drug with the highest revenue per hour, counting the hours of the drugs it uses, takes all the hours."));
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const x = R.x, y = [x[0] - 2 * x[1], x[1] - x[2], x[2]], zm = (q) => (Math.abs(q) < 0.5 ? "—" : mig(q));
      return SOL().blocco(valore(T("Ricavo massimo", "Maximum revenue"), R, "€", 0), [
        SOL().tab(T("Unità di ogni farmaco: prodotte \\(\\tilde x_i\\) e vendute (le altre servono per il farmaco successivo)", "Units of each drug: produced \\(\\tilde x_i\\) and sold (the others are used for the next drug)"),
          [T("farmaco \\(i\\)", "drug \\(i\\)"), "1", "2", "3"],
          [["\\(\\tilde x_i\\)", ...x.map(zm)], [T("vendute", "sold"), ...y.map((q) => zm(Math.max(0, q)))]]),
      ], NULLO());
    },
    domanda: T("Con \\(p_3 = 130\\) € si vende solo il farmaco 3, non più il 2. Con \\(p_2 = 50\\) € accade lo stesso.",
      "With \\(p_3 = 130\\) € only drug 3 is sold, no longer drug 2. With \\(p_2 = 50\\) € the same happens."),
    tabella: (R, DV) => DV.tab(T("Farmaci", "Drugs"), [T("farmaco \\(i\\)", "drug \\(i\\)"), T("\\(p_i\\) (€ per unità)", "\\(p_i\\) (€ per unit)"), T("\\(h_i\\) (ore per unità)", "\\(h_i\\) (hours per unit)")],
      [0, 1, 2].map((i) => [String(i + 1), DV.t(R.D.p[i]), DV.t(R.D.h[i])])),
  };

  // ================================================================ registrazione: un'app per modello
  /** la tabella dei dati della voce (vc.tabella) va subito dopo la riga «Dati:», prima dei prezzi ombra */
  const conTabella = (vc) => {
    const f = vc.formula;
    vc.formula = function (R, v, st) {
      const h = f.call(vc, R, v, st);
      if (typeof h !== "string" || !vc.tabella || !R || !R.D) return h;
      const tab = `<div class="plm-dati">${vc.tabella(R, DVF())}</div>`;
      const ombra = `</p><p class="plm-testo"><b>${T("Prezzi ombra.", "Shadow prices.")}</b>`;
      return h.includes(ombra) ? h.replace(ombra, `</p>${tab}<p class="plm-testo"><b>${T("Prezzi ombra.", "Shadow prices.")}</b>`)
        : h.replace('<p class="plm-cap">', `${tab}<p class="plm-cap">`);
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
