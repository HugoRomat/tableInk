const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

module.exports = env => {
  console.log('NODE_ENV: ', env); 
  return {
    entry: [
      "./src/js/app.js", 
    ],
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "js/[name].js",
      library: 'inkspace'
    },
    devServer: {
      contentBase: "./dist",
      port: 8080
    },
    

    
    
    module: {
      rules: [
        { test:/\.css$/, use:['style-loader','css-loader'] },
        { test: /\.svg$/, loader: 'svg-inline-loader' },
        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
        { test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
        { test: /\.(png|jpg)$/, loader: 'url-loader'},
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    }
  }
}