L.GridLayer.GridDebug = L.GridLayer.extend({
    createTile: function (coords) {
        const tile = document.createElement('div');
        tile.style.outline = '1px solid black';
        tile.style.fontWeight = 'bold';
        tile.style.fontSize = '14pt';
        tile.innerHTML = [coords.z, coords.x, coords.y].join('/');
        return tile;
    },
});


function convertBoundingBoxToLeafletBounds(boundingBox) {
    return L.latLngBounds(
        L.latLng(boundingBox.latMin, boundingBox.lonMin),
        L.latLng(boundingBox.latMax, boundingBox.lonMax),
    );
}

// From https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_(JavaScript/ActionScript,_etc.)
function lon2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

function geographicCoordsToTileBounds(map, latlng) {
    const zoom = map.getZoom();
    const i = lon2tile(latlng.lng, zoom)
    const j = lat2tile(latlng.lat, zoom)
    const coords = L.point(i, j);
    const tileSize = L.point(256, 256);
    const nwPoint = coords.scaleBy(tileSize);
    const sePoint = nwPoint.add(tileSize);
    const nw = map.unproject(nwPoint, zoom);
    const se = map.unproject(sePoint, zoom);
    const bounds = L.latLngBounds(nw, se);
    return bounds;
}

function extendBoundsToTiles(map, bounds) {
    const boundsSW = geographicCoordsToTileBounds(map, bounds.getSouthWest());
    const boundsNE = geographicCoordsToTileBounds(map, bounds.getNorthEast());
    const newBounds = boundsSW.extend(boundsNE);
    return newBounds;
}

function hideLayer(layer) {
    const container = layer.getContainer();
    if (container) {
        container.style.display = 'none';
    }
}

function showLayer(layer) {
    const container = layer.getContainer();
    if (container) {
        container.style.display = 'block';
    }
}


class TimeMapView {
    #root;
    #map;
    #legendControl;
    #currentTime;
    #layers = {};
    #onLayersLoading = () => {};
    #onLayersLoaded = () => {};
    #options = {
        gridDebug: false,
        shapes: [],
        shapesMenu: false,
    };
    #mapOptions = {
        center: [42.8, 12.6],
        zoom: 5,
        minZoom: 5,
        maxZoom: 8,
        zoomControl: true,
        maxBounds: null,
        fitBounds: null,
        boxZoom: true,
        doubleClickZoom: true,
        dragging: true,
        scrollWheelZoom: true,
    };
    #tilesPaneName = "products";
    #shapesPaneName = "shapes";

    constructor(element, options, mapOptions) {
        this.#root = element;
        this.#root.classList.add("meteotiles-time-map");
        this.#options = {
            ...this.#options,
            ...options,
        };
        this.#mapOptions = {
            ...this.#mapOptions,
            ...mapOptions,
        };
    }

    #createMap() {
        const map = L.map(this.#root, {
            center: this.#mapOptions.center,
            zoom: this.#mapOptions.zoom,
            minZoom: this.#mapOptions.minZoom,
            maxZoom: this.#mapOptions.maxZoom,
            zoomControl: this.#mapOptions.zoomControl,
            maxBounds: this.#mapOptions.maxBounds,
            boxZoom: this.#mapOptions.boxZoom,
            doubleClickZoom: this.#mapOptions.doubleClickZoom,
            dragging: this.#mapOptions.dragging,
            scrollWheelZoom: this.#mapOptions.scrollWheelZoom,
        });
        if (this.#mapOptions.fitBounds) {
            map.fitBounds(this.#mapOptions.fitBounds);
            map.on('resize', () => map.fitBounds(this.#mapOptions.fitBounds));
        }

        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            subdomains: 'abcd',
            ext: 'png'
        }).addTo(map);

        this.#legendControl = L.control.legend({
            'position': 'topright'
        }).addTo(map);

        if (this.#options.gridDebug) {
            map.addLayer(new L.GridLayer.GridDebug());
        }

        const tilesPane = map.createPane(this.#tilesPaneName);
        tilesPane.style.zIndex = 250;

        const shapesPane = map.createPane(this.#shapesPaneName);
        this.#options.shapes.forEach(shape => {
            fetch(shape.url)
                .then(resp => resp.json())
                .then(geojson => {
                    const l = L.geoJSON(geojson.features, {
                        pane: this.#shapesPaneName,
                        style: {
                            color: "black",
                            fillColor: "transparent",
                            weight: 2,
                        },
                    });
                    l.addTo(map);
                });
        });
        shapesPane.style.zIndex = 240;

        if (this.#options.shapesMenu) {
            // TODO: add shp/*
            var shapesMenu = L.control.layers({}, {
            }).addTo(map);
        }

        return map;
    }

    render() {
        this.#map = this.#createMap();
    }

    renderLoaded(products) {
        // this.createProductListLayers(productList);
        if (this.#mapOptions.maxBounds == null) {
            const bounds = products
                .map((p) => convertBoundingBoxToLeafletBounds(p.boundingBox))
                .reduce((acc, cur) => acc.extend(cur));
            // Estendo il bounding box a quello dei tile
            // https://github.com/ARPA-SIMC/meteotiles/issues/47
            // https://github.com/ARPA-SIMC/arkimaps/issues/91
            const tileBounds = extendBoundsToTiles(this.#map, bounds);
            this.setMapBounds(tileBounds, true);
            this.#map.on('zoomend', () => this.setMapBounds(tileBounds, false));
        }
    }

    renderTime(currentTime) {
        Object.values(this.#layers).forEach(productLayers => {
            if (currentTime in productLayers.layers) {
                showLayer(productLayers.layers[currentTime]);
            }
            if (currentTime != this.#currentTime && this.#currentTime in productLayers.layers) {
                hideLayer(productLayers.layers[this.#currentTime]);
            }
        });
        this.#currentTime = currentTime;
    }

    #areLayersLoaded() {
        return Object.values(this.#layers)
            .map(l => Object.values(l.loaded).reduce((acc, curr) => acc && curr, true))
            .reduce((acc, curr) => acc && curr, true);
    }

    #getLoadingPercentage() {
        const loadingStateList = Object.values(this.#layers).map(l => Object.values(l.loaded)).flat();
        const total = loadingStateList.length;
        const loaded = loadingStateList.filter(i => i).length;
        const percentage = Math.floor(100 * loaded / total);
        return percentage;
    }

    renderProductSelected(product) {
        const date = product.reftime.toISOString().split(".")[0];
        if (product.selected) {
            const productLayers = Object.fromEntries(Object.entries(product.forecastUrls).map(([forecastTime, forecastUrl]) => {
                const tileUrl = `${forecastUrl}/{z}/{x}/{y}.png`;
                const layer = L.tileLayer(tileUrl, {
                    minNativeZoom: product.minZoom || this.#map.getMinZoom(),
                    maxNativeZoom: product.maxZoom || this.#map.getMaxZoom(),
                    tms: false,
                    opacity: product.opacity || 0.6,
                    zIndex: this.#map.getPane(this.#tilesPaneName).zIndex + (product.zIndex || 1),
                    bounds: convertBoundingBoxToLeafletBounds(product.boundingBox),
                    pane: this.#tilesPaneName,
                });
                layer.on('loading', () => {
                    this.#onLayersLoading(this.#getLoadingPercentage());
                    if (this.#layers[product.id]) {
                        this.#layers[product.id].loaded[forecastTime] = false;
                    }
                });
                layer.on('load', () => {
                    if (this.#layers[product.id]) {
                        this.#layers[product.id].loaded[forecastTime] = true;
                        this.#onLayersLoading(this.#getLoadingPercentage());
                    }
                    if (this.#areLayersLoaded()) {
                        this.#onLayersLoaded();
                    }
                })
                return [forecastTime, layer];
            }));
            this.#layers[product.id] = {
                layers: productLayers,
                product: product,
                loaded: Object.keys(product.forecastUrls).map(forecastTime => [forecastTime, false]),
            };
            Object.values(productLayers).map(layer => setTimeout(() => {
                layer.addTo(this.#map)
                hideLayer(layer);
            }));
            if (product.legendUrl) {
                this.#legendControl.addLegend(product.legendUrl, {
                    opacity: product.opacity || 0.6
                });
            }
        } else {
            const productLayers = this.#layers[product.id].layers;
            Object.values(productLayers).forEach(layer => this.#map.removeLayer(layer));
            delete this.#layers[product.id];
            if (product.legendUrl) {
                this.#legendControl.removeLegend(legendUrl);
            }
            if (this.#areLayersLoaded()) {
                this.#onLayersLoaded();
            }
        }
    }

    setMapBounds(bounds, fit) {
        const minZoom = this.#map.getBoundsZoom(bounds);
        this.#map.setMinZoom(minZoom);
        this.#map.setMaxBounds(bounds);
        if (fit) {
            this.#map.fitBounds(bounds, { maxZoom: minZoom });
        }
    }

    getLeafletMap() {
        return this.#map;
    }

    bindOnLayersLoading(callback) {
        this.#onLayersLoading = callback;
    }

    bindOnLayersLoaded(callback) {
        this.#onLayersLoaded = callback;
    }
}

export default TimeMapView;
