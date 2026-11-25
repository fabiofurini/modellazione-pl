"""Capitolo 9 — VaR e CVaR: modelli lineari e applicazioni (LP a scenari).

Contenuto:
  1. Esempio a 6 scenari: VaR = 12, CVaR = 18,67,
     verificato con la formulazione lineare di Rockafellar-Uryasev
  2. Portafoglio a CVaR minimo: 3 titoli (TEC, UTL, ORO), 10 scenari annui equiprobabili,
     alpha = 0,8 (la coda sono i 2 scenari peggiori), rendimento atteso almeno b = 3%
  3. Frontiera rendimento-CVaR al variare di b, prezzo ombra del vincolo di rendimento
     ed effetto del livello alpha
  4. Scelta dei fornitori a due stadi (2 fornitori, 10 scenari): il costo della resilienza
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, VERDE, intestazione, plt, salva_dat,
                   salva_dati, salva_figura)

# ----------------------------------------------------------------------
# 1. ESEMPIO A 6 SCENARI
# ----------------------------------------------------------------------
intestazione("Esempio a 6 scenari: VaR e CVaR con la formulazione lineare")
perdite = np.array([2.0, 4.0, 5.0, 7.0, 12.0, 20.0])
pi6 = np.full(6, 1 / 6)
alpha = 0.80

# calcolo diretto
cum = np.cumsum(pi6)
var_diretto = perdite[np.searchsorted(cum, alpha)]
print(f"Perdite: {perdite.tolist()}, probabilità 1/6 ciascuna, alpha = {alpha}")
print(f"VaR (quantile): {var_diretto:.2f}")

# formulazione lineare di Rockafellar-Uryasev: min eta + 1/(1-alpha) sum pi_s xi_s
m = gp.Model("cvar6")
m.Params.OutputFlag = 0
eta = m.addVar(lb=-GRB.INFINITY, name="eta")
xi = m.addVars(6, name="xi")
m.addConstrs((xi[s] >= perdite[s] - eta for s in range(6)), name="coda")
m.setObjective(eta + gp.quicksum(pi6[s] * xi[s] for s in range(6)) / (1 - alpha),
               GRB.MINIMIZE)
m.optimize()
print(f"LP di Rockafellar-Uryasev: eta* = {eta.X:.2f} (un VaR), CVaR = {m.ObjVal:.4f}")
print(f"Conto a mano: 12 + (1/0,20)·(1/6)·(20-12) = 12 + 6,67 = 18,67  ✓")
print(f"Valore atteso della perdita: {perdite.mean():.2f} "
      f"→ il CVaR racconta la coda, la media no.")


def var_cvar(perd, alpha):
    """VaR_alpha e CVaR_alpha esatto di k scenari equiprobabili.

    VaR = quantile alpha (la (ceil(alpha*k))-esima perdita in ordine crescente);
    CVaR = VaR + 1/((1-alpha) k) * sum_s max(l_s - VaR, 0), il valore della formula di
    Rockafellar-Uryasev: con perdite uguali al VaR conta esattamente (1-alpha) k scenari.
    """
    ordinate = np.sort(perd)
    k = len(ordinate)
    var_ = ordinate[int(np.ceil(alpha * k - 1e-9)) - 1]
    cvar_ = var_ + np.maximum(ordinate - var_, 0).sum() / ((1 - alpha) * k)
    return var_, cvar_


# ----------------------------------------------------------------------
# 2. PORTAFOGLIO A CVaR MINIMO
# ----------------------------------------------------------------------
intestazione("Portafoglio a CVaR minimo (LP): 3 titoli, 10 scenari")
titoli = ["TEC", "UTL", "ORO"]
# rendimento annuo r_is (%) del titolo i nello scenario s, 10 scenari equiprobabili:
# nello scenario 1 i mercati crollano e l'oro sale; negli scenari 2 e 9 l'oro scende
R = np.array([[-25, -8, 15],
              [5, 2, -10],
              [30, 6, -5],
              [5, 4, 4],
              [0, 5, -3],
              [-5, -6, 8],
              [20, 8, 0],
              [10, 3, 2],
              [25, 7, -6],
              [5, 9, 5]], dtype=float)
k, n = R.shape
dati = pd.DataFrame(R, columns=titoli)
dati.insert(0, "scenario", range(1, k + 1))
salva_dati(dati, "cvar_scenari_rendimenti")
mu = R.mean(axis=0)                       # rendimento atteso m_i (%): 7, 3, 1
alpha_c = 0.80                            # la coda: (1 - 0,8) * 10 = 2 scenari
b_obb = 3.0                               # rendimento atteso minimo richiesto (%)

print(" s  " + "".join(f"{t:>6}" for t in titoli))
for s in range(k):
    print(f"{s + 1:2d}  " + "".join(f"{R[s, i]:6.0f}" for i in range(n)))
print("m_i " + "".join(f"{mu[i]:6.0f}" for i in range(n)) + "   (rendimento atteso, %)")


def porta_cvar(b, alpha=alpha_c):
    """min CVaR_alpha della perdita -R x  soggetto a  rendimento atteso >= b, quote che sommano a 1.

    Restituisce quote, CVaR (valore ottimo) e prezzo ombra del vincolo di rendimento,
    oppure None se nessun portafoglio rende almeno b."""
    m = gp.Model("cvar_min")
    m.Params.OutputFlag = 0
    x = m.addVars(n, name="x")
    eta = m.addVar(lb=-GRB.INFINITY, name="eta")
    xi = m.addVars(k, name="xi")
    m.addConstr(x.sum() == 1, name="bilancio")
    rend = m.addConstr(gp.quicksum(mu[i] * x[i] for i in range(n)) >= b, name="rendimento")
    m.addConstrs((xi[s] >= -gp.quicksum(R[s, i] * x[i] for i in range(n)) - eta
                  for s in range(k)), name="coda")
    m.setObjective(eta + gp.quicksum(xi[s] for s in range(k)) / (k * (1 - alpha)),
                   GRB.MINIMIZE)
    m.optimize()
    if m.Status != GRB.OPTIMAL:
        return None
    return np.array([x[i].X for i in range(n)]), m.ObjVal, rend.Pi


x_ott, cvar_ott, ombra = porta_cvar(b_obb)
perd = -R @ x_ott
var_ott, _ = var_cvar(perd, alpha_c)
print(f"\nalpha = {alpha_c}, b = {b_obb:.0f}%: {n + 1 + k} variabili, {k + 2} vincoli")
print("Quote ottime: " + ", ".join(f"{titoli[i]} {x_ott[i]:.1%}" for i in range(n)))
print(f"{'s':>3} {'perdita %':>10} {'xi_s':>6}")
for s in range(k):
    print(f"{s + 1:3d} {perd[s]:10.2f} {max(perd[s] - var_ott, 0):6.2f}")
print(f"perdita media {perd.mean():.2f}% (rendimento atteso {-perd.mean():.2f}%), "
      f"VaR80 {var_ott:.2f}%, CVaR80 {cvar_ott:.2f}%")
print(f"Prezzo ombra del vincolo di rendimento: {ombra:.4f} "
      f"(un punto di rendimento in più costa {ombra:.2f} punti di CVaR)")
# le perdite in ordine crescente; coda = 1 per i 2 scenari peggiori (a pari merito, l'ultimo in ordine)
ordine = np.argsort(perd, kind="stable")
salva_dat(pd.DataFrame({"posto": range(1, k + 1), "scenario": ordine + 1, "perdita": perd[ordine],
                        "coda": [0] * (k - 2) + [1, 1]}), "cap09_perdite")
salva_dat(pd.DataFrame({"stat": ["media", "VaR", "CVaR"],
                        "valore": [perd.mean(), var_ott, cvar_ott]}), "cap09_soglie")

# ----------------------------------------------------------------------
# 3. FRONTIERA RENDIMENTO-CVaR ED EFFETTO DI ALPHA
# ----------------------------------------------------------------------
intestazione("Frontiera rendimento-CVaR (alpha = 0,8)")
righe = []
for b in np.arange(0, mu.max() + 1e-9, 0.25):
    x, cv, pi = porta_cvar(b)
    righe.append((b, cv, *x, pi))
front = pd.DataFrame(righe, columns=["rend", "cvar", *titoli, "ombra"])
salva_dat(front, "cap09_frontiera")
print(f"{'b':>5} {'CVaR':>7} " + "".join(f"{t:>7}" for t in titoli) + f" {'ombra':>7}")
for r in front.itertuples(index=False):
    if r.rend in (0, 2.5, 3, 3.5, 4.25, 5, 6, 7):
        print(f"{r.rend:5.2f} {r.cvar:7.2f} " + "".join(f"{q:7.1%}" for q in r[2:2 + n]) + f" {r.ombra:7.2f}")
x0, cv0, _ = porta_cvar(0)
print(f"CVaR minimo {cv0:.2f}% con rendimento atteso {mu @ x0:.2f}%: per b sotto questo valore "
      f"il vincolo di rendimento non è attivo (prezzo ombra 0)")
print(f"b = {mu.max() + 0.25:.2f}%: {'inammissibile' if porta_cvar(mu.max() + 0.25) is None else 'ammissibile'} "
      f"(nessun titolo rende più del {mu.max():.0f}%)")

intestazione("Effetto del livello alpha (b = 3%)")
for a in [0.5, 0.6, 0.7, 0.8, 0.9]:
    x, cv, pi = porta_cvar(b_obb, a)
    print(f"alpha = {a:.1f} (coda di {(1 - a) * k:.0f} scenari): CVaR {cv:6.2f}% | "
          + ", ".join(f"{titoli[i]} {x[i]:.1%}" for i in range(n)))

# ----------------------------------------------------------------------
# 4. SCELTA DEI FORNITORI A DUE STADI
# ----------------------------------------------------------------------
intestazione("Fornitori a due stadi: capacità prenotata + ricorso")
# Due fornitori (F1 economico ma fragile, F2 caro ma affidabile) → un mercato.
# 1° stadio: capacità prenotata x_a.  2° stadio, in ogni scenario: acquisti f_as e domanda non servita u_s.
forn = ["F1", "F2"]
c_pren = {"F1": 2.0, "F2": 3.0}         # costo di prenotazione €/unità
c_uso = {"F1": 4.0, "F2": 4.0}          # costo di acquisto €/unità, uguale per i due fornitori
pen = 10.0                              # penalità per unità di domanda non servita
dom_s = np.array([80, 90, 100, 100, 110, 110, 120, 120, 130, 140], dtype=float)
Ss = len(dom_s)
# disponibilità del fornitore fragile: negli scenari 4 e 9 consegna solo metà della capacità
disp_f1 = np.array([1, 1, 1, 0.5, 1, 1, 1, 1, 0.5, 1])
disp = {"F1": disp_f1, "F2": np.ones(Ss)}
alpha_f = 0.80                          # anche qui la coda sono i 2 scenari più costosi
print(f"{Ss} scenari equiprobabili: domanda {dom_s.astype(int).tolist()}, F1 al 50% negli scenari 4 e 9")
print(f"{2 + 3 * Ss} variabili e {3 * Ss} vincoli; con il CVaR {3 + 4 * Ss} e {4 * Ss}")


def duestadi(lam, alpha_c2=alpha_f):
    m = gp.Model("duestadi")
    m.Params.OutputFlag = 0
    x = m.addVars(forn, name="x")
    f = m.addVars(forn, range(Ss), name="f")
    u = m.addVars(range(Ss), name="u")
    for s in range(Ss):
        for a in forn:
            m.addConstr(f[a, s] <= disp[a][s] * x[a])
        m.addConstr(gp.quicksum(f[a, s] for a in forn) + u[s] >= dom_s[s])
    costo1 = gp.quicksum(c_pren[a] * x[a] for a in forn)
    costo2 = {s: gp.quicksum(c_uso[a] * f[a, s] for a in forn) + pen * u[s]
              for s in range(Ss)}
    atteso = costo1 + gp.quicksum(costo2[s] for s in range(Ss)) / Ss
    if lam > 0:
        eta = m.addVar(lb=-GRB.INFINITY)
        xi = m.addVars(range(Ss))
        m.addConstrs((xi[s] >= costo1 + costo2[s] - eta for s in range(Ss)))
        cvar = eta + gp.quicksum(xi[s] for s in range(Ss)) / (Ss * (1 - alpha_c2))
        m.setObjective((1 - lam) * atteso + lam * cvar, GRB.MINIMIZE)
    else:
        m.setObjective(atteso, GRB.MINIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL, m.Status
    tot = np.array([c_pren["F1"] * x["F1"].X + c_pren["F2"] * x["F2"].X
                    + sum(c_uso[a] * f[a, s].X for a in forn) + pen * u[s].X
                    for s in range(Ss)])
    serv = np.array([1 - u[s].X / dom_s[s] for s in range(Ss)])
    return {a: x[a].X for a in forn}, tot, serv


# con r = 1 conterebbe solo la coda: gli acquisti negli altri scenari non sarebbero determinati
righe = []
for lam in [0.0, 0.5, 0.75]:
    cap, tot, serv = duestadi(lam)
    _, cvar_t = var_cvar(tot, alpha_f)
    righe.append((lam, cap["F1"], cap["F2"], tot.mean(), cvar_t, serv.mean()))
    print(f"  r = {lam:4.2f}: prenoto F1 = {cap['F1']:5.1f}, F2 = {cap['F2']:5.1f} | "
          f"costo medio {tot.mean():6.1f}, CVaR80 {cvar_t:6.1f} | servizio medio {serv.mean():.1%}")
    print("          costo per scenario: " + " ".join(f"{c:.0f}" for c in tot))
res2 = pd.DataFrame(righe, columns=["lam", "F1", "F2", "costo_medio", "cvar", "servizio"])
salva_dat(res2, "cap09_duestadi")
print("Il decisore avverso al rischio prenota più capacità dal fornitore affidabile:")
print("paga di più in media, ma taglia la coda degli scenari con domanda non servita.")

# ----------------------------------------------------------------------
# 5. FIGURE
# ----------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.8, 4.0))
ax1.bar(range(1, k + 1), perd[ordine], color=[TEAL] * (k - 2) + [ROSSO] * 2, alpha=0.8)
ax1.set_xticks(range(1, k + 1), [str(s + 1) for s in ordine])
ax1.axhline(0, color=GRIGIO, lw=0.8)
ax1.axhline(perd.mean(), color=VERDE, ls="--", label=f"media {perd.mean():.2f}%")
ax1.axhline(var_ott, color=ARANCIO, ls="-.", label=f"VaR$_{{0,8}}$ {var_ott:.2f}%")
ax1.axhline(cvar_ott, color=ROSSO, ls="-", label=f"CVaR$_{{0,8}}$ {cvar_ott:.2f}%")
ax1.set_xlabel("scenario, in ordine di perdita crescente (in rosso i 2 della coda)")
ax1.set_ylabel("perdita annua del portafoglio (%)")
ax1.set_title(f"Perdite del portafoglio ottimo (b = {b_obb:.0f}%)")
ax1.legend(fontsize=8, loc="upper left")
ax2.plot(front["cvar"], front["rend"], "-o", color=TEAL, ms=4)
ax2.plot([cvar_ott], [b_obb], "o", ms=10, mfc="none", mec=ROSSO, mew=2,
         label=f"b = {b_obb:.0f}%: CVaR {cvar_ott:.2f}%")
ax2.set_xlabel("CVaR$_{0,8}$ della perdita annua (%)")
ax2.set_ylabel("rendimento atteso richiesto b (%)")
ax2.set_title("Frontiera rendimento-CVaR")
ax2.legend(fontsize=8, loc="lower right")
salva_figura(fig, "cap09_perdite_frontiera")

print("\nFatto: capitolo 9.")
