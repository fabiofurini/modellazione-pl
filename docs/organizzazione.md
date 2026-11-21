# Organizzazione del laboratorio

<!-- collana-dalla-home -->
## Il laboratorio in breve

**7 capitoli applicativi · 3 capitoli di strumenti · solo modelli LP · un notebook
Colab per capitolo · codice Python/Gurobi riproducibile.** L'elenco completo,
capitolo per capitolo, sta nel [programma](programma.md).

<div class="grid cards" markdown>

-   :material-clipboard-check-outline: **Autovalutazione**

    ---

    *Facsimile d'esame*

    Un facsimile nuovo a ogni avvio: 13 domande, 33 punti, con la soluzione e il link alle dispense.

    [:octicons-arrow-right-24: Mettiti alla prova](autovalutazione.md)

</div>

## Scarica in PDF

- 📘 **[Dispensa completa](pdf/dispensa-modellazione-pl.pdf)** — modelli, esempi svolti, casi di studio, analisi di sensitività
- 📊 **[Slide delle lezioni](materiale.md)** — una per capitolo della dispensa, nella pagina del [materiale](materiale.md)

## Per cominciare

Non serve installare niente: ogni capitolo ha il suo
[notebook che si apre in Colab](notebook.md) e gira nel browser. Chi preferisce
lavorare in locale trova i comandi e le note sulla licenza Gurobi nella stessa
pagina.
<!-- /collana-dalla-home -->

## Percorso essenziale in quattro laboratori

| | Contenuto | Obiettivi di apprendimento |
|---|---|---|
| **Lab 1** | Produzione e scorte | formulare un LP multiperiodale; leggere duali, slack e range; verificare un prezzo ombra per perturbazione |
| **Lab 2** | Data Envelopment Analysis | costruire un LP per ogni unità; leggere la forma di inviluppo (peer e target); distinguere efficienza debole e forte |
| **Lab 3** | Newsvendor *oppure* CVaR | formulare un LP a scenari; leggere il quantile ottimo; misurare il costo della protezione |
| **Lab 4** | Progetto a scelta | ricarica EV, arbitraggio o regressione robusta e quantile; presentazione manageriale |

## Gli errori più comuni

1. Leggere `.X` o `.Pi` senza controllare `m.Status`.
2. Dimenticare `lb=-GRB.INFINITY` sulle variabili libere ($b$ della regressione, $\eta$ del CVaR).
3. Usare un prezzo ombra fuori dal suo intervallo di validità.
4. Sbagliare il segno dei duali nei problemi di minimo.
5. Aggiornare il RHS di un vincolo con costanti a sinistra.
6. Ottimizzare un solo obiettivo quando ce ne sono due (minimax puro).
7. Scegliere i parametri ($\tau$, $\lambda$, il budget) guardando i dati usati per decidere.
8. Riportare sei cifre decimali da stime che ballano alla seconda.

## Riproducibilità

```bash
python3 -m pip install gurobipy matplotlib pandas scipy   # scipy: solo funzioni statistiche
python3 python/esegui_tutti.py       # rigenera dati, risultati e figure
```

Le slide del corso e le soluzioni degli esercizi vengono distribuite a lezione.
