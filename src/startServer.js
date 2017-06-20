import path from "path";
import _ from "lodash";
import express from "express";
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
app.use("/public", express.static(path.join(currentDir, "public")));

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