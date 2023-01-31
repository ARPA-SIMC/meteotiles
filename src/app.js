import { ProductList } from "./model.js";
import { SingleMapView } from "./view.js";


class App {
    productList;
    view;

    constructor(productList, view) {
        this.productList = productList;
        this.view = view;

        this.productList.bindOnLoading(this.onProductListLoading.bind(this));
        this.productList.bindOnLoaded(this.onProductListLoaded.bind(this));
        this.productList.bindOnFetchError(this.onProductListFetchError.bind(this));
    }

    init() {
        this.productList.fetchProducts();
    }

    onProductListLoading() {
        console.debug("Product list is loading");
    }

    onProductListLoaded() {
        console.debug("Product list is loaded", this.productList);
        this.view.render(this.productList);
    }

    onProductListFetchError(error) {
    }

    static async createApp(configBaseUrl = ".") {
        const configUrl = `${configBaseUrl}/config.json`;
        return fetch(configUrl)
            .then(resp => {
                if (resp.ok)
                    return resp
                else
                    throw Error(resp.statusText)
            })
            .then(resp => resp.json())
            .then(json => {
                const tilesUrl = `${configBaseUrl}/${json.tiles.baseurl}`;
                const productList = new ProductList(tilesUrl);
                const view = new SingleMapView("body");
                return new App(productList, view);
            })
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.createApp("https://simc.arpae.it/meteotiles").then(app => app.init());
});
