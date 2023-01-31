export class SingleMapView {
    map;
    timePlayer;
    productListMenu;
    selectedProducts = {};

    constructor() {
        const map = L.map("map").setView([42, 12], 6);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        this.map = map;
        this.timePlayer = new TimePlayer();

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
    timeDimensionPlayer = null;
    timeDimension = null;

    constructor() {
        this.initializeDom();
    }

    initializeDom() {
        document.querySelector(".step-backward").addEventListener("click", () => {
            const timerangeElement = document.querySelector(".time-range");
            timerangeElement.stepDown();
            timerangeElement.dispatchEvent(new Event("input"));
        });
        document.querySelector(".step-forward").addEventListener("click", () => {
            const timerangeElement = document.querySelector(".time-range");
            timerangeElement.stepUp();
            timerangeElement.dispatchEvent(new Event("input"));
        });
        document.querySelector(".loop").addEventListener("click", () => {
            const loopButton = document.querySelector(".loop");
            if (loopButton.classList.contains("active")) {
                loopButton.classList.remove("active");
                loopButton.classList.add("inactive");
            } else {
                loopButton.classList.remove("inactive");
                loopButton.classList.add("active");
            }
        });
        document.querySelector(".time-range").addEventListener("input", () => {
            this.updateDom();
        });
        document.querySelector(".time-range").addEventListener("wheel", (event) => {
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
        const timerangeElement = document.querySelector(".time-range");
        const value = parseInt(document.querySelector(".time-range").value);
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
        document.querySelector(".time-range").min = min;
        document.querySelector(".time-range").max = max;
        document.querySelector(".time-range").step = 1;
        document.querySelector(".step-backward").disabled = value <= min;
        document.querySelector(".step-forward").disabled = value >= max;
        const currentDate = this.timeDimension ? new Date(this.timeDimension.getCurrentTime()) : null;
        console.debug("Current time", currentDate);
        document.querySelector(".datetime").textContent = currentDate ? currentDate.toISOString() : "";
    }

    disableControls() {
        document.querySelectorAll("#time-player button").forEach((el) => el.disabled = true);
    }

    enableControls() {
        document.querySelectorAll("#time-player button").forEach((el) => el.disabled = false);
    }
}
