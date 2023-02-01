export class SingleMapView {
    map;
    timePlayer;
    productListMenu;
    selectedProducts = {};

    constructor() {
        const map = L.map("map").setView([42, 12], 6);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        this.map = map;

        this.timePlayer = new TimePlayer("time-player");

        this.productListMenu = new ProductListMenu("map-menu-products", map);
        this.productListMenu.bindOnProductSelected((product) => {
            const key = `${product.modelName}-${product.name}`;
            this.selectedProducts[key] = product;
            this.updateTimeDimension();
        });
        this.productListMenu.bindOnProductUnselected((product) => {
            const key = `${product.modelName}-${product.name}`;
            delete this.selectedProducts[key];
            this.updateTimeDimension();
        });
    }

    render(productList) {
        console.debug("Rendering", productList);
        this.productListMenu.render(productList);
    }

    updateTimeDimension() {
        const times = [...new Set(Object.values(this.selectedProducts).map(p => p.getTimes()).flat())].sort();
        this.timePlayer.setTimes(times);
    }

};


class ProductListMenu {
    elementId;
    map;
    onProductSelected = (product) => { console.debug("Selected", product) };
    onProductUnselected = (product) => { console.debug("Unselected", product) };

    constructor(elementId, map) {
        this.elementId = elementId;
        this.map = map;
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
            label.innerText = `${product.modelName} - ${product.description}`;
            li.append(checkbox);
            li.append(label);
            checkbox.addEventListener("change", (ev) => {
                if (ev.target.checked) {
                    // TODO: aggiungi prodotto alla mappa
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


// TODO: add root element
class TimePlayer {
    elementId;
    timeDimensionPlayer = null;
    timeDimension = null;

    constructor(elementId) {
        this.elementId = elementId;
        this.initializeDom();
    }

    initializeDom() {
        const root = document.getElementById(this.elementId);
        root.querySelector(".step-backward").addEventListener("click", () => {
            const timerangeElement = root.querySelector(".time-range");
            timerangeElement.stepDown();
            timerangeElement.dispatchEvent(new Event("input"));
        });
       root.querySelector(".step-forward").addEventListener("click", () => {
            const timerangeElement = root.querySelector(".time-range");
            timerangeElement.stepUp();
            timerangeElement.dispatchEvent(new Event("input"));
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
            const timerangeElement = document.querySelector(".time-range");
            if (direction > 0) {
                timerangeElement.stepUp();
            } else {
                timerangeElement.stepDown();
            }
            timerangeElement.dispatchEvent(new Event("input"));
        });
        this.updateDom();
    }

    setTimes(times) {
        this.timeDimension = times.length > 0 ? new L.TimeDimension({times:times}) : null;
        if (this.timeDimension) {
            this.timeDimensionPlayer = new L.TimeDimension.Player({
                buffer: this.timeDimension.getAvailableTimes().length,
                minBufferReady: this.timeDimension.getAvailableTimes().length,
            }, this.timeDimension);
        } else {
            this.timeDimensionPlayer = null;
        }
        this.updateDom();
    }

    updateDom() {
        const root = document.getElementById(this.elementId);
        const timerangeElement = root.querySelector(".time-range");
        const value = parseInt(root.querySelector(".time-range").value);
        const min = 0;
        const max = this.timeDimension ? this.timeDimension.getAvailableTimes().length - 1 : 0;
        if (this.timeDimension) {
            this.timeDimension.setCurrentTimeIndex(value);
        }

        if (min == 0 && min == max) {
            this.disableControls();
        } else {
            this.enableControls();
        }
        root.querySelector(".time-range").min = min;
        root.querySelector(".time-range").max = max;
        root.querySelector(".time-range").step = 1;
        root.querySelector(".step-backward").disabled = value <= min;
        root.querySelector(".step-forward").disabled = value >= max;
        const currentDate = this.timeDimension ? new Date(this.timeDimension.getCurrentTime()) : null;
        console.debug("Current time", currentDate);
        root.querySelector(".datetime-label").textContent = currentDate ? currentDate.toISOString() : "";
    }

    disableControls() {
        const root = document.getElementById(this.elementId);
        root.querySelectorAll(".time-player-controls-buttons button").forEach((el) => el.disabled = true);
    }

    enableControls() {
        const root = document.getElementById(this.elementId);
        root.querySelectorAll(".time-player-controls-buttons button").forEach((el) => el.disabled = false);
    }
}
