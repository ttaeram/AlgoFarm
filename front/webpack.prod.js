const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
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
        { from: 'src/library', to: 'library' }, // 라이브러리 폴더 복사
        { from: 'src/css', to: 'css' }, // 라이브러리 폴더 복사
        { from: 'src/baekjoon', to: 'baekjoon' }, // 라이브러리 폴더 복사
        { from: 'src/common', to: 'common' }, // 라이브러리 폴더 복사
      ],
    }),
  ],
});
