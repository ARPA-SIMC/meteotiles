export class SingleMapView {
    map;
    timePlayer;
    productListMenu;
    selectedProducts = {};

    constructor() {
        const map = L.map("map", {
            timeDimension: true,
            timeDimensionOptions: {
                times: [new Date(0)],
            }
        }).setView([42, 12], 6);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        this.map = map;

        this.timePlayer = new TimePlayer("time-player", map.timeDimension);

        this.productListMenu = new ProductListMenu("map-menu-products");
        this.productListMenu.bindOnProductSelected((product) => {
            const key = `${product.modelName}-${product.name}`;
            const layer = L.timeDimension.layer.tileLayer.arkimapsCached({
                reftime: product.reftime,
                steps: product.forecastSteps,
                baseUrl: product.baseUrl,
                modelName: product.modelName,
                productName: product.name,
                productDescription: product.description,
                legendUrl: `${product.baseUrl}/${product.modelName}/{d}/${product.name}+legend.png`,
                // legendOn: product_cfg.legend_on,
                bounds: L.latLngBounds(
                    L.latLng(product.boundingBox.latMin, product.boundingBox.lonMin),
                    L.latLng(product.boundingBox.latMax, product.boundingBox.lonMax),
                ),
                // opacity: product_cfg.opacita,
                // zIndex: product_cfg.zIndex,
                // minNativeZoom: product_cfg.minZoom,
                // maxNativeZoom: product_cfg.maxZoom,
            });
            this.selectedProducts[key] = {
                product: product,
                layer: layer,
            };
            this.map.addLayer(layer);
            this.updateTimeDimension();
        });

        this.productListMenu.bindOnProductUnselected((product) => {
            const key = `${product.modelName}-${product.name}`;
            this.map.removeLayer(this.selectedProducts[key].layer);
            delete this.selectedProducts[key];
            this.updateTimeDimension();
        });
    }

    render(productList) {
        console.debug("Rendering", productList);
        this.productListMenu.render(productList);
    }

    updateTimeDimension() {
        const times = [...new Set(Object.values(this.selectedProducts).map(p => {
            return p.product.getTimes()
        }).flat()
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
};


class ProductListMenu {
    elementId;
    onProductSelected = (product) => { console.debug("Selected", product) };
    onProductUnselected = (product) => { console.debug("Unselected", product) };

    constructor(elementId) {
        this.elementId = elementId;
    }

    render(productList) {
        const root = document.getElementById(this.elementId);
        const ul = document.createElement("ul");
        productList.products.sort((a, b) => {
            const nameA = `${a.modelName}-${a.name}`;
            const nameB = `${b.modelName}-${b.name}`;
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            } else {
                return 0;
            }
        }).forEach((product) => {
            const li = document.createElement("li");
            const checkbox = document.createElement("input");
            const label = document.createElement("label");
            checkbox.id = `map-menu-products-${product.modelName}-${product.name}`;
            checkbox.type = "checkbox";
            label.htmlFor = checkbox.id;
            label.innerText = `${product.modelDescription} - ${product.description}`;
            li.append(checkbox);
            li.append(label);
            checkbox.addEventListener("change", (ev) => {
                if (ev.target.checked) {
                    this.onProductSelected(product);
                } else {
                    this.onProductUnselected(product);
                }
            });
            ul.append(li);
        });
        root.append(ul);
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
        root.querySelector(".step-backward").addEventListener("click", () => {
            const timerangeElement = root.querySelector(".time-range");
            this.timeDimension.nextTime(-1);
        });
       root.querySelector(".step-forward").addEventListener("click", () => {
            const timerangeElement = root.querySelector(".time-range");
            this.timeDimension.nextTime(1);
            // timerangeElement.stepUp();
            // timerangeElement.dispatchEvent(new Event("input"));
        });
        root.querySelector(".loop").addEventListener("click", () => {
            const loopButton = root.querySelector(".loop");
            if (loopButton.classList.contains("active")) {
                loopButton.classList.remove("active");
                loopButton.classList.add("inactive");
            } else {
                loopButton.classList.remove("inactive");
                loopButton.classList.add("active");
            }
        });
        root.querySelector(".time-range").addEventListener("input", () => {
            this.updateDom();
        });
        root.querySelector(".time-player-controls").addEventListener("wheel", (event) => {
            const direction = event.deltaY;
            const timerangeElement = root.querySelector(".time-range");
            if (direction < 0) {
                this.timeDimension.nextTime(1);
            } else {
                this.timeDimension.nextTime(-1);
            }
            timerangeElement.dispatchEvent(new Event("input"));
        }, {
            passive: true,
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

    updateTimeDimensionPlayer() {
        this.timeDimensionPlayer = new L.TimeDimension.Player({
            buffer: this.timeDimension.getAvailableTimes().length,
            minBufferReady: this.timeDimension.getAvailableTimes().length,
        }, this.timeDimension);
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
