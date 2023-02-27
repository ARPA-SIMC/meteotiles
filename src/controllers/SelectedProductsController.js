class SelectedProductController {
    #productList;
    #timeDimension;
    #view;

    constructor(productList, timeDimension, view) {
        this.#productList = productList;
        this.#timeDimension = timeDimension;
        this.#view = view;
    }

    init() {
        this.#productList.registerOnProductSelected(product => {
            this.#view.render(this.#productList.getSelectedProducts(), this.#timeDimension.getCurrentTime());
        });
        this.#timeDimension.registerOnCurrentTimeChanged(currentTime => {
            this.#view.render(this.#productList.getSelectedProducts(), this.#timeDimension.getCurrentTime());
        });
        this.#view.bindOnProductClicked(product => {
            this.#productList.setSelected(product.id, false);
        });
        this.#view.render(this.#productList.getSelectedProducts(), this.#timeDimension.getCurrentTime());
    }
}

export default SelectedProductController;
