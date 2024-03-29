import { MAX_PRODUCTS_SELECTED } from '../settings.js';

class ProductListMenuController {
    #productList;
    #view;

    constructor(productList, view) {
        this.#productList = productList;
        this.#view = view;
    }

    init() {
        this.#view.bindOnProductClicked((product, checked) => {
            this.#productList.setSelected(product.id, checked);
        });
        this.#productList.registerOnProductSelected(product => {
            this.#view.renderProductSelected(product);
            this.#view.renderEnableProductSelection(this.#productList.getSelectedProducts().length < MAX_PRODUCTS_SELECTED);
        });
        this.#productList.registerOnProductsLoadingCallbacks(() => {
            this.#view.renderLoading();
        });
        this.#productList.registerOnProductsLoadedCallbacks(() => {
            this.#view.renderLoaded();
            this.#view.renderProductList(this.#productList.getProducts());
        });
        this.#view.render();
    }
}

export default ProductListMenuController;
