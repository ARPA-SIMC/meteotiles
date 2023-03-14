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
        center: [45.5, 12.6],
        zoom: 8,
        minZoom: 8,
        maxZoom: 8,
        zoomControl: false,
        maxBounds: [
            [42, 10],
            [46, 15],
        ],
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
mapController.init();
playerController.init();
checkAvailableTimesController.init();

versionView.render();

productList.registerOnProductsLoadedCallbacks(() => {
    const cosmo_2I_tp1h = productList.getProducts().find(p => p.modelName == "cosmo_2I" && p.name == "tp1h_ita_small_tiles")
    productList.setSelected(cosmo_2I_tp1h.id, true);
});
productList.fetchProducts();
