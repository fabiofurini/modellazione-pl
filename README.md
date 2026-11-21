<h3 align="center">Materiale didattico di
<a href="https://fabiofurini.github.io/">Fabio Furini</a></h3>
<p align="center">
  Professore associato di Ricerca Operativa ·
  <a href="https://www.diag.uniroma1.it/">DIAG</a>, Sapienza Università di Roma ·
  <a href="https://fabiofurini.github.io/">sito personale</a>
</p>

# Modellazione PL

> **L'autore.** Fabio Furini è professore associato al DIAG della Sapienza dal
> settembre 2021. Dottorato in Automatica e Ricerca Operativa all'Università di
> Bologna (2011) e assegno di ricerca fino al 2012; postdoc all'Université
> Paris-13 (2012–2013); dal 2013 al 2019 *Maître de Conférences* all'Université
> Paris-Dauphine. *Habilitation à Diriger des Recherches* in Francia nel 2017 e
> Abilitazione Scientifica Nazionale a professore ordinario in Ricerca Operativa
> nel 2019. Nel 2020 ricercatore CNR presso l'IASI-CNR di Roma.
> Sito personale: <https://fabiofurini.github.io/>

Modelli di programmazione lineare — la dispensa del
corso in versione online, con codice Python/Gurobi, dati e casi di studio.

**📖 Dispensa online: [fabiofurini.github.io/modellazione-pl](https://fabiofurini.github.io/modellazione-pl/)**

**▶️ Notebook eseguibili in Colab: [l'elenco dei capitoli](https://fabiofurini.github.io/modellazione-pl/notebook/)** — girano nel browser, senza installare niente.

## Scarica in PDF

- [Dispensa completa](https://fabiofurini.github.io/modellazione-pl/pdf/dispensa-modellazione-pl.pdf)
- [Slide delle lezioni](https://fabiofurini.github.io/modellazione-pl/materiale/), una per capitolo, nella pagina del materiale

## Indice

Prerequisito: [Programmazione lineare](https://fabiofurini.github.io/programmazione-lineare/) (dualità e analisi di sensitività).
I modelli quadratici e non lineari sono in [Modellazione PNL](https://fabiofurini.github.io/modellazione-pnl/).

**Strumenti**

- [Teoria: programmazione lineare](https://fabiofurini.github.io/modellazione-pl/teoria-lp/) — dualità, scarti complementari, prezzi ombra, protocollo di sensitività
- [Solver: modelli lineari](https://fabiofurini.github.io/modellazione-pl/solver-lp/) — costruire il modello, farlo girare, leggere e interpretare la soluzione

**Modelli deterministici**

- [Produzione e scorte multiperiodali](https://fabiofurini.github.io/modellazione-pl/produzione/) — LP
- [Ricarica di veicoli elettrici](https://fabiofurini.github.io/modellazione-pl/ricarica-ev/) — LP
- [Data Envelopment Analysis](https://fabiofurini.github.io/modellazione-pl/dea/) — LP, l'efficienza relativa e il duale

**Decisioni sotto incertezza**

- [Il Newsvendor e le sue varianti](https://fabiofurini.github.io/modellazione-pl/newsvendor/) — LP stocastico
- [VaR e CVaR](https://fabiofurini.github.io/modellazione-pl/var-cvar/) — LP a scenari
- [Arbitraggio e prezzatura](https://fabiofurini.github.io/modellazione-pl/arbitraggio/) — LP, la dualità che prezza

**Ottimizzazione e machine learning**

- [Regressione robusta e quantile](https://fabiofurini.github.io/modellazione-pl/regressione/) — LP, stimare i parametri

**Il corso**

- [Organizzazione del laboratorio](https://fabiofurini.github.io/modellazione-pl/organizzazione/) — laboratori ed errori da evitare

## Eseguire i modelli

Ogni capitolo ha il suo script in [`python/`](python/) (`lab04`–`lab10`), con i dati
in [`dati/`](dati/):

```bash
python3 -m pip install gurobipy matplotlib pandas scipy
python3 python/esegui_tutti.py     # tutti i modelli: dati, risultati e figure
```

Senza installare niente, ogni capitolo ha il suo notebook in
[`notebooks/`](notebooks/): si apre in Colab dal badge in cima alla pagina del
capitolo (l'elenco completo è [sul sito](https://fabiofurini.github.io/modellazione-pl/notebook/))
e gira nel browser. I notebook si generano dagli script — `python3 python/genera_notebook.py` —
quindi il codice del corso resta uno solo.

La licenza `gurobipy` inclusa nel pacchetto pip basta per tutti i modelli del corso;
la licenza accademica gratuita si attiva da [portal.gurobi.com](https://portal.gurobi.com).

## Licenza

- **Testi, figure e dati** (`docs/`, `dati/`): [CC BY 4.0](LICENSE) — chiunque può
  riusarli, adattarli e ridistribuirli, anche in altri corsi, citando l'autore.
- **Codice Python** (`python/`): [MIT](LICENSE-CODE), la licenza usuale per il
  software, così il riuso degli script non ha ambiguità.

Per citare il materiale c'è [`CITATION.cff`](CITATION.cff): GitHub ne ricava la
voce *Cite this repository*. Le soluzioni degli esercizi non sono pubblicate:
vengono distribuite a lezione.

## English version

The whole course is also available in English:
**[fabiofurini.github.io/lp-modelling](https://fabiofurini.github.io/lp-modelling/)**
([repository](https://github.com/fabiofurini/lp-modelling)).

## Della stessa collana

- [Modellazione MIP](https://fabiofurini.github.io/modellazione-mip/)
- [Analisi Matematica 1](https://fabiofurini.github.io/analisi-matematica-1/)
- [Algebra lineare](https://fabiofurini.github.io/algebra-lineare/)
- [Programmazione lineare](https://fabiofurini.github.io/programmazione-lineare/)
- [Ottimizzazione convessa](https://fabiofurini.github.io/ottimizzazione-convessa/)
- [Algoritmi](https://fabiofurini.github.io/algoritmi/)

---

Materiale didattico di **[Fabio Furini](https://fabiofurini.github.io/)** — [DIAG](https://www.diag.uniroma1.it/), Sapienza Università di Roma.
Le soluzioni degli esercizi vengono distribuite a lezione.
