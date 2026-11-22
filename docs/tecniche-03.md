# 4.3 Miscelazione

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** schema tipico, requisiti di composizione · [Tutte le tecniche](tecniche.md)

## Il problema

Una quantità $d \in \mathbb{Q}_{> 0}$ di un prodotto finale deve essere ottenuta miscelando
$r \in \mathbb{Z}_{\ge 1}$ materie prime. Per ogni materia prima $j \in \{1,2,\dots,r\}$, il
valore $c_j \in \mathbb{Q}_{> 0}$ è il costo di un'unità.

Il prodotto finale deve contenere almeno una quantità $q_k \in \mathbb{Q}_{\ge 0}$ di ciascuno
degli $s \in \mathbb{Z}_{\ge 1}$ componenti, e $p_{kj} \in \mathbb{Q}_{\ge 0}$ è la quantità di
componente $k$ contenuta in un'unità di materia prima $j$. L'azienda vuole determinare una
miscela di costo minimo.

## Il modello

Introduciamo le seguenti $r$ variabili non negative:

$$
x_j = \text{unità di materia prima } j \text{ usate nella miscela}, \qquad \forall j \in \{1,2,\dots,r\} .
$$

Usando queste variabili, un modello LP per il problema è il seguente:

$$
\begin{aligned}
\min ~~ \sum_{j=1}^{r} c_j\, x_j & & \\
\text{soggetto a} \quad \sum_{j=1}^{r} x_j &= d, & \\
\sum_{j=1}^{r} p_{kj}\, x_j &\ge q_k, & \forall k \in \{1,2,\dots,s\}, \\
x_j &\ge 0, & \forall j \in \{1,2,\dots,r\} .
\end{aligned}
$$

- Il vincolo di uguaglianza impone che la quantità totale prodotta sia $d$.
- I vincoli $\ge$ impongono la quantità minima di ciascun componente.

## Frazioni della miscela

Un requisito della forma «*la materia prima $j$ deve essere almeno una frazione $\alpha$
della miscela*» *non* si scrive come $\frac{x_j}{\sum_{\ell} x_{\ell}} \ge \alpha$, che non è
un vincolo lineare. Si scrive invece moltiplicando entrambi i membri per il denominatore, che
è positivo:

$$
\begin{aligned}
& x_j \ge \alpha \; \sum_{\ell = 1}^{r} x_{\ell} \\
\Longleftrightarrow \quad & (1 - \alpha) \; x_j - \alpha \sum_{\ell \ne j} x_{\ell} \ge 0 .
\end{aligned}
$$

La regola generale è nella tecnica [4.8 Rapporti e percentuali](tecniche-08.md).

## Esempio

!!! example "Esempio 4.2: miscelazione"

    Un'azienda deve produrre $d=100$ chilogrammi di mangime miscelando $r=3$ materie prime, i cui costi al chilogrammo sono $c_1 = 0{,}80$, $c_2 = 0{,}50$ e $c_3 = 0{,}30$ euro.

    Il mangime deve contenere almeno $q_1 = 8$ chilogrammi di proteine, e un chilogrammo di ciascuna materia prima ne contiene, rispettivamente, $p_{11} = 0{,}12$, $p_{12} = 0{,}08$ e $p_{13} = 0{,}03$ chilogrammi. Inoltre, la prima materia prima deve essere almeno il $20\%$ della miscela.

    Il modello LP per questa istanza è il seguente:

    $$
    \begin{array}{rrcrcrcr}
    {\min} & {0{,}80\,x_{1}} & {+} & {0{,}50\,x_{2}} & {+} & {0{,}30\,x_{3}} \\[1ex]
    \text{soggetto a} & {x_{1}} & {+} & {x_{2}} & {+} & {x_{3}} & {=} & {100} \\[1ex]
    & {0{,}12\,x_{1}} & {+} & {0{,}08\,x_{2}} & {+} & {0{,}03\,x_{3}} & {\ge} & {8} \\[1ex]
    & {0{,}80\,x_{1}} & {-} & {0{,}20\,x_{2}} & {-} & {0{,}20\,x_{3}} & {\ge} & {0} \\[1ex]
    & {x_{1},} &  & {x_{2},} &  & {x_{3}} & {\ge} & {0}
    \end{array}
    $$

    Il terzo vincolo è il requisito di proporzione $x_1 \ge 0{,}20 \, (x_1 + x_2 + x_3)$, riscritto come vincolo lineare.

    Una soluzione ottima è $\tilde x_1 = 20$, $\tilde x_2 = 64$ e $\tilde x_3 = 16$, con valore ottimo

    $$
    z(\mathit{LP}) = 0{,}80 \cdot 20 + 0{,}50 \cdot 64 + 0{,}30 \cdot 16 = 52{,}80 \text{ euro} .
    $$

<!-- modelli:inizio -->
**Modelli svolti che usano questa tecnica:** [Esempio 4.6 — Pianificazione della dieta](tecniche-modelli-03.md) · [Esempio 4.7 — Pianificazione della dieta per più classi](tecniche-modelli-04.md) · [Esempio 4.11 — Miscelazione di petrolio greggio in una raffineria](tecniche-modelli-08.md)
<!-- modelli:fine -->
