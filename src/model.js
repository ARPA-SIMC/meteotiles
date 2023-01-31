class Product {
    constructor(modelName, name, description, reftime, forecastSteps) {
        this.modelName = modelName;
        this.name = name;
        this.description = description;
        this.reftime = reftime;
        this.forecastSteps = forecastSteps;
    }

    getTimes() {
        return this.forecastSteps.map((step) => {
            return new Date(this.reftime.getTime() + step * 3600 * 1000).getTime();
        });
    }
};

export class ProductList extends EventTarget{
    baseUrl;
    products = [];

    constructor(baseUrl) {
        super();
        this.baseUrl = baseUrl;
        this.products = [];
    }

    fetchProducts() {
        const configUrl = `${this.baseUrl}/config.json`;
        this.dispatchEvent(new CustomEvent("loading"));
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
                                        model.nome,
                                        `${item.recipe.name}_${item.flavour.name}`,
                                        item.recipe.description,
                                        new Date(reftime + "Z"),
                                        Object.keys(reftimeOptions.steps).map(s => parseInt(s)),
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
                this.dispatchEvent(new CustomEvent("loaded"));
            })
            .catch(err => {
                this.dispatchEvent(new CustomEvent("fetchError", {
                    detail: {
                        error: err,
                    }
                }));
            });
    }

    getTimes() {
        return [... new Set(this.products.map((p) => p.getTimes()).flat())];
    }
};
