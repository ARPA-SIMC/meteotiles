import BoundingBox from "./BoundingBox.js"
import Product from "./Product.js";


class ProductList {
    #productsApiUrl;
    #currentTime = null;
    #products = {};
    #onProductsLoadingCallbacks = [];
    #onProductsLoadedCallbacks = [];
    #onProductsFetchErrorCallbacks = [];
    #onProductSelectedCallbacks = [];

    constructor(productsApiUrl) {
        this.#productsApiUrl = productsApiUrl;
    }

    setProducts(products) {
        this.#notifyProductsLoading();
        this.#products = Object.fromEntries(products.map(product => [product.id, product]));
        this.#notifyProductsLoaded();
    }

    getProducts() {
        return Object.values(this.#products);
    }

    getSelectedProducts() {
        return this.getProducts().filter(product => product.selected);
    }

    async fetchProducts() {
        this.#notifyProductsLoading();
        let id = 0;
        return fetch(this.#productsApiUrl)
            .then(resp => {
                if (resp.ok)
                    return resp;
                else
                    throw Error(resp.statusText);
            })
            .then(resp => resp.json())
            .then(json => {
                const products = []
                for (const model of json.weather_models) {
                    for (const run of model.runs) {
                        for (const product of run.products) {
                            const productModel = new Product(
                                ++id,
                                model.short_name,
                                model.long_name,
                                product.short_name,
                                product.long_name,
                                new Date(run.reftime),
                                product.forecast_urls,
                                new BoundingBox(
                                    product.lat_min,
                                    product.lon_min,
                                    product.lat_max,
                                    product.lon_max,
                                ),
                                product.zoom_min,
                                product.zoom_max,
                                product.zindex,
                                product.opacity,
                                product.legend_url,
                            );
                            products.push(productModel);
                        }
                    }
                }
                this.#products = Object.fromEntries(products.map(p => [p.id, p]));
                this.#notifyProductsLoaded();
                return this;
            })
            .catch(error => {
                this.#notifyProductsFetchError(error);
            });
    }

    setSelected(productId, selected) {
        const product = this.#products[productId];

        if (product == null || product.selected == selected) {
            return;
        }

        product.selected = selected ? true : false;

        // notify that product changed state
        this.#notifyProductSelected(product);
    }

    getAvailableTimes() {
        const times = this.getSelectedProducts().map(product => product.getTimes()).flat();
        return [...new Set(times)].sort((a , b) => a - b);
    }

    registerOnProductSelected(callback) {
        this.#onProductSelectedCallbacks.push(callback);
    }

    #notifyProductSelected(product) {
        this.#onProductSelectedCallbacks.forEach(callback => callback(product));
    }

    registerOnProductsLoadingCallbacks(callback) {
        this.#onProductsLoadingCallbacks.push(callback);
    }

    #notifyProductsLoading() {
        this.#onProductsLoadingCallbacks.forEach(callback => callback());
    }

    registerOnProductsLoadedCallbacks(callback) {
        this.#onProductsLoadedCallbacks.push(callback);
    }

    #notifyProductsLoaded() {
        this.#onProductsLoadedCallbacks.forEach(callback => callback(this));
    }

    registerOnProductsFetchErrorCallbacks(callback) {
        this.#onProductsFetchErrorCallbacks.push(callback);
    }

    #notifyProductsFetchError(error) {
        this.#onProductsFetchErrorCallbacks.forEach(callback => callback(error));
    }
}

export default ProductList;
