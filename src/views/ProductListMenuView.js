import { formatDate } from '../utils.js';

class ProductListMenuView {
    #root;
    #productsDiv;
    #onProductClicked = () => {};

    constructor(root) {
        this.#root = root;
    }

    render() {
        this.#root.classList.add('meteotiles-product-list-menu');
        this.#root.append(this.#getTitleDom());

        const searchDiv = document.createElement("div");
        searchDiv.classList.add("map-menu-search");
        const searchInput = document.createElement("input");
        searchInput.type = "search";
        searchInput.placeholder = "\u{1F50D} Filtra i prodotti";
        searchDiv.append(searchInput);
        this.#root.append(searchDiv);

        searchInput.addEventListener("input", (ev) => {
            const searchText = ev.target.value;
            this.#filterProductList(searchText);
        });

        this.#productsDiv = document.createElement("div");
        this.#productsDiv.classList.add("product-list-ul");
        this.#root.append(this.#productsDiv);
    }

    renderEnableProductSelection(enabled) {
        if (enabled) {
            this.#productsDiv.querySelectorAll('input[type="checkbox"]').forEach(input => input.disabled = false);
        } else {
            this.#productsDiv.querySelectorAll('input[type="checkbox"]').forEach(input => {
                if (!input.checked) {
                    input.disabled = true;
                }
            });
        }
    }

    renderProductList(products) {
        const groupedProductList = products.reduce((acc, product) => {
            const key = `${product.modelDescription} - ${formatDate(product.reftime)}`;
            if (key in acc) {
                acc[key].push(product);
            } else {
                acc[key] = [product];
            }
            return acc
        }, {});
        const nodes = Object.entries(groupedProductList)
            .sort(([title1, products1], [title2, products2]) => title1.localeCompare(title2))
            .map(([title, products]) => {
                const titleElement = document.createElement("h3");
                titleElement.innerText = title;
                const ul = document.createElement("ul");
                ul.classList.add("product-list-model-ul");
                ul.append(...products.map(product => {
                    const li = document.createElement("li");
                    li.classList.add("product-list-model-li");
                    const checkbox = document.createElement("input");
                    checkbox.setAttribute("type", "checkbox");
                    checkbox.setAttribute("data-id", product.id);
                    checkbox.setAttribute("value", product.id);
                    checkbox.checked = product.selected;
                    const label = document.createElement("label");
                    label.innerText = `${product.modelDescription} ${product.description}`;
                    label.addEventListener('click', () => {
                        if (!checkbox.disabled) {
                            checkbox.checked = !checkbox.checked;
                            this.#onProductClicked(product, checkbox.checked);
                        }
                    });
                    li.append(checkbox);
                    li.append(label);
                    checkbox.addEventListener('click', () => {
                        this.#onProductClicked(product, checkbox.checked);
                    });
                    return li;
                }).sort((a, b) => a.innerText.localeCompare(b.innerText)));
                titleElement.addEventListener('click', () => {
                    ul.classList.toggle('hidden');
                    titleElement.classList.toggle('collapsed');
                });
                return [titleElement, ul];
            }).flat();
        this.#productsDiv.replaceChildren(...nodes);
    }

    renderProductSelected(product) {
        const checkbox = this.#root.querySelector(`input[type="checkbox"][data-id="${product.id}"]`);
        checkbox.checked = product.selected;
    }

    renderLoading() {
        this.#root.querySelector(".loader").classList.add("loading");
    }

    renderLoaded() {
        this.#root.querySelector(".loader").classList.remove("loading");
    }

    #getTitleDom() {
        const h2 = document.createElement("h2");
        const title = document.createElement("span");
        title.innerText ="Elenco dei prodotti";
        const loader = document.createElement("span");
        loader.classList.add("loader");
        h2.append(title);
        h2.append(loader);
        return h2;
    }

    #filterProductList(searchText) {
        // NOTE: this is handled directly by the view, it should be handled by
        // the controller.
        const search = searchText.toLowerCase();
        this.#productsDiv.querySelectorAll("li.product-list-model-li").forEach(li => {
            if (!li.innerText.toLowerCase().includes(search)) {
                li.classList.add("hidden");
            } else {
                li.classList.remove("hidden");
            }
        });
    }

    bindOnProductClicked(callback) {
        this.#onProductClicked = callback;
    }
}

export default ProductListMenuView;
