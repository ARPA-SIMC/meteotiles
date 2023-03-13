class Product {
    #id;
    #name;
    #description;
    #times;
    #selected;

    constructor(id, name, description, times, selected) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
        this.#times = times;
        this.#selected = selected;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get description() {
        return this.#description;
    }

    get selected() {
        return this.#selected;
    }

    set selected(selected) {
        this.#selected = selected;
    }

    // Return the list of validity times.
    getTimes() {
        return this.#times;
    }
}

export default Product;
