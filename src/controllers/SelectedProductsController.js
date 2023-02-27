class SelectedProductController {
    #productList;
    #view;

    constructor(productList, view) {
        this.#productList = productList;
        this.#view = view;
    }

    init() {
        this.#productList.registerOnProductSelected(product => {
            this.#view.renderProductSelected(product);
        });
        this.#view.bindOnProductClicked(product => {
            this.#productList.setSelected(product.id, false);
        });
        this.#view.render();
    }
}

export default SelectedProductController;
