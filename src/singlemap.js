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

const timeState = new TimeState(TILES_SERVER_URL, 1);
const productList = timeState.getProductList(0);
const timeDimension = timeState.getTimeDimension();

const versionView = new Version(document.querySelector(".version-container"));

const summaryController = new SelectedProductsController(
    productList,
    new SelectedProductsView(document.getElementById("product-list-selection-summary")),
);

const productListMenuController = new ProductListMenuController(
    productList,
    new ProductListMenuView(document.getElementById('map-menu-products')),
);

const mapController = new TimeMapController(
    productList,
    timeDimension,
    new TimeMapView(document.getElementById("map")),
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

let previousAvailableTimes = timeDimension.getAvailableTimes();
productList.registerOnProductSelected(product => {
    // Quando seleziono un nuovo prodotto, devo segnalare il caso in cui non abbia i medesimi
    // istanti di tempo fino ad ora visualizzati
    const availableTimes = timeDimension.getAvailableTimes();
    if (previousAvailableTimes.length == 0 || availableTimes.length == 0 || !product.selected) {
        // Do nothing
    } else if (JSON.stringify(previousAvailableTimes) != JSON.stringify(product.getTimes())) {
        alert("Attenzione: i prodotti scelti hanno istanti di validità diversi e quindi, per alcuni istanti, non tutti i prodotti saranno visualizzati");
    }
    previousAvailableTimes = availableTimes;
});

summaryController.init();
productListMenuController.init();
mapController.init();
playerController.init();

versionView.render();

productList.fetchProducts();
