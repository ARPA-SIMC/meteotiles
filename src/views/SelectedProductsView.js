import { formatDate } from '../utils.js';

class SelectedProductsView {
    #root;
    #onProductClicked = () => {};

    constructor(element) {
        this.#root = element;
    }

    render() {}

    renderProductSelected(product) {
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
