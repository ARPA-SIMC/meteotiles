import { ProductList } from "./model.js";
import { SingleMapView } from "./view.js";
import { TILES_SERVER_URL } from "./settings.js";


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
        this.view.onProductListLoading();
    }

    onProductListLoaded(productList) {
        console.debug("Product list is loaded", productList);
        this.view.onProductListLoaded(productList);
    }

    onProductListFetchError(error) {
        console.error(error);
        this.view.onProductListFetchError(error);
    }

    static async createApp(tilesServerUrl = ".") {
        const productList = new ProductList(tilesServerUrl);
        const view = new SingleMapView();
        return new App(productList, view);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.createApp(TILES_SERVER_URL).then(app => app.init());
});
