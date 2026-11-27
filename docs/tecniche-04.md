# 4.4 Trasporto

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** schema tipico, disponibilità e domande · [Tutte le tecniche](tecniche.md)

## Il problema

Un'azienda ha $s \in \mathbb{Z}_{\ge 1}$ magazzini e deve servire $r \in \mathbb{Z}_{\ge 1}$
clienti. Per ogni magazzino $i \in \{1,2,\dots,s\}$, il valore $a_i \in \mathbb{Q}_{> 0}$ è la
quantità di prodotto disponibile.

Per ogni cliente $j \in \{1,2,\dots,r\}$, il valore $d_j \in \mathbb{Q}_{> 0}$ è la domanda, e
$c_{ij} \in \mathbb{Q}_{\ge 0}$ è il costo per trasportare un'unità di prodotto dal magazzino
$i$ al cliente $j$. L'azienda vuole determinare un piano di trasporto di costo minimo.

## Il modello

Introduciamo le seguenti $s \cdot r$ variabili non negative:

$$
\begin{gathered}
x_{ij} = \text{unità trasportate dal magazzino } i \text{ al cliente } j, \\
\forall i \in \{1,2,\dots,s\},~\forall j \in \{1,2,\dots,r\} .
\end{gathered}
$$

Usando queste variabili, un modello LP per il problema è il seguente:

$$
\begin{aligned}
\min ~~ \sum_{i=1}^{s} \sum_{j=1}^{r} c_{ij}\, x_{ij} & & \\
\text{soggetto a} \quad \sum_{j=1}^{r} x_{ij} &\le a_i, & \forall i \in \{1,2,\dots,s\}, \\
\sum_{i=1}^{s} x_{ij} &\ge d_j, & \forall j \in \{1,2,\dots,r\}, \\
x_{ij} &\ge 0, & \forall i \in \{1,2,\dots,s\},~\forall j \in \{1,2,\dots,r\} .
\end{aligned}
$$

- I vincoli di disponibilità impongono che nessun magazzino spedisca più della sua disponibilità.
- I vincoli di domanda impongono che ogni cliente riceva almeno la sua domanda.
- Il modello è ammissibile se e solo se $\sum_{i} a_i \ge \sum_{j} d_j$.

## Esempio

!!! example "Esempio 4.3: trasporto"

    Consideriamo un'istanza con $s=2$ magazzini, di disponibilità $a_1 = 50$ e $a_2 = 60$, e $r=2$ clienti, di domande $d_1 = 30$ e $d_2 = 80$. I costi di trasporto sono:

    | $c_{ij}$ | $j=1$ | $j=2$ |
    |---|---|---|
    | $i=1$ | 4 | 6 |
    | $i=2$ | 5 | 3 |

    Una soluzione ottima è

    $$
    \tilde x_{11} = 30, \qquad \tilde x_{12} = 20, \qquad \tilde x_{21} = 0, \qquad \tilde x_{22} = 60 ,
    $$

    con valore ottimo

    $$
    z(\text{LP}) = 4 \cdot 30 + 6 \cdot 20 + 5 \cdot 0 + 3 \cdot 60 = 420 .
    $$

<!-- modelli:inizio -->
**Modelli svolti che usano questa tecnica:** [Esempio 4.5 — Trasporto dai magazzini ai clienti](tecniche-modelli-02.md)
<!-- modelli:fine -->
