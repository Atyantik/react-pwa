import path from "path";
import fs from "fs";
import crypto from "crypto";
import glob from "glob";
import _ from "lodash";
import express from "express";
import compression from "compression";
import http from "http";
import Config from "config";

const app = express();
const server = http.createServer(app);
const serverPort = _.get(Config, "server.port", 3000);

let currentDir = __dirname;

const filename = _.find(process.argv, arg => {
  return arg.indexOf("/server.js") !== -1;
});
if (filename) {
  currentDir = path.dirname(filename);
}

// Add public path to server from public folder
// This is used when doing server loading
// use compression for all requests
app.use(compression());
app.use("/public", express.static(path.join(currentDir, "public")));

// Get everything inside public path
let allAssets = [];
const getAllAssets = () => {
  if (_.isEmpty(allAssets)) {
    allAssets = glob.sync(path.join(currentDir, "public") + "/**/*");
    allAssets = _.filter(
      _.map(allAssets, a => a.replace(currentDir, "")),
      a => !!path.extname(a)
    );
  }
  return allAssets;
};

// Serve service worker via /service-worker.js
const serviceWorkerContents = fs.readFileSync(path.resolve(path.join(currentDir, "service-worker.js")), "utf-8");
const swVersionHash = crypto.createHash("md5").update(serviceWorkerContents).digest("hex");

app.get("/sw.js", function (req, res) {
  const assets = getAllAssets();
  
  res.setHeader("Content-Type", "application/javascript");
  // No cache header
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.setHeader("Expires", "-1");
  res.setHeader("Pragma", "no-cache");
  res.send(`
    var VERSION = "${swVersionHash}";
    var ASSETS = ${JSON.stringify(assets)};
    ${serviceWorkerContents}
  `);
});

// Middleware to add assets to request
try {
  const assets = require("./config/assets").default;
  app.use(function (req, res, next) {
    req.assets = assets;
    next();
  });
} catch (ex) {
  // Do not do anything here.
  // cause the assets are most probably handled by webpack in dev mode
}

// Include server routes as a middleware
app.use(function(req, res, next) {
  require("./server")(req, res, next);
});


server.listen(serverPort, "localhost", function(err) {
  if (err) throw err;
  const addr = server.address();
  // eslint-disable-next-line
  console.log("Listening at http://%s:%d", addr.address, addr.port);
});