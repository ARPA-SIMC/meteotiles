import BoundingBox from "./BoundingBox.js";

class Product {
    constructor(id, baseUrl, modelName, modelDescription, name, description, reftime, forecastSteps, boundingBox, minZoom, maxZoom, zIndex, opacity, legendOn) {
        this.id = id;
        this.baseUrl = baseUrl;
        this.modelName = modelName;
        this.modelDescription = modelDescription;
        this.name = name;
        this.description = description;
        this.reftime = reftime;
        this.forecastSteps = forecastSteps;
        this.boundingBox = boundingBox;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.zIndex = zIndex;
        this.opacity = opacity;
        this.legendOn = legendOn;
        this.selected = false;
    }

    getTimes() {
        // TODO: fix temporanea per i modelli che hanno lo step in minuti. Si
        // suppone che non ci siano modelli con step +500h (i.e. quasi 21
        // giorni) e che in tal caso si suppone che siano minuti.
        if (Math.max(...this.forecastSteps) > 500) {
            return this.forecastSteps.map(step => this.reftime.getTime() + step * 60 * 1000);
        }
        return this.forecastSteps.map(step => this.reftime.getTime() + step * 3600 * 1000);
    }
}

export default Product;
