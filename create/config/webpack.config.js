'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.jsx',
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
    },
    output: {
      path: PATHS.build,
      filename: '[name].bundle.js',
    },
    devtool: argv.mode === 'production' ? false : 'inline-source-map',
  });

module.exports = config;
