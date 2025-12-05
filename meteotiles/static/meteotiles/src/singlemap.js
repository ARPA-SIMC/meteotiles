import { GRID_DEBUG_PARAM_NAME } from './settings.js';

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

const gridDebug = new URLSearchParams(window.location.search).get(GRID_DEBUG_PARAM_NAME) == "true";
const productsApiUrl = window.METEOTILES_SETTINGS.PRODUCTS_URL

const timeState = new TimeState(productsApiUrl, 1);
const productList = timeState.getProductList(0);
const timeDimension = timeState.getTimeDimension();

const versionView = new Version(document.querySelector("#version"));

const summaryController = new SelectedProductsController(
    productList,
    timeDimension,
    new SelectedProductsView(document.getElementById("selected-products")),
);

const productListMenuController = new ProductListMenuController(
    productList,
    new ProductListMenuView(document.getElementById('product-list-menu')),
);

const mapController = new TimeMapController(
    productList,
    timeDimension,
    new TimeMapView(document.getElementById("map"), {
        gridDebug: gridDebug,
        shapeMenu: true,
    }),
);

const playerController = new TimePlayerController(
    timeDimension,
    new TimePlayerView(document.getElementById("time-player")),
);

const checkAvailableTimesController = new CheckAvailableTimesConsistencyController(
    timeState.getProductLists(),
);

mapController.bindOnLoading((percentage) => {
    playerController.setLoading(percentage);
});

mapController.bindOnLoaded(() => {
    playerController.setLoaded();
});

summaryController.init();
productListMenuController.init();
mapController.init();
playerController.init();
checkAvailableTimesController.init();

versionView.render();

productList.fetchProducts();
