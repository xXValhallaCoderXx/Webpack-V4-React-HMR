require('dotenv').config()
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const parts = require("./webpack-config/webpack.parts");

const PATHS = {
  app: path.resolve(__dirname, "src"),
  build: path.join(__dirname, "dist"),
};

const commonConfig = merge([
  {
    output: {
      // Needed for code splitting to work in nested paths
      publicPath: "/",
    },
  },
  // {
  //   plugins: [
  //     new HtmlWebpackPlugin({
  //       title: "Webpack demo",
  //     }),
  //     //new webpack.NamedModulesPlugin()
  //   ],
  // },
  parts.loadJavaScript({ include: PATHS.app }),
  parts.setFreeVariable("HELLO", "hello from config"),
]);


const productionConfig = merge([
  {

    // performance: {
    //   hints: "warning",
    //   maxEntrypointSize: 50000,
    //   maxAssetSize: 450000
    // },
    output: {
      chunkFilename: "static/js/[name].[chunkhash:8].js",
      filename: "static/js/[name].[chunkhash:8].js",
    },
    recordsPath: path.join(__dirname, "records.json"),
  },
  parts.clean(PATHS.build),
  parts.minifyJavaScript(),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
  //parts.generateSourceMaps({ type: "source-map" }),
  parts.extractCSS({
    use: ["css-loader", parts.autoprefix()],
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: "static/images/[name].[hash:8].[ext]",
    },
  }),
  // parts.attachRevision(),
  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
          },
        },
      },
      runtimeChunk: {
        name: "manifest",
      },
    },
  },
]);


const developmentConfig = merge([
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages()
]);


module.exports = mode => {
  const pages = [
    parts.page({
      entry: {
        app: PATHS.app,
      },
      appName: "login",
      title: "LOGIN",
      path: "login",
      chunks: ["app", "manifest", "vendor"],
      template: path.resolve(__dirname, "./src/detect.html"),
    }),
    parts.page({
      entry: {
        another: path.join(PATHS.app, "another.js"),
      },
      appName: "detect",
      title: "DETECT",
      path: "detect",
      chunks: ["another", "manifest", "vendor"],
      template: path.resolve(__dirname, "./src/login.html"),
    }),
  ];


  const config =
    mode === "production" ? productionConfig : developmentConfig;
  return merge([commonConfig, config, { mode }].concat(pages));

};