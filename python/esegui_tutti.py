"""Esegue in sequenza tutti gli script del corso.

Rigenera: dati (dati/*.csv) e, in FIG = volumes/lecture_notes/dispensa_1_modellazione_pl/figure/,
i dati per le figure pgfplots (FIG/dat/*.csv), i diagrammi TikZ (FIG/*.tex), le anteprime
matplotlib (FIG/*.pdf); poi i notebook dei capitoli (notebooks/*.ipynb).

Uso:  python3 esegui_tutti.py
"""
import subprocess
import sys
import time
from pathlib import Path

SCRIPT = [
    "lab05_produzione.py",
    "lab06_ricarica_ev.py",
    "lab07_dea.py",
    "lab08_newsvendor.py",
    "lab09_var_cvar.py",
    "lab10_arbitraggio.py",
    "lab11_regressione.py",
]

base = Path(__file__).resolve().parent
inizio = time.time()
for s in SCRIPT:
    print(f"\n{'#' * 72}\n# {s}\n{'#' * 72}")
    esito = subprocess.run([sys.executable, str(base / s)], cwd=base)
    if esito.returncode != 0:
        print(f"ERRORE in {s}: interrompo.")
        sys.exit(1)
print(f"\n{'#' * 72}\n# genera_notebook.py\n{'#' * 72}")
esito = subprocess.run([sys.executable, str(base / "genera_notebook.py")], cwd=base)
if esito.returncode != 0:
    print("ERRORE nella generazione dei notebook: interrompo.")
    sys.exit(1)

print(f"\nTutti gli script completati in {time.time() - inizio:.1f} s.")
