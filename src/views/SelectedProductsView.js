import { formatDate } from '../utils.js';

class SelectedProductsView {
    #root;
    #onProductClicked = () => {};

    constructor(element) {
        this.#root = element;
    }

    render(products, currentTime) {
        const badges = products.map(product => {
            const badge = document.createElement("span");
            badge.classList.add("product-selection-badge");
            if (product.getTimes().indexOf(currentTime) == -1) {
                badge.classList.add("product-selection-badge-inactive");
            } else {
                badge.classList.remove("product-selection-badge-inactive");
            }
            badge.setAttribute("data-id", product.id);
            badge.innerText = `${product.modelDescription} - ${formatDate(product.reftime)} - ${product.description}`;
            badge.addEventListener("click", () => {
                this.#onProductClicked(product);
            });
            return badge;
        });
        this.#root.replaceChildren(...badges);
    }

    #renderProductSelected(product, currentTime) {
        if (product.selected && this.#root.querySelector(`[data-id="${product.id}"]`) == null) {
            const badge = document.createElement("span");
            badge.classList.add("product-selection-badge");
            badge.setAttribute("data-id", product.id);
            badge.innerText = `${product.modelDescription} - ${formatDate(product.reftime)} - ${product.description}`;
            this.#root.append(badge);
            badge.addEventListener("click", () => {
                this.#onProductClicked(product);
            });
        }
        if (!product.selected) {
            const badge = this.#root.querySelector(`[data-id="${product.id}"]`);
            if (badge) {
                badge.remove();
            }
        }
    }

    bindOnProductClicked(callback) {
        this.#onProductClicked = callback;
    }
}

export default SelectedProductsView;
