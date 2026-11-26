# Esempio 4.10 — Produzione e stoccaggio di torte di frutta

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf) · [:material-gesture-tap: App: Produzione e stoccaggio di torte](laboratorio/torte-di-frutta.md)

**Modello:** numerico · **Tecniche:** [4.5 Pianificazione su più periodi](tecniche-05.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Produzione e stoccaggio di torte di frutta"

    Una pasticceria deve pianificare la produzione di torte di frutta per i prossimi quattro giorni, per soddisfare domande giornaliere di 10, 20, 30 e 20 chilogrammi. Parte con 5 chilogrammi in magazzino. La produzione giornaliera è limitata a 30 chilogrammi, e la capacità di stoccaggio alla fine di ogni giorno è di 10 chilogrammi. I costi di produzione al chilogrammo sono, rispettivamente, 10, 20, 30 e 40 euro. Tenere un chilogrammo in magazzino alla fine di un giorno costa il 10% del suo costo di produzione. La pasticceria vuole minimizzare i costi totali di produzione e di mantenimento delle scorte, soddisfacendo tutte le domande e rispettando i vincoli di capacità.

**Domande**

1. Scrivere un modello di ottimizzazione di programmazione lineare per il problema. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

## Svolgimento

!!! nota ""

    Assumiamo che la pasticceria possa produrre una quantità frazionaria qualsiasi di torta di frutta.

1. Introduciamo le seguenti sette variabili decisionali non negative:

    $$
    \begin{cases}
    x_t = \text{kg di torta di frutta prodotti nel giorno } t, & \forall t \in \{1,2,3,4\},\\[1ex]
    s_t = \text{kg di torta di frutta in magazzino alla fine del giorno } t, & \forall t \in \{1,2,3\}.
    \end{cases}
    $$

    Con queste variabili, un modello di programmazione lineare (LP) per il problema è il seguente:

    !!! chiave ""

        $$
        \begin{array}{rrcrcrcrcrcrcrcr}
        {\min} & {10\,x_{1}} & {+} & {20\,x_{2}} & {+} & {30\,x_{3}} & {+} & {40\,x_{4}} & {+} & {s_{1}} & {+} & {2\,s_{2}} & {+} & {3\,s_{3}} \\[0.4ex]
        \text{soggetto a} & {x_{1}} &  &  &  &  &  &  & {-} & {s_{1}} &  &  &  &  & {=} & {10-5} \\[0.4ex]
        &  &  & {x_{2}} &  &  &  &  & {+} & {s_{1}} & {-} & {s_{2}} &  &  & {=} & {20} \\[0.4ex]
        &  &  &  &  & {x_{3}} &  &  &  &  & {+} & {s_{2}} & {-} & {s_{3}} & {=} & {30} \\[0.4ex]
        &  &  &  &  &  &  & {x_{4}} &  &  &  &  & {+} & {s_{3}} & {=} & {20} \\[0.4ex]
        & {x_{1}} &  &  &  &  &  &  &  &  &  &  &  &  & {\le} & {30} \\[0.4ex]
        &  &  & {x_{2}} &  &  &  &  &  &  &  &  &  &  & {\le} & {30} \\[0.4ex]
        &  &  &  &  & {x_{3}} &  &  &  &  &  &  &  &  & {\le} & {30} \\[0.4ex]
        &  &  &  &  &  &  & {x_{4}} &  &  &  &  &  &  & {\le} & {30} \\[0.4ex]
        &  &  &  &  &  &  &  &  & {s_{1}} &  &  &  &  & {\le} & {10} \\[0.4ex]
        &  &  &  &  &  &  &  &  &  &  & {s_{2}} &  &  & {\le} & {10} \\[0.4ex]
        &  &  &  &  &  &  &  &  &  &  &  &  & {s_{3}} & {\le} & {10} \\[0.4ex]
        & {x_{1},} &  & {x_{2},} &  & {x_{3},} &  & {x_{4},} &  & {s_{1},} &  & {s_{2},} &  & {s_{3}} & {\ge} & {0}
        \end{array}
        $$

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione obiettivo lineare minimizza i costi totali di produzione e di mantenimento delle scorte sull'orizzonte di pianificazione di 4 giorni;

    - i primi quattro vincoli lineari garantiscono che, in ogni giorno, la quantità di torta di frutta disponibile, data dalla scorta iniziale e da quanto prodotto durante il giorno, sia pari alla domanda giornaliera dei clienti, tenuto conto di ciò che resta in magazzino alla fine del giorno;

    - gli otto vincoli lineari successivi impongono i limiti giornalieri di capacità produttiva e di stoccaggio;

    - gli ultimi vincoli definiscono le variabili del modello di ottimizzazione.

<!-- laboratorio-interattivo: sezione aggiunta per l'app dei nove modelli -->

## Prezzi ombra dell'istanza { #prezzi-ombra }

Il prezzo ombra di un vincolo è la variazione del valore ottimo per un'unità in più del suo termine noto, finché la base ottima non cambia. Per l'istanza di questa pagina (valore ottimo $1\,910$) valgono, calcolati con Gurobi:

| Vincolo | Prezzo ombra |
|---|---|
| bilancio del giorno 1 ($d_1$) | $10$ €/kg |
| bilancio del giorno 2 ($d_2$) | $20$ €/kg |
| bilancio del giorno 3 ($d_3$) | $30$ €/kg |
| bilancio del giorno 4 ($d_4$) | $40$ €/kg |
| magazzino a fine giorno 1 ($k$) | $-9$ €/kg |
| magazzino a fine giorno 2 ($k$) | $-8$ €/kg |
| magazzino a fine giorno 3 ($k$) | $-7$ €/kg |

Gli altri 4 vincoli hanno prezzo ombra nullo.

## Laboratorio interattivo { #laboratorio-interattivo }

L'app risolve questo modello nel browser, con i dati dell'esempio: i cursori cambiano i dati e il simplesso ricalcola la soluzione ottima. Si apre anche a tutta pagina nel laboratorio interattivo: [Produzione e stoccaggio di torte](laboratorio/torte-di-frutta.md).

<div class="gi gi-capitolo" data-grafico="pl-torte"></div>
