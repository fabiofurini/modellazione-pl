# Esempio 4.11 — Miscelazione di petrolio greggio in una raffineria

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf) · [:material-gesture-tap: App: Miscelazione in una raffineria](laboratorio/raffineria.md)

**Modello:** numerico · **Tecniche:** [4.3 Miscelazione](tecniche-03.md) · [4.8 Rapporti e percentuali](tecniche-08.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Miscelazione di petrolio greggio in una raffineria"

    Una raffineria dispone di 5000 barili di petrolio greggio di tipo 1 e di 10000 barili di petrolio greggio di tipo 2. La raffineria produce e vende due prodotti: benzina e gasolio da riscaldamento. Questi prodotti si ottengono miscelando i due tipi di greggio in proporzioni opportune. Ogni barile di greggio di tipo 1 ha un livello di qualità pari a 10, mentre ogni barile di tipo 2 ha un livello di qualità pari a 5. Per rispettare gli standard di mercato, la benzina deve avere un livello medio di qualità di almeno 8, e il gasolio da riscaldamento un livello medio di qualità di almeno 6. La benzina si vende a 25 dollari al barile, e il gasolio da riscaldamento a 20 dollari al barile. L'obiettivo della raffineria è determinare un piano di produzione che massimizzi il profitto totale rispettando tutti i vincoli.

**Domande**

1. Scrivere un modello di ottimizzazione di programmazione lineare per il problema. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

## Svolgimento

!!! nota ""

    Assumiamo che la raffineria possa miscelare quantità frazionarie qualsiasi di greggio per produrre benzina e gasolio da riscaldamento.

1. Introduciamo le seguenti quattro variabili decisionali non negative:

    $$
    \left\{
    \begin{aligned}
    x_1 &= \text{barili di greggio di tipo 1 usati per la benzina}, \\
    x_2 &= \text{barili di greggio di tipo 2 usati per la benzina}, \\
    y_1 &= \text{barili di greggio di tipo 1 usati per il gasolio da riscaldamento}, \\
    y_2 &= \text{barili di greggio di tipo 2 usati per il gasolio da riscaldamento}.
    \end{aligned}
    \right.
    $$

    Con queste variabili, un modello di programmazione lineare (LP) per il problema è il seguente:

    !!! chiave ""

        $$
        \begin{array}{rrcrcrcrcr}
        {\max} & {25\,x_{1}} & {+} & {25\,x_{2}} & {+} & {20\,y_{1}} & {+} & {20\,y_{2}} \\[1ex]
        \text{soggetto a} & {x_{1}} &  &  & {+} & {y_{1}} &  &  & {\le} & {5000} \\[1ex]
        &  &  & {x_{2}} &  &  & {+} & {y_{2}} & {\le} & {10000} \\[1ex]
        & {2\,x_{1}} & {-} & {3\,x_{2}} &  &  &  &  & {\ge} & {0} \\[1ex]
        &  &  &  &  & {4\,y_{1}} & {-} & {y_{2}} & {\ge} & {0} \\[1ex]
        & {x_{1},} &  & {x_{2},} &  & {y_{1},} &  & {y_{2}} & {\ge} & {0}
        \end{array}
        $$

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione obiettivo lineare massimizza il ricavo totale dalla vendita di benzina e gasolio da riscaldamento;

    - i primi due vincoli lineari impongono i limiti di disponibilità sull'uso totale del greggio, rispettivamente, di tipo 1 e di tipo 2;

    - il terzo vincolo lineare impone il requisito di qualità per la benzina. Garantisce che la qualità media della miscela di greggio usata per produrre benzina sia almeno pari al valore richiesto.

        $$
        \frac{10x_1 + 5x_2}{x_1 + x_2} \ge 8 \quad \iff \quad 10x_1 + 5x_2 \ge 8(x_1 + x_2)
        \quad \iff \quad
        2x_1 - 3x_2 \ge 0
        $$

    - il quarto vincolo lineare impone il requisito di qualità per il gasolio da riscaldamento. Garantisce che la qualità media della miscela di greggio usata per produrre gasolio da riscaldamento sia almeno pari al valore richiesto.

        $$
        \frac{10y_1 + 5y_2}{y_1 + y_2} \ge 6 \quad \iff \quad 10y_1 + 5y_2 \ge 6(y_1 + y_2)
        \quad \iff \quad
        4y_1 - y_2 \ge 0
        $$

    - l'ultimo vincolo definisce le variabili del modello.

<!-- laboratorio-interattivo: sezione aggiunta per l'app dei nove modelli -->

## Laboratorio interattivo { #laboratorio-interattivo }

L'app risolve questo modello nel browser, con i dati dell'esempio: i cursori cambiano i dati e il simplesso ricalcola la soluzione ottima e i prezzi ombra. Si apre anche a tutta pagina nel laboratorio interattivo: [Miscelazione in una raffineria](laboratorio/raffineria.md).

<div class="gi gi-capitolo" data-grafico="pl-raffineria"></div>
