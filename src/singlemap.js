import { TILES_SERVER_URL } from './settings.js';
import { TimeState } from './models.js';
import { ProductListMenu } from './views.js';
import { ProductListSelectionSummary } from './views.js';
import { TimePlayer } from './views.js';
import { TimeMap } from './views.js';
import { Version } from './views.js';


const timeState = new TimeState(TILES_SERVER_URL, 1);
const productList = timeState.getProductList(0);
const timeDimension = timeState.getTimeDimension();
const menu = new ProductListMenu(document.getElementById('map-menu-products'));
const summary = new ProductListSelectionSummary(document.getElementById("product-list-selection-summary"));
const player = new TimePlayer(document.getElementById("time-player"));
const map = new TimeMap(document.getElementById("map"));
const version = new Version(document.querySelector(".version-container"));

menu.bindOnProductClicked((product, checked) => {
    productList.setSelected(product.id, checked);
});

summary.bindOnProductClicked((product) => {
    productList.setSelected(product.id, false);
});

productList.registerOnProductSelected((product) => {
    summary.renderProductSelected(product);
    menu.renderProductSelected(product);
    map.renderProductSelected(product);
    map.renderTime(timeDimension.getCurrentTime());
});

timeDimension.registerOnCurrentTimeChanged((currentTime) => {
    map.renderTime(timeDimension.getCurrentTime());
});

productList.registerOnProductsLoadingCallbacks(() => {
    menu.renderLoading();
});

productList.registerOnProductsLoadedCallbacks(() => {
    menu.renderLoaded();
    menu.renderProductList(productList.getProducts());
    map.renderLoaded(productList.getProducts());
});

let isPlayerPlaying = false;
let playerTimer = null;
let isPlayerDisabled = true;
let isPlayerStepForwardEnabled = false;
let isPlayerStepBackwardEnabled = false;
let isPlayerLoading = false;

player.bindOnStepForwardClicked(() => {
    timeDimension.nextTime();
});

player.bindOnStepBackwardClicked(() => {
    timeDimension.previousTime();
});

player.bindOnLoopClicked(() => {
    timeDimension.setLoopOn(!timeDimension.isLoopOn());
});

player.bindOnSelectTimeIndex((value) => {
    const newCurrentTime = timeDimension.getAvailableTimes()[value];
    timeDimension.setCurrentTime(newCurrentTime);
});

function renderTimePlayer() {
    player.renderTime(
        timeDimension.getCurrentTime(),
        timeDimension.getAvailableTimes(),
        isPlayerDisabled,
        isPlayerPlaying,
        isPlayerStepForwardEnabled,
        isPlayerStepBackwardEnabled,
        timeDimension.isLoopOn(),
        isPlayerLoading,
    );
}

function checkTimePlayerTime() {
    const availableTimes = timeDimension.getAvailableTimes();
    const currentTimeIndex = availableTimes.indexOf(timeDimension.getCurrentTime());
    if (availableTimes.length > 0 || currentTimeIndex != -1) {
        isPlayerDisabled = false;
        if (timeDimension.isLoopOn()) {
            isPlayerStepForwardEnabled = true;
            isPlayerStepBackwardEnabled = true;
        } else {
            if (currentTimeIndex == 0) {
                isPlayerStepBackwardEnabled = false;
            } else {
                isPlayerStepBackwardEnabled = true;
            }
            if (currentTimeIndex == availableTimes.length - 1) {
                isPlayerStepForwardEnabled = false;
                isPlayerPlaying = false;
                if (playerTimer) {
                    clearInterval(playerTimer);
                }
            } else {
                isPlayerStepForwardEnabled = true;
            }
        }
    } else {
        isPlayerDisabled = true;
        isPlayerStepForwardEnabled = false;
        isPlayerStepBackwardEnabled = false;
        isPlayerPlaying = false;
        if (playerTimer) {
            clearInterval(playerTimer);
        }
    }
}

timeDimension.registerOnAvailableTimesChanged((availableTimes) => {
    checkTimePlayerTime();
    renderTimePlayer();
});

timeDimension.registerOnCurrentTimeChanged((currentTime) => {
    checkTimePlayerTime();
    renderTimePlayer();
});

timeDimension.registerOnLoopChanged((loopOn) => {
    checkTimePlayerTime();
    renderTimePlayer();
});

productList.registerOnProductsLoadingCallbacks(() => {
    isPlayerLoading = true;
    renderTimePlayer();
});

productList.registerOnProductsLoadedCallbacks(() => {
    isPlayerLoading = false;
    renderTimePlayer();
});

player.bindOnPlayClicked(() => {
    if (!isPlayerPlaying) {
        player.setPlaying();
        timeDimension.nextTime();
        playerTimer = setInterval(() => {
            timeDimension.nextTime();
        }, 1000);
    } else {
        clearInterval(playerTimer);
    }
    isPlayerPlaying = !isPlayerPlaying;
    renderTimePlayer();
});

map.bindOnLayersLoading(() => {
    isPlayerLoading = true;
    renderTimePlayer();
});

map.bindOnLayersLoaded(() => {
    isPlayerLoading = false;
    renderTimePlayer();
});

menu.render();
summary.render();
player.render();
version.render();
productList.fetchProducts();
map.render();
