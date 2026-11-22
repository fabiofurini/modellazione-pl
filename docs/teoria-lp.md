# 2. Richiami: programmazione lineare e analisi di sensitività

[:material-file-pdf-box: Dispensa (PDF)](pdf/dispensa-modellazione-pl.pdf) · [:material-presentation: Slide del capitolo (PDF)](pdf/slide-02-richiami.pdf)

!!! nota "Prerequisiti"

    - Dal modulo *Programmazione lineare*, [Capitolo 9 «Teoria della dualità»](https://fabiofurini.github.io/programmazione-lineare/dualita/09-dualita/): il duale di un problema di programmazione lineare, la dualità debole e forte, gli scarti complementari.

    - Dal modulo *Programmazione lineare*, [Capitolo 14 «Analisi di sensitività»](https://fabiofurini.github.io/programmazione-lineare/metodi-avanzati/14-sensitivita/): prezzi ombra, costi ridotti e i loro intervalli di validità.

!!! chiave "Obiettivi"

    Alla fine di questo capitolo sarai in grado di:

    - scrivere il duale di un LP in forma generale con le regole di conversione;

    - verificare l'ottimalità con gli scarti complementari;

    - dedurre il segno di un prezzo ombra dal verso del vincolo e dal verso dell'obiettivo;

    - leggere un prezzo ombra e un costo ridotto insieme ai loro intervalli di validità;

    - applicare i sei passi del protocollo di sensitività.

I richiami di programmazione lineare usati in tutto il corso: dualità, condizioni
di ottimalità, analisi di sensitività e il protocollo di sensitività di ogni
capitolo. La teoria completa, con le dimostrazioni, è nel modulo *Programmazione
lineare*: [«Teoria della dualità»](https://fabiofurini.github.io/programmazione-lineare/dualita/09-dualita/)
e [«Analisi di sensitività»](https://fabiofurini.github.io/programmazione-lineare/metodi-avanzati/14-sensitivita/).

## Programmazione lineare e dualità

I *dati* sono i costi $c_j$, i coefficienti $a_{ij}$ e i termini noti $b_i$, con
$i \in M = \{1, 2, \dots, m\}$ e $j \in N = \{1, 2, \dots, n\}$. Gli insiemi
$M_{\le}, M_{=}, M_{\ge}$ ripartiscono $M$ secondo il verso del vincolo; gli
insiemi $N_{\ge 0}, N_{\gtreqless 0}, N_{\le 0}$ ripartiscono $N$ secondo il segno
della variabile (non negative, libere, non positive).

Le *variabili* sono le $x_j$ del primale (P), un problema di massimo in forma generale, e,
nel duale (D) di minimo, una $\pi_i$ per ciascun vincolo del primale. I due modelli completi
sono nel capitolo [«Teoria della dualità»](https://fabiofurini.github.io/programmazione-lineare/dualita/09-dualita/)
di *Programmazione lineare*.

**Le regole della dualità** — ogni vincolo del primale genera una variabile duale,
ogni variabile un vincolo duale:

| Primale (max) | Duale (min) |
|---|---|
| vincolo $\le b_i$ ($i \in M_{\le}$) | variabile $\pi_i \ge 0$ |
| vincolo $= b_i$ ($i \in M_{=}$) | variabile $\pi_i \gtreqless 0$ |
| vincolo $\ge b_i$ ($i \in M_{\ge}$) | variabile $\pi_i \le 0$ |
| variabile $x_j \ge 0$ ($j \in N_{\ge 0}$) | vincolo $\ge c_j$ |
| variabile $x_j \gtreqless 0$ ($j \in N_{\gtreqless 0}$) | vincolo $= c_j$ |
| variabile $x_j \le 0$ ($j \in N_{\le 0}$) | vincolo $\le c_j$ |

Le *uguaglianze* del primale danno duali *libere* (e viceversa); per un primale di
**minimo** la tabella si legge da destra a sinistra.

**Teorema (dualità debole).** Per ogni soluzione ammissibile $(\bar x_1, \dots, \bar x_n)$
di (P) e ogni soluzione ammissibile $(\bar\pi_1, \dots, \bar\pi_m)$ di (D):

$$
\sum_{j \in N} c_j \bar x_j \;\le\; \sum_{i \in M} b_i \bar\pi_i .
$$

**Teorema (dualità forte).** (P) ha una soluzione ottima $(\tilde x_1, \dots, \tilde x_n)$
**se e solo se** (D) ha una soluzione ottima $(\tilde\pi_1, \dots, \tilde\pi_m)$,
e in tal caso i valori ottimi coincidono:

$$
\sum_{j \in N} c_j \tilde x_j \;=\; \sum_{i \in M} b_i \tilde\pi_i .
$$

Se due soluzioni ammissibili, del primale e del duale, hanno lo stesso valore, sono entrambe
ottime. Le dimostrazioni e gli esempi di costruzione del duale sono nel capitolo
[«Teoria della dualità»](https://fabiofurini.github.io/programmazione-lineare/dualita/09-dualita/)
di *Programmazione lineare*.

## Le condizioni di ottimalità dell'LP: gli scarti complementari

A ogni vincolo associamo il suo *scarto* $\bar s_i$, a ogni variabile il suo
*costo ridotto* $\bar c_j$, cioè lo scarto del corrispondente vincolo *duale*:

$$
\bar s_i = \sum_{j \in N} a_{ij} \bar x_j - b_i, \quad \forall i \in M,
\qquad
\bar c_j = c_j - \sum_{i \in M} a_{ij} \bar\pi_i, \quad \forall j \in N.
$$

Lo scarto misura quanto il vincolo è lontano dall'essere attivo; il costo ridotto
misura $c_j$ al netto del valore delle risorse consumate, ai prezzi ombra.

Una coppia di soluzioni ammissibili è ottima per entrambi i problemi **se e solo
se** valgono gli **scarti complementari**:

$$
\bar\pi_i \cdot \bar s_i = 0, \quad \forall i \in M,
\qquad
\bar x_j \cdot \bar c_j = 0, \quad \forall j \in N.
$$

In parole: **vincolo lasco ⇒ duale a zero**, e variabile diversa da zero ⇒ costo
ridotto nullo. All'ottimo sono *implicazioni*, non equivalenze (degenerazione:
può esistere una variabile a zero con costo ridotto nullo).

**Due letture da ricordare:**

- **prezzo ombra** $\tilde\pi_i = \partial \tilde z / \partial b_i$: il valore
  marginale del termine noto; vale nell'**intervallo di validità del termine
  noto** $[b_i^{\min}, b_i^{\max}]$, il più grande intervallo in cui, variando
  solo $b_i$, il prezzo ombra resta esattamente $\tilde\pi_i$. Vincolo non
  attivo ⇒ $\tilde\pi_i = 0$;
- **costo ridotto** $\bar c_j$: per una variabile a zero, di quanto deve
  migliorare $c_j$ perché convenga attivarla; vale nell'**intervallo di validità
  del coefficiente** $[c_j^{\min}, c_j^{\max}]$, il più grande intervallo in cui,
  variando solo $c_j$, la soluzione ottima non cambia (per una variabile a zero
  la soglia di convenienza è uno dei due estremi). Variabile diversa da zero ⇒
  $\bar c_j = 0$.

**I segni dei prezzi ombra.** Il segno di
$\tilde\pi_i = \partial \tilde z / \partial b_i$ si deduce con due domande:
*aumentare $b_i$ allarga o restringe la regione ammissibile?* (la allarga con
$\le$, la restringe con $\ge$); *una regione più ampia come cambia l'ottimo?*
(non può mai peggiorarlo).

| Verso del vincolo | minimo | massimo |
|---|---|---|
| $\le$ ($b_i$ ↑ ⇒ regione più ampia) | $\tilde\pi_i \le 0$ | $\tilde\pi_i \ge 0$ |
| $\ge$ ($b_i$ ↑ ⇒ regione più stretta) | $\tilde\pi_i \ge 0$ | $\tilde\pi_i \le 0$ |
| $=$ | segno qualunque | segno qualunque |

Un vincolo **non attivo** ha sempre $\tilde\pi_i = 0$ (complementarietà).

!!! example "Dualità sull'LP 2×2, svolta per intero"
    L'LP 2×2 usato in tutto il corso è $\max 30x_1 + 50x_2$ con $x_1 + 3x_2 \le 90$,
    $2x_1 + x_2 \le 80$ e $x_1, x_2 \ge 0$; il suo duale è $\min 90\pi_1 + 80\pi_2$ con
    $\pi_1 + 2\pi_2 \ge 30$, $3\pi_1 + \pi_2 \ge 50$ e $\pi_1, \pi_2 \ge 0$.

    **Risolvendo si ottiene**: $(\tilde x_1, \tilde x_2) = (30, 20)$,
    $\tilde z = 1900$, $(\tilde\pi_1, \tilde\pi_2) = (14, 8)$,
    $(\bar c_1, \bar c_2) = (0, 0)$, con intervalli di validità
    $[b_1^{\min}, b_1^{\max}] = [40, 240]$, $[b_2^{\min}, b_2^{\max}] = [30, 180]$,
    $[c_1^{\min}, c_1^{\max}] = [50/3, 100]$, $[c_2^{\min}, c_2^{\max}] = [15, 90]$;
    entrambi i vincoli attivi.

    **Verifiche**: $x_1, x_2 \ne 0$ ⇒ vincoli duali attivi
    ($\bar c_1 = \bar c_2 = 0$) e dualità forte:

    $$
    14 + 16 = 30 = c_1, \qquad 42 + 8 = 50 = c_2,
    \qquad 90 \cdot 14 + 80 \cdot 8 = 1900 = \tilde z . \quad ✓
    $$

## L'analisi di sensitività negli LP

Insieme alla soluzione arrivano gratis quattro numeri per ogni vincolo e variabile:

- il **prezzo ombra** $\tilde\pi_i$: valore marginale del termine noto;
- l'**intervallo di validità del termine noto** $[b_i^{\min}, b_i^{\max}]$
  (nell'esempio 2×2: il prezzo ombra 14 vale finché $b_1$ resta in $[40, 240]$);
- il **costo ridotto** $\bar c_j$: per una variabile a zero, quanto deve
  migliorare il suo coefficiente perché convenga attivarla;
- l'**intervallo di validità del coefficiente** $[c_j^{\min}, c_j^{\max}]$
  (nell'esempio 2×2: $c_1$ può variare in $[50/3, 100]$ e $c_2$ in $[15, 90]$
  senza spostare la soluzione).

!!! example "Prezzi ombra in pratica"
    Sull'LP 2×2 ($\tilde z = 1900$, $\tilde\pi_1 = 14$): una unità in più di
    $b_1$ vale 14; se costasse 12, converrebbe. Per perturbazione:

    $$
    b_1 = 91 \Rightarrow 1914 = 1900 + 14,
    \qquad
    b_1 = 100 \Rightarrow 2040 = 1900 + 10 \cdot 14,
    $$

    esatto perché $100 \in [40, 240]$. A $b_1 = 240$ la struttura cambia: oltre,
    ogni unità vale meno di 14. Con $b_1 = 300$ il vincolo sarebbe non attivo e
    il prezzo ombra $0$.

!!! example "Costi ridotti in pratica: conviene una terza variabile?"
    Aggiungiamo all'LP 2×2 una variabile $x_3 \ge 0$ con coefficiente $c_3 = 20$
    e consumi $a_{13} = a_{23} = 1$. Ai prezzi ombra le risorse assorbite valgono

    $$
    1 \cdot 14 + 1 \cdot 8 = 22 > 20 = c_3 ,
    \qquad
    \bar c_3 = 20 - 22 = -2 :
    $$

    la soluzione resta $(30, 20, 0)$ con $\tilde z = 1900$ e $c_3^{\max} = 22$ —
    il coefficiente deve salire almeno a 22. Controprova con $c_3 = 23$: la
    soluzione cambia in $(0, 5, 75)$, valore 1975.

## Il protocollo di sensitività (usato in ogni capitolo)

1. **Scenario base**: risolvere, verificare, identificare i vincoli attivi.
2. **One-at-a-time**: variare un parametro chiave su una griglia.
3. **Prezzi ombra e costi ridotti**: confrontare il duale con una ri-ottimizzazione
   perturbata; leggere $\bar c_j$ di ogni variabile a zero (la sua soglia di
   convenienza).
4. **Scenari**: pessimistico, centrale, ottimistico.
5. **Trade-off**: costruire una frontiera (costo-servizio, rischio-rendimento…).
6. **Stabilità**: dati ±5% → la raccomandazione regge?

## In sintesi

!!! chiave "In sintesi"

    - Ogni vincolo genera una variabile duale e ogni variabile un vincolo duale; la dualità debole dà un bound, quella forte valori uguali all'ottimo.

    - Scarti complementari: un vincolo non attivo ha duale nullo, una variabile non nulla ha costo ridotto nullo.

    - Il prezzo ombra $\tilde\pi_i = \partial \tilde z / \partial b_i$ vale solo dentro il suo intervallo; un numero si riporta sempre con il suo intervallo.

    - Il costo ridotto dice di quanto deve migliorare $c_j$ perché convenga usare una variabile ferma a zero.

    - Il protocollo: caso base, one-at-a-time, prezzi ombra verificati per perturbazione, scenari, trade-off, stabilità.
