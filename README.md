# meteotiles

Prototipo per la visualizzazione di prodotti meteorologici.


## Utilizzo

```
$ PORT=8081
$ python3 -m http.server ${PORT}
$ xdg-open http://localhost:${PORT}
```

Attualmente l'URL del web tile server http://meteotiles.metarpa è hardcoded,
quindi l'interfaccia funziona solo in rete interna.
