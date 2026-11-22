# Modellazione

Prima dei casi, gli strumenti per costruirli: come si scrive un modello di programmazione
lineare a partire da una descrizione, come lo si interroga con la dualità e come lo si
porta in Python/Gurobi. I casi delle parti successive usano tutti questi quattro capitoli.

!!! success "Alla fine di questa parte si sa fare"
    - Scrivere un modello LP da un testo: variabili con le loro unità, obiettivo, vincoli.
    - Riconoscere gli schemi tipici: produzione, miscelazione, trasporto, più periodi.
    - Linearizzare min-max, valori assoluti e rapporti, e dire quando non si può.
    - Leggere prezzi ombra e costi ridotti con i loro intervalli di validità.
    - Costruire e risolvere il modello in `gurobipy`, e leggere quello che risponde.

Quattro capitoli, in quest'ordine: l'introduzione con la notazione del corso; i richiami di
dualità e sensitività che servono a interrogare una soluzione; il solver; le tecniche di
modellazione, una per pagina.

<div class="grid cards" markdown>

-   :material-flag-outline: **1. Introduzione alla modellazione PL**

    ---

    Che cosa faremo, la notazione, perché solo variabili continue, la mappa dei modelli e
    la struttura di ogni capitolo.

    [:octicons-arrow-right-24: Il capitolo](introduzione.md)

-   :material-function-variant: **2. Richiami: programmazione lineare e analisi di sensitività**

    ---

    Le regole della dualità, gli scarti complementari, prezzi ombra e costi ridotti con i
    loro intervalli, e il protocollo di sensitività usato in ogni capitolo.

    [:octicons-arrow-right-24: Il capitolo](teoria-lp.md)

-   :material-console: **3. Il solver: costruire, risolvere, interpretare**

    ---

    I cinque passi per costruire un modello con `gurobipy`, come farlo girare, come
    leggere soluzione, prezzi ombra, costi ridotti e intervalli di validità.

    [:octicons-arrow-right-24: Il capitolo](solver-lp.md)

-   :material-link-variant: **4. Tecniche di modellazione**

    ---

    Dalla descrizione al modello, produzione, miscelazione, trasporto, più periodi,
    min-max, valori assoluti, rapporti e ciò che la PL non sa esprimere.

    [:octicons-arrow-right-24: Le nove tecniche](tecniche.md)

</div>
