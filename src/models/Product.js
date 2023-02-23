import BoundingBox from "./BoundingBox.js";

class Product {
    #onProductSelectedCallbacks = [];

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
        return this.forecastSteps.map(step => this.reftime.getTime() + step * 3600 * 1000);
    }
}

export default Product;
