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
    player.renderTime(timeDimension.getCurrentTime(), timeDimension.getAvailableTimes(), timeDimension.isLoopOn());
    map.renderTime(timeDimension.getCurrentTime());
});

timeDimension.registerOnAvailableTimesChanged((availableTimes) => {
    player.renderTime(timeDimension.getCurrentTime(), timeDimension.getAvailableTimes(), timeDimension.isLoopOn());
});

timeDimension.registerOnLoopChanged((loopOn) => {
    player.renderTime(timeDimension.getCurrentTime(), timeDimension.getAvailableTimes(), timeDimension.isLoopOn());
});

productList.registerOnProductsLoadingCallbacks(() => {
    menu.renderLoading();
    player.renderLoading();
});

productList.registerOnProductsLoadedCallbacks(() => {
    menu.renderLoaded();
    menu.renderProductList(productList.getProducts());
    map.renderLoaded(productList.getProducts());
    player.renderTime(timeDimension.getCurrentTime(), timeDimension.getAvailableTimes(), timeDimension.isLoopOn());
    player.renderLoaded();
});

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

let isPlaying = false;
let playerTimer = null;

player.bindOnPlayClicked(() => {
    if (!isPlaying) {
        player.setPlaying();
        timeDimension.nextTime();
        playerTimer = setInterval(() => {
            timeDimension.nextTime();
        }, 1000);
    } else {
        clearInterval(playerTimer);
        player.setPaused();
    }
    isPlaying = !isPlaying;
});

map.bindOnLayerLoading((product) => {
    player.renderLoading();
});

map.bindOnLayerLoaded((product) => {
    player.renderLoaded();
    player.renderTime(timeDimension.getCurrentTime(), timeDimension.getAvailableTimes(), timeDimension.isLoopOn());
});

menu.render();
summary.render();
player.render();
version.render();
productList.fetchProducts();
map.render();
