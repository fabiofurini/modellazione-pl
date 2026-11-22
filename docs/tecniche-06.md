# 4.6 Min-max e max-min

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** linearizzazione con una variabile ausiliaria · [Tutte le tecniche](tecniche.md)

## La forma non lineare

Alcuni requisiti non sono lineari così come sono scritti, ma si possono riscrivere come vincoli
lineari, eventualmente con l'aiuto di variabili aggiuntive. Il primo caso è una funzione
obiettivo della forma

$$
\min ~ \max_{i \in \{1,2,\dots,m\}} \left\{ \sum_{j=1}^n a_{ij} \, x_j \right\} .
$$

## I vincoli lineari

!!! chiave "Linearizzazione del min-max"

    Si introduce una variabile libera aggiuntiva $w$ e si scrive

    $$
    \begin{aligned}
    &\min ~ w \\
    &\text{soggetto a} \quad w \ge \sum_{j=1}^n a_{ij} \, x_j , \qquad \forall i \in \{1,2,\dots,m\} .
    \end{aligned}
    $$

## Perché funziona

- Gli $m$ vincoli impongono che $w$ non sia minore di ciascuna delle $m$ funzioni lineari, cioè del loro massimo.
- Poiché $w$ viene minimizzata, in una soluzione ottima è esattamente uguale a tale massimo.
- Simmetricamente, una funzione obiettivo **max-min** si linearizza introducendo una variabile libera aggiuntiva $w$, massimizzandola e imponendo $w \le \sum_{j} a_{ij} \, x_j$ per ogni $i$.

!!! warning "Solo in queste due direzioni"

    La *massimizzazione* di un massimo, o la *minimizzazione* di un minimo, non si può linearizzare in questo modo.
