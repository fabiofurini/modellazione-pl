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
| [4.8 rapporto](tecniche-08.md) | $\sum_j (a_j - \gamma\, e_j)\, x_j \le 0$ |

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

2. **Pianificazione della produzione (2)**

    Un'officina di biciclette assembla biciclette da città e mountain bike, vendute rispettivamente a 200 euro e 400 euro. Ogni bicicletta richiede un telaio del proprio tipo. L'officina può saldare i telai internamente: un telaio da città richiede 2 ore di saldatura e 20 euro di materiale, mentre un telaio da mountain bike richiede 3 ore di saldatura e 40 euro di materiale; sono disponibili 150 ore di saldatura alla settimana. In alternativa, i telai si possono acquistare da un fornitore, a 60 euro (telaio da città) e a 100 euro (telaio da mountain bike). L'assemblaggio di una bicicletta da città richiede 1 ora di lavoro e quello di una mountain bike ne richiede 2; sono disponibili 120 ore di assemblaggio alla settimana. Il mercato può assorbire al massimo 30 mountain bike alla settimana. L'obiettivo dell'officina è determinare un piano di produzione settimanale che massimizzi il profitto totale, cioè il ricavo delle biciclette meno il costo dei telai.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Trovare una soluzione ammissibile del modello LP e, di conseguenza, un lower bound sul suo valore ottimo.

    3. Scrivere il modello duale del modello LP. Trovare una soluzione ammissibile del modello duale e, di conseguenza, un upper bound sul valore ottimo del modello LP.

    4. Dimostrare che il piano in cui l'officina salda 30 telai da città e 30 telai da mountain bike, e acquista 30 telai da città, è ottimo, trovando con le condizioni degli scarti complementari una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

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

7. **Valori assoluti (1)**

    Un negozio ha registrato le vendite di un prodotto in quattro settimane consecutive: 3, 4, 8 e 9 centinaia di unità nelle settimane 1, 2, 3 e 4, rispettivamente. Per prevedere le vendite delle settimane successive, il negozio vuole descrivere le vendite con una *retta di tendenza*, cioè con una funzione lineare $a + b\,t$ della settimana $t$, dove l'intercetta $a$ e la pendenza $b$ possono essere numeri reali qualsiasi. Nella settimana $t$, lo scostamento della retta dalle vendite registrate $y_t$ è $|\,y_t - a - b\,t\,|$. L'obiettivo del negozio è determinare i valori di $a$ e $b$ che minimizzano la somma degli scostamenti nelle quattro settimane.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Trovare una soluzione ammissibile del modello LP e, di conseguenza, un upper bound sul suo valore ottimo.

    3. Scrivere il modello duale del modello LP. Trovare una soluzione ammissibile del modello duale e, di conseguenza, un lower bound sul valore ottimo del modello LP.

    4. Dimostrare che la retta di tendenza $1 + 2\,t$ è ottima, trovando con le condizioni degli scarti complementari una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?

8. **Copertura (1)**

    Il pronto soccorso di un ospedale divide la giornata in sei periodi di quattro ore: il periodo 1 dalle 0 alle 4, il periodo 2 dalle 4 alle 8, il periodo 3 dalle 8 alle 12, il periodo 4 dalle 12 alle 16, il periodo 5 dalle 16 alle 20 e il periodo 6 dalle 20 alle 24. Il numero minimo di infermieri necessari nei sei periodi è, rispettivamente, 4, 8, 10, 7, 12 e 4. Ogni infermiere lavora un turno di otto ore consecutive, che inizia all'inizio di uno dei sei periodi: il turno che inizia all'inizio del periodo 6 prosegue nel periodo 1 del giorno seguente. Il costo di un infermiere è di 400 euro a turno, tranne che per i turni di notte che iniziano all'inizio dei periodi 1 e 6, che costano 500 euro. L'obiettivo dell'ospedale è determinare quanti infermieri iniziano il turno all'inizio di ciascun periodo, in modo da coprire il fabbisogno di tutti i periodi a costo minimo.

    **Domande**

    1. Scrivere un modello di programmazione lineare (LP) per il problema, misurando i costi in centinaia di euro. Individuare le decisioni da prendere e definire le corrispondenti variabili decisionali. Descrivere la funzione obiettivo e i vincoli del modello. Quale algoritmo si può usare per trovare una soluzione ottima del modello?

    2. Trovare una soluzione ammissibile del modello LP e, di conseguenza, un upper bound sul suo valore ottimo.

    3. Scrivere il modello duale del modello LP. Trovare una soluzione ammissibile del modello duale e, di conseguenza, un lower bound sul valore ottimo del modello LP.

    4. Dimostrare che il piano in cui $4$, $10$, $0$, $8$, $4$ e $0$ infermieri iniziano il turno all'inizio dei periodi $1, 2, \dots, 6$, rispettivamente, è ottimo, trovando con le condizioni degli scarti complementari una soluzione duale ammissibile con lo stesso valore della funzione obiettivo. Qual è il valore ottimo?
