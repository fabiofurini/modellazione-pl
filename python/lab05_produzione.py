"""Capitolo 5 — Produzione e scorte multiperiodali (LP).

Caso di studio: azienda che produce 3 componenti (prodotti 1, 2, 3) su un orizzonte
di 6 mesi con una risorsa condivisa (ore macchina).

Contenuto:
  1. LP a costo minimo con servizio obbligatorio
  2. Prezzi ombra della capacità e analisi dei duali
  3. Sensitività: costo ottimo al variare della capacità
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, VERDE, intestazione, plt, salva_dat, salva_dati,
                   salva_figura)

# ----------------------------------------------------------------------
# 1. DATI
# ----------------------------------------------------------------------
prodotti = ["1", "2", "3"]
mesi = list(range(1, 7))

# domanda (unità/mese): stagionalità crescente con picco nei mesi 4-5
domanda = {
    ("1", 1): 110, ("1", 2): 130, ("1", 3): 150, ("1", 4): 190, ("1", 5): 210, ("1", 6): 160,
    ("2", 1): 70,  ("2", 2): 80,  ("2", 3): 110, ("2", 4): 140, ("2", 5): 150, ("2", 6): 100,
    ("3", 1): 50,  ("3", 2): 55,  ("3", 3): 60,  ("3", 4): 80,  ("3", 5): 95,  ("3", 6): 70,
}
costo_prod = {"1": 12.0, "2": 18.0, "3": 25.0}   # €/unità
costo_giac = {"1": 0.8, "2": 1.2, "3": 1.6}      # €/unità/mese
ore_unit = {"1": 0.9, "2": 1.4, "3": 2.1}        # ore macchina per unità
capacita = {1: 420, 2: 420, 3: 460, 4: 460, 5: 460, 6: 420}  # ore/mese
scorta_iniziale = {"1": 30, "2": 20, "3": 10}

df = pd.DataFrame(
    [(i, t, domanda[i, t], costo_prod[i], costo_giac[i], ore_unit[i], scorta_iniziale[i])
     for i in prodotti for t in mesi],
    columns=["prodotto", "mese", "domanda", "costo_prod", "costo_giac", "ore_unit", "scorta_iniziale"])
salva_dati(df, "produzione_domanda")
salva_dati(pd.DataFrame({"mese": mesi, "capacita_ore": [capacita[t] for t in mesi]}),
           "produzione_capacita")


def costruisci_lp():
    """LP base: minimo costo di produzione + giacenza, servizio obbligatorio."""
    m = gp.Model("produzione_scorte")
    m.Params.OutputFlag = 0
    x = m.addVars(prodotti, mesi, name="x")           # quantità prodotta
    s = m.addVars(prodotti, mesi, name="s")           # scorta a fine mese
    # bilancio delle scorte: s_{i,t-1} + x_it = d_it + s_it
    m.addConstrs(
        ((scorta_iniziale[i] if t == 1 else s[i, t - 1]) + x[i, t] == domanda[i, t] + s[i, t]
         for i in prodotti for t in mesi), name="bilancio")
    # capacità della risorsa condivisa
    v_cap = m.addConstrs(
        (gp.quicksum(ore_unit[i] * x[i, t] for i in prodotti) <= capacita[t]
         for t in mesi), name="capacita")
    m.setObjective(
        gp.quicksum(costo_prod[i] * x[i, t] + costo_giac[i] * s[i, t]
                    for i in prodotti for t in mesi), GRB.MINIMIZE)
    return m, x, s, v_cap


# ----------------------------------------------------------------------
# 2. LP BASE: soluzione e duali
# ----------------------------------------------------------------------
intestazione("LP base: costo minimo con servizio obbligatorio")
m, x, s, v_cap = costruisci_lp()
m.optimize()
assert m.Status == GRB.OPTIMAL
print(f"Costo totale ottimo: {m.ObjVal:,.2f} €")

piano = pd.DataFrame(
    [(i, t, x[i, t].X, s[i, t].X) for i in prodotti for t in mesi],
    columns=["prodotto", "mese", "produzione", "scorta"])
salva_dati(piano, "produzione_piano_ottimo")
print("\nPiano di produzione (unità/mese):")
print(piano.pivot(index="prodotto", columns="mese", values="produzione").round(1))
print("\nScorte a fine mese:")
print(piano.pivot(index="prodotto", columns="mese", values="scorta").round(1))

print("\nVincoli di capacità: utilizzo, prezzo ombra e range di validità")
righe_duali = []
for t in mesi:
    uso = sum(ore_unit[i] * x[i, t].X for i in prodotti)
    c = v_cap[t]
    righe_duali.append((t, uso, capacita[t], c.Pi, c.SARHSLow, c.SARHSUp))
    print(f"  mese {t}: uso {uso:6.1f}/{capacita[t]} ore | "
          f"prezzo ombra {c.Pi:6.3f} €/ora | valido per b_t in [{c.SARHSLow:6.1f}, {c.SARHSUp:6.1f}]")
duali = pd.DataFrame(righe_duali, columns=["mese", "ore_usate", "capacita", "prezzo_ombra",
                                           "rhs_min", "rhs_max"])
salva_dati(duali, "produzione_duali_capacita")

# verifica del prezzo ombra per perturbazione (mese col duale più negativo:
# nella convenzione Gurobi, per un vincolo <= in un problema di minimo Pi <= 0)
t_star = duali.loc[duali["prezzo_ombra"].idxmin(), "mese"]
pi_star = duali["prezzo_ombra"].min()
m2, x2, s2, v2 = costruisci_lp()
v2[t_star].RHS = capacita[t_star] + 1
m2.optimize()
print(f"\nVerifica: +1 ora nel mese {t_star} → costo passa da {m.ObjVal:.2f} a {m2.ObjVal:.2f} "
      f"(variazione {m2.ObjVal - m.ObjVal:+.3f} = prezzo ombra {pi_star:.3f})")

# ----------------------------------------------------------------------
# 3. FIGURE (dati per pgfplots + anteprima matplotlib)
# ----------------------------------------------------------------------
salva_dat(pd.DataFrame({
    "mese": mesi,
    **{f"x{i}": [x[i, t].X for t in mesi] for i in prodotti},
    **{f"s{i}": [s[i, t].X for t in mesi] for i in prodotti},
    **{f"d{i}": [domanda[i, t] for t in mesi] for i in prodotti},
    "domtot": [sum(domanda[i, t] for i in prodotti) for t in mesi],
}), "cap05_piano")

fig = plt.figure(figsize=(10.5, 8.4))
gs = fig.add_gridspec(2, 2, height_ratios=[1, 1], hspace=0.42, wspace=0.28)
ax1 = fig.add_subplot(gs[0, :])           # 1. ore macchina a_i x_it impilate e capacità b_t
ax2 = fig.add_subplot(gs[1, 0])           # 2. produzione x_it e domanda d_it per prodotto
ax3 = fig.add_subplot(gs[1, 1])           # 3. scorte s_it
colori = {i: c for i, c in zip(prodotti, [TEAL, ROSSO, VERDE])}
sotto = np.zeros(len(mesi))
for i in prodotti:
    ore_i = np.array([ore_unit[i] * x[i, t].X for t in mesi])
    ax1.bar(mesi, ore_i, bottom=sotto, width=0.6, color=colori[i], label=f"prodotto {i}: ore macchina $a_{i} x_{{{i}t}}$")
    sotto += ore_i
for k, t in enumerate(mesi):
    ax1.hlines(capacita[t], t - 0.4, t + 0.4, colors=ROSSO, linestyles="--", lw=1.8,
               label="capacità $b_t$ (ore disponibili)" if k == 0 else None)
    if sotto[k] >= capacita[t] - 1e-6:
        ax1.text(t, capacita[t] + 8, "satura", ha="center", fontsize=8, color=ROSSO)
ax1.plot([], [], " ", label="satura: vincolo di capacità attivo (tutte le ore usate)")      # voce di sola legenda
ax1.set_ylim(0, max(capacita.values()) * 1.12)
ax1.set_xlabel("mese"); ax1.set_ylabel("ore")
ax1.set_title("Ore macchina usate per prodotto e capacità (l'altezza della barra è il totale del mese)")
ax1.legend(fontsize=8, loc="upper left", bbox_to_anchor=(1.01, 1.0))   # fuori a destra: non copre le barre
larg = 0.26
for k, i in enumerate(prodotti):
    ax2.bar([t + (k - 1) * larg for t in mesi], [x[i, t].X for t in mesi], width=larg, color=colori[i],
            label=f"prodotto {i}: produzione $x_{{{i}t}}$")
for k, i in enumerate(prodotti):
    ax2.plot([t + (k - 1) * larg for t in mesi], [domanda[i, t] for t in mesi], "--", marker="D", ms=4,
             color=colori[i], mfc="white", lw=1.2, label=f"prodotto {i}: domanda $d_{{{i}t}}$")
ax2.set_ylim(0, max(domanda.values()) * 1.6)
ax2.set_xlabel("mese"); ax2.set_ylabel("unità")
ax2.set_title("Produzione e domanda per prodotto")
ax2.legend(fontsize=7, ncol=2, loc="upper left")
for i in prodotti:
    ax3.plot(mesi, [s[i, t].X for t in mesi], marker="o", color=colori[i], label=f"prodotto {i}")
ax3.set_xlabel("mese"); ax3.set_ylabel("unità a scorta")
ax3.set_title("Scorte di fine mese")
ax3.legend(fontsize=8)
salva_figura(fig, "cap05_piano_scorte")

# sensitività: costo ottimo al variare della capacità uniforme
intestazione("Sensitività: costo ottimo al variare della capacità")
fattori = np.linspace(0.85, 1.25, 17)
costi = []
for f in fattori:
    ms, xs_, ss_, vs = costruisci_lp()
    for t in mesi:
        vs[t].RHS = capacita[t] * f
    ms.optimize()
    costi.append(ms.ObjVal if ms.Status == GRB.OPTIMAL else np.nan)
    print(f"  capacità x{f:4.2f}: costo {costi[-1]:10.2f} €")

tab_cap = pd.DataFrame({"percento": fattori * 100, "costo": costi}).dropna()
salva_dat(tab_cap, "cap05_capacita")

fig, ax = plt.subplots()
ax.plot(fattori * 100, costi, "-o", color=TEAL)
ax.axvline(100, color=ARANCIO, linestyle="--", label="capacità attuale")
ax.set_xlabel("capacità disponibile (% dell'attuale)")
ax.set_ylabel("costo totale ottimo (€)")
ax.set_title("Curva valore della capacità: convessa e decrescente")
ax.legend()
salva_figura(fig, "cap05_valore_capacita")

print("\nFatto: capitolo 5.")
