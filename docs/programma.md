# Programma

<!-- collana-dalla-fascia -->
Ogni capitolo parte da un problema gestionale concreto — quanto produrre, come
ricaricare una flotta, quanto è efficiente una filiale, quanto rischio accettare — lo
trasforma in un modello di programmazione lineare, lo risolve con Gurobi chiamato da Python e, soprattutto, lo
*interroga*: quanto vale un'ora di capacità in più? La soluzione resiste se i dati
cambiano del 5%?

Tutti i modelli si possono eseguire **subito nel browser**: ogni capitolo ha il
suo [notebook che si apre in Colab](notebook.md), senza installare niente.

!!! tip "La domanda giusta"
    Alla fine di ogni esercitazione la domanda non è soltanto *«qual è l'ottimo?»*,
    ma *«quale decisione suggeriamo e quanto è robusta?»*. Tutte le variabili di
    decisione sono **continue** e tutti i modelli sono lineari: la soluzione si
    legge con la dualità, i prezzi ombra e i costi ridotti.
<!-- /collana-dalla-fascia -->

L'elenco completo dei capitoli, nell'ordine in cui si affrontano. Ogni capitolo
ha la sua pagina, il suo script Python e il suo
[notebook che si apre in Colab](notebook.md).

**[Modellazione](modellazione.md)**

1. [Introduzione alla modellazione PL](introduzione.md) — che cosa faremo, notazione,
   struttura dei capitoli
2. [Richiami: programmazione lineare e analisi di sensitività](teoria-lp.md) — dualità,
   prezzi ombra, protocollo di sensitività
3. [Il solver: costruire, risolvere, interpretare](solver-lp.md) — costruire il modello,
   farlo girare, recuperare la soluzione, interpretare l'output
4. [Tecniche di modellazione](tecniche.md) — dalla descrizione al modello, produzione,
   miscelazione, trasporto, più periodi, linearizzazioni

**[Modelli deterministici](modelli-deterministici.md)**

5. [Produzione e scorte multiperiodali](produzione.md) — LP
6. [Ricarica di veicoli elettrici](ricarica-ev.md) — LP
7. [Data Envelopment Analysis](dea.md) — LP e dualità

**[Decisioni sotto incertezza](decisioni-incertezza.md)**

8. [Il Newsvendor e le sue varianti](newsvendor.md) — LP stocastico
9. [VaR e CVaR](var-cvar.md) — LP a scenari
10. [Arbitraggio e prezzatura](arbitraggio.md) — LP e dualità che prezza

**[Ottimizzazione e machine learning](ottimizzazione-ml.md)**

11. [Regressione robusta e quantile](regressione.md) — LP

**Il corso**

12. [Organizzazione del laboratorio](organizzazione.md) — laboratori ed errori da
    evitare

Prerequisito: il modulo [Programmazione lineare](https://fabiofurini.github.io/programmazione-lineare/), in particolare
la dualità e l'analisi di sensitività. I modelli quadratici e non lineari sono nel
modulo [Modellazione PNL](https://fabiofurini.github.io/modellazione-pnl/).

---

Le quattro parti e a che cosa serve ciascuna sono descritte nella
[prima pagina](index.md).
