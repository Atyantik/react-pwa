import express from "express";
import React from "react";
import _ from "lodash";
import http from "http";
import serverMiddleware from "pawjs/src/server/middleware";
import serverHooks from "pawjs/src/server/hooks";
import Config from "./config";
import * as appReducers from "./app/reducers";

const app = express();
/**
 * --- Your custom code START ---
 */
app.use((req, res, next) => {
  res.locals.reduxInitialState = {
    counter: {
      count: 5
    }
  };
  res.locals.reduxReducers = appReducers;
  next();
});


/**
 * --- Your custom code END ---
 */
// Add the core server as middleware
app.use(serverHooks);

app.use((req, res, next) => {
  res.locals.wook.add_filter("paw_head", head => {
    head.push(
      <script
        type="application/ld+json"
        key="atyantik-org"
        dangerouslySetInnerHTML={{__html: `{
          "@context": "http://schema.org",
          "@type": "Organization",
          "name": "Atyantik Technologies",
          "description": "We are ultimate technology maniacs",
          "url": "https://www.atyantik.com/",
          "telephone": "+91 265 2530860",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "India"
          }
        }`}}
      />
    );
    return head;
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