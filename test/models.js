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

describe('Test models.ProductList', () => {
    it('Should load models.ProductList and fire events', () => {
        let loadingFired = false;
        let loadedFired = false;
        const products = [
            new Product(1, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [1, 2, 3], null, 5, 6, 1, 1, false),
            new Product(2, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [1, 2, 3], null, 5, 6, 1, 1, false),
        ];
        const productList = new ProductList();
        productList.registerOnProductsLoadingCallbacks(() => loadingFired = true);
        productList.registerOnProductsLoadedCallbacks(() => loadedFired = true);
        productList.setProducts(products);
        equal(loadingFired, true);
        equal(loadedFired, true);
    });

    it('Should properly select/deselect a product', () => {
        const products = [
            new Product(1, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [1, 2, 3], null, 5, 6, 1, 1, false),
            new Product(2, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [1, 2, 3], null, 5, 6, 1, 1, false),
        ];
        const productList = new ProductList();
        productList.setProducts(products);
        productList.setSelected(1, true);
        equal(productList.getSelectedProducts().length, 1);
        equal(productList.getSelectedProducts()[0].id, 1);
        productList.setSelected(1, false);
        equal(productList.getSelectedProducts().length, 0);
    });

    it('Should fire the selected/deselected event', () => {
        let selectedFired = false;
        let unselectedFired = false;
        const products = [
            new Product(1, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [1, 2, 3], null, 5, 6, 1, 1, false),
            new Product(2, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [1, 2, 3], null, 5, 6, 1, 1, false),
        ];
        const productList = new ProductList();
        productList.setProducts(products);

        productList.registerOnProductSelected((product) => {
            if (product.selected) {
                selectedFired = true;
            } else {
                unselectedFired = true;
            }
        });
        productList.setSelected(1, true);
        equal(selectedFired, true);
        productList.setSelected(1, false);
        equal(unselectedFired, true);
    });

    it('Should calculate the available times based on selected products', () => {
        const products = [
            new Product(1, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [1, 2, 3], null, 5, 6, 1, 1, false),
            new Product(2, "baseUrl", "modelName", "modelDescription", "name", "description", new Date("2000-01-01T00:00:00Z"), [2, 3, 4], null, 5, 6, 1, 1, false),
        ];
        const productList = new ProductList();
        productList.setProducts(products);

        productList.setSelected(1, true);
        equal(productList.getAvailableTimes().length, 3);
        equal(productList.getAvailableTimes()[0], new Date("2000-01-01T01:00:00Z").getTime());
        equal(productList.getAvailableTimes()[1], new Date("2000-01-01T02:00:00Z").getTime());
        equal(productList.getAvailableTimes()[2], new Date("2000-01-01T03:00:00Z").getTime());

        productList.setSelected(2, true);
        equal(productList.getAvailableTimes().length, 4);
        equal(productList.getAvailableTimes()[0], new Date("2000-01-01T01:00:00Z").getTime());
        equal(productList.getAvailableTimes()[1], new Date("2000-01-01T02:00:00Z").getTime());
        equal(productList.getAvailableTimes()[2], new Date("2000-01-01T03:00:00Z").getTime());
        equal(productList.getAvailableTimes()[3], new Date("2000-01-01T04:00:00Z").getTime());

        productList.setSelected(1, false);
        equal(productList.getAvailableTimes().length, 3);
        equal(productList.getAvailableTimes()[0], new Date("2000-01-01T02:00:00Z").getTime());
        equal(productList.getAvailableTimes()[1], new Date("2000-01-01T03:00:00Z").getTime());
        equal(productList.getAvailableTimes()[2], new Date("2000-01-01T04:00:00Z").getTime());
    });
});
