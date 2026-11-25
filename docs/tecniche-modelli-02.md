# Esempio 4.5 — Trasporto dai magazzini ai clienti

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf) · [:material-gesture-tap: App: Trasporto dai magazzini ai clienti](laboratorio/trasporto.md)

**Modello:** simbolico · **Tecniche:** [4.4 Trasporto](tecniche-04.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Trasporto dai magazzini ai clienti"

    Un'azienda ha $s \in \mathbb{Z}_{\ge 1}$ magazzini e trasporta il suo prodotto a $r \in \mathbb{Z}_{\ge 1}$ clienti. Per ogni magazzino $i \in \{1, 2, \dots, s\}$, il valore $d_i \in \mathbb{Q}_{> 0}$ rappresenta la capacità massima, in litri di prodotto alla settimana, che si può trasportare da quel magazzino ai clienti. Per ogni cliente $j \in \{1, 2, \dots, r\}$, il valore $e_j \in \mathbb{Q}_{> 0}$ indica la domanda di quel cliente, in litri di prodotto alla settimana. Per ogni magazzino $i \in \{1, 2, \dots, s\}$ e ogni cliente $j \in \{1, 2, \dots, r\}$, il valore $f_{ij} \in \mathbb{Q}_{> 0}$ rappresenta il costo in euro per trasportare un litro di prodotto dal magazzino $i$ al cliente $j$. L'azienda vuole determinare un piano settimanale di trasporto del prodotto dai magazzini ai clienti, di costo minimo, che rispetti i vincoli descritti sopra.

**Domande**

1. Scrivere un modello di *programmazione lineare* (LP) per il problema.  Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

2. Consideriamo ora un'istanza del problema con $s=2$ magazzini e $r=3$ clienti. Gli altri dati sono:

    | $f_{ij}$ | $j=1$ | $j=2$ | $j=3$ |
    |---|---|---|---|
    | $i=1$ | 3 | 2 | 1 |
    | $i=2$ | 2 | 4 | 1 |

    |  | $i=1$ | $i=2$ |
    |---|---|---|
    | $d_i$ | 120 | 110 |

    |  | $j=1$ | $j=2$ | $j=3$ |
    |---|---|---|---|
    | $e_j$ | 50 | 60 | 100 |

    Scrivere il modello LP per questa istanza.

3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

## Svolgimento

1. Introduciamo le seguenti $r \; s$ variabili non negative:

    $$
    \begin{gathered}
    x_{ij} = \text{ litri di prodotto trasportati dal magazzino } i \text{ al cliente } j, \\[0.5ex]
    \forall i \in \{1,2,\dots,s\}, ~ \forall j \in \{1,2,\dots,r\}.
    \end{gathered}
    $$

    Con queste variabili, un modello LP per il problema è il seguente:

    !!! chiave ""

        <a id="eq-sm2-LP"></a>

        \begin{align*}
        \min  ~~ \sum_{i=1}^s \sum_{j=1}^r  f_{ij} \; x_{ij} & & \label{sm2-obj}  \tag{1a}\\[1ex]
        \text{soggetto a} \quad  \sum_{j=1}^r   x_{ij}  &\le d_i,       & \forall  i \in \{1,2,\dots,s\},               \label{sm2-cons1}  \tag{1b}\\[1ex]
        \sum_{i=1}^s   x_{ij}  &= e_{j},       & \forall  j \in \{1,2,\dots,r\}               , \label{sm2-cons2}  \tag{1c}\\[1ex]
        x_{ij}                        &\ge  0, & \forall i \in \{1,2,\dots,s\},  \forall j \in \{1,2,\dots,r\}. \label{sm2-cons3} \tag{1d}
        \end{align*}

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione obiettivo lineare $\eqref{sm2-obj}$ minimizza il costo totale di trasporto;

    - i vincoli lineari $\eqref{sm2-cons1}$ garantiscono che la quantità totale di prodotto trasportata da ogni magazzino non superi la sua capacità disponibile ($s$ vincoli lineari);

    - i vincoli lineari $\eqref{sm2-cons2}$ garantiscono che ogni cliente riceva esattamente la quantità di prodotto richiesta ($r$ vincoli lineari);

    - i vincoli lineari $\eqref{sm2-cons3}$ definiscono le variabili del modello LP.

    Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

2. Il modello LP [(1)](#eq-sm2-LP) per l'istanza è il seguente:

    $$
    \begin{array}{rrcrcrcrcrcrcr}
    {\min} & {3\,x_{11}} & {+} & {2\,x_{12}} & {+} & {x_{13}} & {+} & {2\,x_{21}} & {+} & {4\,x_{22}} & {+} & {x_{23}} \\[1ex]
    \text{soggetto a} & {x_{11}} & {+} & {x_{12}} & {+} & {x_{13}} &  &  &  &  &  &  & {\le} & {120} \\[1ex]
    &  &  &  &  &  &  & {x_{21}} & {+} & {x_{22}} & {+} & {x_{23}} & {\le} & {110} \\[1ex]
    & {x_{11}} &  &  &  &  & {+} & {x_{21}} &  &  &  &  & {=} & {50} \\[1ex]
    &  &  & {x_{12}} &  &  &  &  & {+} & {x_{22}} &  &  & {=} & {60} \\[1ex]
    &  &  &  &  & {x_{13}} &  &  &  &  & {+} & {x_{23}} & {=} & {100} \\[1ex]
    & {x_{11},} &  & {x_{12},} &  & {x_{13},} &  & {x_{21},} &  & {x_{22},} &  & {x_{23}} & {\ge} & {0}
    \end{array}
    $$

3. Per esempio, ponendo:

    $$
    \bar{x}_{11}=50,~~\bar{x}_{12}=60,~~\bar{x}_{13}=10,~~\bar{x}_{21}=0,~~\bar{x}_{22}=0,~~\bar{x}_{23}=90
    $$

    otteniamo una soluzione ammissibile.   Il valore della funzione obiettivo di questa soluzione ammissibile è:

    $$
    \sum_{i=1}^s \sum_{j=1}^r  f_{ij} \; \bar x_{ij} = 3\cdot 50 + 2 \cdot 60 + 1 \cdot 10 + 2 \cdot 0 + 4 \cdot 0 + 1 \cdot 90 =  370
    $$

    di conseguenza 370 è un upper bound sul valore ottimo del modello LP  [(1)](#eq-sm2-LP). Quindi, per questa istanza, abbiamo:

    $$
    z(~ LP~) ~\le~  370
    $$

4. Usando

    - una variabile duale non positiva $\mu_{i}$ per ogni vincolo $\eqref{sm2-cons1}$ ($i \in \{1,2,\dots,s\}$)

    - una variabile duale libera $\pi_j$ per ogni vincolo $\eqref{sm2-cons2}$ ($j \in \{1,2,\dots,r\}$)

    il modello duale del modello LP [(1)](#eq-sm2-LP) è il seguente:

    !!! chiave ""

        <a id="eq-sm2-DUAL"></a>

        \begin{align*}
        \max ~~  \sum_{i=1}^{s}  d_i \; \mu_{i} + \sum_{j =1}^r e_{j} \: \pi_j & &  \tag{2a}\\[1ex]
        \text{soggetto a}  \quad    \; \mu_{i} +  \pi_j &\le f_{ij},       & \forall i \in \{1,2,\dots,s\}, \forall j \in \{1,2,\dots,r\},  \tag{2b}\\[1ex]
        \mu_{i}                        &\le  0, & \forall i \in \{1,2,\dots,s\},  \tag{2c}\\[1ex]
        \pi_{j}       &\gtreqless 0, & \forall j \in \{1,2,\dots,r\}. \tag{2d}
        \end{align*}

    Il modello duale [(2)](#eq-sm2-DUAL) per l'istanza è il seguente:

    $$
    \begin{array}{rrcrcrcrcrcr}
    {\max} & {120\,\mu_{1}} & {+} & {110\,\mu_{2}} & {+} & {50\,\pi_{1}} & {+} & {60\,\pi_{2}} & {+} & {100\,\pi_{3}} \\[1ex]
    \text{soggetto a} & {\mu_{1}} &  &  & {+} & {\pi_{1}} &  &  &  &  & {\le} & {3} \\[1ex]
    & {\mu_{1}} &  &  &  &  & {+} & {\pi_{2}} &  &  & {\le} & {2} \\[1ex]
    & {\mu_{1}} &  &  &  &  &  &  & {+} & {\pi_{3}} & {\le} & {1} \\[1ex]
    &  &  & {\mu_{2}} & {+} & {\pi_{1}} &  &  &  &  & {\le} & {2} \\[1ex]
    &  &  & {\mu_{2}} &  &  & {+} & {\pi_{2}} &  &  & {\le} & {4} \\[1ex]
    &  &  & {\mu_{2}} &  &  &  &  & {+} & {\pi_{3}} & {\le} & {1} \\[1ex]
    & {\mu_{1},} &  & {\mu_{2}} &  &  &  &  &  &  & {\le} & {0} \\[1ex]
    &  &  &  &  & {\pi_{1},} &  & {\pi_{2},} &  & {\pi_{3}} & {\gtreqless} & {0}
    \end{array}
    $$

    Per esempio, ponendo:

    $$
    \bar\mu_1=0,~~\bar\mu_2=0
    $$

    e ponendo:

    $$
    \bar \pi_1=\min\{3,2\}=2,~~\bar \pi_2=\min\{2,4\}=2,~~\bar \pi_3=\min\{1,1\}= 1
    $$

    otteniamo una soluzione duale ammissibile.

    Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

    $$
    \sum_{i=1}^{s}  d_i \; \bar \mu_{i} + \sum_{j =1}^r e_{j} \: \bar \pi_j = 120\cdot 0+ 110 \cdot 0 + 50 \cdot 2 + 60 \cdot 2 +100 \cdot 1   =  320
    $$

    Di conseguenza $320$ è un lower bound sul valore ottimo del modello. Quindi, per questa istanza, abbiamo:

    $$
    320 ~\le~ z(~ LP~) ~\le~  370
    $$

<!-- laboratorio-interattivo: sezione aggiunta per l'app dei nove modelli -->

## Laboratorio interattivo { #laboratorio-interattivo }

Un modello di trasporto si risolve nel browser nell'app [Trasporto dai magazzini ai clienti](laboratorio/trasporto.md) del laboratorio interattivo, su un'istanza con due magazzini e tre clienti: i cursori cambiano i dati e il simplesso ricalcola la soluzione ottima.
