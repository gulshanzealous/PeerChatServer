var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');
var nodeExternals = require('webpack-node-externals')

const backend = {
  context: path.join(__dirname, "src"),
  // devtool: debug ? "inline-sourcemap" : null,
  devtool: debug ? "string" : false,
  entry: "./streamScript.js",
  output: {
    path: __dirname + '/dist',
    filename: "server.min.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|webpack.config.json)/,
        loader: 'babel-loader',
        query: {
          presets: [ 'es2015', 'stage-0'],
          plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
        }
      },

      { test: /\.css$/, loader: "style-loader!css-loader" },

      { test: /\.(png|jpg|woff2?|ttf|eot|svg)$/, loader: "file-loader" }

    ]
  },

  target: 'node',
  node: {
  __dirname: false,
  __filename: false,
  },
  externals: [
    nodeExternals({
        // this WILL include `jquery` and `webpack/hot/dev-server` in the bundle, as well as `lodash/*`
        whitelist: ['jquery', 'webpack-dev-server', 'events', 'webpack', 'url', 'process']
    }),
    {
        // require("jquery") is external and available
        //  on the global var jQuery
        "jquery": "jQuery"
    }
  ],

  plugins: debug ? [] : [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 15}),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: true }),
    new webpack.DefinePlugin({$dirname: '__dirname',}),
  ],

  // specify for example node_modules to be not bundled
     // other loaders, plugins etc. specific for backend
};

module.exports = [
    Object.assign({} , backend)
];


// css separate minified bundles did not work because the newer versions of webpack are presently not
// compatible with extract-text-webpack plugin.

// Also, the css-loader has a serious bug, therefore I have used style-loader while requiring css files as modules in main.js

 // { test: /\.css$/, use: ExtractTextPlugin.extract({
      //   fallback: "style-loader",
      //   use: {
      //     loader: "css-loader",
      //     options: {
      //       sourceMap: true
      //     }
      //   },
      //   publicPath: "../"
      //   }) 
      // },