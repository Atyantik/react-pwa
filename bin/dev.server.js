/**
 * Work with webpack to run for dev env
 */
import crypto from "crypto";
import chokidar from "chokidar";
import _ from "lodash";
import express from "express";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import http from "http";
import webpackConfig from "../webpack/dev.babel";
import Config from "../src/config";
import {
  isomorphicDevelopment
} from "../settings";

// Inform developers that Compilation is in process
// and wait till its fully done
// eslint-disable-next-line no-console
console.log("Creating bundle with Webpack dev server.. Please wait..");

const app = express();

let commonClientConfig = webpackConfig;
let serviceWorkerConfig = null;
if (_.isArray(webpackConfig)) {
  [commonClientConfig, serviceWorkerConfig] = webpackConfig;
}

// Compile common & client configurations
const commonClientCompiler = webpack(commonClientConfig);
const commonClientMiddlewareInstance = webpackMiddleware(commonClientCompiler, {
  noInfo: true,
  contentBase: commonClientConfig.devServer.contentBase,
  publicPath: commonClientConfig.output.publicPath,
  serverSideRender: true,
  // Turn on the server-side rendering mode. See Server-Side Rendering part for more info.
});

// Use the webpack middleware
app.use(commonClientMiddlewareInstance);

// Use the Webpack Hot middleware  only for common & client, we do not need
// hot updates for service-worker
app.use(webpackHotMiddleware(commonClientCompiler, {
  log: false,
  path: "/__hmr_update",
  heartbeat: 2000
}));

if (serviceWorkerConfig !== null) {
  const serviceWorkerCompiler = webpack(serviceWorkerConfig);
  const serviceWorkerMiddlewareInstance = webpackMiddleware(serviceWorkerCompiler, {
    noInfo: true,
    // We can use he same contentBase as used by commonClient
    contentBase: commonClientConfig.devServer.contentBase,
    publicPath: serviceWorkerConfig.output.publicPath,
    serverSideRender: false,
  });
  app.use(serviceWorkerMiddlewareInstance);
  
  app.get("/sw.js", function (req, res) {
    const webpackStats = res.locals.webpackStats.toJson();
    const assets = _.map(
      _.map(
        _.filter(
          _.get(webpackStats, "assets", []),
          { emitted: true }
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

// server content from content base
app.use("/public", express.static(commonClientConfig.devServer.contentBase));

// Add assets to request
app.use(function (req, res, next) {
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
  req.assets = assets;
  next();
});

// Include server routes as a middleware
app.use(function(req, res, next) {
  // We need to require this run time!
  require("../src/server").default(req, res, next);
});


const clearRequireCache = () => {
  // eslint-disable-next-line
  console.log("Clearing module cache...");
  Object.keys(require.cache).forEach(function(id) {
    delete require.cache[id];
  });
};

if (process.env.NODE_ENV === "development" && isomorphicDevelopment) {
  
  const watcher = chokidar.watch("../src");
  watcher.on("ready", function() {
    watcher.on("all", clearRequireCache);
  });
}



// Do "hot-reloading" of react stuff on the server
// Throw away the cached client modules and let them be re-required next time
commonClientCompiler.plugin("done", function() {
  
  if (process.env.NODE_ENV === "development" && isomorphicDevelopment) {
    clearRequireCache();
  }
  
  const addr = server.address();
  // eslint-disable-next-line
  console.log("Listening at http://%s:%d", addr.address, addr.port);
});

const server = http.createServer(app);
const serverPort = _.get(Config, "server.port", 3000);
server.listen(serverPort, "localhost", function(err) {
  if (err) throw err;
});