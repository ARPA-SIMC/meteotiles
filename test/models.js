import { equal } from 'assert';

import { default as Product } from '../src/models/Product.js';
import { default as ProductList } from '../src/models/ProductList.js';

describe('Test models.Product', () => {
    it('Should calculate models.Product.getTimes() correctly', () => {
        const product = new Product(1, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [1, 2, 3], null, 5, 6, 1, 1, false);
        const times = [
            new Date("2000-01-01T01:00:00Z").getTime(),
            new Date("2000-01-01T02:00:00Z").getTime(),
            new Date("2000-01-01T03:00:00Z").getTime(),
        ];
        const productTimes = product.getTimes();
        equal(productTimes.length, times.length);
        equal(productTimes[0], times[0]);
        equal(productTimes[1], times[1]);
        equal(productTimes[2], times[2]);
    });
});
