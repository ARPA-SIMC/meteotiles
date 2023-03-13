import ForecastProduct from './ForecastProduct.js';
import Product from './Product.js';


class ForecastAggregateProduct extends Product {
    #forecastProducts;

    constructor(id, name, description, forecastProducts) {
        const times = [...new Set(forecastProducts.map(p => p.getTimes()).flat())];
        super(id, name, description, times, false);
        this.#forecastProducts = forecastProducts;
    }

    get forecastProducts() {
        return this.#forecastProducts;
    }
}

export default ForecastAggregateProduct;
