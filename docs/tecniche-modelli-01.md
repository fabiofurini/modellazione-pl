# Esempio 4.4 — Produzione in orario ordinario e in straordinario

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf) · [:material-gesture-tap: App: Produzione in orario ordinario e in straordinario](laboratorio/produzione-straordinario.md)

**Modello:** simbolico · **Tecniche:** [4.2 Pianificazione della produzione](tecniche-02.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Produzione in orario ordinario e in straordinario"

    Un'azienda produce $r \in \mathbb{Z}_{\ge 1}$ prodotti diversi. Per ogni prodotto $i \in \{1, 2, \dots, r\}$, il valore $w_i \in \mathbb{Q}_{>0}$ è la quantità massima producibile del prodotto, in litri al giorno.  Ogni prodotto può essere ulteriormente trattato e venduto a un prezzo più alto. La quantità massima giornaliera di prodotti, complessivamente, che si può trattare è di $d \in \mathbb{Q}_{> 0}$ litri in orario ordinario e di $e \in \mathbb{Q}_{> 0}$ litri in straordinario. Per ogni prodotto $i \in \{1, 2, \dots, r\}$, il valore $a_i \in \mathbb{Q}_{> 0}$ è il profitto in euro di un litro di prodotto non trattato; i valori $b_i \in \mathbb{Q}_{> 0}$ e $c_i \in \mathbb{Q}_{> 0}$ sono i profitti in euro di un litro di prodotto trattato, rispettivamente, in orario ordinario e in straordinario. L'azienda vuole determinare un piano di produzione giornaliero di profitto massimo che rispetti i vincoli descritti sopra.

**Domande**

1. Scrivere un modello di *programmazione lineare* (LP) per il problema.  Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello.   Quale algoritmo si può usare per trovare una soluzione ottima del modello?

2. Consideriamo ora un'istanza del problema con $r=3$ prodotti. Gli altri dati sono:

    |  | $i=1$ | $i=2$ | $i=3$ |
    |---|---|---|---|
    | $w_i$ | 35 | 30 | 25 |
    | $a_i$ | 3 | 2 | 2 |
    | $b_i$ | 6 | 4 | 4 |
    | $c_i$ | 5 | 3 | 3 |

    | $d$ | $e$ |
    |---|---|
    | 30 | 20 |

    Scrivere il modello LP per questa istanza.

3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

## Svolgimento

1. Introduciamo le seguenti $3 \; r$ variabili non negative:

    $$
    \begin{cases}
    x_i = \text{  litri di prodotto } i \text{ non trattati al giorno}\\[1ex]
    y_i = \text{  litri di prodotto } i \text{ trattati in orario ordinario al giorno}\\[1ex]
    z_i = \text{  litri di prodotto } i \text{ trattati in straordinario al giorno}
    \end{cases}
    \; \forall i \in \{1,2,\dots,r\}.
    $$

    Con queste variabili, un modello LP per il problema è il seguente:

    !!! chiave ""

        <a id="eq-sm1-LP"></a>

        \begin{align*}
        \max ~~ \sum_{i=1}^{r} a_i \;  x_i +  \sum_{i=1}^{r} b_i  \; y_i+  \sum_{i=1}^{r} c_i \;  z_i & & \label{sm1-obj}  \tag{1a}\\[1ex]
        \text{soggetto a} \quad     x_i + y_i + z_i  &\le w_i,       & \forall  i \in \{1,2,\dots,r\},               \label{sm1-cons1}  \tag{1b}\\[1ex]
        \sum_{i=1}^{r}   y_i  &\le d,       &  \label{sm1-cons2}  \tag{1c}\\[1ex]
        \sum_{i=1}^{r}   z_i  &\le e,       &  \label{sm1-cons3}  \tag{1d}\\[1ex]
        x_i                        &\ge  0, & \forall i \in \{1,2,\dots,r\}, \label{sm1-cons4}  \tag{1e}\\[1ex]
        y_i                        &\ge  0, & \forall i \in \{1,2,\dots,r\}, \label{sm1-cons5}  \tag{1f}\\[1ex]
        z_i                        &\ge  0, & \forall i \in \{1,2,\dots,r\}. \label{sm1-cons6} \tag{1g}
        \end{align*}

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione obiettivo lineare $\eqref{sm1-obj}$ massimizza il profitto totale del piano di produzione;

    - i vincoli lineari $\eqref{sm1-cons1}$ garantiscono che, per ogni prodotto, la produzione totale non superi la capacità disponibile ($r$ vincoli lineari);

    - il vincolo lineare $\eqref{sm1-cons2}$ garantisce che la quantità totale di prodotti trattati in orario ordinario non superi la capacità disponibile (un vincolo lineare);

    - il vincolo lineare $\eqref{sm1-cons3}$ garantisce che la quantità totale di prodotti trattati in straordinario non superi la capacità disponibile (un vincolo lineare);

    - i vincoli lineari $\eqref{sm1-cons4}$, $\eqref{sm1-cons5}$ e $\eqref{sm1-cons6}$ definiscono le variabili del modello LP.

    Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

2. Il modello LP [(1)](#eq-sm1-LP) per l'istanza è il seguente:

    $$
    \begin{array}{rrcrcrcrcrcrcrcrcrcr}
    {\max} & {3\,x_{1}} & {+} & {2\,x_{2}} & {+} & {2\,x_{3}} & {+} & {6\,y_{1}} & {+} & {4\,y_{2}} & {+} & {4\,y_{3}} & {+} & {5\,z_{1}} & {+} & {3\,z_{2}} & {+} & {3\,z_{3}} \\[1ex]
    \text{soggetto a} & {x_{1}} &  &  &  &  & {+} & {y_{1}} &  &  &  &  & {+} & {z_{1}} &  &  &  &  & {\le} & {35} \\[1ex]
    &  &  & {x_{2}} &  &  &  &  & {+} & {y_{2}} &  &  &  &  & {+} & {z_{2}} &  &  & {\le} & {30} \\[1ex]
    &  &  &  &  & {x_{3}} &  &  &  &  & {+} & {y_{3}} &  &  &  &  & {+} & {z_{3}} & {\le} & {25} \\[1ex]
    &  &  &  &  &  &  & {y_{1}} & {+} & {y_{2}} & {+} & {y_{3}} &  &  &  &  &  &  & {\le} & {30} \\[1ex]
    &  &  &  &  &  &  &  &  &  &  &  &  & {z_{1}} & {+} & {z_{2}} & {+} & {z_{3}} & {\le} & {20} \\[1ex]
    & {x_{1},} &  & {x_{2},} &  & {x_{3},} &  & {y_{1},} &  & {y_{2},} &  & {y_{3},} &  & {z_{1},} &  & {z_{2},} &  & {z_{3}} & {\ge} & {0}
    \end{array}
    $$

3. Per esempio, ponendo:

    $$
    \bar{x}_{1}=5,~~\bar{x}_{2}=30,~~\bar{x}_{3}=25,~~\bar{y}_{1}=30,~~\bar{y}_{2}=0,~~\bar{y}_{3}=0,~~\bar{z}_{1}=0,~~\bar{z}_{2}=0,~~\bar{z}_{3}=0
    $$

    otteniamo una soluzione ammissibile.   Il valore della funzione obiettivo di questa soluzione ammissibile è:

    $$
    \sum_{i=1}^{r} a_i \; \bar  x_i +  \sum_{i=1}^{r} b_i  \; \bar y_i+  \sum_{i=1}^{r} c_i \;  \bar z_i = 3 \cdot 5 + 2 \cdot 30 + 2 \cdot 25 + 6 \cdot 30 + 4 \cdot 0 + 4 \cdot 0 + 5 \cdot 0 + 3 \cdot 0 + 3 \cdot 0=  305
    $$

    di conseguenza $305$ è un lower bound sul valore ottimo del modello LP [(1)](#eq-sm1-LP). Quindi, per questa istanza, abbiamo:

    $$
    305 ~\le~ z(~LP~)
    $$

4. Usando

    - una variabile duale non negativa $\lambda_i$ per ogni vincolo $\eqref{sm1-cons1}$ ($i \in \{1,2,\dots,r\}$)

    - una variabile duale non negativa $\pi$ per il vincolo $\eqref{sm1-cons2}$

    - una variabile duale non negativa $\varrho$ per il vincolo $\eqref{sm1-cons3}$

    il duale del modello LP [(1)](#eq-sm1-LP) è il seguente:

    !!! chiave ""

        <a id="eq-sm1-DUAL"></a>

        \begin{align*}
        \min  ~~ \sum_{i=1}^{r}  w_i \; \lambda_i + d \; \pi + e \; \varrho & &  \tag{2a}\\[1ex]
        \text{soggetto a}  \quad   \lambda_i  &\ge a_i,       & \forall i \in \{1,2,\dots,r\},  \tag{2b}\\[1ex]
        \lambda_i + \pi  &\ge b_i,       &               \forall i \in \{1,2,\dots,r\},  \tag{2c}\\[1ex]
        \lambda_i + \varrho  &\ge c_i,       &  \forall i \in \{1,2,\dots,r\},  \tag{2d}\\[1ex]
        \lambda_i                        &\ge  0, & \forall i \in \{1,2,\dots,r\},  \tag{2e}\\[1ex]
        \pi &\ge  0, &  \tag{2f}\\[1ex]
        \varrho                        &\ge  0. & \tag{2g}
        \end{align*}

    Il modello duale [(2)](#eq-sm1-DUAL) per l'istanza è il seguente:

    $$
    \begin{array}{rrcrcrcrcrcr}
    {\min} & {35\,\lambda_{1}} & {+} & {30\,\lambda_{2}} & {+} & {25\,\lambda_{3}} & {+} & {30\,\pi} & {+} & {20\,\varrho} \\[1ex]
    \text{soggetto a} & {\lambda_{1}} &  &  &  &  &  &  &  &  & {\ge} & {3} \\[1ex]
    &  &  & {\lambda_{2}} &  &  &  &  &  &  & {\ge} & {2} \\[1ex]
    &  &  &  &  & {\lambda_{3}} &  &  &  &  & {\ge} & {2} \\[1ex]
    & {\lambda_{1}} &  &  &  &  & {+} & {\pi} &  &  & {\ge} & {6} \\[1ex]
    &  &  & {\lambda_{2}} &  &  & {+} & {\pi} &  &  & {\ge} & {4} \\[1ex]
    &  &  &  &  & {\lambda_{3}} & {+} & {\pi} &  &  & {\ge} & {4} \\[1ex]
    & {\lambda_{1}} &  &  &  &  &  &  & {+} & {\varrho} & {\ge} & {5} \\[1ex]
    &  &  & {\lambda_{2}} &  &  &  &  & {+} & {\varrho} & {\ge} & {3} \\[1ex]
    &  &  &  &  & {\lambda_{3}} &  &  & {+} & {\varrho} & {\ge} & {3} \\[1ex]
    & {\lambda_{1},} &  & {\lambda_{2},} &  & {\lambda_{3},} &  & {\pi,} &  & {\varrho} & {\ge} & {0}
    \end{array}
    $$

    Per esempio, ponendo:

    $$
    \bar\pi=0,~~\bar\varrho=0,~~
    $$

    e ponendo:

    $$
    \bar \lambda_1=\max\{3,6,5\}=6,~~\bar \lambda_2=\max\{2,4,3\}=4,~~\bar \lambda_3=\max\{2,4,3\}= 4
    $$

    otteniamo una soluzione duale ammissibile.

    Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

    $$
    \sum_{i=1}^{r}  w_i \; \bar \lambda_i + d \; \bar \pi + e \; \bar \varrho =  35 \cdot 6 + 30 \cdot 4 +25 \cdot 4 +30 \cdot 0 +20 \cdot 0  =  430
    $$

    Di conseguenza $430$ è un upper bound sul valore ottimo del modello. Quindi, per questa istanza, abbiamo:

    $$
    305 ~\le~ z(~LP~) ~\le~  430
    $$

<!-- laboratorio-interattivo: sezione aggiunta per l'app dei nove modelli -->

## Prezzi ombra dell'istanza { #prezzi-ombra }

Il prezzo ombra di un vincolo è la variazione del valore ottimo per un'unità in più del suo termine noto, finché la base ottima non cambia. Per l'istanza di questa pagina (valore ottimo $330$) valgono, calcolati con Gurobi:

| Vincolo | Prezzo ombra |
|---|---|
| produzione massima del prodotto 1 ($w_1$) | $4$ €/L |
| produzione massima del prodotto 2 ($w_2$) | $2$ €/L |
| produzione massima del prodotto 3 ($w_3$) | $2$ €/L |
| trattamento in orario ordinario ($d$) | $2$ €/L |
| trattamento in straordinario ($e$) | $1$ €/L |

## Laboratorio interattivo { #laboratorio-interattivo }

L'app risolve questo modello nel browser, con i dati dell'esempio: i cursori cambiano i dati e il simplesso ricalcola la soluzione ottima. Si apre anche a tutta pagina nel laboratorio interattivo: [Produzione in orario ordinario e in straordinario](laboratorio/produzione-straordinario.md).

<div class="gi gi-capitolo" data-grafico="pl-straordinario"></div>
