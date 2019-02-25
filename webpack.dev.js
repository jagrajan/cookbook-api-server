const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');

const config = {
  devtool: 'source-map',
  mode: 'development',
  plugins: [
    new webpack.BannerPlugin({
      raw: true,
      banner: 'require("source-map-support").install();'
    })
  ]
};

module.exports = merge(baseConfig, config);