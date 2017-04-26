import express from "express";
import _ from "lodash";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter, Route } from "react-router";

import assets from "./config/assets";
import routes from "./routes";

// Create and expressjs application
const app = express();

// Set x-powered-by to false
_.set(app, "locals.settings.x-powered-by", false);

app.use("/public", express.static("public"));

// add assets to request
app.use(function (req, res, next) {
  req.assets = assets;
  next();
});

export const extractFiles = (assets, ext = ".js") => {
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
    ...common.sort(),
    ...dev.sort(),
    ...other.sort(),
  ];

};

export default app;

export const startServer = () => {
  "use strict";

  app.get("*", (req, res) => {
    const { assets } = req;
    const context = {};
    const routeMap = {};

    const html = ReactDOMServer.renderToString((
      <StaticRouter
        location={req.path}
        context={context}
      >
        <div>
          {_.map(routes, (route, index) => {
            return <Route key={index} exact={route.exact} path={route.path} render={(props) => {
              return <route.component {...props} />;
            }} />;
          })}
        </div>
      </StaticRouter>
    ));

    res.send(`<!DOCTYPE html>
		<html>
		  <head>
		    <title>My App</title>
        ${_.map(extractFiles(assets, ".css"), path => `<link rel="stylesheet" href="${path}" />`).join("")}
		  </head>
		  <body>
		    <div id="app">${html}</div>
		    ${_.map(extractFiles(assets, ".js"), path => `<script type="text/javascript" src="${path}"></script>`).join("")}
		  </body>
		</html>
	`);
  });

  app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("App Started ==> Open http://localhost:3000 to see the app");
  });
};