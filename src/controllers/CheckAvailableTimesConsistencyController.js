class CheckAvailableTimesConsistencyController {
    #productLists;

    constructor(productLists, timeDimension) {
        this.#productLists = productLists;
    }

    init() {
        this.#productLists.forEach(productList => {
            productList.registerOnProductSelected(product => {
                const products = this.#productLists.map(l => l.getSelectedProducts()).flat();
                const lists = products.map(p => p.getTimes());
                const allEquals = lists.slice(1).every((l) => {
                    return l.length == lists[0].length && [...l].every(t => lists[0].has(t))
                })
                if (!allEquals) {
                    alert("Attenzione: i prodotti scelti hanno istanti di validità diversi e quindi, per alcuni istanti, non tutti i prodotti saranno visualizzati");
                }
            });
        });
    }
}

export default CheckAvailableTimesConsistencyController;
