class SelectedProductController {
    #productList;
    #timeDimension;
    #view;
    #options = {
        canDeselect: true,
    }

    constructor(productList, timeDimension, view, options) {
        this.#productList = productList;
        this.#timeDimension = timeDimension;
        this.#view = view;
        this.#options = {
            ...this.#options,
            ...options,
        };
    }

    init() {
        this.#productList.registerOnProductSelected(product => {
            this.#view.render(this.#productList.getSelectedProducts(), this.#timeDimension.getCurrentTime());
        });
        this.#timeDimension.registerOnCurrentTimeChanged(currentTime => {
            this.#view.render(this.#productList.getSelectedProducts(), this.#timeDimension.getCurrentTime());
        });
        if (this.#options.canDeselect) {
            this.#view.bindOnProductClicked(product => {
                this.#productList.setSelected(product.id, false);
            });
        }
        this.#view.render(this.#productList.getSelectedProducts(), this.#timeDimension.getCurrentTime());
    }
}

export default SelectedProductController;
