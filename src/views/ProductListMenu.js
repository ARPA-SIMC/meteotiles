class ProductListMenu {
    #root;
    #productsUl;
    #onProductClicked = () => {};

    constructor(root) {
        this.#root = root;
    }

    render() {
        this.#root.append(this.#getTitleDom());
        this.#productsUl = document.createElement("ul");
        this.#root.append(this.#productsUl);
    }

    renderProductList(products) {
        const nodes = products.map(product => {
            const li = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            checkbox.setAttribute("data-id", product.id);
            checkbox.setAttribute("value", product.id);
            checkbox.checked = product.selected;
            const label = document.createElement("label");
            label.innerText = `${product.modelDescription} ${product.description}`;
            li.append(checkbox);
            li.append(label);
            checkbox.addEventListener('click', () => {
                this.#onProductClicked(product, checkbox.checked);
            });
            return li;
        });
        this.#productsUl.replaceChildren(...nodes);
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

    bindOnProductClicked(callback) {
        this.#onProductClicked = callback;
    }
}

export default ProductListMenu;
