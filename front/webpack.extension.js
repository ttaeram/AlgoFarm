const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtReloader = require('webpack-ext-reloader');

module.exports = merge(common, {
    mode: 'development',
    entry: {
        popup: './src/popup/index.js',
        background: './src/background/background.js',
        contentScript: './src/contentScript/contentScript.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'popup.html',
            chunks: ['popup'],
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public', to: '.', globOptions: { ignore: ['**/index.html'] } },
                { from: 'src/library', to: 'library' },
                { from: 'src/css', to: 'css' },
                { from: 'src/baekjoon', to: 'baekjoon' },
                { from: 'src/common', to: 'common' },
            ],
        }),
        new ExtReloader({
            reloadPage: true,
            entries: {
                background: 'background',
                contentScript: 'contentScript',
            }
        }),
    ],
    devtool: 'cheap-module-source-map',
});