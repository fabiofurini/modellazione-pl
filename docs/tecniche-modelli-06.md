# Esempio 4.9 — Scelta dei dolci

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Modello:** numerico · **Tecniche:** [4.2 Pianificazione della produzione](tecniche-02.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Scelta dei dolci"

    Una persona vuole stabilire quali dolci mangiare e in quali quantità il giorno seguente. I dolci disponibili sono torta di frutta e gelato. Secondo le etichette nutrizionali, ogni porzione di torta di frutta pesa 50 grammi, fornisce 120 calorie e contiene 5 grammi di grassi. Ogni porzione di gelato pesa 75 grammi, fornisce 160 calorie e contiene 10 grammi di grassi. La persona vuole consumare almeno 120 grammi di dolci, senza superare 450 calorie e 25 grammi di grassi. Inoltre, a ogni grammo di dolce è assegnato un punteggio di gradimento personale su una scala da 0 (meno gradito) a 10 (più gradito): 8 per la torta di frutta e 9 per il gelato. L'obiettivo della persona è determinare le quantità di dolci da consumare che soddisfino tutti i vincoli nutrizionali e massimizzino il punteggio di gradimento totale.

**Domande**

1. Scrivere un modello di ottimizzazione di programmazione lineare per il problema. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

## Svolgimento

!!! nota ""

    Assumiamo che la persona possa consumare porzioni frazionarie qualsiasi di ciascun dolce.

1. Introduciamo le seguenti due variabili decisionali non negative:

    $$
    \begin{cases}
    x_1 = \text{numero di porzioni di torta di frutta}\\[1ex]
    x_2 = \text{numero di porzioni di gelato}
    \end{cases}
    $$

    Con queste variabili, un modello di programmazione lineare (LP) per il problema è il seguente:

    !!! chiave ""

        $$
        \begin{array}{rrcrcr}
        {\max} & {\overbrace{(8 \cdot 50)}^{=400}\,x_{1}} & {+} & {\overbrace{(9 \cdot 75)}^{=675}\,x_{2}} \\[1ex]
        \text{soggetto a} & {120\,x_{1}} & {+} & {160\,x_{2}} & {\le} & {450} \\[1ex]
        & {5\,x_{1}} & {+} & {10\,x_{2}} & {\le} & {25} \\[1ex]
        & {50\,x_{1}} & {+} & {75\,x_{2}} & {\ge} & {120} \\[1ex]
        & {x_{1},} &  & {x_{2}} & {\ge} & {0}
        \end{array}
        $$

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione obiettivo lineare massimizza il punteggio di gradimento totale;

    - il primo vincolo lineare garantisce che l'apporto calorico totale delle porzioni scelte non superi il limite indicato;

    - il secondo vincolo lineare limita l'apporto totale di grassi al massimo indicato;

    - il terzo vincolo lineare garantisce che la persona consumi almeno il numero indicato di grammi di dolci al giorno;

    - l'ultimo vincolo definisce le variabili del modello.
