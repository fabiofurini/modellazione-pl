# 4.2 Pianificazione della produzione

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** schema tipico, forma canonica di massimo · [Tutte le tecniche](tecniche.md)

## Il problema

Un'azienda produce $r \in \mathbb{Z}_{\ge 1}$ prodotti diversi usando $s \in \mathbb{Z}_{\ge 1}$
risorse limitate. Per ogni prodotto $j \in \{1,2,\dots,r\}$, il valore $c_j \in \mathbb{Q}_{> 0}$
è il profitto di un'unità di prodotto.

Per ogni risorsa $i \in \{1,2,\dots,s\}$, il valore $b_i \in \mathbb{Q}_{> 0}$ è la quantità
disponibile, e $a_{ij} \in \mathbb{Q}_{\ge 0}$ è la quantità di risorsa $i$ consumata da
un'unità di prodotto $j$. L'azienda vuole determinare un piano di produzione di profitto massimo.

## Il modello

Introduciamo le seguenti $r$ variabili non negative:

$$
x_j = \text{unità di prodotto } j \text{ prodotte}, \qquad \forall j \in \{1,2,\dots,r\} .
$$

Usando queste variabili, un modello LP per il problema è il seguente:

$$
\begin{aligned}
\max ~~ \sum_{j=1}^{r} c_j\, x_j & & \\
\text{soggetto a} \quad \sum_{j=1}^{r} a_{ij}\, x_j &\le b_i, & \forall i \in \{1,2,\dots,s\}, \\
x_j &\ge 0, & \forall j \in \{1,2,\dots,r\} .
\end{aligned}
$$

- La funzione obiettivo è il profitto totale.
- I vincoli impongono che il consumo di ogni risorsa non superi la sua disponibilità.
- Si tratta di un problema LP in **forma canonica di massimo**.

## Esempio

!!! example "Esempio 4.1: pianificazione della produzione"

    Consideriamo un'istanza con $r=2$ prodotti e $s=3$ risorse:

    |  | $j=1$ | $j=2$ |
    |---|---|---|
    | $c_j$ | 3 | 5 |
    | $a_{1j}$ | 1 | 0 |
    | $a_{2j}$ | 0 | 2 |
    | $a_{3j}$ | 3 | 2 |

    | $b_1$ | $b_2$ | $b_3$ |
    |---|---|---|
    | 4 | 12 | 18 |

    Il modello LP per questa istanza è il seguente:

    $$
    \begin{array}{rrcrcr}
    {\max} & {3\,x_{1}} & {+} & {5\,x_{2}} \\[1ex]
    \text{soggetto a} & {x_{1}} &  &  & {\le} & {4} \\[1ex]
    &  &  & {2\,x_{2}} & {\le} & {12} \\[1ex]
    & {3\,x_{1}} & {+} & {2\,x_{2}} & {\le} & {18} \\[1ex]
    & {x_{1},} &  & {x_{2}} & {\ge} & {0}
    \end{array}
    $$

    Una soluzione ottima è $\tilde x_1 = 2$ e $\tilde x_2 = 6$, con valore ottimo $z(\mathit{LP}) = 36$.
