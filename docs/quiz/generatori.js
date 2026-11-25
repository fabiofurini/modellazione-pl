/* Autovalutazione — Modellazione PL / LP Modelling
 * Domande generate: dati nuovi a ogni facsimile (specifica: ../QUIZ_SPEC.md).
 * Ogni generatore restituisce { testo, opzioni, corretta, spiegazione, dati }:
 * "dati" (l'istanza) serve solo ai controlli di quiz/verifica/ e l'app lo ignora.
 * Nessuna dipendenza esterna, niente Math.random: solo rng().
 */
window.QUIZ_GEN = window.QUIZ_GEN || {};
(function () {
  "use strict";
  var MOD = "lp-modelling";
  var LISTA = (window.QUIZ_GEN[MOD] = window.QUIZ_GEN[MOD] || []);
  var URL_EN = "https://fabiofurini.github.io/lp-modelling/";
  var URL_IT = "https://fabiofurini.github.io/modellazione-pl/";

  function link(en, it) { return { it: URL_IT + it, en: URL_EN + en }; }
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pk(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  /* numero formattato con d decimali, zeri finali tolti; virgola decimale in italiano */
  function f(x, d, L) {
    var p = Math.pow(10, d);
    var y = Math.round(x * p + (x >= 0 ? 1e-7 : -1e-7)) / p;
    var s = y.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return L === "it" ? s.replace(".", ",") : s;
  }
  /* lo stesso numero, da scrivere dentro $...$ */
  function m(x, d, L) { return f(x, d, L).replace(",", "{,}"); }
  function T(L, en, it) { return L === "it" ? it : en; }
  function pos(x) { return x > 0 ? x : 0; }
  /* vero se x cade (quasi) a metà fra due valori arrotondati a d decimali */
  function quasiMezzo(x, d) { var y = x * Math.pow(10, d); return Math.abs(y - Math.floor(y) - 0.5) < 1e-3; }
  function sortNum(a) { return a.slice().sort(function (u, v) { return u - v; }); }

  /* opzioni: la giusta + le prime 3 sbagliate distinte; mescolate con rng */
  function chiudi(rng, testo, giusta, sbagliate, spiegazione, dati) {
    var opz = [giusta];
    for (var i = 0; i < sbagliate.length && opz.length < 4; i++) {
      if (opz.indexOf(sbagliate[i]) < 0) opz.push(sbagliate[i]);
    }
    if (opz.length < 4) return null;
    var idx = [0, 1, 2, 3];
    for (var k = 3; k > 0; k--) {
      var j = Math.floor(rng() * (k + 1));
      var t = idx[k]; idx[k] = idx[j]; idx[j] = t;
    }
    var out = [], corr = 0;
    for (var h = 0; h < 4; h++) { out.push(opz[idx[h]]); if (idx[h] === 0) corr = h; }
    return { testo: testo, opzioni: out, corretta: corr, spiegazione: spiegazione, dati: dati };
  }

  function gen(def) {
    LISTA.push({
      id: def.id, livello: def.livello, capitolo: def.capitolo, link: def.link,
      genera: function (rng, lingua) {
        var L = lingua === "it" ? "it" : "en";
        for (var t = 0; t < 2000; t++) {
          var r = def.prova(rng, L);
          if (r) return r;
        }
        throw new Error("generatore " + def.id + ": nessuna istanza valida");
      }
    });
  }

  /* ===================== Cap. 2 — teoria LP ===================== */

  function istanzaLP(rng) {
    var p1 = ri(rng, 1, 12), p2 = ri(rng, 1, 12);
    if (p1 === p2) return null;
    var a11 = ri(rng, 1, 4), a12 = ri(rng, 1, 4), a21 = ri(rng, 1, 4), a22 = ri(rng, 1, 4);
    var det = a11 * a22 - a12 * a21;
    if (det === 0) return null;
    var x1 = ri(rng, 5, 30), x2 = ri(rng, 5, 30);
    return {
      pi: [p1, p2], A: [[a11, a12], [a21, a22]], x: [x1, x2],
      c: [a11 * p1 + a21 * p2, a12 * p1 + a22 * p2],
      b: [a11 * x1 + a12 * x2, a21 * x1 + a22 * x2]
    };
  }
  function testoLP(I, L) {
    var A = I.A, c = I.c, b = I.b;
    function k(a) { return a === 1 ? "" : String(a); }
    return T(L, "Consider the LP ", "Si consideri l'LP ") +
      "$\\max\\; " + c[0] + "x_1 + " + c[1] + "x_2$ " + T(L, "subject to ", "soggetto a ") +
      "$" + k(A[0][0]) + "x_1 + " + k(A[0][1]) + "x_2 \\le " + b[0] + "$, $" +
      k(A[1][0]) + "x_1 + " + k(A[1][1]) + "x_2 \\le " + b[1] + "$, $x_1, x_2 \\ge 0$; " +
      T(L, "its dual has one variable $\\pi_i \\ge 0$ per constraint $i$ (the shadow price of the constraint). ",
           "il suo duale ha una variabile $\\pi_i \\ge 0$ per ogni vincolo $i$ (il prezzo ombra del vincolo). ");
  }

  gen({
    id: "lpm-g-lp-duali-cs", livello: "facile", capitolo: "background",
    link: link("theory-lp/#the-optimality-conditions-of-lp-complementary-slackness",
               "teoria-lp/#le-condizioni-di-ottimalita-delllp-gli-scarti-complementari"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var A = I.A, c = I.c, p = I.pi;
      var det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      // errore: sistema per righe A pi = c invece che per colonne
      var r1 = (c[0] * A[1][1] - A[0][1] * c[1]) / det, r2 = (A[0][0] * c[1] - A[1][0] * c[0]) / det;
      var q1 = c[0] / (A[0][0] + A[1][0]), q2 = c[1] / (A[0][1] + A[1][1]);
      var s1 = c[0] * I.x[0] / I.b[0], s2 = c[1] * I.x[1] / I.b[1];
      function o(a, b) { return "$(\\tilde\\pi_1; \\tilde\\pi_2) = (" + m(a, 2, L) + "; " + m(b, 2, L) + ")$"; }
      var testo = testoLP(I, L) + T(L,
        "The optimal solution is $(\\tilde x_1, \\tilde x_2) = (" + I.x[0] + ", " + I.x[1] + ")$, with both constraints active. What are the optimal dual values $(\\tilde\\pi_1, \\tilde\\pi_2)$?",
        "La soluzione ottima è $(\\tilde x_1, \\tilde x_2) = (" + I.x[0] + ", " + I.x[1] + ")$, con entrambi i vincoli attivi. Quali sono i valori duali ottimi $(\\tilde\\pi_1, \\tilde\\pi_2)$?");
      var sp = T(L,
        "Both variables are positive, so by complementary slackness both dual constraints are active: $" + A[0][0] + "\\pi_1 + " + A[1][0] + "\\pi_2 = " + c[0] + "$ and $" + A[0][1] + "\\pi_1 + " + A[1][1] + "\\pi_2 = " + c[1] + "$ (the coefficients are the columns of the primal), hence $\\tilde\\pi = (" + p[0] + "; " + p[1] + ")$. Solving with the rows instead of the columns is the typical mistake.",
        "Le due variabili sono positive, quindi per gli scarti complementari i due vincoli duali sono attivi: $" + A[0][0] + "\\pi_1 + " + A[1][0] + "\\pi_2 = " + c[0] + "$ e $" + A[0][1] + "\\pi_1 + " + A[1][1] + "\\pi_2 = " + c[1] + "$ (i coefficienti sono le colonne del primale), da cui $\\tilde\\pi = (" + p[0] + "; " + p[1] + ")$. Risolvere con le righe invece che con le colonne è l'errore tipico.");
      var cand = [[r1, r2], [p[1], p[0]], [q1, q2], [s1, s2]].filter(function (u) { return u[0] >= 0 && u[1] >= 0; })
        .map(function (u) { return o(u[0], u[1]); });
      return chiudi(rng, testo, o(p[0], p[1]), cand, sp,
        { c: c, A: A, b: I.b, x: I.x });
    }
  });

  gen({
    id: "lpm-g-lp-costo-ridotto", livello: "facile", capitolo: "background",
    link: link("theory-lp/#sensitivity-analysis-in-lps", "teoria-lp/#lanalisi-di-sensitivita-negli-lp"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var p = I.pi, a13 = ri(rng, 1, 4), a23 = ri(rng, 1, 4), del = ri(rng, 1, 6);
      var val = a13 * p[0] + a23 * p[1], c3 = val - del;
      if (c3 <= 0) return null;
      var sw = a13 * p[1] + a23 * p[0];
      function o(r, s) { return "$\\bar c_3 = " + m(r, 2, L) + "$, " + T(L, "threshold", "soglia") + " $c_3^{\\max} = " + m(s, 2, L) + "$"; }
      var testo = testoLP(I, L) + T(L,
        "At the optimum the duals are $(\\tilde\\pi_1, \\tilde\\pi_2) = (" + p[0] + ", " + p[1] + ")$. We add a variable $x_3 \\ge 0$ with objective coefficient $c_3 = " + c3 + "$ and consumptions $a_{13} = " + a13 + "$, $a_{23} = " + a23 + "$. What are its reduced cost $\\bar c_3$ ($c_3$ minus the value of the resources it consumes at the shadow prices) and the threshold $c_3^{\\max}$, the smallest $c_3$ at which $x_3$ becomes worth using?",
        "All'ottimo i duali sono $(\\tilde\\pi_1, \\tilde\\pi_2) = (" + p[0] + ", " + p[1] + ")$. Si aggiunge una variabile $x_3 \\ge 0$ con coefficiente $c_3 = " + c3 + "$ in obiettivo e consumi $a_{13} = " + a13 + "$, $a_{23} = " + a23 + "$. Quanto valgono il suo costo ridotto $\\bar c_3$ ($c_3$ meno il valore delle risorse che consuma ai prezzi ombra) e la soglia $c_3^{\\max}$, il più piccolo $c_3$ per cui conviene usare $x_3$?");
      var sp = T(L,
        "The resources absorbed by one unit of $x_3$ are worth $" + a13 + "\\cdot " + p[0] + " + " + a23 + "\\cdot " + p[1] + " = " + val + "$ at the shadow prices, so $\\bar c_3 = " + c3 + " - " + val + " = " + (-del) + "$: $x_3$ stays at zero and becomes worth activating only if $c_3$ rises to at least $" + val + "$.",
        "Le risorse assorbite da un'unità di $x_3$ valgono $" + a13 + "\\cdot " + p[0] + " + " + a23 + "\\cdot " + p[1] + " = " + val + "$ ai prezzi ombra, quindi $\\bar c_3 = " + c3 + " - " + val + " = " + (-del) + "$: $x_3$ resta a zero e conviene attivarla solo se $c_3$ sale almeno a $" + val + "$.");
      return chiudi(rng, testo, o(-del, val), [o(del, val), o(c3 - sw, sw), o(c3 - a13 * p[0], a13 * p[0]), o(-del, c3)], sp,
        { c: I.c, A: I.A, b: I.b, c3: c3, a3: [a13, a23] });
    }
  });

  /* ===================== Cap. 4 — produzione ===================== */

  function istanza2mesi(rng, stretto) {
    var b = pk(rng, [60, 70, 80, 90, 100]), de = 5 * ri(rng, 1, 6), d2 = b + de;
    var d1max = b - de - (stretto ? 5 : 0);
    if (Math.floor(d1max / 5) < 4) return null;
    var d1 = 5 * ri(rng, 4, Math.floor(d1max / 5));
    var c = ri(rng, 5, 15), h = ri(rng, 1, 3);
    return { b: b, d1: d1, d2: d2, de: de, c: c, h: h };
  }
  function testo2mesi(I, L) {
    return T(L,
      "Production-inventory LP, one product, two months: $x_t$ = units produced and $s_t$ = inventory at the end of month $t$, balance $s_{t-1} + x_t = d_t + s_t$ ($s_0 = 0$), capacity $x_t \\le b_t$; minimize $\\sum_t (c\\,x_t + h\\,s_t)$. Data: demand $d_1 = " + I.d1 + "$, $d_2 = " + I.d2 + "$; $b_1 = b_2 = " + I.b + "$ units; $c = " + I.c + "$ €/unit, holding cost $h = " + I.h + "$ €/unit/month. ",
      "LP di produzione e scorte, un prodotto, due mesi: $x_t$ = unità prodotte e $s_t$ = scorta a fine mese $t$, bilancio $s_{t-1} + x_t = d_t + s_t$ ($s_0 = 0$), capacità $x_t \\le b_t$; si minimizza $\\sum_t (c\\,x_t + h\\,s_t)$. Dati: domanda $d_1 = " + I.d1 + "$, $d_2 = " + I.d2 + "$; $b_1 = b_2 = " + I.b + "$ unità; $c = " + I.c + "$ €/unità, costo di giacenza $h = " + I.h + "$ €/unità/mese. ");
  }

  gen({
    id: "lpm-g-prod-2mesi-costo", livello: "facile", capitolo: "production",
    link: link("production/#model", "produzione/#modello"),
    prova: function (rng, L) {
      var I = istanza2mesi(rng, false); if (!I) return null;
      var D = I.d1 + I.d2, giusto = I.c * D + I.h * I.de;
      function o(v) { return v + " €"; }
      var testo = testo2mesi(I, L) + T(L, "What is the optimal cost of the plan?", "Qual è il costo ottimo del piano?");
      var sp = T(L,
        "Month 2 produces at most $" + I.b + "$, so $\\tilde s_1 = d_2 - b_2 = " + I.de + "$ units are produced in month 1 and held for one month: $" + I.c + "\\cdot " + D + " + " + I.h + "\\cdot " + I.de + " = " + giusto + "$ €.",
        "Il mese 2 produce al più $" + I.b + "$, quindi $\\tilde s_1 = d_2 - b_2 = " + I.de + "$ unità si producono nel mese 1 e restano a scorta un mese: $" + I.c + "\\cdot " + D + " + " + I.h + "\\cdot " + I.de + " = " + giusto + "$ €.");
      return chiudi(rng, testo, o(giusto),
        [o(I.c * D), o(I.c * D + I.h * I.d2), o(I.c * D + 2 * I.h * I.de), o(I.c * 2 * I.b + I.h * I.de), o(I.c * D + I.h * I.b)],
        sp, I);
    }
  });

  gen({
    id: "lpm-g-prod-2mesi-duali", livello: "facile", capitolo: "production",
    link: link("production/#sensitivity", "produzione/#sensitivita"),
    prova: function (rng, L) {
      var I = istanza2mesi(rng, true); if (!I) return null;
      function o(a, b) { return "$\\tilde\\pi_1 = " + a + "$, $\\tilde\\pi_2 = " + b + "$"; }
      var testo = testo2mesi(I, L) + T(L,
        "What are the shadow prices $\\tilde\\pi_t = \\partial\\tilde z/\\partial b_t$ of the two capacity constraints ($\\tilde z$ = optimal cost; Gurobi's sign convention)?",
        "Quanto valgono i prezzi ombra $\\tilde\\pi_t = \\partial\\tilde z/\\partial b_t$ dei due vincoli di capacità ($\\tilde z$ = costo ottimo; convenzione di segno di Gurobi)?");
      var sp = T(L,
        "One more unit of capacity in month 2 lets one unit be produced a month later, saving the holding cost: $\\tilde\\pi_2 = -h = " + (-I.h) + "$ (a $\\le$ constraint in a minimization has $\\tilde\\pi \\le 0$). Month 1 produces $" + (I.d1 + I.de) + " < " + I.b + "$: its constraint is slack and $\\tilde\\pi_1 = 0$.",
        "Un'unità di capacità in più nel mese 2 permette di produrre un'unità un mese dopo, risparmiando la giacenza: $\\tilde\\pi_2 = -h = " + (-I.h) + "$ (un vincolo $\\le$ in un problema di minimo ha $\\tilde\\pi \\le 0$). Il mese 1 produce $" + (I.d1 + I.de) + " < " + I.b + "$: il suo vincolo non è attivo e $\\tilde\\pi_1 = 0$.");
      return chiudi(rng, testo, o(0, -I.h), [o(0, I.h), o(-I.h, 0), o(0, -I.c), o(-I.h, -I.h)], sp, I);
    }
  });

  gen({
    id: "lpm-g-prod-3mesi", livello: "complessa", capitolo: "production",
    link: link("production/#model", "produzione/#modello"),
    prova: function (rng, L) {
      var b1 = 10 * ri(rng, 6, 10), b2 = 10 * ri(rng, 5, 10), b3 = 10 * ri(rng, 5, 10);
      var d3s = 5 * ri(rng, 2, 6), d2s = 5 * ri(rng, 1, 5);
      var d3 = b3 + d3s, d2 = b2 - d3s + d2s;
      if (d2 < 20) return null;
      var d1max = b1 - d2s - 5;
      if (Math.floor(d1max / 5) < 4) return null;
      var d1 = 5 * ri(rng, 4, Math.floor(d1max / 5));
      var c = ri(rng, 5, 12), h = ri(rng, 1, 3), D = d1 + d2 + d3;
      var s1 = d2s, s2 = d3s, z = c * D + h * (s1 + s2);
      function o(zz, a, b) { return "$\\tilde z = " + zz + "$ €, $\\tilde s_1 = " + a + "$, $\\tilde s_2 = " + b + "$"; }
      // errori tipici
      var s1A = pos(d2 - b2);
      var x1 = Math.min(b1, D), x2 = Math.min(b2, D - x1);
      var s1B = x1 - d1, s2B = s1B + x2 - d2;
      var testo = T(L,
        "Production-inventory LP, one product, three months: $x_t$ = units produced and $s_t$ = inventory at the end of month $t$, balance $s_{t-1} + x_t = d_t + s_t$ ($s_0 = 0$), capacity $x_t \\le b_t$; minimize $z = \\sum_t (c\\,x_t + h\\,s_t)$. Data: $(d_1, d_2, d_3) = (" + d1 + ", " + d2 + ", " + d3 + ")$, $(b_1, b_2, b_3) = (" + b1 + ", " + b2 + ", " + b3 + ")$, $c = " + c + "$ €/unit, $h = " + h + "$ €/unit/month. What are the optimal cost $\\tilde z$ and the optimal inventories $\\tilde s_1, \\tilde s_2$?",
        "LP di produzione e scorte, un prodotto, tre mesi: $x_t$ = unità prodotte e $s_t$ = scorta a fine mese $t$, bilancio $s_{t-1} + x_t = d_t + s_t$ ($s_0 = 0$), capacità $x_t \\le b_t$; si minimizza $z = \\sum_t (c\\,x_t + h\\,s_t)$. Dati: $(d_1, d_2, d_3) = (" + d1 + ", " + d2 + ", " + d3 + ")$, $(b_1, b_2, b_3) = (" + b1 + ", " + b2 + ", " + b3 + ")$, $c = " + c + "$ €/unità, $h = " + h + "$ €/unità/mese. Quanto valgono il costo ottimo $\\tilde z$ e le scorte ottime $\\tilde s_1, \\tilde s_2$?");
      var sp = T(L,
        "With the same $c$ every month it pays to produce as late as possible. Month 3 lacks $" + d3 + " - " + b3 + " = " + s2 + "$ units: $\\tilde s_2 = " + s2 + "$. Month 2 must cover $" + d2 + " + " + s2 + " = " + (d2 + s2) + " > " + b2 + "$, so $\\tilde s_1 = " + s1 + "$. Cost $" + c + "\\cdot " + D + " + " + h + "\\cdot(" + s1 + " + " + s2 + ") = " + z + "$ €.",
        "Con lo stesso $c$ in ogni mese conviene produrre il più tardi possibile. Al mese 3 mancano $" + d3 + " - " + b3 + " = " + s2 + "$ unità: $\\tilde s_2 = " + s2 + "$. Il mese 2 deve coprire $" + d2 + " + " + s2 + " = " + (d2 + s2) + " > " + b2 + "$, quindi $\\tilde s_1 = " + s1 + "$. Costo $" + c + "\\cdot " + D + " + " + h + "\\cdot(" + s1 + " + " + s2 + ") = " + z + "$ €.");
      return chiudi(rng, testo, o(z, s1, s2),
        [o(c * D + h * (s1A + s2), s1A, s2), o(c * D + h * (s1B + s2B), s1B, s2B), o(c * D + h * s2, s1, s2), o(c * D + h * (2 * s1 + s2), s1, s2)],
        sp, { b: [b1, b2, b3], d: [d1, d2, d3], c: c, h: h });
    }
  });

  /* ===================== Cap. 5 — supply chain ===================== */



  /* ===================== Cap. 6 — Markowitz ===================== */




  /* ===================== Cap. 7 — pricing ===================== */

  function istanzaPricing(rng, soloAttivo) {
    var b = pk(rng, [2, 4, 5, 10]), A = 10 * ri(rng, 10, 30);
    var c = 2 * ri(rng, 5, 40);
    if (c >= A - 20) return null;
    var p0 = (A + c) / 2, q0 = b * (A - p0);
    var attivo = soloAttivo ? true : rng() < 0.6;
    var k;
    if (attivo) { k = q0 - b * 5 * ri(rng, 1, 6); if (k <= 0) return null; }
    else { k = q0 + 10 * ri(rng, 1, 10); }
    var ps = attivo ? (b * A - k) / b : p0;
    return { a: b * A, b: b, A: A, c: c, k: k, p0: p0, q0: q0, ps: ps, attivo: attivo };
  }
  function profitto(I, p) { return (p - I.c) * Math.max(0, Math.min(I.a - I.b * p, I.k)); }



  /* ===================== Cap. 8 — budget ===================== */


  /* ===================== Cap. 9 — localizzazione ===================== */


  /* ===================== Cap. 10 — ricarica EV ===================== */

  gen({
    id: "lpm-g-ev-un-veicolo", livello: "facile", capitolo: "ev-charging",
    link: link("ev-charging/#model", "ricarica-ev/#modello"),
    prova: function (rng, L) {
      var pr = [0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3];
      var i1 = ri(rng, 0, 5), i2 = ri(rng, i1 + 1, 6), p1 = pr[i1], p2 = pr[i2];
      var pb = ri(rng, 4, 12), e = pb + ri(rng, 1, pb - 1);
      var z = pb * p1 + (e - pb) * p2;
      function o(a, b) { return T(L, "cost ", "costo ") + f(a, 2, L) + " €, " + T(L, "shadow price ", "prezzo ombra ") + f(b, 2, L) + " €/kWh"; }
      var testo = T(L,
        "EV charging LP, one vehicle, two one-hour slots: $x_t$ = energy charged in hour $t$ (kWh), $0 \\le x_t \\le \\bar p = " + pb + "$ (charger power, kW), requirement $x_1 + x_2 \\ge e = " + e + "$ kWh (efficiency $r = 1$); minimize $c_1x_1 + c_2x_2$ with $c_1 = " + m(p1, 2, L) + "$, $c_2 = " + m(p2, 2, L) + "$ €/kWh. What are the minimum cost and the shadow price of the requirement (cost of one more kWh)?",
        "LP di ricarica EV, un veicolo, due fasce di un'ora: $x_t$ = energia caricata nell'ora $t$ (kWh), $0 \\le x_t \\le \\bar p = " + pb + "$ (potenza del caricatore, kW), requisito $x_1 + x_2 \\ge e = " + e + "$ kWh (rendimento $r = 1$); si minimizza $c_1x_1 + c_2x_2$ con $c_1 = " + m(p1, 2, L) + "$, $c_2 = " + m(p2, 2, L) + "$ €/kWh. Quanto valgono il costo minimo e il prezzo ombra del requisito (costo di un kWh in più)?");
      var sp = T(L,
        "The cheap hour is used at full power ($" + pb + "$ kWh), the remaining $" + (e - pb) + "$ kWh go into hour 2: $" + m(z, 2, L) + "$ €. One more kWh would end up in the expensive hour: the dual is the price of the marginal hour, $" + m(p2, 2, L) + "$.",
        "L'ora economica si usa alla potenza massima ($" + pb + "$ kWh), i restanti $" + (e - pb) + "$ kWh vanno nell'ora 2: $" + m(z, 2, L) + "$ €. Un kWh in più finirebbe nell'ora cara: il duale è il prezzo dell'ora marginale, $" + m(p2, 2, L) + "$.");
      return chiudi(rng, testo, o(z, p2), [o(z, p1), o(e * p1, p1), o(z, p2 - p1), o(e * p2, p2)], sp,
        { e: e, p1: p1, p2: p2, pbar: pb });
    }
  });

  /* ===================== Cap. 11 — code ===================== */



  /* ===================== Cap. 12 — DEA ===================== */

  function istanzaDEA1(rng) {
    var n = 5, x = [], y = [];
    for (var j = 0; j < n; j++) { x.push(ri(rng, 2, 12)); y.push(ri(rng, 1, 12)); }
    return { x: x, y: y, n: n };
  }
  function tabellaDEA(I, L) {
    var s = T(L, "DMU $j$: ", "DMU $j$: ");
    var parti = [];
    for (var j = 0; j < I.n; j++) parti.push((j + 1) + " $(x_{1" + (j + 1) + "}, y_{1" + (j + 1) + "}) = (" + I.x[j] + ", " + I.y[j] + ")$");
    return s + parti.join("; ") + ". ";
  }
  function ccr1(I, o) {
    var best = 0;
    for (var j = 0; j < I.n; j++) best = Math.max(best, I.y[j] / I.x[j]);
    return (I.y[o] / I.x[o]) / best;
  }
  function bcc1(I, o, soloSingoli) {
    var best = Infinity;
    for (var j = 0; j < I.n; j++) {
      if (I.y[j] >= I.y[o]) best = Math.min(best, I.x[j]);
      if (soloSingoli) continue;
      for (var k = 0; k < I.n; k++) {
        if (I.y[j] < I.y[o] && I.y[o] < I.y[k]) {
          var a = (I.y[k] - I.y[o]) / (I.y[k] - I.y[j]);
          best = Math.min(best, a * I.x[j] + (1 - a) * I.x[k]);
        }
      }
    }
    return best / I.x[o];
  }

  gen({
    id: "lpm-g-dea-ccr-1x1", livello: "facile", capitolo: "dea",
    link: link("dea/#the-input-oriented-ccr-model", "dea/#il-modello-ccr-orientato-allinput"),
    prova: function (rng, L) {
      var I = istanzaDEA1(rng), o = ri(rng, 0, 4);
      var e = ccr1(I, o);
      if (e > 0.98) return null;
      var jb = 0, jy = 0, jx = 0;
      for (var j = 0; j < I.n; j++) {
        if (I.y[j] / I.x[j] > I.y[jb] / I.x[jb]) jb = j;
        if (I.y[j] > I.y[jy]) jy = j;
        if (I.x[j] < I.x[jx]) jx = j;
      }
      function op(v) { return "$\\tilde h_{" + (o + 1) + "} = " + m(v, 3, L) + "$"; }
      var r = I.y[o] / I.x[o];
      var testo = T(L,
        "DEA with five DMUs (decision-making units), one input $x$ and one output $y$. ", "DEA con cinque DMU (unità decisionali), un input $x$ e un output $y$. ") + tabellaDEA(I, L) + T(L,
        "The CCR efficiency of DMU $o$ is $h_o = \\max\\, u\\,y_o/(v\\,x_o)$ over the weights $u, v \\ge 0$ that give every DMU $j$ a ratio $u\\,y_j/(v\\,x_j) \\le 1$. What is the CCR efficiency $\\tilde h_{" + (o + 1) + "}$ of DMU " + (o + 1) + "?",
        "L'efficienza CCR della DMU $o$ è $h_o = \\max\\, u\\,y_o/(v\\,x_o)$ sui pesi $u, v \\ge 0$ che danno a ogni DMU $j$ un rapporto $u\\,y_j/(v\\,x_j) \\le 1$. Qual è l'efficienza CCR $\\tilde h_{" + (o + 1) + "}$ della DMU " + (o + 1) + "?");
      var sp = T(L,
        "With one input and one output the weights cancel: the efficiency is $y_o/x_o$ divided by the best ratio, $" + I.y[jb] + "/" + I.x[jb] + "$ of DMU " + (jb + 1) + ": $(" + I.y[o] + "/" + I.x[o] + ")/(" + I.y[jb] + "/" + I.x[jb] + ") = " + m(e, 3, L) + "$.",
        "Con un input e un output i pesi si semplificano: l'efficienza è $y_o/x_o$ diviso il rapporto migliore, $" + I.y[jb] + "/" + I.x[jb] + "$ della DMU " + (jb + 1) + ": $(" + I.y[o] + "/" + I.x[o] + ")/(" + I.y[jb] + "/" + I.x[jb] + ") = " + m(e, 3, L) + "$.");
      return chiudi(rng, testo, op(e),
        [op(r / (I.y[jy] / I.x[jy])), op(I.y[o] / I.y[jy]), op(I.x[jx] / I.x[o]), op(r), op(bcc1(I, o, false))],
        sp, { x: I.x, y: I.y, o: o + 1 });
    }
  });

  gen({
    id: "lpm-g-dea-bcc-1x1", livello: "media", capitolo: "dea",
    link: link("dea/#the-bcc-model-and-scale-efficiency", "dea/#il-modello-bcc-e-lefficienza-di-scala"),
    prova: function (rng, L) {
      var I = istanzaDEA1(rng), o = ri(rng, 0, 4);
      var tB = bcc1(I, o, false), tS = bcc1(I, o, true), tC = ccr1(I, o);
      if (tB > 0.97 || tS - tB < 0.02 || tB - tC < 0.02) return null;
      function op(a, b) { return "$\\tilde\\theta^{\\rm BCC} = " + m(a, 3, L) + "$, $\\mathrm{SE} = " + m(b, 3, L) + "$"; }
      var testo = T(L,
        "DEA with five DMUs (decision-making units), one input $x$ and one output $y$. ", "DEA con cinque DMU (unità decisionali), un input $x$ e un output $y$. ") + tabellaDEA(I, L) + T(L,
        "The input-oriented BCC efficiency $\\tilde\\theta^{\\rm BCC}$ of DMU $o$ is the smallest $\\theta$ such that a convex combination of the DMUs ($\\lambda_j \\ge 0$, $\\sum_j\\lambda_j = 1$) produces at least $y_o$ with at most $\\theta x_o$; the scale efficiency is $\\mathrm{SE} = \\tilde\\theta^{\\rm CCR}/\\tilde\\theta^{\\rm BCC}$. DMU " + (o + 1) + " has $\\tilde\\theta^{\\rm CCR} = " + m(tC, 3, L) + "$. What are its $\\tilde\\theta^{\\rm BCC}$ and $\\mathrm{SE}$?",
        "L'efficienza BCC orientata all'input $\\tilde\\theta^{\\rm BCC}$ della DMU $o$ è il più piccolo $\\theta$ tale che una combinazione convessa delle DMU ($\\lambda_j \\ge 0$, $\\sum_j\\lambda_j = 1$) produca almeno $y_o$ con al più $\\theta x_o$; l'efficienza di scala è $\\mathrm{SE} = \\tilde\\theta^{\\rm CCR}/\\tilde\\theta^{\\rm BCC}$. La DMU " + (o + 1) + " ha $\\tilde\\theta^{\\rm CCR} = " + m(tC, 3, L) + "$. Quanto valgono il suo $\\tilde\\theta^{\\rm BCC}$ e $\\mathrm{SE}$?");
      var sp = T(L,
        "The BCC virtual DMU is a convex combination ($\\sum_j \\lambda_j = 1$) producing at least $y_o = " + I.y[o] + "$ with the least input: combining two DMUs on either side of $y_o$ gives $\\tilde\\theta^{\\rm BCC} = " + m(tB, 3, L) + "$, better than the best single DMU ($" + m(tS, 3, L) + "$). Then $\\mathrm{SE} = \\tilde\\theta^{\\rm CCR}/\\tilde\\theta^{\\rm BCC} = " + m(tC / tB, 3, L) + "$.",
        "La DMU virtuale BCC è una combinazione convessa ($\\sum_j \\lambda_j = 1$) che produce almeno $y_o = " + I.y[o] + "$ col minimo input: combinando due DMU ai due lati di $y_o$ si ottiene $\\tilde\\theta^{\\rm BCC} = " + m(tB, 3, L) + "$, meglio della migliore DMU singola ($" + m(tS, 3, L) + "$). Poi $\\mathrm{SE} = \\tilde\\theta^{\\rm CCR}/\\tilde\\theta^{\\rm BCC} = " + m(tC / tB, 3, L) + "$.");
      return chiudi(rng, testo, op(tB, tC / tB), [op(tS, tC / tS), op(tC, tC / tB), op(tB, tC), op(tC, 1)], sp,
        { x: I.x, y: I.y, o: o + 1 });
    }
  });

  /* theta CCR con 2 input e output y_j: punti normalizzati z_j = x_j / y_j */
  function theta2(Z, zo) {
    var best = Infinity, single = Infinity;
    function val(p) { return Math.max(p[0] / zo[0], p[1] / zo[1]); }
    for (var j = 0; j < Z.length; j++) {
      single = Math.min(single, val(Z[j]));
      for (var k = j + 1; k < Z.length; k++) {
        var al = [0, 1];
        // intersezione delle due rette p_i(a)/zo_i
        var A0 = (Z[j][0] - Z[k][0]) / zo[0], B0 = Z[k][0] / zo[0];
        var A1 = (Z[j][1] - Z[k][1]) / zo[1], B1 = Z[k][1] / zo[1];
        if (Math.abs(A0 - A1) > 1e-12) { var a = (B1 - B0) / (A0 - A1); if (a > 0 && a < 1) al.push(a); }
        for (var t = 0; t < al.length; t++) {
          var p = [al[t] * Z[j][0] + (1 - al[t]) * Z[k][0], al[t] * Z[j][1] + (1 - al[t]) * Z[k][1]];
          best = Math.min(best, val(p));
        }
      }
    }
    return { theta: Math.min(best, single), single: single };
  }

  gen({
    id: "lpm-g-dea-ccr-2input", livello: "complessa", capitolo: "dea",
    link: link("dea/#the-envelopment-form-the-dual", "dea/#la-forma-di-inviluppo-il-duale"),
    prova: function (rng, L) {
      var n = 5, Z = [], y = [], X = [];
      for (var j = 0; j < n; j++) {
        var z = [ri(rng, 2, 12), ri(rng, 2, 12)], yy = ri(rng, 1, 3);
        Z.push(z); y.push(yy); X.push([z[0] * yy, z[1] * yy]);
      }
      var o = ri(rng, 0, 4);
      var r = theta2(Z, Z[o]);
      if (r.theta > 0.95 || r.single - r.theta < 0.02) return null;
      var raw = theta2(X, X[o]).theta;
      var mn = Infinity;
      for (j = 0; j < n; j++) mn = Math.min(mn, Z[j][0] / Z[o][0], Z[j][1] / Z[o][1]);
      function op(t) { return "$\\tilde\\theta = " + m(t, 3, L) + "$, target $(" + m(t * X[o][0], 2, L) + "; " + m(t * X[o][1], 2, L) + ")$"; }
      var parti = [];
      for (j = 0; j < n; j++) parti.push((j + 1) + ": $(" + X[j][0] + ", " + X[j][1] + "; " + y[j] + ")$");
      var testo = T(L,
        "DEA with five DMUs (decision-making units), two inputs and one output, data $(x_{1j}, x_{2j}; y_{1j})$: " + parti.join(", ") + ". Input-oriented CCR envelopment model for DMU $o$: $\\min\\theta$ subject to $\\sum_j\\lambda_jx_{ij} \\le \\theta x_{io}$ ($i = 1, 2$), $\\sum_j\\lambda_jy_{1j} \\ge y_{1o}$, $\\lambda_j \\ge 0$. For $o = " + (o + 1) + "$, what are the efficiency $\\tilde\\theta$ and the radial input targets $(\\tilde\\theta x_{1o}; \\tilde\\theta x_{2o})$?",
        "DEA con cinque DMU (unità decisionali), due input e un output, dati $(x_{1j}, x_{2j}; y_{1j})$: " + parti.join(", ") + ". Forma di inviluppo CCR orientata all'input per la DMU $o$: $\\min\\theta$ soggetto a $\\sum_j\\lambda_jx_{ij} \\le \\theta x_{io}$ ($i = 1, 2$), $\\sum_j\\lambda_jy_{1j} \\ge y_{1o}$, $\\lambda_j \\ge 0$. Per $o = " + (o + 1) + "$, quanto valgono l'efficienza $\\tilde\\theta$ e i target radiali degli input $(\\tilde\\theta x_{1o}; \\tilde\\theta x_{2o})$?");
      var sp = T(L,
        "With constant returns divide the inputs by the output: the points $(x_{1j}/y_{1j}, x_{2j}/y_{2j})$ are compared with the same output. The envelopment form looks for the smallest $\\theta$ such that a combination of DMUs uses at most $\\theta$ times both inputs of DMU " + (o + 1) + ": here the optimum combines two DMUs, $\\tilde\\theta = " + m(r.theta, 3, L) + "$ (the best single DMU gives only $" + m(r.single, 3, L) + "$).",
        "Con rendimenti costanti si dividono gli input per l'output: i punti $(x_{1j}/y_{1j}, x_{2j}/y_{2j})$ si confrontano a parità di output. La forma di inviluppo cerca il più piccolo $\\theta$ tale che una combinazione di DMU usi al più $\\theta$ volte entrambi gli input della DMU " + (o + 1) + ": qui l'ottimo combina due DMU, $\\tilde\\theta = " + m(r.theta, 3, L) + "$ (la migliore DMU singola dà solo $" + m(r.single, 3, L) + "$).");
      return chiudi(rng, testo, op(r.theta), [op(r.single), op(raw), op(mn), op(Math.min(1, (r.theta + r.single) / 2 + 0.05))], sp,
        { X: X, y: y, o: o + 1 });
    }
  });

  /* ===================== Cap. 13 — newsvendor ===================== */

  gen({
    id: "lpm-g-nv-uniforme", livello: "facile", capitolo: "newsvendor",
    link: link("newsvendor/#basic-model-and-the-quantile-rule", "newsvendor/#modello-base-e-regola-del-quantile"),
    prova: function (rng, L) {
      var p = ri(rng, 10, 30), c = ri(rng, 3, p - 2), v = ri(rng, 0, c - 1);
      var cu = p - c, co = c - v, A = 10 * ri(rng, 5, 15), k = ri(rng, 2, 8), W = k * (cu + co);
      if (cu === co) return null;
      function o(a) { return "$f^* = " + m(a, 4, L) + "$, $q^* = " + m(A + a * W, 1, L) + "$"; }
      var al = cu / (cu + co);
      var testo = T(L,
        "Newsvendor: a quantity $q$ is ordered before the demand is known; each unit costs $c = " + c + "$ €, sells at $p = " + p + "$ € and, if unsold, is salvaged at $v = " + v + "$ €. Demand is uniform on $[" + A + ", " + (A + W) + "]$ and $q$ maximizes the expected profit. What are the critical ratio $f^* = \\mathbb P(D \\le q^*)$ and the optimal quantity $q^*$?",
        "Newsvendor: si ordina una quantità $q$ prima di conoscere la domanda; ogni unità costa $c = " + c + "$ €, si vende a $p = " + p + "$ € e, se invenduta, si recupera a $v = " + v + "$ €. La domanda è uniforme su $[" + A + ", " + (A + W) + "]$ e $q$ massimizza il profitto atteso. Quanto valgono il rapporto critico $f^* = \\mathbb P(D \\le q^*)$ e la quantità ottima $q^*$?");
      var sp = T(L,
        "$c_u = p - c = " + cu + "$, $c_o = c - v = " + co + "$, $f^* = c_u/(c_u + c_o) = " + cu + "/" + (cu + co) + "$; for the uniform distribution $F^{-1}(f) = " + A + " + " + W + "\\,f$, so $q^* = " + m(A + al * W, 1, L) + "$, not the mean.",
        "$c_u = p - c = " + cu + "$, $c_o = c - v = " + co + "$, $f^* = c_u/(c_u + c_o) = " + cu + "/" + (cu + co) + "$; per la distribuzione uniforme $F^{-1}(f) = " + A + " + " + W + "\\,f$, quindi $q^* = " + m(A + al * W, 1, L) + "$, non la media.");
      return chiudi(rng, testo, o(al), [o(co / (cu + co)), o(0.5), o(p / (p + c)), o(cu / (p + c))], sp,
        { p: p, c: c, v: v, A: A, B: A + W });
    }
  });

  function istanzaNVd(rng) {
    var k = pk(rng, [4, 5]), d = [];
    while (d.length < k) { var v = 10 * ri(rng, 5, 20); if (d.indexOf(v) < 0) d.push(v); }
    d = sortNum(d);
    var parts = [], rest = 10;
    for (var s = 0; s < k - 1; s++) {
      var mx = rest - (k - 1 - s);
      var t = ri(rng, 1, Math.min(4, mx)); parts.push(t); rest -= t;
    }
    if (rest < 1 || rest > 5) return null;
    parts.push(rest);
    var pr = parts.map(function (u) { return u / 10; });
    var cu = ri(rng, 2, 12), co = ri(rng, 2, 12);
    if (cu === co) return null;
    var al = cu / (cu + co), F = 0;
    for (s = 0; s < k; s++) { F += pr[s]; if (Math.abs(F - al) < 1e-9 || Math.abs(F - (1 - al)) < 1e-9 || Math.abs(F - 0.5) < 1e-9) return null; }
    return { d: d, pr: pr, cu: cu, co: co, al: al, k: k };
  }
  function nvCosto(I, q) {
    var C = 0;
    for (var s = 0; s < I.k; s++) C += I.pr[s] * (I.co * pos(q - I.d[s]) + I.cu * pos(I.d[s] - q));
    return C;
  }
  function nvQuantile(I, a) {
    var F = 0;
    for (var s = 0; s < I.k; s++) { F += I.pr[s]; if (F >= a - 1e-12) return s; }
    return I.k - 1;
  }
  function testoNVd(I, L) {
    var parti = [];
    for (var s = 0; s < I.k; s++) parti.push("$" + I.d[s] + "$ (" + m(I.pr[s], 1, L) + ")");
    return T(L, "Newsvendor: a quantity $q$ is ordered before the demand $D$ is known, to minimize the expected cost $\\mathbb E[c_o(q - D)^+ + c_u(D - q)^+]$, with underage cost $c_u = " + I.cu + "$ per unit of unmet demand and overage cost $c_o = " + I.co + "$ per unsold unit. Demand scenarios (probability in brackets): ",
           "Newsvendor: si ordina una quantità $q$ prima di conoscere la domanda $D$, per minimizzare il costo atteso $\\mathbb E[c_o(q - D)^+ + c_u(D - q)^+]$, con costo di underage $c_u = " + I.cu + "$ per unità di domanda non servita e di overage $c_o = " + I.co + "$ per unità invenduta. Scenari di domanda (probabilità tra parentesi): ") +
      parti.join(", ") + ". ";
  }

  gen({
    id: "lpm-g-nv-discreto", livello: "media", capitolo: "newsvendor",
    link: link("newsvendor/#the-scenario-based-linear-formulation", "newsvendor/#la-formulazione-lineare-a-scenari"),
    prova: function (rng, L) {
      var I = istanzaNVd(rng); if (!I) return null;
      var s = nvQuantile(I, I.al), q = I.d[s];
      var sm = nvQuantile(I, 0.5), ss = nvQuantile(I, 1 - I.al), sn = s + 1 < I.k ? s + 1 : s - 1;
      function o(j) { return "$q^* = " + I.d[j] + "$, " + T(L, "expected cost ", "costo atteso ") + f(nvCosto(I, I.d[j]), 2, L); }
      var testo = testoNVd(I, L) + T(L, "What are the optimal quantity $q^*$ and its expected cost?", "Quanto valgono la quantità ottima $q^*$ e il suo costo atteso?");
      var sp = T(L,
        "$f^* = " + I.cu + "/" + (I.cu + I.co) + " = " + m(I.al, 4, L) + "$: the optimum is the smallest $q$ with $F(q) \\ge f^*$, that is $q^* = " + q + "$, with expected cost $\\sum_s w_s (c_o (q - d_s)^+ + c_u (d_s - q)^+) = " + m(nvCosto(I, q), 2, L) + "$.",
        "$f^* = " + I.cu + "/" + (I.cu + I.co) + " = " + m(I.al, 4, L) + "$: l'ottimo è il più piccolo $q$ con $F(q) \\ge f^*$, cioè $q^* = " + q + "$, con costo atteso $\\sum_s w_s (c_o (q - d_s)^+ + c_u (d_s - q)^+) = " + m(nvCosto(I, q), 2, L) + "$.");
      return chiudi(rng, testo, o(s), [o(sm), o(ss), o(sn), o(s - 1 >= 0 ? s - 1 : s + 1)], sp,
        { d: I.d, pr: I.pr, cu: I.cu, co: I.co });
    }
  });

  gen({
    id: "lpm-g-nv-vss", livello: "complessa", capitolo: "newsvendor",
    link: link("newsvendor/#the-scenario-based-linear-formulation", "newsvendor/#la-formulazione-lineare-a-scenari"),
    prova: function (rng, L) {
      var I = istanzaNVd(rng); if (!I) return null;
      var s = nvQuantile(I, I.al), q = I.d[s], Cs = nvCosto(I, q);
      var dm = 0; for (var t = 0; t < I.k; t++) dm += I.pr[t] * I.d[t];
      var Cm = nvCosto(I, dm), vss = Cm - Cs;
      if (vss < 0.5) return null;
      var sm = nvQuantile(I, 0.5), ss = nvQuantile(I, 1 - I.al);
      function o(qq, c, v) { return "$q^* = " + qq + "$, " + T(L, "cost ", "costo ") + f(c, 2, L) + ", VSS $= " + m(v, 2, L) + "$"; }
      var testo = testoNVd(I, L) + T(L,
        "Compute the optimal quantity $q^*$, its expected cost and the value of the stochastic solution VSS (expected cost of ordering the mean demand minus the cost of $q^*$).",
        "Calcolare la quantità ottima $q^*$, il suo costo atteso e il valore della soluzione stocastica VSS (costo atteso di ordinare la domanda media meno il costo di $q^*$).");
      var sp = T(L,
        "$f^* = " + m(I.al, 4, L) + "$ gives $q^* = " + q + "$ with cost $" + m(Cs, 2, L) + "$. The mean demand is $" + m(dm, 1, L) + "$, whose expected cost is $" + m(Cm, 2, L) + "$: VSS $= " + m(Cm, 2, L) + " - " + m(Cs, 2, L) + " = " + m(vss, 2, L) + "$.",
        "$f^* = " + m(I.al, 4, L) + "$ dà $q^* = " + q + "$ con costo $" + m(Cs, 2, L) + "$. La domanda media è $" + m(dm, 1, L) + "$, con costo atteso $" + m(Cm, 2, L) + "$: VSS $= " + m(Cm, 2, L) + " - " + m(Cs, 2, L) + " = " + m(vss, 2, L) + "$.");
      var Cmed = nvCosto(I, I.d[sm]), Csw = nvCosto(I, I.d[ss]);
      return chiudi(rng, testo, o(q, Cs, vss),
        [o(q, Cs, Cm), (Cm - Cmed > 0 ? o(I.d[sm], Cmed, Cm - Cmed) : ""), (Cm - Csw > 0 ? o(I.d[ss], Csw, Cm - Csw) : ""), o(q, Cs, Cs)].filter(function (z) { return z; }),
        sp, { d: I.d, pr: I.pr, cu: I.cu, co: I.co });
    }
  });

  /* ===================== Cap. 14 — VaR e CVaR ===================== */

  function perdite(rng, k) {
    var l = [];
    while (l.length < k) { var v = ri(rng, 1, 40); if (l.indexOf(v) < 0) l.push(v); }
    return l;
  }
  function varcvar(l, pr, a) {
    var idx = l.map(function (_, i) { return i; }).sort(function (u, v) { return l[u] - l[v]; });
    var F = 0, V = null;
    for (var t = 0; t < idx.length; t++) { F += pr[idx[t]]; if (F >= a - 1e-12) { V = l[idx[t]]; break; } }
    var ex = 0;
    for (var i = 0; i < l.length; i++) ex += pr[i] * pos(l[i] - V);
    return { V: V, C: V + ex / (1 - a) };
  }

  gen({
    id: "lpm-g-cvar-coda-intera", livello: "facile", capitolo: "var-cvar",
    link: link("var-cvar/#definitions", "var-cvar/#definizioni"),
    prova: function (rng, L) {
      var cfg = pk(rng, [[5, 0.6], [8, 0.75], [10, 0.7], [10, 0.8]]), k = cfg[0], a = cfg[1];
      var l = perdite(rng, k), s = sortNum(l), na = Math.round(a * k), nt = k - na;
      var V = s[na - 1], C = 0; for (var i = na; i < k; i++) C += s[i]; C /= nt;
      var Cinc = (C * nt + V) / (nt + 1), mean = 0; for (i = 0; i < k; i++) mean += l[i]; mean /= k;
      function o(v, c) { return "VaR $= " + m(v, 2, L) + "$, CVaR $= " + m(c, 2, L) + "$"; }
      var testo = T(L,
        "Risk measures of a loss $L$ with $k = " + k + "$ equally likely scenarios: $" + l.join(", ") + "$. $\\mathrm{VaR}_\\alpha$ is the smallest loss $\\ell$ with $\\mathbb P(L \\le \\ell) \\ge \\alpha$; $\\mathrm{CVaR}_\\alpha$ is the mean loss in the worst tail of probability $1 - \\alpha$. With $\\alpha = " + m(a, 2, L) + "$, what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$?",
        "Misure di rischio di una perdita $L$ con $k = " + k + "$ scenari equiprobabili: $" + l.join(", ") + "$. $\\mathrm{VaR}_\\alpha$ è la più piccola perdita $\\ell$ con $\\mathbb P(L \\le \\ell) \\ge \\alpha$; $\\mathrm{CVaR}_\\alpha$ è la perdita media nella coda peggiore di probabilità $1 - \\alpha$. Con $\\alpha = " + m(a, 2, L) + "$, quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$?");
      var sp = T(L,
        "Sorting the losses, the distribution function reaches $" + m(a, 2, L) + "$ at position " + na + " in increasing order: VaR $= " + V + "$. The tail of mass $1 - \\alpha$ contains exactly the " + nt + " worst losses, whose mean is the CVaR, $" + m(C, 2, L) + "$.",
        "Ordinando le perdite, la funzione di ripartizione raggiunge $" + m(a, 2, L) + "$ alla posizione " + na + " in ordine crescente: VaR $= " + V + "$. La coda di massa $1 - \\alpha$ contiene esattamente le " + nt + " perdite peggiori, la cui media è il CVaR, $" + m(C, 2, L) + "$.");
      return chiudi(rng, testo, o(V, C), [o(s[na], C), o(V, Cinc), o(V, s[k - 1]), o(mean, C)], sp,
        { l: l, alpha: a });
    }
  });

  gen({
    id: "lpm-g-cvar-a-cavallo", livello: "media", capitolo: "var-cvar",
    link: link("var-cvar/#the-rockafellaruryasev-linear-formulation", "var-cvar/#la-formulazione-lineare-di-rockafellaruryasev"),
    prova: function (rng, L) {
      var k = 6, a = pk(rng, [0.7, 0.75, 0.8]);
      var l = perdite(rng, k), pr = [], s = sortNum(l);
      for (var i = 0; i < k; i++) pr.push(1 / k);
      var r = varcvar(l, pr, a);
      var ceilT = Math.ceil((1 - a) * k), floorT = Math.floor((1 - a) * k);
      function meanTop(t) { var c = 0; for (var j = k - t; j < k; j++) c += s[j]; return c / t; }
      var wV = s[Math.ceil(a * k)] !== undefined ? s[Math.ceil(a * k)] : s[k - 2];
      function o(v, c) { return "VaR $= " + m(v, 2, L) + "$, CVaR $= " + m(c, 2, L) + "$"; }
      var testo = T(L,
        "Risk measures of a loss $L$ with six equally likely scenarios: $" + l.join(", ") + "$. $\\mathrm{VaR}_\\alpha$ is the smallest loss $\\ell$ with $\\mathbb P(L \\le \\ell) \\ge \\alpha$, and $\\mathrm{CVaR}_\\alpha = \\mathrm{VaR}_\\alpha + \\mathbb E[(L - \\mathrm{VaR}_\\alpha)^+]/(1 - \\alpha)$. With $\\alpha = " + m(a, 2, L) + "$ (the tail of probability $1 - \\alpha$ is not a whole number of scenarios), what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$?",
        "Misure di rischio di una perdita $L$ con sei scenari equiprobabili: $" + l.join(", ") + "$. $\\mathrm{VaR}_\\alpha$ è la più piccola perdita $\\ell$ con $\\mathbb P(L \\le \\ell) \\ge \\alpha$, e $\\mathrm{CVaR}_\\alpha = \\mathrm{VaR}_\\alpha + \\mathbb E[(L - \\mathrm{VaR}_\\alpha)^+]/(1 - \\alpha)$. Con $\\alpha = " + m(a, 2, L) + "$ (la coda di probabilità $1 - \\alpha$ non è un numero intero di scenari), quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$?");
      var sp = T(L,
        "VaR $= " + r.V + "$, the first loss at which the distribution function reaches $\\alpha$. Then $\\mathrm{CVaR} = \\mathrm{VaR} + \\frac{1}{1-\\alpha}\\sum_s w_s (\\ell_s - \\mathrm{VaR})^+ = " + m(r.C, 2, L) + "$: the part of the tail mass that sits on the VaR point is counted at the VaR value.",
        "VaR $= " + r.V + "$, la prima perdita in cui la funzione di ripartizione raggiunge $\\alpha$. Poi $\\mathrm{CVaR} = \\mathrm{VaR} + \\frac{1}{1-\\alpha}\\sum_s w_s (\\ell_s - \\mathrm{VaR})^+ = " + m(r.C, 2, L) + "$: la parte della massa di coda che sta sul punto del VaR si conta al valore del VaR.");
      var cand = [o(r.V, meanTop(ceilT)), o(r.V, floorT > 0 ? meanTop(floorT) : s[k - 1] + 1), o(wV, r.C), o(r.V, s[k - 1])];
      return chiudi(rng, testo, o(r.V, r.C), cand, sp, { l: l, pr: pr, alpha: a });
    }
  });

  gen({
    id: "lpm-g-cvar-pesato", livello: "complessa", capitolo: "var-cvar",
    link: link("var-cvar/#the-rockafellaruryasev-linear-formulation", "var-cvar/#la-formulazione-lineare-di-rockafellaruryasev"),
    prova: function (rng, L) {
      var k = 5, a = pk(rng, [0.8, 0.85, 0.9]);
      var l = perdite(rng, k), u = [], rest = 20;
      for (var i = 0; i < k - 1; i++) { var t = ri(rng, 1, Math.min(8, rest - (k - 1 - i))); u.push(t); rest -= t; }
      if (rest < 1 || rest > 8) return null;
      u.push(rest);
      var pr = u.map(function (x) { return x / 20; });
      // F non deve coincidere con alpha
      var idx = l.map(function (_, j) { return j; }).sort(function (p, q) { return l[p] - l[q]; });
      var F = 0;
      for (i = 0; i < k; i++) { F += pr[idx[i]]; if (Math.abs(F - a) < 1e-9) return null; }
      var r = varcvar(l, pr, a), eq = varcvar(l, [0.2, 0.2, 0.2, 0.2, 0.2], a);
      var num = 0, den = 0, num2 = 0, den2 = 0;
      for (i = 0; i < k; i++) {
        if (l[i] > r.V) { num += pr[i] * l[i]; den += pr[i]; }
        if (l[i] >= r.V) { num2 += pr[i] * l[i]; den2 += pr[i]; }
      }
      if (den === 0) return null;
      function o(v, c) { return "VaR $= " + m(v, 2, L) + "$, CVaR $= " + m(c, 2, L) + "$"; }
      var parti = [];
      for (i = 0; i < k; i++) parti.push("$" + l[i] + "$ (" + m(pr[i], 2, L) + ")");
      var testo = T(L,
        "Risk measures of a loss $L$ with scenarios (probability in brackets): " + parti.join(", ") + ". $\\mathrm{VaR}_\\alpha$ is the smallest loss $\\ell$ with $\\mathbb P(L \\le \\ell) \\ge \\alpha$; $\\mathrm{CVaR}_\\alpha$ is the optimal value of the Rockafellar–Uryasev LP $\\min_\\eta\\, \\eta + \\mathbb E[(L - \\eta)^+]/(1 - \\alpha)$. With $\\alpha = " + m(a, 2, L) + "$, what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$?",
        "Misure di rischio di una perdita $L$ con scenari (probabilità tra parentesi): " + parti.join(", ") + ". $\\mathrm{VaR}_\\alpha$ è la più piccola perdita $\\ell$ con $\\mathbb P(L \\le \\ell) \\ge \\alpha$; $\\mathrm{CVaR}_\\alpha$ è il valore ottimo dell'LP di Rockafellar–Uryasev $\\min_\\eta\\, \\eta + \\mathbb E[(L - \\eta)^+]/(1 - \\alpha)$. Con $\\alpha = " + m(a, 2, L) + "$, quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$?");
      var sp = T(L,
        "Sorting the losses and accumulating the probabilities, $F$ reaches $" + m(a, 2, L) + "$ at $\\ell = " + r.V + "$: VaR $= " + r.V + "$. Then $\\mathrm{CVaR} = " + r.V + " + \\frac{1}{" + m(1 - a, 2, L) + "}\\sum_s w_s(\\ell_s - " + r.V + ")^+ = " + m(r.C, 2, L) + "$. The conditional mean beyond the VaR ignores the tail mass sitting on the VaR point.",
        "Ordinando le perdite e cumulando le probabilità, $F$ raggiunge $" + m(a, 2, L) + "$ in $\\ell = " + r.V + "$: VaR $= " + r.V + "$. Poi $\\mathrm{CVaR} = " + r.V + " + \\frac{1}{" + m(1 - a, 2, L) + "}\\sum_s w_s(\\ell_s - " + r.V + ")^+ = " + m(r.C, 2, L) + "$. La media condizionata oltre il VaR ignora la massa di coda che sta sul punto del VaR.");
      return chiudi(rng, testo, o(r.V, r.C), [o(eq.V, eq.C), o(r.V, num / den), o(r.V, num2 / den2), o(r.V, r.V + num - r.V * den)], sp,
        { l: l, pr: pr, alpha: a });
    }
  });

  /* ===================== Cap. 15 — arbitraggio ===================== */

  function istanzaArb(rng) {
    var R = pk(rng, [1, 1.05, 1.1, 1.25]), s0 = ri(rng, 10, 50);
    var Rs = R * s0, d = ri(rng, Math.max(1, Math.floor(0.5 * s0)), Math.floor(Rs) - 1), u = ri(rng, Math.ceil(Rs) + 1, Math.ceil(1.6 * Rs) + 2);
    if (!(d < Rs && Rs < u)) return null;
    var q1 = (Rs - d) / (u - d);
    if (q1 < 0.05 || q1 > 0.95) return null;
    return { R: R, s0: s0, d: d, u: u, q1: q1 };
  }
  function testoArb(I, L) {
    return T(L,
      "One-period market with two states of the world: a risk-free security costs $1$ today and pays $R = " + m(I.R, 2, L) + "$ in both states; a risky security costs $s^0_1 = " + I.s0 + "$ today and pays $" + I.u + "$ in state 1 and $" + I.d + "$ in state 2. Risk-neutral probabilities are $q_1, q_2 \\ge 0$ with $q_1 + q_2 = 1$ under which every price equals the expected payoff divided by $R$. ",
      "Mercato a un periodo con due stati del mondo: un titolo privo di rischio costa oggi $1$ e paga $R = " + m(I.R, 2, L) + "$ in entrambi gli stati; un titolo rischioso costa oggi $s^0_1 = " + I.s0 + "$ e paga $" + I.u + "$ nello stato 1 e $" + I.d + "$ nello stato 2. Le probabilità neutrali al rischio sono $q_1, q_2 \\ge 0$ con $q_1 + q_2 = 1$ sotto le quali ogni prezzo è il pagamento atteso diviso per $R$. ");
  }

  gen({
    id: "lpm-g-arb-neutrali", livello: "facile", capitolo: "arbitrage",
    link: link("arbitrage/#duality-is-pricing", "arbitraggio/#la-dualita-e-la-prezzatura"),
    prova: function (rng, L) {
      var I = istanzaArb(rng); if (!I) return null;
      function o(a) { return "$(q_1; q_2) = (" + m(a, 4, L) + "; " + m(1 - a, 4, L) + ")$"; }
      var testo = testoArb(I, L) + T(L, "What are $q_1$ and $q_2$?", "Quanto valgono $q_1$ e $q_2$?");
      var sp = T(L,
        "The price is the discounted expected payoff: $s^0_1 = (q_1 \\cdot " + I.u + " + q_2 \\cdot " + I.d + ")/R$ with $q_1 + q_2 = 1$, so $q_1 = (R s^0_1 - " + I.d + ")/(" + I.u + " - " + I.d + ") = " + m(I.q1, 4, L) + "$. Forgetting $R$ is the typical mistake.",
        "Il prezzo è il valore atteso scontato dei pagamenti: $s^0_1 = (q_1 \\cdot " + I.u + " + q_2 \\cdot " + I.d + ")/R$ con $q_1 + q_2 = 1$, quindi $q_1 = (R s^0_1 - " + I.d + ")/(" + I.u + " - " + I.d + ") = " + m(I.q1, 4, L) + "$. Dimenticare $R$ è l'errore tipico.");
      var cand = [(I.s0 - I.d) / (I.u - I.d), 1 - I.q1, I.R * I.s0 / I.u, 0.5].filter(function (y) { return y > 0 && y < 1; }).map(o);
      return chiudi(rng, testo, o(I.q1), cand, sp,
        { R: I.R, s0: I.s0, u: I.u, d: I.d });
    }
  });

  gen({
    id: "lpm-g-arb-call", livello: "media", capitolo: "arbitrage",
    link: link("arbitrage/#sensitivity-the-interval-of-consistent-prices", "arbitraggio/#sensitivita-lintervallo-dei-prezzi-coerenti"),
    prova: function (rng, L) {
      var I = istanzaArb(rng); if (!I) return null;
      var K = ri(rng, I.d + 1, I.u - 1), pay = I.u - K;
      var pr = I.q1 * pay / I.R;
      var qn = (I.s0 - I.d) / (I.u - I.d);
      function o(v) { return f(v, 2, L); }
      var testo = testoArb(I, L) + T(L,
        "A call option with strike $" + K + "$ pays tomorrow $\\max(s^1_{1j} - " + K + ", 0)$ in state $j$, where $s^1_{1j}$ is the payoff of the risky security. In this complete market, what is the arbitrage-free price of the call today?",
        "Un'opzione call con strike $" + K + "$ paga domani $\\max(s^1_{1j} - " + K + ", 0)$ nello stato $j$, dove $s^1_{1j}$ è il pagamento del titolo rischioso. In questo mercato completo, qual è oggi il prezzo senza arbitraggio della call?");
      var sp = T(L,
        "The risk-neutral probabilities are $q_1 = (R s^0_1 - " + I.d + ")/(" + I.u + " - " + I.d + ") = " + m(I.q1, 4, L) + "$, $q_2 = 1 - q_1$. The call pays $(" + pay + ", 0)$, so its price is $q_1 \\cdot " + pay + "/R = " + m(pr, 2, L) + "$: discounted expected value under $q$.",
        "Le probabilità neutrali al rischio sono $q_1 = (R s^0_1 - " + I.d + ")/(" + I.u + " - " + I.d + ") = " + m(I.q1, 4, L) + "$, $q_2 = 1 - q_1$. La call paga $(" + pay + ", 0)$, quindi il suo prezzo è $q_1 \\cdot " + pay + "/R = " + m(pr, 2, L) + "$: valore atteso scontato sotto $q$.");
      return chiudi(rng, testo, o(pr), [o(I.q1 * pay), o(qn * pay / I.R), o(0.5 * pay / I.R), o(pos(I.s0 - K))], sp,
        { R: I.R, s0: I.s0, u: I.u, d: I.d, K: K });
    }
  });

  /* ===================== Cap. 16 — SVM ===================== */


  /* ===================== Cap. 17 — regressione ===================== */

  function perditaQ(y, b, tau) {
    var z = 0;
    for (var i = 0; i < y.length; i++) z += tau * pos(y[i] - b) + (1 - tau) * pos(b - y[i]);
    return z;
  }

  gen({
    id: "lpm-g-reg-perdita", livello: "facile", capitolo: "regression",
    link: link("regression/#the-model", "regressione/#il-modello"),
    prova: function (rng, L) {
      var n = 5, y = [];
      while (y.length < n) { var v = ri(rng, 80, 150); if (y.indexOf(v) < 0) y.push(v); }
      var tau = pk(rng, [0.25, 0.75, 0.8, 0.9]), b = ri(rng, 90, 140);
      var up = 0, dn = 0;
      for (var i = 0; i < n; i++) { up += pos(y[i] - b); dn += pos(b - y[i]); }
      if (up === 0 || dn === 0) return null;
      function o(z) { return "$" + m(z, 2, L) + "$"; }
      var testo = T(L,
        "Quantile regression with no features: an intercept $b$ is fitted to $y = (" + y.join("; ") + ")$ by minimizing $\\sum_i [\\tau u_i + (1 - \\tau) v_i]$, where $u_i = (y_i - b)^+$ and $v_i = (b - y_i)^+$ are the deviations above and below $b$. With $\\tau = " + m(tau, 2, L) + "$, what is the objective value for $b = " + b + "$?",
        "Regressione quantile senza caratteristiche: si stima un'intercetta $b$ per $y = (" + y.join("; ") + ")$ minimizzando $\\sum_i [\\tau u_i + (1 - \\tau) v_i]$, dove $u_i = (y_i - b)^+$ e $v_i = (b - y_i)^+$ sono gli scostamenti sopra e sotto $b$. Con $\\tau = " + m(tau, 2, L) + "$, quanto vale l'obiettivo per $b = " + b + "$?");
      var sp = T(L,
        "The deviations above ($u_i$, observations larger than $b$) sum to $" + up + "$ and are paid $\\tau$; those below ($v_i$) sum to $" + dn + "$ and are paid $1 - \\tau$: $" + m(tau, 2, L) + "\\cdot " + up + " + " + m(1 - tau, 2, L) + "\\cdot " + dn + " = " + m(tau * up + (1 - tau) * dn, 2, L) + "$.",
        "Gli scostamenti in eccesso ($u_i$, osservazioni maggiori di $b$) sommano $" + up + "$ e si pagano $\\tau$; quelli in difetto ($v_i$) sommano $" + dn + "$ e si pagano $1 - \\tau$: $" + m(tau, 2, L) + "\\cdot " + up + " + " + m(1 - tau, 2, L) + "\\cdot " + dn + " = " + m(tau * up + (1 - tau) * dn, 2, L) + "$.");
      return chiudi(rng, testo, o(tau * up + (1 - tau) * dn),
        [o((1 - tau) * up + tau * dn), o(up + dn), o(tau * (up + dn)), o(0.5 * (up + dn))], sp, { y: y, tau: tau, b: b });
    }
  });

  gen({
    id: "lpm-g-reg-quantile", livello: "media", capitolo: "regression",
    link: link("regression/#the-model", "regressione/#il-modello"),
    prova: function (rng, L) {
      var n = ri(rng, 5, 9), y = [];
      while (y.length < n) { var v = ri(rng, 80, 160); if (y.indexOf(v) < 0) y.push(v); }
      var tau = pk(rng, [0.25, 0.3, 0.6, 0.7, 0.75, 0.8, 0.9]);
      var tn = tau * n;
      if (Math.abs(tn - Math.round(tn)) < 1e-9) return null;
      var s = sortNum(y), j = Math.ceil(tn) - 1, b = s[j];
      var jm = Math.ceil(0.5 * n - 1e-9) - 1;
      function o(bb) { return "$\\tilde b = " + m(bb, 1, L) + "$, $\\tilde z = " + m(perditaQ(y, bb, tau), 2, L) + "$"; }
      var mean = 0; for (var i = 0; i < n; i++) mean += y[i]; mean /= n;
      var testo = T(L,
        "Quantile regression with no features: an intercept $b$ is fitted to the $n = " + n + "$ observations $y = (" + y.join("; ") + ")$ by minimizing $z(b) = \\sum_i [\\tau (y_i - b)^+ + (1 - \\tau)(b - y_i)^+]$, with $\\tau = " + m(tau, 2, L) + "$. What are the optimal intercept $\\tilde b$ and the optimal value $\\tilde z$?",
        "Regressione quantile senza caratteristiche: si stima un'intercetta $b$ per le $n = " + n + "$ osservazioni $y = (" + y.join("; ") + ")$ minimizzando $z(b) = \\sum_i [\\tau (y_i - b)^+ + (1 - \\tau)(b - y_i)^+]$, con $\\tau = " + m(tau, 2, L) + "$. Quanto valgono l'intercetta ottima $\\tilde b$ e il valore ottimo $\\tilde z$?");
      var sp = T(L,
        "Without features the LP returns the empirical $\\tau$-quantile: raising $b$ pays while the share of observations below it is at most $\\tau$. Since $\\tau n = " + m(tn, 2, L) + "$, $\\tilde b$ is the observation in position " + (j + 1) + " in increasing order, $" + b + "$, with $\\tilde z = " + m(perditaQ(y, b, tau), 2, L) + "$.",
        "Senza caratteristiche l'LP restituisce il quantile empirico di livello $\\tau$: alzare $b$ conviene finché la quota di osservazioni sotto di esso è al più $\\tau$. Poiché $\\tau n = " + m(tn, 2, L) + "$, $\\tilde b$ è l'osservazione in posizione " + (j + 1) + " in ordine crescente, $" + b + "$, con $\\tilde z = " + m(perditaQ(y, b, tau), 2, L) + "$.");
      var cand = [o(s[jm]), o(j + 1 < n ? s[j + 1] : s[j - 2]), o(j - 1 >= 0 ? s[j - 1] : s[j + 2]), o(mean)];
      return chiudi(rng, testo, o(b), cand, sp, { y: y, tau: tau });
    }
  });
  /* ===================== generatori aggiunti (6 novembre 2026): almeno 2 per capitolo con calcoli ===================== */

  /* Cap. 2 — intervallo di validità di b_1 */
  gen({
    id: "lpm-g-lp-intervallo-b", livello: "media", capitolo: "background",
    link: link("theory-lp/#sensitivity-analysis-in-lps", "teoria-lp/#lanalisi-di-sensitivita-negli-lp"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var A = I.A, b = I.b;
      // x(b1) = A^{-1}(b1, b2): x1 = 0 per b1 = a12 b2 / a22, x2 = 0 per b1 = a11 b2 / a21
      var r1 = A[0][1] * b[1] / A[1][1], r2 = A[0][0] * b[1] / A[1][0];
      var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      // errori tipici: intervallo di b2, matrice trasposta, un solo lato
      var t1 = A[1][0] * b[1] / A[1][1], t2 = A[0][0] * b[1] / A[0][1];
      var u1 = A[1][1] * b[0] / A[0][1], u2 = A[1][0] * b[0] / A[0][0];
      var vals = [lo, hi, t1, t2, u1, u2];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      if (hi - lo < 1) return null;
      function o(a, c) { return "$b_1 \\in [" + m(a, 2, L) + "; " + m(c, 2, L) + "]$"; }
      var testo = testoLP(I, L) + T(L,
        "At the optimum both constraints are active and $\\tilde x = (" + I.x[0] + ", " + I.x[1] + ")$, with $\\tilde x_1, \\tilde x_2 > 0$. Keeping $b_2 = " + b[1] + "$ fixed, for which values of $b_1$ does this basis stay optimal (the validity range of the shadow price $\\tilde\\pi_1$)?",
        "All'ottimo entrambi i vincoli sono attivi e $\\tilde x = (" + I.x[0] + ", " + I.x[1] + ")$, con $\\tilde x_1, \\tilde x_2 > 0$. Tenendo fisso $b_2 = " + b[1] + "$, per quali valori di $b_1$ questa base resta ottima (l'intervallo di validità del prezzo ombra $\\tilde\\pi_1$)?");
      var det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      det = det < 0 ? "(" + det + ")" : String(det);
      var sp = T(L,
        "With both constraints active, $x(b_1)$ solves $A x = (b_1, " + b[1] + ")$: $x_1 = (" + A[1][1] + "b_1 - " + A[0][1] * b[1] + ")/" + det + "$ and $x_2 = (" + A[0][0] * b[1] + " - " + A[1][0] + "b_1)/" + det + "$. The basis stays optimal (the duals do not change) as long as both are $\\ge 0$, that is for $b_1 \\in [" + m(lo, 2, L) + ", " + m(hi, 2, L) + "]$; Gurobi returns it as `SARHSLow`–`SARHSUp`.",
        "Con entrambi i vincoli attivi, $x(b_1)$ risolve $A x = (b_1, " + b[1] + ")$: $x_1 = (" + A[1][1] + "b_1 - " + A[0][1] * b[1] + ")/" + det + "$ e $x_2 = (" + A[0][0] * b[1] + " - " + A[1][0] + "b_1)/" + det + "$. La base resta ottima (i duali non cambiano) finché entrambe sono $\\ge 0$, cioè per $b_1 \\in [" + m(lo, 2, L) + ", " + m(hi, 2, L) + "]$; Gurobi lo restituisce come `SARHSLow`–`SARHSUp`.");
      return chiudi(rng, testo, o(lo, hi),
        [o(Math.min(t1, t2), Math.max(t1, t2)), o(Math.min(u1, u2), Math.max(u1, u2)), o(lo, b[0]), o(b[0], hi), o(0, hi)], sp,
        { c: I.c, A: A, b: b, x: I.x });
    }
  });

  /* Cap. 8 — budget con un tetto attivo */

  /* Cap. 9 — minimax nel piano (cerchio minimo) */
  function cerchio3(P) {
    function d(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
    var best = null;
    for (var i = 0; i < 3; i++) for (var j = i + 1; j < 3; j++) {
      var k = 3 - i - j, M = [(P[i][0] + P[j][0]) / 2, (P[i][1] + P[j][1]) / 2], r = d(P[i], P[j]) / 2;
      if (d(M, P[k]) <= r + 1e-9 && (best === null || r < best.r)) best = { c: M, r: r, tipo: "lato", dk: d(M, P[k]) - r };
    }
    var ax = P[0][0], ay = P[0][1], bx = P[1][0], by = P[1][1], cx = P[2][0], cy = P[2][1];
    var D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    var ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
    var uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
    var circ = { c: [ux, uy], r: d([ux, uy], P[0]), tipo: "circo" };
    return { opt: best || circ, circ: circ };
  }

  /* Cap. 10 — un veicolo, tre ore, rendimento eta < 1 */
  gen({
    id: "lpm-g-ev-tre-ore", livello: "media", capitolo: "ev-charging",
    link: link("ev-charging/#model", "ricarica-ev/#modello"),
    prova: function (rng, L) {
      var lista = [0.08, 0.1, 0.12, 0.15, 0.18, 0.2, 0.25, 0.3], pr = [];
      while (pr.length < 3) { var v = pk(rng, lista); if (pr.indexOf(v) < 0) pr.push(v); }
      var eta = pk(rng, [0.8, 0.9]), pb = ri(rng, 4, 12);
      var E = ri(rng, pb + 1, 3 * pb - 1);
      if (E % pb === 0) return null;
      var e = eta * E;
      if (Math.abs(10 * e - Math.round(10 * e)) > 1e-9) return null;
      var ord = [0, 1, 2].sort(function (i, j) { return pr[i] - pr[j]; });
      function riempi(en) {
        var z = 0, rest = en, marg = null;
        for (var t = 0; t < 3; t++) { var x = Math.min(pb, rest); z += x * pr[ord[t]]; rest -= x; if (x > 0) marg = pr[ord[t]]; }
        return { z: z, marg: marg };
      }
      var A = riempi(E), Bf = riempi(e);
      var dual = A.marg / eta;
      if (quasiMezzo(dual, 3) || quasiMezzo(Bf.z, 2)) return null;
      function o(z, p) { return T(L, "cost ", "costo ") + f(z, 2, L) + " €, " + T(L, "shadow price ", "prezzo ombra ") + f(p, 3, L) + " €/kWh"; }
      var testo = T(L,
        "EV charging LP, one vehicle plugged in for three one-hour slots: $x_t$ = energy drawn from the grid in hour $t$ (kWh), $0 \\le x_t \\le \\bar p = " + pb + "$; requirement $r\\,(x_1 + x_2 + x_3) \\ge e = " + m(e, 1, L) + "$ kWh, with efficiency $r = " + m(eta, 1, L) + "$; minimize $\\sum_t c_t x_t$ with $(c_1, c_2, c_3) = (" + m(pr[0], 2, L) + ", " + m(pr[1], 2, L) + ", " + m(pr[2], 2, L) + ")$ €/kWh. What are the minimum cost and the shadow price of the requirement (cost of one more kWh in the battery)?",
        "LP di ricarica EV, un veicolo collegato per tre fasce di un'ora: $x_t$ = energia prelevata dalla rete nell'ora $t$ (kWh), $0 \\le x_t \\le \\bar p = " + pb + "$; requisito $r\\,(x_1 + x_2 + x_3) \\ge e = " + m(e, 1, L) + "$ kWh, con rendimento $r = " + m(eta, 1, L) + "$; si minimizza $\\sum_t c_t x_t$ con $(c_1, c_2, c_3) = (" + m(pr[0], 2, L) + ", " + m(pr[1], 2, L) + ", " + m(pr[2], 2, L) + ")$ €/kWh. Quanto valgono il costo minimo e il prezzo ombra del requisito (costo di un kWh in più nella batteria)?");
      var sp = T(L,
        "The grid must supply $e/r = " + E + "$ kWh, bought in the cheapest hours at full power $\\bar p$: cost $" + m(A.z, 2, L) + "$ €. One more kWh in the battery needs $1/r$ kWh in the marginal hour (price $" + m(A.marg, 2, L) + "$): shadow price $" + m(A.marg, 2, L) + "/" + m(eta, 1, L) + " = " + m(dual, 3, L) + "$ €/kWh. Forgetting $r$ buys only $e$ kWh.",
        "La rete deve fornire $e/r = " + E + "$ kWh, comprati nelle ore più economiche alla potenza massima $\\bar p$: costo $" + m(A.z, 2, L) + "$ €. Un kWh in più nella batteria richiede $1/r$ kWh nell'ora marginale (prezzo $" + m(A.marg, 2, L) + "$): prezzo ombra $" + m(A.marg, 2, L) + "/" + m(eta, 1, L) + " = " + m(dual, 3, L) + "$ €/kWh. Dimenticare $r$ fa comprare solo $e$ kWh.");
      return chiudi(rng, testo, o(A.z, dual),
        [o(A.z, A.marg), o(Bf.z, Bf.marg), o(A.z, pr[ord[0]] / eta), o(A.z, A.marg * eta)], sp,
        { pr: pr, eta: eta, pbar: pb, e: e });
    }
  });

  /* Cap. 11 — il prezzo di una promessa di servizio */

  /* Cap. 16 — soft margin: slack e obiettivo di un classificatore dato */

  /* Cap. 15 — mercato incompleto: intervallo dei prezzi coerenti */
  gen({
    id: "lpm-g-arb-intervallo", livello: "complessa", capitolo: "arbitrage",
    link: link("arbitrage/#sensitivity-the-interval-of-consistent-prices", "arbitraggio/#sensitivita-lintervallo-dei-prezzi-coerenti"),
    prova: function (rng, L) {
      var R = pk(rng, [1, 1.05, 1.1]), a = [], cc = [];
      while (a.length < 3) { var v = ri(rng, 5, 40); if (a.indexOf(v) < 0) a.push(v); }
      for (var j = 0; j < 3; j++) cc.push(ri(rng, 0, 20));
      var amin = Math.min.apply(null, a), amax = Math.max.apply(null, a);
      var s0 = ri(rng, Math.ceil(amin / R) + 1, Math.floor(amax / R) - 1);
      if (!(s0 * R > amin && s0 * R < amax)) return null;
      function intervallo(t, disc) {
        // q >= 0, sum q = 1, sum q_j a_j = t; prezzo = sum q_j c_j / disc; vertici su coppie di stati
        var lo = Infinity, hi = -Infinity;
        for (var i = 0; i < 3; i++) {
          if (Math.abs(a[i] - t) < 1e-9) return null;
          for (var k = 0; k < 3; k++) {
            if (a[i] < t && t < a[k]) {
              var qk = (t - a[i]) / (a[k] - a[i]), pr = ((1 - qk) * cc[i] + qk * cc[k]) / disc;
              lo = Math.min(lo, pr); hi = Math.max(hi, pr);
            }
          }
        }
        return lo === Infinity ? null : [lo, hi];
      }
      var I = intervallo(s0 * R, R); if (!I) return null;
      if (I[1] - I[0] < 0.2) return null;
      var Ib = intervallo(s0, R);
      var cmin = Math.min.apply(null, cc), cmax = Math.max.apply(null, cc);
      var vals = [I[0], I[1], I[0] * R, I[1] * R, cmin / R, cmax / R, I[0] / R, I[1] / R];
      if (Ib) vals.push(Ib[0], Ib[1]);
      for (var t = 0; t < vals.length; t++) if (quasiMezzo(vals[t], 2)) return null;
      function o(x, y) { return "$[" + m(x, 2, L) + "; " + m(y, 2, L) + "]$"; }
      var cand = [o(I[0] * R, I[1] * R), o(cmin / R, cmax / R)];
      if (Ib && Ib[1] - Ib[0] > 0.01) cand.push(o(Ib[0], Ib[1]));
      cand.push(o(I[0] / R, I[1] / R));
      var testo = T(L,
        "One-period market with three states: a risk-free security costs $1$ and pays $R = " + m(R, 2, L) + "$ in every state; a risky security costs $s^0_1 = " + s0 + "$ and pays $(a_1; a_2; a_3) = (" + a.join("; ") + ")$ in the three states. A new security pays $(c_1; c_2; c_3) = (" + cc.join("; ") + ")$. Its price is consistent (creates no arbitrage) if it equals $\\frac1R\\sum_j q_j\\, c_j$ for risk-neutral probabilities $q_j \\ge 0$, $\\sum_j q_j = 1$, that also price the two existing securities. What is the interval of consistent prices (its endpoints)?",
        "Mercato a un periodo con tre stati: un titolo privo di rischio costa $1$ e paga $R = " + m(R, 2, L) + "$ in ogni stato; un titolo rischioso costa $s^0_1 = " + s0 + "$ e paga $(a_1; a_2; a_3) = (" + a.join("; ") + ")$ nei tre stati. Un nuovo titolo paga $(c_1; c_2; c_3) = (" + cc.join("; ") + ")$. Il suo prezzo è coerente (non crea arbitraggi) se vale $\\frac1R\\sum_j q_j\\, c_j$ per probabilità neutrali al rischio $q_j \\ge 0$, $\\sum_j q_j = 1$, che prezzano anche i due titoli esistenti. Qual è l'intervallo dei prezzi coerenti (i suoi estremi)?");
      var sp = T(L,
        "The consistent measures satisfy $\\sum_j q_j = 1$ and $\\sum_j q_j a_j = R\\,s^0_1 = " + m(s0 * R, 2, L) + "$: a segment whose endpoints put mass on two states only, one with payoff below and one above $" + m(s0 * R, 2, L) + "$. Minimizing and maximizing $\\frac1R\\sum_j q_jc_j$ (two LPs) over it gives $[" + m(I[0], 2, L) + ", " + m(I[1], 2, L) + "]$. Forgetting the factor $R$ (in the constraint or in the discount) shifts the interval.",
        "Le misure coerenti soddisfano $\\sum_j q_j = 1$ e $\\sum_j q_j a_j = R\\,s^0_1 = " + m(s0 * R, 2, L) + "$: un segmento i cui estremi mettono massa su due soli stati, uno con pagamento sotto e uno sopra $" + m(s0 * R, 2, L) + "$. Minimizzando e massimizzando $\\frac1R\\sum_j q_jc_j$ (due LP) su di esso si ottiene $[" + m(I[0], 2, L) + ", " + m(I[1], 2, L) + "]$. Dimenticare il fattore $R$ (nel vincolo o nello sconto) sposta l'intervallo.");
      return chiudi(rng, testo, o(I[0], I[1]), cand, sp, { R: R, s0: s0, a: a, c: cc });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): copertura dettagliata, parte «Strumenti» ===================== */

  gen({
    id: "lpm-g-lp-dualita-debole", livello: "facile", capitolo: "background",
    link: link("theory-lp/#linear-programming-and-duality", "teoria-lp/#programmazione-lineare-e-dualita"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var k1 = ri(rng, 1, 4), k2 = ri(rng, 1, 4), e1 = ri(rng, 1, 3), e2 = ri(rng, 0, 3);
      function u1(a) { return a === 1 ? "" : String(a); }
      var xb = [I.x[0] - k1, I.x[1] - k2], pb = [I.pi[0] + e1, I.pi[1] + e2];
      var lo = I.c[0] * xb[0] + I.c[1] * xb[1], up = I.b[0] * pb[0] + I.b[1] * pb[1], g = up - lo;
      function o(a, c) { return "$\\tilde z \\in [" + a + "; " + c + "]$"; }
      var testo = testoLP(I, L) + T(L,
        "The point $\\bar x = (" + xb[0] + ", " + xb[1] + ")$ is feasible for the primal and $\\bar\\pi = (" + pb[0] + ", " + pb[1] + ")$ is feasible for the dual $\\min\\ " + I.b[0] + "\\pi_1 + " + I.b[1] + "\\pi_2$ (dual constraints $" + u1(I.A[0][0]) + "\\pi_1 + " + u1(I.A[1][0]) + "\\pi_2 \\ge " + I.c[0] + "$, $" + u1(I.A[0][1]) + "\\pi_1 + " + u1(I.A[1][1]) + "\\pi_2 \\ge " + I.c[1] + "$). By weak duality, which interval certainly contains the optimal value $\\tilde z$ of the primal?",
        "Il punto $\\bar x = (" + xb[0] + ", " + xb[1] + ")$ è ammissibile per il primale e $\\bar\\pi = (" + pb[0] + ", " + pb[1] + ")$ è ammissibile per il duale $\\min\\ " + I.b[0] + "\\pi_1 + " + I.b[1] + "\\pi_2$ (vincoli duali $" + u1(I.A[0][0]) + "\\pi_1 + " + u1(I.A[1][0]) + "\\pi_2 \\ge " + I.c[0] + "$, $" + u1(I.A[0][1]) + "\\pi_1 + " + u1(I.A[1][1]) + "\\pi_2 \\ge " + I.c[1] + "$). Per la dualità debole, quale intervallo contiene certamente il valore ottimo $\\tilde z$ del primale?");
      var sp = T(L,
        "Every feasible primal point gives a lower bound for a maximum, $" + I.c[0] + "\\cdot " + xb[0] + " + " + I.c[1] + "\\cdot " + xb[1] + " = " + lo + "$, and every feasible dual point an upper bound, $" + I.b[0] + "\\cdot " + pb[0] + " + " + I.b[1] + "\\cdot " + pb[1] + " = " + up + "$. So $" + lo + " \\le \\tilde z \\le " + up + "$ (here $\\tilde z = " + (I.c[0] * I.x[0] + I.c[1] * I.x[1]) + "$). Swapping the roles of the two bounds is the typical mistake.",
        "Ogni punto primale ammissibile dà un limite inferiore per un massimo, $" + I.c[0] + "\\cdot " + xb[0] + " + " + I.c[1] + "\\cdot " + xb[1] + " = " + lo + "$, e ogni punto duale ammissibile un limite superiore, $" + I.b[0] + "\\cdot " + pb[0] + " + " + I.b[1] + "\\cdot " + pb[1] + " = " + up + "$. Quindi $" + lo + " \\le \\tilde z \\le " + up + "$ (qui $\\tilde z = " + (I.c[0] * I.x[0] + I.c[1] * I.x[1]) + "$). Scambiare i ruoli dei due limiti è l'errore tipico.");
      return chiudi(rng, testo, o(lo, up), [o(up, up + g), o(lo - g, lo), o(lo, lo + Math.round(g / 2))], sp,
        { c: I.c, A: I.A, b: I.b, xb: xb, pb: pb });
    }
  });

  gen({
    id: "lpm-g-lp-perturbazione", livello: "facile", capitolo: "background",
    link: link("theory-lp/#sensitivity-analysis-in-lps", "teoria-lp/#lanalisi-di-sensitivita-negli-lp"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var A = I.A, b = I.b, p = I.pi;
      var r1 = A[0][1] * b[1] / A[1][1], r2 = A[0][0] * b[1] / A[1][0];
      var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      if (quasiMezzo(lo, 2) || quasiMezzo(hi, 2)) return null;
      var d = ri(rng, -12, 12); if (d === 0) return null;
      var nb = b[0] + d; if (nb <= lo + 0.5 || nb >= hi - 0.5) return null;
      var z = I.c[0] * I.x[0] + I.c[1] * I.x[1], nz = z + p[0] * d;
      function o(v) { return "$\\tilde z = " + m(v, 2, L) + "$"; }
      var testo = testoLP(I, L) + T(L,
        "At the optimum $\\tilde z = " + z + "$, the shadow price of constraint 1 is $\\tilde\\pi_1 = " + p[0] + "$ (and $\\tilde\\pi_2 = " + p[1] + "$), and the validity range of $b_1$ (where $\\tilde\\pi_1$ stays exact) is $[" + m(lo, 2, L) + "; " + m(hi, 2, L) + "]$. What is the new optimal value if $b_1$ changes from $" + b[0] + "$ to $" + nb + "$, all else equal?",
        "All'ottimo $\\tilde z = " + z + "$, il prezzo ombra del vincolo 1 è $\\tilde\\pi_1 = " + p[0] + "$ (e $\\tilde\\pi_2 = " + p[1] + "$), e l'intervallo di validità di $b_1$ (dove $\\tilde\\pi_1$ resta esatto) è $[" + m(lo, 2, L) + "; " + m(hi, 2, L) + "]$. Quanto vale il nuovo valore ottimo se $b_1$ passa da $" + b[0] + "$ a $" + nb + "$, a parità del resto?");
      var sp = T(L,
        "The new value $" + nb + "$ is inside the validity range, so the shadow price is exact: $\\tilde z + \\tilde\\pi_1\\,\\Delta b_1 = " + z + " + " + p[0] + "\\cdot(" + d + ") = " + nz + "$.",
        "Il nuovo valore $" + nb + "$ è dentro l'intervallo di validità, quindi il prezzo ombra è esatto: $\\tilde z + \\tilde\\pi_1\\,\\Delta b_1 = " + z + " + " + p[0] + "\\cdot(" + d + ") = " + nz + "$.");
      return chiudi(rng, testo, o(nz), [o(z - p[0] * d), o(z + p[0] * (d > 0 ? 1 : -1)), o(z + p[1] * d), o(z * nb / b[0])], sp,
        { c: I.c, A: A, b: b, nb: nb });
    }
  });


  gen({
    id: "lpm-g-sv-dimensioni", livello: "facile", capitolo: "solver",
    link: link("solver-lp/#the-log-explained", "solver-lp/#il-log-spiegato"),
    prova: function (rng, L) {
      var n = ri(rng, 2, 6), mm = ri(rng, 3, 12);
      var R = n * mm + mm, Cn = 2 * n * mm;
      function o(r, c) { return T(L, "$" + r + "$ rows, $" + c + "$ columns", "$" + r + "$ righe, $" + c + "$ colonne"); }
      var testo = T(L,
        "A gurobipy production-inventory LP has $n = " + n + "$ products and $m = " + mm + "$ months: variables $x_{it} \\ge 0$ (units produced) and $s_{it} \\ge 0$ (inventory at the end of the month) for every product $i$ and month $t$; one balance constraint $s_{i,t-1} + x_{it} = d_{it} + s_{it}$ per product and month (initial inventory $s_{i0}$ is a datum); one machine-hours constraint $\\sum_i a_ix_{it} \\le b_t$ per month. What does the line `Optimize a model with ... rows, ... columns` of the Gurobi log report?",
        "Un LP gurobipy di produzione e scorte ha $n = " + n + "$ prodotti e $m = " + mm + "$ mesi: variabili $x_{it} \\ge 0$ (unità prodotte) e $s_{it} \\ge 0$ (scorta a fine mese) per ogni prodotto $i$ e mese $t$; un vincolo di bilancio $s_{i,t-1} + x_{it} = d_{it} + s_{it}$ per prodotto e mese (la scorta iniziale $s_{i0}$ è un dato); un vincolo di ore macchina $\\sum_i a_ix_{it} \\le b_t$ per mese. Che cosa riporta la riga `Optimize a model with ... rows, ... columns` del log di Gurobi?");
      var sp = T(L,
        "Rows are constraints: $nm = " + n * mm + "$ balances plus $m = " + mm + "$ capacities, $" + R + "$ in all; columns are variables: $2nm = " + Cn + "$. Checking these sizes is the first reading of the log.",
        "Le righe sono i vincoli: $nm = " + n * mm + "$ bilanci più $m = " + mm + "$ capacità, $" + R + "$ in tutto; le colonne sono le variabili: $2nm = " + Cn + "$. Controllare queste dimensioni è la prima lettura del log.");
      return chiudi(rng, testo, o(R, Cn), [o(Cn, R), o(n * mm, Cn), o(R, n * mm), o(n * mm + n, Cn)], sp,
        { n: n, m: mm });
    }
  });

  gen({
    id: "lpm-g-lp-tutti-casi", livello: "complessa", capitolo: "background",
    link: link("theory-lp/#the-optimality-conditions-of-lp-complementary-slackness",
               "teoria-lp/#le-condizioni-di-ottimalita-delllp-gli-scarti-complementari"),
    prova: function (rng, L) {
      var x1 = ri(rng, 10, 60), x2 = ri(rng, 5, 40), sl = ri(rng, 5, 30);
      var a31 = ri(rng, 1, 3), a32 = -ri(rng, 1, 3);
      var p2 = ri(rng, 1, 9), p3 = -ri(rng, 1, 5), del = ri(rng, 1, 5);
      var c1 = p2 + a31 * p3, c2 = p2 + a32 * p3, c3 = -p2 - del;
      var b1 = x1 + x2 - sl, b2 = x1 + x2, b3 = a31 * x1 + a32 * x2;
      var w2 = p2 + del, w3 = (c1 - w2) / a31;
      function u1(a) { return a === 1 ? "" : String(a); }
      // errore: sistema scritto con le righe dei vincoli (1, 1) e (a31, a32) invece che con le colonne
      var rr2 = (c1 * a32 - c2) / (a32 - a31), rr3 = (c2 - a31 * c1) / (a32 - a31);
      if (quasiMezzo(rr2, 2) || quasiMezzo(rr3, 2)) return null;
      if (quasiMezzo(w3, 2) || w3 === p3 || c1 === 0 || c2 === 0) return null;
      function o(u, v, w) { return "$(\\tilde\\pi_1; \\tilde\\pi_2; \\tilde\\pi_3) = (" + m(u, 2, L) + "; " + m(v, 2, L) + "; " + m(w, 2, L) + ")$"; }
      function t(c, s) { return (c < 0 ? " - " : " + ") + (Math.abs(c) === 1 ? "" : Math.abs(c)) + s; }
      function f1(c, s) { return (c < 0 ? "-" : "") + (Math.abs(c) === 1 ? "" : Math.abs(c)) + s; }
      var lp = "$\\min\\ " + f1(c1, "x_1") + t(c2, "x_2") + t(c3, "x_3") + "$, " + T(L, "subject to ", "soggetto a ") +
        "(1) $x_1 + x_2 \\ge " + b1 + "$, (2) $x_1 + x_2 - x_3 = " + b2 + "$, (3) $" + f1(a31, "x_1") + t(a32, "x_2") + " \\le " + b3 + "$, " +
        "$x_1 \\ge 0$, $x_2$ " + T(L, "free", "libera") + ", $x_3 \\le 0$";
      var testo = T(L,
        "Consider the LP " + lp + ". Its optimal solution is $\\tilde x = (" + x1 + ", " + x2 + ", 0)$. Let $\\tilde\\pi_i = \\partial\\tilde z/\\partial b_i$ be the dual value of constraint $i$ (in a minimum: $\\pi_i \\ge 0$ for $\\ge$, free for $=$, $\\le 0$ for $\\le$). Using complementary slackness, what are the optimal dual values?",
        "Si consideri l'LP " + lp + ". La sua soluzione ottima è $\\tilde x = (" + x1 + ", " + x2 + ", 0)$. Sia $\\tilde\\pi_i = \\partial\\tilde z/\\partial b_i$ il valore duale del vincolo $i$ (in un minimo: $\\pi_i \\ge 0$ per $\\ge$, libera per $=$, $\\le 0$ per $\\le$). Con gli scarti complementari, quali sono i valori duali ottimi?");
      var sp = T(L,
        "Constraint (1) is slack ($" + (x1 + x2) + " > " + b1 + "$), so $\\tilde\\pi_1 = 0$. $x_1 > 0$ and $x_2 \\ne 0$ make their dual constraints active (columns of the primal): $\\pi_2 + " + u1(a31) + "\\pi_3 = " + c1 + "$ and $\\pi_2 - " + u1(-a32) + "\\pi_3 = " + c2 + "$, so $\\tilde\\pi_2 = " + p2 + "$, $\\tilde\\pi_3 = " + p3 + " \\le 0$ as required. The dual constraint of $x_3$ need not be active: $x_3$ sits at its bound $0$ with reduced cost $" + c3 + " + " + p2 + " = " + (c3 + p2) + "$. Check: $\\sum_i b_i\\tilde\\pi_i = " + (b2 * p2 + b3 * p3) + " = \\tilde z$.",
        "Il vincolo (1) è lasco ($" + (x1 + x2) + " > " + b1 + "$), quindi $\\tilde\\pi_1 = 0$. $x_1 > 0$ e $x_2 \\ne 0$ rendono attivi i loro vincoli duali (colonne del primale): $\\pi_2 + " + u1(a31) + "\\pi_3 = " + c1 + "$ e $\\pi_2 - " + u1(-a32) + "\\pi_3 = " + c2 + "$, da cui $\\tilde\\pi_2 = " + p2 + "$, $\\tilde\\pi_3 = " + p3 + " \\le 0$ come richiesto. Il vincolo duale di $x_3$ non deve essere attivo: $x_3$ sta al suo limite $0$ con costo ridotto $" + c3 + " + " + p2 + " = " + (c3 + p2) + "$. Verifica: $\\sum_i b_i\\tilde\\pi_i = " + (b2 * p2 + b3 * p3) + " = \\tilde z$.");
      return chiudi(rng, testo, o(0, p2, p3), [o(0, rr2, rr3), o(0, w2, w3), o(0, p3, p2), o(0, p2, -p3), o(p2, 0, p3)], sp,
        { c: [c1, c2, c3], b: [b1, b2, b3], a3: [a31, a32], x: [x1, x2, 0] });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): parte «Ottimizzazione e machine learning» ===================== */

  var SVM_E = "SVM for binary classification: observations $\\mathbf x_i$ with labels $y_i \\in \\{-1, +1\\}$, hyperplane $\\mathbf w'\\mathbf x + b = 0$. ";
  var SVM_I = "SVM per la classificazione binaria: osservazioni $\\mathbf x_i$ con etichette $y_i \\in \\{-1, +1\\}$, iperpiano $\\mathbf w'\\mathbf x + b = 0$. ";
  function vec(v, L) { return "(" + v.map(function (u) { return m(u, 3, L); }).join("; ") + ")"; }







  gen({
    id: "lpm-g-reg-duale-interpolato", livello: "media", capitolo: "regression",
    link: link("regression/#the-dual-reading-the-support-points", "regressione/#la-lettura-duale-i-punti-di-appoggio"),
    prova: function (rng, L) {
      var n = pk(rng, [5, 7, 9]), k = ri(rng, 2, n - 1);
      var y = [];
      for (var i = 0; i < n; i++) y.push(ri(rng, 80, 160));
      var s = sortNum(y);
      for (var j = 1; j < n; j++) if (s[j] === s[j - 1]) return null;
      var num = 2 * k - 1, den = 2 * n, tau = num / den;
      var pi = (k - 1) - tau * (n - 1);
      if (quasiMezzo(pi, 3) || quasiMezzo(1 - tau, 3)) return null;
      function o(bb, p) { return "$\\tilde b = " + bb + "$, $\\tilde\\pi = " + m(p, 3, L) + "$"; }
      var testo = T(L,
        "Quantile regression LP with no features: $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ subject to $b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$, $b$ free; $\\tilde\\pi_i$ is the optimal dual of the constraint of observation $i$ (it equals $\\tau$ for observations above $\\tilde b$, $-(1 - \\tau)$ for those below, and $\\sum_i\\tilde\\pi_i = 0$). Data: $y = (" + y.join("; ") + ")$, $\\tau = " + num + "/" + den + "$. What are $\\tilde b$ and the dual $\\tilde\\pi$ of the interpolated observation ($y_i = \\tilde b$)?",
        "LP di regressione quantile senza caratteristiche: $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ soggetto a $b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$, $b$ libera; $\\tilde\\pi_i$ è il duale ottimo del vincolo dell'osservazione $i$ (vale $\\tau$ per le osservazioni sopra $\\tilde b$, $-(1 - \\tau)$ per quelle sotto, e $\\sum_i\\tilde\\pi_i = 0$). Dati: $y = (" + y.join("; ") + ")$, $\\tau = " + num + "/" + den + "$. Quanto valgono $\\tilde b$ e il duale $\\tilde\\pi$ dell'osservazione interpolata ($y_i = \\tilde b$)?");
      var sp = T(L,
        "$\\tilde b$ is the empirical $\\tau$-quantile: with $(k - 1)/n < \\tau < k/n$ for $k = " + k + "$ it is the " + k + "th smallest value, $" + s[k - 1] + "$, with $" + (k - 1) + "$ observations below and $" + (n - k) + "$ above. From $\\sum_i\\tilde\\pi_i = 0$: $\\tilde\\pi = (1 - \\tau)\\cdot " + (k - 1) + " - \\tau\\cdot " + (n - k) + " = " + m(pi, 3, L) + "$, inside $[-(1 - \\tau), \\tau]$.",
        "$\\tilde b$ è il quantile empirico di livello $\\tau$: con $(k - 1)/n < \\tau < k/n$ per $k = " + k + "$ è il " + k + "º valore più piccolo, $" + s[k - 1] + "$, con $" + (k - 1) + "$ osservazioni sotto e $" + (n - k) + "$ sopra. Da $\\sum_i\\tilde\\pi_i = 0$: $\\tilde\\pi = (1 - \\tau)\\cdot " + (k - 1) + " - \\tau\\cdot " + (n - k) + " = " + m(pi, 3, L) + "$, dentro $[-(1 - \\tau), \\tau]$.");
      return chiudi(rng, testo, o(s[k - 1], pi), [o(s[k - 1], -pi), o(s[k], pi), o(s[k - 2], tau), o(s[k - 1], tau), o(s[k - 1], -(1 - tau))], sp,
        { y: y, tau: tau, b: s[k - 1] });
    }
  });

  gen({
    id: "lpm-g-reg-lad-3punti", livello: "complessa", capitolo: "regression",
    link: link("regression/#the-dual-reading-the-support-points", "regressione/#la-lettura-duale-i-punti-di-appoggio"),
    prova: function (rng, L) {
      var xs = sortNum([ri(rng, 0, 9), ri(rng, 0, 9), ri(rng, 0, 9)]);
      if (xs[0] === xs[1] || xs[1] === xs[2]) return null;
      var ys = [ri(rng, 10, 60), ri(rng, 10, 60), ri(rng, 10, 60)];
      var tau = pk(rng, [0.25, 0.5, 0.75]);
      var cand = [];
      [[0, 1, 2], [0, 2, 1], [1, 2, 0]].forEach(function (t) {
        var i = t[0], j = t[1], h = t[2];
        var a = (ys[j] - ys[i]) / (xs[j] - xs[i]), c = ys[i] - a * xs[i], r = ys[h] - (a * xs[h] + c);
        cand.push({ a: a, c: c, z: r > 0 ? tau * r : -(1 - tau) * r });
      });
      var ord = cand.slice().sort(function (u, v) { return u.z - v.z; });
      if (ord[1].z - ord[0].z < 0.5) return null;
      for (var q = 0; q < 3; q++) if (quasiMezzo(cand[q].a, 2) || quasiMezzo(cand[q].c, 2) || quasiMezzo(cand[q].z, 2)) return null;
      var best = ord[0];
      function o(u) { return T(L, "slope $", "pendenza $") + m(u.a, 2, L) + T(L, "$, intercept $", "$, intercetta $") + m(u.c, 2, L) + T(L, "$, value $", "$, valore $") + m(u.z, 2, L) + "$"; }
      // errore: costi dei due lati scambiati
      var sw = [[0, 1, 2], [0, 2, 1], [1, 2, 0]].map(function (t) {
        var i = t[0], j = t[1], h = t[2];
        var a = (ys[j] - ys[i]) / (xs[j] - xs[i]), c = ys[i] - a * xs[i], r = ys[h] - (a * xs[h] + c);
        return { a: a, c: c, z: r > 0 ? (1 - tau) * r : -tau * r };
      }).sort(function (u, v) { return u.z - v.z; })[0];
      var pts = xs.map(function (x, i) { return "(" + x + "; " + ys[i] + ")"; }).join(", ");
      var testo = T(L,
        "Quantile regression LP with one feature ($p = 1$): $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ subject to $wx_i + b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$ ($u_i$: observation above the line, $v_i$: below), $w, b$ free, with $\\tau = " + m(tau, 2, L) + "$ and three observations $(x_i; y_i)$: " + pts + ". An optimal line interpolates $p + 1 = 2$ observations. What are the optimal slope $\\tilde w$, intercept $\\tilde b$ and optimal value?",
        "LP di regressione quantile con una caratteristica ($p = 1$): $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ soggetto a $wx_i + b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$ ($u_i$: osservazione sopra la retta, $v_i$: sotto), $w, b$ liberi, con $\\tau = " + m(tau, 2, L) + "$ e tre osservazioni $(x_i; y_i)$: " + pts + ". Una retta ottima interpola $p + 1 = 2$ osservazioni. Quanto valgono la pendenza ottima $\\tilde w$, l'intercetta $\\tilde b$ e il valore ottimo?");
      var sp = T(L,
        "Three candidate lines, one per pair of points; each leaves one residual $r$ on the third point, which costs $\\tau r$ if the point is above ($r > 0$) and $(1 - \\tau)|r|$ if below. Values: $" + cand.map(function (u) { return m(u.z, 2, L); }).join("$, $") + "$. The cheapest is the line with slope $" + m(best.a, 2, L) + "$ and intercept $" + m(best.c, 2, L) + "$.",
        "Tre rette candidate, una per coppia di punti; ciascuna lascia un residuo $r$ sul terzo punto, che costa $\\tau r$ se il punto sta sopra ($r > 0$) e $(1 - \\tau)|r|$ se sta sotto. Valori: $" + cand.map(function (u) { return m(u.z, 2, L); }).join("$, $") + "$. La più economica è la retta con pendenza $" + m(best.a, 2, L) + "$ e intercetta $" + m(best.c, 2, L) + "$.");
      return chiudi(rng, testo, o(best), [o(ord[1]), o(ord[2]), o(sw), o({ a: best.a, c: best.c, z: 2 * best.z })], sp,
        { xs: xs, ys: ys, tau: tau });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): parte «Decisioni sotto incertezza» ===================== */

  gen({
    id: "lpm-g-nv-normale", livello: "facile", capitolo: "newsvendor",
    link: link("newsvendor/#case-study", "newsvendor/#caso-di-studio"),
    prova: function (rng, L) {
      var tab = [[0.6, 0.253], [0.7, 0.524], [0.75, 0.674], [0.8, 0.842], [0.9, 1.282]];
      var k = ri(rng, 0, 4), al = tab[k][0], z = tab[k][1];
      var co = pk(rng, [2, 4, 6]), cu = Math.round(co * al / (1 - al) * 1000) / 1000;
      if (Math.abs(cu - Math.round(cu)) > 1e-9) return null;
      var v = ri(rng, 1, 5), c = v + co, p = c + cu;
      var mu = 10 * ri(rng, 8, 20), sg = 5 * ri(rng, 2, 8);
      var qs = mu + z * sg, qm = mu - z * sg, k2 = k < 4 ? k + 1 : k - 1, qw = mu + tab[k2][1] * sg;
      if (quasiMezzo(qs, 1) || quasiMezzo(qm, 1) || quasiMezzo(qw, 1)) return null;
      function o(x) { return "$\\tilde q = " + m(x, 1, L) + "$"; }
      var zt = tab.map(function (t) { return "$\\Phi^{-1}(" + m(t[0], 2, L) + ") = " + m(t[1], 3, L) + "$"; }).join(", ");
      var testo = T(L,
        "Newsvendor: a product is bought at $c = " + c + "$ €, sold at $p = " + p + "$ € and each unsold unit is recovered at $v = " + v + "$ €; demand is normal with mean $" + mu + "$ and standard deviation $" + sg + "$. The optimal order satisfies $F(\\tilde q) = c_u/(c_u + c_o)$ with $c_u = p - c$ and $c_o = c - v$, so $\\tilde q = \\mu + z\\sigma$ with $z = \\Phi^{-1}(c_u/(c_u + c_o))$ (standard normal quantiles: " + zt + "). What is $\\tilde q$?",
        "Newsvendor: un prodotto si compra a $c = " + c + "$ €, si vende a $p = " + p + "$ € e ogni unità invenduta si recupera a $v = " + v + "$ €; la domanda è normale con media $" + mu + "$ e deviazione standard $" + sg + "$. L'ordine ottimo soddisfa $F(\\tilde q) = c_u/(c_u + c_o)$ con $c_u = p - c$ e $c_o = c - v$, quindi $\\tilde q = \\mu + z\\sigma$ con $z = \\Phi^{-1}(c_u/(c_u + c_o))$ (quantili della normale standard: " + zt + "). Quanto vale $\\tilde q$?");
      var sp = T(L,
        "$c_u = " + cu + "$, $c_o = " + co + "$, critical ratio $" + cu + "/" + (cu + co) + " = " + m(al, 2, L) + "$, $z = " + m(z, 3, L) + "$: $\\tilde q = " + mu + " + " + m(z, 3, L) + "\\cdot " + sg + " = " + m(qs, 1, L) + "$, above the mean because shortages cost more than leftovers. Swapping $c_u$ and $c_o$ gives $\\mu - z\\sigma$.",
        "$c_u = " + cu + "$, $c_o = " + co + "$, rapporto critico $" + cu + "/" + (cu + co) + " = " + m(al, 2, L) + "$, $z = " + m(z, 3, L) + "$: $\\tilde q = " + mu + " + " + m(z, 3, L) + "\\cdot " + sg + " = " + m(qs, 1, L) + "$, sopra la media perché la carenza costa più dell'invenduto. Scambiare $c_u$ e $c_o$ dà $\\mu - z\\sigma$.");
      return chiudi(rng, testo, o(qs), [o(qm), o(qw), o(mu), o(mu + sg)], sp,
        { p: p, c: c, v: v, mu: mu, sigma: sg });
    }
  });

  gen({
    id: "lpm-g-cvar-eccessi", livello: "facile", capitolo: "var-cvar",
    link: link("var-cvar/#the-rockafellaruryasev-linear-formulation", "var-cvar/#la-formulazione-lineare-di-rockafellaruryasev"),
    prova: function (rng, L) {
      var l = [ri(rng, 1, 30), ri(rng, 1, 30), ri(rng, 1, 30), ri(rng, 1, 30), ri(rng, 1, 30)];
      var al = pk(rng, [0.6, 0.8]), eta = ri(rng, 5, 25);
      var xi = l.map(function (u) { return pos(u - eta); }), sx = xi.reduce(function (a, b) { return a + b; }, 0);
      var neg = l.reduce(function (a, b) { return a + b - eta; }, 0);
      if (sx === 0 || sx === neg) return null;
      var F = eta + 0.2 * sx / (1 - al), F1 = eta + 0.2 * sx, F2 = eta + 0.2 * sx / al, F3 = eta + 0.2 * neg / (1 - al);
      function o(s, f) { return "$\\sum_s\\xi_s = " + m(s, 2, L) + "$, " + T(L, "value", "valore") + " $" + m(f, 2, L) + "$"; }
      var testo = T(L,
        "Rockafellar–Uryasev formulation of the CVaR: for a threshold $\\eta$, the excesses are $\\xi_s = (\\ell_s - \\eta)^+$ and the function to minimize over $\\eta$ is $F(\\eta) = \\eta + \\frac{1}{1-\\alpha}\\sum_s w_s\\xi_s$. Five equiprobable scenarios ($w_s = 0{.}2$) with losses $\\ell = (" + l.join("; ") + ")$, $\\alpha = " + m(al, 1, L) + "$. For $\\eta = " + eta + "$ (not necessarily optimal), what are $\\sum_s\\xi_s$ and $F(\\eta)$?",
        "Formulazione di Rockafellar–Uryasev del CVaR: per una soglia $\\eta$ gli eccessi sono $\\xi_s = (\\ell_s - \\eta)^+$ e la funzione da minimizzare in $\\eta$ è $F(\\eta) = \\eta + \\frac{1}{1-\\alpha}\\sum_s w_s\\xi_s$. Cinque scenari equiprobabili ($w_s = 0{,}2$) con perdite $\\ell = (" + l.join("; ") + ")$, $\\alpha = " + m(al, 1, L) + "$. Per $\\eta = " + eta + "$ (non necessariamente ottimo), quanto valgono $\\sum_s\\xi_s$ e $F(\\eta)$?");
      testo = testo.replace("0{.}2", "0.2");
      var sp = T(L,
        "Only the losses above $" + eta + "$ count: $\\xi = (" + xi.join("; ") + ")$, sum $" + sx + "$. Then $F(" + eta + ") = " + eta + " + \\frac{1}{" + m(1 - al, 1, L) + "}\\cdot 0.2\\cdot " + sx + " = " + m(F, 2, L) + "$. Negative differences are cut at zero; forgetting the factor $1/(1-\\alpha)$ is the other typical mistake.",
        "Contano solo le perdite sopra $" + eta + "$: $\\xi = (" + xi.join("; ") + ")$, somma $" + sx + "$. Allora $F(" + eta + ") = " + eta + " + \\frac{1}{" + m(1 - al, 1, L) + "}\\cdot 0{,}2\\cdot " + sx + " = " + m(F, 2, L) + "$. Le differenze negative si tagliano a zero; dimenticare il fattore $1/(1-\\alpha)$ è l'altro errore tipico.");
      return chiudi(rng, testo, o(sx, F), [o(sx, F1), o(neg, F3), o(sx, F2)], sp,
        { l: l, alpha: al, eta: eta });
    }
  });

  gen({
    id: "lpm-g-arb-portafoglio", livello: "facile", capitolo: "arbitrage",
    link: link("arbitrage/#the-model", "arbitraggio/#il-modello"),
    prova: function (rng, L) {
      var R = pk(rng, [1.02, 1.04, 1.05]);
      var s1 = [ri(rng, 5, 20), ri(rng, 5, 20), ri(rng, 5, 20)], s2 = [ri(rng, 10, 40), ri(rng, 10, 40), ri(rng, 10, 40)];
      var p1 = ri(rng, 5, 20), p2 = ri(rng, 10, 40);
      var x1 = pk(rng, [-1, 1, 2]), x2 = pk(rng, [-1, 1, 2]), x0 = -ri(rng, 5, 40);
      var costo = x0 + x1 * p1 + x2 * p2;
      var pay = [0, 1, 2].map(function (j) { return x0 * R + x1 * s1[j] + x2 * s2[j]; });
      var mn = Math.min.apply(null, pay), mx = Math.max.apply(null, pay);
      var payNoR = [0, 1, 2].map(function (j) { return x0 + x1 * s1[j] + x2 * s2[j]; });
      var mnNoR = Math.min.apply(null, payNoR);
      if (Math.abs(mn - mnNoR) < 0.5 || mn === mx) return null;
      function o(c, w) { return T(L, "cost $", "costo $") + m(c, 2, L) + T(L, "$, smallest payoff $", "$, pagamento minimo $") + m(w, 2, L) + "$"; }
      var testo = T(L,
        "One-period market with three states: security 0 is risk-free (costs 1 today, pays $R = " + m(R, 2, L) + "$ in every state); security 1 costs $" + p1 + "$ and pays $(" + s1.join("; ") + ")$; security 2 costs $" + p2 + "$ and pays $(" + s2.join("; ") + ")$. The portfolio $x = (" + x0 + "; " + x1 + "; " + x2 + ")$ holds $x_i$ units of security $i$ (negative = short). What are its cost today, $\\sum_is^0_ix_i$, and its smallest payoff tomorrow over the three states?",
        "Mercato a un periodo con tre stati: il titolo 0 è privo di rischio (costa 1 oggi, paga $R = " + m(R, 2, L) + "$ in ogni stato); il titolo 1 costa $" + p1 + "$ e paga $(" + s1.join("; ") + ")$; il titolo 2 costa $" + p2 + "$ e paga $(" + s2.join("; ") + ")$. Il portafoglio $x = (" + x0 + "; " + x1 + "; " + x2 + ")$ contiene $x_i$ unità del titolo $i$ (negativo = allo scoperto). Quanto valgono il suo costo di oggi, $\\sum_is^0_ix_i$, e il suo pagamento minimo domani sui tre stati?");
      var sp = T(L,
        "Cost: $" + x0 + "\\cdot 1 + " + x1 + "\\cdot " + p1 + " + " + x2 + "\\cdot " + p2 + " = " + costo + "$. Payoffs: $" + x0 + "\\cdot " + m(R, 2, L) + " + " + x1 + "s^1_{1j} + " + x2 + "s^1_{2j}$ = $" + pay.map(function (u) { return m(u, 2, L); }).join("$, $") + "$, smallest $" + m(mn, 2, L) + "$. A negative cost with every payoff $\\ge 0$ would be an arbitrage of type A. The risk-free position pays $R$ per unit, not 1.",
        "Costo: $" + x0 + "\\cdot 1 + " + x1 + "\\cdot " + p1 + " + " + x2 + "\\cdot " + p2 + " = " + costo + "$. Pagamenti: $" + x0 + "\\cdot " + m(R, 2, L) + " + " + x1 + "s^1_{1j} + " + x2 + "s^1_{2j}$ = $" + pay.map(function (u) { return m(u, 2, L); }).join("$, $") + "$, il minimo $" + m(mn, 2, L) + "$. Un costo negativo con tutti i pagamenti $\\ge 0$ sarebbe un arbitraggio di tipo A. La posizione priva di rischio paga $R$ per unità, non 1.");
      return chiudi(rng, testo, o(costo, mn), [o(costo, mnNoR), o(costo, mx), o(x0 * R + x1 * p1 + x2 * p2, mn), o(-costo, mn)], sp,
        { R: R, s1: s1, s2: s2, p1: p1, p2: p2, x: [x0, x1, x2] });
    }
  });

  gen({
    id: "lpm-g-arb-prezzo-atteso", livello: "facile", capitolo: "arbitrage",
    link: link("arbitrage/#duality-is-pricing", "arbitraggio/#la-dualita-e-la-prezzatura"),
    prova: function (rng, L) {
      var a = ri(rng, 1, 7), b = ri(rng, 1, 8 - a), q = [a / 10, b / 10, (10 - a - b) / 10];
      if (q[2] <= 0) return null;
      var R = pk(rng, [1.02, 1.04, 1.05]), s = [ri(rng, 0, 30), ri(rng, 0, 30), ri(rng, 0, 30)];
      var e = q[0] * s[0] + q[1] * s[1] + q[2] * s[2], pr = e / R;
      var media = (s[0] + s[1] + s[2]) / 3 / R;
      var vals = [pr, e, e * R, media];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      if (Math.abs(pr - media) < 0.05 || e === 0) return null;
      function o(x) { return "$s^0 = " + m(x, 2, L) + "$"; }
      var testo = T(L,
        "One-period market with three states and risk-free gross return $R = " + m(R, 2, L) + "$. The duals of the arbitrage LP give the risk-neutral probabilities $q = (" + q.map(function (u) { return m(u, 1, L); }).join("; ") + ")$, and every price today is the discounted expected payoff under $q$: $s^0_i = \\frac1R\\sum_jq_js^1_{ij}$. A new security pays $(" + s.join("; ") + ")$ in the three states. What is its arbitrage-free price today?",
        "Mercato a un periodo con tre stati e rendimento lordo privo di rischio $R = " + m(R, 2, L) + "$. I duali dell'LP di arbitraggio danno le probabilità neutrali al rischio $q = (" + q.map(function (u) { return m(u, 1, L); }).join("; ") + ")$, e ogni prezzo di oggi è il pagamento atteso scontato sotto $q$: $s^0_i = \\frac1R\\sum_jq_js^1_{ij}$. Un titolo nuovo paga $(" + s.join("; ") + ")$ nei tre stati. Qual è il suo prezzo di oggi senza arbitraggio?");
      var sp = T(L,
        "Expected payoff under $q$: $" + m(e, 2, L) + "$; discounted: $" + m(e, 2, L) + "/" + m(R, 2, L) + " = " + m(pr, 2, L) + "$. Forgetting to discount, or using equal probabilities instead of $q$, are the typical mistakes.",
        "Pagamento atteso sotto $q$: $" + m(e, 2, L) + "$; scontato: $" + m(e, 2, L) + "/" + m(R, 2, L) + " = " + m(pr, 2, L) + "$. Dimenticare lo sconto, o usare probabilità uguali invece di $q$, sono gli errori tipici.");
      return chiudi(rng, testo, o(pr), [o(e), o(e * R), o(media)], sp, { q: q, R: R, s: s });
    }
  });

  gen({
    id: "lpm-g-nv-servizio-uniforme", livello: "media", capitolo: "newsvendor",
    link: link("newsvendor/#service-levels-and-risk", "newsvendor/#livelli-di-servizio-e-rischio"),
    prova: function (rng, L) {
      var a = 10 * ri(rng, 5, 10), w = 10 * ri(rng, 4, 12), b = a + w;
      var cu = ri(rng, 2, 9), co = ri(rng, 2, 9);
      var al = cu / (cu + co), be = pk(rng, [0.9, 0.95]);
      if (al >= be - 0.05 || cu === co) return null;
      function C(qq) { return (co * (qq - a) * (qq - a) + cu * (b - qq) * (b - qq)) / (2 * w); }
      var qs = a + al * w, qb = a + be * w, ex = C(qb) - C(qs);
      var qb2 = a + (1 - be) * w;
      function Cs(qq) { return (cu * (qq - a) * (qq - a) + co * (b - qq) * (b - qq)) / (2 * w); }
      var exs = Cs(qb) - Cs(qs);
      var vals = [qb, ex, exs, C(qb)];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      if (Math.abs(ex - exs) < 0.05) return null;
      function o(x, y) { return "$q_\\beta = " + m(x, 2, L) + "$, " + T(L, "extra cost", "costo in più") + " $" + m(y, 2, L) + "$"; }
      var testo = T(L,
        "Newsvendor with uniform demand on $[" + a + ", " + b + "]$, $c_u = " + cu + "$, $c_o = " + co + "$. The expected cost of an order $q$ in $[" + a + ", " + b + "]$ is $C(q) = \\frac{c_o(q - " + a + ")^2 + c_u(" + b + " - q)^2}{2\\cdot " + w + "}$, minimized at $\\tilde q = " + a + " + \\frac{c_u}{c_u + c_o}\\cdot " + w + "$. A contract imposes a cycle service level $\\mathbb P(D \\le q) = " + m(be, 2, L) + "$. What are the required order $q_\\beta$ and its extra expected cost $C(q_\\beta) - C(\\tilde q)$?",
        "Newsvendor con domanda uniforme su $[" + a + ", " + b + "]$, $c_u = " + cu + "$, $c_o = " + co + "$. Il costo atteso di un ordine $q$ in $[" + a + ", " + b + "]$ è $C(q) = \\frac{c_o(q - " + a + ")^2 + c_u(" + b + " - q)^2}{2\\cdot " + w + "}$, minimo in $\\tilde q = " + a + " + \\frac{c_u}{c_u + c_o}\\cdot " + w + "$. Un contratto impone un livello di servizio di ciclo $\\mathbb P(D \\le q) = " + m(be, 2, L) + "$. Quanto valgono l'ordine richiesto $q_\\beta$ e il suo costo atteso in più $C(q_\\beta) - C(\\tilde q)$?");
      var sp = T(L,
        "$q_\\beta = " + a + " + " + m(be, 2, L) + "\\cdot " + w + " = " + m(qb, 2, L) + "$; $\\tilde q = " + m(qs, 2, L) + "$; $C(q_\\beta) = " + m(C(qb), 2, L) + "$ and $C(\\tilde q) = " + m(C(qs), 2, L) + "$, so the service level costs $" + m(ex, 2, L) + "$ more per cycle than the economic optimum, whose service level is only $" + m(al, 2, L) + "$.",
        "$q_\\beta = " + a + " + " + m(be, 2, L) + "\\cdot " + w + " = " + m(qb, 2, L) + "$; $\\tilde q = " + m(qs, 2, L) + "$; $C(q_\\beta) = " + m(C(qb), 2, L) + "$ e $C(\\tilde q) = " + m(C(qs), 2, L) + "$, quindi il livello di servizio costa $" + m(ex, 2, L) + "$ in più a ciclo rispetto all'ottimo economico, il cui livello di servizio è solo $" + m(al, 2, L) + "$.");
      return chiudi(rng, testo, o(qb, ex), [o(qb, exs), o(qb2, ex), o(qb, C(qb)), o(qb2, C(qb2) - C(qs))], sp,
        { a: a, b: b, cu: cu, co: co, beta: be });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): equilibrio fra capitoli (meno ripetizioni) ===================== */

  gen({
    id: "lpm-g-sv-rc-soglia", livello: "facile", capitolo: "solver",
    link: link("solver-lp/#43-reduced-costs-rc-why-is-this-variable-at-zero", "solver-lp/#43-costi-ridotti-rc-perche-questa-variabile-e-a-zero"),
    prova: function (rng, L) {
      var a1 = ri(rng, 1, 3), a2 = ri(rng, 1, 3), c1 = ri(rng, 2, 9) * a1, D = 10 * ri(rng, 3, 12);
      var pi = c1 / a1, c2 = a2 * pi + ri(rng, 1, 8), rc = c2 - a2 * pi, thr = a2 * pi;
      function o(r, t) { return "`RC` $= " + m(r, 2, L) + "$, " + T(L, "threshold", "soglia") + " $" + m(t, 2, L) + "$"; }
      function k(a) { return a === 1 ? "" : String(a); }
      var testo = T(L,
        "gurobipy, minimization LP: $\\min\\ " + c1 + "x_1 + " + c2 + "x_2$ subject to $" + k(a1) + "x_1 + " + k(a2) + "x_2 \\ge " + D + "$, $x_1, x_2 \\ge 0$. At the optimum $x_2 = 0$. What are its reduced cost (attribute `x2.RC`, $c_2$ minus the value of the resources it uses at the shadow prices) and the cost threshold `SAObjLow` below which $x_2$ becomes worth using?",
        "gurobipy, LP di minimo: $\\min\\ " + c1 + "x_1 + " + c2 + "x_2$ soggetto a $" + k(a1) + "x_1 + " + k(a2) + "x_2 \\ge " + D + "$, $x_1, x_2 \\ge 0$. All'ottimo $x_2 = 0$. Quanto valgono il suo costo ridotto (attributo `x2.RC`, $c_2$ meno il valore delle risorse che usa ai prezzi ombra) e la soglia di costo `SAObjLow` sotto la quale conviene usare $x_2$?");
      var sp = T(L,
        "Only $x_1$ is used, so the shadow price of the constraint is $c_1/a_1 = " + m(pi, 2, L) + "$; $x_2$ uses $" + a2 + "$ units, worth $" + m(thr, 2, L) + "$: `RC` $= " + c2 + " - " + m(thr, 2, L) + " = " + m(rc, 2, L) + " \\ge 0$ (a variable at its lower bound in a minimum). It becomes worth using when its cost falls to $" + m(thr, 2, L) + "$.",
        "Si usa solo $x_1$, quindi il prezzo ombra del vincolo è $c_1/a_1 = " + m(pi, 2, L) + "$; $x_2$ usa $" + a2 + "$ unità, che valgono $" + m(thr, 2, L) + "$: `RC` $= " + c2 + " - " + m(thr, 2, L) + " = " + m(rc, 2, L) + " \\ge 0$ (una variabile al limite inferiore in un minimo). Conviene usarla quando il suo costo scende a $" + m(thr, 2, L) + "$.");
      return chiudi(rng, testo, o(rc, thr), [o(-rc, thr), o(rc, c2 + rc), o(c2 - pi, pi), o(rc, c2)], sp,
        { c: [c1, c2], a: [a1, a2], D: D });
    }
  });

  gen({
    id: "lpm-g-sv-pi-capacita", livello: "facile", capitolo: "solver",
    link: link("solver-lp/#43-bis-the-general-case-signs-and-reading", "solver-lp/#43-bis-il-caso-generale-segni-e-lettura"),
    prova: function (rng, L) {
      var c1 = ri(rng, 2, 8), c2 = c1 + ri(rng, 2, 9), u = 10 * ri(rng, 2, 8), D = u + 10 * ri(rng, 1, 6);
      var dlt = ri(rng, 1, 9) * pk(rng, [-1, 1]);
      if (u + dlt <= 0 || u + dlt >= D) return null;
      var z = c1 * u + c2 * (D - u), pcap = c1 - c2, nz = z + pcap * dlt;
      function o(v) { return "$\\tilde z = " + v + "$"; }
      var testo = T(L,
        "gurobipy, minimization LP: $\\min\\ " + c1 + "x_1 + " + c2 + "x_2$ subject to demand $x_1 + x_2 \\ge " + D + "$ and capacity of the cheap source $x_1 \\le " + u + "$, $x \\ge 0$. Output: optimal cost $" + z + "$; demand constraint `Pi` $= " + c2 + "$; capacity constraint `Pi` $= " + pcap + "$, `SARHS` $= [0, " + D + "]$. What is the optimal cost if the capacity becomes $" + (u + dlt) + "$?",
        "gurobipy, LP di minimo: $\\min\\ " + c1 + "x_1 + " + c2 + "x_2$ soggetto a domanda $x_1 + x_2 \\ge " + D + "$ e capacità della fonte economica $x_1 \\le " + u + "$, $x \\ge 0$. Output: costo ottimo $" + z + "$; vincolo di domanda `Pi` $= " + c2 + "$; vincolo di capacità `Pi` $= " + pcap + "$, `SARHS` $= [0, " + D + "]$. Quanto vale il costo ottimo se la capacità diventa $" + (u + dlt) + "$?");
      var sp = T(L,
        "`Pi` $= \\partial\\tilde z/\\partial b$: a $\\le$ capacity in a minimum has `Pi` $\\le 0$, each unit saves $" + (-pcap) + "$ (the cheap source replaces the expensive one). The new value is inside `SARHS`, so $" + z + " + (" + pcap + ")\\cdot(" + dlt + ") = " + nz + "$.",
        "`Pi` $= \\partial\\tilde z/\\partial b$: una capacità $\\le$ in un minimo ha `Pi` $\\le 0$, ogni unità fa risparmiare $" + (-pcap) + "$ (la fonte economica sostituisce quella cara). Il nuovo valore è dentro `SARHS`, quindi $" + z + " + (" + pcap + ")\\cdot(" + dlt + ") = " + nz + "$.");
      return chiudi(rng, testo, o(nz), [o(z - pcap * dlt), o(z + c2 * dlt), o(z + c1 * dlt), o(z)], sp,
        { c: [c1, c2], u: u, D: D, nu: u + dlt });
    }
  });

  gen({
    id: "lpm-g-sv-rhs-costante", livello: "facile", capitolo: "solver",
    link: link("solver-lp/#43-bis-the-general-case-signs-and-reading", "solver-lp/#43-bis-il-caso-generale-segni-e-lettura"),
    prova: function (rng, L) {
      var base = ri(rng, 10, 60), C = base + 10 * ri(rng, 2, 10), C2 = C + 5 * ri(rng, 1, 6) * pk(rng, [-1, 1]);
      if (C2 <= base) return null;
      function o(r, s) { return "`constr.RHS` $= " + r + "$, " + T(L, "to set", "da impostare") + " $" + s + "$"; }
      var testo = T(L,
        "In gurobipy the meter constraint of an EV-charging model is written `constr = m.addConstr(quicksum(x[v,t] for v in V) + base[t] <= C)`, with the constant `base[t] = " + base + "` (base load, kW) and `C = " + C + "` (meter limit). What value does Gurobi store in `constr.RHS`, and which value must be assigned to `constr.RHS` to study a meter limit of $" + C2 + "$ kW?",
        "In gurobipy il vincolo del contatore di un modello di ricarica EV si scrive `constr = m.addConstr(quicksum(x[v,t] for v in V) + base[t] <= C)`, con la costante `base[t] = " + base + "` (carico di base, kW) e `C = " + C + "` (limite del contatore). Quale valore memorizza Gurobi in `constr.RHS`, e quale valore va assegnato a `constr.RHS` per studiare un limite di $" + C2 + "$ kW?");
      var sp = T(L,
        "Gurobi moves the constant to the right-hand side: `RHS` $= " + C + " - " + base + " = " + (C - base) + "$. Writing `constr.RHS = " + C2 + "` would impose $\\sum_v x_{vt} \\le " + C2 + "$, another constraint; the correct assignment is $" + C2 + " - " + base + " = " + (C2 - base) + "$.",
        "Gurobi sposta la costante nel termine noto: `RHS` $= " + C + " - " + base + " = " + (C - base) + "$. Scrivere `constr.RHS = " + C2 + "` imporrebbe $\\sum_v x_{vt} \\le " + C2 + "$, un altro vincolo; l'assegnazione corretta è $" + C2 + " - " + base + " = " + (C2 - base) + "$.");
      return chiudi(rng, testo, o(C - base, C2 - base), [o(C, C2), o(C - base, C2), o(C + base, C2 + base), o(C, C2 - base)], sp,
        { base: base, C: C, C2: C2 });
    }
  });


  gen({
    id: "lpm-g-reg-obiettivo-retta", livello: "facile", capitolo: "regression",
    link: link("regression/#the-model", "regressione/#il-modello"),
    prova: function (rng, L) {
      var w = ri(rng, -5, 5), b = 10 * ri(rng, 5, 15), tau = pk(rng, [0.25, 0.5, 0.75, 0.9]);
      if (w === 0) return null;
      var xs = [ri(rng, 0, 4), ri(rng, 5, 9), ri(rng, 10, 14), ri(rng, 15, 20)];
      var r = xs.map(function () { return ri(rng, -12, 12); });
      var ys = xs.map(function (x, i) { return w * x + b + r[i]; });
      var U = 0, V = 0;
      r.forEach(function (e) { if (e > 0) U += e; else V -= e; });
      if (U === 0 || V === 0) return null;
      var z = tau * U + (1 - tau) * V, zs = (1 - tau) * U + tau * V, za = U + V;
      if (Math.abs(z - zs) < 0.01) return null;
      function o(u, v, zz) { return "$\\sum u_i = " + u + "$, $\\sum v_i = " + v + "$, " + T(L, "value", "valore") + " $" + m(zz, 2, L) + "$"; }
      var pts = xs.map(function (x, i) { return "(" + x + "; " + ys[i] + ")"; }).join(", ");
      var testo = T(L,
        "Quantile regression LP with one feature: $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ with $wx_i + b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$ ($u_i$: observation above the line, $v_i$: below). For the candidate line $w = " + w + "$, $b = " + b + "$ (not necessarily optimal), $\\tau = " + m(tau, 2, L) + "$ and the observations $(x_i; y_i)$ " + pts + ", what are $\\sum_iu_i$, $\\sum_iv_i$ and the objective value?",
        "LP di regressione quantile con una caratteristica: $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ con $wx_i + b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$ ($u_i$: osservazione sopra la retta, $v_i$: sotto). Per la retta candidata $w = " + w + "$, $b = " + b + "$ (non necessariamente ottima), $\\tau = " + m(tau, 2, L) + "$ e le osservazioni $(x_i; y_i)$ " + pts + ", quanto valgono $\\sum_iu_i$, $\\sum_iv_i$ e il valore dell'obiettivo?");
      var sp = T(L,
        "Residuals $y_i - (wx_i + b)$: $" + r.join("$, $") + "$; positive parts sum to $" + U + "$ (the $u_i$), negative parts to $" + V + "$ (the $v_i$). Value $" + m(tau, 2, L) + "\\cdot " + U + " + " + m(1 - tau, 2, L) + "\\cdot " + V + " = " + m(z, 2, L) + "$; swapping the weights of the two sides is the typical mistake.",
        "Residui $y_i - (wx_i + b)$: $" + r.join("$, $") + "$; le parti positive sommano $" + U + "$ (gli $u_i$), quelle negative $" + V + "$ (i $v_i$). Valore $" + m(tau, 2, L) + "\\cdot " + U + " + " + m(1 - tau, 2, L) + "\\cdot " + V + " = " + m(z, 2, L) + "$; scambiare i pesi dei due lati è l'errore tipico.");
      return chiudi(rng, testo, o(U, V, z), [o(U, V, zs), o(V, U, z), o(U, V, za), o(V, U, zs)], sp,
        { w: w, b: b, tau: tau, xs: xs, ys: ys });
    }
  });

  gen({
    id: "lpm-g-reg-scorta", livello: "facile", capitolo: "regression",
    link: link("regression/#quantile-regression-and-safety-stock", "regressione/#regressione-quantile-e-scorta-di-sicurezza"),
    prova: function (rng, L) {
      var t = ri(rng, 10, 32), pr = pk(rng, [2.5, 3, 3.5]), we = pk(rng, [0, 1]);
      var A = [270 + ri(rng, -5, 5), -(3.5 + ri(rng, 0, 6) / 10), -(22 + ri(rng, 0, 4)), 28 + ri(rng, 0, 6)];
      var B = [A[0] + ri(rng, 6, 14), A[1] - ri(rng, -2, 2) / 10, A[2] - ri(rng, 0, 3), A[3] + ri(rng, 0, 4)];
      function prev(c) { return c[0] + c[1] * t + c[2] * pr + c[3] * we; }
      var med = prev(A), qu = prev(B), ss = qu - med;
      if (ss <= 0.5 || quasiMezzo(med, 1) || quasiMezzo(qu, 1) || quasiMezzo(ss, 1)) return null;
      function o(x, y) { return T(L, "produce $", "produrre $") + m(x, 1, L) + T(L, "$, safety stock $", "$, scorta di sicurezza $") + m(y, 1, L) + "$"; }
      function f(c) { return m(c[0], 2, L) + " " + (c[1] < 0 ? "-" : "+") + " " + m(Math.abs(c[1]), 2, L) + "\\,t " + (c[2] < 0 ? "-" : "+") + " " + m(Math.abs(c[2]), 2, L) + "\\,p + " + m(c[3], 2, L) + "\\,e"; }
      var testo = T(L,
        "A bakery forecasts daily demand from temperature $t$ (°C), price $p$ (€) and weekend indicator $e \\in \\{0, 1\\}$ with quantile regression. Median model ($\\tau = 0.5$): $" + f(A) + "$; model at the critical fractile $\\tau = 9/13$ (the newsvendor quantile): $" + f(B) + "$. For a day with $t = " + t + "$, $p = " + m(pr, 1, L) + "$, $e = " + we + "$, how much should be produced, and what is the safety stock?",
        "Una panetteria prevede la domanda giornaliera da temperatura $t$ (°C), prezzo $p$ (€) e indicatore di weekend $e \\in \\{0, 1\\}$ con la regressione quantile. Modello mediano ($\\tau = 0{,}5$): $" + f(A) + "$; modello al frattile critico $\\tau = 9/13$ (il quantile del newsvendor): $" + f(B) + "$. Per un giorno con $t = " + t + "$, $p = " + m(pr, 1, L) + "$, $e = " + we + "$, quanto conviene produrre, e qual è la scorta di sicurezza?");
      var sp = T(L,
        "One produces the forecast at the critical fractile, $" + m(qu, 1, L) + "$; the median forecast is $" + m(med, 1, L) + "$, and their difference, $" + m(ss, 1, L) + "$, is the safety stock, obtained with no assumption on the distribution of demand.",
        "Si produce la previsione al frattile critico, $" + m(qu, 1, L) + "$; la previsione mediana è $" + m(med, 1, L) + "$, e la loro differenza, $" + m(ss, 1, L) + "$, è la scorta di sicurezza, ottenuta senza ipotesi sulla distribuzione della domanda.");
      return chiudi(rng, testo, o(qu, ss), [o(med, ss), o(qu, qu), o(med + 2 * ss, ss), o(qu, med)], sp,
        { A: A, B: B, t: t, p: pr, e: we });
    }
  });

  /* ===================== generatori aggiunti (7 novembre 2026): parte «Modelli deterministici» ===================== */


})();

// Autovalutazione di LP Modelling, capitolo 4 «Tecniche di modellazione»: i generatori venuti dal capitolo 16
// di Programmazione lineare (22/11/2026). Formato: QUIZ_SPEC.md.
// Ogni generatore: genera(rng, lingua) -> { testo, opzioni, corretta, spiegazione, verifica }.
// Il campo «verifica» (dati dell'istanza e valore di ogni opzione) serve solo ai controlli
// in quiz/verifica/: l'app lo ignora. L'istanza dipende solo da rng, non dalla lingua.
window.QUIZ_GEN = window.QUIZ_GEN || {};
(function () {
  "use strict";
  var MOD = "lp-modelling";
  var G = (QUIZ_GEN[MOD] = QUIZ_GEN[MOD] || []);

  // ------------------------------------------------------------------ link
  var BASE = {
    it: "https://fabiofurini.github.io/programmazione-lineare/",
    en: "https://fabiofurini.github.io/linear-programming/"
  };
  var PAG = {
    "01-linear-functions": ["problemi-pl/01-funzioni-lineari/", "lp-problems/01-linear-functions/"],
    "02-polyhedra": ["problemi-pl/02-poliedri/", "lp-problems/02-polyhedra/"],
    "03-linear-optimization-problems": ["problemi-pl/03-problemi-ottimizzazione-lineare/", "lp-problems/03-linear-optimization-problems/"],
    "04-lp-problems": ["problemi-pl/04-problemi-pl/", "lp-problems/04-lp-problems/"],
    "05-outcomes-equivalences": ["problemi-pl/05-esiti-equivalenze/", "lp-problems/05-outcomes-equivalences/"],
    "06-simplex": ["simplesso/06-simplesso/", "simplex/06-simplex/"],
    "07-optimality-pivot": ["simplesso/07-ottimalita-pivot/", "simplex/07-optimality-pivot/"],
    "08-phase-zero": ["simplesso/08-fase-zero/", "simplex/08-phase-zero/"],
    "09-duality": ["dualita/09-dualita/", "duality/09-duality/"],
    "10-dual-simplex": ["dualita/10-simplesso-duale/", "duality/10-dual-simplex/"],
    "11-revised-simplex": ["metodi-avanzati/11-simplesso-rivisto/", "advanced-methods/11-revised-simplex/"],
    "12-revised-dual": ["metodi-avanzati/12-rivisto-duale/", "advanced-methods/12-revised-dual/"],
    "13-primal-dual": ["metodi-avanzati/13-primale-duale/", "advanced-methods/13-primal-dual/"],
    "14-sensitivity": ["metodi-avanzati/14-sensitivita/", "advanced-methods/14-sensitivity/"],
    "15-geometry": ["metodi-avanzati/15-geometria/", "advanced-methods/15-geometry/"],
    "16-modelling": ["modellazione/16-modellazione/", "modelling/16-modelling/"]
  };
  function link(cap, ancIt, ancEn) {
    if (ancEn === undefined) ancEn = ancIt;
    return {
      it: BASE.it + PAG[cap][0] + (ancIt ? "#" + ancIt : ""),
      en: BASE.en + PAG[cap][1] + (ancEn ? "#" + ancEn : "")
    };
  }

  // ------------------------------------------------------- frazioni esatte
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function Q(n, d) {
    if (d === undefined) d = 1;
    if (d === 0) throw new Error("divisione per zero");
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d);
    this.n = n / g; this.d = d / g;
  }
  function q(x) { return x instanceof Q ? x : new Q(x, 1); }
  Q.prototype.add = function (o) { o = q(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); };
  Q.prototype.sub = function (o) { o = q(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); };
  Q.prototype.mul = function (o) { o = q(o); return new Q(this.n * o.n, this.d * o.d); };
  Q.prototype.div = function (o) { o = q(o); return new Q(this.n * o.d, this.d * o.n); };
  Q.prototype.neg = function () { return new Q(-this.n, this.d); };
  Q.prototype.abs = function () { return new Q(Math.abs(this.n), this.d); };
  Q.prototype.sgn = function () { return this.n > 0 ? 1 : (this.n < 0 ? -1 : 0); };
  Q.prototype.cmp = function (o) { return this.sub(o).sgn(); };
  Q.prototype.eq = function (o) { return this.cmp(o) === 0; };
  Q.prototype.isZero = function () { return this.n === 0; };
  Q.prototype.isOne = function () { return this.n === 1 && this.d === 1; };
  Q.prototype.tex = function () {
    if (this.d === 1) return String(this.n);
    return (this.n < 0 ? "-" : "") + "\\frac{" + Math.abs(this.n) + "}{" + this.d + "}";
  };
  Q.prototype.key = function () { return this.d === 1 ? String(this.n) : this.n + "/" + this.d; };
  function qmin(arr) { var m = arr[0]; arr.forEach(function (x) { if (x.cmp(m) < 0) m = x; }); return m; }
  function qmax(arr) { var m = arr[0]; arr.forEach(function (x) { if (x.cmp(m) > 0) m = x; }); return m; }

  // ------------------------------------------------------------ casualità
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function nz(rng, a, b) { var v = 0; while (v === 0) v = ri(rng, a, b); return v; }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  // righe non nulle e a due a due non proporzionali (niente vincoli ripetuti o paralleli)
  function righeBuone(A) {
    for (var i = 0; i < A.length; i++) {
      if (A[i].every(function (v) { return v === 0; })) return false;
      for (var k = i + 1; k < A.length; k++) {
        var prop = true;
        for (var u = 0; u < A[i].length; u++) for (var w = u + 1; w < A[i].length; w++)
          if (A[i][u] * A[k][w] - A[i][w] * A[k][u] !== 0) prop = false;
        if (prop) return false;
      }
    }
    return true;
  }
  function tenta(f) {
    for (var k = 0; k < 4000; k++) { var r = f(); if (r) return r; }
    throw new Error("nessuna istanza valida");
  }

  // ------------------------------------------------------------- scrittura
  function xv(j) { return j < 10 ? "x_" + j : "x_{" + j + "}"; }
  function xs(n) { var r = []; for (var j = 1; j <= n; j++) r.push(xv(j)); return r; }
  function term(c, name) { var a = c.abs(); return (a.isOne() ? "" : a.tex() + "\\," ) + name; }
  // combinazione lineare (senza costante)
  function lin(coefs, names) {
    var s = "";
    coefs.forEach(function (c, k) {
      c = q(c); if (c.isZero()) return;
      if (s === "") s = (c.sgn() < 0 ? "-" : "") + term(c, names[k]);
      else s += (c.sgn() < 0 ? " - " : " + ") + term(c, names[k]);
    });
    return s === "" ? "0" : s;
  }
  // costante + combinazione lineare (la costante si scrive sempre, come nelle dispense)
  function aff(c0, coefs, names) {
    var s = q(c0).tex();
    coefs.forEach(function (c, k) {
      c = q(c); if (c.isZero()) return;
      s += (c.sgn() < 0 ? " - " : " + ") + term(c, names[k]);
    });
    return s;
  }
  var SOGG = { it: "\\text{soggetto a}", en: "\\text{subject to}" };
  var SEGNO = { le: "\\le", ge: "\\ge", eq: "=" };
  // problema LP: senso "max"/"min", c, righe (coefficienti), versi, termini noti, riga dei domini
  function lpTex(lang, senso, c, righe, versi, rhs, domini, nomi) {
    var n = c.length; nomi = nomi || xs(n);
    var s = "$\\begin{array}{rl} \\" + senso + " & " + lin(c, nomi);
    righe.forEach(function (r, i) {
      s += " \\\\ " + (i === 0 ? SOGG[lang] : "") + " & " + lin(r, nomi) + " " + SEGNO[versi[i]] + " " + q(rhs[i]).tex();
    });
    s += " \\\\ & " + (domini || nomi.join(", ") + " \\ge 0") + " \\end{array}$";
    return s;
  }
  function insieme(arr) { return "\\{" + arr.join(", ") + "\\}"; }
  function vett(arr) { return "(" + arr.map(function (v) { return q(v).tex(); }).join(", ") + ")"; }
  function colonna(arr) { return "\\begin{pmatrix} " + arr.map(function (v) { return q(v).tex(); }).join(" \\\\ ") + " \\end{pmatrix}"; }
  function matrice(M) {
    return "\\begin{pmatrix} " + M.map(function (r) { return r.map(function (v) { return q(v).tex(); }).join(" & "); }).join(" \\\\ ") + " \\end{pmatrix}";
  }
  function par(v) { v = q(v); return v.sgn() < 0 ? "(" + v.tex() + ")" : v.tex(); }

  // ---------------------------------------------------- dizionari del simplesso
  // D = { B:[..], N:[..], b:{i:Q}, a:{i:{j:Q}}, c:{j:Q}, z:Q }
  // con la convenzione delle dispense: x_i = b_i - sum_j a_ij x_j,  z = z + sum_j c_j x_j
  function ord(a) { return a.slice().sort(function (u, v) { return u - v; }); }
  function copiaD(D) {
    var E = { B: D.B.slice(), N: D.N.slice(), b: {}, a: {}, c: {}, z: D.z };
    D.B.forEach(function (i) { E.b[i] = D.b[i]; E.a[i] = {}; D.N.forEach(function (j) { E.a[i][j] = D.a[i][j]; }); });
    D.N.forEach(function (j) { E.c[j] = D.c[j]; });
    return E;
  }
  function dizIniziale(A, b, c) {
    var m = A.length, n = c.length;
    var D = { B: range(n + 1, n + m), N: range(1, n), b: {}, a: {}, c: {}, z: q(0) };
    for (var i = 0; i < m; i++) {
      D.b[n + 1 + i] = q(b[i]); D.a[n + 1 + i] = {};
      for (var j = 0; j < n; j++) D.a[n + 1 + i][j + 1] = q(A[i][j]);
    }
    for (var j2 = 0; j2 < n; j2++) D.c[j2 + 1] = q(c[j2]);
    return D;
  }
  function pivot(D, p, r) {
    var E = { B: ord(D.B.filter(function (i) { return i !== r; }).concat([p])),
              N: ord(D.N.filter(function (j) { return j !== p; }).concat([r])), b: {}, a: {}, c: {}, z: null };
    var arp = D.a[r][p];
    var bp = D.b[r].div(arp), ap = {};
    D.N.forEach(function (j) { if (j !== p) ap[j] = D.a[r][j].div(arp); });
    ap[r] = q(1).div(arp);
    E.b[p] = bp; E.a[p] = ap;
    D.B.forEach(function (i) {
      if (i === r) return;
      var aip = D.a[i][p];
      E.b[i] = D.b[i].sub(aip.mul(bp)); E.a[i] = {};
      E.N.forEach(function (j) {
        var vecchio = (j === r) ? q(0) : D.a[i][j];
        E.a[i][j] = vecchio.sub(aip.mul(ap[j]));
      });
    });
    var cp = D.c[p];
    E.z = D.z.add(cp.mul(bp));
    E.N.forEach(function (j) {
      var vecchio = (j === r) ? q(0) : D.c[j];
      E.c[j] = vecchio.sub(cp.mul(ap[j]));
    });
    return E;
  }
  // test dei rapporti (regola di Bland): restituisce {t, r} oppure null se illimitato
  function testRapporti(D, p) {
    var t = null, r = null;
    D.B.forEach(function (i) {
      var a = D.a[i][p];
      if (a.sgn() > 0) {
        var v = D.b[i].div(a);
        if (t === null || v.cmp(t) < 0 || (v.eq(t) && i < r)) { t = v; r = i; }
      }
    });
    return t === null ? null : { t: t, r: r };
  }
  function colonnaBland(D) {
    for (var k = 0; k < D.N.length; k++) if (D.c[D.N[k]].sgn() > 0) return D.N[k];
    return null;
  }
  // simplesso con la regola di Bland: { stato: "ottimo"|"illimitato"|"troppo", storia:[{D,p,r,t}], D }
  function simplesso(D0) {
    var D = D0, storia = [];
    for (var it = 0; it < 60; it++) {
      var p = colonnaBland(D);
      if (p === null) return { stato: "ottimo", storia: storia, D: D };
      var tr = testRapporti(D, p);
      if (!tr) return { stato: "illimitato", storia: storia, D: D, p: p };
      storia.push({ D: D, p: p, r: tr.r, t: tr.t });
      D = pivot(D, p, tr.r);
    }
    return { stato: "troppo", storia: storia, D: D };
  }
  // passo del simplesso duale (Bland): {r, p, s} oppure {r, p:null} (certificato di inammissibilità) oppure null (ottimo)
  function passoDuale(D) {
    var r = null;
    for (var k = 0; k < D.B.length; k++) if (D.b[D.B[k]].sgn() < 0) { r = D.B[k]; break; }
    if (r === null) return null;
    var s = null, p = null;
    D.N.forEach(function (j) {
      var a = D.a[r][j];
      if (a.sgn() < 0) {
        var v = D.c[j].div(a);
        if (s === null || v.cmp(s) < 0 || (v.eq(s) && j < p)) { s = v; p = j; }
      }
    });
    return { r: r, p: p, s: s };
  }
  function simplessoDuale(D0) {
    var D = D0, storia = [];
    for (var it = 0; it < 60; it++) {
      var ps = passoDuale(D);
      if (ps === null) return { stato: "ottimo", storia: storia, D: D };
      if (ps.p === null) return { stato: "inammissibile", storia: storia, D: D, r: ps.r };
      storia.push({ D: D, p: ps.p, r: ps.r, s: ps.s });
      D = pivot(D, ps.p, ps.r);
    }
    return { stato: "troppo", storia: storia, D: D };
  }
  function puntoD(D, n) { var x = []; for (var j = 1; j <= n; j++) x.push(D.B.indexOf(j) >= 0 ? D.b[j] : q(0)); return x; }
  function maxDen(D) {
    var m = D.z.d;
    D.B.forEach(function (i) { m = Math.max(m, D.b[i].d); D.N.forEach(function (j) { m = Math.max(m, D.a[i][j].d); }); });
    D.N.forEach(function (j) { m = Math.max(m, D.c[j].d); });
    return m;
  }
  function maxAbs(D) {
    var m = Math.abs(D.z.n);
    D.B.forEach(function (i) { m = Math.max(m, Math.abs(D.b[i].n)); D.N.forEach(function (j) { m = Math.max(m, Math.abs(D.a[i][j].n)); }); });
    D.N.forEach(function (j) { m = Math.max(m, Math.abs(D.c[j].n)); });
    return m;
  }
  function dizTex(D) {
    var s = "$\\begin{array}{rcl} ";
    D.B.forEach(function (i) {
      s += xv(i) + " & = & " + aff(D.b[i], D.N.map(function (j) { return D.a[i][j].neg(); }), D.N.map(xv)) + " \\\\ ";
    });
    s += "z & = & " + aff(D.z, D.N.map(function (j) { return D.c[j]; }), D.N.map(xv)) + " \\end{array}$";
    return s;
  }
  function partTex(D) {
    return "$\\pazocal{B} = " + insieme(D.B) + "$, $\\pazocal{N} = " + insieme(D.N) + "$";
  }
  function dizDati(D) {
    var o = { B: D.B, N: D.N, b: {}, a: {}, c: {}, z: D.z.key() };
    D.B.forEach(function (i) { o.b[i] = D.b[i].key(); o.a[i] = {}; D.N.forEach(function (j) { o.a[i][j] = D.a[i][j].key(); }); });
    D.N.forEach(function (j) { o.c[j] = D.c[j].key(); });
    return o;
  }
  function dizCasuale(rng, m, nn, amin, amax) {
    var idx = shuffle(rng, range(1, m + nn));
    var D = { B: ord(idx.slice(0, m)), N: ord(idx.slice(m)), b: {}, a: {}, c: {}, z: q(ri(rng, 0, 12)) };
    D.B.forEach(function (i) {
      D.b[i] = q(ri(rng, 1, 9)); D.a[i] = {};
      D.N.forEach(function (j) { D.a[i][j] = q(ri(rng, amin, amax)); });
    });
    D.N.forEach(function (j) { D.c[j] = q(ri(rng, -4, 5)); });
    return D;
  }

  // ---------------------------------------------------------- opzioni
  // giusta, sbagliate: {it, en, v}; restituisce null se due opzioni coincidono
  function impacchetta(rng, lang, giusta, sbagliate, testo, spieg, dati) {
    if (sbagliate.length !== 3) return null;
    var tutte = [giusta].concat(sbagliate);
    for (var a = 0; a < 4; a++) for (var b = a + 1; b < 4; b++) {
      if (tutte[a].v === tutte[b].v || tutte[a].it === tutte[b].it || tutte[a].en === tutte[b].en) return null;
    }
    var ordine = shuffle(rng, [0, 1, 2, 3]);
    return {
      testo: testo[lang],
      opzioni: ordine.map(function (k) { return tutte[k][lang]; }),
      corretta: ordine.indexOf(0),
      spiegazione: spieg[lang],
      verifica: { dati: dati, valori: ordine.map(function (k) { return tutte[k].v; }) }
    };
  }
  // testi comuni che rendono autocontenute le domande sui dizionari
  var DIZ_PRE = {
    it: "Nell'algoritmo del simplesso per un problema LP in forma standard di massimo (tutte le variabili $x_j \\ge 0$), si consideri il dizionario con ",
    en: "In the simplex algorithm for an LP problem in standard maximization form (all variables $x_j \\ge 0$), consider the dictionary with "
  };
  var DIZ_CONV = {
    it: " (nella riga di $x_i$ il coefficiente di $x_j$ è $-\\bar a_{ij}$; la riga di $z$ riporta il valore $\\bar z$ e i costi ridotti $\\bar c_j$)",
    en: " (in the row of $x_i$ the coefficient of $x_j$ is $-\\bar a_{ij}$; the row of $z$ shows the value $\\bar z$ and the reduced costs $\\bar c_j$)"
  };
  var BLAND = {
    it: "regola di Bland (colonna pivot: la variabile fuori base di indice minimo con $\\bar c_j > 0$; riga pivot: test dei rapporti $\\min\\{\\bar b_i / \\bar a_{ip} : \\bar a_{ip} > 0\\}$, a parità l'indice minimo)",
    en: "Bland's rule (pivot column: the non-basic variable with the smallest index and $\\bar c_j > 0$; pivot row: ratio test $\\min\\{\\bar b_i / \\bar a_{ip} : \\bar a_{ip} > 0\\}$, ties broken by the smallest index)"
  };
  var BLAND_D = {
    it: "regola di Bland del simplesso duale (riga pivot: la variabile in base di indice minimo con $\\bar b_r < 0$; colonna pivot: $\\min\\{\\bar c_j / \\bar a_{rj} : \\bar a_{rj} < 0\\}$, a parità l'indice minimo)",
    en: "Bland's rule of the dual simplex algorithm (pivot row: the basic variable with the smallest index and $\\bar b_r < 0$; pivot column: $\\min\\{\\bar c_j / \\bar a_{rj} : \\bar a_{rj} < 0\\}$, ties broken by the smallest index)"
  };
  var PIDEF = {
    it: " ($\\tilde\\pi_i$ è la variabile duale associata al vincolo $i$)",
    en: " ($\\tilde\\pi_i$ is the dual variable associated with constraint $i$)"
  };
  var AUXDEF = {
    it: "problema ausiliario del simplesso $\\max\\{-x_0 : \\sum_j a_{ij} x_j - x_0 \\le b_i~ \\forall i,~ {\\boldsymbol x} \\ge {\\boldsymbol 0},~ x_0 \\ge 0\\}$",
    en: "simplex auxiliary problem $\\max\\{-x_0 : \\sum_j a_{ij} x_j - x_0 \\le b_i~ \\forall i,~ {\\boldsymbol x} \\ge {\\boldsymbol 0},~ x_0 \\ge 0\\}$"
  };

  function opz(it, en, v) { return { it: it, en: en === undefined ? it : en, v: v }; }
  // sceglie fino a k candidati distinti fra loro e dalla giusta (per valore v)
  function scegli(cand, giusta, k) {
    var out = [], visti = {}; visti[giusta.v] = 1;
    for (var i = 0; i < cand.length && out.length < k; i++) {
      var c = cand[i]; if (!c || visti[c.v]) continue;
      visti[c.v] = 1; out.push(c);
    }
    return out.length === k ? out : null;
  }

  // ======================================================================
  // 1. Insiemi di livello (cap. 1)
  // link alle sottopagine del capitolo 4 «Tecniche di modellazione»
  function linkT(n) {
    return { it: "https://fabiofurini.github.io/modellazione-pl/tecniche-" + n + "/",
             en: "https://fabiofurini.github.io/lp-modelling/techniques-" + n + "/" };
  }


  // ======================================================================
  // 2. Appartenenza a un poliedro (cap. 2)

  // ======================================================================
  // 3. Soluzione ammissibile e lower bound (cap. 4)

  // ======================================================================
  // 4. Metodo grafico (cap. 4)

  // ======================================================================
  // 5. Forme equivalenti: conteggio di variabili e vincoli (cap. 5)

  // ======================================================================
  // 6. Regola di Bland: colonna e riga pivot (cap. 7)

  // ======================================================================
  // 7. Nuovo valore della funzione obiettivo dopo un'operazione di pivot (cap. 6)

  // ======================================================================
  // 8. Esito di un dizionario: ottimo, illimitato, pivot degenere o non degenere (cap. 6)

  // ======================================================================
  // 9. Fase 0: operazione di pivot speciale (cap. 8)

  // ======================================================================
  // 10. Scrivere il problema duale (cap. 9)

  // ---------------------------------------------------- problemi LP con ottimo «gentile»
  // problema in forma canonica di massimo risolto con il simplesso (Bland) dalla base delle variabili di scarto;
  // richiede ottimo unico e non degenere, numeri piccoli
  function lpGentile(rng, n, m, opzioni) {
    var o = opzioni || {};
    var A = [], b = [], c = [];
    for (var i = 0; i < m; i++) {
      var r = []; for (var j = 0; j < n; j++) r.push(ri(rng, o.amin === undefined ? 0 : o.amin, o.amax || 5));
      if (r.every(function (v) { return v <= 0; })) return null;
      A.push(r); b.push(ri(rng, o.bmin || 4, o.bmax || 20));
    }
    for (var j2 = 0; j2 < n; j2++) c.push(ri(rng, 1, o.cmax || 8));
    if (!righeBuone(A)) return null;
    var ris = simplesso(dizIniziale(A, b, c));
    if (ris.stato !== "ottimo") return null;
    var D = ris.D;
    if (D.N.some(function (j) { return D.c[j].sgn() >= 0; })) return null;   // ottimo unico
    if (D.B.some(function (i) { return D.b[i].sgn() <= 0; })) return null;   // non degenere
    if (maxDen(D) > (o.den || 8) || maxAbs(D) > (o.abs || 60)) return null;
    if (o.minPivot && ris.storia.length < o.minPivot) return null;
    for (var k = 0; k < ris.storia.length; k++) {
      if (ris.storia[k].t.isZero()) return null;
      if (maxDen(ris.storia[k].D) > (o.den || 8)) return null;
    }
    return { A: A, b: b, c: c, n: n, m: m, ris: ris, D: D };
  }
  function duali(D, n, m) { var p = []; for (var i = 1; i <= m; i++) p.push(D.N.indexOf(n + i) >= 0 ? D.c[n + i].neg() : q(0)); return p; }
  function vettOpz(nome, v) { return "$(" + v.map(function (_, i) { return nome + "_" + (i + 1); }).join(", ") + ") = " + vett(v) + "$"; }
  function chiave(v) { return v.map(function (x) { return q(x).key(); }).join(","); }

  // ======================================================================
  // 11. Soluzione duale ottima dal dizionario ottimo (cap. 9)

  // ======================================================================
  // 12. Scarti complementari (cap. 9)

  // ======================================================================
  // 13. Operazione di pivot duale (cap. 10)

  // ---------------------------------------------------------- intervalli
  function intervallo(nome, lo, hi) {
    if (lo === null && hi === null) return "$" + nome + " \\in \\R$";
    if (lo === null) return "$" + nome + " \\le " + hi.tex() + "$";
    if (hi === null) return "$" + nome + " \\ge " + lo.tex() + "$";
    return "$" + lo.tex() + " \\le " + nome + " \\le " + hi.tex() + "$";
  }
  function chiaveInt(lo, hi) { return (lo === null ? "-inf" : lo.key()) + ";" + (hi === null ? "inf" : hi.key()); }
  function opzInt(nome, lo, hi) { var s = intervallo(nome, lo, hi); return opz(s, s, chiaveInt(lo, hi)); }
  function piu(x, d) { return x === null ? null : x.add(d); }

  // ======================================================================
  // 14. Sensitività: costo di una variabile fuori base (cap. 14)

  // ======================================================================
  // 15. Sensitività: costo di una variabile in base (cap. 14)

  // ======================================================================
  // 16. Sensitività: termine noto (cap. 14)

  // ---------------------------------------------------- matrici 2x2 (simplesso rivisto)
  function inv2(M) {
    var d = q(M[0][0]).mul(M[1][1]).sub(q(M[0][1]).mul(M[1][0]));
    if (d.isZero()) return null;
    return [[q(M[1][1]).div(d), q(M[0][1]).neg().div(d)], [q(M[1][0]).neg().div(d), q(M[0][0]).div(d)]];
  }
  function standard2(rng) {
    var A = [[ri(rng, -2, 5), ri(rng, -2, 5), 1, 0], [ri(rng, -2, 5), ri(rng, -2, 5), 0, 1]];
    var c = [ri(rng, 1, 8), ri(rng, 1, 8), 0, 0];
    return { A: A, c: c };
  }
  function colA(A, j) { return [A[0][j - 1], A[1][j - 1]]; }
  function stdTex(lang, S) {
    return "${\\boldsymbol A} = " + matrice(S.A) + "$, ${\\boldsymbol c}' = " + vett(S.c) + "$";
  }

  // ======================================================================
  // 17. Simplesso rivisto: primo sistema e costo ridotto (cap. 11)

  // ======================================================================
  // 18. Simplesso duale rivisto: secondo sistema (cap. 12)

  // ======================================================================
  // 19. Metodo primale-duale: passo duale (cap. 13)

  // ======================================================================
  // 20. Modelli: numero di variabili e di vincoli (cap. 16)
  G.push({
    id: "lpm-g-modelli-dimensioni", livello: "facile", capitolo: "techniques",
    link: linkT("01"),
    genera: function (rng, lingua) {
      return tenta(function () {
        var tipo = pick(rng, ["trasporto", "multi", "produzione"]);
        var corr, d, testo, spieg, parametri;
        if (tipo === "trasporto") {
          var s = ri(rng, 2, 6), r = ri(rng, 2, 7); if (s === r) return null;
          corr = [s * r, s + r]; parametri = [s, r]; d = [[s + r, s * r], [s * r, s * r], [s * r, 2 * (s + r)]];
          testo = { it: "Un'azienda spedisce un prodotto da $s = " + s + "$ magazzini, ciascuno con una disponibilità, a $r = " + r + "$ clienti, ciascuno con una domanda da soddisfare, con un costo unitario per ogni coppia magazzino-cliente. Nel modello LP di trasporto, con una variabile per la quantità spedita da ogni magazzino a ogni cliente, quante variabili e quanti vincoli (esclusi quelli di non negatività) ci sono?",
                    en: "A company ships a product from $s = " + s + "$ warehouses, each with an availability, to $r = " + r + "$ clients, each with a demand to satisfy, with a unit cost for every warehouse-client pair. In the LP transportation model, with one variable for the quantity shipped from every warehouse to every client, how many variables and how many constraints (excluding non-negativity) are there?" };
          spieg = { it: "Una variabile $x_{ij}$ per ogni coppia magazzino-cliente: $s \\cdot r = " + (s * r) + "$. Un vincolo di disponibilità per magazzino e un vincolo di domanda per cliente: $s + r = " + (s + r) + "$.",
                    en: "One variable $x_{ij}$ for each warehouse-client pair: $s \\cdot r = " + (s * r) + "$. One availability constraint per warehouse and one demand constraint per client: $s + r = " + (s + r) + "$." };
        } else if (tipo === "multi") {
          var n = ri(rng, 3, 12);
          corr = [2 * n, 2 * n]; parametri = [n]; d = [[n, 2 * n], [2 * n, n], [2 * n + 1, 2 * n]];
          testo = { it: "Un'azienda deve soddisfare la domanda $d_t$ di un prodotto in $n = " + n + "$ periodi, con produzione massima $p_t$ in ogni periodo. Nel modello LP multi-periodo, con variabili $x_t$ (produzione del periodo $t$) e $y_t$ (scorta a fine periodo $t$, con $y_0 = 0$ dato), un vincolo di bilancio delle scorte e un vincolo di capacità per periodo, quante variabili e quanti vincoli (esclusi quelli di non negatività) ci sono?",
                    en: "A company has to satisfy the demand $d_t$ of a product over $n = " + n + "$ periods, with maximum production $p_t$ in every period. In the multi-period LP model, with variables $x_t$ (production of period $t$) and $y_t$ (inventory at the end of period $t$, with $y_0 = 0$ given), one inventory balance constraint and one capacity constraint per period, how many variables and how many constraints (excluding non-negativity) are there?" };
          spieg = { it: "Le variabili sono $x_t$ e $y_t$ per $t = 1, \\dots, n$: $2n = " + (2 * n) + "$ ($y_0 = 0$ è un dato). I vincoli sono $n$ di bilancio delle scorte e $n$ di capacità: $2n = " + (2 * n) + "$.",
                    en: "The variables are $x_t$ and $y_t$ for $t = 1, \\dots, n$: $2n = " + (2 * n) + "$ ($y_0 = 0$ is a datum). The constraints are $n$ inventory balance constraints and $n$ capacity constraints: $2n = " + (2 * n) + "$." };
        } else {
          var rr = ri(rng, 2, 7), ss = ri(rng, 2, 7); if (rr === ss) return null;
          corr = [rr, ss]; parametri = [rr, ss]; d = [[ss, rr], [rr * ss, ss], [rr, rr + ss]];
          testo = { it: "Un'azienda fabbrica $r = " + rr + "$ prodotti, ciascuno con un profitto unitario, usando $s = " + ss + "$ risorse disponibili in quantità limitata; ogni unità di prodotto consuma una quantità nota di ogni risorsa. Nel modello LP di pianificazione della produzione, con una variabile per la quantità prodotta di ogni prodotto, quante variabili e quanti vincoli (esclusi quelli di non negatività) ci sono?",
                    en: "A company makes $r = " + rr + "$ products, each with a unit profit, using $s = " + ss + "$ resources available in limited quantity; every unit of product consumes a known quantity of every resource. In the LP production planning model, with one variable for the quantity produced of every product, how many variables and how many constraints (excluding non-negativity) are there?" };
          spieg = { it: "Una variabile $x_j$ per prodotto: $r = " + rr + "$. Un vincolo per risorsa (consumo non superiore alla disponibilità): $s = " + ss + "$.",
                    en: "One variable $x_j$ per product: $r = " + rr + "$. One constraint per resource (consumption not exceeding availability): $s = " + ss + "$." };
        }
        var mk = function (p) { return opz("$" + p[0] + "$ variabili e $" + p[1] + "$ vincoli", "$" + p[0] + "$ variables and $" + p[1] + "$ constraints", p.join(",")); };
        return impacchetta(rng, lingua, mk(corr), d.map(mk), testo, spieg, { tipo: tipo, parametri: parametri });
      });
    }
  });

  // ======================================================================
  // 21. (complessa) Simplesso completo (cap. 6)
  function opzPunto(x, z) {
    var s = "$\\tilde x_1 = " + q(x[0]).tex() + ",~ \\tilde x_2 = " + q(x[1]).tex() + ",~ z(\\, LP \\,) = " + q(z).tex() + "$";
    return opz(s, s, chiave(x) + "|" + q(z).key());
  }
  // soluzioni di base (ammissibili e non) di un problema con n = 2 e m = 3 in forma canonica
  function soluzioniBase(A, b, c) {
    var righe = A.map(function (r, i) { return { a: r, b: b[i] }; });
    righe.push({ a: [-1, 0], b: 0 }); righe.push({ a: [0, -1], b: 0 });
    var out = [];
    for (var i = 0; i < righe.length; i++) for (var k = i + 1; k < righe.length; k++) {
      var M = [righe[i].a, righe[k].a];
      var d = M[0][0] * M[1][1] - M[0][1] * M[1][0]; if (d === 0) continue;
      var x = [new Q(righe[i].b * M[1][1] - M[0][1] * righe[k].b, d), new Q(M[0][0] * righe[k].b - righe[i].b * M[1][0], d)];
      var amm = x[0].sgn() >= 0 && x[1].sgn() >= 0 && A.every(function (r, t) { return q(r[0]).mul(x[0]).add(q(r[1]).mul(x[1])).cmp(b[t]) <= 0; });
      var z = x[0].mul(c[0]).add(x[1].mul(c[1]));
      if (!out.some(function (o) { return o.x[0].eq(x[0]) && o.x[1].eq(x[1]); })) out.push({ x: x, z: z, amm: amm });
    }
    return out;
  }
  function passiTex(lang, storia, duale) {
    var s = storia.map(function (h) {
      if (duale) return lang === "it" ? "esce $" + xv(h.r) + "$, entra $" + xv(h.p) + "$" : "$" + xv(h.r) + "$ leaves, $" + xv(h.p) + "$ enters";
      return lang === "it" ? "entra $" + xv(h.p) + "$, esce $" + xv(h.r) + "$" : "$" + xv(h.p) + "$ enters, $" + xv(h.r) + "$ leaves";
    });
    return s.join("; ");
  }

  // ======================================================================
  // 22. (complessa) Soluzione duale ottima dopo il simplesso (cap. 9)

  // ======================================================================
  // 23. (complessa) Simplesso duale completo (cap. 10)

  // ======================================================================
  // 24. (complessa) Fase 0 e simplesso: esito del problema (cap. 8)
  function fase0(A, b, c) {
    var n = c.length, m = A.length;
    // dizionario del problema ausiliario: x_i = b_i - sum a_ij x_j + x_0
    var D = { B: range(n + 1, n + m), N: [0].concat(range(1, n)), b: {}, a: {}, c: {}, z: q(0) };
    for (var i = 0; i < m; i++) {
      D.b[n + 1 + i] = q(b[i]); D.a[n + 1 + i] = { 0: q(-1) };
      for (var j = 0; j < n; j++) D.a[n + 1 + i][j + 1] = q(A[i][j]);
    }
    D.c[0] = q(-1); for (var j2 = 1; j2 <= n; j2++) D.c[j2] = q(0);
    var r = D.B[0]; D.B.forEach(function (ii) { if (D.b[ii].cmp(D.b[r]) < 0) r = ii; });
    var bSpec = D.b[r];
    D = pivot(D, 0, r);
    var ris = simplesso(D);
    if (ris.stato !== "ottimo") return { stato: "errore" };
    D = ris.D;
    if (D.z.sgn() < 0) return { stato: "inammissibile", w: D.z, bSpec: bSpec };
    if (D.B.indexOf(0) >= 0) {
      var jj = null; D.N.forEach(function (j) { if (jj === null && !D.a[0][j].isZero()) jj = j; });
      D = pivot(D, jj, 0);
    }
    var E = { B: D.B.slice(), N: D.N.filter(function (j) { return j !== 0; }), b: {}, a: {}, c: {}, z: q(0) };
    var cc = function (j) { return j <= n ? q(c[j - 1]) : q(0); };
    E.B.forEach(function (ii) { E.b[ii] = D.b[ii]; E.a[ii] = {}; E.N.forEach(function (j) { E.a[ii][j] = D.a[ii][j]; }); });
    E.z = q(0); E.B.forEach(function (ii) { E.z = E.z.add(cc(ii).mul(E.b[ii])); });
    E.N.forEach(function (j) { var v = cc(j); E.B.forEach(function (ii) { v = v.sub(cc(ii).mul(E.a[ii][j])); }); E.c[j] = v; });
    var r2 = simplesso(E);
    return { stato: r2.stato === "ottimo" ? "ottimo" : (r2.stato === "illimitato" ? "illimitato" : "errore"), D0: E, D: r2.D, bSpec: bSpec, w: q(0) };
  }
  // ======================================================================
  // ARRICCHIMENTO (6 novembre 2026): almeno due generatori per capitolo con calcoli
  // ======================================================================

  function opzVal(v) { v = q(v); return opz("$" + v.tex() + "$", "$" + v.tex() + "$", v.key()); }
  function insiemeIdx(arr, lang) {
    if (!arr.length) return lang === "it" ? "nessun vincolo" : "no constraint";
    var parola = lang === "it" ? (arr.length === 1 ? "solo il vincolo " : "i vincoli ") : (arr.length === 1 ? "only constraint " : "constraints ");
    var e = arr.map(String);
    var lista = e.length === 1 ? e[0] : e.slice(0, -1).join(", ") + (lang === "it" ? " e " : " and ") + e[e.length - 1];
    return parola + lista;
  }

  // ----------------------------------------------------------------------
  // 25. Variazione di una funzione lineare lungo una direzione (cap. 1)

  // ----------------------------------------------------------------------
  // 26. Vincoli attivi in un punto di un poliedro (cap. 2)

  // ----------------------------------------------------------------------
  // 27. Problema LP in una variabile (cap. 3)

  // ----------------------------------------------------------------------
  // 28. Proprietà dei problemi LP: costante additiva e fattore di scala (cap. 3)

  // ----------------------------------------------------------------------
  // geometria di un problema con due variabili: vertici, ammissibilità, raggi
  function vertici2(A, b, versi) {
    var righe = A.map(function (r, i) { return { a: r, b: b[i] }; });
    righe.push({ a: [1, 0], b: 0 }); righe.push({ a: [0, 1], b: 0 });
    var amm = function (x) {
      if (x[0].sgn() < 0 || x[1].sgn() < 0) return false;
      for (var i = 0; i < A.length; i++) {
        var v = x[0].mul(A[i][0]).add(x[1].mul(A[i][1]));
        if (versi[i] === "le" ? v.cmp(b[i]) > 0 : v.cmp(b[i]) < 0) return false;
      }
      return true;
    };
    var tuttiP = [], vert = [];
    for (var i = 0; i < righe.length; i++) for (var k = i + 1; k < righe.length; k++) {
      var M = [righe[i].a, righe[k].a], d = M[0][0] * M[1][1] - M[0][1] * M[1][0];
      if (d === 0) continue;
      var x = [new Q(righe[i].b * M[1][1] - M[0][1] * righe[k].b, d), new Q(M[0][0] * righe[k].b - righe[i].b * M[1][0], d)];
      tuttiP.push(x);
      if (amm(x) && !vert.some(function (o) { return o[0].eq(x[0]) && o[1].eq(x[1]); })) vert.push(x);
    }
    return { vert: vert, tutti: tuttiP, amm: amm };
  }
  function illimitato2(A, versi, c) {
    // raggi estremi del cono di recessione {d >= 0, A_i d <= 0 (le) o >= 0 (ge)}
    var cand = [[1, 0], [0, 1]];
    A.forEach(function (r) { if (r[0] * r[1] < 0) cand.push([Math.abs(r[1]), Math.abs(r[0])]); });
    return cand.some(function (dd) {
      var ok = A.every(function (r, i) { var v = r[0] * dd[0] + r[1] * dd[1]; return versi[i] === "le" ? v <= 0 : v >= 0; });
      return ok && c[0] * dd[0] + c[1] * dd[1] > 0;
    });
  }

  // ----------------------------------------------------------------------
  // 29. Esito di un problema LP con due variabili (cap. 5)

  // ----------------------------------------------------------------------
  // 30. Soluzioni ottime multiple: pivot su una colonna con costo ridotto nullo (cap. 7)

  // ----------------------------------------------------------------------
  // forma standard 2 x 4 con termini noti (simplesso rivisto e duale rivisto)
  function standard2b(rng, bmin, bmax) {
    var S = standard2(rng);
    S.b = [ri(rng, bmin, bmax), ri(rng, bmin, bmax)];
    return S;
  }
  function stdTexB(lang, S) {
    return "${\\boldsymbol A} = " + matrice(S.A) + "$, ${\\boldsymbol b} = " + vett(S.b) + "'$, ${\\boldsymbol c}' = " + vett(S.c) + "$";
  }
  function datiBase(S, B) {
    var AB = [[S.A[0][B[0] - 1], S.A[0][B[1] - 1]], [S.A[1][B[0] - 1], S.A[1][B[1] - 1]]];
    var Ai = inv2(AB); if (!Ai) return null;
    var bb = [Ai[0][0].mul(S.b[0]).add(Ai[0][1].mul(S.b[1])), Ai[1][0].mul(S.b[0]).add(Ai[1][1].mul(S.b[1]))];
    var cB = [q(S.c[B[0] - 1]), q(S.c[B[1] - 1])];
    var pi = [cB[0].mul(Ai[0][0]).add(cB[1].mul(Ai[1][0])), cB[0].mul(Ai[0][1]).add(cB[1].mul(Ai[1][1]))];
    var N = [1, 2, 3, 4].filter(function (j) { return B.indexOf(j) < 0; });
    var cb = {}; N.forEach(function (j) { cb[j] = q(S.c[j - 1]).sub(pi[0].mul(S.A[0][j - 1])).sub(pi[1].mul(S.A[1][j - 1])); });
    return { AB: AB, Ai: Ai, bb: bb, pi: pi, N: N, cb: cb };
  }

  // ----------------------------------------------------------------------
  // 31. Simplesso rivisto: colonna d e test dei rapporti (cap. 11)

  // ----------------------------------------------------------------------
  // 32. Simplesso duale rivisto: riga e colonna pivot (cap. 12)

  // ----------------------------------------------------------------------
  // 33. Metodo primale-duale: scarti duali e insieme ammesso (cap. 13)

  // ----------------------------------------------------------------------
  // 34. Dimensione di un poliedro in forma standard (cap. 15)
  function rango(M) {
    var R = M.map(function (r) { return r.map(q); }), rk = 0, nc = R[0].length;
    for (var col = 0; col < nc && rk < R.length; col++) {
      var piv = -1; for (var i = rk; i < R.length; i++) if (!R[i][col].isZero()) { piv = i; break; }
      if (piv < 0) continue;
      var t = R[rk]; R[rk] = R[piv]; R[piv] = t;
      for (var i2 = 0; i2 < R.length; i2++) if (i2 !== rk && !R[i2][col].isZero()) {
        var f = R[i2][col].div(R[rk][col]);
        R[i2] = R[i2].map(function (v, k) { return v.sub(f.mul(R[rk][k])); });
      }
      rk++;
    }
    return rk;
  }

  // ----------------------------------------------------------------------
  // 35. Soluzione di base e vertice (cap. 15)

  // ----------------------------------------------------------------------
  // 36. Modello di pianificazione della produzione da una tabella di dati (cap. 16)
  G.push({
    id: "lpm-g-modello-produzione", livello: "media", capitolo: "techniques",
    link: linkT("02"),
    genera: function (rng, lingua) {
      return tenta(function () {
        var c = [ri(rng, 2, 9), ri(rng, 2, 9)], A = [[ri(rng, 1, 5), ri(rng, 1, 5)], [ri(rng, 1, 5), ri(rng, 1, 5)]], b = [ri(rng, 10, 40), ri(rng, 10, 40)];
        if (c[0] === c[1] || A[0][1] === A[1][0] || A[0][0] === A[1][1] && A[0][1] === A[1][0]) return null;
        if (!righeBuone(A)) return null;
        var At = [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
        var mod = function (lang, senso, cc, M, verso) { return lpTex(lang, senso, cc, M, [verso, verso], b); };
        var mk = function (senso, cc, M, verso) { return opz(mod("it", senso, cc, M, verso), mod("en", senso, cc, M, verso), JSON.stringify([senso, cc, M, verso])); };
        var giusta = mk("max", c, A, "le");
        var cand = [mk("max", c, At, "le"), mk("min", c, A, "ge"), mk("max", [c[1], c[0]], A, "le"), mk("max", c, A, "ge")];
        var sb = scegli(cand, giusta, 3); if (!sb) return null;
        var tab = function (lang) {
          var R = lang === "it" ? ["profitto unitario", "risorsa 1 per unità", "risorsa 2 per unità"] : ["unit profit", "resource 1 per unit", "resource 2 per unit"];
          return "$\\begin{array}{l|cc} & \\text{" + (lang === "it" ? "prodotto 1" : "product 1") + "} & \\text{" + (lang === "it" ? "prodotto 2" : "product 2") + "} \\\\ \\hline \\text{" + R[0] + "} & " + c[0] + " & " + c[1] + " \\\\ \\text{" + R[1] + "} & " + A[0][0] + " & " + A[0][1] + " \\\\ \\text{" + R[2] + "} & " + A[1][0] + " & " + A[1][1] + " \\end{array}$";
        };
        var testo = {
          it: "Un'azienda fabbrica due prodotti usando due risorse, disponibili in quantità $" + b[0] + "$ (risorsa 1) e $" + b[1] + "$ (risorsa 2). Profitti e consumi per unità di prodotto sono: " + tab("it") + ". Con $x_j \\ge 0$ unità del prodotto $j$, quale modello LP massimizza il profitto totale?",
          en: "A company makes two products using two resources, available in quantities $" + b[0] + "$ (resource 1) and $" + b[1] + "$ (resource 2). Profits and consumptions per unit of product are: " + tab("en") + ". With $x_j \\ge 0$ units of product $j$, which LP model maximizes the total profit?"
        };
        var spieg = {
          it: "Funzione obiettivo: profitto totale $" + lin(c, ["x_1", "x_2"]) + "$ da massimizzare. Un vincolo per risorsa: il consumo $\\sum_j a_{ij} x_j$ (riga $i$ della tabella, non colonna) non supera la disponibilità $b_i$.",
          en: "Objective function: total profit $" + lin(c, ["x_1", "x_2"]) + "$ to maximize. One constraint per resource: the consumption $\\sum_j a_{ij} x_j$ (row $i$ of the table, not column) does not exceed the availability $b_i$."
        };
        return impacchetta(rng, lingua, giusta, sb, testo, spieg, { c: c, A: A, b: b });
      });
    }
  });
  // ====================================================================== copertura dettagliata (7 novembre 2026)
  // 19 generatori nuovi; gemelli in verifica/verifica_generatori.py (sezione «copertura dettagliata»)
  function L2(it, en) { return { it: it, en: en }; }
  function oV(v) { v = q(v); var s = "$" + v.tex() + "$"; return opz(s, s, v.key()); }

  // ---------------------------------------------------------------- 7. colonna con la regola di Bland

  // ---------------------------------------------------------------- 8. pivot speciale della Fase 0

  // ---------------------------------------------------------------- 9. bound dalla dualità debole

  // ---------------------------------------------------------------- 10. riga e colonna del pivot duale
  var DS_PRE = L2("Nell'algoritmo del simplesso duale per un problema in forma standard di massimo, con dizionario $x_i = \\bar b_i - \\sum_j \\bar a_{ij} x_j$, base duale ammissibile ($\\bar c_j \\le 0$) e regola di Bland (riga: indice minimo con $\\bar b_i < 0$; colonna: rapporto minimo $\\bar c_j / \\bar a_{rj}$ fra i $j$ con $\\bar a_{rj} < 0$, a parità indice minimo), ",
    "In the dual simplex algorithm for a problem in standard maximization form, with dictionary $x_i = \\bar b_i - \\sum_j \\bar a_{ij} x_j$, a dual feasible basis ($\\bar c_j \\le 0$) and Bland's rule (row: smallest index with $\\bar b_i < 0$; column: minimum ratio $\\bar c_j / \\bar a_{rj}$ over $j$ with $\\bar a_{rj} < 0$, ties by smallest index), ");

  // ---------------------------------------------------------------- 16. modellazione: min-max, rapporti, scorte
  G.push({
    id: "lpm-g-mod-minmax", livello: "facile", capitolo: "techniques", link: linkT("06"),
    genera: function (rng, lingua) {
      return tenta(function () {
        var f = [[ri(rng, 1, 5), ri(rng, -3, 4)], [ri(rng, -3, 4), ri(rng, 1, 5)]];
        if (!righeBuone(f)) return null;
        var mm = rng() < 0.5;   // true: min max; false: max min
        var e1 = lin(f[0], xs(2)), e2 = lin(f[1], xs(2));
        var mk = function (senso, verso, v) {
          var s = "$\\" + senso + "\\ w$, $w " + verso + " " + e1 + "$, $w " + verso + " " + e2 + "$";
          return opz(s, s, v);
        };
        var giusta = mm ? mk("min", "\\ge", "min-ge") : mk("max", "\\le", "max-le");
        var sb = mm ? [mk("min", "\\le", "min-le"), mk("max", "\\ge", "max-ge"), mk("max", "\\le", "max-le")] : [mk("max", "\\ge", "max-ge"), mk("min", "\\le", "min-le"), mk("min", "\\ge", "min-ge")];
        var obj = mm ? "\\min\\ \\max\\{" + e1 + ",~ " + e2 + "\\}" : "\\max\\ \\min\\{" + e1 + ",~ " + e2 + "\\}";
        var testo = L2("In un modello LP con ${\\boldsymbol x} \\ge {\\boldsymbol 0}$ e altri vincoli lineari, la funzione obiettivo è $" + obj + "$. Con una nuova variabile libera $w$, quale formulazione lineare è equivalente?",
          "In an LP model with ${\\boldsymbol x} \\ge {\\boldsymbol 0}$ and other linear constraints, the objective is $" + obj + "$. With a new free variable $w$, which linear formulation is equivalent?");
        var sp = L2(mm ? "$w$ non deve essere minore di nessuna delle due funzioni; minimizzandolo vale il loro massimo." : "$w$ non deve superare nessuna delle due funzioni; massimizzandolo vale il loro minimo.",
          mm ? "$w$ must not be less than either function; minimizing it gives their maximum." : "$w$ must not exceed either function; maximizing it gives their minimum.");
        return impacchetta(rng, lingua, giusta, sb, testo, sp, { mm: mm ? 1 : 0, f: f });
      });
    }
  });
  G.push({
    id: "lpm-g-mod-rapporto", livello: "facile", capitolo: "techniques", link: linkT("08"),
    genera: function (rng, lingua) {
      return tenta(function () {
        var n = 3, k = ri(rng, 1, 3), g = new Q(ri(rng, 1, 4), 10);
        var corr = [], d1 = [], d2 = [];
        for (var j = 1; j <= n; j++) { var aj = q(j === k ? 1 : 0); corr.push(aj.sub(g)); d1.push(aj.add(g)); d2.push(aj.mul(g).sub(1)); }
        var d3 = []; for (var j2 = 1; j2 <= n; j2++) d3.push(q(j2 === k ? 1 : 0).sub(j2 === k ? g : q(0)));
        var mk = function (v, verso) { var s = "$" + lin(v, xs(n)) + " " + verso + " 0$"; return opz(s, s, chiave(v) + "|" + verso); };
        var giusta = mk(corr, "\\le");
        var sb = scegli([mk(d1, "\\le"), mk(d3, "\\le"), mk(corr, "\\ge"), mk(d2, "\\le")], giusta, 3);
        if (!sb) return null;
        var pct = g.mul(100).tex();
        var testo = L2("In un modello di miscelazione con quantità $x_1, x_2, x_3 \\ge 0$ e $x_1 + x_2 + x_3 > 0$, il materiale $" + k + "$ deve essere al più il $" + pct + "\\%$ del totale: $\\frac{x_{" + k + "}}{x_1 + x_2 + x_3} \\le " + g.tex() + "$. Quale vincolo lineare è equivalente?",
          "In a blending model with quantities $x_1, x_2, x_3 \\ge 0$ and $x_1 + x_2 + x_3 > 0$, material $" + k + "$ must be at most $" + pct + "\\%$ of the total: $\\frac{x_{" + k + "}}{x_1 + x_2 + x_3} \\le " + g.tex() + "$. Which linear constraint is equivalent?");
        var sp = L2("Si moltiplica per il denominatore positivo: $x_{" + k + "} - " + g.tex() + "(x_1 + x_2 + x_3) \\le 0$.",
          "Multiply by the positive denominator: $x_{" + k + "} - " + g.tex() + "(x_1 + x_2 + x_3) \\le 0$.");
        return impacchetta(rng, lingua, giusta, sb, testo, sp, { k: k, g: g.key() });
      });
    }
  });
  G.push({
    id: "lpm-g-mod-scorte", livello: "facile", capitolo: "techniques", link: linkT("05"),
    genera: function (rng, lingua) {
      return tenta(function () {
        var T = 3, d = [], x = [], y = [], y0 = ri(rng, 0, 10), cur = y0, sbagliato = [], cum = [], cc = 0;
        for (var t = 0; t < T; t++) {
          d.push(5 * ri(rng, 2, 8)); x.push(5 * ri(rng, 1, 9));
          cur = cur + x[t] - d[t]; y.push(cur);
          sbagliato.push(x[t] - d[t]); cc += x[t]; cum.push(cc);
        }
        if (y.some(function (v) { return v < 0; })) return null;
        var mk = function (v) { var s = "$" + vett(v) + "$"; return opz(s, s, v.join(",")); };
        var alt = y.map(function (v, t) { return v + d[t]; });
        var sb = scegli([mk(sbagliato), mk(cum), mk(alt), mk(y.map(function (v) { return v - y0; }))], mk(y), 3);
        if (!sb) return null;
        var testo = L2("In un modello multi-periodo con $3$ periodi, $x_t$ è la produzione e $y_t$ la scorta a fine periodo $t$, con scorta iniziale $y_0 = " + y0 + "$ e bilancio $y_{t-1} + x_t = d_t + y_t$. Con domande $d = " + vett(d) + "$ e produzioni $x = " + vett(x) + "$, quanto valgono $(y_1, y_2, y_3)$?",
          "In a multi-period model with $3$ periods, $x_t$ is the production and $y_t$ the inventory at the end of period $t$, with initial inventory $y_0 = " + y0 + "$ and balance $y_{t-1} + x_t = d_t + y_t$. With demands $d = " + vett(d) + "$ and productions $x = " + vett(x) + "$, what are $(y_1, y_2, y_3)$?");
        var sp = L2("$y_t = y_{t-1} + x_t - d_t$, partendo da $y_0 = " + y0 + "$: si ottiene $" + vett(y) + "$.",
          "$y_t = y_{t-1} + x_t - d_t$, starting from $y_0 = " + y0 + "$: we get $" + vett(y) + "$.");
        return impacchetta(rng, lingua, mk(y), sb, testo, sp, { d: d, x: x, y0: y0 });
      });
    }
  });

  // ---------------------------------------------------------------- 13. passo duale del metodo primale-duale

  // ---------------------------------------------------------------- 14. nuova variabile

  // ---------------------------------------------------------------- media: pivot di Bland su un dizionario

  // ---------------------------------------------------------------- media: valori assoluti (mediana)
  G.push({
    id: "lpm-g-mod-assoluti", livello: "media", capitolo: "techniques", link: linkT("07"),
    genera: function (rng, lingua) {
      return tenta(function () {
        var a = ord([ri(rng, 0, 20), ri(rng, 0, 20), ri(rng, 0, 20)]);
        if (a[0] === a[1] || a[1] === a[2]) return null;
        var opt = a[2] - a[0], media = (a[0] + a[1] + a[2]) / 3;
        if (media !== Math.floor(media)) return null;
        var fm = Math.abs(media - a[0]) + Math.abs(media - a[1]) + Math.abs(media - a[2]);
        var sb = scegli([oV(fm), oV(q(0)), oV(q(a[2] - a[1])), oV(q(opt + a[1] - a[0]))], oV(q(opt)), 3);
        if (!sb) return null;
        var testo = L2("Si vuole $\\min\\ |x - " + a[0] + "| + |x - " + a[1] + "| + |x - " + a[2] + "|$ con $x$ reale, linearizzando ogni termine con $w_i \\ge x - a_i$, $w_i \\ge a_i - x$ e $\\min\\ w_1 + w_2 + w_3$. Qual è il valore ottimo del modello LP?",
          "We want $\\min\\ |x - " + a[0] + "| + |x - " + a[1] + "| + |x - " + a[2] + "|$ with real $x$, linearizing each term with $w_i \\ge x - a_i$, $w_i \\ge a_i - x$ and $\\min\\ w_1 + w_2 + w_3$. What is the optimal value of the LP model?");
        var sp = L2("All'ottimo $w_i = |x - a_i|$; la somma delle distanze è minima nella mediana $x = " + a[1] + "$: valore $" + opt + "$ (nella media $x = " + media + "$ vale $" + fm + "$).",
          "At the optimum $w_i = |x - a_i|$; the sum of distances is minimal at the median $x = " + a[1] + "$: value $" + opt + "$ (at the mean $x = " + media + "$ it is $" + fm + "$).");
        return impacchetta(rng, lingua, oV(q(opt)), sb, testo, sp, { a: a });
      });
    }
  });

  // ---------------------------------------------------------------- media: un pivot duale completo
  function DS_EN_PRE() { return DS_PRE.en; }

  // ---------------------------------------------------------------- complessa: problema LP con un vincolo >= (metodo grafico)
  function vertici3(c, R) {    // R: [a1, a2, b] per a1 x1 + a2 x2 <= b (non negatività incluse)
    var V = [];
    for (var i = 0; i < R.length; i++) for (var k = i + 1; k < R.length; k++) {
      var p = R[i], s = R[k], det = p[0] * s[1] - p[1] * s[0];
      if (det === 0) continue;
      var x1 = new Q(p[2] * s[1] - p[1] * s[2], det), x2 = new Q(p[0] * s[2] - p[2] * s[0], det);
      if (R.every(function (r) { return q(r[0]).mul(x1).add(q(r[1]).mul(x2)).cmp(r[2]) <= 0; }) &&
          !V.some(function (v) { return v[0].eq(x1) && v[1].eq(x2); })) V.push([x1, x2]);
    }
    return V;
  }

  // ---------------------------------------------------------------- complessa: un'iterazione del simplesso rivisto

  // ---------------------------------------------------------------- complessa: iterazione primale-duale (aggiornamento di pi)

  // ---------------------------------------------------------------- complessa: intervallo di b_k e nuovo valore ottimo

  // ---------------------------------------------------------------- complessa: trasporto bilanciato 2 x 2
  G.push({
    id: "lpm-g-mod-trasporto", livello: "complessa", capitolo: "techniques", link: linkT("04"),
    genera: function (rng, lingua) {
      return tenta(function () {
        var o = [5 * ri(rng, 2, 8), 5 * ri(rng, 2, 8)], d1 = 5 * ri(rng, 1, 8), d = [d1, o[0] + o[1] - d1];
        if (d[1] <= 0) return null;
        var k = [[ri(rng, 1, 9), ri(rng, 1, 9)], [ri(rng, 1, 9), ri(rng, 1, 9)]];
        // x11 = t, x12 = o1 - t, x21 = d1 - t, x22 = o2 - d1 + t ; 0 <= tutte
        var lo = Math.max(0, d1 - o[1]), hi = Math.min(o[0], d1);
        if (lo >= hi) return null;
        var cost = function (t) { return k[0][0] * t + k[0][1] * (o[0] - t) + k[1][0] * (d1 - t) + k[1][1] * (o[1] - d1 + t); };
        var best = Math.min(cost(lo), cost(hi)), worst = Math.max(cost(lo), cost(hi));
        if (best === worst) return null;
        var greedyMin = cost(Math.floor((lo + hi) / 2));
        var sb = scegli([oV(q(worst)), oV(q(greedyMin)), oV(q(best + 5)), oV(q(k[0][0] * o[0] + k[1][1] * o[1]))], oV(q(best)), 3);
        if (!sb) return null;
        var testo = L2("Problema di trasporto bilanciato: due magazzini con disponibilità $o = " + vett(o) + "$, due clienti con domande $d = " + vett(d) + "$, costi unitari $k_{11} = " + k[0][0] + "$, $k_{12} = " + k[0][1] + "$, $k_{21} = " + k[1][0] + "$, $k_{22} = " + k[1][1] + "$, variabili $x_{ij} \\ge 0$ e vincoli $\\sum_j x_{ij} = o_i$, $\\sum_i x_{ij} = d_j$. Qual è il costo minimo di trasporto?",
          "Balanced transportation problem: two warehouses with availability $o = " + vett(o) + "$, two clients with demands $d = " + vett(d) + "$, unit costs $k_{11} = " + k[0][0] + "$, $k_{12} = " + k[0][1] + "$, $k_{21} = " + k[1][0] + "$, $k_{22} = " + k[1][1] + "$, variables $x_{ij} \\ge 0$ and constraints $\\sum_j x_{ij} = o_i$, $\\sum_i x_{ij} = d_j$. What is the minimum transportation cost?");
        var sp = L2("Con $x_{11} = t$ le altre variabili sono determinate e $t \\in [" + lo + ", " + hi + "]$; il costo è lineare in $t$, quindi il minimo è in un estremo: $" + best + "$.",
          "With $x_{11} = t$ the other variables are determined and $t \\in [" + lo + ", " + hi + "]$; the cost is linear in $t$, so the minimum is at an endpoint: $" + best + "$.");
        return impacchetta(rng, lingua, oV(q(best)), sb, testo, sp, { o: o, d: d, k: k });
      });
    }
  });

  // ---------------------------------------------------------------- complessa: duale ottimo con gli scarti complementari
})();
