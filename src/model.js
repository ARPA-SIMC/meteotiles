class BoundingBox {
    constructor(latMin, lonMin, latMax, lonMax) {
        this.latMin = latMin;
        this.lonMin = lonMin;
        this.latMax = latMax;
        this.lonMax = lonMax;
    }
}

class Product {
    constructor(baseUrl, modelName, modelDescription, name, description, reftime, forecastSteps, boundingBox) {
        this.baseUrl = baseUrl;
        this.modelName = modelName;
        this.modelDescription = modelDescription;
        this.name = name;
        this.description = description;
        this.reftime = reftime;
        this.forecastSteps = forecastSteps;
        this.boundingBox = boundingBox;
    }

    getTimes() {
        return this.forecastSteps.map((step) => {
            return new Date(this.reftime.getTime() + step * 3600 * 1000).getTime();
        });
    }
};

export class ProductList {
    baseUrl;
    products = [];
    onLoaded = (productList) => { console.debug("Loaded", productList) };
    onLoading = () => { console.debug("Loading") };
    onFetchError = (error) => { console.debug("Fetch error", error) };

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.products = [];
    }

    bindOnLoading(callback) {
        this.onLoading = callback;
    }

    bindOnLoaded(callback) {
        this.onLoaded = callback;
    }

    bindOnFetchError(callback) {
        this.onFetchError = callback;
    }

    fetchProducts() {
        const configUrl = `${this.baseUrl}/config.json`;
        this.onLoading();
        fetch(configUrl)
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
                    const url = `${this.baseUrl}/${modelKey}/products.json`;
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
                                        this.baseUrl,
                                        modelKey,
                                        model.nome,
                                        `${item.recipe.name}_${item.flavour.name}`,
                                        item.recipe.description,
                                        new Date(reftime + "Z"),
                                        Object.keys(reftimeOptions.steps).map(s => parseInt(s)),
                                        new BoundingBox(item.flavour.lat_min, item.flavour.lon_min, item.flavour.lat_max, item.flavour.lon_max),
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
                this.products = productLists.flat();
                this.onLoaded(this);
            })
            .catch(err => {
                this.onFetchError(err);
            });
    }

    getTimes() {
        return [... new Set(this.products.map((p) => p.getTimes()).flat())];
    }
};
