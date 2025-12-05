import TimeDimension from "./TimeDimension.js";
import ProductList from "./ProductList.js";


class TimeState {
    #timeDimension;
    #productLists = [];

    constructor(productsApiUrl, numberOfProductLists) {
        this.#timeDimension = new TimeDimension();
        this.#productLists = new Array(numberOfProductLists).fill().map(() => new ProductList(productsApiUrl));
        this.#productLists.forEach(productList => {
            productList.registerOnProductSelected((product) => {
                const availableTimes = [...new Set(this.#productLists.map(l => l.getAvailableTimes()).flat())];
                this.#timeDimension.setAvailableTimes(availableTimes);
            });
        });
    }

    getProductLists() {
        return this.#productLists;
    }

    getProductList(index) {
        return this.#productLists[index];
    }

    getTimeDimension() {
        return this.#timeDimension;
    }
}

export default TimeState;
