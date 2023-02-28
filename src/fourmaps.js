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


const timeState = new TimeState(TILES_SERVER_URL, 4);
const productListA = timeState.getProductList(0);
const productListB = timeState.getProductList(1);
const productListC = timeState.getProductList(2);
const productListD = timeState.getProductList(3);
const timeDimension = timeState.getTimeDimension();

const versionView = new Version(document.querySelector(".version-container"));

const summaryControllerA = new SelectedProductsController(
    productListA,
    timeDimension,
    new SelectedProductsView(document.querySelector(".top-left-panel .product-list-selection-summary-container")),
);

const productListMenuControllerA = new ProductListMenuController(
    productListA,
    new ProductListMenuView(document.querySelector('.top-left-panel .map-menu-products')),
);

const mapControllerA = new TimeMapController(
    productListA,
    timeDimension,
    new TimeMapView(document.querySelector(".top-left-panel .map-container")),
);

const summaryControllerB = new SelectedProductsController(
    productListB,
    timeDimension,
    new SelectedProductsView(document.querySelector(".top-right-panel .product-list-selection-summary-container")),
);

const productListMenuControllerB = new ProductListMenuController(
    productListB,
    new ProductListMenuView(document.querySelector('.top-right-panel .map-menu-products')),
);

const mapControllerB = new TimeMapController(
    productListB,
    timeDimension,
    new TimeMapView(document.querySelector(".top-right-panel .map-container")),
);

const summaryControllerC = new SelectedProductsController(
    productListC,
    timeDimension,
    new SelectedProductsView(document.querySelector(".bottom-left-panel .product-list-selection-summary-container")),
);

const productListMenuControllerC = new ProductListMenuController(
    productListC,
    new ProductListMenuView(document.querySelector('.bottom-left-panel .map-menu-products')),
);

const mapControllerC = new TimeMapController(
    productListC,
    timeDimension,
    new TimeMapView(document.querySelector(".bottom-left-panel .map-container")),
);

const summaryControllerD = new SelectedProductsController(
    productListD,
    timeDimension,
    new SelectedProductsView(document.querySelector(".bottom-right-panel .product-list-selection-summary-container")),
);

const productListMenuControllerD = new ProductListMenuController(
    productListD,
    new ProductListMenuView(document.querySelector('.bottom-right-panel .map-menu-products')),
);

const mapControllerD = new TimeMapController(
    productListD,
    timeDimension,
    new TimeMapView(document.querySelector(".bottom-right-panel .map-container")),
);

const playerController = new TimePlayerController(
    timeDimension,
    new TimePlayerView(document.querySelector(".time-player-container")),
);

let percentageA = null;
let percentageB = null;
let percentageC = null;
let percentageD = null;

function calculateMeanPercentage() {
    const a = percentageA == null ? 100 : percentageA;
    const b = percentageB == null ? 100 : percentageB;
    const c = percentageC == null ? 100 : percentageC;
    const d = percentageD == null ? 100 : percentageD;
    const m = Math.floor((a + b + c + d) / 4);
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

mapControllerC.bindOnLoading((percentage) => {
    percentageC = percentage;
    const meanPercentage = calculateMeanPercentage();
    playerController.setLoading(meanPercentage);
});

mapControllerC.bindOnLoaded(() => {
    if (calculateMeanPercentage() == 100) {
        playerController.setLoaded();
    }
});

mapControllerD.bindOnLoading((percentage) => {
    percentageD = percentage;
    const meanPercentage = calculateMeanPercentage();
    playerController.setLoading(meanPercentage);
});

mapControllerD.bindOnLoaded(() => {
    if (calculateMeanPercentage() == 100) {
        playerController.setLoaded();
    }
});

const checkAvailableTimesController = new CheckAvailableTimesConsistencyController(
    timeState.getProductLists(),
    timeDimension,
);

summaryControllerA.init();
productListMenuControllerA.init();
mapControllerA.init();

summaryControllerB.init();
productListMenuControllerB.init();
mapControllerB.init();

summaryControllerC.init();
productListMenuControllerC.init();
mapControllerC.init();

summaryControllerD.init();
productListMenuControllerD.init();
mapControllerD.init();

checkAvailableTimesController.init();
playerController.init();

versionView.render();

productListA.fetchProducts();
productListB.fetchProducts();
productListC.fetchProducts();
productListD.fetchProducts();

mapControllerA.getLeafletMap().sync(mapControllerB.getLeafletMap());
mapControllerA.getLeafletMap().sync(mapControllerC.getLeafletMap());
mapControllerA.getLeafletMap().sync(mapControllerD.getLeafletMap());

/*
mapControllerB.getLeafletMap().sync(mapControllerA.getLeafletMap());
mapControllerB.getLeafletMap().sync(mapControllerC.getLeafletMap());
mapControllerB.getLeafletMap().sync(mapControllerD.getLeafletMap());

mapControllerC.getLeafletMap().sync(mapControllerA.getLeafletMap());
mapControllerC.getLeafletMap().sync(mapControllerB.getLeafletMap());
mapControllerC.getLeafletMap().sync(mapControllerD.getLeafletMap());

mapControllerD.getLeafletMap().sync(mapControllerA.getLeafletMap());
mapControllerD.getLeafletMap().sync(mapControllerB.getLeafletMap());
mapControllerD.getLeafletMap().sync(mapControllerC.getLeafletMap());
*/
