# 4.7 Valori assoluti

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** linearizzazione con variabili ausiliarie · [Tutte le tecniche](tecniche.md)

## La forma non lineare

Un termine $\left| \sum_{j=1}^n a_{ij} \, x_j \right|$ nella funzione obiettivo non è lineare.
Si può linearizzare quando compare con coefficiente *positivo* in una funzione obiettivo *da
minimizzare*.

## I vincoli lineari

!!! chiave "Linearizzazione del valore assoluto"

    Si introduce una variabile non negativa aggiuntiva $w_i$ e si scrive

    $$
    w_i \ge \sum_{j=1}^n a_{ij} \, x_j ,
    \qquad
    w_i \ge - \sum_{j=1}^n a_{ij} \, x_j .
    $$

## Perché funziona

- I due vincoli impongono $w_i \ge \left| \sum_{j} a_{ij} \, x_j \right|$.
- La minimizzazione rende la disuguaglianza soddisfatta all'uguaglianza in una soluzione ottima.

## La seconda forma

Sotto la *stessa condizione* (coefficiente positivo in una funzione obiettivo da minimizzare,
o coefficiente negativo in una da massimizzare), lo stesso termine si linearizza scrivendo

$$
\sum_{j=1}^n a_{ij} \, x_j = w_i^{+} - w_i^{-}, \qquad w_i^{+}, w_i^{-} \ge 0,
$$

e sostituendo il valore assoluto con $w_i^{+} + w_i^{-}$.

- L'ottimizzazione rende almeno una tra $w_i^{+}$ e $w_i^{-}$ uguale a $0$ in una soluzione ottima, e allora $w_i^{+} + w_i^{-} = \left| \sum_{j} a_{ij} \, x_j \right|$.
- Senza quella condizione, entrambe le variabili potrebbero essere positive e il modello sarebbe sbagliato.

La regressione con gli scarti assoluti del capitolo
[11. Regressione robusta e quantile](regressione.md) usa questa tecnica su dati reali.
