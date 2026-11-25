# 4. Tecniche di modellazione

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf)

**Classe:** LP · tecniche di modellazione · **Esempi:** tre istanze risolte e [nove modelli svolti](#modelli-svolti)

!!! nota "Prerequisiti"

    - Dal modulo *Programmazione lineare*, [Capitolo 4 «Problemi di programmazione lineare»](https://fabiofurini.github.io/programmazione-lineare/problemi-pl/04-problemi-pl/): il metodo grafico, usato per verificare modelli piccoli.

    - Dal modulo *Programmazione lineare*, [Capitolo 5 «Esiti possibili e formulazioni equivalenti»](https://fabiofurini.github.io/programmazione-lineare/problemi-pl/05-esiti-equivalenze/): problemi LP generici e le loro riformulazioni equivalenti, con variabili libere.

!!! chiave "Obiettivi"

    Alla fine di questo capitolo sarai in grado di:

    - scrivere un modello LP da una descrizione: variabili decisionali con le loro unità, funzione obiettivo, vincoli;

    - modellare problemi di pianificazione della produzione, miscelazione, trasporto e pianificazione su più periodi;

    - linearizzare obiettivi min-max, valori assoluti e vincoli con rapporti;

    - riconoscere i requisiti che richiedono variabili intere.

Come si passa dalla descrizione di un problema a un modello di programmazione lineare: il
metodo in tre passi, quattro schemi tipici, tre linearizzazioni e i requisiti che la
programmazione lineare non sa esprimere. I casi dei capitoli successivi usano queste tecniche
su dati reali.

!!! note "Come si legge ogni tecnica"
    Gli schemi tipici (4.2–4.5) hanno il problema a parole con i dati simbolici, le
    variabili con il loro conteggio, il modello con la lettura dei vincoli e un esempio
    numerico. Le linearizzazioni (4.6–4.8) hanno la forma non lineare, i vincoli lineari che
    la sostituiscono, il perché e le condizioni in cui valgono.

<div class="grid cards" markdown>

-   **4.1 Dalla descrizione al modello**

    ---

    Variabili, obiettivo, vincoli: tre passi in quest'ordine, i dati simbolici e i tre
    errori più frequenti.

    [:octicons-arrow-right-24: il metodo](tecniche-01.md)

-   **4.2 Pianificazione della produzione**

    ---

    Profitto massimo con risorse limitate: un LP in forma canonica di massimo.

    [:octicons-arrow-right-24: produzione](tecniche-02.md)

-   **4.3 Miscelazione**

    ---

    Una miscela di costo minimo con quantità minime dei componenti e frazioni della
    miscela scritte come vincoli lineari.

    [:octicons-arrow-right-24: miscelazione](tecniche-03.md)

-   **4.4 Trasporto**

    ---

    Il piano di costo minimo dai magazzini ai clienti, ammissibile se e solo se
    $\sum_i a_i \ge \sum_j d_j$.

    [:octicons-arrow-right-24: trasporto](tecniche-04.md)

-   **4.5 Pianificazione su più periodi**

    ---

    Produzione e magazzino legati dal bilancio delle scorte $y_{t-1} + x_t - y_t = d_t$.

    [:octicons-arrow-right-24: più periodi](tecniche-05.md)

-   **4.6 Min-max e max-min**

    ---

    $\min w$ con $w \ge \sum_j a_{ij} x_j$: una variabile libera in più, e solo nel verso
    giusto.

    [:octicons-arrow-right-24: min-max](tecniche-06.md)

-   **4.7 Valori assoluti**

    ---

    $w_i \ge \pm \sum_j a_{ij} x_j$, oppure $w_i^{+} - w_i^{-}$, sotto la giusta
    condizione di segno.

    [:octicons-arrow-right-24: valori assoluti](tecniche-07.md)

-   **4.8 Rapporti e percentuali**

    ---

    Si moltiplica per il denominatore, se è sicuramente positivo.

    [:octicons-arrow-right-24: rapporti](tecniche-08.md)

-   **4.9 Che cosa non si può modellare**

    ---

    Quantità indivisibili, decisioni sì/no, costi fissi, vincoli disgiuntivi, quantità
    minime positive: servono variabili intere.

    [:octicons-arrow-right-24: i limiti](tecniche-09.md)

</div>

## La mappa delle tecniche

Si legge dalla prima colonna («che cosa voglio scrivere») alla seconda («i vincoli che lo
dicono»).

| Tecnica | Formulazione |
|---|---|
| [4.2 produzione](tecniche-02.md) | $\max \sum_j c_j x_j$ con $\sum_j a_{ij} x_j \le b_i$ |
| [4.3 miscelazione](tecniche-03.md) | $\sum_j x_j = d$ e $\sum_j p_{kj} x_j \ge q_k$ |
| [4.4 trasporto](tecniche-04.md) | $\sum_j x_{ij} \le a_i$ e $\sum_i x_{ij} \ge d_j$ |
| [4.5 più periodi](tecniche-05.md) | $y_{t-1} + x_t - y_t = d_t$ |
| [4.6 min-max](tecniche-06.md) | $\min w$ con $w \ge \sum_j a_{ij} x_j$ |
| [4.7 valore assoluto](tecniche-07.md) | $w_i \ge \pm \sum_j a_{ij} x_j$, oppure $w_i^{+} - w_i^{-}$ |
| [4.8 rapporto](tecniche-08.md) | $\sum_j (a_j - g\, e_j)\, x_j \le 0$ |

<!-- modelli-svolti:inizio -->
## Modelli svolti

Nove modelli svolti, come nella dispensa: l'enunciato, le domande e lo svolgimento completo.

**Modelli simbolici**

- [Esempio 4.4 — Produzione in orario ordinario e in straordinario](tecniche-modelli-01.md)
- [Esempio 4.5 — Trasporto dai magazzini ai clienti](tecniche-modelli-02.md)
- [Esempio 4.6 — Pianificazione della dieta](tecniche-modelli-03.md)
- [Esempio 4.7 — Pianificazione della dieta per più classi](tecniche-modelli-04.md)
- [Esempio 4.8 — Produzione su più periodi con acquisti e stoccaggio](tecniche-modelli-05.md)

**Modelli numerici**

- [Esempio 4.9 — Scelta dei dolci](tecniche-modelli-06.md)
- [Esempio 4.10 — Produzione e stoccaggio di torte di frutta](tecniche-modelli-07.md)
- [Esempio 4.11 — Miscelazione di petrolio greggio in una raffineria](tecniche-modelli-08.md)
- [Esempio 4.12 — Produzione di tre farmaci](tecniche-modelli-09.md)

<!-- modelli-svolti:fine -->

## In sintesi

!!! chiave "In sintesi"

    - Un modello LP si costruisce in tre passi: variabili decisionali (con unità e domini), funzione obiettivo, vincoli.

    - Gli errori più frequenti sono i vincoli di non negatività dimenticati, i vincoli non coerenti nelle unità di misura, e le variabili usate nella funzione obiettivo senza essere state definite.

    - Produzione, miscelazione, trasporto e pianificazione su più periodi seguono schemi tipici, con vincoli di bilancio che legano i periodi.

    - Obiettivi min-max, valori assoluti e rapporti diventano lineari con una variabile ausiliaria o moltiplicando per un denominatore positivo; quantità indivisibili e condizioni logiche richiedono variabili intere.

## Esercizi

1. **Pianificazione della produzione (1)**

    Un'azienda produce $r \in \mathbb{Z}_{\ge 1}$ prodotti diversi utilizzando $s \in \mathbb{Z}_{\ge 1}$ risorse (per esempio ore macchina e ore di lavoro). Per ogni prodotto $j \in \{1, 2, \dots, r\}$, il valore $c_j \in \mathbb{Q}_{>0}$ è il profitto in euro di un'unità di prodotto e il valore $u_j \in \mathbb{Q}_{>0}$ è il numero massimo di unità che il mercato può assorbire alla settimana. Per ogni risorsa $i \in \{1, 2, \dots, s\}$ e ogni prodotto $j \in \{1, 2, \dots, r\}$, il valore $a_{ij} \in \mathbb{Q}_{\ge 0}$ è la quantità di risorsa $i$ consumata da un'unità di prodotto $j$. Per ogni risorsa $i \in \{1, 2, \dots, s\}$, il valore $b_i \in \mathbb{Q}_{>0}$ è la quantità disponibile alla settimana; inoltre, l'azienda può acquistare al massimo $e_i \in \mathbb{Q}_{\ge 0}$ unità aggiuntive della risorsa alla settimana, a un costo di $g_i \in \mathbb{Q}_{>0}$ euro per unità. L'azienda vuole determinare un piano di produzione settimanale di profitto massimo che rispetti i vincoli descritti sopra.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Consideriamo ora un'istanza del problema con $r=3$ prodotti e $s=2$ risorse. Gli altri dati sono:

        |  | $j=1$ | $j=2$ | $j=3$ |
        |---|---|---|---|
        | $c_j$ | 12 | 18 | 10 |
        | $u_j$ | 20 | 15 | 20 |
        | $a_{1j}$ | 2 | 3 | 1 |
        | $a_{2j}$ | 1 | 2 | 2 |

        |  | $i=1$ | $i=2$ |
        |---|---|---|
        | $b_i$ | 50 | 50 |
        | $e_i$ | 20 | 10 |
        | $g_i$ | 3 | 2 |

        Scrivere il modello LP per questa istanza.

    3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

    4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

    5. Consideriamo la seguente soluzione del modello LP dell'istanza:

        $$
        \tilde x_1 = 20,~~\tilde x_2 = 5,~~\tilde x_3 = 15,~~\tilde y_1 = 20,~~\tilde y_2 = 10,
        $$

        dove $y_i$ è la quantità di risorsa $i$ acquistata. Dimostrare che è una soluzione ottima trovando, con le condizioni degli scarti complementari, una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

    <!-- soluzione:inizio -->
    ??? soluzione "Soluzione"

        1. I dati del modello sono i seguenti:

            | **Simbolo** | **Tipo** | **Significato** |
            |---|---|---|
            | $r$ | $\mathbb{Z}_{\ge 1}$ | numero di prodotti |
            | $s$ | $\mathbb{Z}_{\ge 1}$ | numero di risorse |
            | $c_j$ | $\mathbb{Q}_{>0}$ | profitto di un'unità di prodotto $j$ (euro) |
            | $u_j$ | $\mathbb{Q}_{>0}$ | domanda settimanale massima del prodotto $j$ (unità) |
            | $a_{ij}$ | $\mathbb{Q}_{\ge 0}$ | quantità di risorsa $i$ consumata da un'unità di prodotto $j$ |
            | $b_i$ | $\mathbb{Q}_{>0}$ | disponibilità settimanale della risorsa $i$ |
            | $e_i$ | $\mathbb{Q}_{\ge 0}$ | quantità aggiuntiva massima di risorsa $i$ che si può acquistare |
            | $g_i$ | $\mathbb{Q}_{>0}$ | costo di un'unità aggiuntiva di risorsa $i$ (euro) |

            Introduciamo le seguenti $r + s$ variabili non negative:

            $$
            \begin{cases}
            x_j = \textrm{ unità di prodotto } j \text{ prodotte alla settimana}, & \forall j \in \{1,2,\dots,r\},\\[1ex]
            y_i = \textrm{ unità di risorsa } i \text{ acquistate alla settimana}, & \forall i \in \{1,2,\dots,s\}.
            \end{cases}
            $$

            Con queste variabili, un modello LP per il problema è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es1-LP"></a>

                \begin{align*}
                \max ~~ \sum_{j=1}^{r} c_j \; x_j - \sum_{i=1}^{s} g_i \; y_i & & \label{modellazione-es1:obj}  \tag{1a}\\[1ex]
                \text{soggetto a} \quad \sum_{j=1}^{r} a_{ij} \; x_j - y_i &\le b_i, & \forall i \in \{1,2,\dots,s\}, \label{modellazione-es1:cons1}  \tag{1b}\\[1ex]
                y_i &\le e_i, & \forall i \in \{1,2,\dots,s\}, \label{modellazione-es1:cons2}  \tag{1c}\\[1ex]
                x_j &\le u_j, & \forall j \in \{1,2,\dots,r\}, \label{modellazione-es1:cons3}  \tag{1d}\\[1ex]
                x_j &\ge 0, & \forall j \in \{1,2,\dots,r\}, \label{modellazione-es1:cons4}  \tag{1e}\\[1ex]
                y_i &\ge 0, & \forall i \in \{1,2,\dots,s\}. \label{modellazione-es1:cons5} \tag{1f}
                \end{align*}

            Descrizione della funzione obiettivo e dei vincoli del modello LP:

            - la funzione obiettivo lineare $\eqref{modellazione-es1:obj}$ massimizza il profitto totale del piano di produzione, cioè il profitto dei prodotti meno il costo delle risorse aggiuntive acquistate;

            - i vincoli lineari $\eqref{modellazione-es1:cons1}$ garantiscono che, per ogni risorsa, la quantità consumata non superi la quantità disponibile più la quantità acquistata ($s$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es1:cons2}$ garantiscono che, per ogni risorsa, la quantità acquistata non superi il suo massimo ($s$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es1:cons3}$ garantiscono che, per ogni prodotto, la produzione non superi la domanda del mercato ($r$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es1:cons4}$ e $\eqref{modellazione-es1:cons5}$ definiscono le variabili del modello LP.

            Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

        2. Il modello LP [(1)](#eq-modellazione-es1-LP) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcr}
            {\max} & {12\,x_{1}} & {+} & {18\,x_{2}} & {+} & {10\,x_{3}} & {-} & {3\,y_{1}} & {-} & {2\,y_{2}} \\[1ex]
            \text{soggetto a} & {2\,x_{1}} & {+} & {3\,x_{2}} & {+} & {x_{3}} & {-} & {y_{1}} &  &  & {\le} & {50} \\[1ex]
            & {x_{1}} & {+} & {2\,x_{2}} & {+} & {2\,x_{3}} &  &  & {-} & {y_{2}} & {\le} & {50} \\[1ex]
            &  &  &  &  &  &  & {y_{1}} &  &  & {\le} & {20} \\[1ex]
            &  &  &  &  &  &  &  &  & {y_{2}} & {\le} & {10} \\[1ex]
            & {x_{1}} &  &  &  &  &  &  &  &  & {\le} & {20} \\[1ex]
            &  &  & {x_{2}} &  &  &  &  &  &  & {\le} & {15} \\[1ex]
            &  &  &  &  & {x_{3}} &  &  &  &  & {\le} & {20} \\[1ex]
            & {x_{1},} &  & {x_{2},} &  & {x_{3},} &  & {y_{1},} &  & {y_{2}} & {\ge} & {0}
            \end{array}
            $$

        3. Per esempio, senza acquistare risorse aggiuntive, ponendo:

            $$
            \bar{x}_{1}=20,~~\bar{x}_{2}=0,~~\bar{x}_{3}=10,~~\bar{y}_{1}=0,~~\bar{y}_{2}=0
            $$

            otteniamo una soluzione ammissibile: le due risorse consumano $2 \cdot 20 + 10 = 50 \le 50$ e $20 + 2 \cdot 10 = 40 \le 50$ unità, e le domande sono rispettate. Il valore della funzione obiettivo di questa soluzione ammissibile è:

            $$
            \sum_{j=1}^{r} c_j \; \bar x_j - \sum_{i=1}^{s} g_i \; \bar y_i = 12 \cdot 20 + 18 \cdot 0 + 10 \cdot 10 - 3 \cdot 0 - 2 \cdot 0 = 340
            $$

            di conseguenza $340$ è un lower bound sul valore ottimo del modello LP [(1)](#eq-modellazione-es1-LP). Quindi, per questa istanza, abbiamo:

            $$
            340 ~\le~ z(~LP~)
            $$

        4. Usando

            - una variabile duale non negativa $\pi_i$ per ogni vincolo $\eqref{modellazione-es1:cons1}$ ($i \in \{1,2,\dots,s\}$)

            - una variabile duale non negativa $\sigma_i$ per ogni vincolo $\eqref{modellazione-es1:cons2}$ ($i \in \{1,2,\dots,s\}$)

            - una variabile duale non negativa $\rho_j$ per ogni vincolo $\eqref{modellazione-es1:cons3}$ ($j \in \{1,2,\dots,r\}$)

            il duale del modello LP [(1)](#eq-modellazione-es1-LP) è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es1-DUAL"></a>

                \begin{align*}
                \min ~~ \sum_{i=1}^{s} b_i \; \pi_i + \sum_{i=1}^{s} e_i \; \sigma_i + \sum_{j=1}^{r} u_j \; \rho_j & & \label{modellazione-es1:dobj}  \tag{2a}\\[1ex]
                \text{soggetto a} \quad \sum_{i=1}^{s} a_{ij} \; \pi_i + \rho_j &\ge c_j, & \forall j \in \{1,2,\dots,r\}, \label{modellazione-es1:dcons1}  \tag{2b}\\[1ex]
                - \pi_i + \sigma_i &\ge - g_i, & \forall i \in \{1,2,\dots,s\}, \label{modellazione-es1:dcons2}  \tag{2c}\\[1ex]
                \pi_i &\ge 0, & \forall i \in \{1,2,\dots,s\},  \tag{2d}\\[1ex]
                \sigma_i &\ge 0, & \forall i \in \{1,2,\dots,s\},  \tag{2e}\\[1ex]
                \rho_j &\ge 0, & \forall j \in \{1,2,\dots,r\}. \tag{2f}
                \end{align*}

            Il modello duale [(2)](#eq-modellazione-es1-DUAL) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcrcr}
            {\min} & {50\,\pi_{1}} & {+} & {50\,\pi_{2}} & {+} & {20\,\sigma_{1}} & {+} & {10\,\sigma_{2}} & {+} & {20\,\rho_{1}} & {+} & {15\,\rho_{2}} & {+} & {20\,\rho_{3}} \\[1ex]
            \text{soggetto a} & {2\,\pi_{1}} & {+} & {\pi_{2}} &  &  &  &  & {+} & {\rho_{1}} &  &  &  &  & {\ge} & {12} \\[1ex]
            & {3\,\pi_{1}} & {+} & {2\,\pi_{2}} &  &  &  &  &  &  & {+} & {\rho_{2}} &  &  & {\ge} & {18} \\[1ex]
            & {\pi_{1}} & {+} & {2\,\pi_{2}} &  &  &  &  &  &  &  &  & {+} & {\rho_{3}} & {\ge} & {10} \\[1ex]
            & {-\pi_{1}} &  &  & {+} & {\sigma_{1}} &  &  &  &  &  &  &  &  & {\ge} & {-3} \\[1ex]
            &  & {-} & {\pi_{2}} &  &  & {+} & {\sigma_{2}} &  &  &  &  &  &  & {\ge} & {-2} \\[1ex]
            & {\pi_{1},} &  & {\pi_{2},} &  & {\sigma_{1},} &  & {\sigma_{2},} &  & {\rho_{1},} &  & {\rho_{2},} &  & {\rho_{3}} & {\ge} & {0}
            \end{array}
            $$

            Per esempio, valutando ogni risorsa al suo prezzo di acquisto:

            $$
            \bar\pi_1 = g_1 = 3,~~\bar\pi_2 = g_2 = 2,~~\bar\sigma_1 = 0,~~\bar\sigma_2 = 0,
            $$

            i vincoli $\eqref{modellazione-es1:dcons2}$ sono soddisfatti, e ponendo:

            $$
            \begin{gathered}
            \bar\rho_1 = \max\{0,\, 12 - 2 \cdot 3 - 2\} = 4,~~\bar\rho_2 = \max\{0,\, 18 - 3 \cdot 3 - 2 \cdot 2\} = 5, \\[0.5ex]
            \bar\rho_3 = \max\{0,\, 10 - 3 - 2 \cdot 2\} = 3
            \end{gathered}
            $$

            sono soddisfatti anche i vincoli $\eqref{modellazione-es1:dcons1}$: abbiamo una soluzione duale ammissibile.

            Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

            \begin{align*}
            \sum_{i=1}^{s} b_i \; \bar\pi_i + \sum_{i=1}^{s} e_i \; \bar\sigma_i + \sum_{j=1}^{r} u_j \; \bar\rho_j &= 50 \cdot 3 + 50 \cdot 2 + 20 \cdot 0 + 10 \cdot 0 \\
            &+ 20 \cdot 4 + 15 \cdot 5 + 20 \cdot 3 \\
            &= 465
            \end{align*}

            Di conseguenza, $465$ è un upper bound sul valore ottimo del modello LP. Quindi, per questa istanza, abbiamo:

            $$
            340 ~\le~ z(~LP~) ~\le~ 465
            $$

        5. La soluzione $\tilde x$, $\tilde y$ è ammissibile: le due risorse consumano $2 \cdot 20 + 3 \cdot 5 + 15 = 70 = 50 + 20$ e $20 + 2 \cdot 5 + 2 \cdot 15 = 60 = 50 + 10$ unità, e tutti gli altri vincoli sono soddisfatti. Il suo valore è $12 \cdot 20 + 18 \cdot 5 + 10 \cdot 15 - 3 \cdot 20 - 2 \cdot 10 = 400$.

            Le condizioni degli scarti complementari danno:

            - $\tilde x_2 = 5 < 15$ e $\tilde x_3 = 15 < 20$: i corrispondenti vincoli $\eqref{modellazione-es1:cons3}$ non sono attivi, quindi $\tilde\rho_2 = 0$ e $\tilde\rho_3 = 0$;

            - tutte e cinque le variabili primali sono positive: i cinque vincoli duali sono soddisfatti all'uguaglianza:

                $$
                \begin{cases}
                2\,\pi_1 + \pi_2 + \rho_1 = 12\\[0.5ex]
                3\,\pi_1 + 2\,\pi_2 = 18\\[0.5ex]
                \pi_1 + 2\,\pi_2 = 10\\[0.5ex]
                -\pi_1 + \sigma_1 = -3\\[0.5ex]
                -\pi_2 + \sigma_2 = -2
                \end{cases}
                $$

            Dalla seconda e dalla terza equazione, $\tilde\pi_1 = 4$ e $\tilde\pi_2 = 3$; quindi $\tilde\rho_1 = 12 - 8 - 3 = 1$, $\tilde\sigma_1 = 4 - 3 = 1$ e $\tilde\sigma_2 = 3 - 2 = 1$. Tutti questi valori sono non negativi, quindi la soluzione duale

            $$
            \tilde\pi_1 = 4,~~\tilde\pi_2 = 3,~~\tilde\sigma_1 = 1,~~\tilde\sigma_2 = 1,~~\tilde\rho_1 = 1,~~\tilde\rho_2 = 0,~~\tilde\rho_3 = 0
            $$

            è ammissibile, e il suo valore è:

            $$
            50 \cdot 4 + 50 \cdot 3 + 20 \cdot 1 + 10 \cdot 1 + 20 \cdot 1 + 15 \cdot 0 + 20 \cdot 0 = 400 .
            $$

            La soluzione primale e quella duale hanno lo stesso valore: per il teorema di dualità forte entrambe sono ottime, e

            $$
            z(~LP~) = 400 .
            $$

            In parole: conviene acquistare tutte le risorse aggiuntive, poiché all'ottimo un'unità in più di risorsa $i$ vale $\tilde\pi_i$ euro, più del suo prezzo $g_i$ ($\tilde\pi_1 = 4 > 3$ e $\tilde\pi_2 = 3 > 2$).
    <!-- soluzione:fine -->

2. **Pianificazione della produzione (2)**

    Un'officina di biciclette assembla biciclette da città e mountain bike, vendute rispettivamente a 200 euro e 400 euro. Ogni bicicletta richiede un telaio del proprio tipo. L'officina può saldare i telai internamente: un telaio da città richiede 2 ore di saldatura e 20 euro di materiale, mentre un telaio da mountain bike richiede 3 ore di saldatura e 40 euro di materiale; sono disponibili 150 ore di saldatura alla settimana. In alternativa, i telai si possono acquistare da un fornitore, a 60 euro (telaio da città) e a 100 euro (telaio da mountain bike). L'assemblaggio di una bicicletta da città richiede 1 ora di lavoro e quello di una mountain bike ne richiede 2; sono disponibili 120 ore di assemblaggio alla settimana. Il mercato può assorbire al massimo 30 mountain bike alla settimana. L'obiettivo dell'officina è determinare un piano di produzione settimanale che massimizzi il profitto totale, cioè il ricavo delle biciclette meno il costo dei telai.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Trovare una soluzione ammissibile del modello LP e, di conseguenza, un lower bound sul suo valore ottimo.

    3. Scrivere il modello duale del modello LP. Trovare una soluzione ammissibile del modello duale e, di conseguenza, un upper bound sul valore ottimo del modello LP.

    4. Dimostrare che il piano in cui l'officina salda 30 telai da città e 30 telai da mountain bike, e acquista 30 telai da città, è ottimo, trovando con le condizioni degli scarti complementari una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

    <!-- soluzione:inizio -->
    ??? soluzione "Soluzione"

        !!! nota ""

            Assumiamo che l'officina possa produrre quantità frazionarie qualsiasi di biciclette (una bicicletta iniziata in una settimana può essere completata nella successiva).

        1. La decisione riguarda, per ogni tipo di bicicletta, quante biciclette assemblare con un telaio saldato internamente e quante con un telaio acquistato dal fornitore. Introduciamo le seguenti quattro variabili decisionali non negative:

            $$
            \left\{
            \begin{aligned}
            m_1 &= \text{biciclette da città assemblate con un telaio saldato internamente}, \\
            m_2 &= \text{mountain bike assemblate con un telaio saldato internamente}, \\
            p_1 &= \text{biciclette da città assemblate con un telaio acquistato}, \\
            p_2 &= \text{mountain bike assemblate con un telaio acquistato}.
            \end{aligned}
            \right.
            $$

            Il profitto di una bicicletta da città è $200 - 20 = 180$ euro se il telaio è saldato internamente e $200 - 60 = 140$ euro se il telaio è acquistato; il profitto di una mountain bike è, rispettivamente, $400 - 40 = 360$ e $400 - 100 = 300$ euro. Con queste variabili, un modello di programmazione lineare (LP) per il problema è il seguente:

            !!! chiave ""

                $$
                \begin{array}{rrcrcrcrcr}
                {\max} & {180\,m_{1}} & {+} & {360\,m_{2}} & {+} & {140\,p_{1}} & {+} & {300\,p_{2}} \\[1ex]
                \text{soggetto a} & {2\,m_{1}} & {+} & {3\,m_{2}} &  &  &  &  & {\le} & {150} \\[1ex]
                & {m_{1}} & {+} & {2\,m_{2}} & {+} & {p_{1}} & {+} & {2\,p_{2}} & {\le} & {120} \\[1ex]
                &  &  & {m_{2}} &  &  & {+} & {p_{2}} & {\le} & {30} \\[1ex]
                & {m_{1},} &  & {m_{2},} &  & {p_{1},} &  & {p_{2}} & {\ge} & {0}
                \end{array}
                $$

            Descrizione della funzione obiettivo e dei vincoli del modello LP:

            - la funzione obiettivo lineare massimizza il profitto totale, cioè il ricavo delle biciclette meno il costo del materiale dei telai saldati e dei telai acquistati;

            - il primo vincolo lineare impone che le ore di saldatura usate per i telai prodotti internamente non superino quelle disponibili;

            - il secondo vincolo lineare impone che le ore di assemblaggio, necessarie a tutte le biciclette, non superino quelle disponibili;

            - il terzo vincolo lineare impone che le mountain bike prodotte non superino la domanda del mercato;

            - l'ultimo vincolo definisce le variabili del modello.

            Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

        2. Per esempio, saldando tutti i telai internamente e non acquistandone nessuno:

            $$
            \bar m_1 = 30,~~\bar m_2 = 30,~~\bar p_1 = 0,~~\bar p_2 = 0
            $$

            otteniamo una soluzione ammissibile: usa $2 \cdot 30 + 3 \cdot 30 = 150$ ore di saldatura e $30 + 2 \cdot 30 = 90 \le 120$ ore di assemblaggio, e produce $30$ mountain bike. Il valore della funzione obiettivo di questa soluzione ammissibile è:

            $$
            180 \cdot 30 + 360 \cdot 30 + 140 \cdot 0 + 300 \cdot 0 = 16200
            $$

            di conseguenza $16200$ è un lower bound sul valore ottimo del modello LP. Quindi, abbiamo:

            $$
            16200 ~\le~ z(~LP~)
            $$

        3. Usando una variabile duale non negativa $u_1$ per il vincolo di saldatura, $u_2$ per il vincolo di assemblaggio e $u_3$ per il vincolo di mercato, il duale del modello LP è il seguente:

            $$
            \begin{array}{rrcrcrcr}
            {\min} & {150\,u_{1}} & {+} & {120\,u_{2}} & {+} & {30\,u_{3}} \\[1ex]
            \text{soggetto a} & {2\,u_{1}} & {+} & {u_{2}} &  &  & {\ge} & {180} \\[1ex]
            & {3\,u_{1}} & {+} & {2\,u_{2}} & {+} & {u_{3}} & {\ge} & {360} \\[1ex]
            &  &  & {u_{2}} &  &  & {\ge} & {140} \\[1ex]
            &  &  & {2\,u_{2}} & {+} & {u_{3}} & {\ge} & {300} \\[1ex]
            & {u_{1},} &  & {u_{2},} &  & {u_{3}} & {\ge} & {0}
            \end{array}
            $$

            Per esempio, ponendo:

            $$
            \bar u_1 = 0,~~\bar u_3 = 0,
            $$

            e ponendo:

            $$
            \bar u_2 = \max\left\{180,~\frac{360}{2},~140,~\frac{300}{2}\right\} = 180
            $$

            otteniamo una soluzione duale ammissibile. Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

            $$
            150 \cdot 0 + 120 \cdot 180 + 30 \cdot 0 = 21600
            $$

            Di conseguenza, $21600$ è un upper bound sul valore ottimo del modello LP. Quindi, abbiamo:

            $$
            16200 ~\le~ z(~LP~) ~\le~ 21600
            $$

        4. Il piano della domanda è la soluzione

            $$
            \tilde m_1 = 30,~~\tilde m_2 = 30,~~\tilde p_1 = 30,~~\tilde p_2 = 0 .
            $$

            È ammissibile: usa $2 \cdot 30 + 3 \cdot 30 = 150$ ore di saldatura e $30 + 2 \cdot 30 + 30 = 120$ ore di assemblaggio, e produce $30$ mountain bike. Il suo valore è $180 \cdot 30 + 360 \cdot 30 + 140 \cdot 30 = 20400$.

            Le variabili $\tilde m_1$, $\tilde m_2$ e $\tilde p_1$ sono positive, quindi, per le condizioni degli scarti complementari, i primi tre vincoli duali sono soddisfatti all'uguaglianza:

            $$
            \begin{cases}
            2\,u_1 + u_2 = 180\\[0.5ex]
            3\,u_1 + 2\,u_2 + u_3 = 360\\[0.5ex]
            u_2 = 140
            \end{cases}
            $$

            la cui soluzione è $\tilde u_2 = 140$, $\tilde u_1 = (180 - 140)/2 = 20$ e $\tilde u_3 = 360 - 60 - 280 = 20$. I tre valori sono non negativi e il quarto vincolo duale è soddisfatto, poiché $2 \cdot 140 + 20 = 300 \ge 300$: la soluzione duale

            $$
            \tilde u_1 = 20,~~\tilde u_2 = 140,~~\tilde u_3 = 20
            $$

            è ammissibile, e il suo valore è:

            $$
            150 \cdot 20 + 120 \cdot 140 + 30 \cdot 20 = 20400 .
            $$

            La soluzione primale e quella duale hanno lo stesso valore: per il teorema di dualità forte entrambe sono ottime, e

            $$
            z(~LP~) = 20400 .
            $$

            I valori duali sono i valori marginali delle risorse: un'ora di saldatura in più vale $20$ euro, un'ora di assemblaggio in più $140$ euro, e una mountain bike in più venduta sul mercato $20$ euro.
    <!-- soluzione:fine -->

3. **Miscelazione (1)**

    Una fonderia deve produrre $d \in \mathbb{Q}_{>0}$ tonnellate di una lega fondendo insieme $r \in \mathbb{Z}_{\ge 1}$ materie prime (minerali e rottami metallici). Per ogni materia prima $j \in \{1, 2, \dots, r\}$, il valore $c_j \in \mathbb{Q}_{>0}$ è il costo in migliaia di euro di una tonnellata e il valore $a_j \in \mathbb{Q}_{>0}$ è il numero di tonnellate disponibili. La qualità della lega dipende da $s \in \mathbb{Z}_{\ge 1}$ elementi chimici. Per ogni elemento $k \in \{1, 2, \dots, s\}$ e ogni materia prima $j \in \{1, 2, \dots, r\}$, il valore $p_{kj} \in \mathbb{Q}_{\ge 0}$ è la percentuale di elemento $k$ contenuta nella materia prima $j$. La percentuale di ogni elemento $k \in \{1, 2, \dots, s\}$ nella lega deve essere almeno $\ell_k \in \mathbb{Q}_{\ge 0}$ e al più $u_k \in \mathbb{Q}_{>0}$, con $\ell_k \le u_k$. La fonderia vuole determinare una miscela di costo minimo che rispetti i vincoli descritti sopra.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Consideriamo ora un'istanza del problema in cui la fonderia deve produrre $d = 100$ tonnellate di lega da $r=3$ materie prime, e la qualità dipende da $s=2$ elementi. Gli altri dati sono:

        |  | $j=1$ | $j=2$ | $j=3$ |
        |---|---|---|---|
        | $c_j$ | 5 | 2 | 4 |
        | $a_j$ | 40 | 60 | 50 |
        | $p_{1j}$ | 4 | 1 | 2 |
        | $p_{2j}$ | 1 | 3 | 2 |

        |  | $k=1$ | $k=2$ |
        |---|---|---|
        | $\ell_k$ | 2 | 2 |
        | $u_k$ | 3 | 3 |

        Scrivere il modello LP per questa istanza.

    3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

    4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

    5. Dimostrare che la miscela con $\tilde x_1 = 30$, $\tilde x_2 = 60$ e $\tilde x_3 = 10$ tonnellate delle tre materie prime è ottima, trovando con le condizioni degli scarti complementari una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

    <!-- soluzione:inizio -->
    ??? soluzione "Soluzione"

        1. I dati del modello sono i seguenti:

            | **Simbolo** | **Tipo** | **Significato** |
            |---|---|---|
            | $d$ | $\mathbb{Q}_{>0}$ | tonnellate di lega da produrre |
            | $r$ | $\mathbb{Z}_{\ge 1}$ | numero di materie prime |
            | $s$ | $\mathbb{Z}_{\ge 1}$ | numero di elementi chimici |
            | $c_j$ | $\mathbb{Q}_{>0}$ | costo di una tonnellata di materia prima $j$ (migliaia di euro) |
            | $a_j$ | $\mathbb{Q}_{>0}$ | tonnellate disponibili di materia prima $j$ |
            | $p_{kj}$ | $\mathbb{Q}_{\ge 0}$ | percentuale di elemento $k$ nella materia prima $j$ |
            | $\ell_k$ | $\mathbb{Q}_{\ge 0}$ | percentuale minima di elemento $k$ nella lega |
            | $u_k$ | $\mathbb{Q}_{>0}$ | percentuale massima di elemento $k$ nella lega |

            Introduciamo le seguenti $r$ variabili non negative:

            $$
            x_j = \text{  tonnellate di materia prima } j \text{ usate nella miscela}, \qquad \forall j \in \{1,2,\dots,r\} .
            $$

            La percentuale di elemento $k$ nella lega è il rapporto

            $$
            \frac{\sum_{j=1}^{r} p_{kj} \; x_j}{\sum_{j=1}^{r} x_j} ,
            $$

            che non è una funzione lineare delle variabili. Poiché il suo denominatore è uguale a $d > 0$, la richiesta che questo rapporto sia almeno $\ell_k$ si scrive, moltiplicando entrambi i membri per il denominatore, come $\sum_{j} p_{kj}\, x_j \ge \ell_k \sum_{j} x_j$, cioè $\sum_{j} (p_{kj} - \ell_k)\, x_j \ge 0$; lo stesso vale per la percentuale massima $u_k$. Con queste variabili, un modello LP per il problema è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es3-LP"></a>

                \begin{align*}
                \min ~~ \sum_{j=1}^{r} c_j \; x_j & & \label{modellazione-es3:obj}  \tag{1a}\\[1ex]
                \text{soggetto a} \quad \sum_{j=1}^{r} x_j &= d, & \label{modellazione-es3:cons1}  \tag{1b}\\[1ex]
                \sum_{j=1}^{r} (p_{kj} - \ell_k) \; x_j &\ge 0, & \forall k \in \{1,2,\dots,s\}, \label{modellazione-es3:cons2}  \tag{1c}\\[1ex]
                \sum_{j=1}^{r} (p_{kj} - u_k) \; x_j &\le 0, & \forall k \in \{1,2,\dots,s\}, \label{modellazione-es3:cons3}  \tag{1d}\\[1ex]
                x_j &\le a_j, & \forall j \in \{1,2,\dots,r\}, \label{modellazione-es3:cons4}  \tag{1e}\\[1ex]
                x_j &\ge 0, & \forall j \in \{1,2,\dots,r\}. \label{modellazione-es3:cons5} \tag{1f}
                \end{align*}

            Descrizione della funzione obiettivo e dei vincoli del modello LP:

            - la funzione obiettivo lineare $\eqref{modellazione-es3:obj}$ minimizza il costo totale delle materie prime usate;

            - il vincolo lineare $\eqref{modellazione-es3:cons1}$ garantisce che vengano prodotte esattamente $d$ tonnellate di lega (un vincolo lineare);

            - i vincoli lineari $\eqref{modellazione-es3:cons2}$ garantiscono che, per ogni elemento, la sua percentuale nella lega sia almeno quella minima ($s$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es3:cons3}$ garantiscono che, per ogni elemento, la sua percentuale nella lega sia al più quella massima ($s$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es3:cons4}$ garantiscono che, per ogni materia prima, la quantità usata non superi la quantità disponibile ($r$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es3:cons5}$ definiscono le variabili del modello LP.

            Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

        2. I coefficienti dei vincoli $\eqref{modellazione-es3:cons2}$ e $\eqref{modellazione-es3:cons3}$ sono $p_{1j} - \ell_1 = (2, -1, 0)$, $p_{2j} - \ell_2 = (-1, 1, 0)$, $p_{1j} - u_1 = (1, -2, -1)$ and $p_{2j} - u_2 = (-2, 0, -1)$. Il modello LP [(1)](#eq-modellazione-es3-LP) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcr}
            {\min} & {5\,x_{1}} & {+} & {2\,x_{2}} & {+} & {4\,x_{3}} \\[1ex]
            \text{soggetto a} & {x_{1}} & {+} & {x_{2}} & {+} & {x_{3}} & {=} & {100} \\[1ex]
            & {2\,x_{1}} & {-} & {x_{2}} &  &  & {\ge} & {0} \\[1ex]
            & {-x_{1}} & {+} & {x_{2}} &  &  & {\ge} & {0} \\[1ex]
            & {x_{1}} & {-} & {2\,x_{2}} & {-} & {x_{3}} & {\le} & {0} \\[1ex]
            & {-2\,x_{1}} &  &  & {-} & {x_{3}} & {\le} & {0} \\[1ex]
            & {x_{1}} &  &  &  &  & {\le} & {40} \\[1ex]
            &  &  & {x_{2}} &  &  & {\le} & {60} \\[1ex]
            &  &  &  &  & {x_{3}} & {\le} & {50} \\[1ex]
            & {x_{1},} &  & {x_{2},} &  & {x_{3}} & {\ge} & {0}
            \end{array}
            $$

        3. Per esempio, ponendo:

            $$
            \bar{x}_{1}=40,~~\bar{x}_{2}=40,~~\bar{x}_{3}=20
            $$

            otteniamo una soluzione ammissibile: la lega pesa $100$ tonnellate, contiene $(4 \cdot 40 + 40 + 2 \cdot 20)/100 = 2{,}4$ percento di elemento 1 e $(40 + 3 \cdot 40 + 2 \cdot 20)/100 = 2$ percento di elemento 2, e le disponibilità sono rispettate. Il valore della funzione obiettivo di questa soluzione ammissibile è:

            $$
            \sum_{j=1}^{r} c_j \; \bar x_j = 5 \cdot 40 + 2 \cdot 40 + 4 \cdot 20 = 360
            $$

            di conseguenza $360$ è un upper bound sul valore ottimo del modello LP [(1)](#eq-modellazione-es3-LP). Quindi, per questa istanza, abbiamo:

            $$
            z(~LP~) ~\le~ 360
            $$

        4. Usando

            - una variabile duale libera $\mu$ per il vincolo $\eqref{modellazione-es3:cons1}$

            - una variabile duale non negativa $\alpha_k$ per ogni vincolo $\eqref{modellazione-es3:cons2}$ ($k \in \{1,2,\dots,s\}$)

            - una variabile duale non positiva $\beta_k$ per ogni vincolo $\eqref{modellazione-es3:cons3}$ ($k \in \{1,2,\dots,s\}$)

            - una variabile duale non positiva $\gamma_j$ per ogni vincolo $\eqref{modellazione-es3:cons4}$ ($j \in \{1,2,\dots,r\}$)

            il duale del modello LP [(1)](#eq-modellazione-es3-LP) è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es3-DUAL"></a>

                \begin{align*}
                \max ~~ d \; \mu + \sum_{j=1}^{r} a_j \; \gamma_j & &  \tag{2a}\\[1ex]
                \text{soggetto a} \quad \mu + \sum_{k=1}^{s} (p_{kj} - \ell_k) \; \alpha_k & &  \\[1ex]
                + \sum_{k=1}^{s} (p_{kj} - u_k) \; \beta_k + \gamma_j &\le c_j, & \forall j \in \{1,2,\dots,r\}, \label{modellazione-es3:dcons1}  \tag{2b}\\[1ex]
                \mu &\gtreqless 0, &  \tag{2c}\\[1ex]
                \alpha_k &\ge 0, & \forall k \in \{1,2,\dots,s\},  \tag{2d}\\[1ex]
                \beta_k &\le 0, & \forall k \in \{1,2,\dots,s\},  \tag{2e}\\[1ex]
                \gamma_j &\le 0, & \forall j \in \{1,2,\dots,r\}. \tag{2f}
                \end{align*}

            I termini noti dei vincoli $\eqref{modellazione-es3:cons2}$ e $\eqref{modellazione-es3:cons3}$ sono uguali a $0$, quindi le variabili $\alpha_k$ e $\beta_k$ non compaiono nella funzione obiettivo. Il modello duale [(2)](#eq-modellazione-es3-DUAL) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcrcrcr}
            {\max} & {100\,\mu} &  &  &  &  &  &  &  &  & {+} & {40\,\gamma_{1}} & {+} & {60\,\gamma_{2}} & {+} & {50\,\gamma_{3}} \\[1ex]
            \text{soggetto a} & {\mu} & {+} & {2\,\alpha_{1}} & {-} & {\alpha_{2}} & {+} & {\beta_{1}} & {-} & {2\,\beta_{2}} & {+} & {\gamma_{1}} &  &  &  &  & {\le} & {5} \\[1ex]
            & {\mu} & {-} & {\alpha_{1}} & {+} & {\alpha_{2}} & {-} & {2\,\beta_{1}} &  &  &  &  & {+} & {\gamma_{2}} &  &  & {\le} & {2} \\[1ex]
            & {\mu} &  &  &  &  & {-} & {\beta_{1}} & {-} & {\beta_{2}} &  &  &  &  & {+} & {\gamma_{3}} & {\le} & {4} \\[1ex]
            & {\mu} &  &  &  &  &  &  &  &  &  &  &  &  &  &  & {\gtreqless} & {0} \\[1ex]
            &  &  & {\alpha_{1},} &  & {\alpha_{2}} &  &  &  &  &  &  &  &  &  &  & {\ge} & {0} \\[1ex]
            &  &  &  &  &  &  & {\beta_{1},} &  & {\beta_{2},} &  & {\gamma_{1},} &  & {\gamma_{2},} &  & {\gamma_{3}} & {\le} & {0}
            \end{array}
            $$

            Per esempio, ponendo:

            $$
            \bar\alpha_1 = \bar\alpha_2 = 0,~~\bar\beta_1 = \bar\beta_2 = 0,~~\bar\gamma_1 = \bar\gamma_2 = \bar\gamma_3 = 0,
            $$

            e ponendo:

            $$
            \bar\mu = \min\{5, 2, 4\} = 2
            $$

            otteniamo una soluzione duale ammissibile. Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

            $$
            d \; \bar\mu + \sum_{j=1}^{r} a_j \; \bar\gamma_j = 100 \cdot 2 + 40 \cdot 0 + 60 \cdot 0 + 50 \cdot 0 = 200
            $$

            Di conseguenza, $200$ è un lower bound sul valore ottimo del modello LP. Quindi, per questa istanza, abbiamo:

            $$
            200 ~\le~ z(~LP~) ~\le~ 360
            $$

            Questo lower bound è il costo di una lega fatta solo con la materia prima più economica, che ignora i vincoli di qualità e di disponibilità.

        5. La miscela $\tilde x$ è ammissibile: la lega pesa $100$ tonnellate, contiene $(4 \cdot 30 + 60 + 2 \cdot 10)/100 = 2$ percento di elemento 1 e $(30 + 3 \cdot 60 + 2 \cdot 10)/100 = 2{,}3$ percento di elemento 2, e le disponibilità sono rispettate. Il suo valore è $5 \cdot 30 + 2 \cdot 60 + 4 \cdot 10 = 310$.

            Le condizioni degli scarti complementari danno:

            - i vincoli $\eqref{modellazione-es3:cons2}$ per $k=2$ e $\eqref{modellazione-es3:cons3}$ per $k=1$ e $k=2$ non sono attivi (i loro primi membri valgono $30$, $-100$ e $-70$), quindi $\tilde\alpha_2 = 0$, $\tilde\beta_1 = 0$ e $\tilde\beta_2 = 0$;

            - i vincoli $\eqref{modellazione-es3:cons4}$ per $j=1$ e $j=3$ non sono attivi ($30 < 40$ e $10 < 50$), quindi $\tilde\gamma_1 = 0$ e $\tilde\gamma_3 = 0$;

            - le tre variabili primali sono positive: i tre vincoli duali $\eqref{modellazione-es3:dcons1}$ sono soddisfatti all'uguaglianza:

                $$
                \begin{cases}
                \mu + 2\,\alpha_1 = 5\\[0.5ex]
                \mu - \alpha_1 + \gamma_2 = 2\\[0.5ex]
                \mu = 4
                \end{cases}
                $$

            La soluzione di questo sistema è $\tilde\mu = 4$, $\tilde\alpha_1 = \frac{1}{2}$ e $\tilde\gamma_2 = 2 - 4 + \frac{1}{2} = -\frac{3}{2}$. Poiché $\tilde\alpha_1 \ge 0$ e $\tilde\gamma_2 \le 0$, la soluzione duale

            $$
            \tilde\mu = 4,~~\tilde\alpha_1 = \tfrac{1}{2},~~\tilde\alpha_2 = 0,~~\tilde\beta_1 = \tilde\beta_2 = 0,~~\tilde\gamma_1 = 0,~~\tilde\gamma_2 = -\tfrac{3}{2},~~\tilde\gamma_3 = 0
            $$

            è ammissibile, e il suo valore è:

            $$
            100 \cdot 4 + 40 \cdot 0 + 60 \cdot \left(-\tfrac{3}{2}\right) + 50 \cdot 0 = 310 .
            $$

            La soluzione primale e quella duale hanno lo stesso valore: per il teorema di dualità forte entrambe sono ottime, e

            $$
            z(~LP~) = 310 .
            $$
    <!-- soluzione:fine -->

4. **Trasporto (1)**

    Un'azienda produce un detersivo liquido in $s \in \mathbb{Z}_{\ge 1}$ stabilimenti e lo consegna a $r \in \mathbb{Z}_{\ge 1}$ clienti. Il prodotto non può essere spedito direttamente da uno stabilimento a un cliente: deve passare per uno di $q \in \mathbb{Z}_{\ge 1}$ depositi. Per ogni stabilimento $i \in \{1, 2, \dots, s\}$, il valore $a_i \in \mathbb{Q}_{>0}$ è la quantità, in migliaia di litri alla settimana, che lo stabilimento può produrre. Per ogni deposito $k \in \{1, 2, \dots, q\}$, il valore $h_k \in \mathbb{Q}_{>0}$ è la quantità massima, in migliaia di litri alla settimana, che il deposito può gestire. Per ogni cliente $j \in \{1, 2, \dots, r\}$, il valore $d_j \in \mathbb{Q}_{>0}$ è la domanda settimanale in migliaia di litri. Per ogni stabilimento $i \in \{1, 2, \dots, s\}$ e ogni deposito $k \in \{1, 2, \dots, q\}$, il valore $c_{ik} \in \mathbb{Q}_{\ge 0}$ è il costo in euro per trasportare mille litri dallo stabilimento $i$ al deposito $k$; per ogni deposito $k \in \{1, 2, \dots, q\}$ e ogni cliente $j \in \{1, 2, \dots, r\}$, il valore $g_{kj} \in \mathbb{Q}_{\ge 0}$ è il costo in euro per trasportare mille litri dal deposito $k$ al cliente $j$. I depositi non tengono alcuna scorta. L'azienda vuole determinare un piano settimanale di trasporto di costo minimo che rispetti i vincoli descritti sopra.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Consideriamo ora un'istanza del problema con $s=2$ stabilimenti, $q=2$ depositi e $r=2$ clienti. Gli altri dati sono:

        | $c_{ik}$ | $k=1$ | $k=2$ |
        |---|---|---|
        | $i=1$ | 2 | 4 |
        | $i=2$ | 3 | 1 |

        | $g_{kj}$ | $j=1$ | $j=2$ |
        |---|---|---|
        | $k=1$ | 3 | 5 |
        | $k=2$ | 4 | 2 |

        |  | $1$ | $2$ |
        |---|---|---|
        | $a_i$ | 50 | 40 |
        | $h_k$ | 50 | 40 |
        | $d_j$ | 30 | 50 |

        Scrivere il modello LP per questa istanza.

    3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

    4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

    5. Consideriamo il seguente piano di trasporto: lo stabilimento 1 invia 40 mila litri al deposito 1 e lo stabilimento 2 invia 40 mila litri al deposito 2; il deposito 1 invia 30 mila litri al cliente 1 e 10 mila litri al cliente 2, e il deposito 2 invia 40 mila litri al cliente 2. Dimostrare che è ottimo trovando, con le condizioni degli scarti complementari, una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

    <!-- soluzione:inizio -->
    ??? soluzione "Soluzione"

        1. I dati del modello sono i seguenti:

            | **Simbolo** | **Tipo** | **Significato** |
            |---|---|---|
            | $s$ | $\mathbb{Z}_{\ge 1}$ | numero di stabilimenti |
            | $q$ | $\mathbb{Z}_{\ge 1}$ | numero di depositi |
            | $r$ | $\mathbb{Z}_{\ge 1}$ | numero di clienti |
            | $a_i$ | $\mathbb{Q}_{>0}$ | capacità produttiva settimanale dello stabilimento $i$ |
            | $h_k$ | $\mathbb{Q}_{>0}$ | capacità di gestione settimanale del deposito $k$ |
            | $d_j$ | $\mathbb{Q}_{>0}$ | domanda settimanale del cliente $j$ |
            | $c_{ik}$ | $\mathbb{Q}_{\ge 0}$ | costo unitario di trasporto dallo stabilimento $i$ al deposito $k$ |
            | $g_{kj}$ | $\mathbb{Q}_{\ge 0}$ | costo unitario di trasporto dal deposito $k$ al cliente $j$ |

            Introduciamo le seguenti $s \, q + q \, r$ variabili non negative:

            $$
            \begin{gathered}
            x_{ik} = \text{  migliaia di litri inviate dallo stabilimento } i \text{ al deposito } k, \\[0.5ex]
            \forall i \in \{1,2,\dots,s\},~\forall k \in \{1,2,\dots,q\},
            \end{gathered}
            $$

            $$
            \begin{gathered}
            y_{kj} = \text{  migliaia di litri inviate dal deposito } k \text{ al cliente } j, \\[0.5ex]
            \forall k \in \{1,2,\dots,q\},~\forall j \in \{1,2,\dots,r\}.
            \end{gathered}
            $$

            Con queste variabili, un modello LP per il problema è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es4-LP"></a>

                \begin{align*}
                \min ~~ \sum_{i=1}^{s} \sum_{k=1}^{q} c_{ik} \; x_{ik} + \sum_{k=1}^{q} \sum_{j=1}^{r} g_{kj} \; y_{kj} & & \label{modellazione-es4:obj}  \tag{1a}\\[1ex]
                \text{soggetto a} \quad \sum_{k=1}^{q} x_{ik} &\le a_i, & \forall i \in \{1,2,\dots,s\}, \label{modellazione-es4:cons1}  \tag{1b}\\[1ex]
                \sum_{i=1}^{s} x_{ik} - \sum_{j=1}^{r} y_{kj} &= 0, & \forall k \in \{1,2,\dots,q\}, \label{modellazione-es4:cons2}  \tag{1c}\\[1ex]
                \sum_{i=1}^{s} x_{ik} &\le h_k, & \forall k \in \{1,2,\dots,q\}, \label{modellazione-es4:cons3}  \tag{1d}\\[1ex]
                \sum_{k=1}^{q} y_{kj} &\ge d_j, & \forall j \in \{1,2,\dots,r\}, \label{modellazione-es4:cons4}  \tag{1e}\\[1ex]
                x_{ik} &\ge 0, & \forall i \in \{1,2,\dots,s\},  \\
                & & \forall k \in \{1,2,\dots,q\}, \label{modellazione-es4:cons5}  \tag{1f}\\[1ex]
                y_{kj} &\ge 0, & \forall k \in \{1,2,\dots,q\},  \\
                & & \forall j \in \{1,2,\dots,r\}. \label{modellazione-es4:cons6} \tag{1g}
                \end{align*}

            Descrizione della funzione obiettivo e dei vincoli del modello LP:

            - la funzione obiettivo lineare $\eqref{modellazione-es4:obj}$ minimizza il costo totale di trasporto, dagli stabilimenti ai depositi e dai depositi ai clienti;

            - i vincoli lineari $\eqref{modellazione-es4:cons1}$ garantiscono che ogni stabilimento non spedisca più della propria capacità produttiva ($s$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es4:cons2}$ sono i *vincoli di conservazione del flusso*: ogni deposito spedisce ai clienti esattamente ciò che riceve dagli stabilimenti, poiché non tiene alcuna scorta ($q$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es4:cons3}$ garantiscono che ogni deposito non gestisca più della propria capacità ($q$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es4:cons4}$ garantiscono che ogni cliente riceva almeno la propria domanda ($r$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es4:cons5}$ e $\eqref{modellazione-es4:cons6}$ definiscono le variabili del modello LP.

            Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

        2. Il modello LP [(1)](#eq-modellazione-es4-LP) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcrcrcr}
            {\min} & {2\,x_{11}} & {+} & {4\,x_{12}} & {+} & {3\,x_{21}} & {+} & {x_{22}} & {+} & {3\,y_{11}} & {+} & {5\,y_{12}} & {+} & {4\,y_{21}} & {+} & {2\,y_{22}} \\[1ex]
            \text{soggetto a} & {x_{11}} & {+} & {x_{12}} &  &  &  &  &  &  &  &  &  &  &  &  & {\le} & {50} \\[1ex]
            &  &  &  &  & {x_{21}} & {+} & {x_{22}} &  &  &  &  &  &  &  &  & {\le} & {40} \\[1ex]
            & {x_{11}} &  &  & {+} & {x_{21}} &  &  & {-} & {y_{11}} & {-} & {y_{12}} &  &  &  &  & {=} & {0} \\[1ex]
            &  &  & {x_{12}} &  &  & {+} & {x_{22}} &  &  &  &  & {-} & {y_{21}} & {-} & {y_{22}} & {=} & {0} \\[1ex]
            & {x_{11}} &  &  & {+} & {x_{21}} &  &  &  &  &  &  &  &  &  &  & {\le} & {50} \\[1ex]
            &  &  & {x_{12}} &  &  & {+} & {x_{22}} &  &  &  &  &  &  &  &  & {\le} & {40} \\[1ex]
            &  &  &  &  &  &  &  &  & {y_{11}} &  &  & {+} & {y_{21}} &  &  & {\ge} & {30} \\[1ex]
            &  &  &  &  &  &  &  &  &  &  & {y_{12}} &  &  & {+} & {y_{22}} & {\ge} & {50} \\[1ex]
            & {x_{11},} &  & {x_{12},} &  & {x_{21},} &  & {x_{22},} &  & {y_{11},} &  & {y_{12},} &  & {y_{21},} &  & {y_{22}} & {\ge} & {0}
            \end{array}
            $$

        3. Per esempio, lo stabilimento 1 può inviare tutta la sua produzione al deposito 1, che serve il cliente 1 e parte del cliente 2, e lo stabilimento 2 può inviare il resto della domanda del cliente 2 attraverso il deposito 2:

            $$
            \begin{gathered}
            \bar x_{11} = 50,~~\bar x_{12} = 0,~~\bar x_{21} = 0,~~\bar x_{22} = 30,\\[0.5ex]
            \bar y_{11} = 30,~~\bar y_{12} = 20,~~\bar y_{21} = 0,~~\bar y_{22} = 30
            \end{gathered}
            $$

            Questa è una soluzione ammissibile: gli stabilimenti spediscono $50 \le 50$ e $30 \le 40$, i depositi gestiscono $50 \le 50$ e $30 \le 40$ e spediscono ciò che ricevono, e i clienti ricevono $30$ e $20 + 30 = 50$. Il valore della funzione obiettivo di questa soluzione ammissibile è:

            $$
            2 \cdot 50 + 1 \cdot 30 + 3 \cdot 30 + 5 \cdot 20 + 2 \cdot 30 = 380
            $$

            di conseguenza $380$ è un upper bound sul valore ottimo del modello LP [(1)](#eq-modellazione-es4-LP). Quindi, per questa istanza, abbiamo:

            $$
            z(~LP~) ~\le~ 380
            $$

        4. Usando

            - una variabile duale non positiva $\lambda_i$ per ogni vincolo $\eqref{modellazione-es4:cons1}$ ($i \in \{1,2,\dots,s\}$)

            - una variabile duale libera $\mu_k$ per ogni vincolo $\eqref{modellazione-es4:cons2}$ ($k \in \{1,2,\dots,q\}$)

            - una variabile duale non positiva $\theta_k$ per ogni vincolo $\eqref{modellazione-es4:cons3}$ ($k \in \{1,2,\dots,q\}$)

            - una variabile duale non negativa $\pi_j$ per ogni vincolo $\eqref{modellazione-es4:cons4}$ ($j \in \{1,2,\dots,r\}$)

            il duale del modello LP [(1)](#eq-modellazione-es4-LP) è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es4-DUAL"></a>

                \begin{align*}
                \max ~~ \sum_{i=1}^{s} a_i \; \lambda_i + \sum_{k=1}^{q} h_k \; \theta_k + \sum_{j=1}^{r} d_j \; \pi_j & &  \tag{2a}\\[1ex]
                \text{soggetto a} \quad \lambda_i + \mu_k + \theta_k &\le c_{ik}, & \forall i \in \{1,2,\dots,s\},  \\
                & & \forall k \in \{1,2,\dots,q\}, \label{modellazione-es4:dcons1}  \tag{2b}\\[1ex]
                - \mu_k + \pi_j &\le g_{kj}, & \forall k \in \{1,2,\dots,q\},  \\
                & & \forall j \in \{1,2,\dots,r\}, \label{modellazione-es4:dcons2}  \tag{2c}\\[1ex]
                \lambda_i &\le 0, & \forall i \in \{1,2,\dots,s\},  \tag{2d}\\[1ex]
                \mu_k &\gtreqless 0, & \forall k \in \{1,2,\dots,q\},  \tag{2e}\\[1ex]
                \theta_k &\le 0, & \forall k \in \{1,2,\dots,q\},  \tag{2f}\\[1ex]
                \pi_j &\ge 0, & \forall j \in \{1,2,\dots,r\}. \tag{2g}
                \end{align*}

            Il modello duale [(2)](#eq-modellazione-es4-DUAL) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcrcrcr}
            {\max} & {50\,\lambda_{1}} & {+} & {40\,\lambda_{2}} &  &  &  &  & {+} & {50\,\theta_{1}} & {+} & {40\,\theta_{2}} & {+} & {30\,\pi_{1}} & {+} & {50\,\pi_{2}} \\[1ex]
            \text{soggetto a} & {\lambda_{1}} &  &  & {+} & {\mu_{1}} &  &  & {+} & {\theta_{1}} &  &  &  &  &  &  & {\le} & {2} \\[1ex]
            & {\lambda_{1}} &  &  &  &  & {+} & {\mu_{2}} &  &  & {+} & {\theta_{2}} &  &  &  &  & {\le} & {4} \\[1ex]
            &  &  & {\lambda_{2}} & {+} & {\mu_{1}} &  &  & {+} & {\theta_{1}} &  &  &  &  &  &  & {\le} & {3} \\[1ex]
            &  &  & {\lambda_{2}} &  &  & {+} & {\mu_{2}} &  &  & {+} & {\theta_{2}} &  &  &  &  & {\le} & {1} \\[1ex]
            &  &  &  & {-} & {\mu_{1}} &  &  &  &  &  &  & {+} & {\pi_{1}} &  &  & {\le} & {3} \\[1ex]
            &  &  &  & {-} & {\mu_{1}} &  &  &  &  &  &  &  &  & {+} & {\pi_{2}} & {\le} & {5} \\[1ex]
            &  &  &  &  &  & {-} & {\mu_{2}} &  &  &  &  & {+} & {\pi_{1}} &  &  & {\le} & {4} \\[1ex]
            &  &  &  &  &  & {-} & {\mu_{2}} &  &  &  &  &  &  & {+} & {\pi_{2}} & {\le} & {2} \\[1ex]
            & {\lambda_{1},} &  & {\lambda_{2},} &  &  &  &  &  & {\theta_{1},} &  & {\theta_{2}} &  &  &  &  & {\le} & {0} \\[1ex]
            &  &  &  &  & {\mu_{1},} &  & {\mu_{2}} &  &  &  &  &  &  &  &  & {\gtreqless} & {0} \\[1ex]
            &  &  &  &  &  &  &  &  &  &  &  &  & {\pi_{1},} &  & {\pi_{2}} & {\ge} & {0}
            \end{array}
            $$

            Per esempio, ponendo:

            $$
            \bar\lambda_1 = \bar\lambda_2 = 0,~~\bar\theta_1 = \bar\theta_2 = 0,
            $$

            i vincoli $\eqref{modellazione-es4:dcons1}$ diventano $\mu_k \le c_{ik}$, e possiamo porre $\mu_k$ uguale al costo minimo per raggiungere il deposito $k$ da uno stabilimento:

            $$
            \bar\mu_1 = \min\{2, 3\} = 2,~~\bar\mu_2 = \min\{4, 1\} = 1 .
            $$

            Allora i vincoli $\eqref{modellazione-es4:dcons2}$ diventano $\pi_j \le \mu_k + g_{kj}$, e possiamo porre $\pi_j$ uguale al costo minimo per raggiungere il cliente $j$ da uno stabilimento passando per un deposito:

            $$
            \bar\pi_1 = \min\{2 + 3,\, 1 + 4\} = 5,~~\bar\pi_2 = \min\{2 + 5,\, 1 + 2\} = 3 .
            $$

            In questo modo abbiamo una soluzione duale ammissibile. Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

            $$
            50 \cdot 0 + 40 \cdot 0 + 50 \cdot 0 + 40 \cdot 0 + 30 \cdot 5 + 50 \cdot 3 = 300
            $$

            Di conseguenza, $300$ è un lower bound sul valore ottimo del modello LP: è il costo di inviare a ogni cliente la sua domanda lungo il percorso più economico, ignorando le capacità. Quindi, per questa istanza, abbiamo:

            $$
            300 ~\le~ z(~LP~) ~\le~ 380
            $$

        5. Il piano della domanda è la soluzione

            $$
            \begin{gathered}
            \tilde x_{11} = 40,~~\tilde x_{12} = 0,~~\tilde x_{21} = 0,~~\tilde x_{22} = 40,\\[0.5ex]
            \tilde y_{11} = 30,~~\tilde y_{12} = 10,~~\tilde y_{21} = 0,~~\tilde y_{22} = 40
            \end{gathered}
            $$

            che è ammissibile (gli stabilimenti spediscono $40 \le 50$ e $40 \le 40$, i depositi gestiscono $40 \le 50$ e $40 \le 40$, e i clienti ricevono $30$ e $50$), con valore $2 \cdot 40 + 1 \cdot 40 + 3 \cdot 30 + 5 \cdot 10 + 2 \cdot 40 = 340$.

            Le condizioni degli scarti complementari danno:

            - lo stabilimento 1 e il deposito 1 non sono saturi ($40 < 50$), quindi $\tilde\lambda_1 = 0$ e $\tilde\theta_1 = 0$;

            - le variabili $\tilde x_{11}$, $\tilde x_{22}$, $\tilde y_{11}$, $\tilde y_{12}$ e $\tilde y_{22}$ sono positive, quindi i corrispondenti vincoli duali sono soddisfatti all'uguaglianza:

                $$
                \begin{cases}
                \lambda_1 + \mu_1 + \theta_1 = 2\\[0.5ex]
                \lambda_2 + \mu_2 + \theta_2 = 1\\[0.5ex]
                -\mu_1 + \pi_1 = 3\\[0.5ex]
                -\mu_1 + \pi_2 = 5\\[0.5ex]
                -\mu_2 + \pi_2 = 2
                \end{cases}
                $$

            Otteniamo $\tilde\mu_1 = 2$, $\tilde\pi_1 = 5$, $\tilde\pi_2 = 7$, $\tilde\mu_2 = 5$ e $\lambda_2 + \theta_2 = -4$. L'ultima equazione ha molte soluzioni: dobbiamo sceglierne una che soddisfi anche i vincoli duali di $x_{12}$ e $x_{21}$, cioè $\theta_2 \le 4 - 5 = -1$ e $\lambda_2 \le 3 - 2 = 1$, e le condizioni di segno. Per esempio, $\tilde\theta_2 = -1$ e $\tilde\lambda_2 = -3$. Il restante vincolo duale, di $y_{21}$, è soddisfatto: $-5 + 5 = 0 \le 4$. La soluzione duale

            $$
            \tilde\lambda_1 = 0,~~\tilde\lambda_2 = -3,~~\tilde\mu_1 = 2,~~\tilde\mu_2 = 5,~~\tilde\theta_1 = 0,~~\tilde\theta_2 = -1,~~\tilde\pi_1 = 5,~~\tilde\pi_2 = 7
            $$

            è quindi ammissibile, e il suo valore è:

            $$
            40 \cdot (-3) + 40 \cdot (-1) + 30 \cdot 5 + 50 \cdot 7 = 340 .
            $$

            La soluzione primale e quella duale hanno lo stesso valore: per il teorema di dualità forte entrambe sono ottime, e

            $$
            z(~LP~) = 340 .
            $$
    <!-- soluzione:fine -->

5. **Pianificazione su più periodi (1)**

    Un'azienda pianifica la produzione di un fertilizzante su un orizzonte temporale di $n \in \mathbb{Z}_{\ge 2}$ settimane. Per ogni settimana $t \in \{1, 2, \dots, n\}$, il valore $d_t \in \mathbb{Q}_{\ge 0}$ è la domanda in tonnellate, il valore $p_t \in \mathbb{Q}_{>0}$ è la quantità massima producibile in tonnellate, e il valore $c_t \in \mathbb{Q}_{>0}$ è il costo di produzione in euro di una tonnellata. Il prodotto che avanza alla fine di una settimana può essere immagazzinato e venduto nelle settimane successive: per ogni settimana $t \in \{1, 2, \dots, n-1\}$, immagazzinare una tonnellata dalla settimana $t$ alla settimana $t+1$ costa $h_t \in \mathbb{Q}_{>0}$ euro. Inoltre, la domanda di una settimana può essere soddisfatta in ritardo (*backlogging*): per ogni settimana $t \in \{1, 2, \dots, n-1\}$, ogni tonnellata di domanda non ancora soddisfatta alla fine della settimana $t$ comporta una penale di $g_t \in \mathbb{Q}_{>0}$ euro. All'inizio dell'orizzonte non c'è scorta, e tutta la domanda deve essere soddisfatta entro la fine della settimana $n$. L'azienda vuole determinare un piano di produzione di costo minimo che rispetti i vincoli descritti sopra.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Consideriamo ora un'istanza del problema con $n = 3$ settimane e i seguenti dati:

        |  | $t=1$ | $t=2$ | $t=3$ |
        |---|---|---|---|
        | $d_t$ | 30 | 50 | 20 |
        | $p_t$ | 40 | 30 | 40 |
        | $c_t$ | 10 | 12 | 11 |
        | $h_t$ | 2 | 2 | – |
        | $g_t$ | 3 | 3 | – |

        Scrivere il modello LP per questa istanza.

    3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

    4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

    5. Consideriamo il piano che produce $40$, $30$ e $30$ tonnellate nelle tre settimane, immagazzina $10$ tonnellate alla fine della settimana $1$ e soddisfa $10$ tonnellate della domanda della settimana $2$ nella settimana $3$. Dimostrare che è ottimo trovando, con le condizioni degli scarti complementari, una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

    <!-- soluzione:inizio -->
    ??? soluzione "Soluzione"

        1. I dati del modello sono i seguenti:

            | **Simbolo** | **Tipo** | **Significato** |
            |---|---|---|
            | $n$ | $\mathbb{Z}_{\ge 2}$ | numero di settimane |
            | $d_t$ | $\mathbb{Q}_{\ge 0}$ | domanda della settimana $t$ (tonnellate) |
            | $p_t$ | $\mathbb{Q}_{>0}$ | capacità produttiva della settimana $t$ (tonnellate) |
            | $c_t$ | $\mathbb{Q}_{>0}$ | costo di produzione di una tonnellata nella settimana $t$ (euro) |
            | $h_t$ | $\mathbb{Q}_{>0}$ | costo di immagazzinare una tonnellata dalla settimana $t$ alla settimana $t+1$ (euro) |
            | $g_t$ | $\mathbb{Q}_{>0}$ | penale per una tonnellata di domanda non soddisfatta alla fine della settimana $t$ (euro) |

            Introduciamo le seguenti $n + 2\,(n-1)$ variabili non negative:

            $$
            x_t = \text{  tonnellate prodotte nella settimana } t, \qquad \forall t \in \{1,2,\dots,n\},
            $$

            $$
            \begin{cases}
            s_t = \text{  tonnellate in scorta alla fine della settimana } t\\[1ex]
            b_t = \text{  tonnellate in ritardo alla fine della settimana } t
            \end{cases}
            \qquad \forall t \in \{1,2,\dots,n-1\}.
            $$

            In ogni settimana, il prodotto disponibile (la produzione più la scorta della settimana precedente) è usato per la domanda della settimana e per la domanda in ritardo della settimana precedente, e ciò che avanza va in scorta; con le variabili precedenti, il *bilancio delle scorte* della settimana $t$ è: $x_t + s_{t-1} - b_{t-1} - s_t + b_t = d_t$. Nella prima settimana non ci sono scorta né domanda in ritardo della settimana precedente, e nell'ultima settimana non resta nulla in scorta e nessuna domanda viene rimandata. Con queste variabili, un modello LP per il problema è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es5-LP"></a>

                \begin{align*}
                \min ~~ \sum_{t=1}^{n} c_t \; x_t + \sum_{t=1}^{n-1} h_t \; s_t + \sum_{t=1}^{n-1} g_t \; b_t & & \label{modellazione-es5:obj}  \tag{1a}\\[1ex]
                \text{soggetto a} \quad x_1 - s_1 + b_1 &= d_1, & \label{modellazione-es5:cons1}  \tag{1b}\\[1ex]
                x_t + s_{t-1} - b_{t-1} - s_t + b_t &= d_t, & \forall t \in \{2,3,\dots,n-1\}, \label{modellazione-es5:cons2}  \tag{1c}\\[1ex]
                x_n + s_{n-1} - b_{n-1} &= d_n, & \label{modellazione-es5:cons3}  \tag{1d}\\[1ex]
                x_t &\le p_t, & \forall t \in \{1,2,\dots,n\}, \label{modellazione-es5:cons4}  \tag{1e}\\[1ex]
                x_t &\ge 0, & \forall t \in \{1,2,\dots,n\}, \label{modellazione-es5:cons5}  \tag{1f}\\[1ex]
                s_t &\ge 0, & \forall t \in \{1,2,\dots,n-1\}, \label{modellazione-es5:cons6}  \tag{1g}\\[1ex]
                b_t &\ge 0, & \forall t \in \{1,2,\dots,n-1\}. \label{modellazione-es5:cons7} \tag{1h}
                \end{align*}

            Descrizione della funzione obiettivo e dei vincoli del modello LP:

            - la funzione obiettivo lineare $\eqref{modellazione-es5:obj}$ minimizza il costo totale di produzione, di immagazzinamento e di ritardo;

            - il vincolo lineare $\eqref{modellazione-es5:cons1}$ è il bilancio delle scorte della prima settimana (un vincolo lineare);

            - i vincoli lineari $\eqref{modellazione-es5:cons2}$ sono i bilanci delle scorte delle settimane intermedie: collegano ogni settimana alla precedente ($n-2$ vincoli lineari);

            - il vincolo lineare $\eqref{modellazione-es5:cons3}$ è il bilancio delle scorte dell'ultima settimana, in cui tutta la domanda in ritardo viene soddisfatta (un vincolo lineare);

            - i vincoli lineari $\eqref{modellazione-es5:cons4}$ garantiscono che la produzione non superi la capacità ($n$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es5:cons5}$, $\eqref{modellazione-es5:cons6}$ e $\eqref{modellazione-es5:cons7}$ definiscono le variabili del modello LP.

            Una soluzione con $s_t > 0$ e $b_t > 0$ nella stessa settimana è ammissibile ma mai conveniente: diminuendo entrambe della stessa quantità i bilanci restano invariati e il costo diminuisce, poiché $h_t > 0$ e $g_t > 0$.

            Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

        2. Il modello LP [(1)](#eq-modellazione-es5-LP) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcrcr}
            {\min} & {10\,x_{1}} & {+} & {12\,x_{2}} & {+} & {11\,x_{3}} & {+} & {2\,s_{1}} & {+} & {2\,s_{2}} & {+} & {3\,b_{1}} & {+} & {3\,b_{2}} \\[1ex]
            \text{soggetto a} & {x_{1}} &  &  &  &  & {-} & {s_{1}} &  &  & {+} & {b_{1}} &  &  & {=} & {30} \\[1ex]
            &  &  & {x_{2}} &  &  & {+} & {s_{1}} & {-} & {s_{2}} & {-} & {b_{1}} & {+} & {b_{2}} & {=} & {50} \\[1ex]
            &  &  &  &  & {x_{3}} &  &  & {+} & {s_{2}} &  &  & {-} & {b_{2}} & {=} & {20} \\[1ex]
            & {x_{1}} &  &  &  &  &  &  &  &  &  &  &  &  & {\le} & {40} \\[1ex]
            &  &  & {x_{2}} &  &  &  &  &  &  &  &  &  &  & {\le} & {30} \\[1ex]
            &  &  &  &  & {x_{3}} &  &  &  &  &  &  &  &  & {\le} & {40} \\[1ex]
            & {x_{1},} &  & {x_{2},} &  & {x_{3},} &  & {s_{1},} &  & {s_{2},} &  & {b_{1},} &  & {b_{2}} & {\ge} & {0}
            \end{array}
            $$

        3. Per esempio, producendo in ogni settimana la sua domanda, fino alla capacità, e soddisfacendo nella settimana $3$ la parte della domanda della settimana $2$ che eccede la capacità:

            $$
            \bar x_1 = 30,~~\bar x_2 = 30,~~\bar x_3 = 40,~~\bar s_1 = 0,~~\bar s_2 = 0,~~\bar b_1 = 0,~~\bar b_2 = 20
            $$

            otteniamo una soluzione ammissibile: i tre bilanci diventano $30 = 30$, $30 + 20 = 50$ e $40 - 20 = 20$, e le capacità sono rispettate. Il valore della funzione obiettivo di questa soluzione ammissibile è:

            $$
            10 \cdot 30 + 12 \cdot 30 + 11 \cdot 40 + 2 \cdot 0 + 2 \cdot 0 + 3 \cdot 0 + 3 \cdot 20 = 1160
            $$

            di conseguenza $1160$ è un upper bound sul valore ottimo del modello LP [(1)](#eq-modellazione-es5-LP). Quindi, per questa istanza, abbiamo:

            $$
            z(~LP~) ~\le~ 1160
            $$

        4. Usando

            - una variabile duale libera $\mu_1$ per il vincolo $\eqref{modellazione-es5:cons1}$

            - una variabile duale libera $\mu_t$ per ogni vincolo $\eqref{modellazione-es5:cons2}$ ($t \in \{2,3,\dots,n-1\}$)

            - una variabile duale libera $\mu_n$ per il vincolo $\eqref{modellazione-es5:cons3}$

            - una variabile duale non positiva $\pi_t$ per ogni vincolo $\eqref{modellazione-es5:cons4}$ ($t \in \{1,2,\dots,n\}$)

            il duale del modello LP [(1)](#eq-modellazione-es5-LP) è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es5-DUAL"></a>

                \begin{align*}
                \max ~~ \sum_{t=1}^{n} d_t \; \mu_t + \sum_{t=1}^{n} p_t \; \pi_t & &  \tag{2a}\\[1ex]
                \text{soggetto a} \quad \mu_t + \pi_t &\le c_t, & \forall t \in \{1,2,\dots,n\}, \label{modellazione-es5:dcons1}  \tag{2b}\\[1ex]
                - \mu_t + \mu_{t+1} &\le h_t, & \forall t \in \{1,2,\dots,n-1\}, \label{modellazione-es5:dcons2}  \tag{2c}\\[1ex]
                \mu_t - \mu_{t+1} &\le g_t, & \forall t \in \{1,2,\dots,n-1\}, \label{modellazione-es5:dcons3}  \tag{2d}\\[1ex]
                \mu_t &\gtreqless 0, & \forall t \in \{1,2,\dots,n\},  \tag{2e}\\[1ex]
                \pi_t &\le 0, & \forall t \in \{1,2,\dots,n\}. \tag{2f}
                \end{align*}

            Il modello duale [(2)](#eq-modellazione-es5-DUAL) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcr}
            {\max} & {30\,\mu_{1}} & {+} & {50\,\mu_{2}} & {+} & {20\,\mu_{3}} & {+} & {40\,\pi_{1}} & {+} & {30\,\pi_{2}} & {+} & {40\,\pi_{3}} \\[1ex]
            \text{soggetto a} & {\mu_{1}} &  &  &  &  & {+} & {\pi_{1}} &  &  &  &  & {\le} & {10} \\[1ex]
            &  &  & {\mu_{2}} &  &  &  &  & {+} & {\pi_{2}} &  &  & {\le} & {12} \\[1ex]
            &  &  &  &  & {\mu_{3}} &  &  &  &  & {+} & {\pi_{3}} & {\le} & {11} \\[1ex]
            & {-\mu_{1}} & {+} & {\mu_{2}} &  &  &  &  &  &  &  &  & {\le} & {2} \\[1ex]
            &  & {-} & {\mu_{2}} & {+} & {\mu_{3}} &  &  &  &  &  &  & {\le} & {2} \\[1ex]
            & {\mu_{1}} & {-} & {\mu_{2}} &  &  &  &  &  &  &  &  & {\le} & {3} \\[1ex]
            &  &  & {\mu_{2}} & {-} & {\mu_{3}} &  &  &  &  &  &  & {\le} & {3} \\[1ex]
            & {\mu_{1},} &  & {\mu_{2},} &  & {\mu_{3}} &  &  &  &  &  &  & {\gtreqless} & {0} \\[1ex]
            &  &  &  &  &  &  & {\pi_{1},} &  & {\pi_{2},} &  & {\pi_{3}} & {\le} & {0}
            \end{array}
            $$

            Per esempio, ponendo:

            $$
            \bar\pi_1 = \bar\pi_2 = \bar\pi_3 = 0,
            $$

            e ponendo $\mu_t$ uguale al costo di produzione della settimana $t$:

            $$
            \bar\mu_1 = 10,~~\bar\mu_2 = 12,~~\bar\mu_3 = 11,
            $$

            i vincoli $\eqref{modellazione-es5:dcons1}$ sono soddisfatti all'uguaglianza, e sono soddisfatti anche i vincoli $\eqref{modellazione-es5:dcons2}$ e $\eqref{modellazione-es5:dcons3}$, poiché $-10 + 12 = 2 \le 2$, $-12 + 11 = -1 \le 2$, $10 - 12 = -2 \le 3$ e $12 - 11 = 1 \le 3$. Quindi abbiamo una soluzione duale ammissibile. Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

            $$
            30 \cdot 10 + 50 \cdot 12 + 20 \cdot 11 + 40 \cdot 0 + 30 \cdot 0 + 40 \cdot 0 = 1120
            $$

            Di conseguenza, $1120$ è un lower bound sul valore ottimo del modello LP: è il costo di produrre la domanda di ogni settimana nella stessa settimana, ignorando le capacità. Quindi, per questa istanza, abbiamo:

            $$
            1120 ~\le~ z(~LP~) ~\le~ 1160
            $$

        5. Il piano della domanda è la soluzione

            $$
            \tilde x_1 = 40,~~\tilde x_2 = 30,~~\tilde x_3 = 30,~~\tilde s_1 = 10,~~\tilde s_2 = 0,~~\tilde b_1 = 0,~~\tilde b_2 = 10,
            $$

            che è ammissibile: i tre bilanci diventano $40 - 10 = 30$, $30 + 10 + 10 = 50$ e $30 - 10 = 20$, e le capacità sono rispettate. Il suo valore è $10 \cdot 40 + 12 \cdot 30 + 11 \cdot 30 + 2 \cdot 10 + 3 \cdot 10 = 1140$.

            Le condizioni degli scarti complementari danno:

            - la capacità della settimana $3$ non è satura ($30 < 40$), quindi $\tilde\pi_3 = 0$;

            - le variabili $\tilde x_1$, $\tilde x_2$, $\tilde x_3$, $\tilde s_1$ e $\tilde b_2$ sono positive, quindi i corrispondenti vincoli duali sono soddisfatti all'uguaglianza:

                $$
                \begin{cases}
                \mu_1 + \pi_1 = 10\\[0.5ex]
                \mu_2 + \pi_2 = 12\\[0.5ex]
                \mu_3 = 11\\[0.5ex]
                -\mu_1 + \mu_2 = 2\\[0.5ex]
                \mu_2 - \mu_3 = 3
                \end{cases}
                $$

            Otteniamo $\tilde\mu_3 = 11$, $\tilde\mu_2 = 14$, $\tilde\mu_1 = 12$, $\tilde\pi_1 = -2$ e $\tilde\pi_2 = -2$. I restanti vincoli duali, di $s_2$ e $b_1$, sono soddisfatti: $-14 + 11 = -3 \le 2$ e $12 - 14 = -2 \le 3$; inoltre $\tilde\pi_1, \tilde\pi_2 \le 0$. Quindi la soluzione duale

            $$
            \tilde\mu_1 = 12,~~\tilde\mu_2 = 14,~~\tilde\mu_3 = 11,~~\tilde\pi_1 = -2,~~\tilde\pi_2 = -2,~~\tilde\pi_3 = 0
            $$

            è ammissibile, e il suo valore è:

            $$
            30 \cdot 12 + 50 \cdot 14 + 20 \cdot 11 + 40 \cdot (-2) + 30 \cdot (-2) + 40 \cdot 0 = 1140 .
            $$

            La soluzione primale e quella duale hanno lo stesso valore: per il teorema di dualità forte entrambe sono ottime, e

            $$
            z(~LP~) = 1140 .
            $$
    <!-- soluzione:fine -->

6. **Obiettivo min-max (1)**

    Un'azienda di stampa deve stampare $r \in \mathbb{Z}_{\ge 1}$ lavori (per esempio, le copie di un libro o di un catalogo) su $s \in \mathbb{Z}_{\ge 1}$ macchine da stampa, che iniziano a lavorare nello stesso momento. Ogni lavoro può essere suddiviso fra più macchine: ogni macchina stampa una frazione delle copie del lavoro. Per ogni macchina $i \in \{1, 2, \dots, s\}$ e ogni lavoro $j \in \{1, 2, \dots, r\}$, il valore $t_{ij} \in \mathbb{Q}_{>0}$ è il numero di ore di cui la macchina $i$ avrebbe bisogno per stampare da sola l'intero lavoro $j$; stampare una frazione del lavoro richiede la stessa frazione di questo tempo. L'azienda vuole suddividere i lavori fra le macchine in modo da minimizzare l'istante in cui l'ultima macchina termina il proprio lavoro (il *makespan*).

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Consideriamo ora un'istanza del problema con $s=2$ macchine e $r=3$ lavori, e i seguenti tempi di lavorazione:

        | $t_{ij}$ | $j=1$ | $j=2$ | $j=3$ |
        |---|---|---|---|
        | $i=1$ | 2 | 4 | 4 |
        | $i=2$ | 4 | 12 | 12 |

        Scrivere il modello LP per questa istanza.

    3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

    4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

    5. Consideriamo la soluzione in cui la macchina $1$ stampa $\frac{3}{4}$ del lavoro $2$ e l'intero lavoro $3$, mentre la macchina $2$ stampa l'intero lavoro $1$ e $\frac{1}{4}$ del lavoro $2$. Dimostrare che è ottima trovando, con le condizioni degli scarti complementari, una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

    <!-- soluzione:inizio -->
    ??? soluzione "Soluzione"

        1. I dati del modello sono i seguenti:

            | **Simbolo** | **Tipo** | **Significato** |
            |---|---|---|
            | $s$ | $\mathbb{Z}_{\ge 1}$ | numero di macchine |
            | $r$ | $\mathbb{Z}_{\ge 1}$ | numero di lavori |
            | $t_{ij}$ | $\mathbb{Q}_{>0}$ | ore necessarie alla macchina $i$ per stampare l'intero lavoro $j$ |

            Introduciamo le seguenti $s \, r$ variabili non negative:

            $$
            \begin{gathered}
            x_{ij} = \text{  frazione del lavoro } j \text{ stampata dalla macchina } i, \\[0.5ex]
            \forall i \in \{1,2,\dots,s\},~\forall j \in \{1,2,\dots,r\}.
            \end{gathered}
            $$

            Il tempo di lavoro della macchina $i$ è $\sum_{j=1}^{r} t_{ij} \, x_{ij}$, e il makespan è il massimo di queste $s$ funzioni lineari: la funzione obiettivo

            $$
            \min ~ \max_{i \in \{1,2,\dots,s\}} \left\{ \sum_{j=1}^{r} t_{ij} \, x_{ij} \right\}
            $$

            non è lineare. La linearizziamo introducendo una variabile libera aggiuntiva:

            $$
            w = \text{  makespan (ore)}.
            $$

            Con queste variabili, un modello LP per il problema è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es6-LP"></a>

                \begin{align*}
                \min ~~ w & & \label{modellazione-es6:obj}  \tag{1a}\\[1ex]
                \text{soggetto a} \quad \sum_{i=1}^{s} x_{ij} &= 1, & \forall j \in \{1,2,\dots,r\}, \label{modellazione-es6:cons1}  \tag{1b}\\[1ex]
                w - \sum_{j=1}^{r} t_{ij} \; x_{ij} &\ge 0, & \forall i \in \{1,2,\dots,s\}, \label{modellazione-es6:cons2}  \tag{1c}\\[1ex]
                x_{ij} &\ge 0, & \forall i \in \{1,2,\dots,s\},~\forall j \in \{1,2,\dots,r\}, \label{modellazione-es6:cons3}  \tag{1d}\\[1ex]
                w &\gtreqless 0. & \label{modellazione-es6:cons4} \tag{1e}
                \end{align*}

            Descrizione della funzione obiettivo e dei vincoli del modello LP:

            - la funzione obiettivo lineare $\eqref{modellazione-es6:obj}$ minimizza il makespan;

            - i vincoli lineari $\eqref{modellazione-es6:cons1}$ garantiscono che ogni lavoro sia stampato completamente ($r$ vincoli lineari);

            - i vincoli lineari $\eqref{modellazione-es6:cons2}$ garantiscono che $w$ non sia minore del tempo di lavoro di ogni macchina, cioè non minore del loro massimo ($s$ vincoli lineari). Poiché $w$ è minimizzata, in una soluzione ottima $w$ è uguale al tempo di lavoro della macchina più carica;

            - i vincoli lineari $\eqref{modellazione-es6:cons3}$ e $\eqref{modellazione-es6:cons4}$ definiscono le variabili del modello LP.

            Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

        2. Il modello LP [(1)](#eq-modellazione-es6-LP) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcrcr}
            {\min} &  &  &  &  &  &  &  &  &  &  &  &  & {w} \\[1ex]
            \text{soggetto a} & {x_{11}} &  &  &  &  & {+} & {x_{21}} &  &  &  &  &  &  & {=} & {1} \\[1ex]
            &  &  & {x_{12}} &  &  &  &  & {+} & {x_{22}} &  &  &  &  & {=} & {1} \\[1ex]
            &  &  &  &  & {x_{13}} &  &  &  &  & {+} & {x_{23}} &  &  & {=} & {1} \\[1ex]
            & {-2\,x_{11}} & {-} & {4\,x_{12}} & {-} & {4\,x_{13}} &  &  &  &  &  &  & {+} & {w} & {\ge} & {0} \\[1ex]
            &  &  &  &  &  & {-} & {4\,x_{21}} & {-} & {12\,x_{22}} & {-} & {12\,x_{23}} & {+} & {w} & {\ge} & {0} \\[1ex]
            & {x_{11},} &  & {x_{12},} &  & {x_{13},} &  & {x_{21},} &  & {x_{22},} &  & {x_{23}} &  &  & {\ge} & {0} \\[1ex]
            &  &  &  &  &  &  &  &  &  &  &  &  & {w} & {\gtreqless} & {0}
            \end{array}
            $$

        3. Per esempio, assegnando ogni lavoro interamente a una macchina, i lavori $2$ e $3$ alla macchina $1$ e il lavoro $1$ alla macchina $2$:

            $$
            \bar x_{11} = 0,~~\bar x_{12} = 1,~~\bar x_{13} = 1,~~\bar x_{21} = 1,~~\bar x_{22} = 0,~~\bar x_{23} = 0,
            $$

            i tempi di lavoro delle due macchine sono $4 + 4 = 8$ e $4$ ore, e ponendo

            $$
            \bar w = \max\{8, 4\} = 8
            $$

            otteniamo una soluzione ammissibile. Il suo valore della funzione obiettivo è $8$, di conseguenza $8$ è un upper bound sul valore ottimo del modello LP [(1)](#eq-modellazione-es6-LP). Quindi, per questa istanza, abbiamo:

            $$
            z(~LP~) ~\le~ 8
            $$

        4. Usando

            - una variabile duale libera $\mu_j$ per ogni vincolo $\eqref{modellazione-es6:cons1}$ ($j \in \{1,2,\dots,r\}$)

            - una variabile duale non negativa $\lambda_i$ per ogni vincolo $\eqref{modellazione-es6:cons2}$ ($i \in \{1,2,\dots,s\}$)

            il duale del modello LP [(1)](#eq-modellazione-es6-LP) è il seguente:

            !!! chiave ""

                <a id="eq-modellazione-es6-DUAL"></a>

                \begin{align*}
                \max ~~ \sum_{j=1}^{r} \mu_j & &  \tag{2a}\\[1ex]
                \text{soggetto a} \quad \mu_j - t_{ij} \; \lambda_i &\le 0, & \forall i \in \{1,2,\dots,s\},~\forall j \in \{1,2,\dots,r\}, \label{modellazione-es6:dcons1}  \tag{2b}\\[1ex]
                \sum_{i=1}^{s} \lambda_i &= 1, & \label{modellazione-es6:dcons2}  \tag{2c}\\[1ex]
                \mu_j &\gtreqless 0, & \forall j \in \{1,2,\dots,r\},  \tag{2d}\\[1ex]
                \lambda_i &\ge 0, & \forall i \in \{1,2,\dots,s\}. \tag{2e}
                \end{align*}

            Il vincolo $\eqref{modellazione-es6:dcons2}$ corrisponde alla variabile libera $w$, ed è un'uguaglianza. Le variabili duali $\lambda_i$ sono pesi non negativi delle macchine con somma $1$, e i vincoli $\eqref{modellazione-es6:dcons1}$ impongono $\mu_j \le \min_{i} t_{ij}\, \lambda_i$.

            Il modello duale [(2)](#eq-modellazione-es6-DUAL) per l'istanza è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcr}
            {\max} & {\mu_{1}} & {+} & {\mu_{2}} & {+} & {\mu_{3}} &  &  &  &  \\[1ex]
            \text{soggetto a} & {\mu_{1}} &  &  &  &  & {-} & {2\,\lambda_{1}} &  &  & {\le} & {0} \\[1ex]
            &  &  & {\mu_{2}} &  &  & {-} & {4\,\lambda_{1}} &  &  & {\le} & {0} \\[1ex]
            &  &  &  &  & {\mu_{3}} & {-} & {4\,\lambda_{1}} &  &  & {\le} & {0} \\[1ex]
            & {\mu_{1}} &  &  &  &  &  &  & {-} & {4\,\lambda_{2}} & {\le} & {0} \\[1ex]
            &  &  & {\mu_{2}} &  &  &  &  & {-} & {12\,\lambda_{2}} & {\le} & {0} \\[1ex]
            &  &  &  &  & {\mu_{3}} &  &  & {-} & {12\,\lambda_{2}} & {\le} & {0} \\[1ex]
            &  &  &  &  &  &  & {\lambda_{1}} & {+} & {\lambda_{2}} & {=} & {1} \\[1ex]
            & {\mu_{1},} &  & {\mu_{2},} &  & {\mu_{3}} &  &  &  &  & {\gtreqless} & {0} \\[1ex]
            &  &  &  &  &  &  & {\lambda_{1},} &  & {\lambda_{2}} & {\ge} & {0}
            \end{array}
            $$

            Per esempio, dando lo stesso peso alle due macchine:

            $$
            \bar\lambda_1 = \tfrac{1}{2},~~\bar\lambda_2 = \tfrac{1}{2},
            $$

            e ponendo:

            $$
            \begin{gathered}
            \bar\mu_1 = \min\left\{2 \cdot \tfrac{1}{2},\, 4 \cdot \tfrac{1}{2}\right\} = 1,~~\bar\mu_2 = \min\left\{4 \cdot \tfrac{1}{2},\, 12 \cdot \tfrac{1}{2}\right\} = 2,\\[0.5ex]
            \bar\mu_3 = \min\left\{4 \cdot \tfrac{1}{2},\, 12 \cdot \tfrac{1}{2}\right\} = 2
            \end{gathered}
            $$

            otteniamo una soluzione duale ammissibile. Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

            $$
            \bar\mu_1 + \bar\mu_2 + \bar\mu_3 = 1 + 2 + 2 = 5
            $$

            Di conseguenza, $5$ è un lower bound sul valore ottimo del modello LP. Quindi, per questa istanza, abbiamo:

            $$
            5 ~\le~ z(~LP~) ~\le~ 8
            $$

            Questo lower bound ha un significato semplice: il makespan è almeno il tempo di lavoro medio delle due macchine, che è almeno la metà della somma, sui lavori, del tempo di lavorazione più breve di ciascun lavoro, cioè $\frac{1}{2}\,(2 + 4 + 4) = 5$.

        5. La soluzione della domanda è

            $$
            \tilde x_{11} = 0,~~\tilde x_{12} = \tfrac{3}{4},~~\tilde x_{13} = 1,~~\tilde x_{21} = 1,~~\tilde x_{22} = \tfrac{1}{4},~~\tilde x_{23} = 0,
            $$

            in cui i tempi di lavoro delle due macchine sono $4 \cdot \frac{3}{4} + 4 \cdot 1 = 7$ e $4 \cdot 1 + 12 \cdot \frac{1}{4} = 7$ ore: con $\tilde w = 7$ è ammissibile, con valore $7$.

            Le variabili $\tilde x_{12}$, $\tilde x_{13}$, $\tilde x_{21}$, $\tilde x_{22}$ e $\tilde w$ sono positive, quindi, per le condizioni degli scarti complementari, i corrispondenti vincoli duali sono soddisfatti all'uguaglianza:

            $$
            \begin{cases}
            \mu_2 = 4\,\lambda_1\\[0.5ex]
            \mu_3 = 4\,\lambda_1\\[0.5ex]
            \mu_1 = 4\,\lambda_2\\[0.5ex]
            \mu_2 = 12\,\lambda_2\\[0.5ex]
            \lambda_1 + \lambda_2 = 1
            \end{cases}
            $$

            Dalla prima e dalla quarta equazione, $\lambda_1 = 3\,\lambda_2$, quindi $\tilde\lambda_2 = \frac{1}{4}$ e $\tilde\lambda_1 = \frac{3}{4}$; allora $\tilde\mu_1 = 1$, $\tilde\mu_2 = 3$ e $\tilde\mu_3 = 3$. I restanti vincoli duali, di $x_{11}$ e $x_{23}$, sono soddisfatti: $1 - 2 \cdot \frac{3}{4} = -\frac{1}{2} \le 0$ e $3 - 12 \cdot \frac{1}{4} = 0 \le 0$; inoltre $\tilde\lambda_1, \tilde\lambda_2 \ge 0$. Quindi la soluzione duale

            $$
            \tilde\mu_1 = 1,~~\tilde\mu_2 = 3,~~\tilde\mu_3 = 3,~~\tilde\lambda_1 = \tfrac{3}{4},~~\tilde\lambda_2 = \tfrac{1}{4}
            $$

            è ammissibile, e il suo valore è $1 + 3 + 3 = 7$. La soluzione primale e quella duale hanno lo stesso valore: per il teorema di dualità forte entrambe sono ottime, e

            $$
            z(~LP~) = 7 .
            $$

            Nella soluzione ottima le due macchine terminano nello stesso momento: se una delle due terminasse prima, parte del lavoro dell'altra potrebbe esserle spostata.
    <!-- soluzione:fine -->

7. **Valori assoluti (1)**

    Un negozio ha registrato le vendite di un prodotto in quattro settimane consecutive: 3, 4, 8 e 9 centinaia di unità nelle settimane 1, 2, 3 e 4, rispettivamente. Per prevedere le vendite delle settimane successive, il negozio vuole descrivere le vendite con una *retta di tendenza*, cioè con una funzione lineare $a + b\,t$ della settimana $t$, dove l'intercetta $a$ e la pendenza $b$ possono essere numeri reali qualsiasi. Nella settimana $t$, lo scostamento della retta dalle vendite registrate $y_t$ è $|\,y_t - a - b\,t\,|$. L'obiettivo del negozio è determinare i valori di $a$ e $b$ che minimizzano la somma degli scostamenti nelle quattro settimane.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Trovare una soluzione ammissibile del modello LP e, di conseguenza, un upper bound sul suo valore ottimo.

    3. Scrivere il modello duale del modello LP. Trovare una soluzione ammissibile del modello duale e, di conseguenza, un lower bound sul valore ottimo del modello LP.

    4. Dimostrare che la retta di tendenza $1 + 2\,t$ è ottima, trovando con le condizioni degli scarti complementari una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

    <!-- soluzione:inizio -->
    ??? soluzione "Soluzione"

        1. Le decisioni sono l'intercetta e la pendenza della retta. Introduciamo le seguenti due variabili decisionali libere:

            $$
            \begin{cases}
            a = \text{intercetta della retta di tendenza}\\[1ex]
            b = \text{pendenza della retta di tendenza}
            \end{cases}
            $$

            The objective function

            $$
            \min ~~ |\,3 - a - b\,| + |\,4 - a - 2\,b\,| + |\,8 - a - 3\,b\,| + |\,9 - a - 4\,b\,|
            $$

            non è lineare. Ogni valore assoluto ha un coefficiente positivo in una funzione obiettivo da minimizzare, quindi si può linearizzare: introduciamo le seguenti quattro variabili decisionali non negative:

            $$
            e_t = \text{scostamento della retta nella settimana } t, \qquad \forall t \in \{1,2,3,4\},
            $$

            e imponiamo $e_t \ge y_t - a - b\,t$ e $e_t \ge -(y_t - a - b\,t)$, cioè $e_t + a + t\,b \ge y_t$ e $e_t - a - t\,b \ge -y_t$. Con queste variabili, un modello di programmazione lineare (LP) per il problema è il seguente:

            !!! chiave ""

                $$
                \begin{array}{rrcrcrcrcrcrcr}
                {\min} & {e_{1}} & {+} & {e_{2}} & {+} & {e_{3}} & {+} & {e_{4}} &  &  &  &  \\[1ex]
                \text{soggetto a} & {e_{1}} &  &  &  &  &  &  & {+} & {a} & {+} & {b} & {\ge} & {3} \\[1ex]
                &  &  & {e_{2}} &  &  &  &  & {+} & {a} & {+} & {2\,b} & {\ge} & {4} \\[1ex]
                &  &  &  &  & {e_{3}} &  &  & {+} & {a} & {+} & {3\,b} & {\ge} & {8} \\[1ex]
                &  &  &  &  &  &  & {e_{4}} & {+} & {a} & {+} & {4\,b} & {\ge} & {9} \\[1ex]
                & {e_{1}} &  &  &  &  &  &  & {-} & {a} & {-} & {b} & {\ge} & {-3} \\[1ex]
                &  &  & {e_{2}} &  &  &  &  & {-} & {a} & {-} & {2\,b} & {\ge} & {-4} \\[1ex]
                &  &  &  &  & {e_{3}} &  &  & {-} & {a} & {-} & {3\,b} & {\ge} & {-8} \\[1ex]
                &  &  &  &  &  &  & {e_{4}} & {-} & {a} & {-} & {4\,b} & {\ge} & {-9} \\[1ex]
                & {e_{1},} &  & {e_{2},} &  & {e_{3},} &  & {e_{4}} &  &  &  &  & {\ge} & {0} \\[1ex]
                &  &  &  &  &  &  &  &  & {a,} &  & {b} & {\gtreqless} & {0}
                \end{array}
                $$

            Descrizione della funzione obiettivo e dei vincoli del modello LP:

            - la funzione obiettivo lineare minimizza la somma degli scostamenti;

            - i primi quattro vincoli lineari impongono che ogni scostamento $e_t$ non sia minore di $y_t - a - b\,t$;

            - i quattro vincoli lineari successivi impongono che ogni scostamento $e_t$ non sia minore di $-(y_t - a - b\,t)$; insieme ai precedenti, impongono $e_t \ge |\,y_t - a - b\,t\,|$, e poiché gli scostamenti sono minimizzati, in una soluzione ottima ogni $e_t$ è esattamente uguale al valore assoluto;

            - gli ultimi vincoli definiscono le variabili del modello: gli scostamenti sono non negativi, mentre l'intercetta e la pendenza sono libere.

            Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

        2. Ogni scelta di $a$ e $b$ dà una soluzione ammissibile, ponendo ogni $e_t$ uguale al corrispondente valore assoluto. Per esempio, la retta $2\,t$ ($\bar a = 0$, $\bar b = 2$) assume i valori $2$, $4$, $6$ e $8$ nelle quattro settimane, quindi

            $$
            \bar a = 0,~~\bar b = 2,~~\bar e_1 = |3 - 2| = 1,~~\bar e_2 = |4 - 4| = 0,~~\bar e_3 = |8 - 6| = 2,~~\bar e_4 = |9 - 8| = 1
            $$

            è una soluzione ammissibile. Il valore della funzione obiettivo di questa soluzione ammissibile è:

            $$
            1 + 0 + 2 + 1 = 4
            $$

            di conseguenza $4$ è un upper bound sul valore ottimo del modello LP. Quindi, abbiamo:

            $$
            z(~LP~) ~\le~ 4
            $$

        3. Usando una variabile duale non negativa $\alpha_t$ per ciascuno dei primi quattro vincoli e una variabile duale non negativa $\beta_t$ per ciascuno dei quattro vincoli successivi ($t \in \{1,2,3,4\}$), il duale del modello LP è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcrcrcr}
            {\max} & {3\,\alpha_{1}} & {+} & {4\,\alpha_{2}} & {+} & {8\,\alpha_{3}} & {+} & {9\,\alpha_{4}} & {-} & {3\,\beta_{1}} & {-} & {4\,\beta_{2}} & {-} & {8\,\beta_{3}} & {-} & {9\,\beta_{4}} \\[1ex]
            \text{soggetto a} & {\alpha_{1}} &  &  &  &  &  &  & {+} & {\beta_{1}} &  &  &  &  &  &  & {\le} & {1} \\[1ex]
            &  &  & {\alpha_{2}} &  &  &  &  &  &  & {+} & {\beta_{2}} &  &  &  &  & {\le} & {1} \\[1ex]
            &  &  &  &  & {\alpha_{3}} &  &  &  &  &  &  & {+} & {\beta_{3}} &  &  & {\le} & {1} \\[1ex]
            &  &  &  &  &  &  & {\alpha_{4}} &  &  &  &  &  &  & {+} & {\beta_{4}} & {\le} & {1} \\[1ex]
            & {\alpha_{1}} & {+} & {\alpha_{2}} & {+} & {\alpha_{3}} & {+} & {\alpha_{4}} & {-} & {\beta_{1}} & {-} & {\beta_{2}} & {-} & {\beta_{3}} & {-} & {\beta_{4}} & {=} & {0} \\[1ex]
            & {\alpha_{1}} & {+} & {2\,\alpha_{2}} & {+} & {3\,\alpha_{3}} & {+} & {4\,\alpha_{4}} & {-} & {\beta_{1}} & {-} & {2\,\beta_{2}} & {-} & {3\,\beta_{3}} & {-} & {4\,\beta_{4}} & {=} & {0} \\[1ex]
            & {\alpha_{1},} &  & {\alpha_{2},} &  & {\alpha_{3},} &  & {\alpha_{4},} &  & {\beta_{1},} &  & {\beta_{2},} &  & {\beta_{3},} &  & {\beta_{4}} & {\ge} & {0}
            \end{array}
            $$

            I primi quattro vincoli corrispondono alle variabili non negative $e_t$, mentre gli ultimi due vincoli sono uguaglianze, poiché corrispondono alle variabili libere $a$ e $b$.

            Per esempio, ponendo:

            $$
            \bar\alpha_1 = \tfrac{1}{2},~~\bar\alpha_2 = 0,~~\bar\alpha_3 = \tfrac{1}{2},~~\bar\alpha_4 = 0,~~\bar\beta_1 = 0,~~\bar\beta_2 = 1,~~\bar\beta_3 = 0,~~\bar\beta_4 = 0
            $$

            otteniamo una soluzione duale ammissibile: i primi quattro vincoli diventano $\frac{1}{2} \le 1$, $1 \le 1$, $\frac{1}{2} \le 1$ e $0 \le 1$, e le due uguaglianze diventano $\frac{1}{2} + \frac{1}{2} - 1 = 0$ e $\frac{1}{2} + \frac{3}{2} - 2 = 0$. Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

            $$
            3 \cdot \tfrac{1}{2} + 8 \cdot \tfrac{1}{2} - 4 \cdot 1 = \tfrac{3}{2}
            $$

            Di conseguenza, $\frac{3}{2}$ è un lower bound sul valore ottimo del modello LP. Quindi, abbiamo:

            $$
            \tfrac{3}{2} ~\le~ z(~LP~) ~\le~ 4
            $$

        4. La retta $1 + 2\,t$ assume i valori $3$, $5$, $7$ e $9$ nelle quattro settimane, quindi corrisponde alla soluzione ammissibile

            $$
            \tilde a = 1,~~\tilde b = 2,~~\tilde e_1 = 0,~~\tilde e_2 = 1,~~\tilde e_3 = 1,~~\tilde e_4 = 0,
            $$

            il cui valore è $0 + 1 + 1 + 0 = 2$.

            Le condizioni degli scarti complementari danno:

            - il vincolo $e_2 + a + 2\,b \ge 4$ non è attivo ($1 + 1 + 4 = 6 > 4$), quindi $\tilde\alpha_2 = 0$; il vincolo $e_3 - a - 3\,b \ge -8$ non è attivo ($1 - 1 - 6 = -6 > -8$), quindi $\tilde\beta_3 = 0$;

            - le variabili $\tilde e_2$ e $\tilde e_3$ sono positive, quindi i corrispondenti vincoli duali sono soddisfatti all'uguaglianza: $\alpha_2 + \beta_2 = 1$ e $\alpha_3 + \beta_3 = 1$, cioè $\tilde\beta_2 = 1$ e $\tilde\alpha_3 = 1$;

            - le due uguaglianze del modello duale diventano:

                $$
                \begin{cases}
                \alpha_1 - \beta_1 + \alpha_4 - \beta_4 = 0\\[0.5ex]
                \alpha_1 - \beta_1 + 4\,(\alpha_4 - \beta_4) = -1
                \end{cases}
                $$

                la cui soluzione è $\alpha_1 - \beta_1 = \frac{1}{3}$ e $\alpha_4 - \beta_4 = -\frac{1}{3}$.

            Scegliamo, per esempio, $\tilde\alpha_1 = \frac{1}{3}$, $\tilde\beta_1 = 0$, $\tilde\alpha_4 = 0$ e $\tilde\beta_4 = \frac{1}{3}$, che soddisfano $\alpha_t + \beta_t \le 1$ e le condizioni di segno. La soluzione duale

            $$
            \tilde\alpha_1 = \tfrac{1}{3},~~\tilde\alpha_2 = 0,~~\tilde\alpha_3 = 1,~~\tilde\alpha_4 = 0,~~\tilde\beta_1 = 0,~~\tilde\beta_2 = 1,~~\tilde\beta_3 = 0,~~\tilde\beta_4 = \tfrac{1}{3}
            $$

            è quindi ammissibile, e il suo valore è:

            $$
            3 \cdot \tfrac{1}{3} + 8 \cdot 1 - 4 \cdot 1 - 9 \cdot \tfrac{1}{3} = 2 .
            $$

            La soluzione primale e quella duale hanno lo stesso valore: per il teorema di dualità forte entrambe sono ottime, e

            $$
            z(~LP~) = 2 .
            $$
    <!-- soluzione:fine -->

8. **Copertura (1)**

    Il pronto soccorso di un ospedale divide la giornata in sei periodi di quattro ore: il periodo 1 dalle 0 alle 4, il periodo 2 dalle 4 alle 8, il periodo 3 dalle 8 alle 12, il periodo 4 dalle 12 alle 16, il periodo 5 dalle 16 alle 20 e il periodo 6 dalle 20 alle 24. Il numero minimo di infermieri necessari nei sei periodi è, rispettivamente, 4, 8, 10, 7, 12 e 4. Ogni infermiere lavora un turno di otto ore consecutive, che inizia all'inizio di uno dei sei periodi: il turno che inizia all'inizio del periodo 6 prosegue nel periodo 1 del giorno seguente. Il costo di un infermiere è di 400 euro a turno, tranne che per i turni di notte che iniziano all'inizio dei periodi 1 e 6, che costano 500 euro. L'obiettivo dell'ospedale è determinare quanti infermieri iniziano il turno all'inizio di ciascun periodo, in modo da coprire il fabbisogno di tutti i periodi a costo minimo.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema, misurando i costi in centinaia di euro. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Trovare una soluzione ammissibile del modello LP e, di conseguenza, un upper bound sul suo valore ottimo.

    3. Scrivere il modello duale del modello LP. Trovare una soluzione ammissibile del modello duale e, di conseguenza, un lower bound sul valore ottimo del modello LP.

    4. Dimostrare che il piano in cui $4$, $10$, $0$, $8$, $4$ e $0$ infermieri iniziano il turno all'inizio dei periodi $1, 2, \dots, 6$, rispettivamente, è ottimo, trovando con le condizioni degli scarti complementari una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

    <!-- soluzione:inizio -->
    ??? soluzione "Soluzione"

        !!! nota ""

            Assumiamo che il numero di infermieri di ciascun turno possa essere frazionario, cioè che sia misurato in equivalenti a tempo pieno (per esempio, due infermieri che lavorano a giorni alterni contano come un infermiere). Senza questa ipotesi le variabili dovrebbero essere intere, e il modello non sarebbe un modello LP.

        1. Introduciamo le seguenti sei variabili decisionali non negative:

            $$
            x_k = \text{infermieri il cui turno inizia nel periodo } k, \qquad \forall k \in \{1,2,\dots,6\}.
            $$

            Nel periodo $t$ gli infermieri in servizio sono quelli che hanno iniziato il turno all'inizio del periodo $t$ e quelli che lo hanno iniziato all'inizio del periodo precedente, che per il periodo 1 è il periodo 6. Con queste variabili, un modello di programmazione lineare (LP) per il problema è il seguente:

            !!! chiave ""

                $$
                \begin{array}{rrcrcrcrcrcrcr}
                {\min} & {5\,x_{1}} & {+} & {4\,x_{2}} & {+} & {4\,x_{3}} & {+} & {4\,x_{4}} & {+} & {4\,x_{5}} & {+} & {5\,x_{6}} \\[1ex]
                \text{soggetto a} & {x_{1}} &  &  &  &  &  &  &  &  & {+} & {x_{6}} & {\ge} & {4} \\[1ex]
                & {x_{1}} & {+} & {x_{2}} &  &  &  &  &  &  &  &  & {\ge} & {8} \\[1ex]
                &  &  & {x_{2}} & {+} & {x_{3}} &  &  &  &  &  &  & {\ge} & {10} \\[1ex]
                &  &  &  &  & {x_{3}} & {+} & {x_{4}} &  &  &  &  & {\ge} & {7} \\[1ex]
                &  &  &  &  &  &  & {x_{4}} & {+} & {x_{5}} &  &  & {\ge} & {12} \\[1ex]
                &  &  &  &  &  &  &  &  & {x_{5}} & {+} & {x_{6}} & {\ge} & {4} \\[1ex]
                & {x_{1},} &  & {x_{2},} &  & {x_{3},} &  & {x_{4},} &  & {x_{5},} &  & {x_{6}} & {\ge} & {0}
                \end{array}
                $$

            Descrizione della funzione obiettivo e dei vincoli del modello LP:

            - la funzione obiettivo lineare minimizza il costo totale degli infermieri, in centinaia di euro;

            - i sei vincoli lineari sono *vincoli di copertura*: per ogni periodo, gli infermieri in servizio sono almeno il numero minimo richiesto;

            - l'ultimo vincolo definisce le variabili del modello.

            Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

        2. Per esempio, possiamo usare solo i turni che iniziano all'inizio dei periodi dispari, ciascuno con il fabbisogno maggiore fra i due periodi che copre:

            $$
            \begin{gathered}
            \bar x_1 = \max\{4, 8\} = 8,~~\bar x_3 = \max\{10, 7\} = 10,~~\bar x_5 = \max\{12, 4\} = 12,\\[0.5ex]
            \bar x_2 = \bar x_4 = \bar x_6 = 0 .
            \end{gathered}
            $$

            Questa è una soluzione ammissibile: gli infermieri in servizio nei sei periodi sono $8$, $8$, $10$, $10$, $12$ e $12$. Il valore della funzione obiettivo di questa soluzione ammissibile è:

            $$
            5 \cdot 8 + 4 \cdot 10 + 4 \cdot 12 = 128
            $$

            di conseguenza $128$ è un upper bound sul valore ottimo del modello LP. Quindi, abbiamo:

            $$
            z(~LP~) ~\le~ 128
            $$

        3. Usando una variabile duale non negativa $y_t$ per il vincolo di copertura del periodo $t$ ($t \in \{1,2,\dots,6\}$), il duale del modello LP è il seguente:

            $$
            \begin{array}{rrcrcrcrcrcrcr}
            {\max} & {4\,y_{1}} & {+} & {8\,y_{2}} & {+} & {10\,y_{3}} & {+} & {7\,y_{4}} & {+} & {12\,y_{5}} & {+} & {4\,y_{6}} \\[1ex]
            \text{soggetto a} & {y_{1}} & {+} & {y_{2}} &  &  &  &  &  &  &  &  & {\le} & {5} \\[1ex]
            &  &  & {y_{2}} & {+} & {y_{3}} &  &  &  &  &  &  & {\le} & {4} \\[1ex]
            &  &  &  &  & {y_{3}} & {+} & {y_{4}} &  &  &  &  & {\le} & {4} \\[1ex]
            &  &  &  &  &  &  & {y_{4}} & {+} & {y_{5}} &  &  & {\le} & {4} \\[1ex]
            &  &  &  &  &  &  &  &  & {y_{5}} & {+} & {y_{6}} & {\le} & {4} \\[1ex]
            & {y_{1}} &  &  &  &  &  &  &  &  & {+} & {y_{6}} & {\le} & {5} \\[1ex]
            & {y_{1},} &  & {y_{2},} &  & {y_{3},} &  & {y_{4},} &  & {y_{5},} &  & {y_{6}} & {\ge} & {0}
            \end{array}
            $$

            Ogni vincolo duale corrisponde a un turno: la somma delle variabili duali dei due periodi coperti dal turno non può superare il suo costo. La variabile duale $y_t$ si può interpretare come il prezzo di un infermiere nel periodo $t$.

            Per esempio, ripartendo in parti uguali fra i due periodi coperti il costo minimo di un turno:

            $$
            \bar y_1 = \bar y_2 = \bar y_3 = \bar y_4 = \bar y_5 = \bar y_6 = 2
            $$

            otteniamo una soluzione duale ammissibile, poiché ogni vincolo duale diventa $4 \le 4$ oppure $4 \le 5$. Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

            $$
            (4 + 8 + 10 + 7 + 12 + 4) \cdot 2 = 90
            $$

            Di conseguenza, $90$ è un lower bound sul valore ottimo del modello LP. Quindi, abbiamo:

            $$
            90 ~\le~ z(~LP~) ~\le~ 128
            $$

        4. Il piano della domanda è la soluzione

            $$
            \tilde x_1 = 4,~~\tilde x_2 = 10,~~\tilde x_3 = 0,~~\tilde x_4 = 8,~~\tilde x_5 = 4,~~\tilde x_6 = 0,
            $$

            in cui gli infermieri in servizio nei sei periodi sono $4$, $14$, $10$, $8$, $12$ e $4$: è ammissibile, e il suo valore è $5 \cdot 4 + 4 \cdot 10 + 4 \cdot 8 + 4 \cdot 4 = 108$.

            Le condizioni degli scarti complementari danno:

            - i vincoli di copertura dei periodi $2$ e $4$ non sono attivi ($14 > 8$ e $8 > 7$), quindi $\tilde y_2 = 0$ e $\tilde y_4 = 0$;

            - le variabili $\tilde x_1$, $\tilde x_2$, $\tilde x_4$ e $\tilde x_5$ sono positive, quindi i corrispondenti vincoli duali sono soddisfatti all'uguaglianza:

                $$
                \begin{cases}
                y_1 + y_2 = 5\\[0.5ex]
                y_2 + y_3 = 4\\[0.5ex]
                y_4 + y_5 = 4\\[0.5ex]
                y_5 + y_6 = 4
                \end{cases}
                $$

            Otteniamo $\tilde y_1 = 5$, $\tilde y_3 = 4$, $\tilde y_5 = 4$ e $\tilde y_6 = 0$. I restanti vincoli duali, di $x_3$ e $x_6$, sono soddisfatti: $4 + 0 = 4 \le 4$ e $5 + 0 = 5 \le 5$. Quindi la soluzione duale

            $$
            \tilde y_1 = 5,~~\tilde y_2 = 0,~~\tilde y_3 = 4,~~\tilde y_4 = 0,~~\tilde y_5 = 4,~~\tilde y_6 = 0
            $$

            è ammissibile, e il suo valore è:

            $$
            4 \cdot 5 + 10 \cdot 4 + 12 \cdot 4 = 108 .
            $$

            La soluzione primale e quella duale hanno lo stesso valore: per il teorema di dualità forte entrambe sono ottime, e

            $$
            z(~LP~) = 108 ,
            $$

            cioè il costo minimo è di $10800$ euro al giorno. In questa istanza la soluzione ottima è intera, quindi è anche un piano ottimo con numeri interi di infermieri.
    <!-- soluzione:fine -->

