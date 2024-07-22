const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        popup: './src/index.js',
        background: './src/background/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'static/js/[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
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
            ],
        }),
    ],
};
