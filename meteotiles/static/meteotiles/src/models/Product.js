import BoundingBox from "./BoundingBox.js";

class Product {
    constructor(id, modelName, modelDescription, name, description, reftime, forecastUrls, boundingBox, minZoom, maxZoom, zIndex, opacity, legendUrl) {
        this.id = id;
        this.modelName = modelName;
        this.modelDescription = modelDescription;
        this.name = name;
        this.description = description;
        this.reftime = reftime;
        this.forecastUrls = forecastUrls;
        this.boundingBox = boundingBox;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.zIndex = zIndex;
        this.opacity = opacity;
        this.legendUrl = legendUrl;
        this.selected = false;
    }

    getTimes() {
        return Object.keys(this.forecastUrls);
    }
}

export default Product;
