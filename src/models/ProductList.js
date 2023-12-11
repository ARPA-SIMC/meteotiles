import BoundingBox from "./BoundingBox.js"
import Product from "./Product.js";


class ProductList {
    #baseUrl;
    #currentTime = null;
    #products = {};
    #onProductsLoadingCallbacks = [];
    #onProductsLoadedCallbacks = [];
    #onProductsFetchErrorCallbacks = [];
    #onProductSelectedCallbacks = [];

    constructor(baseUrl) {
        this.#baseUrl = baseUrl;
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
        const configUrl = `${this.#baseUrl}/config.json`;
        let id = 0;

        this.#notifyProductsLoading();

        return fetch(configUrl)
            .then(resp => {
                if (resp.ok)
                    return resp;
                else
                    throw Error(resp.statusText);
            })
            .then(resp => resp.json())
            .then(json => {
                const promises = [];
                for (const [modelKey, model] of Object.entries(json.modelli)) {
                    const url = `${this.#baseUrl}/${modelKey}/products.json`;
                    promises.push(fetch(url)
                        .then(resp => {
                            if (resp.ok)
                                return resp;
                            else
                                throw Error(resp.statusText);
                        })
                        .then(resp => resp.json())
                        .then(json => {
                            const products = [];
                            for (const item of json) {
                                for (const [reftime, reftimeOptions] of Object.entries(item.reftimes)) {
                                    const product = new Product(
                                        ++id,
                                        this.#baseUrl,
                                        modelKey,
                                        model.nome,
                                        `${item.recipe.name}_${item.flavour.name}`,
                                        item.recipe.description,
                                        new Date(reftime + "Z"),
                                        // Arkimaps supports only hours ("h") so far, so we can ignore the suffix
                                        Object.keys(reftimeOptions.steps).map(step => parseInt(step.slice(0, -1))),
                                        new BoundingBox(item.flavour.lat_min, item.flavour.lon_min, item.flavour.lat_max, item.flavour.lon_max),
                                        item.flavour.zoom_min,
                                        item.flavour.zoom_max,
                                        item.recipe.info.zIndex,
                                        item.recipe.info.opacity,
                                        reftimeOptions.legend_info != null,
                                    )
                                    products.push(product);
                                }
                            }
                            return products;
                        })
                    );
                }
                return Promise.all(promises);
            })
            .then(productLists => {
                const products = productLists.flat();
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
