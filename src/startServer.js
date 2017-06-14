import _ from "lodash";
import express from "express";
import http from "http";
import Config from "config";

const app = express();
const server = http.createServer(app);
const serverPort = _.get(Config, "server.port", 3000);

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