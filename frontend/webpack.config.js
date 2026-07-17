const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/js/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/manifest.json', to: 'manifest.json' },
                { from: 'public/sw.js', to: 'sw.js' },
                { from: 'public/_redirects', to: '_redirects' },
                { from: 'public/assets', to: 'assets' }
            ]
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist')
        },
        port: 3000,
        hot: true,
        historyApiFallback: true
    },
    resolve: {
        extensions: ['.js', '.json']
    }
};
