# Esempio 4.12 — Produzione di tre farmaci

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf) · [:material-gesture-tap: App: Produzione di tre farmaci](laboratorio/tre-farmaci.md)

**Modello:** numerico · **Tecniche:** [4.2 Pianificazione della produzione](tecniche-02.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Produzione di tre farmaci"

    Un'azienda farmaceutica produce tre farmaci: farmaco 1, farmaco 2 e farmaco 3, venduti rispettivamente a prezzi unitari di 8 euro, 70 euro e 100 euro. La produzione di 1 unità di farmaco 1 richiede 1 ora di lavoro. La produzione di 1 unità di farmaco 2 richiede 2 ore di lavoro e consuma 2 unità di farmaco 1. La produzione di 1 unità di farmaco 3 richiede 3 ore di lavoro e consuma 1 unità di farmaco 2. Sono disponibili in totale 4000 ore di lavoro. L'obiettivo dell'azienda è determinare un piano di produzione che massimizzi il ricavo totale.

**Domande**

1. Scrivere un modello di ottimizzazione di programmazione lineare per il problema. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

## Svolgimento

!!! nota ""

    Assumiamo che l'azienda possa produrre e vendere quantità frazionarie qualsiasi di ciascun farmaco.

1. Introduciamo le seguenti tre variabili decisionali non negative:

    $$
    \left\{
    \begin{aligned}
    y_1 &= \text{unità di farmaco 1 vendute}, \\
    y_2 &= \text{unità di farmaco 2 vendute}, \\
    y_3 &= \text{unità di farmaco 3 vendute}.
    \end{aligned}
    \right.
    $$

    Con queste variabili, un modello di programmazione lineare (LP) per il problema è il seguente:

    !!! chiave ""

        $$
        \begin{array}{rrcrcrcr}
        {\max} & {8\,y_{1}} & {+} & {70\,y_{2}} & {+} & {100\,y_{3}} \\[1ex]
        \text{soggetto a} & {y_{1}} & {+} & {4\,y_{2}} & {+} & {7\,y_{3}} & {\le} & {4000} \\[1ex]
        & {y_{1},} &  & {y_{2},} &  & {y_{3}} & {\ge} & {0}
        \end{array}
        $$

    Descrizione della funzione obiettivo e dei vincoli:

    - la funzione obiettivo lineare massimizza il ricavo totale: il farmaco 1 rende 8 euro/unità, il farmaco 2 rende 70 euro/unità e il farmaco 3 rende 100 euro/unità.

    - il vincolo lineare limita l'uso totale di lavoro. Ogni unità di farmaco 1 venduta richiede 1 ora di lavoro; ogni unità di farmaco 2 richiede 4 ore (2 unità di farmaco 1 + 1 unità di farmaco 2); e ogni unità di farmaco 3 richiede 7 ore (2 unità di farmaco 1 + 1 unità di farmaco 2 + 1 unità di farmaco 3).

    - l'ultimo vincolo definisce le variabili del modello.

- **Un altro modello LP.**

    Introduciamo le seguenti tre variabili decisionali non negative:

    $$
    \left\{
    \begin{aligned}
    x_1 &= \text{unità di farmaco 1 prodotte}, \\
    x_2 &= \text{unità di farmaco 2 prodotte}, \\
    x_3 &= \text{unità di farmaco 3 prodotte}.
    \end{aligned}
    \right.
    $$

    Con queste variabili, un modello di programmazione lineare (LP) per il problema è il seguente:

    !!! chiave ""

        $$
        \begin{array}{rrcrcrcr}
        {\max} & {8\,x_{1}} & {+} & {54\,x_{2}} & {+} & {30\,x_{3}} \\[1ex]
        \text{soggetto a} & {x_{1}} & {+} & {2\,x_{2}} & {+} & {3\,x_{3}} & {\le} & {4000} \\[1ex]
        & {-x_{1}} & {+} & {2\,x_{2}} &  &  & {\le} & {0} \\[1ex]
        &  & {-} & {x_{2}} & {+} & {x_{3}} & {\le} & {0} \\[1ex]
        & {x_{1},} &  & {x_{2},} &  & {x_{3}} & {\ge} & {0}
        \end{array}
        $$

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione lineare massimizza il ricavo totale generato dalla vendita dei tre farmaci, tenuto conto del consumo interno dei farmaci intermedi. I coefficienti di ciascuna variabile si calcolano considerando solo le unità effettivamente vendute sul mercato.

        - la quantità di farmaco 1 venduta è uguale alla quantità prodotta, $x_1$, meno la quantità usata per produrre il farmaco 2, che richiede 2 unità di farmaco 1 per ogni unità di farmaco 2 prodotta. Quindi, il contributo effettivo al ricavo del farmaco 1 è:

            $$
            8(x_1 - 2x_2)
            $$

        - la quantità di farmaco 2 venduta è uguale alla quantità prodotta, $x_2$, meno la quantità usata per produrre il farmaco 3, che richiede 1 unità di farmaco 2 per ogni unità di farmaco 3 prodotta. Quindi, il contributo effettivo al ricavo del farmaco 2 è:

            $$
            70(x_2 - x_3)
            $$

        - tutte le unità di farmaco 3 si vendono direttamente, quindi il loro contributo al ricavo è semplicemente:

            $$
            100x_3
            $$

        Quindi, abbiamo:

        $$
        \max\; 8(x_1 - 2x_2) + 70(x_2 - x_3) + 100x_3
        \quad
        \iff
        \quad
        \max\; 8x_1 + 54x_2 + 30x_3
        $$

    - il primo vincolo lineare limita l'uso totale di lavoro, garantendo che il tempo totale richiesto da tutte le attività di produzione non superi le ore disponibili;

    - il secondo vincolo lineare garantisce che la produzione di farmaco 1 basti a sostenere la produzione di farmaco 2:

        $$
        x_1 - 2x_2 \ge 0 \iff  2x_2 \le x_1
        $$

    - il terzo vincolo lineare garantisce che la produzione di farmaco 2 basti a sostenere la produzione di farmaco 3:

        $$
        x_2 - x_3 \ge 0 \iff  x_3 \le x_2
        $$

    - l'ultimo vincolo definisce le variabili del modello.

<!-- laboratorio-interattivo: sezione aggiunta per l'app dei nove modelli -->

## Laboratorio interattivo { #laboratorio-interattivo }

L'app risolve questo modello nel browser, con i dati dell'esempio: i cursori cambiano i dati e il simplesso ricalcola la soluzione ottima e i prezzi ombra. Si apre anche a tutta pagina nel laboratorio interattivo: [Produzione di tre farmaci](laboratorio/tre-farmaci.md).

<div class="gi gi-capitolo" data-grafico="pl-farmaci"></div>
