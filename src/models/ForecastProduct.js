import BoundingBox from "./BoundingBox.js";
import Product from './Product.js';

class ForecastProduct extends Product {
    baseUrl;
    modelName;
    modelDescription;
    reftime;
    forecastSteps;
    boundingBox;
    minZoom;
    maxZoom;
    zIndex;
    opacity;
    legendOn;

    constructor(id, baseUrl, modelName, modelDescription, name, description, reftime, forecastSteps, boundingBox, minZoom, maxZoom, zIndex, opacity, legendOn) {
        const times = forecastSteps.map(step => reftime.getTime() + step * 3600 * 1000);

        super(id, name, description, times, false);

        this.baseUrl = baseUrl;
        this.modelName = modelName;
        this.modelDescription = modelDescription;
        this.reftime = reftime;
        this.forecastSteps = forecastSteps;
        this.boundingBox = boundingBox;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.zIndex = zIndex;
        this.opacity = opacity;
        this.legendOn = legendOn;
    }
}

export default ForecastProduct;
