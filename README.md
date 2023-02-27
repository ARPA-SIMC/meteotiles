# meteotiles

Prototipo per la visualizzazione di prodotti meteorologici.

![screenshot](https://user-images.githubusercontent.com/13255425/219043356-2dd789d3-005f-4718-a779-904523b29f61.png)

*screenshot dell'interfaccia con tile prodotti da [arkimaps](https://github.com/ARPA-SIMC/arkimaps)*

## Utilizzo

**Attenzione:** l'interfaccia chiede i tile al path `./tiles`.

In ambiente di sviluppo, è possibile usare lo script `development-server.py`,
che redireziona tutte le richieste al path `./tiles/` all'URL passato come argomento.

```bash
PORT=8081
TILES_SERVER_URL=http://tiles-server.test/path/to/tiles
python3 development-server.py --port ${PORT} ${TILES_SERVER_URL}
xdg-open http://localhost:${PORT}
```

Il server `development-server.py` di default risponde con un `HTTP 302` alle
richieste di tiles. È possibile farlo funzionare in modalità proxy con
l'opzione `--action=proxy`: in questo caso, l'header
`Access-Control-Allow-Origin` viene impostato a `*` per tutte le richieste al
tile server.

Le impostazioni sono definite nel file `src/settings.js`:

* `TILES_SERVER_URL`: URL del web tiles server (default: `./tiles`).
* `MAX_PRODUCTS_SELECTED`: numero massimo di prodotti selezionabili contemporaneamente (default: 4).
* `USE_GRID_DEBUG`: booleano che permette di abilitare la visualizzazione della griglia (default: `false`).

## Descrizione

Il prototipo offre due diverse applicazioni:

- Interfaccia con singola mappa
- Interfaccia con doppia mappa

L'interfaccia con singola mappa deve fornire le seguenti funzionalità:

- Un elenco dei prodotti meteo disponibili, raggruppati per modello e istante di
  validità. Questo elenco deve essere filtrabile mediante ricerca testuale e
  deve permettere all'utente di selezionare i prodotti desiderati. Gli elementi
  selezionati devono essere di facile visualizzazione/deselezione. Non è possibile
  selezionare più di quattro prodotti. Inoltre, nel caso in cui vengano selezionati
  prodotti i cui istanti di validità non coincidono esattamente, si deve avvisare
  l'utente con un messaggio opportuno e attendere la conferma della presa visione
  dell'avviso stesso.
- Un menu (player) per la gestione degli istanti di validità dei prodotti selezionati. L'utente
  deve visualizzare gli estremi temporali e l'istante attuale; deve inoltre poter
  selezionare l'istante di interesse, attraverso selezione diretta, andando
  avanti/indietro sulla finestra temporale e animazione automatica. L'elenco degli istanti
  di validità è dato dall'unione degli istanti di validità dei prodotti selezionati.
  Il player non deve permettere azioni mentre le mappe dei prodotti selezionati sono
  in fase di buffering e deve visualizzare la percentuale di completamento del buffer.
- Una mappa dinamica (zoom/panning) che mostra il rendering dei prodotti selezionati
  dall'utente per l'istante temporale selezionato dall'utente.


Nel caso dell'interfaccia con doppia mappa il funzionamento è il medesimo, con
l'unica differenza che quest'ultima ha due mappe e due menu di selezione dei
prodotti. Ogni mappa deve renderizzare i prodotti selezionati nei rispettivi
menu. Inoltre, le due mappe devono essere sincronizzate tra di loro sia nel
tempo (quindi il cambio dell'istante selezionato si ripercuote su entrambe le
mappe) che nello spazio (ogni mappa deve visualizzare la medesima area
geografica).
