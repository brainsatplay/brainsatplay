const webpack = require('webpack')
const path = require('path');
const WorkerPlugin = require('worker-plugin');

module.exports = {
  entry: path.join(__dirname, 'src', 'libraries', 'js', 'brainsatplay.js'),
  output: {
    filename: 'brainsatplay.js',
    path: path.join(__dirname,'src', 'libraries', 'js', 'dist'),
    library: {
      name: 'brainsatplay', 
      type: 'umd',      
    },
    globalObject: 'this',
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.svg/,
        type: 'asset/inline'
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.worker\.js$/,
        loader: "worker-loader",
        options: { inline: "fallback" },
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
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
        "zlib": false,
        "crypto": false,
        "https": require.resolve("https-browserify"),
        "resolve-from": false,
        "child_process": false,
        'net': false,
        'tls': false,
      } 
    },
    plugins: [
      // fix "process is not defined" error:
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new WorkerPlugin()
     ]
};
