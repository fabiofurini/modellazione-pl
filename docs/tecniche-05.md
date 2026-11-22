# 4.5 Pianificazione su più periodi

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** schema tipico, bilancio delle scorte · [Tutte le tecniche](tecniche.md)

## Il problema

Un'azienda deve soddisfare la domanda di un prodotto su un orizzonte temporale di
$n \in \mathbb{Z}_{\ge 1}$ periodi. Per ogni periodo $t \in \{1,2,\dots,n\}$, il valore
$d_t \in \mathbb{Q}_{\ge 0}$ è la domanda e $p_t \in \mathbb{Q}_{> 0}$ è la produzione massima.

Inoltre $c_t \in \mathbb{Q}_{> 0}$ è il costo unitario di produzione e $h_t \in \mathbb{Q}_{> 0}$
è il costo unitario per immagazzinare un'unità dal periodo $t$ al periodo $t+1$.

## Il modello

Introduciamo le seguenti $2\,n$ variabili non negative:

$$
\begin{cases}
x_t = \text{unità prodotte nel periodo } t\\[1ex]
y_t = \text{unità in magazzino alla fine del periodo } t
\end{cases}
\qquad \forall t \in \{1,2,\dots,n\} .
$$

Usando queste variabili, un modello LP per il problema è il seguente (con $y_0 = 0$):

$$
\begin{aligned}
\min ~~ \sum_{t=1}^{n} c_t\, x_t + \sum_{t=1}^{n} h_t\, y_t & & \\
\text{soggetto a} \quad y_{t-1} + x_t - y_t &= d_t, & \forall t \in \{1,2,\dots,n\}, \\
x_t &\le p_t, & \forall t \in \{1,2,\dots,n\}, \\
x_t &\ge 0, & \forall t \in \{1,2,\dots,n\}, \\
y_t &\ge 0, & \forall t \in \{1,2,\dots,n\} .
\end{aligned}
$$

## Il bilancio delle scorte

!!! chiave "Vincoli di bilanciamento delle scorte"

    In ogni periodo, ciò che era in magazzino alla fine del periodo precedente più ciò che si produce è uguale alla domanda più ciò che resta in magazzino:

    $$
    y_{t-1} + x_t - y_t = d_t, \qquad \forall t \in \{1,2,\dots,n\} .
    $$

    Sono la chiave di ogni modello multi-periodo, e collegano periodi consecutivi.

## Il caso completo

Il capitolo [5. Produzione e scorte multiperiodali](produzione.md) usa questo schema con più
prodotti e capacità in ore macchina condivise. Lì ci sono i dati, il codice, i prezzi ombra
della capacità e l'analisi di sensitività.
