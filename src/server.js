import express from "express";
import _ from "lodash";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter, Route, matchPath } from "react-router";

import assets from "./config/assets";
import { extractFilesFromAssets } from "utils/bundler";
import { generateStringHash } from "utils";

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

export const startServer = (purge = false) => {

  app.get("*", (req, res) => {
    if (purge) {
      purgeCache("./routes");
    }
    let routes  = require("./routes").default;
    const { assets } = req;
    const context = {};

    /**
     * Get all css and js files for mapping
     */
    const allCss = extractFilesFromAssets(assets, ".css");
    const allJs = extractFilesFromAssets(assets, ".js");

    let mod = getModuleFromPath(routes, req.path);
    const currentModRoutes = _.filter(routes, route => {
      return route.bundleKey === mod;
    });
    const currentRouteCss = _.filter(allCss, css => {
      const fileName = css.split("/").pop();
      return !(_.startsWith(fileName, "mod-") && fileName.indexOf(mod) === -1);
    });

    mod = "tirth";
    const currentRouteJs = _.filter(allJs, js => {
      const fileName = js.split("/").pop();
      return !(_.startsWith(fileName, "mod-") && fileName.indexOf(mod) === -1);
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
        ${_.map(currentRouteCss, path => `<link rel="stylesheet" id="${generateStringHash(path, "CSS")}" href="${path}" />`).join("")}
        <script type="text/javascript">
          window.routes = ${JSON.stringify(routes)};
          window.allCss = ${JSON.stringify(allCss)};
          window.allJs = ${JSON.stringify(allJs)};
        </script>
		  </head>
		  <body>
		    <div id="app">${html}</div>
		    ${_.map(currentRouteJs, path => `<script type="text/javascript" id="${generateStringHash(path, "JS")}" src="${path}"></script>`).join("")}
		  </body>
		</html>
	`);
  });

  console.log("Listen in progress");
  app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("App Started ==> Open http://localhost:3000 to see the app");
  });
};

/**
 * Removes a module from the cache
 */
function purgeCache(moduleName) {
  // Traverse the cache looking for the files
  // loaded by the specified module name
  searchCache(moduleName, function (mod) {
    delete require.cache[mod.id];
  });

  // Remove cached paths to the module.
  // Thanks to @bentael for pointing this out.
  Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
    if (cacheKey.indexOf(moduleName)>0) {
      delete module.constructor._pathCache[cacheKey];
    }
  });
};

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
function searchCache(moduleName, callback) {
  // Resolve the module identified by the specified name
  var mod = require.resolve(moduleName);

  // Check if the module has been resolved and found within
  // the cache
  if (mod && ((mod = require.cache[mod]) !== undefined)) {
    // Recursively go over the results
    (function traverse(mod) {
      // Go over each of the module's children and
      // traverse them
      mod.children.forEach(function (child) {
        traverse(child);
      });

      // Call the specified callback providing the
      // found cached module
      callback(mod);
    }(mod));
  }
};
