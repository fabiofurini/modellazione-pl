"""Capitolo 6 — Ricarica intelligente di veicoli elettrici (LP).

Caso di studio: deposito aziendale con 3 furgoni elettrici da ricaricare
nelle 6 ore dalle 0 alle 6; prezzi orari dell'energia; carico di base dell'edificio.

Contenuto:
  1. LP a costo minimo: la ricarica insegue le ore economiche
  2. Peak shaving: minimizzare il picco di prelievo (minimax)
  3. Confronto multiobiettivo costo-picco
  4. Prezzi ombra: capacità di rete e fabbisogno energetico
"""
import gurobipy as gp
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, intestazione, plt, salva_dat, salva_dati,
                   salva_figura)

# ----------------------------------------------------------------------
# 1. DATI
# ----------------------------------------------------------------------
ore = list(range(1, 7))                    # ora t = dalle t-1 alle t (t = 1: dalle 0 alle 1)
# prezzo €/kWh: alto nelle prime ore (coda del picco serale), minimo dalle 3 alle 4
prezzo = pd.Series([0.20, 0.15, 0.11, 0.07, 0.09, 0.13], index=ore)
# carico di base dell'edificio (kW)
base = pd.Series([14.0, 12.0, 10.0, 8.0, 8.0, 10.0], index=ore)

veicoli = ["V1", "V2", "V3"]
# (ora di arrivo, ora di partenza, energia richiesta kWh, potenza max kW)
flotta = {
    "V1": (0, 6, 36, 11),     # collegato tutta la notte
    "V2": (0, 3, 18, 11),     # parte alle 3 per il primo turno
    "V3": (3, 6, 18, 16),     # rientra alle 3 dall'ultimo turno
}
eta = 0.9             # rendimento di carica
C_rete = 30.0         # potenza massima prelevabile dal contatore (kW)

# collegato nell'ora t (dalle t-1 alle t) se è arrivato entro le t-1 e parte alle t o più tardi
disp = {(v, t): 1 if flotta[v][0] < t <= flotta[v][1] else 0
        for v in veicoli for t in ore}

salva_dati(pd.DataFrame({"ora": ore, "prezzo": prezzo, "carico_base": base}), "ev_prezzi_base")
salva_dati(pd.DataFrame([(v, *flotta[v]) for v in veicoli],
                        columns=["veicolo", "arrivo", "partenza", "energia_kWh", "pmax_kW"]),
           "ev_flotta")


def costruisci():
    m = gp.Model("ricarica_ev")
    m.Params.OutputFlag = 0
    x = m.addVars(veicoli, ore, name="x")       # potenza di carica (kW)
    for v in veicoli:
        for t in ore:
            x[v, t].UB = flotta[v][3] * disp[v, t]     # 0 se non collegato
    v_ene = m.addConstrs((eta * gp.quicksum(x[v, t] for t in ore) >= flotta[v][2]
                          for v in veicoli), name="energia")
    v_rete = m.addConstrs((gp.quicksum(x[v, t] for v in veicoli) + base[t] <= C_rete
                           for t in ore), name="rete")
    return m, x, v_ene, v_rete


def profilo(x):
    return pd.Series([sum(x[v, t].X for v in veicoli) for t in ore], index=ore)


# ----------------------------------------------------------------------
# 2. LP COSTO MINIMO
# ----------------------------------------------------------------------
intestazione("LP: costo energetico minimo")
m, x, v_ene, v_rete = costruisci()
m.setObjective(gp.quicksum(prezzo[t] * x[v, t] for v in veicoli for t in ore), GRB.MINIMIZE)
m.optimize()
assert m.Status == GRB.OPTIMAL
prof_costo = profilo(x)
costo_min = m.ObjVal
picco_costo = (prof_costo + base).max()
print(f"Costo di ricarica: {costo_min:.2f} €   picco di prelievo: {picco_costo:.1f} kW "
      f"(limite {C_rete:.0f})")
print("\nPotenza x[v, t] (kW), ore t = 1..6:")
for v in veicoli:
    print(f"  {v}: " + "  ".join(f"{x[v, t].X:5.1f}" if disp[v, t] else "    ." for t in ore))
print("\nPrezzi ombra del fabbisogno (costo marginale di 1 kWh in più per veicolo):")
for v in veicoli:
    print(f"  {v}: {v_ene[v].Pi:.4f} €/kWh")
print("Prezzi ombra della rete (risparmio per 1 kW in più nell'ora t):")
print("  " + "  ".join(f"t={t}: {abs(v_rete[t].Pi):.3f}" for t in ore))

# ----------------------------------------------------------------------
# 3. PEAK SHAVING (minimax) e COMPROMESSO COSTO-PICCO
# ----------------------------------------------------------------------
intestazione("Peak shaving: minimizzare il picco di prelievo")
mp, xp, _, _ = costruisci()
z = mp.addVar(name="picco")
mp.addConstrs((gp.quicksum(xp[v, t] for v in veicoli) + base[t] <= z for t in ore),
              name="def_picco")
mp.setObjective(z, GRB.MINIMIZE)
mp.optimize()
prof_picco = profilo(xp)
costo_picco = sum(prezzo[t] * prof_picco[t] for t in ore)
print(f"Picco minimo possibile: {mp.ObjVal:.1f} kW   costo: {costo_picco:.2f} € "
      f"(+{costo_picco - costo_min:.2f} € rispetto al costo minimo)")

intestazione("Compromesso: costo + w · picco")
compromessi = []
for rho in [0, 0.05, 0.1, 0.15, 0.2, 0.5, 1.0]:
    mc, xc, _, _ = costruisci()
    zc = mc.addVar(name="picco")
    mc.addConstrs((gp.quicksum(xc[v, t] for v in veicoli) + base[t] <= zc for t in ore))
    mc.setObjective(gp.quicksum(prezzo[t] * xc[v, t] for v in veicoli for t in ore)
                    + rho * zc, GRB.MINIMIZE)
    mc.optimize()
    cc = sum(prezzo[t] * xc[v, t].X for v in veicoli for t in ore)
    compromessi.append((rho, cc, zc.X))
    print(f"  w = {rho:4.2f}: costo {cc:6.2f} €, picco {zc.X:6.1f} kW")
salva_dati(pd.DataFrame(compromessi, columns=["rho", "costo", "picco"]), "ev_compromessi")

# ----------------------------------------------------------------------
# 4. SENSITIVITÀ: capacità del contatore
# ----------------------------------------------------------------------
intestazione("Sensitività: capacità della connessione alla rete")
# attenzione: nel vincolo "somma x + base[t] <= C" Gurobi sposta la costante base[t]
# nel termine noto; il RHS memorizzato è C - base[t], quindi va aggiornato così:
for CC in [23, 24, 26, 28, 30, 32, 35]:
    ms, xs_, _, vr = costruisci()
    for t in ore:
        vr[t].RHS = CC - base[t]
    ms.setObjective(gp.quicksum(prezzo[t] * xs_[v, t] for v in veicoli for t in ore),
                    GRB.MINIMIZE)
    ms.optimize()
    esito = f"costo {ms.ObjVal:6.2f} €" if ms.Status == GRB.OPTIMAL else "INAMMISSIBILE"
    print(f"  C_rete = {CC:3d} kW: {esito}")

# ----------------------------------------------------------------------
# 5. FIGURE (dati pgfplots + anteprima matplotlib)
# ----------------------------------------------------------------------
salva_dat(pd.DataFrame({"ora": ore, "prezzo_cent": prezzo * 100, "base": base,
                        "totcosto": base + prof_costo, "totpicco": base + prof_picco}),
          "cap06_profili")
salva_dat(pd.DataFrame(compromessi, columns=["rho", "costo", "picco"]), "cap06_frontiera")
# gradini larghi un'ora per pgfplots (const plot): bordi 0,5; 1,5; ...; 6,5, l'ultimo valore ripetuto
bordi = [t - 0.5 for t in ore] + [ore[-1] + 0.5]


def gradino(serie):
    return list(serie) + [serie.iloc[-1]]


salva_dat(pd.DataFrame({"x": bordi, "base": gradino(base), "totcosto": gradino(base + prof_costo),
                        "totpicco": gradino(base + prof_picco)}), "cap06_gradini")

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8.2, 6.4), sharex=True)
ax1.bar(ore, prezzo * 100, color=GRIGIO, alpha=0.6)
ax1.set_ylabel("prezzo $c_t$ (c€/kWh)")
ax1.set_title("Prezzo orario dell'energia")
# stesse voci, colori e titolo dell'app del laboratorio; legenda sopra il limite del contatore
# una colonna per ora: gradini larghi un'ora, dalle t-1 alle t (bordi come sopra)
ax2.stairs(base, bordi, baseline=None, color=GRIGIO, ls="--", label="carico di base $b_t$")
ax2.stairs(base + prof_costo, bordi, baseline=None, color=TEAL, lw=2, label="costo minimo")
ax2.stairs(base + prof_picco, bordi, baseline=None, color=ARANCIO, lw=2, label="peak shaving")
ax2.axhline(C_rete, color=ROSSO, ls=":", label=f"potenza del contatore $k$ = {C_rete:.0f} kW")
ax2.set_ylim(0, C_rete * 1.45)
ax2.set_xticks(ore); ax2.set_xlabel("ora $t$ (dalle $t-1$ alle $t$)"); ax2.set_ylabel("prelievo totale (kW)")
ax2.set_title("Profilo di prelievo dalla rete")
ax2.legend(fontsize=8, ncol=2, loc="upper right")
salva_figura(fig, "cap06_profili")

comp = pd.DataFrame(compromessi, columns=["rho", "costo", "picco"])
fig, ax = plt.subplots()
ax.plot(comp["picco"], comp["costo"], "-o", color=TEAL)
# i pesi con lo stesso punto (stesso picco e costo) in un'unica etichetta
gruppi = comp.groupby([comp["picco"].round(3), comp["costo"].round(4)], sort=False)
for k, ((pk, cc), g) in enumerate(gruppi):
    pesi = "; ".join(f"{w:.2f}".replace(".", ",") for w in g["rho"])
    ax.annotate(f"$w$ = {pesi}", (pk, cc), textcoords="offset points", xytext=(8, -3 if k == 0 else 4),
                fontsize=8)
ax.set_xlim(comp["picco"].min() - 3, comp["picco"].max() + 6)
ax.set_xlabel("picco di prelievo (kW)")
ax.set_ylabel("costo di ricarica (€)")
ax.set_title("Frontiera costo-picco: ridurre il picco costa poco all'inizio")
salva_figura(fig, "cap06_frontiera")

print("\nFatto: capitolo 6.")
