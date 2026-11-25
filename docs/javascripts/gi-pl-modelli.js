/* Laboratorio di «Modellazione PL / LP Modelling»: i modelli dei capitoli, PURI (niente DOM).
 * Usano GI_OTT (gi-ott.js) e i dati di GI_DATI_PL (gi-pl-dati.js, scritto da genera_laboratorio.py
 * dai CSV di dati/, cioè dagli script del corso). Si caricano anche in node per il test
 * (python/test_laboratorio.py), che confronta i numeri con Gurobi.
 *
 *   produzione(fCap, fDom, fGiac) cap. 4: LP a costo minimo; piano, scorte, prezzi ombra della capacità
 *                                (fGiac: un fattore per tutti i prodotti o un vettore, uno per prodotto)
 *   dea(o, vrs, vista)           cap. 6: forma di inviluppo orientata all'input (CCR/BCC), poi gli scarti
 *   newsvendor(p, lam, alfa)     cap. 7: LP a scenari con avversione al rischio (1-lam) E + lam CVaR
 *   regressione(dati, tau)       cap. 10: regressione quantile (tau = 1/2: scarti assoluti)
 */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;
  const O = () => W.GI_OTT, D = () => W.GI_DATI_PL;

  // ---------------------------------------------------------------- cap. 4
  function produzione(fCap = 1, fDom = 1, fGiac = 1) {
    const P = D().produzione, nI = P.prodotti.length, nT = P.mesi.length;
    const ix = (i, t) => i * nT + t, is = (i, t) => nI * nT + i * nT + t, nv = 2 * nI * nT;
    const c = new Array(nv).fill(0), A = [], rel = [], b = [];
    for (let i = 0; i < nI; i++) for (let t = 0; t < nT; t++) { c[ix(i, t)] = P.cp[i]; c[is(i, t)] = P.ch[i] * (Array.isArray(fGiac) ? fGiac[i] : fGiac); }
    const dom = P.domanda.map((r) => r.map((v) => v * fDom));
    for (let i = 0; i < nI; i++) for (let t = 0; t < nT; t++) {
      const a = new Array(nv).fill(0);
      a[ix(i, t)] = 1; a[is(i, t)] = -1;
      if (t > 0) a[is(i, t - 1)] = 1;
      A.push(a); rel.push("="); b.push(dom[i][t] - (t === 0 ? P.s0[i] : 0));
    }
    const cap = P.cap.map((v) => v * fCap);
    for (let t = 0; t < nT; t++) {
      const a = new Array(nv).fill(0);
      for (let i = 0; i < nI; i++) a[ix(i, t)] = P.ore[i];
      A.push(a); rel.push("<="); b.push(cap[t]);
    }
    const r = O().lp({ c, A, rel, b, senso: "min" });
    if (r.stato !== "ottimo") return { stato: r.stato, cap, dom };
    const x = [], s = [], ore = [];
    for (let i = 0; i < nI; i++) { x.push([]); s.push([]); for (let t = 0; t < nT; t++) { x[i].push(r.x[ix(i, t)]); s[i].push(r.x[is(i, t)]); } }
    for (let t = 0; t < nT; t++) ore.push(P.ore.reduce((acc, h, i) => acc + h * x[i][t], 0));
    const k = nI * nT;
    return {
      stato: "ottimo", costo: r.z, x, s, ore, cap, dom,
      ombra: r.y.slice(k), lo: r.rhsLo.slice(k), up: r.rhsUp.slice(k),
      bilancio: r.y.slice(0, k),
    };
  }

  // ---------------------------------------------------------------- cap. 5
  /** ricarica a costo minimo: x_vt potenza (0 <= x_vt <= pmax_v se collegato), eta sum_t x_vt >= E_v,
   *  sum_v x_vt + base_t <= C. Le x dei veicoli non collegati non entrano nel modello (sono 0).
   *  Le ore sono t = 0, ..., m-1 (l'ora t+1 del capitolo, dalle t alle t+1): il veicolo è collegato se
   *  arrivo <= t < partenza. fPrezzoCare moltiplica i prezzi delle ore ORE_CARE (le ore 1 e 2, dalle 0 alle 2). */
  const ORE_CARE = [0, 1];
  function ricaricaEv(C = null, fEne = 1, fPrezzoCare = 1) {
    const E = D().ev, nT = E.prezzo.length, V = E.veicoli, Cr = C == null ? E.C : C;
    const coll = (v, t) => v.arrivo <= t && t < v.partenza;
    const prezzo = E.prezzo.map((p, t) => (ORE_CARE.includes(t) ? p * fPrezzoCare : p));
    const vars = [];
    V.forEach((v, k) => { for (let t = 0; t < nT; t++) if (coll(v, t)) vars.push([k, t]); });
    const n = vars.length, c = vars.map(([, t]) => prezzo[t]), A = [], rel = [], b = [];
    V.forEach((v, k) => { A.push(vars.map(([kk]) => (kk === k ? E.eta : 0))); rel.push(">="); b.push(v.energia * fEne); });
    for (let t = 0; t < nT; t++) { A.push(vars.map(([, tt]) => (tt === t ? 1 : 0))); rel.push("<="); b.push(Cr - E.base[t]); }
    vars.forEach(([k], j) => { const a = new Array(n).fill(0); a[j] = 1; A.push(a); rel.push("<="); b.push(V[k].pmax); });
    const r = O().lp({ c, A, rel, b, senso: "min" });
    if (r.stato !== "ottimo") return { stato: r.stato, C: Cr, prezzo };
    const x = V.map(() => new Array(nT).fill(0));
    vars.forEach(([k, t], j) => { x[k][t] = r.x[j]; });
    const tot = [];
    for (let t = 0; t < nT; t++) tot.push(E.base[t] + x.reduce((s, riga) => s + riga[t], 0));
    return {
      stato: "ottimo", costo: r.z, x, tot, picco: Math.max(...tot), C: Cr, prezzo,
      ombraEnergia: r.y.slice(0, V.length), ombraRete: r.y.slice(V.length, V.length + nT),
    };
  }

  // ---------------------------------------------------------------- cap. 6
  function deaDati(vista) {
    const d = D().dea;
    return vista === "1x1" ? { X: [d.personale], Y: [d.prestiti] } : { X: [d.personale, d.costi], Y: [d.prestiti, d.depositi] };
  }
  function dea(o, vrs = false, vista = "2x2") {
    const { X, Y } = deaDati(vista), m = X.length, p = Y.length, n = X[0].length;
    // fase 1: min theta (variabile 0), lambda 1..n
    const A = [], rel = [], b = [];
    for (let i = 0; i < m; i++) { A.push([X[i][o], ...X[i].map((v) => -v)]); rel.push(">="); b.push(0); }
    for (let r = 0; r < p; r++) { A.push([0, ...Y[r]]); rel.push(">="); b.push(Y[r][o]); }
    if (vrs) { A.push([0, ...new Array(n).fill(1)]); rel.push("="); b.push(1); }
    const c = [1, ...new Array(n).fill(0)];
    const r1 = O().lp({ c, A, rel, b, senso: "min" });
    if (r1.stato !== "ottimo") return { stato: r1.stato };
    const theta = r1.x[0];
    // fase 2: max somma degli scarti con theta fissato
    const A2 = [], rel2 = [], b2 = [], nv = n + m + p;
    for (let i = 0; i < m; i++) {
      const a = new Array(nv).fill(0);
      X[i].forEach((v, j) => (a[j] = v)); a[n + i] = 1;
      A2.push(a); rel2.push("="); b2.push(theta * X[i][o]);
    }
    for (let r = 0; r < p; r++) {
      const a = new Array(nv).fill(0);
      Y[r].forEach((v, j) => (a[j] = v)); a[n + m + r] = -1;
      A2.push(a); rel2.push("="); b2.push(Y[r][o]);
    }
    if (vrs) { const a = new Array(nv).fill(0); for (let j = 0; j < n; j++) a[j] = 1; A2.push(a); rel2.push("="); b2.push(1); }
    const c2 = new Array(nv).fill(0);
    for (let k = n; k < nv; k++) c2[k] = 1;
    const r2 = O().lp({ c: c2, A: A2, rel: rel2, b: b2, senso: "max" });
    const pul = (v) => (Math.abs(v) < 1e-6 ? 0 : v);
    const lam = r2.x.slice(0, n).map(pul), sIn = r2.x.slice(n, n + m).map(pul), sOut = r2.x.slice(n + m).map(pul);
    const tIn = X.map((riga, i) => theta * riga[o] - sIn[i]);
    const tOut = Y.map((riga, r) => riga[o] + sOut[r]);
    return {
      stato: "ottimo", theta, lam, sIn, sOut, tIn, tOut, X, Y,
      v: r1.y.slice(0, m), u: r1.y.slice(m, m + p),
      peer: lam.map((l, j) => [j, l]).filter((q) => q[1] > 1e-6),
      lamFase1: r1.x.slice(1),
    };
  }

  // ---------------------------------------------------------------- cap. 7
  function newsvendor(p = 15, lam = 0, alfa = 0.9) {
    const N = D().newsvendor, d = N.domanda, n = d.length;
    const Cu = p - N.c, Co = N.c - N.v;
    const costi = (q) => d.map((x) => (x < q ? Co * (q - x) : Cu * (x - q)));
    const media = (q) => costi(q).reduce((s, v) => s + v, 0) / n;
    const cv = (q) => O().cvar(costi(q), alfa);
    const obiettivo = (q) => (lam > 0 ? (1 - lam) * media(q) + lam * cv(q) : media(q));
    const lo = Math.min(...d), hi = Math.max(...d);
    let q = O().aureo(obiettivo, lo, hi, 1e-8);
    // con lam = 0 l'ottimo è uno scenario (quantile empirico): si aggancia al più vicino
    if (lam === 0) {
      const s = d.slice().sort((u, v) => u - v);
      q = s[Math.ceil((Cu / (Cu + Co)) * n - 1e-9) - 1];
    }
    const quant = (a) => { const s = d.slice().sort((u, v) => u - v); return s[Math.ceil(a * n - 1e-9) - 1]; };
    return {
      q, Cu, Co, alfaStar: Cu / (Cu + Co), media: media(q), cvar: cv(q), obiettivo: obiettivo(q),
      mediaDom: d.reduce((s, v) => s + v, 0) / n, costoMedia: media(N.mu), quantile: quant(Cu / (Cu + Co)),
      f: { media, cv, obiettivo }, d,
    };
  }

  // ---------------------------------------------------------------- cap. 10
  function regressione(t, y, tau = 0.5) {
    const r = O().quantileReg(t, y, tau);
    const res = y.map((v, i) => v - (r.w * t[i] + r.b));
    return Object.assign(r, {
      sopra: res.filter((v) => v > 1e-6).length, sotto: res.filter((v) => v < -1e-6).length,
      appoggio: res.map((v, i) => [i, v]).filter((q) => Math.abs(q[1]) <= 1e-6).map((q) => q[0]),
      scartoMedio: res.reduce((s, v) => s + Math.abs(v), 0) / res.length,
    });
  }

  ricaricaEv.ORE_CARE = ORE_CARE;
  W.GI_PL = { produzione, ricaricaEv, dea, newsvendor, regressione };
  if (typeof module !== "undefined" && module.exports) module.exports = W.GI_PL;
})();
