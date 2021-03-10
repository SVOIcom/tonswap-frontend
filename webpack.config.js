const webpack = require('webpack');


const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    plugins: [
       /* new CopyPlugin({
            patterns: [
                { from: './node_modules/ton-client-web-js/tonclient.wasm' }
            ],
        }),*/
        new CopyPlugin(
            [
                {from: './node_modules/ton-client-web-js/tonclient.wasm'},
                //{from: './node_modules/@tonclient/lib-web/tonclient.wasm', to: 'tonclient_1.5.3.wasm'},
            ],
        ),
        /*new webpack.ProvidePlugin({
            //process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer'],
        }),*/
    ],
};