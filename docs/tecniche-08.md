# 4.8 Rapporti e percentuali

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** linearizzazione moltiplicando per il denominatore · [Tutte le tecniche](tecniche.md)

## La forma non lineare

Un vincolo della forma

$$
\frac{\sum_{j=1}^n a_{j} \, x_j}{\sum_{j=1}^n e_{j} \, x_j} \le \gamma ,
\qquad
\sum_{j=1}^n e_{j} \, x_j > 0 ,
$$

non è lineare.

## Il vincolo lineare

!!! chiave "Linearizzazione di un rapporto"

    Si moltiplicano entrambi i membri per il denominatore, che è positivo:

    $$
    \sum_{j=1}^n \big( a_{j} - \gamma \; e_{j} \big) \, x_j \le 0 .
    $$

## Quando vale

- La stessa tecnica si applica ai requisiti percentuali dei modelli di [miscelazione](tecniche-03.md).
- È corretta solo quando il denominatore è *sicuramente positivo* per ogni soluzione ammissibile.
- Altrimenti moltiplicare per esso cambierebbe il verso della disuguaglianza.
