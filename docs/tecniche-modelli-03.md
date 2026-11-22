# Esempio 4.6 — Pianificazione della dieta

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Modello:** simbolico · **Tecniche:** [4.3 Miscelazione](tecniche-03.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Pianificazione della dieta"

    Una mensa scolastica deve determinare la dieta mensile per i suoi studenti. Sta considerando $s \in \mathbb{Z}_{\ge 1}$ possibili tipi di alimento (per esempio latte, riso, pane, patate, ecc.), ciascuno contenente $r \in \mathbb{Z}_{\ge 1}$ nutrienti (per esempio ferro, sodio, calcio, ecc.). Per ogni alimento $i \in \{1, 2, \dots, s\}$, il valore $w_i \in \mathbb{Q}_{> 0}$ rappresenta il costo in euro al chilogrammo di quell'alimento. Per ogni alimento $i \in \{1, 2, \dots, s\}$ e ogni nutriente $j \in \{1, 2, \dots, r\}$, il valore $g_{ij} \in \mathbb{Q}_{\ge 0}$ indica i grammi di nutriente $j$ forniti da un chilogrammo di alimento $i$. Per ogni nutriente $j \in \{1, 2, \dots, r\}$, la dieta deve contenere almeno $a_j \in \mathbb{Q}_{\ge 0}$ grammi e al più $b_j \in \mathbb{Q}_{> 0}$ grammi di quel nutriente al mese. Inoltre, per ogni alimento $i \in \{1, 2, \dots, s\}$, la dieta deve includere almeno $c_i \in \mathbb{Q}_{\ge 0}$ chilogrammi e al più $d_i \in \mathbb{Q}_{> 0}$ chilogrammi di quell'alimento al mese. La mensa scolastica vuole determinare una dieta mensile di costo minimo che rispetti i vincoli descritti sopra.

**Domande**

1. Scrivere un modello di *programmazione lineare* (LP) per il problema.  Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello.   Quale algoritmo si può usare per trovare una soluzione ottima del modello?

2. Consideriamo ora un'istanza del problema con $s = 4$ tipi di alimento e $r=3$ nutrienti. Gli altri dati sono:

    |  | $j=1$ | $j=2$ | $j=3$ |  | $i=1$ | $i=2$ | $i=3$ | $i=4$ |
    |---|---|---|---|---|---|---|---|---|
    | $a_j$ | 10 | 20 | 10 | $w_i$ | 5 | 8 | 2 | 2 |
    | $b_j$ | 40 | 60 | 50 | $c_i$ | 1 | 1 | 0 | 1 |
    |  |  |  |  | $d_i$ | 10 | 15 | 20 | 10 |

    | $g_{ij}$ | $j=1$ | $j=2$ | $j=3$ |
    |---|---|---|---|
    | $i=1$ | $2$ | $4$ | $2$ |
    | $i=2$ | $1$ | $1$ | $1$ |
    | $i=3$ | $4$ | $6$ | $4$ |
    | $i=4$ | $4$ | $6$ | $2$ |

    Scrivere il modello LP per questa istanza.

3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

## Svolgimento

1. Introduciamo le seguenti $s$ variabili non negative:

    \begin{align*}
    x_i &= \text{chilogrammi di alimento } i \text{ nella dieta al mese}, \quad \forall i \in \{1,2,\dots,s\}.
    \end{align*}

    Con queste variabili, un modello LP per il problema è il seguente:

    !!! chiave ""

        <a id="eq-sm3-LP"></a>

        \begin{align*}
        \min  ~~ \sum_{i=1}^s w_i \, x_i & & \label{sm3-obj}  \tag{1a}\\[1ex]
        \text{soggetto a} \quad  \sum_{i=1}^s g_{ij} \; x_i& \ge a_j,       &  \forall   j \in \{1,2,\dots,r\}, \label{sm3-cons1}  \tag{1b}\\[1ex]
        \sum_{i=1}^s g_{ij} \; x_i& \le b_j,       &  \forall   j \in \{1,2,\dots,r\}, \label{sm3-cons2}  \tag{1c}\\[1ex]
        x_i& \ge c_i,       &  \forall   i \in \{1,2,\dots,s\}, \label{sm3-cons3}  \tag{1d}\\[1ex]
        x_i& \le d_i,       &  \forall   i \in \{1,2,\dots,s\}, \label{sm3-cons4}  \tag{1e}\\[1ex]
        x_i                    &\ge  0, & \forall i \in \{1,2,\dots,s\}. \label{sm3-cons5} \tag{1f}
        \end{align*}

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione obiettivo lineare $\eqref{sm3-obj}$ minimizza il costo totale della dieta;

    - i vincoli lineari $\eqref{sm3-cons1}$ garantiscono che la quantità totale di ciascun nutriente fornita dagli alimenti scelti sia almeno pari al suo fabbisogno minimo ($r$ vincoli lineari);

    - i vincoli lineari $\eqref{sm3-cons2}$ garantiscono che la quantità totale di ciascun nutriente fornita dagli alimenti scelti non superi il suo limite massimo ($r$ vincoli lineari);

    - i vincoli lineari $\eqref{sm3-cons3}$ garantiscono che ogni tipo di alimento incluso nella dieta rispetti la sua quantità minima ($s$ vincoli lineari);

    - i vincoli lineari $\eqref{sm3-cons4}$ garantiscono che ogni tipo di alimento incluso nella dieta non superi la sua quantità massima ($s$ vincoli lineari);

    - i vincoli lineari $\eqref{sm3-cons5}$ definiscono le variabili del modello LP.

    Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

2. Il modello LP [(1)](#eq-sm3-LP) per l'istanza è il seguente:

    $$
    \begin{array}{rrcrcrcrcr}
    {\min} & {5\,x_{1}} & {+} & {8\,x_{2}} & {+} & {2\,x_{3}} & {+} & {2\,x_{4}} \\[1ex]
    \text{soggetto a} & {2\,x_{1}} & {+} & {x_{2}} & {+} & {4\,x_{3}} & {+} & {4\,x_{4}} & {\ge} & {10} \\[1ex]
    & {4\,x_{1}} & {+} & {x_{2}} & {+} & {6\,x_{3}} & {+} & {6\,x_{4}} & {\ge} & {20} \\[1ex]
    & {2\,x_{1}} & {+} & {x_{2}} & {+} & {4\,x_{3}} & {+} & {2\,x_{4}} & {\ge} & {10} \\[1ex]
    & {2\,x_{1}} & {+} & {x_{2}} & {+} & {4\,x_{3}} & {+} & {4\,x_{4}} & {\le} & {40} \\[1ex]
    & {4\,x_{1}} & {+} & {x_{2}} & {+} & {6\,x_{3}} & {+} & {6\,x_{4}} & {\le} & {60} \\[1ex]
    & {2\,x_{1}} & {+} & {x_{2}} & {+} & {4\,x_{3}} & {+} & {2\,x_{4}} & {\le} & {50} \\[1ex]
    & {x_{1}} &  &  &  &  &  &  & {\ge} & {1} \\[1ex]
    &  &  & {x_{2}} &  &  &  &  & {\ge} & {1} \\[1ex]
    &  &  &  &  & {x_{3}} &  &  & {\ge} & {0} \\[1ex]
    &  &  &  &  &  &  & {x_{4}} & {\ge} & {1} \\[1ex]
    & {x_{1}} &  &  &  &  &  &  & {\le} & {10} \\[1ex]
    &  &  & {x_{2}} &  &  &  &  & {\le} & {15} \\[1ex]
    &  &  &  &  & {x_{3}} &  &  & {\le} & {20} \\[1ex]
    &  &  &  &  &  &  & {x_{4}} & {\le} & {10} \\[1ex]
    & {x_{1},} &  & {x_{2},} &  & {x_{3},} &  & {x_{4}} & {\ge} & {0}
    \end{array}
    $$

3. Per esempio, ponendo:

    $$
    \bar{x}_{1}=5,~~\bar{x}_{2}=1,~~\bar{x}_{3}=0,~~\bar{x}_{4}=1
    $$

    otteniamo una soluzione ammissibile.   Il valore della funzione obiettivo di questa soluzione ammissibile è:

    $$
    \sum_{i=1}^s w_i \,  \bar x_i  = 5 \cdot 5 + 8 \cdot 1 + 2 \cdot 0 + 2 \cdot 1  =  35
    $$

    di conseguenza 35 è un upper bound sul valore ottimo del modello LP [(1)](#eq-sm3-LP). Quindi, per questa istanza, abbiamo:

    $$
    z(~ LP~) ~\le~  35
    $$

4. Usando

    - una variabile non negativa $\alpha_j$ per ogni vincolo $\eqref{sm3-cons1}$ ($j \in \{1,2,\dots,r\}$)

    - una variabile non positiva $\beta_j$ per ogni vincolo $\eqref{sm3-cons2}$ ($j \in \{1,2,\dots,r\}$)

    - una variabile non negativa $\gamma_i$ per ogni vincolo $\eqref{sm3-cons3}$ ($i \in \{1,2,\dots,s\}$)

    - una variabile non positiva $\delta_i$ per ogni vincolo $\eqref{sm3-cons4}$ ($i \in \{1,2,\dots,s\}$)

    il duale del modello LP [(1)](#eq-sm3-LP) è il seguente:

    !!! chiave ""

        <a id="eq-sm3-DUAL"></a>

        \begin{align*}
        \max ~~ \sum_{j=1}^r a_j \: \alpha_j + \sum_{j=1}^r b_j \: \beta_j & &  \\[1ex]
        + \sum_{i=1}^s c_i \: \gamma_i + \sum_{i=1}^s d_i \: \delta_i & &  \tag{2a}\\[1ex]
        \text{soggetto a}  \quad \sum_{j=1}^{r} g_{ij} \; \alpha_j + \sum_{j=1}^{r} g_{ij} \; \beta_j + \gamma_i + \delta_i   &\le w_i,       & \forall i \in \{1,2,\dots,s\},  \tag{2b}\\[1ex]
        \alpha_{j}       &\ge 0, & \forall j \in \{1,2,\dots,r\},  \tag{2c}\\[1ex]
        \beta_{j}       &\le 0, & \forall j \in \{1,2,\dots,r\},  \tag{2d}\\[1ex]
        \gamma_{i}       &\ge 0, & \forall i \in \{1,2,\dots,s\},  \tag{2e}\\[1ex]
        \delta_{i}       &\le 0, & \forall i \in \{1,2,\dots,s\}. \tag{2f}
        \end{align*}

    Il modello duale [(2)](#eq-sm3-DUAL) per l'istanza è il seguente:

$$
\begin{array}{rcrcrcrcrcrcrcrcrcr}
{\max} &  & {10\,\alpha_{1}} & {+} & {20\,\alpha_{2}} & {+} & {10\,\alpha_{3}} & {+} & {40\,\beta_{1}} & {+} & {60\,\beta_{2}} & {+} & {50\,\beta_{3}} &  &  &  &  &  &  \\
& {+} & {\gamma_{1}} & {+} & {\gamma_{2}} &  &  & {+} & {\gamma_{4}} & {+} & {10\,\delta_{1}} & {+} & {15\,\delta_{2}} & {+} & {20\,\delta_{3}} & {+} & {10\,\delta_{4}} &  &  \\[1.5ex]
\text{soggetto a} &  & {2\,\alpha_{1}} & {+} & {4\,\alpha_{2}} & {+} & {2\,\alpha_{3}} & {+} & {2\,\beta_{1}} & {+} & {4\,\beta_{2}} & {+} & {2\,\beta_{3}} &  &  &  &  &  &  \\
& {+} & {\gamma_{1}} &  &  &  &  &  &  & {+} & {\delta_{1}} &  &  &  &  &  &  & {\le} & {5} \\[1.5ex]
&  & {\alpha_{1}} & {+} & {\alpha_{2}} & {+} & {\alpha_{3}} & {+} & {\beta_{1}} & {+} & {\beta_{2}} & {+} & {\beta_{3}} &  &  &  &  &  &  \\
&  &  & {+} & {\gamma_{2}} &  &  &  &  &  &  & {+} & {\delta_{2}} &  &  &  &  & {\le} & {8} \\[1.5ex]
&  & {4\,\alpha_{1}} & {+} & {6\,\alpha_{2}} & {+} & {4\,\alpha_{3}} & {+} & {4\,\beta_{1}} & {+} & {6\,\beta_{2}} & {+} & {4\,\beta_{3}} &  &  &  &  &  &  \\
&  &  &  &  & {+} & {\gamma_{3}} &  &  &  &  &  &  & {+} & {\delta_{3}} &  &  & {\le} & {2} \\[1.5ex]
&  & {4\,\alpha_{1}} & {+} & {6\,\alpha_{2}} & {+} & {2\,\alpha_{3}} & {+} & {4\,\beta_{1}} & {+} & {6\,\beta_{2}} & {+} & {2\,\beta_{3}} &  &  &  &  &  &  \\
&  &  &  &  &  &  & {+} & {\gamma_{4}} &  &  &  &  &  &  & {+} & {\delta_{4}} & {\le} & {2} \\[1.5ex]
&  & {\alpha_{1},} &  & {\alpha_{2},} &  & {\alpha_{3},} &  &  &  &  &  &  &  &  &  &  &  &  \\
&  & {\gamma_{1},} &  & {\gamma_{2},} &  & {\gamma_{3},} &  & {\gamma_{4}} &  &  &  &  &  &  &  &  & {\ge} & {0} \\[1.5ex]
&  &  &  &  &  &  &  & {\beta_{1},} &  & {\beta_{2},} &  & {\beta_{3},} &  &  &  &  &  &  \\
&  &  &  &  &  &  &  &  &  & {\delta_{1},} &  & {\delta_{2},} &  & {\delta_{3},} &  & {\delta_{4}} & {\le} & {0}
\end{array}
$$

- Per esempio, ponendo:

    $$
    \bar\alpha_1=\bar\alpha_2=\bar\alpha_3=\bar\beta_1=\bar\beta_2=\bar\beta_3=\bar\delta_1=\bar\delta_2=\bar\delta_3=\bar\delta_4=0
    $$

    e ponendo:

    $$
    \bar \gamma_1=5,~~\bar \gamma_2=8,~~\bar \gamma_3=2,~~\bar \gamma_4=2
    $$

    otteniamo una soluzione duale ammissibile.

    Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

    $$
    \sum_{j=1}^r a_j \: \bar \alpha_j + \sum_{j=1}^r b_j \: \bar \beta_j + \sum_{i=1}^s c_i \: \bar \gamma_i  + \sum_{i=1}^s d_i \: \bar \delta_i =
    $$

    $$
    =10 \cdot 0 + 20 \cdot 0 +10 \cdot 0 +
    40 \cdot 0 +60 \cdot 0 +50 \cdot 0 +
    1 \cdot 5 + 1 \cdot 8 +0 \cdot 2 + 1 \cdot 2 +
    10 \cdot 0 + 15 \cdot 0 +20 \cdot 0 +10 \cdot 0
    =  15
    $$

    Di conseguenza $15$ è un lower bound sul valore ottimo del modello. Quindi, per questa istanza, abbiamo:

    $$
    15 ~\le~ z(~ LP~) ~\le~  35
    $$
