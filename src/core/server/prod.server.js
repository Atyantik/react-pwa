import crypto from "crypto";
import hsts from "hsts";
import cookieParser from "cookie-parser";
import React from "react";
import ReactDOMServer from "react-dom/server";
import serveFavicon from "serve-favicon";
import express from "express";
import glob from "glob";
import path from "path";
import fs from "fs";
import _ from "lodash";
import compression from "compression";
import {infiniteCache, pageCache} from "../libs/cache/memory";
import assets from "../../config/assets";

import {
  StaticRouter as ServerRouter,
  Route as ServerRoute,
  Switch as ServerSwitch,
} from "react-router";

import {
  getModuleByUrl,
  getRouteFromPath
} from "../utils/bundler";


import createHistory from "history/createMemoryHistory";
import {
  getPreloadDataPromises,
  renderErrorPage,
  renderNotFoundPage,
  renderRoutesByUrl
} from "../utils/renderer";

import Storage from "../libs/storage/storage.server";
import Api from "../libs/api/api";
import configureStore from "../store";

import Html from "../components/html";
import Routes from "../../routes";
import {extractFilesFromAssets} from "../utils/utils";
import {publicDirName} from "../../../directories";
import config from "../../config";


/**
 * Set current dir for better computation
 * @type {String}
 */
let currentDir = __dirname;

// Set appropriate currentDir when build and run in production mode
const filename = _.find(process.argv, arg => {
  return arg.indexOf("/server.js") !== -1;
});
if (filename) {
  currentDir = path.dirname(filename);
}

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


const getErrorComponent = (err, store) => {
  if (!(err instanceof Error)) {
    err = new Error(err);
  }
  err.statusCode = err.statusCode || 500;
  return renderErrorPage({
    render: false,
    Router: ServerRouter,
    Route: ServerRoute,
    Switch: ServerSwitch,
    error: err,
    store
  });
};

const app = express();

// Extract cookies from the request, making it available as
// Object request.cookie.user etc..
app.use(cookieParser());

// use compression for all requests
app.use(compression());


// Add hsts settings for secure site
// mageAge: Must be at least 18 weeks to be approved by Google, but we are setting it to 1 year
const hstsSettings = _.get(config, "hsts", {
  enabled: true,
  maxAge: 31536000,
  includeSubDomains: true, // Must be enabled to be approved by Google
  preload: true,
});
// Enable hsts for https sites
if (hstsSettings.enabled) {
  app.use(hsts(_.assignIn(hstsSettings, {
    setIf: function (req) {
      return req.secure || (req.headers["x-forwarded-proto"] === "https");
    }
  })));
}



const cacheTime = 86400000*30;     // 30 days;
app.use("/public", express.static(path.join(currentDir, "public"), {
  maxAge: cacheTime
}));

// Disable x-powered-by (security issues)
app.use(function (req, res, next) {
  res.removeHeader("X-Powered-By");
  next();
});

// Middleware to add assets to request
try {
  app.use(function (req, res, next) {
    req.assets = assets;
    next();
  });
} catch (ex) {
  // Do not do anything here.
  // cause the assets are most probably handled by webpack
}


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

// Only if service worker is enabled then emit manifest.json
app.get("/manifest.json", infiniteCache(), (req, res) => {
  
  const { pwa } = config;
  
  const availableSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const icons = availableSizes.map(size => {
    return {
      "src": require(`../../resources/images/pwa/icon-${size}x${size}.png`),
      sizes: `${size}x${size}`
    };
  });
  _.set(pwa, "icons", icons);
  
  res.setHeader("Content-Type", "application/manifest+json");
  // No cache header
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.setHeader("Expires", "-1");
  res.setHeader("Pragma", "no-cache");
  
  return res.send(JSON.stringify(pwa));
});

/**
 * Try to get the public dir
 */
try {
  const faviconPath = path.join(currentDir, publicDirName, "favicon.ico");
  if (path.resolve(faviconPath)) {
    app.use(serveFavicon(faviconPath));
  }
} catch (ex) {
  // eslint-disable-next-line
  console.log(`Please add favicon @ ${publicDirName}/favicon.ico for improved performance.`);
}

/**
 * Send global data to user, as we do not want to send it via
 * window object
 */
app.get("/_globals", infiniteCache(), (req, res) => {
  
  // Never ever cache this request
  const {assets} = req;
  const allCss = extractFilesFromAssets(assets, ".css");
  const allJs = extractFilesFromAssets(assets, ".js");
  
  res.setHeader("Content-Type", "application/json");
  // No cache header
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.setHeader("Expires", "-1");
  res.setHeader("Pragma", "no-cache");
  
  return res.send(JSON.stringify({
    routes: Routes,
    allCss,
    allJs
  }));
});

app.get("*", pageCache(_.cloneDeep(Routes)), (req, res) => {
  
  let routes = _.cloneDeep(Routes);
  
  // Get list of assets from request
  const {assets} = req;
  
  /**
   * Get all css and js files for mapping
   */
  const allCss = extractFilesFromAssets(assets, ".css");
  const allJs = extractFilesFromAssets(assets, ".js");
  
  let mod = getModuleByUrl(req.path, routes);
  const currentRoutes = getRouteFromPath(req.path, routes);
  const storage = new Storage(req, res);
  const api = new Api({storage});
  
  /**
   * Get css generated by current route and module
   */
  const currentRouteCss = _.filter(allCss, css => {
    const fileName = css.split("/").pop();
    return !(_.startsWith(fileName, "mod-") && fileName.indexOf(mod) === -1);
  });
  
  /**
   * Get all javascript but the modules
   */
  const currentRouteJs = _.filter(allJs, js => {
    const fileName = js.split("/").pop();
    return !_.startsWith(fileName, "mod-") && !_.startsWith(fileName, "service-worker.js");
  });
  
  const context = {
    storage,
    api,
    pathname: req.path,
  };
  
  let html, statusCode = 200;
  
  // Get seo details for the routes in an inherited manner
  // i.e. get seo details of parent when feasible
  let seoDetails = {};
  let routerComponent = null;
  
  const history = createHistory();
  // Create redux store
  let store = configureStore({
    history,
    // Combine initial state with our default state
    initialState: _.assignIn({}, _.get(res, "locals.reduxInitialState", {})),
    
    // Add reducers if provided in locals
    ...( typeof res.locals["reduxReducers"] !== "undefined" ? {
      reducers: res.locals["reduxReducers"]
    } : {})
  });
  
  try {
    // Also preload data required when asked
    let promises = getPreloadDataPromises({
      routes: currentRoutes,
      storage,
      api,
      store
    });
    
    Promise.all(promises).then(() => {
      
      // Once all data has been pre-loaded and processed
      _.each(currentRoutes, r => {
        seoDetails = _.defaults({}, _.get(r, "seo", {}), seoDetails);
      });
      
      if (!currentRoutes.length) {
        routerComponent = renderNotFoundPage({
          render: false,
          Router: ServerRouter,
          url: req.path,
          Switch: ServerSwitch,
          Route: ServerRoute,
          context: context,
          store,
        });
      } else {
        routerComponent = renderRoutesByUrl({
          render: false,
          Router: ServerRouter,
          url: req.path,
          Switch: ServerSwitch,
          Route: ServerRoute,
          context: context,
          routes: currentRoutes,
          storage,
          store,
          api
        });
      }
      
      html = ReactDOMServer.renderToString((
        <Html
          stylesheets={currentRouteCss}
          scripts={currentRouteJs}
          seo={seoDetails}
        >
          {routerComponent}
        </Html>
      ));
      
      statusCode = context.status || 200;
      if (context.url) {
        // Somewhere a `<Redirect>` was rendered
        return res.status(statusCode).redirect(context.url);
      }
      return res.status(statusCode).send(`<!DOCTYPE html>${html}`);
      
    }).catch((err) => {
      routerComponent = getErrorComponent(err, store);
      html = ReactDOMServer.renderToString((
        <Html
          stylesheets={currentRouteCss}
          scripts={currentRouteJs}
        >
          {routerComponent}
        </Html>
      ));
      return res.status(err.statusCode || 500).send(`<!DOCTYPE html>${html}`);
    });
    // Get data to load for all the routes
  } catch (err) {
    routerComponent = getErrorComponent(err, store);
    html = ReactDOMServer.renderToString((
      <Html
        stylesheets={currentRouteCss}
        scripts={currentRouteJs}
      >
        {routerComponent}
      </Html>
    ));
    return res.status(err.statusCode || 500).send(`<!DOCTYPE html>${html}`);
  }
});

export default app;