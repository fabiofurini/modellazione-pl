# Modelli deterministici

Tre capitoli in cui tutti i dati sono noti: si decide con certezza, e il valore
sta nell'interrogare la soluzione (quanto vale una risorsa in più? dove si rompe
il piano?). Il metodo è sempre lo stesso: si costruisce l'LP, lo si risolve, si
leggono i duali, si muovono i dati e si guarda che cosa resta in piedi.

<div class="grid cards" markdown>

-   :material-factory: **Produzione e scorte**

    ---

    LP multiperiodale con scorte: il solver scopre il pre-build, i duali dicono
    quanto vale un'ora di capacità.

    [:octicons-arrow-right-24: LP](produzione.md)

-   :material-ev-station: **Ricarica di veicoli elettrici**

    ---

    Costo minimo contro peak shaving, prezzi orari dell'energia e duali dei
    fabbisogni.

    [:octicons-arrow-right-24: LP](ricarica-ev.md)

-   :material-bank: **Data Envelopment Analysis**

    ---

    L'efficienza relativa di dodici filiali con un LP per filiale: il duale
    dà peer e target, il confronto CCR/BCC l'inefficienza di scala.

    [:octicons-arrow-right-24: LP](dea.md)

</div>
