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
import { CheckAvailableTimesConsistencyController } from './controllers.js';

const configParam = new URLSearchParams(window.location.search).get("config");
const config = JSON.parse(atob(configParam));

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
checkAvailableTimesController.init();

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
