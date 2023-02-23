const path = require('path');

module.exports = {
    entry: './src/singlemap.js',
    plugins: [
    ],
    output: {
        filename: 'singlemap.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};
