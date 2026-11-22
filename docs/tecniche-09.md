# 4.9 Che cosa non si può modellare

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Tecnica:** i limiti della programmazione lineare · [Tutte le tecniche](tecniche.md)

## Requisiti che richiedono variabili intere

!!! chiave "Fuori dalla programmazione lineare"

    I seguenti requisiti *non* si possono scrivere come vincoli lineari su variabili continue, e richiedono variabili **intere**:

    1. **quantità indivisibili**, per esempio il numero di macchine da acquistare o di veicoli da usare;
    2. **decisioni sì/no**, per esempio se aprire o no un magazzino;
    3. **costi fissi**, cioè un costo che si paga solo se l'attività associata viene svolta;
    4. **vincoli disgiuntivi**, cioè requisiti di cui almeno uno su due deve valere;
    5. **quantità minime positive**, per esempio «*o non produrre nulla, o produrre almeno $q$ unità*».

    Questi requisiti sono l'oggetto della **programmazione lineare intera**.

## Due errori frequenti

- Scrivere un costo fisso come termine non lineare della funzione obiettivo.
- Imporre una quantità minima positiva con il vincolo $x_j \ge q$: esclude la soluzione $x_j = 0$, che invece deve restare ammissibile.

## Il modello LP resta utile

Il modello LP ottenuto ignorando questi requisiti è un **rilassamento** del modello corretto.
Il suo valore ottimo è quindi un upper bound sul valore ottimo del modello corretto, per un
problema di massimo, e un lower bound per un problema di minimo.

I modelli con variabili intere sono nel modulo
[Modellazione MIP](https://fabiofurini.github.io/modellazione-mip/): costo fisso, lotto minimo e
vincoli disgiuntivi sono fra i [legami fra variabili](https://fabiofurini.github.io/modellazione-mip/legami/).
