"""Capitolo 8 — Il Newsvendor e le sue varianti (LP stocastico a scenari).

Caso di studio: panetteria che decide quanti panettoni artigianali produrre.
Prezzo p = 15 €, costo c = 6 €, recupero v = 2 € → Cu = 9, Co = 4.
Domanda: 10 scenari equiprobabili, nove regolari da 50 a 130 e uno eccezionale da 190.

Contenuto:
  1. Regola del quantile sugli scenari: f* = 9/13 = 0,6923 → q* = 110 (7° scenario)
  2. LP a scenari: coincide con il quantile empirico
  3. Valore della soluzione stocastica (VSS); stabilità del quantile empirico
     (illustrazione a parte, con campioni più grandi da una normale)
  4. Livelli di servizio (cycle service level, fill rate)
  5. Avversione al rischio: frontiera costo medio - CVaR_0,8 (i 2 scenari peggiori)
  6. Multiprodotto con budget condiviso
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB
from scipy import stats

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, intestazione, plt, salva_dat,
                   salva_dati, salva_figura)

p, c, v = 15.0, 6.0, 2.0
Cu, Co = p - c, c - v                 # 9 e 4

# ----------------------------------------------------------------------
# 1. DATI E REGOLA DEL QUANTILE SUGLI SCENARI
# ----------------------------------------------------------------------
intestazione("Regola del quantile sui 10 scenari")
# nove stagioni regolari (da 50 a 130) e una eccezionale (190): la coda destra
dom = np.array([50, 60, 70, 80, 90, 100, 110, 120, 130, 190], dtype=float)
S = len(dom)                          # scenari equiprobabili, w_s = 1/S
salva_dati(pd.DataFrame({"scenario": range(1, S + 1), "domanda": dom}), "newsvendor_scenari")


def costo_atteso(q, d=dom):
    """Costo atteso sugli scenari equiprobabili: media di Co(q-d)^+ + Cu(d-q)^+."""
    return float(np.mean(Co * np.maximum(q - d, 0) + Cu * np.maximum(d - q, 0)))


def quantile_empirico(d, f):
    """Il più piccolo valore d_s con F(d_s) >= f (regola del quantile discreta)."""
    ordinati = np.sort(d)
    return ordinati[int(np.ceil(f * len(d) - 1e-9)) - 1]


f_star = Cu / (Cu + Co)
q_star = quantile_empirico(dom, f_star)
print(f"Frattile critico f* = Cu/(Cu+Co) = {Cu:.0f}/{Cu + Co:.0f} = {f_star:.4f}")
print(f"{'d_s':>5} {'F(d_s)':>7} {'C(d_s)':>8}")
for k, d in enumerate(np.sort(dom), start=1):
    print(f"{d:5.0f} {k / S:7.1f} {costo_atteso(d):8.1f}" + ("   <- q*" if d == q_star else ""))
print(f"q* = il più piccolo d_s con F(d_s) >= {f_star:.4f}: {q_star:.0f} unità "
      f"(media = {dom.mean():.0f}, costo in q = media: {costo_atteso(dom.mean()):.1f} €)")

# il costo atteso è lineare a tratti con i vertici negli scenari: bastano i vertici
qq = np.concatenate([[40.0], np.sort(dom), [200.0]])
salva_dat(pd.DataFrame({"q": qq, "costo": [costo_atteso(q) for q in qq]}), "cap08_costo")

# ----------------------------------------------------------------------
# 2. LP A SCENARI
# ----------------------------------------------------------------------
intestazione(f"LP a scenari (k = {S}: {1 + 2 * S} variabili, {2 * S} vincoli)")


def newsvendor_lp(dom_s, prob=None, lam=0.0, alpha_cvar=0.80):
    """LP: min (1-lam)·costo atteso + lam·CVaR_alpha(costo). lam=0 → risk neutral."""
    Sn = len(dom_s)
    pi = np.full(Sn, 1 / Sn) if prob is None else prob
    m = gp.Model("newsvendor")
    m.Params.OutputFlag = 0
    q = m.addVar(name="q")
    o = m.addVars(Sn, name="o")                 # eccedenza
    u = m.addVars(Sn, name="u")                 # carenza
    m.addConstrs((o[s] >= q - dom_s[s] for s in range(Sn)), name="ecc")
    m.addConstrs((u[s] >= dom_s[s] - q for s in range(Sn)), name="car")
    costo_s = {s: Co * o[s] + Cu * u[s] for s in range(Sn)}
    atteso = gp.quicksum(pi[s] * costo_s[s] for s in range(Sn))
    if lam > 0:
        eta = m.addVar(lb=-GRB.INFINITY, name="eta")
        xi = m.addVars(Sn, name="xi")
        m.addConstrs((xi[s] >= costo_s[s] - eta for s in range(Sn)), name="cvar")
        cvar = eta + gp.quicksum(pi[s] * xi[s] for s in range(Sn)) / (1 - alpha_cvar)
        m.setObjective((1 - lam) * atteso + lam * cvar, GRB.MINIMIZE)
    else:
        m.setObjective(atteso, GRB.MINIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL
    costi = np.array([Co * max(q.X - d, 0) + Cu * max(d - q.X, 0) for d in dom_s])
    return q.X, float(costi @ pi), costi


q_lp, costo_lp, costi_s = newsvendor_lp(dom)
print(f"q ottima dell'LP: {q_lp:.2f}  |  quantile empirico al {f_star:.2%}: {q_star:.2f}")
print(f"Costo atteso: {costo_lp:.2f} €")
print(f"{'s':>3} {'d_s':>5} {'o_s':>5} {'u_s':>5} {'costo':>6}")
for s in range(S):
    print(f"{s + 1:3d} {dom[s]:5.0f} {max(q_lp - dom[s], 0):5.0f} {max(dom[s] - q_lp, 0):5.0f} {costi_s[s]:6.0f}")

# ----------------------------------------------------------------------
# 3. VSS E STABILITÀ
# ----------------------------------------------------------------------
intestazione("Valore della soluzione stocastica (VSS)")
costo_det = costo_atteso(dom.mean())
print(f"Decisione 'ingenua' q = E[D] = {dom.mean():.0f}: costo atteso {costo_det:.2f} €")
print(f"Decisione stocastica q = {q_lp:.0f}      : costo atteso {costo_lp:.2f} €")
print(f"VSS = {costo_det - costo_lp:.2f} € per ciclo di vendita "
      f"({(costo_det - costo_lp) / costo_lp:.1%} del costo)")

# Illustrazione a parte, con un campione suo e più grande dei 10 scenari: se gli scenari
# sono estratti da una domanda normale di media 100 e deviazione standard 20, quanto
# cambia il quantile empirico (cioè la q dell'LP) da un campione all'altro?
intestazione("Stabilità: quantile empirico di k scenari estratti da una normale (100, 20)")
rng = np.random.default_rng(42)
mu_d, sigma_d = 100.0, 20.0
q_teorico = stats.norm.ppf(f_star, mu_d, sigma_d)
print(f"quantile teorico della normale: F^-1({f_star:.4f}) = {q_teorico:.2f}")
righe = []
for Sn in [10, 30, 100, 300, 1000, 3000]:
    stime = [quantile_empirico(np.maximum(rng.normal(mu_d, sigma_d, Sn), 0), f_star)
             for rep in range(30)]
    righe.append((Sn, np.mean(stime), np.std(stime)))
    print(f"  k = {Sn:5d}: q media {np.mean(stime):7.2f}, dev. std tra 30 repliche {np.std(stime):5.2f}")
stab = pd.DataFrame(righe, columns=["S", "q_media", "q_std"])
salva_dat(stab, "cap08_stabilita")

# ----------------------------------------------------------------------
# 4. LIVELLI DI SERVIZIO
# ----------------------------------------------------------------------
intestazione("Livelli di servizio")


def carenza_attesa(q, d=dom):
    return float(np.mean(np.maximum(d - q, 0)))


print(f"{'q':>5} {'P(D<=q)':>8} {'fill rate':>10} {'costo':>7}")
for q in [100, 110, 120, 130, 140, 190]:
    print(f"{q:5.0f} {np.mean(dom <= q):8.0%} {1 - carenza_attesa(q) / dom.mean():10.0%} "
          f"{costo_atteso(q):7.1f}")
for beta in [0.90, 0.95]:
    q_sl = quantile_empirico(dom, beta)
    print(f"  cycle service level {beta:.0%}: q = {q_sl:5.0f} "
          f"(costo +{costo_atteso(q_sl) - costo_lp:6.2f} € rispetto all'ottimo economico)")
# fill rate 95%: la carenza attesa, lineare a tratti e decrescente in q, deve scendere a 0,05·E[D]
vertici = np.sort(dom)
car = np.array([carenza_attesa(q) for q in vertici])
q_fr = float(np.interp(0.05 * dom.mean(), car[::-1], vertici[::-1]))
print(f"  fill rate 95%           : q = {q_fr:5.0f} (costo +{costo_atteso(q_fr) - costo_lp:6.2f} €)")
print(f"  in q* = {q_star:.0f}: fill rate {1 - carenza_attesa(q_star) / dom.mean():.0%}, "
      f"probabilità di non andare in rottura {np.mean(dom <= q_star):.0%}")

# ----------------------------------------------------------------------
# 5. AVVERSIONE AL RISCHIO: frontiera costo-CVaR
# ----------------------------------------------------------------------
alpha_cv = 0.80               # con 10 scenari la coda 1 - alpha = 0,2 sono i 2 scenari più costosi
intestazione(f"Frontiera costo medio - CVaR (alpha = {alpha_cv:.2f}: i {round((1 - alpha_cv) * S)} "
             f"scenari peggiori su {S})")


def var_cvar(costi, alpha):
    """VaR_alpha e CVaR_alpha esatto di k scenari equiprobabili.

    VaR = quantile alpha (il (ceil(alpha*k))-esimo costo in ordine crescente);
    CVaR = VaR + 1/((1-alpha) k) * sum_s max(c_s - VaR, 0), il valore della formula di
    Rockafellar-Uryasev: la media esatta dei (1-alpha) k scenari più costosi.
    """
    ordinati = np.sort(costi)
    k = len(ordinati)
    var_ = ordinati[int(np.ceil(alpha * k - 1e-9)) - 1]
    return var_, var_ + np.maximum(ordinati - var_, 0).sum() / ((1 - alpha) * k)


front = []
for lam in [0, 0.25, 0.5, 0.75, 1.0]:
    q_l, cm, costi_l = newsvendor_lp(dom, lam=lam, alpha_cvar=alpha_cv)
    _, cvar_l = var_cvar(costi_l, alpha_cv)
    front.append((lam, q_l, cm, cvar_l))
    print(f"  r = {lam:4.2f}: q = {q_l:6.1f}, costo medio = {cm:6.2f}, "
          f"CVaR80 = {cvar_l:6.2f}")
front = pd.DataFrame(front, columns=["lam", "q", "costo_medio", "cvar"])
salva_dat(front, "cap08_frontiera_cvar")

# i salti di q*: l'ottimo è un vertice della frontiera e passa al successivo quando
# (1-r)·costo medio + r·CVaR diventa uguale nei due vertici
vertici_f = front.drop_duplicates("q").reset_index(drop=True)
print("Soglie di r in cui q* cambia:")
for a, b in zip(vertici_f.itertuples(), vertici_f.iloc[1:].itertuples()):
    dE, dC = b.costo_medio - a.costo_medio, a.cvar - b.cvar
    print(f"  da q = {a.q:.0f} a q = {b.q:.0f} per r > {dE:.0f}/({dE:.0f} + {dC:.0f}) = {dE / (dE + dC):.3f}")
print("Aumentando r si ordina di più: costa in media, protegge dagli scenari peggiori.")

# ----------------------------------------------------------------------
# 6. MULTIPRODOTTO CON BUDGET CONDIVISO
# ----------------------------------------------------------------------
intestazione("Multiprodotto: 3 dolci sugli stessi 10 scenari, budget di produzione 1250 €")
nomi_p = ["panettone", "pandoro", "torrone"]
# domande negli stessi scenari: le stagioni buone e cattive lo sono per tutti e tre i dolci
dom_m = np.array([dom,
                  [40, 40, 50, 60, 70, 80, 90, 90, 100, 150],
                  [30, 40, 40, 50, 50, 60, 70, 70, 80, 110]], dtype=float)
costi_c = np.array([6.0, 5.0, 4.0])
Cu_m = np.array([9.0, 7.0, 5.0])
Co_m = np.array([4.0, 3.5, 2.5])
budget = 1250.0
P3 = range(3)

mm = gp.Model("newsvendor_multi")
mm.Params.OutputFlag = 0
qm = mm.addVars(3, name="q")
om = mm.addVars(3, S, name="o")
um = mm.addVars(3, S, name="u")
mm.addConstrs((om[i, s] >= qm[i] - dom_m[i, s] for i in P3 for s in range(S)))
mm.addConstrs((um[i, s] >= dom_m[i, s] - qm[i] for i in P3 for s in range(S)))
v_bud = mm.addConstr(gp.quicksum(costi_c[i] * qm[i] for i in P3) <= budget, name="budget")
mm.setObjective(gp.quicksum((Co_m[i] * om[i, s] + Cu_m[i] * um[i, s]) / S
                            for i in P3 for s in range(S)), GRB.MINIMIZE)
mm.optimize()
assert mm.Status == GRB.OPTIMAL
print(f"{'prodotto':>10} | {'q senza budget':>14} | {'q con budget':>12}")
q_solo = [quantile_empirico(dom_m[i], Cu_m[i] / (Cu_m[i] + Co_m[i])) for i in P3]
for i in P3:
    print(f"{nomi_p[i]:>10} | {q_solo[i]:14.1f} | {qm[i].X:12.2f}")
spesa = sum(costi_c[i] * qm[i].X for i in P3)
print(f"Spesa senza budget: {costi_c @ np.array(q_solo):.0f} €  |  con il budget: {spesa:.2f} / {budget:.0f} €")
print(f"Costo atteso: {mm.ObjVal:.2f} €  |  prezzo ombra del budget: {v_bud.Pi:.4f} "
      f"(riduzione del costo atteso per 1 € di budget in più)")

# ----------------------------------------------------------------------
# 7. FIGURE
# ----------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.0))
ax1.plot(qq, [costo_atteso(q) for q in qq], color=TEAL, lw=2, marker="o", ms=3.5,
         label="costo atteso $C(q)$")
ax1.axvline(dom.mean(), color=GRIGIO, ls="--", label=f"media = {dom.mean():.0f}")
ax1.axvline(q_star, color=ROSSO, ls="-.", label=f"$q^*$ = {q_star:.0f} (7° scenario)")
ax1.set_xlabel("quantità ordinata $q$"); ax1.set_ylabel("costo atteso (€)")
ax1.set_title("Sui 10 scenari il minimo è in 110, non alla media")
ax1.legend(fontsize=8, loc="upper right")
ax2.errorbar(stab["S"], stab["q_media"], yerr=stab["q_std"], fmt="-o", color=TEAL,
             capsize=3, label="media ± dev. std su 30 repliche")
ax2.axhline(q_teorico, color=ROSSO, ls="-.", label=f"quantile della normale = {q_teorico:.2f}".replace(".", ","))
ax2.set_xscale("log")
ax2.set_xlabel("numero di scenari $k$ estratti dalla normale (100, 20)"); ax2.set_ylabel("$q$ ottima")
ax2.set_title("Stabilità del quantile empirico (campione a parte)")
ax2.legend(fontsize=8)
salva_figura(fig, "cap08_quantile_stabilita")

fig, ax = plt.subplots()
# come l'app del laboratorio: stessa curva, stesse etichette, legenda nell'angolo vuoto in alto a destra
pesi = "; ".join(f"{w:g}".replace(".", ",") for w in front["lam"])
ax.plot(front["cvar"], front["costo_medio"], "-o", color=TEAL, label=f"frontiera ($r$ = {pesi})")
# i pesi con lo stesso ordine (stesso punto) in un'unica etichetta
# (le etichette dei punti intermedi sopra la spezzata, le altre a destra del punto)
gruppi = list(front.groupby("q", sort=False))
for k, (qv, g) in enumerate(gruppi):
    pesi_g = "; ".join(f"{w:.2f}".replace(".", ",") for w in g["lam"])
    ax.annotate(f"$r$ = {pesi_g}: $q$ = {qv:.0f}", (g["cvar"].iloc[0], g["costo_medio"].iloc[0]),
                textcoords="offset points", xytext=(8, -3 if k in (0, len(gruppi) - 1) else 6), fontsize=8)
dx = front["cvar"].max() - front["cvar"].min()
ax.set_xlim(front["cvar"].min() - 0.06 * dx, front["cvar"].max() + 0.32 * dx)
ax.set_xlabel("CVaR$_{0,8}$ del costo (€)"); ax.set_ylabel("costo medio (€)")
ax.set_title("Frontiera costo medio – rischio di coda")
ax.legend(fontsize=8, loc="upper right")
salva_figura(fig, "cap08_frontiera")

print("\nFatto: capitolo 8.")
