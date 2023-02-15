# meteotiles

Prototipo per la visualizzazione di prodotti meteorologici.


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
