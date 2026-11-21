# Strumenti

Gli strumenti che servono prima dei modelli: la teoria che permette di
*interrogare* una soluzione (dualità, prezzi ombra, costi ridotti) e il solver con cui si
costruiscono e si risolvono i modelli.

<div class="grid cards" markdown>

-   :material-function-variant: **Teoria: programmazione lineare**

    ---

    Coppia primale-duale in forma generale, regole della dualità, teoremi debole e
    forte, scarti complementari, prezzi ombra, analisi di sensitività e il
    protocollo di sensitività usato in ogni capitolo.

    [:octicons-arrow-right-24: Vai alla pagina](teoria-lp.md)

-   :material-console: **Solver: modelli lineari**

    ---

    I cinque passi per costruire un modello con `gurobipy`, come farlo girare,
    come leggere soluzione, prezzi ombra, costi ridotti e intervalli di validità.

    [:octicons-arrow-right-24: Vai alla pagina](solver-lp.md)

</div>

## Modelli lineari e prerequisiti

Tutti i modelli del corso sono **LP** (*Linear Programming*): obiettivo e vincoli
lineari. Un LP è sempre convesso: ogni ottimo locale è globale e la dualità vale
senza eccezioni. Il prerequisito è il modulo
[Programmazione lineare](https://fabiofurini.github.io/programmazione-lineare/), in particolare la dualità e l'analisi di
sensitività. I modelli con obiettivo quadratico o non lineare sono nel modulo
[Modellazione PNL](https://fabiofurini.github.io/modellazione-pnl/).

**Notazione usata in tutto il corso.** Scalari e indici minuscoli ($x_{it}$,
$\lambda$); gli oggetti dei modelli (prodotti, canali, titoli, scenari…) sono
**numerati** e gli indici corrono su insiemi enumerati esplicitamente,
$i \in \{1, 2, \dots, n\}$; conteggi interi ($n \in \mathbb{Z}_{\ge 1}$), dati
razionali ($\mathbb{Q}$); vettori minuscoli in grassetto ($\boldsymbol{x}$),
matrici maiuscole in grassetto ($\boldsymbol{A}$). Variabili duali $\pi_i$, costi
ridotti $\bar c_j$, scarti $\bar s_i$: la **barra** indica i valori di una
soluzione ammissibile, la **tilde** quelli di una soluzione ottima
($\tilde x_j$, $\tilde z$). Nei modelli la dicitura è sempre «soggetto a», le
variabili sono introdotte prima della formulazione e i vincoli che le definiscono
chiudono il modello.
