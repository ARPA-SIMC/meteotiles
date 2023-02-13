# meteotiles

Prototipo per la visualizzazione di prodotti meteorologici.


## Utilizzo

**Attenzione:** l'interfaccia chiede i tile al path `./tiles`.

In ambiente di sviluppo, è possibile usare lo script `development-server.py`, che redireziona
tutte le richieste al path `./tiles/` all'URL passato come argomento.

```bash
PORT=8081
TILES_SERVER_URL=http://tiles-server.test/path/to/tiles
python3 development-server.py --port ${PORT} ${TILES_SERVER_URL}
xdg-open http://localhost:${PORT}
```

Il server `development-server.py` di default risponde con un `HTTP 302` alle
richieste di tiles. È possibile farlo funzionare in modalità proxy con
l'opzione `--action=proxy`.
