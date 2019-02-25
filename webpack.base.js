const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');

const config = {

  target: 'node',

  entry: './index.js',

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  },

  externals: [webpackNodeExternals()],

  devtool: 'source-map'
}

module.exports = config;