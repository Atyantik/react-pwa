import express from "express";
import _ from "lodash";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter, Route, matchPath } from "react-router";

import assets from "./config/assets";
import routes from "./routes";

// Create and express js application
const app = express();

// Set x-powered-by to false (security issues)
_.set(app, "locals.settings.x-powered-by", false);

// Add public path to server from public folder
// This is used when doing server loading
app.use("/public", express.static("public"));

// Middleware to add assets to request
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

export const getModuleFromPath = (routes, path) => {
  "use strict";
  let mod = false;

  _.each(routes, route => {
    if(matchPath(path, route)) {
      mod = route.bundleKey;
    }
  });
  return mod;
};

export default app;

export const startServer = () => {
  "use strict";

  app.get("*", (req, res) => {
    const { assets } = req;
    const context = {};

    /**
     * Get all css and js files for mapping
     */
    const allCss = extractFiles(assets, ".css");
    const allJs = extractFiles(assets, ".js");

    let mod = getModuleFromPath(routes, req.path);
    const currentModRoutes = _.filter(routes, route => {
      return route.bundleKey === mod;
    });
    const currentRouteCss = _.filter(allCss, css => {
      const fileName = css.split("/").pop();
      return !(_.startsWith(fileName, "mod-") && fileName.indexOf(mod) === -1)
    });
    mod = "tirth";
    const currentRouteJs = _.filter(allJs, js => {
      const fileName = js.split("/").pop();
      return !(_.startsWith(fileName, "mod-") && fileName.indexOf(mod) === -1)
    });

    const html = ReactDOMServer.renderToString((
      <StaticRouter
        location={req.path}
        context={context}
      >
        <div>
          {_.map(currentModRoutes, (route, index) => {
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
        ${_.map(currentRouteCss, path => `<link rel="stylesheet" id="${path}" href="${path}" />`).join("")}
        <script type="text/javascript">
          window.routes = ${JSON.stringify(routes)};
          window.allCss = ${JSON.stringify(allCss)};
          window.allJs = ${JSON.stringify(allJs)};
        </script>
		  </head>
		  <body>
		    <div id="app">${html}</div>
		    ${_.map(currentRouteJs, path => `<script type="text/javascript" id="${path}" src="${path}"></script>`).join("")}
		  </body>
		</html>
	`);
  });

  app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("App Started ==> Open http://localhost:3000 to see the app");
  });
};