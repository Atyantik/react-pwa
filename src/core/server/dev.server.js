/**
 * We do not want to do any isomorphic reply and leave everything to
 * client code for error reporting and redirection.
 * Thus we are just simply returning HTML with non-mod assets
 */
import _ from "lodash";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import React from "react";
import ReactDOMServer from "react-dom/server";
import serveFavicon from "serve-favicon";
import express from "express";
import path from "path";

import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import webpackConfig from "../../../webpack/dev.babel";

import {extractFilesFromAssets} from "../utils/utils";
import Html from "../components/html";
import {publicDirName, srcPublicDir} from "../../../directories";

const app = express();

const enableServiceWorker = false;

// Extract cookies from the request, making it available as
// Object request.cookie.user etc..
app.use(cookieParser());

// eslint-disable-next-line no-console
console.log("Creating bundle with Webpack dev server.. Please wait..");

/**
 * Try to serve favicon
 */
try {
  const faviconPath = path.join(srcPublicDir, "favicon.ico");
  if (path.resolve(faviconPath)) {
    app.use(serveFavicon(faviconPath));
  }
} catch (ex) {
  // eslint-disable-next-line
  console.log(`Please add favicon @ ${publicDirName}/favicon.ico for improved performance.`);
}

// Get common client webpack config
let commonClientConfig = webpackConfig;

// Initialize service worker config as null
let serviceWorkerConfig = null;

// If multi-config is returned, it means configuration for
// service worker is also present
if (_.isArray(webpackConfig)) {
  [commonClientConfig, serviceWorkerConfig] = webpackConfig;
}

// server content from content base
app.use("/public", express.static(commonClientConfig.devServer.contentBase));

// Compile common & client configurations
const commonClientCompiler = webpack(commonClientConfig);

const commonClientMiddlewareInstance = webpackMiddleware(commonClientCompiler, {
  stats: "errors-only",
  noInfo: true,
  contentBase: commonClientConfig.devServer.contentBase,
  publicPath: commonClientConfig.output.publicPath,
  serverSideRender: true,
});

// Use the webpack middleware
app.use(commonClientMiddlewareInstance);

// Use the Webpack Hot middleware only for common & client, we do not need
// hot updates for service-worker
app.use(webpackHotMiddleware(commonClientCompiler, {
  log: false,
  path: "/__hmr_update",
  heartbeat: 2000
}));

// Add assets to request, we will need to compute it properly as we need to append
// the public path as well
app.use(function (req, res, next) {
  
  // get stats from webpack
  let webpackStats = res.locals.webpackStats.toJson();
  
  let assets = {};
  if (!webpackStats.children || webpackStats.children.length <= 1) {
    webpackStats = [webpackStats];
  } else {
    webpackStats = webpackStats.children;
  }
  
  _.each(webpackStats, stat => {
    const assetsByChunkName = stat.assetsByChunkName;
    const publicPath = stat.publicPath;
    
    _.each(assetsByChunkName, (chunkValue, chunkName) => {
      
      // If its array then it just contains chunk value as array
      if (_.isArray(chunkValue)) {
        _.each(chunkValue, (path, index) => {
          assetsByChunkName[chunkName][index] = `${publicPath}${path}`;
        });
      } else if (_.isObject(chunkValue)) {
        _.each(chunkValue, (subChunkValues, subChunkType) => {
          _.each(subChunkValues, (subChunkValue, subChunkIndex) => {
            assetsByChunkName[chunkName][subChunkType][subChunkIndex] = `${publicPath}${subChunkValue}`;
          });
        });
      } else if (_.isString(chunkValue)) {
        assetsByChunkName[chunkName] = `${publicPath}${chunkValue}`;
      }
    });
    assets = {...assets, ...assetsByChunkName};
  });
  // All assets
  req.assets = assets;
  // all css assets
  req.cssAssets = extractFilesFromAssets(assets, ".css");
  
  // all js assets
  req.jsAssets = extractFilesFromAssets(assets, ".js");
  
  next();
});

if (enableServiceWorker && serviceWorkerConfig !== null) {
  const serviceWorkerCompiler = webpack(serviceWorkerConfig);
  const serviceWorkerMiddlewareInstance = webpackMiddleware(serviceWorkerCompiler, {
    noInfo: true,
    // We can use he same contentBase as used by commonClient
    contentBase: commonClientConfig.devServer.contentBase,
    publicPath: serviceWorkerConfig.output.publicPath,
    serverSideRender: true,
  });
  app.use(serviceWorkerMiddlewareInstance);
  
  app.get("/sw.js", function (req, res) {
    const webpackStats = res.locals.webpackStats.toJson();
    const assets = _.map(
      _.map(
        _.filter(
          _.get(webpackStats, "assets", []),
          {emitted: true}
        ),
        "name"
      ),
      a => `${webpackStats.publicPath}${a}`
    );
    
    const serviceWorkerContents = serviceWorkerMiddlewareInstance.fileSystem.readFileSync(`${serviceWorkerConfig.output.path}/service-worker.js`, "utf-8");
    
    let swResponseText = `
      var ASSETS = ${JSON.stringify(assets)};
      ${serviceWorkerContents}
    `;
    const swVersionHash = crypto.createHash("md5").update(swResponseText).digest("hex");
    swResponseText = `
      var VERSION = "${swVersionHash}";
      ${swResponseText}
    `;
    
    res.setHeader("Content-Type", "application/javascript");
    // No cache header
    res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.setHeader("Expires", "-1");
    res.setHeader("Pragma", "no-cache");
    res.send(swResponseText);
  });
}

/**
 * Send global data to user, as we do not want to send it via
 * window object
 */
app.get("/_globals", (req, res) => {
  
  // Never ever cache this request
  const {cssAssets, jsAssets} = req;
  
  res.setHeader("Content-Type", "application/json");
  // No cache header
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.setHeader("Expires", "-1");
  res.setHeader("Pragma", "no-cache");
  
  return res.send(JSON.stringify({
    allCss: cssAssets,
    allJs: jsAssets
  }));
});

app.get("*", (req, res) => {
  
  // Get list of assets from request
  const {cssAssets, jsAssets} = req;
  
  /**
   * Get common/client (non-module) CSS generated
   */
  const currentRouteCss = _.filter(cssAssets, css => {
    const fileName = css.split("/").pop();
    return !_.startsWith(fileName, "mod-");
  });
  
  /**
   * Get common/client (non-module) JS generated
   */
  const currentRouteJs = _.filter(jsAssets, js => {
    const fileName = js.split("/").pop();
    return !_.startsWith(fileName, "mod-") && !_.startsWith(fileName, "service-worker.js");
  });
  
  let html = ReactDOMServer.renderToString((
    <Html
      stylesheets={currentRouteCss}
      scripts={currentRouteJs}
    />
  ));
  return res.send(`<!DOCTYPE html>${html}`);
});

if (module.hot) module.hot.accept();

export default app;