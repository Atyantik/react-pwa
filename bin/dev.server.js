/**
 * Work with webpack to run for dev env
 */
import React from "react";
import ReactDOMServer from "react-dom/server";
import _ from "lodash";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import webpackConfig from "../webpack/dev.babel";
import express from "express";
import app from "../src/server";
import Home from "../src/app/components/Home/home";

// Inform developers that Compilation is in process
// and wait till its fully done
// eslint-disable-next-line no-console
console.log("Creating bundle with Webpack dev server.. Please wait..");

const compiler = webpack(webpackConfig);

const webpackMiddlewareInstance = webpackMiddleware(compiler, {
  // noInfo: false,
  // display no info to console (only warnings and errors)

  // quiet: true,
  // display nothing to the console

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

  // headers: { 'X-Custom-Header': 'yes' },
  // custom headers

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

const webpackHotMiddlewareInstance = webpackHotMiddleware(compiler, {
  log: false,
  path: "/__hot_update",
  heartbeat: 2000
});

// Use the webpack middleware
app.use(webpackMiddlewareInstance);

// Use webpack hot middleware
app.use(webpackHotMiddlewareInstance);

// server content from content base
app.use("/public", express.static(webpackConfig.devServer.contentBase));


const extractFiles = (assets, ext = ".js") => {
  let common = [];
  let dev = [];
  let other = [];

  const addToList = (file) => {

    let fileName = file.split("/").pop();

    if (_.startsWith(fileName, "common")) {
      common.push(file);
      return;
    }
    if (_.startsWith(fileName, "dev")) {
      dev.push(file);
      return;
    }
    other.push(file);
  };

  _.each(assets, asset => {
    "use strict";
    if (_.isArray(asset) || _.isObject(asset)) {
      _.each(asset, file => {
        if (_.endsWith(file, ext)) {
          addToList(file);
        }
      });
    } else {
      if (_.endsWith(asset, ext)) {
        addToList(asset);
      }
    }
  });

  return [
    ...common,
    ...dev,
    ...other,
  ];

};

// The following middleware would not be invoked until the latest build is finished.
app.get("/", (req, res) => {

  const webpackStats = res.locals.webpackStats.toJson();
  const assetsByChunkName = webpackStats.assetsByChunkName;
  const publicPath = webpackStats.publicPath;

  const html = ReactDOMServer.renderToString(<Home />);
  //const html = '';

  res.send(`<!DOCTYPE html>
		<html>
		  <head>
		    <title>My App</title>
				${_.map(extractFiles(assetsByChunkName, ".css"), path => `<link rel="stylesheet" href="${publicPath}${path}" />`).join("")}
		  </head>
		  <body>
		    <div id="app">${html}</div>
		    ${_.map(extractFiles(assetsByChunkName, ".js"), path => `<script type="text/javascript" src="${publicPath}${path}"></script>`).join("")}
		  </body>
		</html>
	`);
});

webpackMiddlewareInstance.waitUntilValid(() => {
  app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("App Started ==> Open http://localhost:3000 to see the app");
  });
});