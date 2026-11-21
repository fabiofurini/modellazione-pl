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

**[Strumenti](strumenti.md)**

1. Introduzione alla modellazione PL — questa pagina e la [prima pagina](index.md)
2. [Teoria: programmazione lineare](teoria-lp.md) — dualità, prezzi ombra,
   protocollo di sensitività
3. [Solver, modelli lineari](solver-lp.md) — costruire il modello, farlo girare,
   recuperare la soluzione, interpretare l'output

**[Modelli deterministici](modelli-deterministici.md)**

4. [Produzione e scorte multiperiodali](produzione.md) — LP
5. [Ricarica di veicoli elettrici](ricarica-ev.md) — LP
6. [Data Envelopment Analysis](dea.md) — LP e dualità

**[Decisioni sotto incertezza](decisioni-incertezza.md)**

7. [Il Newsvendor e le sue varianti](newsvendor.md) — LP stocastico
8. [VaR e CVaR](var-cvar.md) — LP a scenari
9. [Arbitraggio e prezzatura](arbitraggio.md) — LP e dualità che prezza

**[Ottimizzazione e machine learning](ottimizzazione-ml.md)**

10. [Regressione robusta e quantile](regressione.md) — LP

**Il corso**

11. [Organizzazione del laboratorio](organizzazione.md) — laboratori ed errori da
    evitare

Prerequisito: il modulo [Programmazione lineare](https://fabiofurini.github.io/programmazione-lineare/), in particolare
la dualità e l'analisi di sensitività. I modelli quadratici e non lineari sono nel
modulo [Modellazione PNL](https://fabiofurini.github.io/modellazione-pnl/).

---

Le quattro parti e a che cosa serve ciascuna sono descritte nella
[prima pagina](index.md).
