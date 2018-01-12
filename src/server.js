import express from "express";
import _ from "lodash";
import http from "http";
import serverMiddleware from "pawjs/src/server/middleware";
import serverHooks from "pawjs/src/server/hooks";
import Config from "./config";

const app = express();
/**
 * --- Your custom code START ---
 */
/**
 * --- Your custom code END ---
 */
// Add the core server as middleware
app.use(serverHooks);

app.use((req, res, next) => {
  res.locals.wook.add_filter("manifest.send", (...args) => {
    return args[1];
  });
  
  res.locals.wook.add_filter("response.send", (response) => {
    return response;
  });
  next();
});

app.use(serverMiddleware);

const server = http.createServer(app);
const serverPort = process.env.PORT || _.get(Config, "server.port", 3000);

server.listen(serverPort, "0.0.0.0", function(err) {
  if (err) throw err;
  const addr = server.address();
  // eslint-disable-next-line
  console.log("Listening at http://%s:%d", addr.address, addr.port);
});

export default app;