# 1. Introduzione alla modellazione PL

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-01-introduzione.pdf)

!!! nota "Prerequisiti"

    - Dal modulo *Programmazione lineare*, [Capitolo 4 «Problemi di programmazione lineare»](https://fabiofurini.github.io/programmazione-lineare/problemi-pl/04-problemi-pl/): la forma di un problema di programmazione lineare: funzione obiettivo, vincoli lineari, domini delle variabili.

!!! chiave "Obiettivi"

    Alla fine di questo capitolo sarai in grado di:

    - descrivere il percorso di ogni capitolo: problema gestionale, modello, Python e solver, interpretazione;

    - usare la notazione del corso per dati, variabili, duali, costi ridotti e scarti;

    - spiegare perché il corso usa solo variabili continue e che cosa se ne guadagna;

    - orientarsi nella mappa dei modelli e nella struttura di ogni capitolo.

## Che cosa faremo

Il corso insegna a usare la programmazione lineare come strumento di *decisione*, non solo
di calcolo. Ogni capitolo parte da un problema gestionale concreto — quanto produrre, come
ricaricare una flotta, quanto è efficiente una filiale, quanto rischio accettare.

Il problema diventa un modello di programmazione lineare, implementato in Python, risolto
con un solver e, soprattutto, *interrogato*: quanto vale un'ora di capacità in più? La
soluzione resiste se i dati cambiano del 5%? Quale compromesso consiglieremmo a un decisore?

!!! tip "La domanda giusta"
    Alla fine di ogni esercitazione la domanda non è soltanto *«qual è l'ottimo?»*, ma
    *«quale decisione suggeriamo e quanto è robusta?»*. Il valore di un modello sta nella
    qualità della raccomandazione che permette di formulare.

## Modelli lineari e sigle usate

Tutti i modelli del corso sono **LP** (*Linear Programming*, programmazione lineare):
obiettivo e vincoli sono funzioni lineari delle variabili. Un LP è sempre un problema
convesso: ogni ottimo locale è anche globale, e la [dualità](teoria-lp.md) vale senza
eccezioni. Le altre sigle sono definite al primo uso nel rispettivo capitolo.

Il prerequisito è il modulo
[Programmazione lineare](https://fabiofurini.github.io/programmazione-lineare/), in
particolare la dualità e l'analisi di sensitività. I modelli con obiettivo quadratico o non
lineare sono nel modulo [Modellazione PNL](https://fabiofurini.github.io/modellazione-pnl/).

## Notazione

In tutto il corso vale la stessa convenzione:

- **scalari e indici**: lettere minuscole in corsivo ($x_{it}$, $b_t$, $\lambda$, $i$, $t$);
- **oggetti numerati**: prodotti, canali, titoli, veicoli, scenari sono numerati e gli indici corrono su insiemi enumerati esplicitamente, $i \in \{1, 2, \dots, n\}$;
- **conteggi**: interi positivi ($n \in \mathbb{Z}_{\ge 1}$); **dati numerici**: valori razionali, $\mathbb{Q}_{> 0}$ o $\mathbb{Q}_{\ge 0}$;
- **vettori**: minuscole in grassetto ($\boldsymbol{x}$), tutti colonna, con $\boldsymbol{a}'\boldsymbol{b}$ il prodotto scalare; **matrici**: maiuscole in grassetto ($\boldsymbol{A}$);
- **grafi**: $G = (N, A)$ con nodi $N$ e archi $A$, gli unici insiemi non enumerati;
- **variabili duali** $\pi_i$, una per vincolo; **costi ridotti** $\bar c_j$; **scarti** $\bar s_i$;
- **soluzioni**: la *barra* indica i valori di una soluzione ammissibile ($\bar x_j$, $\bar\pi_i$), la *tilde* quelli di una soluzione ottima ($\tilde x_j$, $\tilde\pi_i$, $\tilde z$).

In ogni modello le variabili sono introdotte prima della formulazione, i vincoli di non
negatività chiudono il modello e, dopo il modello, un elenco descrive obiettivo e vincoli
famiglia per famiglia, con il numero di vincoli di ciascuna.

## Una scelta di campo: solo variabili continue

Tutti i modelli del corso usano **esclusivamente variabili continue**: niente variabili
binarie o intere. È una scelta deliberata, con tre motivazioni.

1. **Didattica**: con variabili continue valgono la dualità, i prezzi ombra e i costi ridotti, gli strumenti che trasformano una soluzione numerica in una spiegazione economica.
2. **Copertura**: molte decisioni reali sono naturalmente continue: quantità, flussi, quote di portafoglio, potenze, pesi.
3. **Progressione**: gli stessi strumenti — un LP, il suo duale, i prezzi ombra — servono per la produzione, la finanza e la statistica, senza cambiare solver.

## Mappa dei modelli

I capitoli 1–4 formano la parte **Modellazione**: introduzione, richiami, solver e
[tecniche di modellazione](tecniche.md). Seguono i casi applicati:

| Cap. | Applicazione | Classe | Concetto centrale |
|---|---|---|---|
| 5 | [Produzione e scorte multiperiodali](produzione.md) | LP | dualità, capacità |
| 6 | [Ricarica di veicoli elettrici](ricarica-ev.md) | LP | energia, picchi |
| 7 | [Data Envelopment Analysis](dea.md) | LP | efficienza relativa |
| 8 | [Newsvendor e varianti](newsvendor.md) | LP stoc. | decidere prima di sapere |
| 9 | [VaR e CVaR](var-cvar.md) | LP | rischio di coda |
| 10 | [Arbitraggio e prezzatura](arbitraggio.md) | LP | la dualità che prezza |
| 11 | [Regressione robusta e quantile](regressione.md) | LP | stimare con un LP |

## Struttura di ogni capitolo

Ogni capitolo applicativo segue la stessa scaletta in otto passi:

1. **motivazione gestionale**: il problema raccontato come decisione aziendale;
2. **costruzione guidata del modello**: insiemi, parametri, variabili, vincoli e obiettivo, spiegati riga per riga;
3. **esempio numerico svolto a mano**: un'istanza minima risolta con tutti i passaggi;
4. **caso di studio**: un'istanza realistica con dati riproducibili (CSV);
5. **implementazione Python/Gurobi**: il codice completo, commentato;
6. **risultati**: l'output del solver tradotto in linguaggio manageriale;
7. **analisi di sensitività**: prezzi ombra, scenari, trade-off;
8. **esercizi**: dalla verifica alla piccola estensione di ricerca.

!!! warning "I numeri vengono dagli script"
    I numeri di ogni capitolo sono generati dagli script della cartella `python/`:
    `python3 esegui_tutti.py` rigenera dati, tabelle e figure. Se si modificano i dati, i
    numeri vanno rigenerati.

Il percorso essenziale prevede quattro laboratori, descritti in
[Come si lavora con il corso](organizzazione.md).

## In sintesi

!!! chiave "In sintesi"

    - Ogni capitolo va da un problema gestionale a un modello, a Python e al solver; il modello non restituisce solo un numero, va interrogato.

    - La barra indica i valori di una soluzione ammissibile, la tilde quelli di una ottima; $\pi_i$ sono i duali, $\bar c_j$ i costi ridotti, $\bar s_i$ gli scarti.

    - Solo variabili continue, per scelta: dualità, prezzi ombra e costi ridotti valgono allora in ogni modello.

    - Ogni capitolo segue lo stesso schema: motivazione, modello, esempio a mano, caso di studio, codice, risultati, sensitività ed esercizi.
