const {DefinePlugin} = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


const isWatch = process.argv.some(function (arg) {
  return arg === '--watch';
});

const outputPath = path.resolve('./dist/');

const env = {
  targets: {
    browsers: ['Chrome >= 49']
  }
};

if (isWatch) {
  env.targets.browsers = ['Chrome >= 65'];
}

const config = {
  entry: {
    inject: './src/js/inject',
    options: './src/js/options'
  },
  output: {
    path: outputPath,
    filename: 'js/[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', env]
            ]
          }
        }
      },
      {
        test: /\.(css|less)$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "clean-css-loader"
        }, {
          loader: "less-loader"
        }]
      },
      {
        test: /\.(png|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [
        outputPath,
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {from: './src/manifest.json',},
        {from: './src/icons', to: './icons'},
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: './src/options.html',
      chunks: ['options']
    }),
    new DefinePlugin({
      'process.env': {
        'DEBUG': JSON.stringify('*')
      }
    }),
  ]
};

if (!isWatch) {
  config.devtool = 'none';
  Object.keys(config.entry).forEach(entryName => {
    let value = config.entry[entryName];
    if (!Array.isArray(value)) {
      value = [value];
    }
    if (entryName === 'inject') {
      // value.unshift();
    } else
    if (entryName === 'inject') {
      // value.unshift();
    }

    config.entry[entryName] = value;
  });
}

module.exports = config;