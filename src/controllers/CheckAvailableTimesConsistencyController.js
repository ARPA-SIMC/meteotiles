class CheckAvailableTimesConsistencyController {
    #productLists;
    #timeDimension;
    #previousAvailableTimes;

    constructor(productLists, timeDimension) {
        this.#productLists = productLists;
        this.#timeDimension = timeDimension;
        this.#previousAvailableTimes = timeDimension.getAvailableTimes();
    }

    init() {
        this.#productLists.forEach(productList => {
            productList.registerOnProductSelected(product => {
                // Quando seleziono un nuovo prodotto, devo segnalare il caso in cui non abbia i medesimi
                // istanti di tempo fino ad ora visualizzati
                const availableTimes = this.#timeDimension.getAvailableTimes();
                if (this.#previousAvailableTimes.length == 0 || availableTimes.length == 0 || !product.selected) {
                    // Do nothing
                } else if (JSON.stringify(this.#previousAvailableTimes) != JSON.stringify(product.getTimes())) {
                    alert("Attenzione: i prodotti scelti hanno istanti di validità diversi e quindi, per alcuni istanti, non tutti i prodotti saranno visualizzati");
                }
                this.#previousAvailableTimes = availableTimes;
            });
        });
    }
}

export default CheckAvailableTimesConsistencyController;
