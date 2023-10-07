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

import { MapTotalLoadingPercentageHandler } from './utils.js';


const timeState = new TimeState(TILES_SERVER_URL, 2);
const productListA = timeState.getProductList(0);
const productListB = timeState.getProductList(1);
const timeDimension = timeState.getTimeDimension();

const versionView = new Version(document.querySelector("#version"));

const summaryControllerA = new SelectedProductsController(
    productListA,
    timeDimension,
    new SelectedProductsView(document.querySelector("#selected-products-left")),
);

const productListMenuControllerA = new ProductListMenuController(
    productListA,
    new ProductListMenuView(document.querySelector('#product-list-menu-left')),
);

const summaryControllerB = new SelectedProductsController(
    productListB,
    timeDimension,
    new SelectedProductsView(document.querySelector("#selected-products-right")),
);

const productListMenuControllerB = new ProductListMenuController(
    productListB,
    new ProductListMenuView(document.querySelector('#product-list-menu-right')),
);

const mapControllerA = new TimeMapController(
    productListA,
    timeDimension,
    new TimeMapView(document.querySelector("#map-left")),
);

const mapControllerB = new TimeMapController(
    productListB,
    timeDimension,
    new TimeMapView(document.querySelector("#map-right")),
);

const playerController = new TimePlayerController(
    timeDimension,
    new TimePlayerView(document.querySelector("#time-player")),
);

const totalLoadingPercentageHandler = new MapTotalLoadingPercentageHandler(
    playerController,
    [mapControllerA, mapControllerB],
);

const checkAvailableTimesController = new CheckAvailableTimesConsistencyController(
    timeState.getProductLists(),
);

summaryControllerA.init();
productListMenuControllerA.init();
mapControllerA.init();

summaryControllerB.init();
productListMenuControllerB.init();
mapControllerB.init();

checkAvailableTimesController.init();
playerController.init();

totalLoadingPercentageHandler.init();

versionView.render();

productListA.fetchProducts();
productListB.fetchProducts();

mapControllerA.getLeafletMap().sync(mapControllerB.getLeafletMap());
mapControllerB.getLeafletMap().sync(mapControllerA.getLeafletMap());
