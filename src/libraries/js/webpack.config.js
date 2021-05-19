const webpack = require('webpack')
const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'brainsatplay.js'),
  output: {
    filename: 'brainsatplay.js',
    path: path.join(__dirname,'dist'),
    publicPath: '/',
    // library: 'brainsatplay',
    library: {
      name: 'brainsatplay', 
      type: 'umd',      
    },
    globalObject: 'this',
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: "script-loader"
      //   }
      // },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: "[name]_[local]_[hash:base64]",
              sourceMap: true,
              minimize: true
            }
          }
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [ "transform-class-properties" ]
          }
        }
      }
    ]
  },
    resolve: {
      fallback: {
        "fs": false,
        "os": require.resolve("os-browserify/browser"),
        "http": require.resolve("stream-http"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/"),
        "buffer": require.resolve("buffer/"),
        "dgram": false,
        "node-osc": false,
        "readline": false,
      } 
    },
    plugins: [
      // fix "process is not defined" error:
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
     ]
};
