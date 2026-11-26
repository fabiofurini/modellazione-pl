# Esempio 4.8 — Produzione su più periodi con acquisti e stoccaggio

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-04-tecniche.pdf) · [:material-gesture-tap: App: Produzione su più periodi con acquisti](laboratorio/produzione-piu-periodi.md)

**Modello:** simbolico · **Tecniche:** [4.5 Pianificazione su più periodi](tecniche-05.md) · [Tutti i modelli svolti](tecniche.md#modelli-svolti)

## Il problema

!!! abstract "Produzione su più periodi con acquisti e stoccaggio"

    Un'azienda deve soddisfare la domanda prevista di un prodotto chimico su un orizzonte temporale di $n \in \mathbb{Z}_{\ge 1}$ giorni. Per ogni giorno $t \in \{1, 2, \dots, n\}$, la quantità $d_t \in \mathbb{Q}_{\ge  0}$ è la domanda prevista, in litri di prodotto. In ogni giorno $t \in \{1,2,\dots,n\}$, l'azienda può produrre fino a $m_t \in \mathbb{Q}_{\ge 0}$ litri a un costo di $p_t \in \mathbb{Q}_{>0}$ euro al litro, acquistare dal mercato a un costo di $u_t \in \mathbb{Q}_{>0}$ euro al litro, e immagazzinare prodotto alla fine del giorno in un magazzino a un costo di mantenimento di $h_t \in \mathbb{Q}_{>0}$ euro al litro. La scorta iniziale nel magazzino è di $\ell_0 \in \mathbb{Q}_{\ge 0}$ litri, mentre alla fine dell'orizzonte temporale è richiesta una scorta di sicurezza di $\ell_n \in \mathbb{Q}_{\ge 0}$ litri. Le capacità di stoccaggio e di acquisto si assumono illimitate. L'azienda vuole determinare un piano di costo minimo che soddisfi la domanda e rispetti i vincoli descritti sopra.

**Domande**

1. Scrivere un modello di programmazione lineare (LP) per il problema.  Individuare le decisioni da prendere e le corrispondenti variabili decisionali. Individuare e commentare la funzione obiettivo e i vincoli del modello.   Quale algoritmo si può usare per trovare una soluzione ottima del modello?

2. Consideriamo ora un'istanza del problema con $4$ giorni ($n=4$) e i seguenti dati:

    |  | $t=1$ | $t=2$ | $t=3$ | $t=4$ |
    |---|---|---|---|---|
    | $d_t$ | 45 | 60 | 75 | 75 |
    | $p_t$ | 10 | 10 | 10 | 10 |
    | $u_t$ | 15 | 15 | 15 | 15 |
    | $h_t$ | 2 | 2 | 2 | 2 |
    | $m_t$ | 40 | 50 | 150 | 40 |

    Inoltre $\ell_0 = 10$ e $\ell_n=5$. Scrivere il modello LP per questa istanza.

3. Trovare una soluzione ammissibile del modello LP dell'istanza e, di conseguenza, un upper bound sul valore ottimo del modello LP per l'istanza.

4. Scrivere il modello duale del modello LP e il modello duale per l'istanza. Trovare una soluzione ammissibile del modello duale dell'istanza e, di conseguenza, un lower bound sul valore ottimo del modello LP per l'istanza.

## Svolgimento

1. Introduciamo le seguenti $2 \; n+ n-1$ variabili non negative:

    $$
    \begin{cases}
    x_t = \text{  litri prodotti nel giorno } t \\[1ex]
    b_t = \text{  litri acquistati dal mercato nel giorno } t
    \end{cases}
    \qquad \forall t \in \{1,2,\dots,n\}
    $$

    \begin{align*}
    s_t &= \text{  litri in magazzino alla fine del giorno } t, \qquad \forall t \in \{1,2,\dots,n-1\}.
    \end{align*}

    Con queste variabili, un modello LP per il problema è il seguente:

    !!! chiave ""

        <a id="eq-sm5-LP"></a>

        \begin{align*}
        \underbrace{h_n \; \ell_n}_{\text{termine costante}} + \min \quad \sum_{t=1}^n p_t \, x_t & &  \\[1ex]
        + \sum_{t=1}^n u_t \, b_t & &  \\[1ex]
        + \sum_{t=1}^{n-1} h_t \, s_t & & \label{sm5-obj}  \tag{1a}\\[1ex]
        \text{soggetto a} \quad x_1 + b_1 - s_1 &= d_1 - \ell_0, \label{sm5-cons1}  \tag{1b}\\[1ex]
        x_t + b_t + s_{t-1} - s_t &= d_t, & \forall t \in \{2,3,\dots,n-1\}, \label{sm5-cons2}  \tag{1c}\\[1ex]
        x_n + b_n + s_{n-1} &= d_n + \ell_n, \label{sm5-cons3}  \tag{1d}\\[1ex]
        x_t &\le m_t, & \forall t \in \{1,2,\dots,n\}, \label{sm5-cons4}  \tag{1e}\\[1ex]
        x_t &\ge 0, & \forall t \in \{1,2,\dots,n\}, \label{sm5-cons5}  \tag{1f}\\[1ex]
        b_t &\ge 0, & \forall t \in \{1,2,\dots,n\}, \label{sm5-cons6}  \tag{1g}\\[1ex]
        s_t &\ge 0, & \forall t \in \{1,2,\dots,n-1\}. \label{sm5-cons7} \tag{1h}
        \end{align*}

    Descrizione della funzione obiettivo e dei vincoli del modello LP:

    - la funzione obiettivo lineare $\eqref{sm5-obj}$ minimizza il costo totale di produzione, di acquisto sul mercato e di mantenimento delle scorte sull'orizzonte di pianificazione. Il termine costante $h_n \, \ell_n$ rappresenta il costo di mantenimento della scorta di sicurezza finale, ed è scritto fuori dalla minimizzazione perché non dipende dalle variabili decisionali.

    - il vincolo lineare $\eqref{sm5-cons1}$ garantisce che la domanda del primo giorno sia soddisfatta con la produzione, gli acquisti e la scorta iniziale, tenendo conto della scorta immagazzinata alla fine del primo giorno (un vincolo lineare);

    - i vincoli lineari $\eqref{sm5-cons2}$ garantiscono che, nei giorni intermedi, la domanda sia soddisfatta con la produzione giornaliera, gli acquisti e la scorta proveniente dal giorno precedente ($n-2$ vincoli lineari);

    - il vincolo lineare $\eqref{sm5-cons3}$ garantisce che la domanda dell'ultimo giorno sia soddisfatta e che la scorta di sicurezza richiesta resti in magazzino alla fine dell'orizzonte di pianificazione (un vincolo lineare);

    - i vincoli lineari $\eqref{sm5-cons4}$ garantiscono che la produzione giornaliera non superi la capacità produttiva disponibile ($n$ vincoli lineari);

    - i vincoli lineari $\eqref{sm5-cons5}$, $\eqref{sm5-cons6}$ e $\eqref{sm5-cons7}$ definiscono le variabili del modello LP.

    Il modello LP si può risolvere all'ottimo, per esempio, con l'algoritmo del simplesso.

2. Il modello LP [(1)](#eq-sm5-LP) per l'istanza (senza il termine costante) è il seguente:

    $$
    \begin{array}{rcrcrcrcrcrcrcrcrcr}
    {\min} &  & {10\,x_{1}} & {+} & {10\,x_{2}} & {+} & {10\,x_{3}} & {+} & {10\,x_{4}} & {+} & {15\,b_{1}} & {+} & {15\,b_{2}} & {+} & {15\,b_{3}} & {+} & {15\,b_{4}} &  &  \\
    & {+} & {2\,s_{1}} & {+} & {2\,s_{2}} & {+} & {2\,s_{3}} &  &  &  &  &  &  &  &  &  &  &  &  \\[1.5ex]
    \text{soggetto a} &  & {x_{1}} &  &  &  &  &  &  & {+} & {b_{1}} &  &  &  &  &  &  &  &  \\
    & {-} & {s_{1}} &  &  &  &  &  &  &  &  &  &  &  &  &  &  & {=} & {35} \\[1.5ex]
    &  &  &  & {x_{2}} &  &  &  &  &  &  & {+} & {b_{2}} &  &  &  &  &  &  \\
    & {+} & {s_{1}} & {-} & {s_{2}} &  &  &  &  &  &  &  &  &  &  &  &  & {=} & {60} \\[1.5ex]
    &  &  &  &  &  & {x_{3}} &  &  &  &  &  &  & {+} & {b_{3}} &  &  &  &  \\
    &  &  & {+} & {s_{2}} & {-} & {s_{3}} &  &  &  &  &  &  &  &  &  &  & {=} & {75} \\[1.5ex]
    &  &  &  &  &  &  &  & {x_{4}} &  &  &  &  &  &  & {+} & {b_{4}} &  &  \\
    &  &  &  &  & {+} & {s_{3}} &  &  &  &  &  &  &  &  &  &  & {=} & {80} \\[1.5ex]
    &  & {x_{1}} &  &  &  &  &  &  &  &  &  &  &  &  &  &  & {\le} & {40} \\[1.5ex]
    &  &  &  & {x_{2}} &  &  &  &  &  &  &  &  &  &  &  &  & {\le} & {50} \\[1.5ex]
    &  &  &  &  &  & {x_{3}} &  &  &  &  &  &  &  &  &  &  & {\le} & {150} \\[1.5ex]
    &  &  &  &  &  &  &  & {x_{4}} &  &  &  &  &  &  &  &  & {\le} & {40} \\[1.5ex]
    &  & {x_{1},} &  & {x_{2},} &  & {x_{3},} &  & {x_{4},} &  & {b_{1},} &  & {b_{2},} &  & {b_{3},} &  & {b_{4},} &  &  \\
    &  & {s_{1},} &  & {s_{2},} &  & {s_{3}} &  &  &  &  &  &  &  &  &  &  & {\ge} & {0}
    \end{array}
    $$

3. Per esempio, ponendo:

    $$
    \bar{x}_{1}=35,~~\bar{x}_{2}=50,~~\bar{x}_{3}=75,~~\bar{x}_{4}=40,
    $$

    $$
    ~~\bar{b}_{1}=0,~~\bar{b}_{2}=10,~~\bar{b}_{3}=0,~~\bar{b}_{4}=40,
    $$

    $$
    ~~ \bar{s}_{1}=0,~~\bar{s}_{2}=0,~~\bar{s}_{3}=0
    $$

    otteniamo una soluzione ammissibile.   Il valore della funzione obiettivo di questa soluzione ammissibile è:

    \begin{align*}
    \underbrace{h_n \; \ell_n}_{\text{termine costante}}
    + \sum_{t=1}^n p_t \,  \bar x_t
    + \sum_{t=1}^n u_t \, \bar b_t
    + \sum_{t=1}^{n-1} h_t \, \bar s_t &=  2 \cdot 5 +\\
    &+ 10 \cdot 35 + 10 \cdot 50 + 10 \cdot 75 + 10 \cdot 40 +\\
    &+ 15 \cdot 0 + 15 \cdot 10 + 15 \cdot 0 + 15 \cdot 40 +\\
    & + 2 \cdot 0 + 2 \cdot 0 + 2 \cdot 0 \\
    & = 2760
    \end{align*}

    di conseguenza $2760$ è un upper bound sul valore ottimo del modello LP [(1)](#eq-sm5-LP). Quindi, per questa istanza, abbiamo:

    $$
    z(~ LP~) \le 2760
    $$

4. Usando

    - una variabile duale libera $\mu_1$ per il vincolo $\eqref{sm5-cons1}$

    - una variabile duale libera $\mu_t$ per ogni vincolo $\eqref{sm5-cons2}$  ($t \in \{2,3,\dots,n-1\}$)

    - una variabile duale libera $\mu_n$ per il vincolo $\eqref{sm5-cons3}$

    - una variabile duale non positiva $\pi_t$ per ogni vincolo $\eqref{sm5-cons4}$ ($t \in \{1,2,\dots,n\}$)

    il duale del modello LP [(1)](#eq-sm5-LP) (senza il termine costante) è il seguente:

    !!! chiave ""

        <a id="eq-sm5-DUAL"></a>

        \begin{align*}
        \max \quad (d_1 - \ell_0) \, \mu_1 + \sum_{t=2}^{n-1} d_t \, \mu_t & &  \\[1ex]
        + (d_n + \ell_n) \, \mu_n + \sum_{t=1}^n m_t \, \pi_t & &  \tag{2a}\\[1ex]
        \text{soggetto a} \quad \mu_t + \pi_t &\le p_t, & \forall t \in \{1,2,\dots,n\},  \tag{2b}\\[1ex]
        \mu_t &\le u_t, & \forall t \in \{1,2,\dots,n\},  \tag{2c}\\[1ex]
        -\mu_t + \mu_{t+1} &\le h_t, & \forall t \in \{1,2,\dots,n-1\},  \tag{2d}\\[1ex]
        \mu_t &\gtreqless 0, & \forall t \in \{1,2,\dots,n\},  \tag{2e}\\[1ex]
        \pi_t &\le 0, & \forall t \in \{1,2,\dots,n\}. \tag{2f}
        \end{align*}

    Il modello duale [(2)](#eq-sm5-DUAL) per l'istanza (senza il termine costante) è il seguente:

    $$
    \begin{array}{rrcrcrcrcrcrcrcrcr}
    {\max} & {35\,\mu_{1}} & {+} & {60\,\mu_{2}} & {+} & {75\,\mu_{3}} & {+} & {80\,\mu_{4}} & {+} & {40\,\pi_{1}} & {+} & {50\,\pi_{2}} & {+} & {150\,\pi_{3}} & {+} & {40\,\pi_{4}} \\[1ex]
    \text{soggetto a} & {\mu_{1}} &  &  &  &  &  &  & {+} & {\pi_{1}} &  &  &  &  &  &  & {\le} & {10} \\[1ex]
    &  &  & {\mu_{2}} &  &  &  &  &  &  & {+} & {\pi_{2}} &  &  &  &  & {\le} & {10} \\[1ex]
    &  &  &  &  & {\mu_{3}} &  &  &  &  &  &  & {+} & {\pi_{3}} &  &  & {\le} & {10} \\[1ex]
    &  &  &  &  &  &  & {\mu_{4}} &  &  &  &  &  &  & {+} & {\pi_{4}} & {\le} & {10} \\[1ex]
    & {\mu_{1}} &  &  &  &  &  &  &  &  &  &  &  &  &  &  & {\le} & {15} \\[1ex]
    &  &  & {\mu_{2}} &  &  &  &  &  &  &  &  &  &  &  &  & {\le} & {15} \\[1ex]
    &  &  &  &  & {\mu_{3}} &  &  &  &  &  &  &  &  &  &  & {\le} & {15} \\[1ex]
    &  &  &  &  &  &  & {\mu_{4}} &  &  &  &  &  &  &  &  & {\le} & {15} \\[1ex]
    & {-\mu_{1}} & {+} & {\mu_{2}} &  &  &  &  &  &  &  &  &  &  &  &  & {\le} & {2} \\[1ex]
    &  & {-} & {\mu_{2}} & {+} & {\mu_{3}} &  &  &  &  &  &  &  &  &  &  & {\le} & {2} \\[1ex]
    &  &  &  & {-} & {\mu_{3}} & {+} & {\mu_{4}} &  &  &  &  &  &  &  &  & {\le} & {2} \\[1ex]
    & {\mu_{1},} &  & {\mu_{2},} &  & {\mu_{3},} &  & {\mu_{4}} &  &  &  &  &  &  &  &  & {\gtreqless} & {0} \\[1ex]
    &  &  &  &  &  &  &  &  & {\pi_{1},} &  & {\pi_{2},} &  & {\pi_{3},} &  & {\pi_{4}} & {\le} & {0}
    \end{array}
    $$

    Per esempio, ponendo:

    $$
    \bar\pi_1=0,~~\bar\pi_2=0,~~\bar\pi_3=0,~~\bar\pi_4=0
    $$

    e ponendo:

    $$
    \begin{gathered}
    \bar \mu_1=\min\{10,15\}=10,~~\bar \mu_2=\min\{10,15\}=10, \\[0.5ex]
    \bar \mu_3=\min\{10,15\}=10,~~\bar \mu_4=\min\{10,15\}=10
    \end{gathered}
    $$

    otteniamo una soluzione duale ammissibile.

    Il valore della funzione obiettivo di questa soluzione duale ammissibile è:

    \begin{align*}
    & \underbrace{h_n \; \ell_n}_{\text{termine costante}} + (d_1 - \ell_0) \; \bar \mu_1 + \sum_{t=2}^{n-1} d_t \; \bar \mu_t + (d_n + \ell_n) \; \bar \mu_n + {} \\
    & + \sum_{t=1}^n m_t \; \bar \pi_t = 2 \cdot 5 + {} \\
    &+ 35 \cdot 10 + 60 \cdot 10 + 75 \cdot 10 + 80 \cdot 10 +\\
    & + 40 \cdot 0 + 50 \cdot 0 + 150 \cdot 0 + 40 \cdot 0  \\
    &=  2510
    \end{align*}

    Di conseguenza, $2510$ è un lower bound sul valore ottimo del modello LP primale. Quindi, per questa istanza, abbiamo:

    $$
    2510 \le z(~ LP~) \le 2760
    $$

<!-- laboratorio-interattivo: sezione aggiunta per l'app dei nove modelli -->

## Prezzi ombra dell'istanza { #prezzi-ombra }

Il prezzo ombra di un vincolo è la variazione del valore ottimo per un'unità in più del suo termine noto, finché la base ottima non cambia. Per l'istanza di questa pagina (valore ottimo $2\,625$) valgono, calcolati con Gurobi:

| Vincolo | Prezzo ombra |
|---|---|
| bilancio del giorno 1 ($d_1$) | $13$ €/L |
| bilancio del giorno 2 ($d_2$) | $15$ €/L |
| bilancio del giorno 3 ($d_3$) | $10$ €/L |
| bilancio del giorno 4 ($d_4$) | $12$ €/L |
| capacità del giorno 1 ($m_1$) | $-3$ €/L |
| capacità del giorno 2 ($m_2$) | $-5$ €/L |
| capacità del giorno 3 ($m_3$) | $0$ €/L |
| capacità del giorno 4 ($m_4$) | $-2$ €/L |

## Laboratorio interattivo { #laboratorio-interattivo }

L'app risolve questo modello nel browser, con i dati dell'esempio: i cursori cambiano i dati e il simplesso ricalcola la soluzione ottima. Si apre anche a tutta pagina nel laboratorio interattivo: [Produzione su più periodi con acquisti](laboratorio/produzione-piu-periodi.md).

<div class="gi gi-capitolo" data-grafico="pl-piu-periodi"></div>
