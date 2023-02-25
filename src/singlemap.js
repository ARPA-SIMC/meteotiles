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

mapController.bindOnLoading(() => {
    playerController.setLoading();
});

mapController.bindOnLoaded(() => {
    playerController.setLoaded();
});

summaryController.init();
productListMenuController.init();
mapController.init();
playerController.init();

versionView.render();

productList.fetchProducts();
