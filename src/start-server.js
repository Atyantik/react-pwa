import path from "path";
import fs from "fs";
import crypto from "crypto";
import glob from "glob";
import _ from "lodash";
import express from "express";
import compression from "compression";
import http from "http";
import Config from "./config";
import ServerMiddleware from "./core/server/middleware";
import assets from "./config/assets";
import { enableServiceWorker } from "../settings";

const app = express();
const server = http.createServer(app);
const serverPort = _.get(Config, "server.port", 3000);

let currentDir = __dirname;

// Set appropriate currentDir when build and run in production mode
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
if (enableServiceWorker) {
  
  let cachedswResponseText = null;
  const getServiceWorkerContent = () => {
    if (cachedswResponseText) return cachedswResponseText;
    // Get contents of service worker
    const serviceWorkerContents = fs.readFileSync(path.resolve(path.join(currentDir, "service-worker.js")), "utf-8");
  
    // Create a response text without Version number
    let swResponseText = `
    var ASSETS = ${JSON.stringify(getAllAssets())};
      ${serviceWorkerContents}
    `;
    // Create an MD5 hash of response and then append it to response
    const swVersionHash = crypto.createHash("md5").update(swResponseText).digest("hex");
    swResponseText = `
      var VERSION = "${swVersionHash}";
      ${swResponseText}
    `;
    cachedswResponseText = swResponseText;
    return swResponseText;
  };
  
  app.get("/sw.js", function (req, res) {
    
    const swResponseText = getServiceWorkerContent();
    res.setHeader("Content-Type", "application/javascript");
    // No cache header
    res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.setHeader("Expires", "-1");
    res.setHeader("Pragma", "no-cache");
    res.send(swResponseText);
  });
}

// Middleware to add assets to request
try {
  app.use(function (req, res, next) {
    req.assets = assets;
    next();
  });
} catch (ex) {
  // Do not do anything here.
  // cause the assets are most probably handled by webpack in dev mode
}

// Include server routes as a middleware
app.use(ServerMiddleware);


server.listen(serverPort, "localhost", function(err) {
  if (err) throw err;
  const addr = server.address();
  // eslint-disable-next-line
  console.log("Listening at http://%s:%d", addr.address, addr.port);
});