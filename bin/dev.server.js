/**
 * Work with webpack to run for dev env
 */
import chokidar from "chokidar";
import _ from "lodash";
import express from "express";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import http from "http";
import webpackConfig from "../webpack/dev.babel";
import Config from "config";
//import { startServer } from "../src/server";

// Inform developers that Compilation is in process
// and wait till its fully done
// eslint-disable-next-line no-console
console.log("Creating bundle with Webpack dev server.. Please wait..");

const app = express();
const compiler = webpack(webpackConfig);

const webpackMiddlewareInstance = webpackMiddleware(compiler, {
  noInfo: true,
  contentBase: webpackConfig.devServer.contentBase,
  publicPath: webpackConfig.output.publicPath,
  serverSideRender: true,
  // Turn off the server-side rendering mode. See Server-Side Rendering part for more info.
});

// Use the webpack middleware
app.use(webpackMiddlewareInstance);

// Use the Webpack Hot middleware
app.use(webpackHotMiddleware(compiler, {
  log: false,
  path: "/__hmr_update",
  heartbeat: 2000
}));

// server content from content base
app.use("/public", express.static(webpackConfig.devServer.contentBase));

// Add assets to request
app.use(function (req, res, next) {

  const webpackStats = res.locals.webpackStats.toJson();
  const assetsByChunkName = webpackStats.assetsByChunkName;
  const publicPath = webpackStats.publicPath;

  _.each(assetsByChunkName, (chunkValue, chunkName) => {

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

// Include server routes as a middleware
app.use(function(req, res, next) {
  require("../src/server")(req, res, next);
});

const watcher = chokidar.watch("../src/server");

watcher.on("ready", function() {
  watcher.on("all", function() {
    // eslint-disable-next-line
    console.log("Clearing /src/ module cache from server");
    Object.keys(require.cache).forEach(function(id) {
      // eslint-disable-next-line
      if (/[\/\\]src[\/\\]/.test(id)) delete require.cache[id];
    });
  });
});


// Do "hot-reloading" of react stuff on the server
// Throw away the cached client modules and let them be re-required next time
compiler.plugin("done", function() {
  // eslint-disable-next-line
  console.log("Clearing /src/ module cache from server");
  Object.keys(require.cache).forEach(function(id) {
    // eslint-disable-next-line
    if (/[\/\\]src[\/\\]/.test(id)) delete require.cache[id];
  });
});

const server = http.createServer(app);
const serverPort = _.get(Config, "server.port", 3000);
server.listen(serverPort, "localhost", function(err) {

  if (err) throw err;

  const addr = server.address();
  // eslint-disable-next-line
  console.log("Listening at http://%s:%d", addr.address, addr.port);

});