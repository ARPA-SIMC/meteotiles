class TimeMapController {
    #productList;
    #timeDimension;
    #view;

    #onLoading = (percentage) => {};
    #onLoaded = () => {};

    constructor(productList, timeDimension, view) {
        this.#productList = productList;
        this.#timeDimension = timeDimension;
        this.#view = view;
    }

    init() {
        this.#productList.registerOnProductSelected((product) => {
            this.#view.renderProductSelected(product);
            this.#view.renderTime(this.#timeDimension.getCurrentTime());
        });

        this.#timeDimension.registerOnCurrentTimeChanged((currentTime) => {
            this.#view.renderTime(this.#timeDimension.getCurrentTime());
        });

        this.#productList.registerOnProductsLoadedCallbacks(() => {
            this.#view.renderLoaded(this.#productList.getProducts());
        });

        this.#view.bindOnLayersLoading((percentage) => {
            this.#onLoading(percentage);
        });

        this.#view.bindOnLayersLoaded(() => {
            this.#onLoaded();
        });

        this.#view.render();
    }

    bindOnLoading(callback) {
        this.#onLoading = callback;
    }

    bindOnLoaded(callback) {
        this.#onLoaded = callback;
    }
}

export default TimeMapController;
