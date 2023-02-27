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

let percentageA = 0;
let percentageB = 0;

mapControllerA.bindOnLoading((percentage) => {
    percentageA = percentage;
    const meanPercentage = Math.floor((percentageA + percentageB)/2);
    console.log(percentageA, percentageB, meanPercentage);
    playerController.setLoading(meanPercentage);
});

mapControllerA.bindOnLoaded(() => {
    if (percentageA == 100 && percentageB == 100) {
        playerController.setLoaded();
    }
});

mapControllerB.bindOnLoading((percentage) => {
    percentageB = percentage;
    const meanPercentage = Math.floor((percentageA + percentageB)/2);
    console.log(percentageA, percentageB, meanPercentage);
    playerController.setLoading(meanPercentage);
});

mapControllerB.bindOnLoaded(() => {
    if (percentageA == 100 && percentageB == 100) {
        playerController.setLoaded();
    }
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
