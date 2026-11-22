# 4.1 Dalla descrizione al modello

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** il metodo in tre passi · [Tutte le tecniche](tecniche.md)

## Che cos'è un modello

Un **modello** di un problema di ottimizzazione è una descrizione matematica delle sue
soluzioni ammissibili e della quantità da ottimizzare. Scrivere un modello richiede tre
passi, sempre in questo ordine.

!!! chiave "I tre passi"

    1. **Variabili decisionali.** Individuare le decisioni da prendere e associare una variabile a ciascuna di esse. Per ogni variabile, indicare la sua *unità di misura* e il suo dominio.

    2. **Funzione obiettivo.** Scrivere, come funzione lineare delle variabili decisionali, la quantità da massimizzare o minimizzare.

    3. **Vincoli.** Scrivere, come uguaglianze o disuguaglianze lineari, ogni requisito che una soluzione ammissibile deve soddisfare.

## I dati simbolici

Il modello si scrive con **dati simbolici**, in modo che descriva il problema per ogni
istanza, e non soltanto per una di esse. Usiamo le seguenti convenzioni:

1. le *dimensioni* dell'istanza sono numeri interi, per esempio $r \in \mathbb{Z}_{\ge 1}$ e $s \in \mathbb{Z}_{\ge 1}$;
2. i *dati numerici* sono numeri razionali, per esempio $a_i \in \mathbb{Q}_{> 0}$ e $w_{ij} \in \mathbb{Q}_{\ge 0}$;
3. gli *insiemi di indici* si scrivono esplicitamente, per esempio $\forall i \in \{1,2,\dots,r\}$.

## Modelli di programmazione lineare

Un modello è un modello di **programmazione lineare** se la sua funzione obiettivo e tutti
i suoi vincoli sono lineari, e se tutte le sue variabili sono continue. In questo caso il
modello si può risolvere con l'algoritmo del simplesso.

!!! warning "I tre errori più frequenti"

    1. Dimenticare i **vincoli di non negatività** delle variabili.

    2. Scrivere vincoli non *dimensionalmente coerenti*, cioè che sommano quantità con unità di misura diverse.

    3. Usare una variabile nella funzione obiettivo senza averla definita tra le variabili decisionali.
