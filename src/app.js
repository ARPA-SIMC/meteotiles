import { ProductList } from "./model.js";
import { SingleMapView } from "./view.js";
import { TILES_SERVER_URL } from "./settings.js";


class App {
    productList;
    view;

    constructor(productList, view) {
        this.productList = productList;
        this.view = view;
    }

    init() {
        this.view.onProductListLoading();
        this.productList.fetchProducts()
            .then((productList) => this.view.onProductListLoaded(productList))
            .catch((error) => this.view.onProductListFetchError(error));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const productList = new ProductList(TILES_SERVER_URL);
    const view = new SingleMapView();
    const app = new App(productList, view);
    app.init();
});
