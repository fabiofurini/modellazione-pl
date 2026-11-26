/* Laboratorio di «Modellazione PL / LP Modelling»: le ricette delle app.
 *
 *   pl-produzione  cap. 5: piano ottimo, scorte, ore macchina e mesi saturi
 *   pl-ricarica-ev cap. 6: ricarica notturna a costo minimo
 *   pl-dea         cap. 7: efficienza, peer e target di una filiale (CCR/BCC, 4 indicatori o personale→prestiti)
 *   pl-newsvendor  cap. 8: costo atteso e CVaR sui 10 scenari, ordine ottimo
 *   pl-regressione cap. 11: scarti assoluti e quantile, punti trascinabili
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
   *  voci: [colore, testo, tipo] con tipo "barra", "linea", "lineaPunti", "tratteggioPunti", "tratteggio", "punteggiata", "punto",
   *  "puntoVuoto" (pallino vuoto: un dato) */
  function legendaIn(crea, P, voci, C, dove = "sx") {
    const fs = 11.5, passo = 17, lung = 20;
    const largo = Math.max(...voci.map((v) => v[1].length)) * fs * 0.56 + lung + 10;
    const x0 = dove === "sx" ? P.X0 + 12 : Math.max(P.X0 + 12, P.X1 - largo - 6);
    voci.forEach(([col, testo, tipo], k) => {
      const y = P.Y1 - 12 - k * passo;
      if (tipo === "barra") M.rett(crea, x0 + 2, y - 5, x0 + lung - 2, y + 5, { fillColor: col, fillOpacity: 1, strokeColor: col, strokeWidth: 0.5 });
      else if (tipo === "punto") M.pallino(crea, x0 + lung / 2, y, { size: 4, fillColor: col, strokeColor: col });
      else if (tipo === "puntoVuoto") M.pallino(crea, x0 + lung / 2, y, { size: 4, fillColor: C.card || "#ffffff", strokeColor: col, strokeWidth: 1.5 });
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
  /** gradini larghi 1 centrati sui punti x0, x0 + 1, ... (matplotlib stairs / drawstyle="steps-mid") */
  const gradini = (crea, P, ys, col, opz = {}) => {
    const xs = [], yy = [], x0 = opz.x0 || 0;
    ys.forEach((y, t) => { xs.push(x0 + t - 0.5, x0 + t + 0.5); yy.push(y, y); });
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
    if (d && d.classList && d.classList.contains("plm-num")) { NUM.aperto = d.open; window.dispatchEvent(new Event("resize")); }
  }, true);
  // il modello numerico si apre in linea (sopra il grafico, che scende): le app a tutta pagina ricalcolano il
  // grafico quando il riquadro del modello cambia altezza
  if (window.ResizeObserver) {
    let attesa = 0;
    const ro = new ResizeObserver(() => { clearTimeout(attesa); attesa = setTimeout(() => window.dispatchEvent(new Event("resize")), 120); });
    // il modello numerico non scorre mai di lato: se l'array è più largo del riquadro (cursori che allungano i
    // coefficienti, schermi stretti) il suo corpo scende quanto basta, fino a 0,75em (CHTML scala con il font); oltre, il riquadro scorre
    const BASE = 1.45, MINIMO = 0.75;   // cresce fino a riempire il riquadro (Fabio: «occupa bene lo spazio»)
    const adatta = (cont) => {
      const box = cont.closest(".plm-array");
      if (!box || !box.clientWidth) return;
      const ora = parseFloat(box.dataset.fs || BASE), largo = (cont.querySelector("mjx-table") || cont).getBoundingClientRect().width / ora;   // le celle vere: mjx-mtable resta largo con le spaziature originali di MathJax
      const fs = Math.max(MINIMO, Math.min(BASE, Math.floor(((box.clientWidth - 12) / largo) * 100) / 100));
      if (Math.abs(fs - ora) > 0.004) { box.dataset.fs = fs; box.style.fontSize = fs + "em"; }
    };
    const roArray = new ResizeObserver((voci) => voci.forEach((v) => adatta(v.target)));
    const osserva = () => {
      document.querySelectorAll(".gi-app-intera .gi-formula:not([data-plm])").forEach((f) => { f.dataset.plm = "1"; ro.observe(f); });
      document.querySelectorAll(".plm-array mjx-container:not([data-plm])").forEach((m) => { m.dataset.plm = "1"; roArray.observe(m); });
    };
    new MutationObserver(osserva).observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("resize", () => document.querySelectorAll(".plm-array mjx-container").forEach(adatta));
  }
  const SA = () => T("\\text{soggetto a}", "\\text{subject to}");
  const PER = (i, m) => `\\forall ${i} \\in \\{1, 2, \\dots, ${m}\\}`;
  const REL = { "<=": "\\le", "=": "=", ">=": "\\ge", "><": "\\gtreqless" };
  /** (solo la regressione, con i suoi 60 giorni: le altre app usano arrayLP qui sotto)
   *  griglia nello stile delle dispense (array rcrc…cr): una colonna per variabile con i segni in colonne
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
  /** Il modello numerico in UN SOLO array, nello stile delle dispense (tecniche-modelli-01 e -05), costruito
   *  dalle stesse righe che vanno al simplesso. Una colonna per variabile, la stessa in tutte le righe, i segni
   *  in colonne proprie, celle vuote per le variabili assenti; prima riga \max/\min, «soggetto a» sul primo
   *  vincolo, variabili a sinistra e termine noto a destra di ≤ = ≥, \\[1ex] fra le righe, in fondo le righe
   *  delle variabili (separate da virgole) con il loro dominio.
   *  P = { senso: "min"|"max", vars: [nomi TeX], c: [costi], righe: [{ a: [coefficienti], rel, rhs, cifre }],
   *        dominio: [{ cols: [indici], rel, rhs }] (di default tutte ≥ 0), cifre, cifreObj, limiti (vedi sotto),
   *        pezzi: [[indici o null], ...] }
   *  «pezzi» con un solo elemento dà l'ordine delle colonne. Con più pezzi le righe lunghe vanno a capo come in tecniche-modelli-05: ogni pezzo è una riga
   *  dell'array (null = colonna vuota), la continuazione comincia con il suo segno, relazione e termine noto
   *  stanno sull'ultima riga, \\[1.5ex] fra un vincolo e l'altro. Una variabile resta sempre nella sua colonna. */
  const arrayLP = (P) => {
    const N = P.vars.length, tutte = [...Array(N).keys()];
    const pezzi = P.pezzi || [tutte], avv = pezzi.length > 1;   // un solo pezzo: solo l'ordine delle colonne
    const Q = Math.max(...pezzi.map((g) => g.length));
    const nz = (a) => a && Math.abs(a) > 1e-12;
    const fmt = P.fmt || n;   // P.fmt: formattatore dei numeri (FR.tex per le frazioni), di default GI.num
    const rhsTex = (r, c) => (typeof r === "number" ? fmt(r, c ?? 2) : r ?? "");
    const righe = [{ lab: P.senso === "max" ? "\\max" : "\\min", c: P.c, cifre: P.cifreObj ?? P.cifre ?? 3 }];
    // con P.limiti i limiti semplici x_j <= u (una sola variabile, coefficiente 1) si scrivono come la riga del dominio:
    // una riga per valore di u, le variabili nelle loro colonne separate da virgole («x_{11}, ..., x_{16} <= 11»)
    const semplice = (r) => P.limiti && r.rel === "<=" && r.a.filter(nz).length === 1 && Math.abs(r.a.find(nz) - 1) < 1e-12;
    const limiti = new Map();
    P.righe.filter((r) => !semplice(r)).forEach((r, i) => righe.push({ lab: i ? "" : SA(), c: r.a, rel: r.rel, rhs: rhsTex(r.rhs, r.cifre ?? P.cifre), cifre: r.cifre ?? P.cifre ?? 3 }));
    P.righe.filter(semplice).forEach((r) => {
      const u = rhsTex(r.rhs, r.cifre ?? P.cifre);
      if (!limiti.has(u)) limiti.set(u, []);
      limiti.get(u).push(r.a.findIndex(nz));
    });
    limiti.forEach((cols, u) => righe.push({ dominio: cols, rel: "<=", rhs: u }));
    (P.dominio || [{ cols: tutte, rel: ">=", rhs: "0" }]).forEach((d) => righe.push({ dominio: d.cols, rel: d.rel, rhs: d.rhs }));
    const br = (s) => (s === "" ? "" : /^\\text/.test(s) ? s : `{${s}}`);
    const out = [];
    righe.forEach((r, ir) => {
      const usa = (j) => j != null && (r.dominio ? r.dominio.includes(j) : nz(r.c[j]));
      let usati = pezzi.map((g, k) => k).filter((k) => pezzi[k].some(usa));
      if (!usati.length) usati = [0];
      const ultimoDom = r.dominio ? Math.max(...r.dominio) : -1;
      let visto = false;
      usati.forEach((k, q) => {
        const g = pezzi[k], celle = [q === 0 ? r.lab || "" : ""];
        for (let p = 0; p < Q; p++) {
          const j = g[p];
          let s = "", t = "";
          if (usa(j)) {
            if (r.dominio) t = P.vars[j] + (j === ultimoDom ? "" : ",");
            else {
              const a = r.c[j];
              t = (Math.abs(Math.abs(a) - 1) < 1e-12 ? "" : fmt(Math.abs(a), r.cifre) + "\\,") + P.vars[j];
              s = a < 0 ? "-" : visto ? "+" : "";
              visto = true;
            }
          }
          if (!avv && p === 0) celle.push(s === "-" ? "-" + t : t);   // senza a capo la prima colonna non ha la colonna del segno
          else celle.push(s, t);
        }
        if (!visto && !r.dominio && q === usati.length - 1) celle[avv ? 2 : 1] = "0";   // riga senza variabili
        const ultima = q === usati.length - 1;
        celle.push(ultima && r.rel ? REL[r.rel] || r.rel : "", ultima ? r.rhs ?? "" : "");
        while (celle.length && celle[celle.length - 1] === "") celle.pop();
        const sep = !ultima ? " \\\\\n" : ir === righe.length - 1 ? "\n" : avv ? " \\\\[1.5ex]\n" : " \\\\[1ex]\n";
        out.push(celle.map(br).join(" & ") + sep);
      });
    });
    const spec = avv ? "r" + "cr".repeat(Q) + "cr" : "rr" + "cr".repeat(Q - 1) + "cr";
    return `\\begin{array}{${spec}} ${out.join("")}\\end{array}`;
  };
  /** il modello numerico completo: una riga di titolo (variabili e vincoli) e l'array */
  const numLP = (P, titolo) => {
    const nv = P.vars.length, nc = P.righe.length;
    const t = titolo ?? T(`Il modello LP dell'istanza: ${nv} variabili, ${nc} vincoli.`, `The LP model of the instance: ${nv} variables, ${nc} constraints.`);
    return `<p class="plm-tit">${t}</p><div class="plm-riga plm-array">\\(\\displaystyle ${arrayLP(P)}\\)</div>`;
  };
  /** i pezzi di una riga lunga: l'ordine delle colonne spezzato ogni «per» colonne; l'ultimo pezzo si allinea a destra
   *  quando «testa» colonne iniziali compaiono una volta sola (theta nella DEA: [θ, λ1..λ6], [ , λ7..λ12]) */
  const aCapo = (ordine, per, testa = 0) => {
    const h = ordine.slice(0, testa), resto = ordine.slice(testa), q = per - testa, out = [];
    for (let k = 0; k < resto.length; k += q) out.push([...(k ? h.map(() => null) : h), ...resto.slice(k, k + q)]);
    return out;
  };
  window.GI_PL_NUM = { arrayLP, numLP, aCapo };
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
   * Sta nella colonna di destra, sotto i cursori; niente prezzi ombra nelle app (Fabio, 26/11/2026). Lo usano anche gi-pl-finanza.js e gi-pl-tecniche.js.
   * Una voce con soluzione(R, v, st, C) -> HTML lo riempie a ogni aggiornamento (SOL.voce avvolge le sue letture). */
  const SOL = {
    mostra(st, html) {
      const dx = st.el.querySelector(":scope > .gi-corpo > div:last-child");
      if (!dx) return;
      RIQ.struttura(st);
      let b = st.el.querySelector(".plm-sol");
      // a destra, sotto i cursori e sopra il «Prova tu» (Fabio, 26/11/2026)
      if (!b) { b = GI.h("div", { class: "plm-sol plm-box" }); dx.insertBefore(b, dx.querySelector(":scope > .gi-letture") || null); }
      const testo = html ? `<p class="plm-sol-tit">${T("Soluzione ottima", "Optimal solution")}</p>${html}` : "";
      if (b.dataset.html === testo) return;
      b.dataset.html = testo;
      b.hidden = !html;
      b.innerHTML = GI.mj(testo);
      if (html) GI.typeset(b);
    },
    /** avvolge le letture della voce: prima la colonna di destra, poi il blocco; e la formula: il modello numerico
     *  va in fondo al riquadro dell'app (FONDO) */
    voce(vc) {
      if (vc.formula && !vc.conFondo) {
        const f = vc.formula;
        vc.conFondo = true;
        vc.formula = (...a) => FONDO.sposta(a[a.length - 1], f.apply(vc, a));
      }
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
    blocco: (valore, tabelle = [], nota = "") =>   // prima i valori delle variabili, sotto il valore ottimo (Fabio, 26/11/2026)
      (tabelle.length ? `<div class="plm-sol-tabs">${tabelle.join("")}</div>` : "") + (nota ? `<p class="plm-sol-nota">${nota}</p>` : "") +
      `<div class="plm-sol-val">${valore}</div>`,
  };
  window.GI_PL_SOL = SOL;

  // ================================================================ il modello numerico in fondo al riquadro
  /* Fabio, 25/11/2026: il blocco richiudibile «Modello numerico» sta in fondo al riquadro dell'app, dopo i grafici e
   * la soluzione, largo quanto tutto il riquadro (le due colonne): la forma matriciale, una colonna per variabile e una
   * riga per vincolo, ci sta con il font quasi normale. Il modello simbolico resta in alto. */

  // ================================================================ riquadri standard (Fabio, 26/11/2026)
  /* Ogni app di modellazione ha gli stessi riquadri: «Il problema», «Variabili», «Dati» (significati e tabelle),
   * «Modello» (simbolico); poi «Soluzione ottima» e «Prova tu». Le app scrivono ancora il testo con le voci
   * <b>Il problema.</b> … <br><b>Variabili:</b> … <br><b>Dati:</b> …: qui lo si divide nei riquadri. */
  const RIQ = {
    voce(seg) {
      const m = seg.match(/^\s*<b>\s*([^<]*?)\s*[.:]\s*<\/b>\s*/);
      if (!m) return null;
      const t = m[1].toLowerCase(), resto = seg.slice(m[0].length);
      if (/^(il problema|the problem)$/.test(t)) return ["problema", resto];
      if (/^(variabili|variables)$/.test(t)) return ["variabili", resto];
      if (/^(dati|data)$/.test(t)) return ["dati", resto];
      if (/^(prezzi ombra|shadow prices)$/.test(t)) return ["via", resto];   // niente prezzi ombra nelle app
      return null;
    },
    box(cls, tit, corpo) { return `<div class="plm-box ${cls}"><p class="plm-box-tit">${tit}</p>${corpo}</div>`; },
    applica(html, st) {
      if (typeof html !== "string" || html.indexOf('class="plm-testo"') < 0 || html.indexOf("plm-box") >= 0) return html;
      const tpl = document.createElement("div");
      tpl.innerHTML = html;
      const plm = tpl.querySelector(".plm");
      if (!plm) return html;
      const sez = { problema: [], variabili: [], dati: [], via: [] };
      let cur = "problema", tabelle = null;
      for (const n of Array.from(plm.children)) {
        if (n.matches("p.plm-testo")) {
          for (const seg of n.innerHTML.split(/<br\s*\/?>/i)) {
            if (!seg.trim()) continue;
            const v = RIQ.voce(seg);
            if (v) { cur = v[0]; if (v[1].trim()) sez[cur].push(v[1]); } else sez[cur].push(seg);
          }
          n.remove();
        } else if (n.matches("div.plm-dati")) {   // più blocchi di tabelle: un solo riquadro «Dati»
          if (!tabelle) tabelle = n;
          else { n.querySelectorAll(":scope > .plm-dati-tit").forEach((t) => t.remove()); tabelle.append(...n.childNodes); }
          n.remove();
        }
      }
      let out = "";
      if (sez.problema.length) out += RIQ.box("plm-box-problema", T("Il problema", "The problem"), `<p>${sez.problema.join("<br>")}</p>`);
      if (sez.dati.length || tabelle) {
        const sig = sez.dati.length ? `<p class="plm-dati-sig">${sez.dati.join("<br>")}</p>` : "";
        if (tabelle) {
          const tit = tabelle.querySelector(":scope > .plm-dati-tit");
          if (tit) tit.insertAdjacentHTML("afterend", sig); else tabelle.insertAdjacentHTML("afterbegin", `<p class="plm-dati-tit">${T("Dati", "Data")}</p>` + sig);
          tabelle.classList.add("plm-box");
          out += tabelle.outerHTML;
        } else out += `<div class="plm-dati plm-box"><p class="plm-dati-tit">${T("Dati", "Data")}</p>${sig}</div>`;
      }
      plm.insertAdjacentHTML("afterbegin", out);
      // «Modello»: blocco richiudibile con le variabili e il modello simbolico, aperto all'avvio (Fabio, 26/11/2026)
      const sim = plm.querySelector(":scope > .plm-sim");
      if (sim || sez.variabili.length) {
        const varHtml = sez.variabili.length ? `<p class="plm-mod-var"><b>${T("Variabili", "Variables")}:</b> ${sez.variabili.join("<br>")}</p>` : "";
        const det = `<details class="plm-box plm-box-mod" data-riq="mod"${RIQ.aperto(st, "mod") ? " open" : ""}><summary class="plm-box-tit">${T("Modello", "Model")}</summary>` +
          `<div class="plm-box-corpo">${varHtml}${sim ? sim.outerHTML : ""}</div></details>`;
        if (sim) sim.outerHTML = det; else plm.insertAdjacentHTML("beforeend", det);
      }
      return tpl.innerHTML;
    },
    /** stato (aperto o chiuso) di un blocco richiudibile, che resta mentre si muovono i cursori; all'avvio il «Modello»
     *  è aperto nella home (data-vetrina) e chiuso nelle pagine del laboratorio, come in Modellazione MIP */
    aperto(st, k) { const v = st && st.el ? st.el.dataset["riq" + k] : undefined; return v === undefined ? !!(st && st.el && st.el.dataset.vetrina) : v === "1"; },
    /** una volta per app: «Prova tu» in un blocco richiudibile, aperto */
    struttura(st) {
      if (!st || !st.el) return;
      const dom = Array.from(st.el.querySelectorAll(".gi-domanda")).find((d) => /^(Prova tu|Try it)/.test(d.textContent.trim()));
      if (dom && !dom.closest("details")) {
        const det = GI.h("details", { class: "plm-box plm-box-prova", "data-riq": "prova" });
        det.innerHTML = `<summary class="plm-box-tit">${T("Prova tu", "Try it")}</summary>`;
        det.open = true;
        dom.before(det);
        det.append(dom);
      }
      const s = dom && dom.closest("details") ? dom.querySelector("strong") : null;
      if (s && /^(Prova tu|Try it)/.test(s.textContent)) s.remove();
    },
    /** «Il modello è spiegato nel capitolo …» in fondo alla colonna della figura */
    cap(st, html) {
      const sx = st.el.querySelector(":scope > .gi-corpo > div:first-child");
      if (!sx) return;
      let b = sx.querySelector(":scope > .plm-cap-fondo");
      if (!b) { b = GI.h("div", { class: "plm-cap-fondo" }); sx.append(b); }
      if (b.dataset.html !== html) { b.dataset.html = html; b.innerHTML = html; }
    },
  };

  document.addEventListener("toggle", (e) => {
    const d = e.target, g = d && d.matches && d.matches("details[data-riq]") ? d.closest(".gi") : null;
    if (g) g.dataset["riq" + d.dataset.riq] = d.open ? "1" : "0";
  }, true);
  window.GI_PL_RIQ = RIQ;

  const FONDO = {
    /** toglie dall'HTML della formula il blocco <details class="plm-num"> e lo mostra in fondo al riquadro */
    sposta(st, html) {
      if (typeof html !== "string" || !st || !st.el) return html;
      RIQ.struttura(st);
      // (una seconda chiamata sullo stesso HTML, già diviso nei riquadri, non tocca la riga del capitolo)
      const mc = html.match(/<p class="plm-cap">[\s\S]*?<\/p>/);
      if (mc || html.indexOf('class="plm-testo"') >= 0) RIQ.cap(st, mc ? mc[0] : "");
      if (mc) html = html.replace(mc[0], "");
      html = RIQ.applica(html, st);
      const i = html.indexOf('<details class="plm-num"');
      if (i < 0) return html;
      const j = html.indexOf("</details>", i) + "</details>".length;
      FONDO.mostra(st, html.slice(i, j));
      return html.slice(0, i) + html.slice(j);
    },
    mostra(st, html) {
      let b = st.el.querySelector(":scope > .plm-fondo");
      if (!b) { b = GI.h("div", { class: "plm-fondo" }); st.el.append(b); }
      if (b.dataset.html === html) return;
      const prima = b.querySelector("details.plm-num"), aperto = prima ? prima.open : null;
      b.dataset.html = html;
      b.innerHTML = GI.mj(html);
      const d = b.querySelector("details.plm-num");
      if (d && aperto !== null) d.open = aperto;   // resta aperto (o chiuso) mentre si muovono i cursori
      GI.typeset(b);
    },
  };
  window.GI_PL_FONDO = FONDO;

  // ================================================================ valori dei dati nella riga «Dati:»
  /* Ogni dato mostra il suo valore (Fabio, 25/11/2026): scalari e liste brevi nel testo, matrici in tabelline
   * subito sotto la riga «Dati:», riassunti per i dati lunghi. I valori vengono dagli stessi oggetti del
   * modello numerico e si aggiornano con i cursori. Lo usano anche gi-pl-finanza.js e gi-pl-tecniche.js. */
  const DV = {
    /** numero per il TeX, zeri finali tolti, spazio fine fra le migliaia dei grandi interi */
    f: (x, c = 2) => { const s = GI.num(x, c); return /^-?\d{5,}$/.test(s) ? s.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : s; },
    /** lista per il TeX: «0{,}9;\ 1{,}4» in italiano, «0.9,\ 1.4» in inglese */
    L: (a, c = 2) => a.map((x) => DV.f(x, c)).join(GI.EN ? ",\\ " : ";\\ "),
    t: (x, c = 2) => GI.numTxt(x, c),
    /** minimo, massimo e media di un vettore, per il TeX */
    rng: (a, c = 1) => [Math.min(...a), Math.max(...a), a.reduce((q, x) => q + x, 0) / a.length].map((x) => DV.f(x, c)),
    tab: (titolo, intest, righe) => `<div class="plm-sol-t"><p>${titolo}</p>${M.tab(intest, righe)}</div>`,
    /** le tabelline, fuori dal paragrafo del testo */
    tabelle: (...t) => `</p><div class="plm-dati"><p class="plm-dati-tit">${T("Dati", "Data")}</p>${t.join("")}</div><p class="plm-testo">`,
  };
  window.GI_PL_DV = DV;

  // ================================================================ numeri non interi come frazioni
  /* Fabio, 25/11/2026: «non usare numeri con la virgola ma frazioni». Un valore (anche in virgola mobile, dal
   * simplesso) diventa la frazione p/q delle frazioni continue con q <= 12 e |p/q - x| < 1e-9; se non ce n'è una,
   * resta il numero com'è. Nel TeX \frac{p}{q}, nel testo semplice (celle, cursori, grafici) «6/5».
   * Per ora lo usa l'app della produzione (cap. 5). */
  const razionale = (x, maxDen = 12, tol = 1e-9) => {
    if (!isFinite(x)) return null;
    const segno = x < 0 ? -1 : 1, a0 = Math.abs(x);
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, v = a0;
    for (let i = 0; i < 40; i++) {
      const a = Math.floor(v), h = a * h1 + h2, k = a * k1 + k2;
      if (k > maxDen) break;
      if (Math.abs(h / k - a0) < tol) return [segno * h, k];
      h2 = h1; h1 = h; k2 = k1; k1 = k;
      if (v - a < 1e-15) break;
      v = 1 / (v - a);
    }
    return null;
  };
  const FR = {
    razionale,
    /** per il TeX: intero, \frac{p}{q} o, senza una frazione semplice, il numero con c cifre (DV.f) */
    tex(x, c = 2) {
      const r = razionale(x);
      if (!r || (r[1] !== 1 && Math.abs(x) >= 100)) return DV.f(x, c);   // frazioni solo per numeri piccoli: 57342/5 si legge male
      if (r[1] === 1) return DV.f(r[0], 0);
      return `${r[0] < 0 ? "-" : ""}\\frac{${Math.abs(r[0])}}{${r[1]}}`;
    },
    /** per il testo semplice: «6/5», «−3/5», «340» */
    txt(x, c = 2) {
      const r = razionale(x);
      if (!r || (r[1] !== 1 && Math.abs(x) >= 100)) return GI.numTxt(x, c);
      if (r[1] === 1) return GI.numTxt(r[0], 0);
      return `${r[0] < 0 ? "−" : ""}${Math.abs(r[0])}/${r[1]}`;
    },
    /** lista per il TeX, come DV.L */
    L: (a, c = 2) => a.map((x) => FR.tex(x, c)).join(GI.EN ? ",\\ " : ";\\ "),
    /** valore di una variabile nelle tabelle della soluzione: «—» se è nullo */
    z: (x, c = 1) => (Math.abs(x) < 0.5 * Math.pow(10, -c) ? "—" : FR.txt(x, c)),
  };
  window.GI_PL_FR = FR;

  // ================================================================ produzione (cap. 5)
  /** riga evidenziata sotto il problema: quantità continue, non oggetti da contare */
  const CONTINUE = ["", ""];   // la nota sulle unità continue sta solo nella pagina del capitolo (Fabio, 25/11/2026)
  const PRODOTTO = (C) => [C.a, C.b, C.c];
  const vProduzione = {
    etichetta: T("Produzione e scorte", "Production and inventory"),
    cursori: [
      { nome: T("\\text{domanda}\\ d_{it}", "\\text{demand}\\ d_{it}"), min: 75, max: 110, step: 1, val: 100,
        fmt: (x) => `${mig(somma2(DD().produzione.domanda) * x / 100)} ${T("unità", "units")} (${pct(x)})`,
        descr: T("moltiplica per lo stesso fattore le 9 domande \\(d_{it}\\) (3 prodotti × 3 mesi)", "multiplies the 9 demands \\(d_{it}\\) (3 products × 3 months) by the same factor") },
      { nome: T("\\text{capacità totale}", "\\text{total capacity}"), min: 90, max: 130, step: 1, val: 100,
        fmt: (x) => `${mig(somma2(DD().produzione.cap) * x / 100)} ${T("ore", "hours")} (${pct(x)})`,
        descr: T("moltiplica per lo stesso fattore le 3 capacità mensili \\(b_t\\)", "multiplies the 3 monthly capacities \\(b_t\\) by the same factor") },
    ],
    calcola: (v) => PL().produzione(v[1] / 100, v[0] / 100, [1, 1, 1]),
    formula(R, v, st) {
      const P = DD().produzione, nI = P.prodotti.length, nT = P.mesi.length;
      const it = `${PER("i", "n")},~${PER("t", "m")}`;
      const sim = `\\min ~~ \\sum_{i=1}^{n} \\sum_{t=1}^{m} c_{it}\\, x_{it} + \\sum_{i=1}^{n} \\sum_{t=1}^{m-1} h_{it}\\, s_{it} & & \\\\
        ${SA()} \\quad x_{i1} - s_{i1} &= ${st.col("a", "d_{i1}")} - r_{i0}, & ${PER("i", "n")}, \\\\
        x_{it} + s_{i,t-1} - s_{it} &= ${st.col("a", "d_{it}")}, & ${PER("i", "n")},~\\forall t \\in \\{2, 3, \\dots, m-1\\}, \\\\
        x_{im} + s_{i,m-1} &= ${st.col("a", "d_{im}")} + r_{im}, & ${PER("i", "n")}, \\\\
        \\sum_{i=1}^{n} a_i\\, x_{it} &\\le ${st.col("b", "b_t")}, & ${PER("t", "m")}, \\\\
        x_{it} &\\ge 0, & ${it}, \\\\
        s_{it} &\\ge 0, & ${PER("i", "n")},~\\forall t \\in \\{1, 2, \\dots, m-1\\}.`;
      const fD = v[0] / 100, fC = v[1] / 100;
      // un solo array dalle righe del simplesso (R.lp, colonne x_{11}, ..., x_{nm}, s_{11}, ..., s_{n,m-1});
      // forma matriciale stretta (Fabio): una colonna per variabile, x_{11}, ..., x_{33}, s_{11}, s_{12}, ..., s_{32}
      // (le scorte solo nei mesi 1..m-1), ogni riga su una sola riga dell'array
      const nS = nT - 1, lp = R.lp, kx = (i, t) => i * nT + t, ks = (i, t) => nI * nT + i * nS + t, vars = [], px = [], ps = [];
      for (let i = 0; i < nI; i++) for (let t = 0; t < nT; t++) { vars[kx(i, t)] = `x_{${i + 1}${t + 1}}`; px.push(kx(i, t)); }
      for (let i = 0; i < nI; i++) for (let t = 0; t < nS; t++) { vars[ks(i, t)] = `s_{${i + 1}${t + 1}}`; ps.push(ks(i, t)); }
      const pezzi = [[...px, ...ps]];
      const num = numLP({ senso: "min", vars, c: lp.c, cifre: 2, pezzi, fmt: FR.tex,
        righe: lp.A.map((a, k) => ({ a, rel: lp.rel[k], rhs: lp.b[k], cifre: k < nI * nT ? 2 : 1 })) });
      const TABS = DV.tabelle(DV.tab(T("Domanda \\(d_{it}\\) (unità): prodotto \\(i\\) per riga, mese \\(t\\) per colonna", "Demand \\(d_{it}\\) (units): product \\(i\\) by row, month \\(t\\) by column"),
        ["\\(i \\backslash t\\)", ...P.mesi.map(String)], P.domanda.map((r, i) => [String(i + 1), ...r.map((x) => FR.txt(x * fD, 1))])),
        DV.tab(T("Prodotti (costi uguali in tutti i mesi)", "Products (costs the same in every month)"), [T("prodotto \\(i\\)", "product \\(i\\)"), "\\(c_{it}\\) (€)", "\\(h_{it}\\) (€)", "\\(a_i\\) (h)", "\\(r_{i0}\\)", "\\(r_{im}\\)"],
          P.prodotti.map((q, i) => [String(i + 1), FR.txt(P.cp[i]), FR.txt(P.ch[i]), FR.txt(P.ore[i]), FR.txt(P.r0[i]), FR.txt(P.rm[i])])),
        DV.tab(T("Ore macchina \\(b_t\\)", "Machine hours \\(b_t\\)"), ["\\(t\\)", ...P.mesi.map(String)], [["\\(b_t\\)", ...P.cap.map((x) => FR.txt(x * fC, 1))]]));
      return modelloDi("produzione")(T(`<b>Il problema.</b> Decidiamo quante unità di ogni prodotto produrre in ogni mese e quante tenerne a scorta. ` +
        "L'obiettivo è minimizzare il costo di produzione e di giacenza. I vincoli: bilancio di magazzino mese per mese, con la domanda servita per intero, e ore macchina disponibili in ogni mese." + CONTINUE[0] +
        "<br><b>Variabili:</b> \\(x_{it}\\): unità del prodotto \\(i\\) prodotte nel mese \\(t\\); \\(s_{it}\\): unità del prodotto \\(i\\) a scorta alla fine del mese \\(t\\), per \\(t \\le m-1\\)." +
        `<br><b>Dati:</b> \\(n\\): numero di prodotti, indice \\(i\\); \\(m\\): numero di mesi, indice \\(t\\); \\(c_{it}\\): costo di produzione di un'unità di \\(i\\) (€); \\(h_{it}\\): costo di giacenza di un'unità di \\(i\\) per un mese (€); \\(d_{it}\\): domanda del prodotto \\(i\\) nel mese \\(t\\) (unità); \\(a_i\\): ore macchina per un'unità di \\(i\\); \\(b_t\\): ore macchina disponibili nel mese \\(t\\); \\(r_{i0}\\), \\(r_{im}\\): scorta iniziale e scorta finale richiesta del prodotto \\(i\\) (unità).` + TABS,
      `<b>The problem.</b> We decide how many units of each product to produce in each month and how many to keep in inventory. ` +
        "The objective is to minimize production and holding cost. The constraints: inventory balance month by month, with demand served in full, and the machine hours available in each month." + CONTINUE[1] +
        "<br><b>Variables:</b> \\(x_{it}\\): units of product \\(i\\) produced in month \\(t\\); \\(s_{it}\\): units of product \\(i\\) in inventory at the end of month \\(t\\), for \\(t \\le m-1\\)." +
        `<br><b>Data:</b> \\(n\\): number of products, index \\(i\\); \\(m\\): number of months, index \\(t\\); \\(c_{it}\\): production cost of one unit of \\(i\\) (€); \\(h_{it}\\): holding cost of one unit of \\(i\\) for one month (€); \\(d_{it}\\): demand for product \\(i\\) in month \\(t\\) (units); \\(a_i\\): machine hours for one unit of \\(i\\); \\(b_t\\): machine hours available in month \\(t\\); \\(r_{i0}\\), \\(r_{im}\\): initial inventory and required final inventory of product \\(i\\) (units).` + TABS),
      sim, num);
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Nessun piano ammissibile: la capacità non basta per la domanda", "No feasible plan: capacity does not cover demand"));
      // come la figura del capitolo (cap05_piano_scorte): in alto ore macchina impilate e capacità,
      // in basso produzione e domanda per prodotto (a sinistra) e scorte (a destra)
      const P0 = DD().produzione, nT = P0.mesi.length, nI = P0.prodotti.length, col = COL_PROD(), F = FIG();
      const mesiX = P0.mesi.map((m, t) => t + 1), dom = P0.domanda.map((r) => r.map((d) => d * v[0] / 100));
      const hTop = S.H - MF.basso - MF.alto;
      const mese = T("mese", "month"), fx = (u) => (Number.isInteger(u) && u >= 1 && u <= nT ? String(u) : "");
      const prod = (i) => T("prodotto ", "product ") + (i + 1);
      // 1. ore macchina a_i x_it impilate, capacità b_t, mesi saturi
      const A = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: S.H - MF.alto - hTop, Y1: S.H - MF.alto, xa: 0.4, xb: nT + 0.6, ya: 0,
        yb: Math.max(...R.cap, ...R.ore) * 1.42, titolo: T("Ore macchina usate per prodotto e capacità (altezza della barra = ore usate nel mese)",
          "Machine hours used by product and capacity (bar height = hours used in the month)"), nx: mese, ny: T("ore", "hours") }, C, { nTx: nT, nTy: 4, fx });
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
      return "";
    },
    soluzione(R, v) {
      if (R.stato !== "ottimo") return "";
      const Pd = DD().produzione, nT = Pd.mesi.length, giac = R.giacenza;
      const intest = (k = nT) => [tx(`i \\backslash t`), ...Pd.mesi.slice(0, k).map((m, t) => String(t + 1))];
      const righe = (A) => A.map((riga, i) => [String(i + 1), ...riga.map((x) => FR.z(x, 1))]);
      return SOL.blocco(`${T("Costo ottimo", "Optimal cost")}: <b>${FR.txt(R.costo)} €</b>, ${T("di cui giacenza", "of which holding")} ${FR.txt(giac)} €`, [
        SOL.tab(T("Produzione \\(\\tilde x_{it}\\) (unità): prodotto \\(i\\) per riga, mese \\(t\\) per colonna", "Production \\(\\tilde x_{it}\\) (units): product \\(i\\) by row, month \\(t\\) by column"), intest(), righe(R.x)),
        SOL.tab(T("Scorte di fine mese \\(\\tilde s_{it}\\) (unità)", "End-of-month inventory \\(\\tilde s_{it}\\) (units)"), intest(nT - 1), righe(R.s)),
      ], T("«—»: valore nullo.", "«—»: zero value."));
    },
    domanda: T("Porta la capacità al 114%: il mese 2 non è più saturo. Portala al 94%: il piano non esiste più.",
      "Set the capacity to 114%: month 2 is no longer binding. Set it to 94%: there is no plan any more."),
  };

  // ================================================================ ricarica EV (cap. 5)
  /* Ore t = 1, ..., m del capitolo (l'ora t va dalle t−1 alle t); nei dati e nel modello JS l'indice è t−1.
   * Il furgone è collegato nell'ora t se arrivo < t ≤ partenza (arrivo e partenza sono ore dell'orologio). */
  const evColl = (x, t) => x.arrivo < t && t <= x.partenza;
  const evOre = () => DD().ev.prezzo.map((p, k) => k + 1);
  const evPrezzo = (t) => DD().ev.prezzo[t - 1];
  const vEv = {
    etichetta: T("Ricarica di veicoli elettrici", "Electric vehicle charging"),
    cursori: [
      { nome: "k", min: 20, max: 40, step: 1, val: 30, fmt: (x) => nt(x, 0) + " kW",
        descr: T("potenza massima prelevabile dal contatore in ogni ora", "maximum power drawn from the meter in every hour") },
      { nome: T("\\text{energia totale}", "\\text{total energy}"), min: 60, max: 150, step: 5, val: 100,
        fmt: (x) => `${mig(DD().ev.veicoli.reduce((t, q) => t + q.energia, 0) * x / 100)} kWh (${per(x)})`,
        descr: T("moltiplica per lo stesso fattore le 3 energie richieste \\(e_v\\)", "multiplies the 3 required energies \\(e_v\\) by the same factor") },
    ],
    calcola: (v) => PL().ricaricaEv(v[0], v[1] / 100, 1),
    formula(R, v, st) {
      const E = DD().ev, V = E.veicoli, nV = V.length, ore = evOre(), nT = ore.length;
      const vt = `${PER("v", "n")},~${PER("t", "m")}`;
      const sim = `\\min ~~ \\sum_{v=1}^{n} \\sum_{t=1}^{m} c_t\\, d\\, x_{vt} & & \\\\
        ${SA()} \\quad r \\sum_{t=1}^{m} d\\, x_{vt} &\\ge ${st.col("b", "e_v")}, & ${PER("v", "n")}, \\\\
        \\sum_{v=1}^{n} x_{vt} + b_t &\\le ${st.col("a", "k")}, & ${PER("t", "m")}, \\\\
        x_{vt} &\\le a_{vt}\\, \\bar p_v, & ${vt}, \\\\
        x_{vt} &\\ge 0, & ${vt}.`;
      // un solo array dalle righe del simplesso (R.lp): una colonna per ogni coppia furgone-ora di collegamento
      // (d = 1 h); righe: energia di ogni furgone, rete in ogni ora (a destra k - b_t), potenza del caricatore
      // forma matriciale stretta: una colonna per variabile, ogni riga su una sola riga; le colonne vanno per ora
      // (x_{11}, x_{21}, x_{12}, x_{22}, ...), così ogni riga della rete ha le sue variabili affiancate;
      // i limiti x_{vt} <= p_v come la riga del dominio, uno per valore di p_v
      const lp = R.lp, vars = lp.vars.map(([j, t]) => `x_{${j + 1}${t + 1}}`), pezzi = [[]];
      for (let t = 0; t < nT; t++) pezzi[0].push(...lp.vars.map((u, w) => w).filter((w) => lp.vars[w][1] === t));
      const num = numLP({ senso: "min", vars, c: lp.c, cifre: 3, pezzi, limiti: true,
        righe: lp.A.map((a, k) => ({ a, rel: lp.rel[k], rhs: lp.b[k], cifre: k < nV ? 2 : 1 })) });
      const TABS = DV.tabelle(
        DV.tab(T("Ore: prezzo \\(c_t\\) (€/kWh) e carico di base \\(b_t\\) (kW)", "Hours: price \\(c_t\\) (€/kWh) and base load \\(b_t\\) (kW)"),
          ["\\(t\\)", ...ore.map(String)], [[T("dalle–alle", "from–to"), ...ore.map((t) => `${t - 1}–${t}`)],
            ["\\(c_t\\)", ...ore.map((t) => DV.t(evPrezzo(t), 3))], ["\\(b_t\\)", ...ore.map((t) => DV.t(E.base[t - 1], 0))]]),
        DV.tab(T("Furgoni: collegamento \\(a_{vt}\\), energia \\(e_v\\) (kWh), potenza \\(\\bar p_v\\) (kW)", "Vans: plug-in \\(a_{vt}\\), energy \\(e_v\\) (kWh), power \\(\\bar p_v\\) (kW)"),
          ["\\(v \\backslash t\\)", ...ore.map(String), "\\(e_v\\)", "\\(\\bar p_v\\)"],
          V.map((x, j) => [String(j + 1), ...ore.map((t) => (evColl(x, t) ? "1" : "0")), DV.t(x.energia * v[1] / 100, 1), DV.t(x.pmax, 1)])),
        DV.tab(T("Altri dati", "Other data"), ["", ""], [[T("durata di un'ora \\(d\\) (h)", "length of an hour \\(d\\) (h)"), "1"], [T("rendimento \\(r\\)", "efficiency \\(r\\)"), DV.t(E.eta, 2)],
          [T("contatore \\(k\\) (kW)", "meter \\(k\\) (kW)"), DV.t(v[0], 0)]]));
      return modelloDi("ev")(T(`<b>Il problema.</b> Decidiamo con quale potenza ricaricare ogni furgone elettrico in ogni ora della notte. L'obiettivo è la minima spesa per l'energia. I vincoli: ogni furgone riceve l'energia richiesta prima della partenza, tenendo conto delle perdite di ricarica; si ricarica solo quando è collegato e sotto la potenza del suo caricatore; il prelievo totale, carico dell'edificio compreso, resta sotto la potenza del contatore.` +
        `<br><b>Variabili:</b> \\(x_{vt}\\): potenza assegnata al furgone \\(v\\) nell'ora \\(t\\) (kW).` +
        `<br><b>Dati:</b> \\(n\\): numero di furgoni, indice \\(v\\); \\(m\\): numero di ore, indice \\(t\\) (l'ora \\(t\\) va dalle \\(t-1\\) alle \\(t\\)); \\(d\\): durata di un'ora; \\(c_t\\): prezzo dell'energia nell'ora \\(t\\) (€/kWh); \\(e_v\\): energia richiesta dal furgone \\(v\\) entro la partenza (kWh); \\(r\\): rendimento della ricarica, la quota dell'energia prelevata che arriva in batteria; \\(a_{vt}\\): 1 se il furgone \\(v\\) è collegato nell'ora \\(t\\), 0 altrimenti; \\(\\bar p_v\\): potenza del caricatore del furgone \\(v\\) (kW); \\(b_t\\): carico di base dell'edificio nell'ora \\(t\\) (kW); \\(k\\): potenza massima prelevabile dal contatore (kW).` + TABS,
      `<b>The problem.</b> We decide the power at which each electric van is charged in each hour of the night. The objective is the minimum energy expenditure. The constraints: each van receives the required energy before departure, taking charging losses into account; it charges only while plugged in and below the power of its charger; the total draw, including the building load, stays below the power of the meter.` +
        `<br><b>Variables:</b> \\(x_{vt}\\): power assigned to van \\(v\\) in hour \\(t\\) (kW).` +
        `<br><b>Data:</b> \\(n\\): number of vans, index \\(v\\); \\(m\\): number of hours, index \\(t\\) (hour \\(t\\) runs from \\(t-1\\) to \\(t\\)); \\(d\\): length of an hour; \\(c_t\\): energy price in hour \\(t\\) (€/kWh); \\(e_v\\): energy required by van \\(v\\) before departure (kWh); \\(r\\): charging efficiency, the share of the energy drawn that reaches the battery; \\(a_{vt}\\): 1 if van \\(v\\) is plugged in during hour \\(t\\), 0 otherwise; \\(\\bar p_v\\): power of the charger of van \\(v\\) (kW); \\(b_t\\): base load of the building in hour \\(t\\) (kW); \\(k\\): maximum power drawn from the meter (kW).` + TABS),
      sim, num,
      T("\\(x_{14}\\): furgone 1 nell'ora 4, dalle 3 alle 4. Nelle ore in cui un furgone non è collegato (\\(a_{vt} = 0\\)) la sua variabile vale 0 e non compare. Righe: energia dei furgoni, rete in ogni ora (a destra \\(k - b_t\\)), potenza dei caricatori.",
        "\\(x_{14}\\): van 1 in hour 4, from 3 to 4 am. In the hours when a van is not plugged in (\\(a_{vt} = 0\\)) its variable is 0 and does not appear. Rows: energy of the vans, grid in every hour (on the right \\(k - b_t\\)), charger power."));
    },
    disegna(crea, R, v, C, S) {
      if (R.stato !== "ottimo") return avviso(crea, S, C, T("Inammissibile: con questi dati i furgoni non si ricaricano in tempo", "Infeasible: with these data the vans cannot be charged in time"));
      // come la figura del capitolo (cap06_profili): prezzo orario sopra, profilo di prelievo sotto, ore 1–6
      const E = DD().ev, F = FIG(), ore = evOre(), nT = ore.length;
      const fx = (u) => (Number.isInteger(u) && u >= 1 && u <= nT ? String(u) : "");
      const yb = Math.max(R.C, ...R.tot) * 1.45;
      const B = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto, xa: 0.4, xb: nT + 0.6, ya: 0, yb,
        titolo: T("Profilo di prelievo dalla rete", "Power withdrawn from the grid"), nx: T("ora t (dalle t − 1 alle t)", "hour t (from t − 1 to t)"),
        ny: T("prelievo totale (kW)", "total withdrawal (kW)") }, C, { nTx: nT, nTy: 4, fx });
      gradini(crea, B, E.base, F.grigio, { x0: 1, dash: 2, spessore: 1.8 });
      gradini(crea, B, R.tot, F.teal, { x0: 1 });
      M.linea(crea, B.X(0.4), B.Y(R.C), B.X(nT + 0.6), B.Y(R.C), { strokeColor: F.rosso, strokeWidth: 2, dash: 1 });
      // ore sature: il prelievo tocca k
      ore.forEach((t) => { if (R.tot[t - 1] > R.C - 1e-6) M.scritta(crea, B.X(t), B.Y(R.C) + 3, T("satura", "binding"), { anchorY: "bottom", fontSize: 11, strokeColor: F.rosso }); });
      // stesse voci della figura (che mostra anche il peak shaving, min z, qui non calcolato)
      legendaIn(crea, B, [[F.grigio, T("carico di base bₜ", "base load bₜ"), "tratteggio"], [F.teal, T("prelievo totale del piano ottimo", "total draw of the optimal plan"), "linea"],
        [F.rosso, T(`potenza del contatore k = ${nt(R.C, 0)} kW`, `meter power k = ${nt(R.C, 0)} kW`), "punteggiata"]], C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.grigio, T("prezzo dell'energia \\(c_t\\) (barre) e carico di base \\(b_t\\) dell'edificio (tratteggio)", "energy price \\(c_t\\) (bars) and building base load \\(b_t\\) (dashed)"), "pieno"],
      [F.teal, T("prelievo totale \\(b_t + \\sum_v x_{vt}\\) del piano a costo minimo", "total draw \\(b_t + \\sum_v x_{vt}\\) of the minimum-cost plan"), ""],
      [F.rosso, T("potenza del contatore \\(k\\); satura: vincolo di rete attivo", "meter power \\(k\\); binding: grid constraint active"), "dotted"]]; },
    letture(R, v, st, C) {
      if (R.stato !== "ottimo") return M.tinta(C.rosso, T("Inammissibile.", "Infeasible.")) + " " +
        T("L'energia richiesta non entra nelle ore di collegamento sotto il limite \\(k\\): il simplesso si ferma alla fase 1.",
          "The required energy does not fit in the plug-in hours below the limit \\(k\\): the simplex stops in phase 1.");
      return "";
    },
    soluzione(R) {
      if (R.stato !== "ottimo") return "";
      const V = DD().ev.veicoli, ore = evOre();
      const righe = ore.map((t) => [String(t), ...V.map((x, j) => (evColl(x, t) ? SOL.z(R.x[j][t - 1], 1) : "")), nt(R.tot[t - 1], 1)]);
      return SOL.blocco(`${T("Costo ottimo", "Optimal cost")}: <b>${euro(R.costo)}</b>`, [
        SOL.tab(T("Potenza \\(\\tilde x_{vt}\\) (kW): ora \\(t\\) per riga, furgone \\(v\\) per colonna", "Power \\(\\tilde x_{vt}\\) (kW): hour \\(t\\) by row, van \\(v\\) by column"),
          [tx("t \\backslash v"), ...V.map((x, j) => String(j + 1)), T("prelievo", "draw")], righe),
      ], T("«—»: valore nullo; casella vuota: furgone non collegato.", "«—»: zero value; empty cell: van not plugged in."));
    },
    domanda: T("Porta \\(k\\) a 36: nessuna ora è più satura e il costo scende a 7,92 €. Portalo a 23: il problema diventa inammissibile.",
      "Set \\(k\\) to 36: no hour is binding any more and the cost drops to 7.92 €. Set it to 23: the problem becomes infeasible."),
  };

  // ================================================================ newsvendor (cap. 8)
  /** livello del CVaR dello script (alpha_cv = 0,8: con 10 scenari la coda sono i 2 più costosi) */
  const ALFA = () => DD().newsvendor.alfa;
  const vNewsvendor = {
    etichetta: T("Newsvendor a scenari", "Scenario newsvendor"),
    cursori: [
      { nome: "p", min: 8, max: 30, step: 0.5, val: 15, fmt: (x) => euro(x, 1),
        descr: T("prezzo di vendita di un'unità", "selling price of one unit") },
      { nome: "r", min: 0, max: 1, step: 0.05, val: 0, fmt: (x) => nt(x, 2),
        descr: T("peso del rischio: peso del CVaR\\(_\\alpha\\) del costo nell'obiettivo", "risk weight: weight of the CVaR\\(_\\alpha\\) of the cost in the objective") },
    ],
    calcola(v) {
      const R = PL().newsvendor(v[0], v[1], ALFA());
      const qs = [];
      for (let q = 50; q <= 190; q += 1) qs.push(q);
      R.curve = { q: qs, media: qs.map(R.f.media), cv: qs.map(R.f.cv), ob: qs.map(R.f.obiettivo) };
      // con r = 0 e f* k intero l'ottimo non è unico: ogni q fra due scenari consecutivi
      const fk = R.alfaStar * R.d.length;
      R.pari = v[1] === 0 && Math.abs(fk - Math.round(fk)) < 1e-9;
      R.posto = Math.ceil(fk - 1e-9);
      return R;
    },
    formula(R, v, st) {
      const N = DD().newsvendor, d = N.domanda, k = d.length, A = N.alfa, L = v[1];
      const Co = N.c - N.v, Cu = v[0] - N.c, coda = Math.round((1 - A) * k);
      const lam = st.col("b", "r"), ks = PER("s", "k");
      const sim = `\\min ~~ (1-${lam}) \\sum_{s=1}^{k} w_s \\bigl( c_o\\, o_s + ${st.col("a", "c_u")}\\, u_s \\bigr) & & \\\\
        + ${lam} \\Bigl( \\eta + \\tfrac{1}{1-\\alpha} \\sum_{s=1}^{k} w_s\\, \\xi_s \\Bigr) & & \\\\
        ${SA()} \\quad o_s &\\ge q - d_s, & ${ks}, \\\\
        u_s &\\ge d_s - q, & ${ks}, \\\\
        \\xi_s &\\ge c_o\\, o_s + ${st.col("a", "c_u")}\\, u_s - \\eta, & ${ks}, \\\\
        q &\\ge 0, & \\\\
        \\eta &\\gtreqless 0, & \\\\
        o_s,\\ u_s,\\ \\xi_s &\\ge 0, & ${ks}.`;
      // tutto il modello numerico in forma matriciale: colonne q, (eta), o_1..o_k, u_1..u_k, (xi_1..xi_k), una riga
      // dell'array per riga del modello; righe per tipo: eccedenza, carenza (a destra d_s), CVaR.
      // Con r = 0, eta e xi_s non entrano nella funzione obiettivo e restano fuori (21 variabili, 20 vincoli)
      const rischio = L > 0, h = rischio ? 2 : 1;
      const io = (s) => h + s, iu = (s) => h + k + s, ix = (s) => h + 2 * k + s;
      const vars = ["q", ...(rischio ? ["\\eta"] : []), ...d.map((x, s) => `o_{${s + 1}}`), ...d.map((x, s) => `u_{${s + 1}}`), ...(rischio ? d.map((x, s) => `\\xi_{${s + 1}}`) : [])];
      const z = () => new Array(vars.length).fill(0), ob = z(), righe = [];
      d.forEach((x, s) => { ob[io(s)] = (1 - L) * Co / k; ob[iu(s)] = (1 - L) * Cu / k; if (rischio) ob[ix(s)] = L / ((1 - A) * k); });
      if (rischio) ob[1] = L;
      d.forEach((ds, s) => { const a = z(); a[0] = 1; a[io(s)] = -1; righe.push({ a, rel: "<=", rhs: ds, cifre: 0 }); });
      d.forEach((ds, s) => { const a = z(); a[0] = 1; a[iu(s)] = 1; righe.push({ a, rel: ">=", rhs: ds, cifre: 0 }); });
      if (rischio) d.forEach((ds, s) => { const a = z(); a[1] = 1; a[io(s)] = -Co; a[iu(s)] = -Cu; a[ix(s)] = 1; righe.push({ a, rel: ">=", rhs: 0, cifre: 2 }); });
      const num = numLP({ senso: "min", vars, c: ob, cifreObj: 3, righe,
        dominio: rischio ? [{ cols: [1], rel: "><", rhs: "0" }, { cols: vars.map((x, j) => j).filter((j) => j !== 1), rel: ">=", rhs: "0" }] : undefined });
      const TABS = DV.tabelle(DV.tab(T("Scenari: domanda \\(d_s\\) (unità) e probabilità \\(w_s\\)", "Scenarios: demand \\(d_s\\) (units) and probability \\(w_s\\)"),
        ["\\(s\\)", ...d.map((x, s) => String(s + 1))], [["\\(d_s\\)", ...d.map((x) => DV.t(x, 0))], ["\\(w_s\\)", ...d.map(() => `1/${k}`)]]),
        DV.tab(T("Prezzi e costi (€ per unità) e livello", "Prices and costs (€ per unit) and level"), ["\\(p\\)", "\\(c\\)", "\\(v\\)", "\\(c_u = p - c\\)", "\\(c_o = c - v\\)", "\\(\\alpha\\)", "\\(r\\)"],
          [[DV.t(v[0], 1), DV.t(N.c, 0), DV.t(N.v, 0), DV.t(Cu, 2), DV.t(Co, 2), DV.t(A, 2), DV.t(L, 2)]]));
      return modelloDi("newsvendor")(T(`<b>Il problema.</b> Decidiamo quante unità ordinare prima di osservare la domanda, descritta da scenari equiprobabili. Le unità invendute e le vendite perse hanno un costo. L'obiettivo combina il costo atteso e il CVaR\\(_\\alpha\\) del costo, il costo medio negli scenari peggiori. I vincoli: in ogni scenario le unità invendute e la domanda non servita misurano la differenza fra ordine e domanda, e l'eccesso misura la parte del costo oltre la soglia.` +
        `<br><b>Variabili:</b> \\(q\\): quantità ordinata (unità); \\(o_s\\): unità invendute nello scenario \\(s\\); \\(u_s\\): domanda non servita nello scenario \\(s\\) (unità); \\(\\eta\\): soglia di costo nella formula del CVaR, libera di segno (€); \\(\\xi_s\\): parte del costo dello scenario \\(s\\) che supera la soglia \\(\\eta\\) (€).` +
        `<br><b>Dati:</b> \\(k\\): numero di scenari, indice \\(s\\); \\(d_s\\): domanda nello scenario \\(s\\) (unità); \\(w_s\\): probabilità dello scenario \\(s\\); \\(p\\): prezzo di vendita di un'unità; \\(c\\): costo d'acquisto di un'unità; \\(v\\): valore di recupero di un'unità invenduta; \\(c_u\\): costo di una vendita persa; \\(c_o\\): costo di un'unità invenduta; \\(r\\): peso del rischio, da 0 a 1; \\(\\alpha\\): livello del CVaR\\(_\\alpha\\), il costo medio nella frazione \\(1 - \\alpha\\) degli scenari peggiori.` + TABS,
      `<b>The problem.</b> We decide how many units to order before observing demand, described by equally likely scenarios. Unsold units and lost sales have a cost. The objective combines the expected cost and the CVaR\\(_\\alpha\\) of the cost, the average cost in the worst scenarios. The constraints: in each scenario the unsold units and the unmet demand measure the difference between order and demand, and the excess measures the part of the cost above the threshold.` +
        `<br><b>Variables:</b> \\(q\\): quantity ordered (units); \\(o_s\\): unsold units in scenario \\(s\\); \\(u_s\\): unmet demand in scenario \\(s\\) (units); \\(\\eta\\): cost threshold in the CVaR formula, free in sign (€); \\(\\xi_s\\): part of the cost of scenario \\(s\\) above the threshold \\(\\eta\\) (€).` +
        `<br><b>Data:</b> \\(k\\): number of scenarios, index \\(s\\); \\(d_s\\): demand in scenario \\(s\\) (units); \\(w_s\\): probability of scenario \\(s\\); \\(p\\): selling price of one unit; \\(c\\): purchase cost of one unit; \\(v\\): salvage value of an unsold unit; \\(c_u\\): cost of a lost sale; \\(c_o\\): cost of an unsold unit; \\(r\\): risk weight, from 0 to 1; \\(\\alpha\\): level of the CVaR\\(_\\alpha\\), the average cost in the worst fraction \\(1 - \\alpha\\) of the scenarios.` + TABS),
      sim, num,
      rischio
        ? T(`Coefficienti della funzione obiettivo: \\(\\eta\\) ha \\(r\\), ogni \\(o_s\\) ha \\((1-r)\\,c_o/${k}\\), ogni \\(u_s\\) ha \\((1-r)\\,c_u/${k}\\), ogni \\(\\xi_s\\) ha \\(r/((1-\\alpha) \\cdot ${k}) = r/${n((1 - A) * k, 0)}\\). Nella riga del CVaR, \\(\\xi_s \\ge c_o\\, o_s + c_u\\, u_s - \\eta\\) è scritta con le variabili a sinistra.`,
          `Coefficients of the objective function: \\(\\eta\\) has \\(r\\), each \\(o_s\\) has \\((1-r)\\,c_o/${k}\\), each \\(u_s\\) has \\((1-r)\\,c_u/${k}\\), each \\(\\xi_s\\) has \\(r/((1-\\alpha) \\cdot ${k}) = r/${n((1 - A) * k, 0)}\\). In the CVaR row, \\(\\xi_s \\ge c_o\\, o_s + c_u\\, u_s - \\eta\\) is written with the variables on the left.`)
        : T(`Coefficienti della funzione obiettivo: ogni \\(o_s\\) ha \\(c_o/${k}\\), ogni \\(u_s\\) ha \\(c_u/${k}\\). Con \\(r = 0\\), \\(\\eta\\) e \\(\\xi_s\\) non entrano nella funzione obiettivo: restano il costo atteso e le ${2 * k} righe di eccedenza e di carenza. Con \\(r > 0\\) si aggiungono \\(\\eta\\), le \\(\\xi_s\\) e le ${k} righe del CVaR.`,
          `Coefficients of the objective function: each \\(o_s\\) has \\(c_o/${k}\\), each \\(u_s\\) has \\(c_u/${k}\\). With \\(r = 0\\), \\(\\eta\\) and \\(\\xi_s\\) do not enter the objective function: what remains is the expected cost and the ${2 * k} overage and underage rows. With \\(r > 0\\), \\(\\eta\\), the \\(\\xi_s\\) and the ${k} CVaR rows are added.`));
    },
    disegna(crea, R, v, C, S) {
      // in alto: costo atteso, CVaR e funzione obiettivo in funzione di q, con le domande d_s; in basso la frontiera
      // del capitolo (cap08_frontiera): costo medio contro CVaR al variare del peso r, per il prezzo p scelto
      const F = FIG(), A = ALFA();
      const cu = R.curve, ymax = Math.max(...cu.cv, ...cu.media) * 1.08;
      const P1 = figura(crea, { X0: MF.sx, X1: S.W - MF.dx, Y0: MF.basso, Y1: S.H - MF.alto, xa: 45, xb: 195, ya: 0, yb: ymax,
        titolo: T("Costo atteso e CVaR del costo in funzione di q", "Expected cost and CVaR of the cost as functions of q"),
        nx: T("quantità ordinata q (pallini grigi: le domande dₛ)", "order quantity q (grey dots: the demands dₛ)"), ny: T("costo (€)", "cost (€)") }, C, { nTx: 8, nTy: 4 });
      R.d.forEach((ds) => M.pallino(crea, P1.X(ds), P1.Y(0), { size: 3.5, fillColor: F.grigio, strokeColor: F.grigio }));
      lineaPunti(crea, P1, cu.q, cu.media, F.teal, { punti: false });
      lineaPunti(crea, P1, cu.q, cu.cv, F.rosso, { punti: false, dash: 2 });
      if (v[1] > 0 && v[1] < 1) lineaPunti(crea, P1, cu.q, cu.ob, F.arancio, { punti: false, spessore: 2.6 });
      M.linea(crea, P1.X(R.q), P1.Y(0), P1.X(R.q), P1.Y(ymax * 0.97), { strokeColor: F.arancio, strokeWidth: 1.6, dash: 1 });
      M.pallino(crea, P1.X(R.q), P1.Y(R.obiettivo), { size: 6, fillColor: F.arancio, strokeColor: F.arancio });
      const voci1 = [[F.teal, T("costo atteso", "expected cost"), "linea"], [F.rosso, T(`CVaR del costo, α = ${nt(A, 1)}`, `CVaR of the cost, α = ${nt(A, 1)}`), "tratteggio"]];
      if (v[1] > 0 && v[1] < 1) voci1.push([F.arancio, T(`(1 − r) · costo atteso + r · CVaR, r = ${nt(v[1], 2)}`, `(1 − r) · expected cost + r · CVaR, r = ${nt(v[1], 2)}`), "linea"]);
      voci1.push([F.arancio, T(`ordine ottimo q* = ${nt(R.q, 1)}`, `optimal order q* = ${nt(R.q, 1)}`), "punto"]);
      legendaIn(crea, P1, voci1, C, "dx");
    },
    legenda: () => { const F = FIG(); return [[F.teal, T("costo atteso in funzione di \\(q\\); in basso, ogni punto è l'ordine ottimo \\(q^*\\) per un peso \\(r\\)", "expected cost as a function of \\(q\\); below, each point is the optimal order \\(q^*\\) for a weight \\(r\\)"), ""],
      [F.rosso, T("CVaR\\(_\\alpha\\) del costo, \\(\\alpha = 0{,}8\\): il costo medio dei 2 scenari più costosi", "CVaR\\(_\\alpha\\) of the cost, \\(\\alpha = 0.8\\): the mean cost of the 2 most expensive scenarios"), "dashed"],
      [F.arancio, T("l'ordine ottimo con il peso \\(r\\) del cursore", "the optimal order with the slider weight \\(r\\)"), "punto"]]; },
    soluzione(R, v, st, C) {
      // tutte le variabili, scenario per scenario: õ_s, ũ_s, il costo e, con r > 0, ξ̃_s; in rosso i 2 scenari della coda
      const k = R.d.length, q = R.q, r = v[1], A = ALFA();
      const o = R.d.map((d) => Math.max(0, q - d)), u = R.d.map((d) => Math.max(0, d - q));
      const costi = o.map((x, s) => R.Co * x + R.Cu * u[s]), eta = O.vaR(costi, A), xi = costi.map((c) => Math.max(0, c - eta));
      const coda = Math.round((1 - A) * k), soglia = costi.slice().sort((a, b) => b - a)[coda - 1];
      const rosso = (s, testo) => (costi[s] >= soglia - 1e-9 ? M.tinta(C.rosso, testo) : testo);
      const righe = R.d.map((d, s) => [String(s + 1), nt(d, 0), SOL.z(o[s], 1), SOL.z(u[s], 1), rosso(s, nt(costi[s], 1)), ...(r > 0 ? [SOL.z(xi[s], 1)] : [])]);
      return SOL.blocco(`${T("Valore ottimo", "Optimal value")}: <b>${euro(R.obiettivo)}</b> ` +
        (r > 0 ? T(`(\\(1 - r\\) volte il costo atteso più \\(r\\) volte il CVaR\\(_\\alpha\\))`, `(\\(1 - r\\) times the expected cost plus \\(r\\) times the CVaR\\(_\\alpha\\))`) : T("(costo atteso)", "(expected cost)")), [
        SOL.tab(T("Ordine", "Order"), r > 0 ? ["\\(\\tilde q\\)", "\\(\\tilde\\eta\\) (€)"] : ["\\(\\tilde q\\)"], [r > 0 ? [nt(q, 2), nt(eta, 2)] : [nt(q, 2)]]),
        SOL.tab(T(`Scenari: in rosso il costo dei ${coda} più costosi (la coda del CVaR\\(_\\alpha\\))`, `Scenarios: in red the cost of the ${coda} most expensive (the tail of the CVaR\\(_\\alpha\\))`),
          ["\\(s\\)", "\\(d_s\\)", "\\(\\tilde o_s\\)", "\\(\\tilde u_s\\)", T("costo (€)", "cost (€)"), ...(r > 0 ? ["\\(\\tilde\\xi_s\\)"] : [])], righe),
      ], T("«—»: valore nullo.", "«—»: zero value."));
    },
    domanda: T("Porta \\(p\\) a 15,5: l'ordine ottimo sale da 110 a 120 unità. Porta \\(r\\) a 0,4: l'ordine sale a 130.",
      "Set \\(p\\) to 15.5: the optimal order rises from 110 to 120 units. Set \\(r\\) to 0.4: the order rises to 130."),
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
      const vars = ["\\theta", ...X[0].map((q, j) => `\\lambda_{${j + 1}}`)], ob = vars.map((q, j) => (j ? 0 : 1)), righe = [];
      X.forEach((r) => righe.push({ a: [r[oo], ...r.map((q) => -q)], rel: ">=", rhs: 0, cifre: 1 }));
      Y.forEach((r) => righe.push({ a: [0, ...r], rel: ">=", rhs: r[oo], cifre: 1 }));
      if (vrs) righe.push({ a: [0, ...new Array(nn).fill(1)], rel: "=", rhs: 1 });
      const num = numLP({ senso: "min", vars, c: ob, righe, dominio: [{ cols: [0], rel: "><", rhs: "0" }, { cols: vars.map((q, j) => j).filter((j) => j), rel: ">=", rhs: "0" }] },
        T(`Il modello LP della filiale \\(o = ${oo + 1}\\): ${nn + 1} variabili, ${righe.length} vincoli. Righe: input (${nomiI.join(", ")}), poi output (${nomiR.join(", ")})${vrs ? ", poi \\(\\sum_j \\lambda_j = 1\\)" : ""}.`,
          `The LP model of branch \\(o = ${oo + 1}\\): ${nn + 1} variables, ${righe.length} constraints. Rows: inputs (${nomiI.join(", ")}), then outputs (${nomiR.join(", ")})${vrs ? ", then \\(\\sum_j \\lambda_j = 1\\)" : ""}.`));
      const nomiX = [T("\\(x_{1j}\\): personale (FTE)", "\\(x_{1j}\\): staff (FTE)"), T("\\(x_{2j}\\): costi (k€)", "\\(x_{2j}\\): costs (k€)")];
      const nomiY = [T("\\(y_{1j}\\): prestiti (M€)", "\\(y_{1j}\\): loans (M€)"), T("\\(y_{2j}\\): depositi (M€)", "\\(y_{2j}\\): deposits (M€)")];
      const TABS = DV.tabelle(DV.tab(T("Input e output: una colonna per filiale \\(j\\)", "Inputs and outputs: one column per branch \\(j\\)"), ["\\(j\\)", ...X[0].map((q, j) => String(j + 1))],
        [...X.map((r, i) => [nomiX[i], ...r.map((x) => DV.t(x, 0))]), ...Y.map((r, i) => [nomiY[i], ...r.map((x) => DV.t(x, 1))])]),
        DV.tab(T("Filiale valutata", "Branch under evaluation"), ["\\(o\\)"], [[String(oo + 1)]]));
      return modelloDi("dea")(T(`<b>Il problema.</b> Per la filiale valutata cerchiamo una filiale virtuale, combinazione pesata di tutte le filiali, che produca almeno i suoi output (${nomiR.join(", ")}) usando al più una frazione dei suoi input (${nomiI.join(", ")}). L'obiettivo è minimizzare questa frazione, l'efficienza della filiale. I vincoli: uno per ogni input e uno per ogni output${vrs ? "; nel modello BCC i pesi sommano a 1" : ""}.` +
        `<br><b>Variabili:</b> \\(\\theta\\): fattore per cui si possono moltiplicare gli input di \\(o\\), cioè la sua efficienza (\\(\\theta = 1\\): efficiente); \\(\\lambda_j\\): peso della filiale \\(j\\) nella filiale virtuale di confronto.` +
        `<br><b>Dati:</b> \\(n\\): numero di filiali, indice \\(j\\); \\(m\\): numero di input, indice \\(i\\); \\(p\\): numero di output, indice \\(r\\); \\(x_{ij}\\): quantità dell'input \\(i\\) usata dalla filiale \\(j\\); \\(y_{rj}\\): quantità dell'output \\(r\\) prodotta dalla filiale \\(j\\); \\(o\\): la filiale valutata. CCR: rendimenti di scala costanti; BCC: aggiunge \\(\\sum_j \\lambda_j = 1\\), rendimenti di scala variabili.` + TABS,
      `<b>The problem.</b> For the branch under evaluation we look for a virtual branch, a weighted combination of all branches, that produces at least its outputs (${nomiR.join(", ")}) using at most a fraction of its inputs (${nomiI.join(", ")}). The objective is to minimize this fraction, the efficiency of the branch. The constraints: one for each input and one for each output${vrs ? "; in the BCC model the weights sum to 1" : ""}.` +
        `<br><b>Variables:</b> \\(\\theta\\): factor by which the inputs of \\(o\\) can be multiplied, that is its efficiency (\\(\\theta = 1\\): efficient); \\(\\lambda_j\\): weight of branch \\(j\\) in the virtual comparison branch.` +
        `<br><b>Data:</b> \\(n\\): number of branches, index \\(j\\); \\(m\\): number of inputs, index \\(i\\); \\(p\\): number of outputs, index \\(r\\); \\(x_{ij}\\): amount of input \\(i\\) used by branch \\(j\\); \\(y_{rj}\\): amount of output \\(r\\) produced by branch \\(j\\); \\(o\\): the branch under evaluation. CCR: constant returns to scale; BCC: adds \\(\\sum_j \\lambda_j = 1\\), variable returns to scale.` + TABS),
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
    soluzione(R, v, st, C) {
      if (R.stato !== "ottimo") return "";
      const eff = Math.abs(R.theta - 1) < 1e-6, nn = R.lam.length;
      return SOL.blocco(`${T("Valore ottimo", "Optimal value")}: <b>\\(\\tilde\\theta = ${n(R.theta, 4)}\\)</b>, ${T("efficienza della filiale", "efficiency of branch")} ${R.o + 1} · ` +
        (eff ? M.tinta(C.c, T("sulla frontiera", "on the frontier")) : M.tinta(C.a, T("inefficiente", "inefficient"))), [
        SOL.tab(T(`Pesi \\(\\tilde\\lambda_j > 0\\): i peer (le altre ${nn - R.peer.length} filiali hanno \\(\\tilde\\lambda_j = 0\\))`, `Weights \\(\\tilde\\lambda_j > 0\\): the peers (the other ${nn - R.peer.length} branches have \\(\\tilde\\lambda_j = 0\\))`),
          [T("filiale \\(j\\)", "branch \\(j\\)"), ...R.peer.map(([j]) => String(j + 1))], [[tx("\\tilde\\lambda_j"), ...R.peer.map(([, l]) => nt(l, 4))]]),
      ]);
    },
    domanda: T("Porta la filiale a 6: nel modello CCR con 4 indicatori \\(\\tilde\\theta = 0{,}76\\). Scegli BCC con 4 indicatori: la filiale 6 diventa efficiente.",
      "Set the branch to 6: in the CCR model with 4 indicators \\(\\tilde\\theta = 0.76\\). Choose BCC with 4 indicators: branch 6 becomes efficient."),
  });

  // ================================================================ registrazione
  const R = (nome, opz, voci) => { SOL.voci(voci); window.GI_RICETTE[nome] = () => O.ricettaVoci(opz, voci); };
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
    const [a, q] = rr;
    return SOL.blocco(`${T("Valore ottimo", "Optimal value")}: <b>${nt(q.f, 2)} ${T("pezzi", "pieces")}</b> ${T("(retta \\(\\tau\\))", "(\\(\\tau\\) line)")}`, [
      SOL.tab(T("Le due rette: lo stesso LP con due valori di \\(\\tau\\)", "The two lines: the same LP with two values of \\(\\tau\\)"),
        ["", M.tinta(FIG().navy, "\\(\\tau = 1/2\\)"), M.tinta(FIG().verde, `\\(\\tau = ${n(p.tau, 2)}\\)`)],
        [[T("\\(\\tilde w\\) (pezzi/°C)", "\\(\\tilde w\\) (pieces/°C)"), nt(a.w, 3), nt(q.w, 3)], [T("\\(\\tilde b\\) (pezzi)", "\\(\\tilde b\\) (pieces)"), nt(a.b, 2), nt(q.b, 2)],
          [T("giorni sopra (\\(\\tilde u_i > 0\\))", "days above (\\(\\tilde u_i > 0\\))"), `${a.sopra} / ${m}`, `${q.sopra} / ${m}`],
          [T("giorni sotto (\\(\\tilde v_i > 0\\))", "days below (\\(\\tilde v_i > 0\\))"), `${a.sotto} / ${m}`, `${q.sotto} / ${m}`]]),
    ]);
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
      descr: T("livello del quantile: la quota di giorni che la retta lascia sotto di sé", "quantile level: the share of days the line leaves below it") }],
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
    formula(p, st) { return FONDO.sposta(st, this.formulaModello(p, st)); },
    formulaModello(p, st) {
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
      // i dati dei punti attuali: tabella in un blocco richiudibile (60 giorni), τ in vista
      const sc = DD().panetteria.sciopero || [];
      const giorni = `<details class="plm-sub"><summary>${T(`I dati dei ${m} giorni (punti attuali del grafico)`, `The data of the ${m} days (current points of the chart)`)}</summary><div class="plm-sub-corpo">` +
        [0, 1, 2].map((q) => { const ii = [...Array(m).keys()].filter((i) => i % 3 === q);
          return M.tab(["\\(i\\)", "\\(x_i\\)", "\\(y_i\\)"], ii.map((i) => [String(i + 1) + (sc[i] ? "*" : ""), nt(t[i], 1), nt(y[i], 0)])); }).join("") +
        `<p class="plm-nota">${T("*: giorno di sciopero.", "*: strike day.")}</p></div></details>`;
      const TABS = DV.tabelle(DV.tab(T("Livello del quantile", "Quantile level"), ["\\(\\tau\\)"], [[nt(p.tau, 2)]]) + giorni);
      return modelloDi("regressione")(T(`<b>Il problema.</b> Decidiamo la retta che stima la domanda di pane di un giorno dalla sua temperatura massima. L'obiettivo è minimizzare la somma degli scostamenti fra la domanda osservata e la retta, con pesi diversi sopra e sotto la retta. I vincoli: in ogni giorno la domanda è uguale al valore della retta più lo scostamento in eccesso meno quello in difetto.` +
        `<br><b>Variabili:</b> \\(w\\): pendenza della retta (pezzi per °C), libera di segno; \\(b\\): intercetta (pezzi), libera di segno; \\(u_i\\): quanto la domanda \\(y_i\\) supera la retta nel giorno \\(i\\) (pezzi); \\(v_i\\): quanto la domanda \\(y_i\\) resta sotto la retta (pezzi).` +
        `<br><b>Dati:</b> \\(n\\): numero di giorni osservati (i punti del grafico), indice \\(i\\); \\(x_i\\): temperatura massima del giorno \\(i\\) (°C); \\(y_i\\): domanda di pane del giorno \\(i\\) (pezzi); i giorni di sciopero hanno domanda anomala, molto bassa; \\(\\tau\\): livello del quantile, fra 0 e 1, la quota di giorni che la retta lascia sotto di sé (con \\(\\tau = 1/2\\) si ottengono gli scarti assoluti).` + TABS,
      `<b>The problem.</b> We decide the line that estimates the bread demand of a day from its maximum temperature. The objective is to minimize the sum of the deviations between observed demand and the line, with different weights above and below the line. The constraints: on each day demand equals the value of the line plus the deviation in excess minus the deviation in defect.` +
        `<br><b>Variables:</b> \\(w\\): slope of the line (pieces per °C), free in sign; \\(b\\): intercept (pieces), free in sign; \\(u_i\\): how much demand \\(y_i\\) exceeds the line on day \\(i\\) (pieces); \\(v_i\\): how much demand \\(y_i\\) falls below the line (pieces).` +
        `<br><b>Data:</b> \\(n\\): number of observed days (the points of the chart), index \\(i\\); \\(x_i\\): maximum temperature of day \\(i\\) (°C); \\(y_i\\): bread demand of day \\(i\\) (pieces); the strike days have anomalous, very low demand; \\(\\tau\\): quantile level, between 0 and 1, the share of days the line leaves below it (with \\(\\tau = 1/2\\) one gets least absolute deviations).` + TABS),
      sim, num,
      T("Il modello numerico è quello della retta \\(\\tau\\) con i punti attuali, anche quelli trascinati.",
        "The numerical model is the one of the \\(\\tau\\) line with the current points, dragged ones included."));
    },
    letture(rette, p, dati, C) {
      DATI_REG.rette = rette;
      return "";
    },
    domanda: T("Porta \\(\\tau\\) a 0,90: solo 5 giorni su 60 restano sopra la retta del quantile. Portalo a 0,10: 53 giorni restano sopra.",
      "Set \\(\\tau\\) to 0.90: only 5 days out of 60 stay above the quantile line. Set it to 0.10: 53 days stay above."),
  });
    const vecchie = ric.letture;
    ric.letture = (p, st) => { const out = vecchie(p, st); SOL.mostra(st, solRegressione(p)); return out; };
    return ric;
  };
})();
