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

const timeState = new TimeState(TILES_SERVER_URL, 2);
const productListA = timeState.getProductList(0);
const productListB = timeState.getProductList(1);
const timeDimension = timeState.getTimeDimension();

const versionView = new Version(document.querySelector(".version-container"));

const summaryControllerA = new SelectedProductsController(
    productListA,
    new SelectedProductsView(document.querySelector(".left-panel .product-list-selection-summary-container")),
);

const productListMenuControllerA = new ProductListMenuController(
    productListA,
    new ProductListMenuView(document.querySelector('.left-panel .map-menu-products')),
);

const summaryControllerB = new SelectedProductsController(
    productListB,
    new SelectedProductsView(document.querySelector(".right-panel .product-list-selection-summary-container")),
);

const productListMenuControllerB = new ProductListMenuController(
    productListB,
    new ProductListMenuView(document.querySelector('.right-panel .map-menu-products')),
);

const mapControllerA = new TimeMapController(
    productListA,
    timeDimension,
    new TimeMapView(document.querySelector(".left-panel .map-container")),
);

const mapControllerB = new TimeMapController(
    productListB,
    timeDimension,
    new TimeMapView(document.querySelector(".right-panel .map-container")),
);

const playerController = new TimePlayerController(
    timeDimension,
    new TimePlayerView(document.querySelector(".time-player-container")),
);

let percentageA = null;
let percentageB = null;

function calculateMeanPercentage() {
    const a = percentageA == null ? 100 : percentageA;
    const b = percentageB == null ? 100 : percentageB;
    const m = Math.floor((a + b) / 2);
    return m;
}

mapControllerA.bindOnLoading((percentage) => {
    percentageA = percentage;
    const meanPercentage = calculateMeanPercentage();
    playerController.setLoading(meanPercentage);
});

mapControllerA.bindOnLoaded(() => {
    if (calculateMeanPercentage() == 100) {
        playerController.setLoaded();
    }
});

mapControllerB.bindOnLoading((percentage) => {
    percentageB = percentage;
    const meanPercentage = calculateMeanPercentage();
    playerController.setLoading(meanPercentage);
});

mapControllerB.bindOnLoaded(() => {
    if (calculateMeanPercentage() == 100) {
        playerController.setLoaded();
    }
});

let previousAvailableTimes = timeDimension.getAvailableTimes();
productListA.registerOnProductSelected(product => {
    // Quando seleziono un nuovo prodotto, devo segnalare il caso in cui non abbia i medesimi
    // istanti di tempo fino ad ora visualizzati
    const availableTimes = timeDimension.getAvailableTimes();
    if (previousAvailableTimes.length == 0 || availableTimes.length == 0 || !product.selected) {
        // Do nothing
    } else if (JSON.stringify(previousAvailableTimes) != JSON.stringify(product.getTimes())) {
        alert("Attenzione: i prodotti scelti hanno istanti di validità diversi e quindi, per alcuni istanti, non saranno visualizzati entrambi i prodotti");
    }
    previousAvailableTimes = availableTimes;
});

productListB.registerOnProductSelected(product => {
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

summaryControllerA.init();
productListMenuControllerA.init();
mapControllerA.init();

summaryControllerB.init();
productListMenuControllerB.init();
mapControllerB.init();

playerController.init();

versionView.render();

productListA.fetchProducts();
productListB.fetchProducts();
