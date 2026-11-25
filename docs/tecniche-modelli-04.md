# Esempio 4.7 — Pianificazione della dieta per più classi

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Modello:** simbolico · **Tecniche:** [4.3 Miscelazione](tecniche-03.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Pianificazione della dieta per più classi"

    Una mensa scolastica deve determinare $n \in \mathbb{Z}_{\ge 1}$ diete mensili per le sue classi di studenti. Sta considerando $s \in \mathbb{Z}_{\ge 1}$ possibili tipi di alimento (per esempio latte, riso, pane, ecc.), ciascuno contenente $r \in \mathbb{Z}_{\ge 1}$ nutrienti (per esempio ferro, sodio, ecc.). Per ogni alimento $i \in \{1, 2, \dots, s\}$, il valore $w_i \in \mathbb{Q}_{> 0}$ rappresenta il costo in euro al chilogrammo di quell'alimento. Per ogni alimento $i \in \{1, 2, \dots, s\}$ e ogni nutriente $j \in \{1, 2, \dots, r\}$, il valore $g_{ij} \in \mathbb{Q}_{\ge 0}$ indica i grammi di nutriente $j$ forniti da un chilogrammo di alimento $i$. Per ogni dieta $k \in \{1,2,\dots,n\}$ e ogni nutriente $j \in \{1, 2, \dots, r\}$, la dieta deve contenere almeno $a_{kj} \in \mathbb{Q}_{\ge 0}$ grammi e al più $b_{kj} \in \mathbb{Q}_{>0}$ grammi di quel nutriente al mese. Inoltre, per ogni alimento $i \in \{1, 2, \dots, s\}$, le diete, complessivamente, devono includere almeno $c_i \in \mathbb{Q}_{\ge 0}$ chilogrammi e al più $d_i \in \mathbb{Q}_{> 0}$ chilogrammi di quell'alimento al mese. La mensa scolastica vuole determinare le diete mensili per tutte le classi di studenti, di costo minimo, che rispettino i vincoli descritti sopra.

**Domande**

1. Scrivere un modello di *programmazione lineare* (LP) per il problema.  Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello.   Quale algoritmo si può usare per trovare una soluzione ottima del modello?

2. Consideriamo ora un'istanza del problema con $n=2$ diete, $s=3$ tipi di alimento e $r=2$ nutrienti. Gli altri dati sono:

    | $a_{kj}$ | $j=1$ | $j=2$ |  |
    |---|---|---|---|
    | $k=1$ | $20$ | $10$ |
    | $k=2$ | $10$ | $20$ |

    | $b_{kj}$ | $j=1$ | $j=2$ |
    |---|---|---|
    | $k=1$ | $40$ | $20$ |
    | $k=2$ | $20$ | $40$ |

    |  | $i=1$ | $i=2$ | $i=3$ |
    |---|---|---|---|
    | $w_i$ | 5 | 8 | 6 |
    | $c_i$ | 1 | 1 | 0 |
    | $d_i$ | 5 | 4 | 10 |

    | $g_{ij}$ | $j=1$ | $j=2$ |
    |---|---|---|
    | $i=1$ | $6$ | $2$ |
    | $i=2$ | $2$ | $1$ |
    | $i=3$ | $2$ | $6$ |

    Scrivere il modello LP per questa istanza.

3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

## Svolgimento

1. Introduciamo le seguenti $s \; n$ variabili non negative:

    $$
    \begin{gathered}
    x_{ik} = \text{chilogrammi di alimento } i \text{ nella dieta } k \text{ al mese}, \\[0.5ex]
    \forall i \in \{1,2,\dots,s\}, ~ \forall k \in \{1,2,\dots,n\}.
    \end{gathered}
    $$

    Con queste variabili, un modello LP per il problema è il seguente:

    !!! chiave ""

        <a id="eq-sm4-LP"></a>

        \begin{align*}
        \min  ~~ \sum_{i=1}^s  \sum_{k=1}^n  w_i \, x_{ik} & & \label{sm4-obj}  \tag{1a}\\[1ex]
        \text{soggetto a} \quad  \sum_{i=1}^s g_{ij} \; x_{ik}& \ge a_{kj},       &  \forall   k \in \{1,2,\dots,n\},~\forall   j \in \{1,2,\dots,r\}, \label{sm4-cons1}  \tag{1b}\\[1ex]
        \sum_{i=1}^s g_{ij} \; x_{ik}& \le b_{kj},       &  \forall   k \in \{1,2,\dots,n\},~\forall   j \in \{1,2,\dots,r\}, \label{sm4-cons2}  \tag{1c}\\[1ex]
        \sum_{k=1}^n x_{ik}& \ge c_i,       &  \forall   i \in \{1,2,\dots,s\}, \label{sm4-cons3}  \tag{1d}\\[1ex]
        \sum_{k=1}^n x_{ik}& \le d_i,       &  \forall   i \in \{1,2,\dots,s\}, \label{sm4-cons4}  \tag{1e}\\[1ex]
        x_{ik}                    &\ge  0, & \forall i \in \{1,2,\dots,s\},~\forall k \in \{1,2,\dots,n\}. \label{sm4-cons5} \tag{1f}
        \end{align*}

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione obiettivo lineare $\eqref{sm4-obj}$ minimizza il costo totale delle diete per tutte le classi di studenti.

    - i vincoli lineari $\eqref{sm4-cons1}$ garantiscono che, per ogni dieta e ogni nutriente, la quantità totale del nutriente fornita dagli alimenti inclusi in quella dieta rispetti il fabbisogno minimo ($n \; r$ vincoli lineari);

    - i vincoli lineari $\eqref{sm4-cons2}$ garantiscono che, per ogni dieta e ogni nutriente, la quantità totale del nutriente fornita dagli alimenti inclusi in quella dieta non superi il limite massimo ($n \; r$ vincoli lineari);

    - i vincoli lineari $\eqref{sm4-cons3}$ garantiscono che, per ogni alimento, la quantità totale distribuita fra tutte le diete rispetti la quantità minima ($s$ vincoli lineari);

    - i vincoli lineari $\eqref{sm4-cons4}$ garantiscono che, per ogni alimento, la quantità totale distribuita fra tutte le diete non superi la quantità massima ($s$ vincoli lineari);

    - i vincoli lineari $\eqref{sm4-cons5}$ definiscono le variabili del modello LP.

    Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

2. Il modello LP [(1)](#eq-sm4-LP) per l'istanza è il seguente:

    $$
    \begin{array}{rrcrcrcrcrcrcr}
    {\min} & {5\,x_{11}} & {+} & {5\,x_{12}} & {+} & {8\,x_{21}} & {+} & {8\,x_{22}} & {+} & {6\,x_{31}} & {+} & {6\,x_{32}} \\[1ex]
    \text{soggetto a} & {6\,x_{11}} &  &  & {+} & {2\,x_{21}} &  &  & {+} & {2\,x_{31}} &  &  & {\ge} & {20} \\[1ex]
    & {2\,x_{11}} &  &  & {+} & {x_{21}} &  &  & {+} & {6\,x_{31}} &  &  & {\ge} & {10} \\[1ex]
    &  &  & {6\,x_{12}} &  &  & {+} & {2\,x_{22}} &  &  & {+} & {2\,x_{32}} & {\ge} & {10} \\[1ex]
    &  &  & {2\,x_{12}} &  &  & {+} & {x_{22}} &  &  & {+} & {6\,x_{32}} & {\ge} & {20} \\[1ex]
    & {6\,x_{11}} &  &  & {+} & {2\,x_{21}} &  &  & {+} & {2\,x_{31}} &  &  & {\le} & {40} \\[1ex]
    & {2\,x_{11}} &  &  & {+} & {x_{21}} &  &  & {+} & {6\,x_{31}} &  &  & {\le} & {20} \\[1ex]
    &  &  & {6\,x_{12}} &  &  & {+} & {2\,x_{22}} &  &  & {+} & {2\,x_{32}} & {\le} & {20} \\[1ex]
    &  &  & {2\,x_{12}} &  &  & {+} & {x_{22}} &  &  & {+} & {6\,x_{32}} & {\le} & {40} \\[1ex]
    & {x_{11}} & {+} & {x_{12}} &  &  &  &  &  &  &  &  & {\ge} & {1} \\[1ex]
    &  &  &  &  & {x_{21}} & {+} & {x_{22}} &  &  &  &  & {\ge} & {1} \\[1ex]
    &  &  &  &  &  &  &  &  & {x_{31}} & {+} & {x_{32}} & {\ge} & {0} \\[1ex]
    & {x_{11}} & {+} & {x_{12}} &  &  &  &  &  &  &  &  & {\le} & {5} \\[1ex]
    &  &  &  &  & {x_{21}} & {+} & {x_{22}} &  &  &  &  & {\le} & {4} \\[1ex]
    &  &  &  &  &  &  &  &  & {x_{31}} & {+} & {x_{32}} & {\le} & {10} \\[1ex]
    & {x_{11},} &  & {x_{12},} &  & {x_{21},} &  & {x_{22},} &  & {x_{31},} &  & {x_{32}} & {\ge} & {0}
    \end{array}
    $$

3. Per esempio, ponendo:

    $$
    \bar{x}_{11}=4,~~\bar{x}_{12}=1,~~\bar{x}_{21}=2,~~\bar{x}_{22}=1,~~\bar{x}_{31}=0,~~\bar{x}_{32}=3
    $$

    otteniamo una soluzione ammissibile.   Il valore della funzione obiettivo di questa soluzione ammissibile è:

    $$
    \sum_{i=1}^s w_i \sum_{k=1}^n  \, \bar x_{ik}  = 5 \cdot 4 +  5 \cdot 1 + 8 \cdot 2 + 8 \cdot 1 + 6 \cdot 0 + 6 \cdot 3  =  67
    $$

    di conseguenza 67 è un upper bound sul valore ottimo del modello LP [(1)](#eq-sm4-LP). Quindi, per questa istanza, abbiamo:

    $$
    z(~ LP~) ~\le~  67
    $$

4. Usando

    - una variabile non negativa $\alpha_{kj}$ per ogni vincolo $\eqref{sm4-cons1}$ ($k \in \{1,2,\dots,n\},j \in \{1,2,\dots,r\}$)

    - una variabile non positiva $\beta_{kj}$ per ogni vincolo $\eqref{sm4-cons2}$ ($k \in \{1,2,\dots,n\},j \in \{1,2,\dots,r\}$)

    - una variabile non negativa $\gamma_i$ per ogni vincolo $\eqref{sm4-cons3}$ ($i \in \{1,2,\dots,s\}$)

    - una variabile non positiva $\delta_i$ per ogni vincolo $\eqref{sm4-cons4}$ ($i \in \{1,2,\dots,s\}$)

    il duale del modello LP [(1)](#eq-sm4-LP) è il seguente:

!!! chiave ""

    <a id="eq-sm4-DUAL"></a>

    \begin{align*}
    \max ~~ \sum_{k=1}^n \sum_{j=1}^r a_{kj} \, \alpha_{kj} & &  \\[1ex]
    + \sum_{k=1}^n \sum_{j=1}^r b_{kj} \, \beta_{kj} & &  \\[1ex]
    + \sum_{i=1}^s c_i \, \gamma_i + \sum_{i=1}^s d_i \, \delta_i & &  \tag{2a}\\[1ex]
    \text{soggetto a} \quad \sum_{j=1}^{r} g_{ij} \, \alpha_{kj} & &  \\[1ex]
    + \sum_{j=1}^{r} g_{ij} \, \beta_{kj} + \gamma_i + \delta_i &\le w_i, & \forall i \in \{1,2,\dots,s\},~\forall k \in \{1,2,\dots,n\},  \tag{2b}\\[1ex]
    \alpha_{kj}       &\ge 0, & \forall k \in \{1,2,\dots,n\},~\forall j \in \{1,2,\dots,r\},  \tag{2c}\\[1ex]
    \beta_{kj}       &\le 0, & \forall k \in \{1,2,\dots,n\},~\forall j \in \{1,2,\dots,r\},  \tag{2d}\\[1ex]
    \gamma_{i}       &\ge 0, & \forall i \in \{1,2,\dots,s\},  \tag{2e}\\[1ex]
    \delta_{i}       &\le 0, & \forall i \in \{1,2,\dots,s\}. \tag{2f}
    \end{align*}

- Il modello duale [(2)](#eq-sm4-DUAL) per l'istanza è il seguente:

$$
\begin{array}{rcrcrcrcrcrcrcrcrcr}
{\max} &  & {20\,\alpha_{11}} & {+} & {10\,\alpha_{12}} & {+} & {10\,\alpha_{21}} & {+} & {20\,\alpha_{22}} & {+} & {40\,\beta_{11}} & {+} & {20\,\beta_{12}} & {+} & {20\,\beta_{21}} & {+} & {40\,\beta_{22}} &  &  \\
& {+} & {\gamma_{1}} & {+} & {\gamma_{2}} &  &  & {+} & {5\,\delta_{1}} & {+} & {4\,\delta_{2}} & {+} & {10\,\delta_{3}} &  &  &  &  &  &  \\[1.5ex]
\text{soggetto a} &  & {6\,\alpha_{11}} & {+} & {2\,\alpha_{12}} &  &  &  &  & {+} & {6\,\beta_{11}} & {+} & {2\,\beta_{12}} &  &  &  &  &  &  \\
& {+} & {\gamma_{1}} &  &  &  &  & {+} & {\delta_{1}} &  &  &  &  &  &  &  &  & {\le} & {5} \\[1.5ex]
&  &  &  &  &  & {6\,\alpha_{21}} & {+} & {2\,\alpha_{22}} &  &  &  &  & {+} & {6\,\beta_{21}} & {+} & {2\,\beta_{22}} &  &  \\
& {+} & {\gamma_{1}} &  &  &  &  & {+} & {\delta_{1}} &  &  &  &  &  &  &  &  & {\le} & {5} \\[1.5ex]
&  & {2\,\alpha_{11}} & {+} & {\alpha_{12}} &  &  &  &  & {+} & {2\,\beta_{11}} & {+} & {\beta_{12}} &  &  &  &  &  &  \\
&  &  & {+} & {\gamma_{2}} &  &  &  &  & {+} & {\delta_{2}} &  &  &  &  &  &  & {\le} & {8} \\[1.5ex]
&  &  &  &  &  & {2\,\alpha_{21}} & {+} & {\alpha_{22}} &  &  &  &  & {+} & {2\,\beta_{21}} & {+} & {\beta_{22}} &  &  \\
&  &  & {+} & {\gamma_{2}} &  &  &  &  & {+} & {\delta_{2}} &  &  &  &  &  &  & {\le} & {8} \\[1.5ex]
&  & {2\,\alpha_{11}} & {+} & {6\,\alpha_{12}} &  &  &  &  & {+} & {2\,\beta_{11}} & {+} & {6\,\beta_{12}} &  &  &  &  &  &  \\
&  &  &  &  & {+} & {\gamma_{3}} &  &  &  &  & {+} & {\delta_{3}} &  &  &  &  & {\le} & {6} \\[1.5ex]
&  &  &  &  &  & {2\,\alpha_{21}} & {+} & {6\,\alpha_{22}} &  &  &  &  & {+} & {2\,\beta_{21}} & {+} & {6\,\beta_{22}} &  &  \\
&  &  &  &  & {+} & {\gamma_{3}} &  &  &  &  & {+} & {\delta_{3}} &  &  &  &  & {\le} & {6} \\[1.5ex]
&  & {\alpha_{11},} &  & {\alpha_{12},} &  & {\alpha_{21},} &  & {\alpha_{22},} &  &  &  &  &  &  &  &  &  &  \\
&  & {\gamma_{1},} &  & {\gamma_{2},} &  & {\gamma_{3}} &  &  &  &  &  &  &  &  &  &  & {\ge} & {0} \\[1.5ex]
&  &  &  &  &  &  &  &  &  & {\beta_{11},} &  & {\beta_{12},} &  & {\beta_{21},} &  & {\beta_{22},} &  &  \\
&  &  &  &  &  &  &  & {\delta_{1},} &  & {\delta_{2},} &  & {\delta_{3}} &  &  &  &  & {\le} & {0}
\end{array}
$$

- Per esempio, ponendo:

    $$
    \bar\alpha_{11}=\bar\alpha_{12}=\bar\alpha_{21}=\bar\alpha_{22}=
    \bar\beta_{11}=\bar\beta_{12}=\bar\beta_{21}=\bar\beta_{22}=\bar\delta_{1}=\bar\delta_{2}=\bar\delta_{3}=0
    $$

    e ponendo:

    $$
    \bar \gamma_1=\min\{5,5\}=5,~~\bar \gamma_2=\min\{8,8\}=8,~~\bar \gamma_3=\min\{6,6\}=6
    $$

    otteniamo una soluzione duale ammissibile.

    Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

    $$
    \sum_{k=1}^n \sum_{j=1}^r a_{kj} \; \bar \alpha_{kj} + \sum_{k=1}^n \sum_{j=1}^r b_{kj} \;\bar \beta_{kj} +\sum_{i=1}^s c_i \: \bar \gamma_i +\sum_{i=1}^s d_ i\: \bar \delta_i =
    $$

    $$
    =
    20 \cdot 0 + 10 \cdot 0 + 10 \cdot 0 + 20 \cdot 0
    + 40 \cdot 0 + 20 \cdot 0 + 20 \cdot 0 + 40 \cdot 0
    + 1 \cdot 5 + 1 \cdot 8 + 0 \cdot 6 + 5 \cdot 0
    + 4 \cdot 0 + 10 \cdot 0=  13
    $$

    Di conseguenza $13$ è un lower bound sul valore ottimo del modello. Quindi, per questa istanza, abbiamo:

    $$
    13 ~\le~ z(~ LP~) ~\le~  67
    $$

<!-- laboratorio-interattivo: sezione aggiunta per l'app dei nove modelli -->

## Laboratorio interattivo { #laboratorio-interattivo }

L'app risolve questo modello nel browser, con i dati dell'esempio: i cursori cambiano i dati principali e il simplesso ricalcola la soluzione ottima, il valore ottimo e i prezzi ombra. Si apre anche a tutta pagina nel [laboratorio interattivo](laboratorio/tecniche.md), con gli altri otto modelli svolti.

<div class="gi gi-capitolo" data-grafico="pl-tecniche" data-funzione="dieta-classi"></div>
