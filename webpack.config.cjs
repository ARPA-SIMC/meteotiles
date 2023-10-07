const path = require('path');

module.exports = {
    entry: {
        singlemap: './src/singlemap.js',
        doublemap: './src/doublemap.js',
    },
    plugins: [
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};
