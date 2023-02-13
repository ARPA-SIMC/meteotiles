import { VERSION, MAX_PRODUCTS_SELECTED } from "./settings.js";
import { convertBoundingBoxToLeafletBounds } from "./utils.js";


export class SingleMapView {
    map;
    timePlayer;
    productListMenu;
    productListSelection = {};
    legendControl;

    constructor() {
        this.map = this.createMap();
        this.legendControl = L.control.legend({
            position: 'topright'
        }).addTo(this.map);
        this.timePlayer = new TimePlayer("time-player", this.map.timeDimension);
        this.productListMenu = new ProductListMenu("map-menu-products");
        this.productListSelectionMenu = new ProductListSelectionSummary("product-list-selection-summary");
        this.productListSelectionMenu.bindOnProductClicked((product) => {
            this.productListMenu.unselectProduct(product);
        });
        this.productListMenu.bindOnProductSelected((product) => this.onProductSelected(product));
        this.productListMenu.bindOnProductUnselected((product) => this.onProductUnselected(product));
        document.querySelector(".version").innerText = `meteotiles version ${VERSION} (prototype)`;
    }

    onProductSelected(product) {
        const key = `${product.modelName}-${product.name}`;
        const item = this.productListSelection[key];
        const layer = item.layer;
        item.selected = true;
        this.map.addLayer(layer);
        this.updateTimeDimension();
        if (layer.hasLegend) {
            this.legendControl.addLegend(layer.legendUrl, {
                opacity: layer.options.opacity,
            });
        }
        this.productListSelectionMenu.onProductSelected(product);
    }

    onProductUnselected(product) {
        const key = `${product.modelName}-${product.name}`;
        const item = this.productListSelection[key];
        const layer = item.layer;
        item.selected = false;
        this.map.removeLayer(layer);
        this.updateTimeDimension();
        this.legendControl.removeLegend(layer.legendUrl);
        this.productListSelectionMenu.onProductUnselected(product);

    }

    createMap() {
        const map = L.map("map", {
            timeDimension: true,
            timeDimensionOptions: {
                times: [new Date(0)],
            },
            center: [42.8, 12.6],
            zoom: 6,
            minZoom: 6,
            maxZoom: 8,
        });

        L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            ext: 'png'
        }).addTo(map);

        return map;
    }

    updateTimeDimension() {
        const times = [...new Set(
            Object.values(this.productListSelection)
            .filter(p => p.selected)
            .map(p => p.product.getTimes()).flat()
        )].sort();
        if (times.length == 0) {
            this.map.timeDimension.setAvailableTimes([0], "replace");
        } else {
            const currentTime = this.map.timeDimension.getCurrentTime();
            let currentTimeIndex = times.findIndex((el) => el == currentTime);
            if (currentTimeIndex < 0)
                currentTimeIndex = 0;
            this.map.timeDimension.setAvailableTimes(times, "replace");
            this.map.timeDimension.setCurrentTimeIndex(currentTimeIndex);
        }
    }

    createProductListLayers(productList) {
        this.productListSelection = Object.fromEntries(
            productList.products.map((product) => {
                const key = `${product.modelName}-${product.name}`;
                const layer = L.timeDimension.layer.tileLayer.arkimapsCached({
                    reftime: product.reftime,
                    steps: product.forecastSteps,
                    baseUrl: product.baseUrl,
                    modelName: product.modelName,
                    productName: product.name,
                    productDescription: product.description,
                    legendUrl: `${product.baseUrl}/${product.modelName}/{d}/${product.name}+legend.png`,
                    legendOn: product.legendOn,
                    bounds: convertBoundingBoxToLeafletBounds(product.boundingBox),
                    opacity: product.opacity,
                    zIndex: product.zIndex,
                    minNativeZoom: product.minZoom,
                    maxNativeZoom: product.maxZoom,
                });
                return [key, {
                    product: product,
                    layer: layer,
                    selected: false,
                }];
            })
        );
    }

    onProductListLoading() {
        this.productListMenu.onProductListLoading();
    }

    onProductListLoaded(productList) {
        this.createProductListLayers(productList);
        this.productListMenu.onProductListLoaded(productList);
        const bounds = productList.products
            .map((p) => convertBoundingBoxToLeafletBounds(p.boundingBox))
            .reduce((acc, cur) => acc.extend(cur));
        // TODO: decremento di 1 lo zoom minimo necessario per
        // visualizzare i prodotti perché c'è qualche problema sui
        // bounding box dei prodotti, si veda
        // https://github.com/ARPA-SIMC/meteotiles/issues/47
        const minZoom = this.map.getBoundsZoom(bounds) - 1;
        this.map.setMinZoom(minZoom);
        this.map.fitBounds(bounds, { maxZoom: minZoom });
        this.map.setMaxBounds(bounds);
    }

    onProductListFetchError(error) {
        alert("Error while fetching the product list: " + error);
    }
};


class ProductListSelectionSummary {
    elementId;
    onProductClicked = (product) => { console.debug("Unselected", product) };

    constructor(elementId) {
        this.elementId = elementId;
    }

    getProductElementId(product) {
        return "badge-" + product.modelName + "-" + product.reftime.getTime() + "-" + product.name;
    }

    getProductElementText(product) {
        return product.modelDescription + " - " + product.reftime.toISOString().slice(0, 16).replace("T", " ") + " - " + product.description;
    }

    onProductSelected(product) {
        const root = document.getElementById(this.elementId);
        const badge = document.createElement("span");
        const productId = this.getProductElementId(product);

        badge.classList.add("product-selection-badge");
        badge.id = productId;
        badge.innerText = this.getProductElementText(product);
        root.append(badge);
        badge.addEventListener("click", () => {
            this.onProductClicked(product);
        });
    }

    onProductUnselected(product) {
        const productId = this.getProductElementId(product);
        const badge = document.getElementById(productId);
        badge.remove();
    }

    bindOnProductClicked(callback) {
        this.onProductClicked = callback;
    }
}


class ProductListMenu {
    elementId;
    onProductSelected = (product) => { console.debug("Selected", product) };
    onProductUnselected = (product) => { console.debug("Unselected", product) };
    selectedProductsCount = 0;

    constructor(elementId) {
        this.elementId = elementId;
    }

    getProductCheckboxElementId(product) {
        return `map-menu-products-${product.modelName}-${product.name}`;
    }

    unselectProduct(product) {
        this.selectedProductsCount -= 1;
        if (this.selectedProductsCount < MAX_PRODUCTS_SELECTED) {
            this.enableProductSelection();
        }

        const productId = this.getProductCheckboxElementId(product);
        const checkbox = document.getElementById(productId);
        if (checkbox.checked) {
            checkbox.checked = false;
        }
        this.onProductUnselected(product);
    }

    selectProduct(product) {
        this.selectedProductsCount += 1;
        if (this.selectedProductsCount >= MAX_PRODUCTS_SELECTED) {
            this.disableProductSelection();
        }

        const productId = this.getProductCheckboxElementId(product);
        const checkbox = document.getElementById(productId);
        if (!checkbox.checked) {
            checkbox.checked = true;
        }
        this.onProductSelected(product);
    }

    enableProductSelection() {
        const root = document.getElementById(this.elementId);
        root.querySelectorAll("input").forEach((el) => el.disabled = false);
    }

    disableProductSelection() {
        const root = document.getElementById(this.elementId);
        root.querySelectorAll("input").forEach((el) => {
            if (!el.checked) {
                el.disabled = true
            }
        });
    }

    createProductListDom(productList) {
        const root = document.getElementById(this.elementId);
        const groupedProductList = {};
        productList.products.forEach((product) => {
            const modelName = product.modelDescription;
            const reftime = product.reftime.toISOString().slice(0, 16).replace("T", " ");
            const title = `${modelName} - ${reftime}`;
            if (!(title in groupedProductList)) {
                groupedProductList[title] = [];
            }
            groupedProductList[title].push(product);
        });
        Object.keys(groupedProductList).sort().forEach((title) => {
            const products = groupedProductList[title].sort((a, b) => {
                if (a.description > b.description) {
                    return 1
                }
                if (a.description < b.description) {
                    return -1;
                }
                return 0;
            });
            const titleElement = document.createElement("h3");
            titleElement.innerText = title;
            root.append(titleElement);
            const ul = document.createElement("ul");
            products.forEach((product) => {
                const li = document.createElement("li");
                const checkbox = document.createElement("input");
                const label = document.createElement("label");
                checkbox.id = this.getProductCheckboxElementId(product);
                checkbox.type = "checkbox";
                label.htmlFor = checkbox.id;
                label.innerText = `${product.modelDescription} - ${product.description}`;
                li.append(checkbox);
                li.append(label);
                checkbox.addEventListener("change", (ev) => {
                    if (ev.target.checked) {
                        this.selectProduct(product);
                    } else {
                        this.unselectProduct(product);
                    }
                });
                ul.append(li);
            });
            root.append(ul);
        });
        root.querySelector(".map-menu-search input").addEventListener("input", (ev) => {
            this.filterProductList();
        });

        this.filterProductList();
    }

    filterProductList() {
        const root = document.getElementById(this.elementId);
        const searchText = root.querySelector(".map-menu-search input").value;
        root.querySelectorAll("ul li label").forEach(label => {
            const description = label.innerText;
            if (description.toLowerCase().includes(searchText.toLowerCase())) {
                label.parentElement.classList.remove("hide");
            } else {
                label.parentElement.classList.add("hide");
            }
        });
    }

    onProductListLoading() {
        const root = document.getElementById(this.elementId);
        root.querySelector(".loader").classList.add("loading");
    }

    onProductListLoaded(productList) {
        const root = document.getElementById(this.elementId);
        this.createProductListDom(productList);
        root.querySelector(".loader").classList.remove("loading");
    }

    bindOnProductSelected(callback) {
        this.onProductSelected = callback;
    }

    bindOnProductUnselected(callback) {
        this.onProductUnselected = callback;
    }
};


class TimePlayer {
    elementId;
    timeDimensionPlayer = null;
    timeDimension = null;

    constructor(elementId, timeDimension) {
        this.elementId = elementId;
        this.timeDimension = timeDimension;
        this.updateTimeDimensionPlayer();
        this.initializeDom();
    }

    initializeDom() {
        const root = document.getElementById(this.elementId);
        root.querySelector(".play-forward").addEventListener("click", () => {
            const playForwardElement = root.querySelector(".play-forward");
            if (playForwardElement.classList.contains("playing")) {
                this.timeDimensionPlayer.stop();
                // Recreate timeDimensionPlayer when stopped, because
                // otherwise it starts when a new layer is loaded.
                this.updateTimeDimensionPlayer();
            } else {
                this.timeDimensionPlayer.start();
            }
            playForwardElement.classList.toggle("playing");
        });
        root.querySelector(".step-backward").addEventListener("click", () => {
            this.previousTimeDimensionStep();
        });
        root.querySelector(".step-forward").addEventListener("click", () => {
            this.nextTimeDimensionStep();
        });
        root.querySelector(".loop").addEventListener("click", () => {
            this.toggleLoop();
            this.timeDimensionPlayer.setLooped(this.isLoopActivated());
        });
        root.querySelector(".time-player-controls").addEventListener("wheel", (event) => {
            const direction = event.deltaY;
            const timerangeElement = root.querySelector(".time-range");
            if (direction < 0) {
                this.nextTimeDimensionStep();
            } else {
                this.previousTimeDimensionStep();
            }
        }, {
            passive: true,
        });
        root.querySelector(".time-range").addEventListener("change", (event) => {
            const timerangeElement = root.querySelector(".time-range");
            const value = timerangeElement.value;
            this.timeDimension.setCurrentTimeIndex(value);
        });
        this.timeDimension.on("availabletimeschanged", (ev) => {
            this.updateTimeDimensionPlayer(),
            this.updateDom();
        });
        this.timeDimension.on("timeloading", (ev) => {
            if (ev.time == this.timeDimension.getCurrentTime()) {
                this.disableControls();
                root.querySelector(".time-player-controls .loader").classList.add("loading");
            }
        });
        this.timeDimension.on("timeload", (ev) => {
            root.querySelector(".time-player-controls .loader").classList.remove("loading");
            this.updateDom();
        });
        this.updateDom();
    }

    isLoopActivated() {
        const root = document.getElementById(this.elementId);
        const loopButton = root.querySelector(".loop");
        return loopButton.classList.contains("active");
    }

    toggleLoop() {
        const root = document.getElementById(this.elementId);
        const loopButton = root.querySelector(".loop");
        loopButton.classList.toggle("active");
    }

    nextTimeDimensionStep() {
        this.timeDimension.nextTime(1);
    }

    previousTimeDimensionStep() {
        this.timeDimension.nextTime(-1);
    }

    updateTimeDimensionPlayer() {
        this.timeDimensionPlayer = new L.TimeDimension.Player({
            buffer: this.timeDimension.getAvailableTimes().length,
            minBufferReady: this.timeDimension.getAvailableTimes().length,
            loop: this.isLoopActivated(),
        }, this.timeDimension);
        this.timeDimensionPlayer.on("animationfinished", () => {
            const root = document.getElementById(this.elementId);
            const playForwardElement = root.querySelector(".play-forward");
            playForwardElement.classList.remove("playing");
        });
    }

    updateDom() {
        const root = document.getElementById(this.elementId);
        const min = 0;
        const max = this.timeDimension.getAvailableTimes().length - 1;
        const value = this.timeDimension.getCurrentTimeIndex();

        if (min == 0 && min == max) {
            this.disableControls();
        } else {
            this.enableControls();
        }

        const timerangeElement = root.querySelector(".time-range");
        timerangeElement.min = min;
        timerangeElement.max = max;
        timerangeElement.step = 1;
        timerangeElement.value = this.timeDimension.getCurrentTimeIndex();

        const stepBackwardElement = root.querySelector(".step-backward")
        stepBackwardElement.disabled = value <= min;

        const stepForwardElement = root.querySelector(".step-forward");
        stepForwardElement.disabled = value >= max;

        const currentTime = this.timeDimension.getCurrentTime();
        if (this.timeDimension.getAvailableTimes().length > 1 || currentTime > 0) {
            const currentDate = new Date(this.timeDimension.getCurrentTime());
            root.querySelector(".datetime-label").textContent = currentDate.toISOString();
        } else {
            root.querySelector(".datetime-label").textContent = "";
        }
    }

    disableControls() {
        const root = document.getElementById(this.elementId);
        root.querySelectorAll(".time-player-controls-buttons button").forEach((el) => el.disabled = true);
        root.querySelector(".time-player-controls .time-range").disabled = true;
    }

    enableControls() {
        const root = document.getElementById(this.elementId);
        root.querySelectorAll(".time-player-controls-buttons button").forEach((el) => el.disabled = false);
        root.querySelector(".time-player-controls .time-range").disabled = false;
    }
}
