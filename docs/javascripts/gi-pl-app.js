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
  /** intero con le migliaia separate da uno spazio fine: 2 010 */
  const mig = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  /** fattore di scala di un cursore in %: «× 1,05» */
  const per = (v) => "× " + nt(v / 100, 2);
  const somma2 = (a) => a.flat().reduce((t, x) => t + x, 0);
  const tx = (s) => `\\(${s}\\)`;
  const margini = (S, alto = 22, basso = 36) => ({ X0: 54, X1: S.W - 14, alto, basso });

  // ================================================================ lo stile delle figure dei capitoli
  /* Le figure dei capitoli (python/stile.py, matplotlib): palette della dispensa, titolo in grassetto blu notte
   * sopra il pannello, griglia orizzontale leggera, assi solo a sinistra e in basso, etichette degli assi fuori,
   * legenda dentro il pannello. Qui la stessa forma, con colori un po' più chiari nel tema scuro. */
  const FIG = () => (M.scuro()
    ? { blu: "#D6E4F0", teal: "#22A6C7", rosso: "#E5675A", verde: "#3DBB6E", arancio: "#E8923F", grigio: "#A3AFB0", navy: "#9CC3E6" }
    : { blu: "#16324A", teal: "#0E7490", rosso: "#C0392B", verde: "#1E8449", arancio: "#CA6F1E", grigio: "#7F8C8D", navy: "#16324A" });
  const COL_PROD = () => { const F = FIG(); return [F.teal, F.rosso, F.verde]; };
  /** un pannello nello stile delle figure: P = {X0, X1, Y0, Y1, xa, xb, ya, yb, titolo, nx, ny} (pixel della board) */
  function figura(crea, P, C, opz = {}) {
    const Q = O.pannello(crea, Object.assign({}, P, { nx: "", ny: "" }), C, opz);
    if (!crea) return Q;
    const F = FIG();
    if (P.titolo) M.scritta(crea, (P.X0 + P.X1) / 2, P.Y1 + 7, P.titolo, { anchorY: "bottom", fontSize: 13.5, strokeColor: F.blu, cssStyle: "font-weight:700" });
    if (P.nx) M.scritta(crea, (P.X0 + P.X1) / 2, P.Y0 - 30, P.nx, { anchorY: "top", fontSize: 12, strokeColor: C.testo });
    if (P.ny) M.scritta(crea, P.X0 - 44, (P.Y0 + P.Y1) / 2, P.ny, { fontSize: 12, strokeColor: C.testo, rotate: 90 });
    return Q;
  }
  /** legenda dentro il pannello, in alto a sinistra («sx») o a destra («dx»), come nelle figure.
   *  voci: [colore, testo, tipo] con tipo "barra", "linea", "lineaPunti", "tratteggioPunti", "tratteggio", "punteggiata", "punto" */
  function legendaIn(crea, P, voci, C, dove = "sx") {
    const fs = 11.5, passo = 17, lung = 20;
    const largo = Math.max(...voci.map((v) => v[1].length)) * fs * 0.56 + lung + 10;
    const x0 = dove === "sx" ? P.X0 + 12 : Math.max(P.X0 + 12, P.X1 - largo - 6);
    voci.forEach(([col, testo, tipo], k) => {
      const y = P.Y1 - 12 - k * passo;
      if (tipo === "barra") M.rett(crea, x0 + 2, y - 5, x0 + lung - 2, y + 5, { fillColor: col, fillOpacity: 1, strokeColor: col, strokeWidth: 0.5 });
      else if (tipo === "punto") M.pallino(crea, x0 + lung / 2, y, { size: 4, fillColor: col, strokeColor: col });
      else {
        const dash = tipo.startsWith("tratteggio") ? 2 : tipo === "punteggiata" ? 1 : 0;
        M.linea(crea, x0, y, x0 + lung, y, { strokeColor: col, strokeWidth: 2.2, dash });
        if (tipo.endsWith("Punti")) M.pallino(crea, x0 + lung / 2, y, { size: 3.5, fillColor: col, strokeColor: col });
      }
      M.scritta(crea, x0 + lung + 7, y, testo, { anchorX: "left", fontSize: fs, strokeColor: C.testo });
    });
  }
  /** legenda in riga (va a capo se serve), in alto dentro il pannello: per i pannelli larghi e bassi.
   *  tipo "testo": solo la scritta, nel colore indicato */
  function legendaRiga(crea, P, voci, C) {
    const fs = 11, lung = 18, passo = 16;
    let x = P.X0 + 10, y = P.Y1 - 11;
    voci.forEach(([col, testo, tipo]) => {
      const largo = (tipo === "testo" ? 0 : lung + 6) + testo.length * fs * 0.55 + 16;
      if (x + largo > P.X1 - 4 && x > P.X0 + 10) { x = P.X0 + 10; y -= passo; }
      if (tipo === "barra") M.rett(crea, x + 2, y - 5, x + lung - 2, y + 5, { fillColor: col, fillOpacity: 1, strokeColor: col, strokeWidth: 0.5 });
      else if (tipo !== "testo") M.linea(crea, x, y, x + lung, y, { strokeColor: col, strokeWidth: 2.2, dash: tipo === "tratteggio" ? 2 : 0 });
      M.scritta(crea, x + (tipo === "testo" ? 0 : lung + 6), y, testo, { anchorX: "left", fontSize: fs, strokeColor: tipo === "testo" ? col : C.testo });
      x += largo;
    });
  }
  /** spezzata con i pallini (matplotlib "-o") */
  const lineaPunti = (crea, P, xs, ys, col, opz = {}) => {
    crea("curve", [xs.map(P.X), ys.map(P.Y)], { strokeColor: col, strokeWidth: opz.spessore || 2.2, dash: opz.dash || 0, fixed: true, highlight: false });
    if (opz.punti !== false) xs.forEach((x, k) => M.pallino(crea, P.X(x), P.Y(ys[k]), { size: opz.r || 3.5, fillColor: col, strokeColor: col }));
  };
  /** gradini centrati sui punti (matplotlib drawstyle="steps-mid") */
  const gradini = (crea, P, ys, col, opz = {}) => {
    const xs = [], yy = [];
    ys.forEach((y, t) => { xs.push(t - 0.5, t + 0.5); yy.push(y, y); });
    crea("curve", [xs.map(P.X), yy.map(P.Y)], { strokeColor: col, strokeWidth: opz.spessore || 2.4, dash: opz.dash || 0, fixed: true, highlight: false });
  };
  /** margini dei pannelli-figura: spazio a sinistra e in basso per le etichette degli assi, in alto per il titolo */
  const MF = { sx: 66, dx: 14, basso: 54, alto: 30 };

  // ================================================================ il capitolo che spiega il modello
  const CAPITOLO = {
    produzione: ["produzione/", "production/", "Produzione e scorte multiperiodali", "Multi-period production and inventory"],
    ev: ["ricarica-ev/", "ev-charging/", "Ricarica intelligente di veicoli elettrici", "Smart charging of electric vehicles"],
    newsvendor: ["newsvendor/", "newsvendor/", "Il Newsvendor e le sue varianti", "The Newsvendor and its variants"],
    dea: ["dea/", "dea/", "Data Envelopment Analysis", "Data Envelopment Analysis"],
    regressione: ["regressione/", "regression/", "Regressione robusta e quantile", "Robust and quantile regression"],
  };
  /** la radice del sito: Material la fissa in __md_scope (vale dalla home e dalle pagine del laboratorio) */
  const radice = () => {
    try { if (window.__md_scope) return new URL(window.__md_scope); } catch (e) { /* sotto */ }
    const cfg = document.getElementById("__config");
    try { return new URL(JSON.parse(cfg.textContent).base + "/", location.href); } catch (e) { return new URL("./", location.href); }
  };
  const rigaCapitolo = (chiave) => {
    const c = CAPITOLO[chiave];
    if (!c) return "";
    const url = new URL(GI.EN ? c[1] : c[0], radice()).href;
    // in fondo al capitolo stesso (sezione «Laboratorio interattivo») il rimando non serve
    if (new URL(url).pathname.replace(/\/$/, "") === location.pathname.replace(/(index\.html)?\/?$/, "")) return "";
    return `<p class="plm-cap">${T("Il modello è spiegato nel capitolo", "The model is explained in the chapter")} <a href="${url}">${GI.EN ? c[3] : c[2]}</a>.</p>`;
  };

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
  /** griglia nello stile delle dispense (array rcrc…cr): una colonna per variabile con i segni in colonne
   *  proprie, celle vuote per le variabili assenti, relazione e termine noto a destra, \\[1ex] fra le righe.
   *  righe: { lab, c: [coefficienti per colonna], piu (primo segno + esplicito), rel, rhs, cifre }
   *         { lab, dominio: [colonne], rel, rhs }  riga delle variabili separate da virgole
   *         nomi: [...]  nomi propri della riga (colonne per prodotto / per furgone)
   *         { puntini: true }  riga ⋮ */
  const griglia = (vars, righe) => {
    const tex = righe.map((r) => {
      const celle = [], nomi = r.nomi || vars;
      if (r.puntini) vars.forEach((x, j) => celle.push("", j === 0 ? "\\vdots" : ""));
      else if (r.dominio) {
        const ultimo = r.virgole ? -1 : Math.max(...r.dominio);
        vars.forEach((x, j) => celle.push("", r.dominio.includes(j) ? nomi[j] + (j === ultimo ? "" : ",") : ""));
      } else {
        let primo = !r.piu;
        vars.forEach((x, j) => {
          const a = r.c[j];
          if (!a || Math.abs(a) < 1e-12) { celle.push("", ""); return; }
          celle.push(a < 0 ? "-" : primo ? "" : "+", (Math.abs(Math.abs(a) - 1) < 1e-12 ? "" : n(Math.abs(a), r.cifre ?? 2) + "\\,") + nomi[j]);
          primo = false;
        });
      }
      const rel = r.rel ? (REL[r.rel] || r.rel) : "";
      return [r.lab || "", ...celle, rel, r.rhs ?? ""].map((c) => (c === "" ? "" : `{${c}}`)).join(" & ");
    });
    const corpo = tex.map((t, k) => t + (k === tex.length - 1 ? "" : righe[k].segue ? " \\\\\n" : " \\\\[1ex]\n")).join("");
    return `\\begin{array}{r${"cr".repeat(vars.length)}cr} ${corpo} \\end{array}`;
  };
  /** come griglia, ma ogni riga lunga va a capo ogni «per» variabili, come nelle dispense: le righe di
   *  continuazione ripartono dalla seconda colonna con il segno, relazione e termine noto sull'ultima */
  const grigliaLunga = (vars, righe, per) => {
    const pezzi = [];
    for (let k = 0; k < vars.length; k += per) pezzi.push([...Array(Math.min(per, vars.length - k)).keys()].map((q) => q + k));
    const pad = (a, f) => [...a, ...new Array(per - a.length).fill(f)];
    const out = [];
    righe.forEach((r) => {
      if (r.puntini) { out.push(r); return; }
      let visto = !!r.piu;
      const pieno = (g) => (r.dominio ? g.some((j) => r.dominio.includes(j)) : g.some((j) => r.c[j] && Math.abs(r.c[j]) > 1e-12));
      const fine = r.dominio || !r.rel ? Math.max(...pezzi.map((g, k) => (pieno(g) ? k : -1))) : pezzi.length - 1;
      pezzi.forEach((g, k) => {
        if (k > fine) return;
        const ultimo = k === fine;
        const q = { lab: k ? "" : r.lab, nomi: pad(g.map((j) => (r.nomi || vars)[j]), ""), cifre: r.cifre, segue: !ultimo,
          rel: ultimo ? r.rel : "", rhs: ultimo ? r.rhs : "" };
        if (r.dominio) { q.dominio = g.map((j, i) => (r.dominio.includes(j) ? i : -1)).filter((i) => i >= 0); q.virgole = !ultimo; }
        else { q.c = pad(g.map((j) => r.c[j]), 0); q.piu = visto; if (q.c.some((a) => a && Math.abs(a) > 1e-12)) visto = true; }
        if (!r.dominio || q.dominio.length) out.push(q);
      });
    });
    return griglia(new Array(per).fill(""), out);
  };
  /** un blocco del modello numerico: titolo e griglia (che scorre da sola se è più larga del riquadro) */
  const blocco = (titolo, g, cls = "") => `<p class="plm-tit">${titolo}</p><div class="plm-riga ${cls}">\\(\\displaystyle ${g}\\)</div>`;
  const MIN = "\\min";
  /** il blocco completo: problema, modello simbolico, modello numerico richiudibile */
  const modelloDi = (cap) => (testo, simbolico, num, nota) => modello(testo, simbolico, num, nota, cap);
  const modello = (testo, simbolico, num, nota, cap) =>
    `<div class="plm"><p class="plm-testo">${testo}</p>${rigaCapitolo(cap)}` +
    `<div class="plm-sim">\\(\\displaystyle \\begin{aligned} ${simbolico} \\end{aligned}\\)</div>` +
    `<details class="plm-num"${NUM.aperto ? " open" : ""}><summary>${T("Modello numerico con i dati attuali", "Numerical model with the current data")}</summary>` +
    `<div class="plm-num-corpo">${num}${nota ? `<p class="plm-nota">${nota}</p>` : ""}</div></details></div>`;

  // ================================================================ il blocco «Soluzione ottima» sotto il grafico
  /* Al posto della legenda ripetuta (nascosta da extra.css: ogni grafico ha la sua) c'è il blocco «Soluzione ottima»:
   * valore ottimo con l'unità e valori delle variabili (x̃, notazione dei capitoli), aggiornati con i cursori.
   * La colonna di destra tiene prezzi ombra e letture. Lo usano anche gi-pl-finanza.js e gi-pl-tecniche.js.
   * Una voce con soluzione(R, v, st, C) -> HTML lo riempie a ogni aggiornamento (SOL.voce avvolge le sue letture). */
  const SOL = {
    mostra(st, html) {
      const leg = st.el.querySelector(".gi-legenda");
      if (!leg) return;
      let b = st.el.querySelector(".plm-sol");
      if (!b) { b = GI.h("div", { class: "plm-sol" }); leg.after(b); }
      const testo = html ? `<p class="plm-sol-tit">${T("Soluzione ottima", "Optimal solution")}</p>${html}` : "";
      if (b.dataset.html === testo) return;
      b.dataset.html = testo;
      b.hidden = !html;
      b.innerHTML = GI.mj(testo);
      if (html) GI.typeset(b);
    },
    /** avvolge le letture della voce: prima la colonna di destra, poi il blocco */
    voce(vc) {
      if (!vc.soluzione || vc.conSoluzione) return vc;
      const vecchie = vc.letture;
      vc.conSoluzione = true;
      vc.letture = (R, v, st, C) => {
        const out = vecchie ? vecchie(R, v, st, C) : "";
        let h = "";
        try { h = vc.soluzione(R, v, st, C) || ""; } catch (e) { console.error("GI: soluzione", e); }
        SOL.mostra(st, h);
        return out;
      };
      return vc;
    },
    voci(oggetto) { Object.values(oggetto).forEach(SOL.voce); return oggetto; },
    /** valore di una variabile: «—» se è nullo alle cifre mostrate */
    z: (x, c = 1) => (Math.abs(x) < 0.5 * Math.pow(10, -c) ? "—" : GI.numTxt(x, c)),
    /** una tabella con il suo titolo */
    tab: (titolo, intest, righe) => `<div class="plm-sol-t">${titolo ? `<p>${titolo}</p>` : ""}${M.tab(intest, righe)}</div>`,
    /** il blocco: riga del valore ottimo, tabelle affiancate (vanno a capo), nota */
    blocco: (valore, tabelle = [], nota = "") => `<div class="plm-sol-val">${valore}</div>` +
      (tabelle.length ? `<div class="plm-sol-tabs">${tabelle.join("")}</div>` : "") + (nota ? `<p class="plm-sol-nota">${nota}</p>` : ""),
  };
  window.GI_PL_SOL = SOL;

  // ================================================================ produzione (cap. 4)
  /** riga evidenziata sotto il problema: quantità continue, non oggetti da contare */
  const CONTINUE = ["", ""];   // la nota sulle unità continue sta solo nella pagina del capitolo (Fabio, 25/11/2026)
  const PRODOTTO = (C) => [C.a, C.b, C.c];
  const vProduzione = {
    etichetta: T("Produzione e scorte", "Production and inventory"),
    cursori: [
      { nome: T("\\text{domanda}\\ d_{it}", "\\text{demand}\\ d_{it}"), min: 80, max: 105, step: 1, val: 100,
        fmt: (x) => `${mig(somma2(DD().produzione.domanda) * x / 100)} ${T("unità", "units")} (${per(x)})`,
        descr: T("moltiplica per lo stesso fattore le 18 domande \\(d_{it}\\) (3 prodotti × 6 mesi)", "multiplies the 18 demands \\(d_{it}\\) (3 products × 6 months) by the same factor") },
      { nome: T("\\text{capacità totale}", "\\text{total capacity}"), min: 95, max: 130, step: 1, val: 100,
        fmt: (x) => `${mig(somma2(DD().produzione.cap) * x / 100)} ${T("ore", "hours")} (${per(x)})`,
        descr: T("moltiplica per lo stesso fattore le 6 capacità mensili \\(b_t\\) (420 o 460 ore macchina)", "multiplies the 6 monthly capacities \\(b_t\\) (420 or 460 machine hours) by the same factor") },
      { nome: T("\\text{giacenza}\\ h_{3t}", "\\text{holding}\\ h_{3t}"), min: 25, max: 300, step: 25, val: 100,
        fmt: (x) => `${nt(DD().produzione.ch[2] * x / 100, 2)} €`,
        descr: T("costo di giacenza del prodotto 3 per unità e mese (prodotti 1 e 2: 0,8 e 1,2 €)", "holding cost of product 3 per unit and month (products 1 and 2: 0.8 and 1.2 €)") },
    ],
    calcola: (v) => PL().produzione(v[1] / 100, v[0] / 100, [1, 1, v[2] / 100]),
    formula(R, v, st) {
      const P = DD().produzione, nI = P.prodotti.length, nT = P.mesi.length;
      const it = `${PER("i", "n")},~${PER("t", "m")}`;
      const sim = `\\min ~~ \\sum_{i=1}^{n} \\sum_{t=1}^{m} \\bigl( c_{it}\\, x_{it} + ${st.col("c", "h_{it}")}\\, s_{it} \\bigr) & & \\\\
        ${SA()} \\quad s_{i,t-1} + x_{it} &= ${st.col("a", "d_{it}")} + s_{it}, & ${it}, \\\\
        \\sum_{i=1}^{n} a_i\\, x_{it} &\\le ${st.col("b", "b_t")}, & ${PER("t", "m")}, \\\\
        x_{it} &\\ge 0, & ${it}, \\\\
        s_{it} &\\ge 0, & ${it}.`;
      const fD = v[0] / 100, fC = v[1] / 100, fH = v[2] / 100;
      // un blocco per prodotto e semestre, colonne x_{i1}, s_{i1}, x_{i2}, s_{i2}, ...: il bilancio viene «a scala».
      // Il secondo blocco riparte dalla scorta s_{i,3} del primo (il suo costo è già nel primo blocco).
      let num = "";
      const meta = Math.ceil(nT / 2);
      for (let i = 0; i < nI; i++) for (let h = 0; h < 2; h++) {
        const I = i + 1, t0 = h ? meta : 0, t1 = h ? nT : meta, vars = [], ob = [];
        if (h) { vars.push(`s_{${I},${t0}}`); ob.push(0); }
        for (let t = t0 + 1; t <= t1; t++) { vars.push(`x_{${I},${t}}`, `s_{${I},${t}}`); ob.push(P.cp[i], P.ch[i] * (i === 2 ? fH : 1)); }
        const primo = i === 0 && h === 0, sh = h ? 1 : 0;
        const righe = [{ lab: primo ? MIN : "", c: ob, piu: !primo, cifre: 3 }];
        for (let t = t0; t < t1; t++) {
          const c = new Array(vars.length).fill(0), k = sh + 2 * (t - t0);
          c[k] = 1; c[k + 1] = -1; if (t > 0) c[k - 1] = 1;
          righe.push({ lab: primo && t === 0 ? SA() : "", c, rel: "=", rhs: n(P.domanda[i][t] * fD - (t ? 0 : P.s0[i]), 1) });
        }
        righe.push({ dominio: vars.map((x, j) => j).filter((j) => j >= sh), rel: ">=", rhs: "0" });
        num += blocco(h ? T(`Prodotto ${I}, mesi ${t0 + 1}–${t1} (la scorta \\(s_{${I},${t0}}\\) viene dal blocco precedente)`, `Product ${I}, months ${t0 + 1}–${t1} (the inventory \\(s_{${I},${t0}}\\) comes from the previous block)`)
          : T(`Prodotto ${I}, mesi 1–${t1}: costi e bilancio delle scorte (per \\(t = 1\\) a destra c'è \\(d_{${I},1} - s_{${I},0}\\), con \\(s_{${I},0} = ${n(P.s0[i], 1)}\\))`,
            `Product ${I}, months 1–${t1}: costs and inventory balance (for \\(t = 1\\) the right-hand side is \\(d_{${I},1} - s_{${I},0}\\), with \\(s_{${I},0} = ${n(P.s0[i], 1)}\\))`), griglia(vars, righe));
      }
      // capacità: una colonna per prodotto, una riga per mese
      const capR = P.mesi.map((m, t) => ({ nomi: P.prodotti.map((q, i) => `x_{${i + 1},${t + 1}}`), c: P.ore, rel: "<=", rhs: n(P.cap[t] * fC, 1) }));
      num += blocco(T("Capacità: una riga per mese, una colonna per prodotto", "Capacity: one row per month, one column per product"),
        griglia(P.prodotti.map((q, i) => `x_{${i + 1},t}`), capR));
      return modelloDi("produzione")(T(`<b>Il problema.</b> Decidiamo quante unità di ogni prodotto produrre in ogni mese e quante tenerne a scorta. ` +
        "L'obiettivo è minimizzare il costo di produzione e di giacenza. I vincoli: bilancio di magazzino mese per mese, con la domanda servita per intero, e ore macchina disponibili in ogni mese." + CONTINUE[0] +
        "<br><b>Variabili:</b> \\(x_{it}\\): unità del prodotto \\(i\\) prodotte nel mese \\(t\\); \\(s_{it}\\): unità del prodotto \\(i\\) a scorta alla fine del mese \\(t\\)." +
        `<br><b>Dati:</b> \\(n = ${nI}\\): numero di prodotti; \\(m = ${nT}\\): numero di mesi; ` + "\\(c_{it}\\): costo di produzione di un'unità di \\(i\\) nel mese \\(t\\) (€); \\(h_{it}\\): costo di giacenza di un'unità di \\(i\\) per il mese \\(t\\) (€); " +
        "\\(d_{it}\\): domanda del prodotto \\(i\\) nel mese \\(t\\) (unità); \\(a_i\\): ore macchina per produrre un'unità di \\(i\\); \\(b_t\\): ore macchina disponibili nel mese \\(t\\); \\(s_{i0}\\): scorta iniziale del prodotto \\(i\\) (unità).",
      `<b>The problem.</b> We decide how many units of each product to produce in each month and how many to keep in inventory. ` +
        "The objective is to minimize production and holding cost. The constraints: inventory balance month by month, with demand served in full, and the machine hours available in each month." + CONTINUE[1] +
        "<br><b>Variables:</b> \\(x_{it}\\): units of product \\(i\\) produced in month \\(t\\); \\(s_{it}\\): units of product \\(i\\) in inventory at the end of month \\(t\\)." +
        `<br><b>Data:</b> \\(n = ${nI}\\): number of products; \\(m = ${nT}\\): number of months; ` + "\\(c_{it}\\): production cost of one unit of \\(i\\) in month \\(t\\) (€); \\(h_{it}\\): holding cost of one unit of \\(i\\) for month \\(t\\) (€); " +
        "\\(d_{it}\\): demand for product \\(i\\) in month \\(t\\) (units); \\(a_i\\): machine hours to produce one unit of \\(i\\); \\(b_t\\): machine hours available in month \\(t\\); \\(s_{i0}\\): initial inventory of product \\(i\\) (units)."),
      sim, num,
      T("La funzione obiettivo è la somma delle righe di costo dei sei blocchi di prodotto.",
        "The objective function is the sum of the cost rows of the six product blocks."));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile: la capacità non basta per la domanda", "No feasible plan: capacity does not cover demand"));
      // come la figura del capitolo (cap05_piano_scorte): in alto ore macchina impilate e capacità,
      // in basso produzione e domanda per prodotto (a sinistra) e scorte (a destra)
      const P0 = DD().produzione, nT = P0.mesi.length, nI = P0.prodotti.length, col = COL_PROD(), F = FIG();
      const mesiX = P0.mesi.map((m, t) => t + 1), dom = P0.domanda.map((r) => r.map((d) => d * v[0] / 100));
      const gapV = 74, gapH = 76, hTot = S.H - MF.basso - MF.alto - gapV, hTop = hTot * 0.5;
      const mese = T("mese", "month"), fx = (u) => (Number.isInteger(u) && u >= 1 && u <= nT ? String(u) : "");
      const prod = (i) => T("prodotto ", "product ") + (i + 1);
      // 1. ore macchina a_i x_it impilate, capacità b_t, mesi saturi
      const A = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: S.H - MF.alto - hTop, Y1: S.H - MF.alto, xa: 0.4, xb: nT + 0.6, ya: 0,
        yb: Math.max(...R.cap, ...R.ore) * 1.42, titolo: T("Ore macchina usate per prodotto e capacità (altezza della barra = ore usate nel mese)",
          "Machine hours used by product and capacity (bar height = hours used in the month)"), ny: T("ore", "hours") }, C, { nTx: nT, nTy: 4, fx });
      mesiX.forEach((x, t) => {
        let y0 = 0;
        for (let i = 0; i < nI; i++) {
          const h = P0.ore[i] * R.x[i][t];
          if (h > 1e-9) M.rett(crea, A.X(x - 0.3), A.Y(y0), A.X(x + 0.3), A.Y(y0 + h), { fillColor: col[i], fillOpacity: 1, strokeColor: col[i], strokeWidth: 0.5 });
          y0 += h;
        }
        const c = R.cap[t];
        M.linea(crea, A.X(x - 0.4), A.Y(c), A.X(x + 0.4), A.Y(c), { strokeColor: F.rosso, strokeWidth: 2.2, dash: 2 });
        if (R.ore[t] > c - 1e-6) M.scritta(crea, A.X(x), A.Y(c) + 3, T("satura", "binding"), { anchorY: "bottom", fontSize: 11, strokeColor: F.rosso });
      });
      legendaRiga(crea, A, [...col.map((c, i) => [c, prod(i), "barra"]), [F.rosso, T("capacità bₜ", "capacity bₜ"), "tratteggio"],
        [F.rosso, T("satura = vincolo di capacità attivo", "binding = capacity constraint active"), "testo"]], C);
      // 2. produzione x_it (barre affiancate) e domanda d_it (tratteggio con rombi, stesso colore)
      const box = (k) => ({ X0: MF.sx + k * ((S.W - MF.sx - MF.dx - gapH) / 2 + gapH), Y0: MF.basso, Y1: MF.basso + hTot - hTop,
        X1: MF.sx + k * ((S.W - MF.sx - MF.dx - gapH) / 2 + gapH) + (S.W - MF.sx - MF.dx - gapH) / 2 });
      const larg = 0.26, sposta = (i) => (i - 1) * larg;
      const B = figura(crea, Object.assign(box(0), { xa: 0.4, xb: nT + 0.6, ya: 0, yb: Math.max(...dom.flat(), ...R.x.flat()) * 1.55,
        titolo: T("Produzione e domanda per prodotto", "Production and demand by product"), nx: mese, ny: T("unità", "units") }), C, { nTx: nT, nTy: 4, fx });
      for (let i = 0; i < nI; i++) R.x[i].forEach((q, t) => {
        const xc = t + 1 + sposta(i);
        if (q > 1e-9) M.rett(crea, B.X(xc - larg / 2), B.Y(0), B.X(xc + larg / 2), B.Y(q), { fillColor: col[i], fillOpacity: 1, strokeColor: col[i], strokeWidth: 0.5 });
      });
      for (let i = 0; i < nI; i++) {
        const xs = mesiX.map((x) => x + sposta(i));
        crea("curve", [xs.map(B.X), dom[i].map(B.Y)], { strokeColor: col[i], strokeWidth: 1.4, dash: 2, fixed: true, highlight: false });
        xs.forEach((x, t) => M.pallino(crea, B.X(x), B.Y(dom[i][t]), { size: 3, face: "<>", fillColor: C.card || "#ffffff", strokeColor: col[i], strokeWidth: 1.5 }));
      }
      legendaRiga(crea, B, [...col.map((c, i) => [c, T(`${i + 1}: produzione`, `${i + 1}: production`), "barra"]),
        ...col.map((c, i) => [c, T(`${i + 1}: domanda`, `${i + 1}: demand`), "tratteggio"])], C);
      // 3. scorte s_it
      const sMax = Math.max(10, ...R.s.flat()) * 1.4;
      const D = figura(crea, Object.assign(box(1), { xa: 0.7, xb: nT + 0.3, ya: -sMax * 0.05, yb: sMax,
        titolo: T("Scorte di fine mese", "End-of-month inventory"), nx: mese, ny: T("unità a scorta", "units in stock") }), C, { nTx: nT, nTy: 4, fx });
      R.s.forEach((riga, i) => lineaPunti(crea, D, mesiX, riga, col[i], { r: 4 }));
      legendaIn(crea, D, col.map((c, i) => [c, prod(i), "lineaPunti"]), C, "dx");
    },
    legenda: (C) => [
      ...COL_PROD().map((c, i) => [c, T(`prodotto ${i + 1}: ore macchina \\(a_${i + 1} x_{${i + 1}t}\\) (in alto), produzione \\(x_{${i + 1}t}\\) e domanda \\(d_{${i + 1}t}\\) (in basso), scorte \\(s_{${i + 1}t}\\)`,
        `product ${i + 1}: machine hours \\(a_${i + 1} x_{${i + 1}t}\\) (top), production \\(x_{${i + 1}t}\\) and demand \\(d_{${i + 1}t}\\) (bottom), inventory \\(s_{${i + 1}t}\\)`), "pieno"]),
      [FIG().rosso, T("capacità \\(b_t\\) (ore disponibili); satura: vincolo di capacità attivo, tutte le ore usate", "capacity \\(b_t\\) (hours available); binding: capacity constraint active, all hours used"), "dashed"],
    ],
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return M.tinta(C.rosso, T("Inammissibile.", "Infeasible.")) + " " +
        T("Con questa capacità la domanda non si può servire per intero: il simplesso si ferma alla fase 1.",
          "With this capacity demand cannot be served in full: the simplex stops in phase 1.");
      const righe = R.ombra.map((y, t) => [String(t + 1), `${nt(R.ore[t], 0)}/${nt(R.cap[t], 0)}`, tx(n(y, 3)),
        `[${nt(R.lo[t], 0)}, ${isFinite(R.up[t]) ? nt(R.up[t], 0) : "∞"}]`]);
      const att = R.ombra.map((y, t) => (Math.abs(y) > 1e-9 ? t : -1)).filter((t) => t >= 0);
      return `<div>${T("Prezzi ombra della capacità \\(b_t\\) (€ per ora)", "Shadow prices of the capacity \\(b_t\\) (€ per hour)")}</div>` +
        M.tab([T("mese", "month"), T("ore", "hours"), T("prezzo ombra", "shadow price"), T("valido per \\(b_t\\) in", "valid for \\(b_t\\) in")], righe, att.length ? att[att.length - 1] : -1, C.rosso) +
        `<div style="margin-top:.3em">${T("Un'ora in più nel mese", "One more hour in month")} ${att.length ? att[att.length - 1] + 1 : "—"} ` +
        `${T("fa risparmiare", "saves")} ${att.length ? euro(-R.ombra[att[att.length - 1]], 3) : "0 €"}: ` +
        T("i prezzi ombra crescono verso la fine, perché un'ora tardi evita giacenze accumulate prima.",
          "the shadow prices grow towards the end, because a late hour avoids inventory built up earlier.") + "</div>" +
        `<div style="margin-top:.3em">${T("Le scorte \\(s_{it}\\) si accumulano nei mesi precedenti per coprire la domanda dei mesi in cui la capacità è satura; costano \\(h_{it}\\) per unità e mese.",
          "The inventory \\(s_{it}\\) is built up in earlier months to cover demand in the months where capacity is binding; it costs \\(h_{it}\\) per unit and month.")}</div>`;
    },
    soluzione(R, v) {
      if (R.stato !== "ottimo") return "";
      const Pd = DD().produzione, giac = R.s.reduce((tot, riga, i) => tot + riga.reduce((a, x) => a + x, 0) * Pd.ch[i] * (i === 2 ? v[2] / 100 : 1), 0);
      const intest = (s) => [tx(`i \\backslash t`), ...Pd.mesi.map((m, t) => String(t + 1))];
      const righe = (A) => A.map((riga, i) => [String(i + 1), ...riga.map((x) => SOL.z(x, 1))]);
      return SOL.blocco(`${T("Costo ottimo", "Optimal cost")}: <b>${euro(R.costo)}</b>, ${T("di cui giacenza", "of which holding")} ${euro(giac)}`, [
        SOL.tab(T("Produzione \\(\\tilde x_{it}\\) (unità): prodotto \\(i\\) per riga, mese \\(t\\) per colonna", "Production \\(\\tilde x_{it}\\) (units): product \\(i\\) by row, month \\(t\\) by column"), intest(), righe(R.x)),
        SOL.tab(T("Scorte di fine mese \\(\\tilde s_{it}\\) (unità)", "End-of-month inventory \\(\\tilde s_{it}\\) (units)"), intest(), righe(R.s)),
      ], T("«—»: valore nullo.", "«—»: zero value."));
    },
    domanda: T("Il mese 1 ha prezzo ombra nullo: perché? Porta la capacità a × 1,10: quali mesi smettono di essere saturi? Sotto × 0,97 il piano non esiste più: perché? Poi alza la giacenza \\(h_{3t}\\) del prodotto 3: fino a 1,8 € il piano non cambia ma il costo e i prezzi ombra sì; oltre, le scorte passano al prodotto 2. Perché proprio 1,8 €?",
      "Month 1 has a zero shadow price: why? Set capacity to × 1.10: which months stop being binding? Below × 0.97 there is no plan any more: why? Then raise the holding cost \\(h_{3t}\\) of product 3: up to 1.8 € the plan does not change but the cost and the shadow prices do; beyond it, the inventory moves to product 2. Why exactly 1.8 €?"),
  };

  // ================================================================ ricarica EV (cap. 5)
  const ORDINE_ORE = [...Array(12).keys()].map((k) => k + 12).concat([...Array(12).keys()]);
  const VEICOLO = (C) => [C.a, C.b, C.c, C.d, C.e, C.viola];
  const vEv = {
    etichetta: T("Ricarica di veicoli elettrici", "Electric vehicle charging"),
    cursori: [
      { nome: "k", min: 80, max: 160, step: 5, val: 120, fmt: (x) => nt(x, 0) + " kW",
        descr: T("potenza massima prelevabile dal contatore", "maximum power drawn from the meter") },
      { nome: T("\\text{energia totale}", "\\text{total energy}"), min: 60, max: 130, step: 5, val: 100,
        fmt: (x) => `${mig(DD().ev.veicoli.reduce((t, q) => t + q.energia, 0) * x / 100)} kWh (${per(x)})`,
        descr: T("moltiplica per lo stesso fattore le 6 energie richieste \\(e_v\\) (da 30 a 55 kWh per furgone)", "multiplies the 6 required energies \\(e_v\\) (30 to 55 kWh per van) by the same factor") },
      { nome: T("c_t\\ \\text{serale}", "c_t\\ \\text{evening}"), min: 10, max: 200, step: 10, val: 100,
        fmt: (x) => { const q = DD().ev.prezzo.slice(17, 21).map((y) => y * x / 100); return `${nt(Math.min(...q), 3)}–${nt(Math.max(...q), 3)} €/kWh`; },
        descr: T("moltiplica per lo stesso fattore i prezzi delle 4 ore dalle 17 alle 21", "multiplies the prices of the 4 hours from 5 pm to 9 pm by the same factor") },
    ],
    calcola: (v) => PL().ricaricaEv(v[0], v[1] / 100, v[2] / 100),
    formula(R, v, st) {
      const E = DD().ev, V = E.veicoli, nV = V.length;
      const vt = `${PER("v", "n")},~${PER("t", "m")}`;
      const sim = `\\min ~~ \\sum_{v=1}^{n} \\sum_{t=1}^{m} ${st.col("c", "c_t")}\\, d\\, x_{vt} & & \\\\
        ${SA()} \\quad r \\sum_{t=1}^{m} d\\, x_{vt} &\\ge ${st.col("b", "e_v")}, & ${PER("v", "n")}, \\\\
        \\sum_{v=1}^{n} x_{vt} + b_t &\\le ${st.col("a", "k")}, & ${PER("t", "m")}, \\\\
        x_{vt} &\\le a_{vt}\\, \\bar p_v, & ${vt}, \\\\
        x_{vt} &\\ge 0, & ${vt}.`;
      const coll = (x, t) => x.arrivo <= t || t < x.partenza;
      const prezzo = (t) => E.prezzo[t] * (t >= 17 && t <= 20 ? v[2] / 100 : 1);
      const ore = (x) => ORDINE_ORE.filter((t) => coll(x, t));
      const xv = (j, t) => `x_{${j + 1},${t}}`;
      // un blocco per furgone (le sue ore di collegamento in colonna), poi il blocco della rete
      let num = "";
      V.forEach((x, j) => {
        const hh = ore(x), vars = hh.map((t) => xv(j, t)), tutte = vars.map((q, k) => k);
        num += blocco(T(`Furgone ${j + 1}, collegato dalle ${x.arrivo} alle ${x.partenza}: costo, energia, potenza del caricatore`,
          `Van ${j + 1}, plugged in from ${x.arrivo}:00 to ${x.partenza}:00: cost, energy, charger power`), grigliaLunga(vars, [
          { lab: j ? "" : MIN, c: hh.map(prezzo), piu: j > 0, cifre: 3 },
          { lab: j ? "" : SA(), c: hh.map(() => E.eta), rel: ">=", rhs: n(x.energia * v[1] / 100, 1) },
          { dominio: tutte, rel: "<=", rhs: n(x.pmax, 1) },
          { dominio: tutte, rel: ">=", rhs: "0" },
        ], 5));
      });
      const reteR = ORDINE_ORE.filter((t) => V.some((x) => coll(x, t)))
        .map((t) => ({ nomi: V.map((x, j) => xv(j, t)), c: V.map((x) => (coll(x, t) ? 1 : 0)), rel: "<=", rhs: n(v[0] - E.base[t], 1) }));
      num += blocco(T("Rete: una riga per ora, una colonna per furgone; a destra \\(k - b_t\\)", "Grid: one row per hour, one column per van; on the right \\(k - b_t\\)"),
        griglia(V.map((x, j) => `x_{${j + 1},t}`), reteR));
      return modelloDi("ev")(T(`<b>Il problema.</b> Decidiamo la potenza \\(x_{vt}\\) (kW) assegnata al furgone \\(v\\) nell'ora \\(t\\). ` +
        "L'obiettivo è la minima spesa energetica, con il prezzo \\(c_t\\) dell'energia nell'ora \\(t\\) (€/kWh). I vincoli: l'energia \\(e_v\\) (kWh) richiesta dal furgone \\(v\\) entro la partenza, tenendo conto del rendimento \\(r\\) della ricarica (la quota dell'energia prelevata che arriva in batteria, qui \\(r = " + n(DD().ev.eta, 2) + "\\)); la ricarica solo quando il furgone è collegato (\\(a_{vt} = 1\\), altrimenti \\(a_{vt} = 0\\)) e sotto la potenza \\(\\bar p_v\\) (kW) del suo caricatore; il prelievo totale, carico di base \\(b_t\\) (kW) dell'edificio compreso, sotto la potenza \\(k\\) (kW) del contatore." +
        `<br><b>Dati:</b> \\(n = ${nV}\\): numero di furgoni; \\(m = 24\\): numero di ore della giornata; \\(d = 1\\) h: durata di un'ora.`,
      `<b>The problem.</b> We decide the power \\(x_{vt}\\) (kW) assigned to van \\(v\\) in hour \\(t\\). ` +
        "The objective is the minimum energy expenditure, with the energy price \\(c_t\\) in hour \\(t\\) (€/kWh). The constraints: the energy \\(e_v\\) (kWh) required by van \\(v\\) before departure, taking into account the charging efficiency \\(r\\) (the share of the energy drawn that reaches the battery, here \\(r = " + n(DD().ev.eta, 2) + "\\)); charging only while the van is plugged in (\\(a_{vt} = 1\\), otherwise \\(a_{vt} = 0\\)) and below the power \\(\\bar p_v\\) (kW) of its charger; the total draw, including the base load \\(b_t\\) (kW) of the building, below the power \\(k\\) (kW) of the meter." +
        `<br><b>Data:</b> \\(n = ${nV}\\): number of vans; \\(m = 24\\): number of hours in the day; \\(d = 1\\) h: length of an hour.`),
      sim, num,
      T("Le ore sono quelle dell'orologio (\\(x_{1,18}\\): furgone 1 alle 18). Nelle ore in cui un furgone non è collegato (\\(a_{vt} = 0\\)) la sua variabile vale 0 e non compare. La funzione obiettivo è la somma delle righe di costo dei sei blocchi.",
        "Hours are clock hours (\\(x_{1,18}\\): van 1 at 6 pm). In the hours when a van is not plugged in (\\(a_{vt} = 0\\)) its variable is 0 and does not appear. The objective function is the sum of the cost rows of the six blocks."));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Inammissibile: con questo limite i furgoni non si ricaricano in tempo", "Infeasible: with this limit the vans cannot be charged in time"));
      // come la figura del capitolo (cap06_profili): prezzo orario sopra, profilo di prelievo sotto, ore 0–23
      const E = DD().ev, F = FIG(), ore = [...Array(24).keys()], gap = 62;
      const hTot = S.H - MF.basso - MF.alto - gap, hTop = hTot * 0.42;
      const fx = (u) => (u % 5 === 0 ? String(u) : "");
      const A = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: S.H - MF.alto - hTop, Y1: S.H - MF.alto, xa: -1.2, xb: 24.2, ya: 0,
        yb: Math.max(...R.prezzo) * 100 * 1.08, titolo: T("Prezzo orario dell'energia", "Hourly energy price"), ny: T("prezzo cₜ (c€/kWh)", "price cₜ (c€/kWh)") }, C, { nTx: 0, nTy: 4 });
      ore.forEach((t) => M.rett(crea, A.X(t - 0.4), A.Y(0), A.X(t + 0.4), A.Y(R.prezzo[t] * 100), { fillColor: F.grigio, fillOpacity: 0.55, strokeColor: "none", strokeWidth: 0 }));
      const yb = Math.max(R.C, ...R.tot) * 1.45;
      const B = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto - hTop - gap, xa: -1.2, xb: 24.2, ya: 0, yb,
        titolo: T("Profilo di prelievo dalla rete", "Power withdrawn from the grid"), nx: T("ora del giorno", "hour of the day"),
        ny: T("prelievo totale (kW)", "total withdrawal (kW)") }, C, { nTx: 6, nTy: 4, fx });
      lineaPunti(crea, B, ore, E.base, F.grigio, { dash: 2, punti: false, spessore: 1.8 });
      gradini(crea, B, R.tot, F.teal);
      M.linea(crea, B.X(-1.2), B.Y(R.C), B.X(24.2), B.Y(R.C), { strokeColor: F.rosso, strokeWidth: 2, dash: 1 });
      // stesse voci della figura (che mostra anche il peak shaving, min z, qui non calcolato)
      legendaIn(crea, B, [[F.grigio, T("carico di base bₜ", "base load bₜ"), "tratteggio"], [F.teal, T("costo minimo", "minimum cost"), "linea"],
        [F.rosso, T(`potenza del contatore k = ${nt(R.C, 0)} kW`, `meter power k = ${nt(R.C, 0)} kW`), "punteggiata"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.grigio, T("prezzo dell'energia \\(c_t\\) (barre) e carico di base \\(b_t\\) dell'edificio (tratteggio)", "energy price \\(c_t\\) (bars) and building base load \\(b_t\\) (dashed)"), "pieno"],
      [F.teal, T("prelievo totale \\(b_t + \\sum_v x_{vt}\\) del piano a costo minimo", "total draw \\(b_t + \\sum_v x_{vt}\\) of the minimum-cost plan"), ""],
      [F.rosso, T("potenza del contatore \\(k\\)", "meter power \\(k\\)"), "dotted"]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return M.tinta(C.rosso, T("Inammissibile.", "Infeasible."));
      const E = DD().ev;
      const righe = E.veicoli.map((x, j) => [x.nome, `${x.arrivo}–${x.partenza}`, nt(x.energia * v[1] / 100, 1), tx(n(R.ombraEnergia[j] * 100, 2))]);
      const sature = R.ombraRete.map((y, t) => (Math.abs(y) > 1e-9 ? t : -1)).filter((t) => t >= 0);
      return `<div>${T("Picco di prelievo", "Peak withdrawal")}: ${nt(R.picco, 1)} kW</div>` +
        M.tab([T("furgone", "van"), T("ore", "hours"), "kWh", T("ombra c€/kWh", "shadow c€/kWh")], righe) +
        `<div style="margin-top:.3em">${sature.length ? T("Limite di rete saturo alle ore ", "Grid limit binding at hours ") + sature.join(", ") +
          T(": un kW in più lì vale ", ": one more kW there is worth ") + sature.map((t) => nt(-R.ombraRete[t] * 100, 1)).join(", ") + " c€."
          : T("Il limite di rete non è mai saturo: ogni furgone carica nelle sue ore più economiche.", "The grid limit is never binding: every van charges in its cheapest hours.")}</div>`;
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const V = DD().ev.veicoli, coll = (x, t) => x.arrivo <= t || t < x.partenza;
      const ore = ORDINE_ORE.filter((t) => V.some((x) => coll(x, t)));
      const righe = V.map((x, j) => [String(j + 1), ...ore.map((t) => (coll(x, t) ? SOL.z(R.x[j][t], 1) : "")), nt(R.x[j].reduce((s, q) => s + q, 0), 1)]);
      return SOL.blocco(`${T("Costo ottimo", "Optimal cost")}: <b>${euro(R.costo)}</b>`, [
        SOL.tab(T("Potenza \\(\\tilde x_{vt}\\) (kW): furgone \\(v\\) per riga, ora \\(t\\) per colonna, solo nelle ore in cui è collegato", "Power \\(\\tilde x_{vt}\\) (kW): van \\(v\\) by row, hour \\(t\\) by column, only in the hours when it is plugged in"),
          [tx("v \\backslash t"), ...ore.map(String), T("kWh prelevati", "kWh drawn")], righe),
      ], T("«—»: valore nullo; casella vuota: furgone non collegato.", "«—»: zero value; empty cell: van not plugged in."));
    },
    domanda: T("Abbassa \\(k\\) a 90 kW: in quali ore il limite diventa saturo e quanto sale il costo? Porta i prezzi serali sotto 0,1 €/kWh: da quando i furgoni caricano anche la sera? Perché il prezzo ombra dell'energia di un furgone è il prezzo della sua ora più cara usata, diviso per \\(r\\)?",
      "Lower \\(k\\) to 90 kW: in which hours does the limit become binding and how much does the cost grow? Bring the evening prices below 0.1 €/kWh: from when do the vans also charge in the evening? Why is the shadow price of a van's energy the price of its most expensive hour used, divided by \\(r\\)?"),
  };

  // ================================================================ newsvendor (cap. 7)
  const ALFA = 0.9;
  const vNewsvendor = {
    etichetta: T("Newsvendor a scenari", "Scenario newsvendor"),
    cursori: [
      { nome: "p", min: 8, max: 30, step: 0.5, val: 15, fmt: (x) => euro(x, 1),
        descr: T("prezzo di vendita di un'unità: \\(c_u = p - c\\), \\(c_o = c - v\\) con \\(c = 6\\) €, \\(v = 2\\) €", "selling price of one unit: \\(c_u = p - c\\), \\(c_o = c - v\\) with \\(c = 6\\) €, \\(v = 2\\) €") },
      { nome: "r", min: 0, max: 1, step: 0.05, val: 0, fmt: (x) => nt(x, 2),
        descr: T("avversione al rischio: peso del CVaR\\(_\\alpha\\) del costo (\\(\\alpha = 0{,}9\\))", "risk aversion: weight of the CVaR\\(_\\alpha\\) of the cost (\\(\\alpha = 0.9\\))") },
    ],
    calcola(v) {
      const R = PL().newsvendor(v[0], v[1], ALFA);
      const qs = [];
      for (let k = 0; k <= 130; k++) qs.push(40 + k);
      R.curve = { q: qs, media: qs.map(R.f.media), cv: qs.map(R.f.cv), ob: qs.map(R.f.obiettivo) };
      return R;
    },
    formula(R, v, st) {
      const N = DD().newsvendor, d = N.domanda, k = d.length, lam = st.col("b", "r");
      const ks = PER("s", "k");
      const sim = `\\min ~~ (1-${lam}) \\sum_{s=1}^{k} w_s \\bigl( c_o\\, o_s + ${st.col("a", "c_u")}\\, u_s \\bigr) & & \\\\
        + ${lam} \\Bigl( \\eta + \\tfrac{1}{1-\\alpha} \\sum_{s=1}^{k} w_s\\, \\xi_s \\Bigr) & & \\\\
        ${SA()} \\quad o_s &\\ge q - d_s, & ${ks}, \\\\
        u_s &\\ge d_s - q, & ${ks}, \\\\
        \\xi_s &\\ge c_o\\, o_s + ${st.col("a", "c_u")}\\, u_s - \\eta, & ${ks}, \\\\
        q &\\ge 0, & \\\\
        \\eta &\\gtreqless 0, & \\\\
        o_s,\\ u_s,\\ \\xi_s &\\ge 0, & ${ks}.`;
      const Co = N.c - N.v, Cu = v[0] - N.c, L = v[1], S3 = [0, 1];
      const vars = ["q", "\\eta"];
      S3.forEach((s) => vars.push(`o_{${s + 1}}`, `u_{${s + 1}}`, `\\xi_{${s + 1}}`));
      const z = () => new Array(vars.length).fill(0), ob = z();
      ob[1] = L;
      S3.forEach((s) => { ob[2 + 3 * s] = (1 - L) * Co / k; ob[3 + 3 * s] = (1 - L) * Cu / k; ob[4 + 3 * s] = L / ((1 - ALFA) * k); });
      const righe = [{ lab: MIN, c: ob, cifre: 4, rel: "+\\,\\cdots" }];
      S3.forEach((s) => {
        const a = z(), b = z(), c = z(), o = 2 + 3 * s;
        a[0] = 1; a[o] = -1; b[0] = 1; b[o + 1] = 1; c[1] = 1; c[o] = -Co; c[o + 1] = -Cu; c[o + 2] = 1;
        righe.push({ lab: s ? "" : SA(), c: a, rel: "<=", rhs: n(d[s], 2) }, { c: b, rel: ">=", rhs: n(d[s], 2) }, { c, rel: ">=", rhs: "0" });
      });
      righe.push({ puntini: true }, { dominio: [1], rel: "><", rhs: "0" }, { dominio: vars.map((x, j) => j).filter((j) => j !== 1), rel: ">=", rhs: "0" });
      const num = blocco(T(`Scenari 1 e 2, con \\(d_1, d_2\\) a destra; gli scenari \\(s = 3, \\dots, ${k}\\) aggiungono colonne \\(o_s, u_s, \\xi_s\\) e righe analoghe`,
        `Scenarios 1 and 2, with \\(d_1, d_2\\) on the right; scenarios \\(s = 3, \\dots, ${k}\\) add columns \\(o_s, u_s, \\xi_s\\) and analogous rows`), griglia(vars, righe), "plm-stretto");
      return modelloDi("newsvendor")(T(`<b>Il problema.</b> Decidiamo la quantità \\(q\\) da ordinare prima di osservare la domanda, descritta da scenari equiprobabili. ` +
        "Ogni unità invenduta costa \\(c_o\\), ogni vendita persa \\(c_u\\). L'obiettivo è minimizzare \\((1-r)\\) volte il costo atteso più \\(r\\) volte il CVaR\\(_\\alpha\\) del costo. " +
        `Il CVaR\\(_\\alpha\\) (valore a rischio condizionato) è il costo medio nella frazione \\(1 - \\alpha\\) degli scenari peggiori: con il livello di confidenza \\(\\alpha = 0{,}9\\), il costo medio nel 10% peggiore, cioè nei ${Math.round((1 - ALFA) * k)} scenari più costosi su ${k}.` +
        "<br><b>Variabili:</b> \\(q\\): quantità ordinata (unità); \\(o_s\\): unità invendute nello scenario \\(s\\); \\(u_s\\): domanda non servita nello scenario \\(s\\) (unità); " +
        "\\(\\eta\\): soglia di costo nella formula del CVaR, libera di segno (€); \\(\\xi_s\\): parte del costo dello scenario \\(s\\) che supera la soglia \\(\\eta\\) (€)." +
        `<br><b>Dati:</b> \\(k = ${k}\\): numero di scenari equiprobabili; \\(d_s\\): domanda nello scenario \\(s\\) (unità); \\(w_s = 1/${k}\\): probabilità dello scenario \\(s\\); \\(p\\): prezzo di vendita, \\(c = ${n(N.c, 0)}\\): costo d'acquisto, \\(v = ${n(N.v, 0)}\\): valore di recupero di un'invenduta (€ per unità); ` +
        "\\(c_u = p - c\\): costo di una vendita persa (€); \\(c_o = c - v\\): costo di un'unità invenduta (€); \\(r\\): peso del rischio, da 0 a 1; \\(\\alpha = 0{,}9\\): livello di confidenza del CVaR.",
      `<b>The problem.</b> We decide the quantity \\(q\\) to order before observing demand, described by equally likely scenarios. ` +
        "Each unsold unit costs \\(c_o\\), each lost sale \\(c_u\\). The objective is to minimize \\((1-r)\\) times the expected cost plus \\(r\\) times the CVaR\\(_\\alpha\\) of the cost. " +
        `The CVaR\\(_\\alpha\\) (conditional value at risk) is the average cost in the worst fraction \\(1 - \\alpha\\) of the scenarios: with the confidence level \\(\\alpha = 0.9\\), the average cost in the worst 10%, that is in the ${Math.round((1 - ALFA) * k)} most expensive scenarios out of ${k}.` +
        "<br><b>Variables:</b> \\(q\\): quantity ordered (units); \\(o_s\\): unsold units in scenario \\(s\\); \\(u_s\\): unmet demand in scenario \\(s\\) (units); " +
        "\\(\\eta\\): cost threshold in the CVaR formula, free in sign (€); \\(\\xi_s\\): part of the cost of scenario \\(s\\) above the threshold \\(\\eta\\) (€)." +
        `<br><b>Data:</b> \\(k = ${k}\\): number of equally likely scenarios; \\(d_s\\): demand in scenario \\(s\\) (units); \\(w_s = 1/${k}\\): probability of scenario \\(s\\); \\(p\\): selling price, \\(c = ${n(N.c, 0)}\\): purchase cost, \\(v = ${n(N.v, 0)}\\): salvage value of an unsold unit (€ per unit); ` +
        "\\(c_u = p - c\\): cost of a lost sale (€); \\(c_o = c - v\\): cost of an unsold unit (€); \\(r\\): risk weight, from 0 to 1; \\(\\alpha = 0.9\\): confidence level of the CVaR."),
      sim, num,
      T(`Coefficienti: \\(c_o = c - v = ${n(Co, 2)}\\), \\(c_u = p - c = ${n(Cu, 2)}\\); nella funzione obiettivo \\(o_s\\) ha \\((1-r)\\,c_o/${k}\\), \\(u_s\\) ha \\((1-r)\\,c_u/${k}\\), \\(\\xi_s\\) ha \\(r/((1-\\alpha) \\cdot ${k})\\), \\(\\eta\\) ha \\(r\\).`,
        `Coefficients: \\(c_o = c - v = ${n(Co, 2)}\\), \\(c_u = p - c = ${n(Cu, 2)}\\); in the objective function \\(o_s\\) has \\((1-r)\\,c_o/${k}\\), \\(u_s\\) has \\((1-r)\\,c_u/${k}\\), \\(\\xi_s\\) has \\(r/((1-\\alpha) \\cdot ${k})\\), \\(\\eta\\) has \\(r\\).`));
    },
    disegna(crea, R, v, C, S) {
      // come la figura del capitolo (cap08_frontiera): costo medio contro CVaR al variare del peso r, qui per il prezzo p scelto
      const F = FIG(), pesi = [0, 0.25, 0.5, 0.75, 1];
      const pti = pesi.map((r) => { const q = PL().newsvendor(v[0], r, ALFA); return { r, q: q.q, media: q.media, cv: q.cvar }; });
      const xs = [...pti.map((p) => p.cv), R.cvar], ys = [...pti.map((p) => p.media), R.media];
      const dx = Math.max(1, Math.max(...xs) - Math.min(...xs)), dy = Math.max(0.5, Math.max(...ys) - Math.min(...ys));
      const P = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto,
        xa: Math.min(...xs) - dx * 0.06, xb: Math.max(...xs) + dx * 0.32, ya: Math.min(...ys) - dy * 0.08, yb: Math.max(...ys) + dy * 0.1,
        titolo: T("Frontiera costo medio – rischio di coda", "Mean cost – tail risk frontier"),
        nx: T("CVaRα del costo, α = 0,9 (€)", "CVaRα of the cost, α = 0.9 (€)"), ny: T("costo medio (€)", "mean cost (€)") }, C, { nTx: 6, nTy: 5 });
      lineaPunti(crea, P, pti.map((p) => p.cv), pti.map((p) => p.media), F.teal, { r: 4.5 });
      pti.forEach((p) => M.scritta(crea, P.X(p.cv) + 8, P.Y(p.media), `r = ${T(p.r.toFixed(2).replace(".", ","), p.r.toFixed(2))}: q = ${nt(p.q, 0)}`, { anchorX: "left", fontSize: 11, strokeColor: C.testo }));
      M.pallino(crea, P.X(R.cvar), P.Y(R.media), { size: 7, fillColor: "none", fillOpacity: 0, strokeColor: F.arancio, strokeWidth: 3 });
      legendaIn(crea, P, [[F.teal, T("frontiera (r = 0; 0,25; 0,5; 0,75; 1)", "frontier (r = 0, 0.25, 0.5, 0.75, 1)"), "lineaPunti"],
        [F.arancio, T(`ordine ottimo con r = ${nt(v[1], 2)}: q* = ${nt(R.q, 1)}`, `optimal order with r = ${nt(v[1], 2)}: q* = ${nt(R.q, 1)}`), "punto"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("ogni punto è l'ordine ottimo \\(q^*\\) per un peso \\(r\\): costo atteso e CVaR\\(_\\alpha\\) del costo, \\(\\alpha = 0{,}9\\)", "each point is the optimal order \\(q^*\\) for a weight \\(r\\): expected cost and CVaR\\(_\\alpha\\) of the cost, \\(\\alpha = 0.9\\)"), ""],
      [F.arancio, T("l'ordine ottimo con il peso \\(r\\) del cursore", "the optimal order with the slider weight \\(r\\)"), "punto"]]; },
    letture(R, v, st, C) {
      const vss = R.costoMedia - R.media;
      return `<div>${T("Frattile critico", "Critical fractile")} \\(f^* = c_u/(c_u + c_o) = ${n(R.Cu, 1)}/${n(R.Cu + R.Co, 1)} = ${n(R.alfaStar, 4)}\\)</div>` +
        M.tab(["", T("costo atteso (€)", "exp. cost (€)"), "CVaR\\(_\\alpha\\) (€)"], [
          [M.tinta(C.blu, T("ordine ottimo \\(\\tilde q\\)", "optimal order \\(\\tilde q\\)")), nt(R.media, 2), nt(R.cvar, 2)],
          [T("\\(q = 100\\), la media", "\\(q = 100\\), the mean"), nt(R.costoMedia, 2), nt(R.f.cv(100), 2)],
        ]) +
        `<div style="margin-top:.3em">${v[1] === 0 ? T(`L'LP sceglie come \\(\\tilde q\\) il quantile empirico al ${nt(100 * R.alfaStar, 2)}% della domanda. ` +
          `Ordinare la media costerebbe ${euro(vss)} in più a ciclo (VSS, valore della soluzione stocastica).`, `The LP picks as \\(\\tilde q\\) the empirical quantile at ${nt(100 * R.alfaStar, 2)}% of demand. ` +
          `Ordering the mean would cost ${euro(vss)} more per cycle (VSS, value of the stochastic solution).`)
          : T("Con \\(r > 0\\) si ordina di più: si paga in costo medio per proteggersi dagli scenari di coda.", "With \\(r > 0\\) one orders more: one pays in average cost to be protected from the tail scenarios.")}</div>`;
    },
    soluzione(R, v) {
      // õ_s, ũ_s, ξ̃_s dei 600 scenari in sintesi: in quanti scenari sono positive, media e massimo
      const k = R.d.length, q = R.q, r = v[1];
      const o = R.d.map((d) => Math.max(0, q - d)), u = R.d.map((d) => Math.max(0, d - q));
      const costi = o.map((x, s) => R.Co * x + R.Cu * u[s]), eta = O.vaR(costi, ALFA), xi = costi.map((c) => Math.max(0, c - eta));
      const riga = (nome, a, c = 1) => { const pos = a.filter((x) => x > 1e-9); return [nome, `${pos.length} / ${k}`, nt(a.reduce((s, x) => s + x, 0) / k, c), pos.length ? nt(Math.max(...pos), c) : "—"]; };
      const righe = [riga(T("\\(\\tilde o_s\\): invendute (unità)", "\\(\\tilde o_s\\): unsold (units)"), o), riga(T("\\(\\tilde u_s\\): domanda non servita (unità)", "\\(\\tilde u_s\\): unmet demand (units)"), u)];
      if (r > 0) righe.push(riga(T("\\(\\tilde\\xi_s\\): costo oltre \\(\\tilde\\eta\\) (€)", "\\(\\tilde\\xi_s\\): cost above \\(\\tilde\\eta\\) (€)"), xi, 2));
      return SOL.blocco(`${T("Valore ottimo", "Optimal value")}: <b>${euro(R.obiettivo)}</b> ` +
        (r > 0 ? T(`(\\(1 - r\\) volte il costo atteso più \\(r\\) volte il CVaR\\(_\\alpha\\))`, `(\\(1 - r\\) times the expected cost plus \\(r\\) times the CVaR\\(_\\alpha\\))`) : T("(costo atteso)", "(expected cost)")) +
        `<br>\\(\\tilde q = ${n(q, 2)}\\) ${T("unità", "units")} · ` +
        (r > 0 ? `\\(\\tilde\\eta = ${n(eta, 2)}\\) € ${T("(un VaR\\(_\\alpha\\) del costo)", "(a VaR\\(_\\alpha\\) of the cost)")}`
          : T("con \\(r = 0\\), \\(\\eta\\) e \\(\\xi_s\\) non entrano nella funzione obiettivo", "with \\(r = 0\\), \\(\\eta\\) and \\(\\xi_s\\) do not enter the objective function")), [
        SOL.tab(T(`Variabili di scenario, in sintesi sui ${k} scenari`, `Scenario variables, summarized over the ${k} scenarios`),
          [T("variabile", "variable"), T("positiva in", "positive in"), T("media", "mean"), T("massimo", "maximum")], righe),
      ]);
    },
    domanda: T("Con \\(r = 0\\) muovi \\(p\\): l'ordine ottimo segue il frattile critico \\(f^*\\). Poi porta \\(r\\) a 1: di quanto cresce \\(q^*\\), di quanto il costo medio, di quanto scende il CVaR?",
      "With \\(r = 0\\) move \\(p\\): the optimal order follows the critical fractile \\(f^*\\). Then set \\(r\\) to 1: how much does \\(q^*\\) grow, how much the average cost, how much does the CVaR drop?"),
  };

  // ================================================================ DEA (cap. 6)
  const deaVoce = (vrs, vista, etichetta) => ({
    etichetta,
    cursori: [{ nome: T("\\text{filiale}", "\\text{branch}"), min: 1, max: 12, step: 1, val: 1, fmt: (x) => T(`${Math.round(x)} di 12`, `${Math.round(x)} of 12`),
      descr: T("la filiale valutata \\(o\\), fra le 12", "the branch under evaluation \\(o\\), among the 12") }],
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
      // numerico: una colonna per variabile (theta, lambda_1..lambda_n)
      const d = DD().dea, oo = Math.round(v[0]) - 1;
      const X = vista === "1x1" ? [d.personale] : [d.personale, d.costi], Y = vista === "1x1" ? [d.prestiti] : [d.prestiti, d.depositi];
      const nn = X[0].length;
      const nomiI = vista === "1x1" ? [T("personale", "staff")] : [T("personale", "staff"), T("costi", "costs")];
      const nomiR = vista === "1x1" ? [T("prestiti", "loans")] : [T("prestiti", "loans"), T("depositi", "deposits")];
      const vars = ["\\theta", ...X[0].map((q, j) => `\\lambda_{${j + 1}}`)], ob = vars.map((q, j) => (j ? 0 : 1));
      const righe = [{ lab: MIN, c: ob }];
      X.forEach((r, i) => righe.push({ lab: i ? "" : SA(), c: [r[oo], ...r.map((q) => -q)], rel: ">=", rhs: "0", cifre: 1 }));
      Y.forEach((r) => righe.push({ c: [0, ...r], rel: ">=", rhs: n(r[oo], 1), cifre: 1 }));
      if (vrs) righe.push({ c: [0, ...new Array(nn).fill(1)], rel: "=", rhs: "1" });
      righe.push({ dominio: [0], rel: "><", rhs: "0" }, { dominio: vars.map((q, j) => j).filter((j) => j), rel: ">=", rhs: "0" });
      const num = blocco(T(`Filiale \\(o = ${oo + 1}\\). Righe: input (${nomiI.join(", ")}), poi output (${nomiR.join(", ")})${vrs ? ", poi \\(\\sum_j \\lambda_j = 1\\)" : ""}`,
        `Branch \\(o = ${oo + 1}\\). Rows: inputs (${nomiI.join(", ")}), then outputs (${nomiR.join(", ")})${vrs ? ", then \\(\\sum_j \\lambda_j = 1\\)" : ""}`), grigliaLunga(vars, righe, 7));
      return modelloDi("dea")(T(`<b>Il problema.</b> Per la filiale valutata \\(o = ${oo + 1}\\) cerchiamo i pesi \\(\\lambda_j\\) delle ${nn} filiali e il fattore \\(\\theta\\): la combinazione pesata deve produrre almeno gli output di \\(o\\) (${nomiR.join(", ")}) usando al più \\(\\theta\\) volte i suoi input (${nomiI.join(", ")}). ` +
        `L'obiettivo è minimizzare \\(\\theta\\), l'efficienza della filiale${vrs ? "; il vincolo \\(\\sum_j \\lambda_j = 1\\) dà il modello BCC" : ""}.` +
        "<br><b>Variabili:</b> \\(\\theta\\): fattore per cui si possono moltiplicare gli input di \\(o\\), cioè la sua efficienza (\\(\\theta = 1\\): efficiente); \\(\\lambda_j\\): peso della filiale \\(j\\) nella filiale virtuale di confronto." +
        `<br><b>Dati:</b> \\(n = ${nn}\\): numero di filiali; \\(m = ${nomiI.length}\\): numero di input; \\(p = ${nomiR.length}\\): numero di output; \\(x_{ij}\\): quantità dell'input \\(i\\) usata dalla filiale \\(j\\) (personale in FTE, addetti a tempo pieno${vista === "1x1" ? "" : "; costi operativi in k€"}); ` +
        `\\(y_{rj}\\): quantità dell'output \\(r\\) prodotta dalla filiale \\(j\\) (prestiti${vista === "1x1" ? "" : " e depositi"} in M€); \\(o\\): la filiale valutata. ` +
        "CCR (Charnes, Cooper, Rhodes): rendimenti di scala costanti; BCC (Banker, Charnes, Cooper): aggiunge \\(\\sum_j \\lambda_j = 1\\), rendimenti di scala variabili.",
      `<b>The problem.</b> For the branch under evaluation \\(o = ${oo + 1}\\) we look for the weights \\(\\lambda_j\\) of the ${nn} branches and the factor \\(\\theta\\): the weighted combination must produce at least the outputs of \\(o\\) (${nomiR.join(", ")}) using at most \\(\\theta\\) times its inputs (${nomiI.join(", ")}). ` +
        `The objective is to minimize \\(\\theta\\), the efficiency of the branch${vrs ? "; the constraint \\(\\sum_j \\lambda_j = 1\\) gives the BCC model" : ""}.` +
        "<br><b>Variables:</b> \\(\\theta\\): factor by which the inputs of \\(o\\) can be multiplied, that is its efficiency (\\(\\theta = 1\\): efficient); \\(\\lambda_j\\): weight of branch \\(j\\) in the virtual comparison branch." +
        `<br><b>Data:</b> \\(n = ${nn}\\): number of branches; \\(m = ${nomiI.length}\\): number of inputs; \\(p = ${nomiR.length}\\): number of outputs; \\(x_{ij}\\): amount of input \\(i\\) used by branch \\(j\\) (staff in FTE, full-time equivalent employees${vista === "1x1" ? "" : "; operating costs in k€"}); ` +
        `\\(y_{rj}\\): amount of output \\(r\\) produced by branch \\(j\\) (loans${vista === "1x1" ? "" : " and deposits"} in M€); \\(o\\): the branch under evaluation. ` +
        "CCR (Charnes, Cooper, Rhodes): constant returns to scale; BCC (Banker, Charnes, Cooper): adds \\(\\sum_j \\lambda_j = 1\\), variable returns to scale."),
      sim, num);
    },
    disegna(crea, R, v, C, S) {
      // come la figura del capitolo (cap07_frontiera): filiali nel piano personale-prestiti, frontiere CCR e BCC
      const d = DD().dea, o = R.o, F = FIG();
      const P = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto, xa: 0, xb: 32, ya: 0, yb: 76,
        titolo: vista === "1x1" ? T("Frontiere efficienti CCR e BCC: personale e prestiti", "CCR and BCC efficient frontiers: staff and loans")
          : T("Filiali nel piano personale-prestiti (il modello usa i 4 indicatori)", "Branches in the staff-loans plane (the model uses the 4 indicators)"),
        nx: T("personale (FTE)", "staff (FTE)"), ny: T("prestiti (M€)", "loans (M€)") }, C, { nTx: 7, nTy: 7 });
      if (vista === "1x1") {
        crea("curve", [[P.X(0), P.X(32)], [P.Y(0), P.Y(Math.min(72, R.pend * 32))]], { strokeColor: F.rosso, strokeWidth: vrs ? 1.6 : 2.4, dash: 2, fixed: true, highlight: false });
        crea("curve", [R.vrs.map((q) => P.X(q[0])), R.vrs.map((q) => P.Y(q[1]))], { strokeColor: F.teal, strokeWidth: vrs ? 2.8 : 1.6, fixed: true, highlight: false });
      }
      // target (input orientato) e peer
      const tx0 = R.tIn[0], ty0 = R.tOut[0];
      for (const [j, l] of R.peer) {
        if (j === o) continue;
        M.linea(crea, P.X(tx0), P.Y(ty0), P.X(d.personale[j]), P.Y(d.prestiti[j]), { strokeColor: F.verde, strokeWidth: 1.2, dash: 1 });
        M.pallino(crea, P.X(d.personale[j]), P.Y(d.prestiti[j]), { size: 9, fillColor: "none", fillOpacity: 0, strokeColor: F.verde, strokeWidth: 2 });
        M.scritta(crea, P.X(d.personale[j]) + 12, P.Y(d.prestiti[j]) - 12, "λ = " + nt(l, 3), { anchorX: "left", fontSize: 11, strokeColor: F.verde });
      }
      d.personale.forEach((x, j) => {
        M.pallino(crea, P.X(x), P.Y(d.prestiti[j]), { size: j === o ? 6 : 4, fillColor: j === o ? F.arancio : F.navy, strokeColor: "#ffffff", strokeWidth: 1 });
        M.scritta(crea, P.X(x) + 7, P.Y(d.prestiti[j]) + 7, String(j + 1), { anchorX: "left", anchorY: "bottom", fontSize: j === o ? 14 : 11, strokeColor: j === o ? F.arancio : C.testo, cssStyle: j === o ? "font-weight:700" : "" });
      });
      if (Math.hypot(tx0 - d.personale[o], ty0 - d.prestiti[o]) > 0.05) {
        crea("arrow", [[P.X(d.personale[o]), P.Y(d.prestiti[o])], [P.X(tx0), P.Y(ty0)]], { strokeColor: F.arancio, strokeWidth: 2.5, fixed: true, highlight: false, lastArrow: { type: 2, size: 6 } });
        M.pallino(crea, P.X(tx0), P.Y(ty0), { size: 5, fillColor: C.card || "#fff", strokeColor: F.arancio, strokeWidth: 2 });
      }
      legendaIn(crea, P, [...(vista === "1x1" ? [[F.rosso, T("frontiera CCR (scala costante)", "CCR frontier (constant scale)"), "tratteggio"],
        [F.teal, T("frontiera BCC (scala variabile)", "BCC frontier (variable scale)"), "linea"]] : []),
        [F.navy, T("filiali", "branches"), "punto"], [F.arancio, T("filiale valutata e target", "evaluated branch and target"), "punto"],
        [F.verde, T("peer", "peers"), "punteggiata"]], C, "sx");
    },
    legenda: () => { const F = FIG(); return [[F.navy, T("filiali \\(j\\): personale \\(x_{1j}\\) e prestiti \\(y_{1j}\\)", "branches \\(j\\): staff \\(x_{1j}\\) and loans \\(y_{1j}\\)"), "punto"],
      [F.arancio, T("filiale valutata \\(o\\); la freccia porta al target \\(\\theta\\, x_{1o}\\)", "evaluated branch \\(o\\); the arrow leads to the target \\(\\theta\\, x_{1o}\\)"), ""],
      [F.verde, T("peer (\\(\\lambda_j > 0\\))", "peers (\\(\\lambda_j > 0\\))"), "dotted"],
      ...(vista === "1x1" ? [[F.rosso, T("frontiera CCR", "CCR frontier"), "dashed"], [F.teal, T("frontiera BCC", "BCC frontier"), ""]] : [])]; },
    letture(R, v, st, C) {
      const nomi = vista === "1x1" ? [T("personale", "staff"), T("prestiti", "loans")] : [T("personale", "staff"), T("costi", "costs"), T("prestiti", "loans"), T("depositi", "deposits")];
      const att = [...R.X.map((r) => r[R.o]), ...R.Y.map((r) => r[R.o])], tgt = [...R.tIn, ...R.tOut], sc = [...R.sIn, ...R.sOut];
      const eff = Math.abs(R.theta - 1) < 1e-6;
      return `<div>${T("Target: input e output della filiale virtuale, combinazione dei peer con pesi \\(\\lambda_j\\); scarto: riduzione di input o aumento di output ancora possibile oltre al fattore \\(\\theta\\).",
          "Target: inputs and outputs of the virtual branch, combination of the peers with weights \\(\\lambda_j\\); slack: reduction of input or increase of output still possible beyond the factor \\(\\theta\\).")}</div>` +
        M.tab(["", T("attuale", "actual"), "target", T("scarto", "slack")], nomi.map((nm, k) => [nm, nt(att[k], 1), nt(tgt[k], k < R.X.length ? 2 : 2), nt(sc[k], 2)])) +
        `<div style="margin-top:.3em">${eff ? T("Nessuna combinazione di filiali fa meglio con meno input.", "No combination of branches does better with fewer inputs.")
          : T(`Una combinazione dei peer produce almeno gli stessi output con il ${nt(100 * R.theta, 1)}% degli input.`, `A combination of the peers produces at least the same outputs with ${nt(100 * R.theta, 1)}% of the inputs.`)}</div>`;
    },
    soluzione(R, v, st, C) {
      if (R.stato !== "ottimo") return "";
      const eff = Math.abs(R.theta - 1) < 1e-6, nn = R.lam.length;
      return SOL.blocco(`${T("Valore ottimo", "Optimal value")}: <b>\\(\\tilde\\theta = ${n(R.theta, 4)}\\)</b>, ${T("efficienza della filiale", "efficiency of branch")} ${R.o + 1} · ` +
        (eff ? M.tinta(C.c, T("sulla frontiera", "on the frontier")) : M.tinta(C.a, T("inefficiente", "inefficient"))), [
        SOL.tab(T(`Pesi \\(\\tilde\\lambda_j > 0\\): i peer (le altre ${nn - R.peer.length} filiali hanno \\(\\tilde\\lambda_j = 0\\))`, `Weights \\(\\tilde\\lambda_j > 0\\): the peers (the other ${nn - R.peer.length} branches have \\(\\tilde\\lambda_j = 0\\))`),
          [T("filiale \\(j\\)", "branch \\(j\\)"), ...R.peer.map(([j]) => String(j + 1))], [[tx("\\tilde\\lambda_j"), ...R.peer.map(([, l]) => nt(l, 4))]]),
      ]);
    },
    domanda: T("Passa le filiali con ▶: quali sono efficienti nel modello CCR e quali solo nel BCC? Nella vista personale→prestiti la filiale 6 è lontana dalla frontiera CCR ma sulla BCC: che cosa dice dei rendimenti di scala?",
      "Go through the branches with ▶: which are efficient in the CCR model and which only in BCC? In the staff→loans view branch 6 is far from the CCR frontier but on the BCC one: what does it say about returns to scale?"),
  });

  // ================================================================ registrazione
  const R = (nome, opz, voci) => { SOL.voci(voci); window.GI_RICETTE[nome] = () => O.ricettaVoci(opz, voci); };
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
  const DATI_REG = { t: null, y: null, rette: null };
  /** blocco «Soluzione ottima» della regressione: w̃, b̃, valore ottimo e quanti ũ_i, ṽ_i sono positivi, per le due rette */
  const solRegressione = (p) => {
    const rr = DATI_REG.rette, m = (DATI_REG.t || []).length;
    if (!rr || !m) return "";
    const riga = (r, nome) => [nome, nt(r.w, 3), nt(r.b, 2), nt(r.f, 2), `${r.sopra} / ${m}`, `${r.sotto} / ${m}`];
    return SOL.blocco(T("Le due rette sono le soluzioni ottime dello stesso LP con due valori di \\(\\tau\\).", "The two lines are the optimal solutions of the same LP with two values of \\(\\tau\\)."), [
      SOL.tab("", ["", T("\\(\\tilde w\\) (pezzi/°C)", "\\(\\tilde w\\) (pieces/°C)"), T("\\(\\tilde b\\) (pezzi)", "\\(\\tilde b\\) (pieces)"),
        T("valore ottimo (pezzi)", "optimal value (pieces)"), T("giorni con \\(\\tilde u_i > 0\\)", "days with \\(\\tilde u_i > 0\\)"), T("giorni con \\(\\tilde v_i > 0\\)", "days with \\(\\tilde v_i > 0\\)")],
        [riga(rr[0], M.tinta(FIG().navy, "\\(\\tau = 1/2\\)")), riga(rr[1], M.tinta(FIG().verde, `\\(\\tau = ${n(p.tau, 2)}\\)`))]),
    ], T("\\(\\tilde u_i > 0\\): giorno sopra la retta; \\(\\tilde v_i > 0\\): sotto; gli altri giorni stanno sulla retta.", "\\(\\tilde u_i > 0\\): day above the line; \\(\\tilde v_i > 0\\): below; the other days lie on the line."));
  };
  window.GI_RICETTE["pl-regressione"] = () => { const ric = O.ricettaRetta({
    titolo: T("Scarti assoluti e regressione quantile", "Least absolute deviations and quantile regression"),
    dati: () => DD().panetteria,
    // come la figura del capitolo (cap11_quantili): punti grigi, retta mediana blu notte, retta del quantile verde
    titoloGrafico: () => T("Retta mediana e retta del quantile τ", "Median line and τ-quantile line"),
    coloreTitolo: () => FIG().blu, colorePunti: () => FIG().grigio, coloreAppoggio: () => FIG().verde, coloreSciopero: () => FIG().rosso,
    nomeX: () => T("temperatura massima xᵢ (°C)", "maximum temperature xᵢ (°C)"), nomeY: () => T("domanda yᵢ (pezzi)", "demand yᵢ (pieces)"),
    legendaGrafico: true, appoggioNome: () => T("punti di appoggio della retta τ", "support points of the τ line"),
    parametri: [{ k: "tau", nome: "\\tau", min: 0.05, max: 0.95, step: 0.01, val: 0.69, colore: "c", cifre: 2,
      descr: T("livello del quantile: \\(9/13 \\approx 0{,}69\\) è il frattile critico \\(c_u/(c_u + c_o)\\) del newsvendor, con vendita persa \\(c_u = 9\\) € e invenduto \\(c_o = 4\\) €", "quantile level: \\(9/13 \\approx 0.69\\) is the critical fractile \\(c_u/(c_u + c_o)\\) of the newsvendor, with lost sale \\(c_u = 9\\) € and unsold unit \\(c_o = 4\\) €") }],
    rette(t, y, p, C) {
      DATI_REG.t = t; DATI_REG.y = y;
      const lad = PL().regressione(t, y, 0.5), q = PL().regressione(t, y, p.tau);
      return [
        { ...lad, colore: FIG().navy, nome: T("scarti assoluti (LP, \\(\\tau = 1/2\\))", "least absolute deviations (LP, \\(\\tau = 1/2\\))"),
          breve: T("τ = 1/2: scarti assoluti (LP)", "τ = 1/2: least absolute deviations (LP)"), stile: { strokeWidth: 3 } },
        { ...q, colore: FIG().verde, nome: T("quantile \\(\\tau\\)", "\\(\\tau\\)-quantile"),
          breve: T(`τ = ${nt(p.tau, 2)}: quantile`, `τ = ${nt(p.tau, 2)}: quantile`), stile: { strokeWidth: 3 } },
      ];
    },
    appoggio: (rette) => rette[1].appoggio,
    formula(p, st) {
      const tau = st.col("c", "\\tau"), ni = PER("i", "n");
      const sim = `\\min ~ \\sum_{i=1}^{n} \\bigl[\\, ${tau}\\, u_i + (1 - ${tau})\\, v_i \\,\\bigr] & & \\\\
        ${SA()} \\quad w\\, x_i + b + u_i - v_i &= y_i, & ${ni}, \\\\
        w &\\gtreqless 0, & \\\\
        b &\\gtreqless 0, & \\\\
        u_i,\\; v_i &\\ge 0, & ${ni}.`;
      const t = DATI_REG.t || [], y = DATI_REG.y || [], m = t.length, ii = [0, 1, 2].filter((i) => i < m);
      const vars = ["w", "b"];
      ii.forEach((i) => vars.push(`u_{${i + 1}}`, `v_{${i + 1}}`));
      const z = () => new Array(vars.length).fill(0), ob = z();
      ii.forEach((i) => { ob[2 + 2 * i] = p.tau; ob[3 + 2 * i] = 1 - p.tau; });
      const righe = [{ lab: MIN, c: ob, rel: "+\\,\\cdots" }];
      ii.forEach((i) => { const c = z(); c[0] = t[i]; c[1] = 1; c[2 + 2 * i] = 1; c[3 + 2 * i] = -1; righe.push({ lab: i ? "" : SA(), c, rel: "=", rhs: n(y[i], 1), cifre: 1 }); });
      righe.push({ puntini: true }, { dominio: [0, 1], rel: "><", rhs: "0" }, { dominio: vars.map((q, j) => j).filter((j) => j > 1), rel: ">=", rhs: "0" });
      const num = blocco(T(`Giorni 1, 2, 3, con \\(x_i\\) (temperatura) come coefficiente di \\(w\\) e \\(y_i\\) a destra; i giorni \\(i = 4, \\dots, ${m}\\) aggiungono colonne \\(u_i, v_i\\) e righe analoghe`,
        `Days 1, 2, 3, with \\(x_i\\) (temperature) as the coefficient of \\(w\\) and \\(y_i\\) on the right; days \\(i = 4, \\dots, ${m}\\) add columns \\(u_i, v_i\\) and analogous rows`), griglia(vars, righe));
      return modelloDi("regressione")(T(`<b>Il problema.</b> Decidiamo la pendenza \\(w\\) e l'intercetta \\(b\\) della retta che stima la domanda \\(y_i\\) dalla temperatura \\(x_i\\); \\(u_i\\) e \\(v_i\\) sono gli scostamenti in eccesso e in difetto. ` +
        "L'obiettivo è minimizzare la somma degli scostamenti pesati \\(\\tau\\) e \\(1 - \\tau\\) (con \\(\\tau = 1/2\\) si ottengono gli scarti assoluti)." +
        "<br><b>Variabili:</b> \\(w\\): pendenza della retta (pezzi per °C), libera di segno; \\(b\\): intercetta (pezzi), libera di segno; \\(u_i\\): quanto la domanda \\(y_i\\) supera la retta nel giorno \\(i\\) (pezzi); \\(v_i\\): quanto la domanda \\(y_i\\) resta sotto la retta (pezzi)." +
        `<br><b>Dati:</b> \\(n = ${m}\\): numero di giorni osservati (punti); ` + "\\(x_i\\): temperatura massima del giorno \\(i\\) (°C); \\(y_i\\): domanda di pane del giorno \\(i\\) (pezzi); \\(\\tau\\): livello del quantile, fra 0 e 1, cioè la quota di giorni che la retta lascia sotto di sé. I 5 giorni di sciopero hanno domanda anomala, molto bassa.",
      `<b>The problem.</b> We decide the slope \\(w\\) and the intercept \\(b\\) of the line that estimates demand \\(y_i\\) from the temperature \\(x_i\\); \\(u_i\\) and \\(v_i\\) are the deviations in excess and in defect. ` +
        "The objective is to minimize the sum of the deviations weighted by \\(\\tau\\) and \\(1 - \\tau\\) (with \\(\\tau = 1/2\\) one gets least absolute deviations)." +
        "<br><b>Variables:</b> \\(w\\): slope of the line (pieces per °C), free in sign; \\(b\\): intercept (pieces), free in sign; \\(u_i\\): how much demand \\(y_i\\) exceeds the line on day \\(i\\) (pieces); \\(v_i\\): how much demand \\(y_i\\) falls below the line (pieces)." +
        `<br><b>Data:</b> \\(n = ${m}\\): number of observed days (points); ` + "\\(x_i\\): maximum temperature of day \\(i\\) (°C); \\(y_i\\): bread demand of day \\(i\\) (pieces); \\(\\tau\\): quantile level, between 0 and 1, that is the share of days the line leaves below it. The 5 strike days have anomalous, very low demand."),
      sim, num,
      T("Il modello numerico è quello della retta \\(\\tau\\) con i punti attuali, anche quelli trascinati.",
        "The numerical model is the one of the \\(\\tau\\) line with the current points, dragged ones included."));
    },
    letture(rette, p, dati, C) {
      const [lad, q] = rette, m = dati.t.length;
      DATI_REG.rette = rette;
      return `<div>${T("Retta τ", "τ line")}: ${T("quota dei giorni sotto", "share of days below")} ${q.sotto}/${m} = ${nt(q.sotto / m, 3)}, ` +
        `${T("sulla retta", "on it")} ${q.appoggio.length} (${T("i due punti di appoggio, cerchiati", "the two support points, circled")})</div>` +
        `<div style="margin-top:.3em">${T("La quota sotto la retta sta fra", "The share below the line lies between")} \\(${n(q.sotto / m, 3)}\\) ${T("e", "and")} \\(${n((q.sotto + q.appoggio.length) / m, 3)}\\): ${T("contiene sempre", "it always contains")} \\(\\tau\\).</div>`;
    },
    domanda: T("Trascina in basso un giorno caldo, di 100 pezzi: quanto si sposta la retta degli scarti assoluti? Poi muovi \\(\\tau\\): quanti giorni restano sotto la retta? Con i 5 scioperi e senza, le rette cambiano di poco: perché?",
      "Drag a hot day down by 100 pieces: how much does the least absolute deviations line move? Then move \\(\\tau\\): how many days stay below the line? With and without the 5 strike days the lines barely change: why?"),
  });
    const vecchie = ric.letture;
    ric.letture = (p, st) => { const out = vecchie(p, st); SOL.mostra(st, solRegressione(p)); return out; };
    return ric;
  };
})();
