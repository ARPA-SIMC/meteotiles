export function formatDate(date) {
    if (date == null) {
        return "";
    }
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 16).replace("T", " ").replaceAll("-", "/");
}


/**
 * This class calculates the total loading percentage of the maps from
 * different TimeMapController objects and updates a TimePlayerController.
 */
export class TotalLoadingPercentageHandler {
    #playerController;
    #mapControllers;
    #percentages;

    constructor(playerController, mapControllers) {
        this.#playerController = playerController;
        this.#mapControllers = mapControllers;
        this.#percentages = new Array(mapControllers.length).fill(100);
    }

    init() {
        this.#mapControllers.forEach((mapController, index) => {
            mapController.bindOnLoaded(() => {
                this.#percentages[index] = 100;
                if (this.isLoaded()) {
                    this.#playerController.setLoaded();
                }
            });
            mapController.bindOnLoading((percentage) => {
                this.#percentages[index] = percentage;
                const totalPercentage = this.calculateTotalPercentage();
                this.#playerController.setLoading(totalPercentage);
            });
        });
    }

    calculateTotalPercentage() {
        const sum = this.#percentages.reduce((partial, current) => {
            return partial + current;
        }, 0);
        return Math.floor(sum / this.#percentages.length);
    }

    isLoaded() {
        return this.calculateTotalPercentage() == 100;
    }

}
