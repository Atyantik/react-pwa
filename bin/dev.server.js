/**
 * Work with webpack to run for dev env
 */

import _ from "lodash";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
// import webpackHotMiddleware from "webpack-hot-middleware";
import express from "express";
import webpackConfig from "../webpack/dev.babel";
import app, { startServer } from "../src/server";

// Inform developers that Compilation is in process
// and wait till its fully done
// eslint-disable-next-line no-console
console.log("Creating bundle with Webpack dev server.. Please wait..");

const compiler = webpack(webpackConfig);

const webpackMiddlewareInstance = webpackMiddleware(compiler, {

  lazy: false,
  // switch into lazy mode
  // that means no watching, but recompilation on every request

  watchOptions: {
    aggregateTimeout: 300,
    poll: true
  },
  // watch options (only lazy: false)

  contentBase: webpackConfig.devServer.contentBase,

  compress: true,

  publicPath: webpackConfig.output.publicPath,
  // public path to bind the middleware to
  // use the same as in webpack

  stats: {
    // Add asset Information
    assets: true,

    // Sort assets by a field
    assetsSort: "field",

    // Add information about cached (not built) modules
    cached: true,

    // Show cached assets (setting this to `false` only shows emitted files)
    cachedAssets: true,

    // Add children information
    children: false,

    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: false,

    // Add built modules information to chunk information
    chunkModules: false,

    // Add the origins of chunks and chunk merging info
    chunkOrigins: false,

    // Sort the chunks by a field
    chunksSort: "field",

    // `webpack --colors` equivalent
    colors: true,

    // Display the distance from the entry point for each module
    depth: false,

    // Display the entry points with the corresponding bundles
    entrypoints: false,

    // Add errors
    errors: true,

    // Add details to errors (like resolving log)
    errorDetails: true,

    // Add the hash of the compilation
    hash: false,

    // Set the maximum number of modules to be shown
    maxModules: 2,

    // Add built modules information
    modules: false,

    // Sort the modules by a field
    modulesSort: "field",

    // Show performance hint when file size exceeds `performance.maxAssetSize`
    performance: true,

    // Show the exports of the modules
    providedExports: false,

    // Add public path information
    publicPath: false,

    // Add information about the reasons why modules are included
    reasons: false,

    // Add the source code of modules
    source: false,

    // Add timing information
    timings: true,

    // Show which exports of a module are used
    usedExports: false,

    // Add webpack version information
    version: true,

    // Add warnings
    warnings: true,

    // Exclude modules which match one of the given strings or regular expressions
    exclude: [
      /node_modules/
    ]
  },
  // options for formatting the statistics

  reporter: null,
  // Provide a custom reporter to change the way how logs are shown.

  serverSideRender: true,
  // Turn off the server-side rendering mode. See Server-Side Rendering part for more info.
});

// Use the webpack middleware
app.use(webpackMiddlewareInstance);

// server content from content base
app.use("/public", express.static(webpackConfig.devServer.contentBase));
// Add assets to request
app.use(function (req, res, next) {

  const webpackStats = res.locals.webpackStats.toJson();
  const assetsByChunkName = webpackStats.assetsByChunkName;
  const publicPath = webpackStats.publicPath;

  _.each(assetsByChunkName, (chunkValue, chunkName) => {
    "use strict";

    // If its array then it just contains chunk value as array
    if (_.isArray(chunkValue)) {
      //console.log(chunkValue);
      _.each(chunkValue, (path, index) => {
        assetsByChunkName[chunkName][index] = `${publicPath}${path}`;
      });
    } else if (_.isObject(chunkValue)) {
      _.each(chunkValue, (subChunkValues, subChunkType) => {
        _.each(subChunkValues, (subChunkValue, subChunkIndex) => {
          assetsByChunkName[chunkName][subChunkType][subChunkIndex] = `${publicPath}${subChunkValue}`;
        });
      });
    }
  });
  req.assets = assetsByChunkName;
  next();
});

webpackMiddlewareInstance.waitUntilValid(() => {
  const withPurge = true;
  startServer(withPurge);
});