import { TILES_SERVER_URL } from './settings.js';

import { TimeState } from './models.js';

import { ProductListMenuView } from './views.js';
import { SelectedProductsView } from './views.js';
import { TimePlayerView } from './views.js';
import { TimeMapView } from './views.js';
import { Version } from './views.js';

import { SelectedProductsController } from './controllers.js';
import { ProductListMenuController } from './controllers.js';
import { TimeMapController } from './controllers.js';
import { TimePlayerController } from './controllers.js';

const CONFIG_URL_PARAM_NAME = "configURL";
const CONFIG_STRING_PARAM_NAME = "configString";

const configURL = new URLSearchParams(window.location.search).get(CONFIG_URL_PARAM_NAME);
const configString = new URLSearchParams(window.location.search).get(CONFIG_STRING_PARAM_NAME);
let config = null;
if (configURL != null) {
    let configResp = null;
    try {
        configResp = await fetch(configURL);
    } catch (error) {
        const errorMessage = `Errore durante lo scaricamento della configurazione da ${configURL}: ${error}`;
        alert(errorMessage);
        throw new Error(errorMessage);
    }
    if (!configResp.ok) {
        const errorMessage = `Errore durante lo scaricamento della configurazione da ${configURL}: ${configResp.statusText}`;
        alert(errorMessage);
        throw new Error(errorMessage);
    }
    try {
        config = await configResp.json();
    } catch (error) {
        const errorMessage = `Errore durante lo scaricamento della configurazione da ${configURL}: ${error}`;
        alert(errorMessage);
        throw new Error(errorMessage);
    }
} else if (configString != null) {
    try {
        config = JSON.parse(atob(configString));
    } catch (error) {
        const errorMessage = `Errore durante la lettura della configurazione: ${error}`;
        alert(errorMessage);
        throw new Error(errorMessage);
    }
} else {
    const errorMessage = `Errore: non è stata passata nessun configurazione. Usa il parametro "${CONFIG_URL_PARAM_NAME}" o il parametro "${CONFIG_STRING_PARAM_NAME}" nell'URL`;
    alert(errorMessage);
    throw new Error(errorMessage);
}

// TODO: config validator

const timeState = new TimeState(TILES_SERVER_URL, 1);
const productList = timeState.getProductList(0);
const timeDimension = timeState.getTimeDimension();

const versionView = new Version(document.querySelector("#version"));

const summaryController = new SelectedProductsController(
    productList,
    timeDimension,
    new SelectedProductsView(document.getElementById("selected-products")),
    {
        canDeselect: false,
    },
);

const mapController = new TimeMapController(
    productList,
    timeDimension,
    new TimeMapView(document.getElementById("map"), {
        center: config.map.center,
        zoom: config.map.zoom,
        minZoom: config.map.minZoom,
        maxZoom: config.map.maxZoom,
        zoomControl: false,
        maxBounds: config.map.maxBounds,
        boxZoom: false,
        doubleClickZoom: false,
        dragging: false,
        scrollWheelZoom: false,
    }),
);

const playerController = new TimePlayerController(
    timeDimension,
    new TimePlayerView(document.getElementById("time-player")),
);

mapController.bindOnLoading((percentage) => {
    playerController.setLoading(percentage);
});

mapController.bindOnLoaded(() => {
    playerController.setLoaded();
});

summaryController.init();
mapController.init();
playerController.init();

versionView.render();

productList.registerOnProductsLoadedCallbacks(() => {
    config.products.forEach(item => {
        const product = productList.getProducts().find(p => p.modelName == item.model && p.name == item.name);
        productList.setSelected(product.id, true);
    });
});

document.addEventListener("wheel", event => {
    const direction = event.deltaY;
    if (direction < 0) {
        timeDimension.nextTime();
    } else {
        timeDimension.previousTime();
    }
});

productList.fetchProducts();
