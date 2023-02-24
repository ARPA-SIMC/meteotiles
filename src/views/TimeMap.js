import { USE_GRID_DEBUG } from './../settings.js';

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

class TimeMap {
    #root;
    #map;
    #legendControl;
    #currentTime;
    #layers = {};
    #onLayersLoading = () => {};
    #onLayersLoaded = () => {};

    constructor(element) {
        this.#root = element;
    }

    #createMap() {
        const map = L.map("map", {
            timeDimension: true,
            timeDimensionOptions: {
                times: [new Date(0)],
            },
            center: [42.8, 12.6],
            zoom: 5,
            minZoom: 5,
            maxZoom: 8,
        });

        L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            ext: 'png'
        }).addTo(map);

        this.#legendControl = L.control.legend({
            'position': 'topright'
        }).addTo(map);

        if (USE_GRID_DEBUG) {
            map.addLayer(new L.GridLayer.GridDebug());
        }

        return map;
    }

    render() {
        this.#map = this.#createMap();
    }

    renderLoaded(products) {
        // this.createProductListLayers(productList);
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

    renderTime(currentTime) {
        Object.values(this.#layers).forEach(productLayers => {
            if (this.#currentTime in productLayers.layers) {
                productLayers.layers[this.#currentTime].setOpacity(0);
            }
            if (currentTime in productLayers.layers) {
                productLayers.layers[currentTime].setOpacity(productLayers.product.opacity || 0.6);
            }
        });
        this.#currentTime = currentTime;
    }

    #areLayersLoaded() {
        return Object.values(this.#layers)
            .map(l => Object.values(l.loaded).reduce((acc, curr) => acc && curr, true))
            .reduce((acc, curr) => acc && curr, true);
    }

    renderProductSelected(product) {
        const date = product.reftime.toISOString().split(".")[0];
        const legendUrl = `${product.baseUrl}/${product.modelName}/${date}/${product.name}+legend.png`;
        if (product.selected) {
            this.#onLayersLoading();
            const productLayers = Object.fromEntries(product.forecastSteps.map(step => {
                const time = product.reftime.getTime() + step * 3600 * 1000;
                const hour = new String(step).padStart(3, '0');
                const layer = L.tileLayer(`${product.baseUrl}/${product.modelName}/${date}/${product.name}+${hour}/{z}/{x}/{y}.png`, {
                    minNativeZoom: product.minZoom || this.#map.getMinZoom(),
                    maxNativeZoom: product.maxZoom || this.#map.getMaxZoom(),
                    tms: false,
                    opacity: 0,
                    zIndex: product.zIndex || 1,
                    bounds: convertBoundingBoxToLeafletBounds(product.boundingBox),
                });
                layer.on('loading', () => {
                    if (this.#layers[product.id]) {
                        this.#layers[product.id].loaded[step] = false;
                        this.#onLayersLoading();
                    }
                });
                layer.on('load', () => {
                    if (this.#layers[product.id]) {
                        this.#layers[product.id].loaded[step] = true;
                    }
                    if (this.#areLayersLoaded()) {
                        this.#onLayersLoaded();
                    }
                })
                return [time, layer];
            }));
            this.#layers[product.id] = {
                layers: productLayers,
                product: product,
                loaded: Object.fromEntries(product.forecastSteps.map(step => [step, false])),
            };
            Object.values(productLayers).map(layer => layer.addTo(this.#map));
            if (product.legendOn) {
                this.#legendControl.addLegend(legendUrl, {
                    opacity: product.opacity || 0.6
                });
            }
        } else {
            const productLayers = this.#layers[product.id].layers;
            Object.values(productLayers).forEach(layer => this.#map.removeLayer(layer));
            delete this.#layers[product.id];
            if (product.legendOn) {
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

    bindOnLayersLoading(callback) {
        this.#onLayersLoading = callback;
    }

    bindOnLayersLoaded(callback) {
        this.#onLayersLoaded = callback;
    }

}

export default TimeMap;
