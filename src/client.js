import React from "react";
import { render } from "react-dom";
import _ from "lodash";
import {
  Router,
  Route
} from "react-router-dom";
import Loader from "app/components/loader";

/**
 * Bundling utilities
 */
import {
  loadModuleByUrl,
  idlePreload,
  isModuleLoaded,
  isModulePreLoaded
} from "./utils/bundler";

import { isBrowser, getRouteFromPath } from "./utils";
import { generateMeta } from "./utils/seo";

import RouteWithSubRoutes from "app/components/route/with-sub-routes";
import NotFoundPage from "app/components/error/404";
import ErrorPage from "./app/components/error/500";

// Collect routes from all the routes
// loaded over time
let collectedRoutes = [];
let history;
let showScreenLoader = false;

// Get our dom app
const domApp = isBrowser() ? document.getElementById("app"): null;

const updateMeta = (url) => {
  "use strict";
  if (!isBrowser()) return;
  const currentRoutes = getRouteFromPath(collectedRoutes, url);

  let seoData = {};
  _.each(currentRoutes, r => {
    "use strict";
    seoData = _.defaults({}, _.get(r, "seo", {}), seoData);
  });

  const allMeta = generateMeta(seoData);

  // Remove all meta tags
  const head = document.head;
  Array.from(head.getElementsByTagName("meta")).forEach(tag => tag.remove());

  let title = "";
  allMeta.forEach(meta => {
    if (meta.itemProp === "name") {
      title = meta.content;
    }
    const metaTag = document.createElement("meta");
    _.each(meta, (value, key) => {
      if (key === "itemProp")  {
        key = "itemprop";
      }
      metaTag.setAttribute(key, value);
    });
    head.appendChild(metaTag);
  });
  head.getElementsByTagName("title")[0].innerHTML = title;
};

/**
 * Render routes when routes are loaded
 */
const renderRoutes = (url, options = {}) => {

  if (!isBrowser()) return;

  const { isInitialLoad } = options;
  let promises = [];

  // Get current routes from the routes we need to load data
  const currentRoutes = getRouteFromPath(collectedRoutes, url);

  // If no routes are matching our criteria, that means we have a 404
  // else react-router is taking care of it.

  if (!currentRoutes.length) {

    // Render 404 and return
    return renderNotFoundPage();
  }
  // Preload Data
  _.each(currentRoutes, r => {

    // Load data and add it to route itself
    if (r.preLoadData) {
      promises.push((() => {

        // Pass route as reference so that we can modify it while loading data
        let returnData = r.preLoadData({route: r, match: r.match});
        if (returnData && _.isFunction(returnData.then)) {
          return returnData.then(data => {
            return r.preLoadedData = data;
          }).catch(err => {
            throw err;
          });
        }
        return r.preLoadedData = returnData;

      })());
    }
  });

  if (promises.length && !isInitialLoad) {
    showScreenLoader = true;
  }

  if (showScreenLoader) {
    // Just render all routes with showScreenLoader
    renderAllRoutes();
  }

  Promise.all(promises).then(() => {
    updateMeta(url);
    showScreenLoader = false;
    renderAllRoutes();

  }).catch(err => {
    if (!(err instanceof Error)) {
      err = new Error(err);
    }
    err.statusCode = err.statusCode || 500;
    renderErrorPage(err);
  });
};

const renderAllRoutes = () => {
  render((
    <Router history={history}>
      <Loader showScreenLoader={showScreenLoader}>
        {_.map(collectedRoutes, (route, i) => {
          return <RouteWithSubRoutes key={i} {...route} />;
        })}
      </Loader>
    </Router>
  ), domApp);
};
const renderNotFoundPage = () => {
  // render 404
  render((
    <Router history={history}>
      <Route component={NotFoundPage}/>
    </Router>
  ), domApp, () => {
    showScreenLoader = false;
  });
};

const renderErrorPage = (err) => {
  // Render 500
  render((
    <ErrorPage error={err} />
  ), domApp, () => {
    showScreenLoader = false;
  });
};

// Browser operations
const initBrowserOperations = () => {

  if (!isBrowser()) return;

  const createHistory = require("history/createBrowserHistory").default;

  history = createHistory();

  // Load in respect to current path on init
  loadModuleByUrl(window.location.pathname, () => {
    renderRoutes(window.location.pathname, {isInitialLoad: true});
    idlePreload(1000);
  });

  history.listen((location) => {
    const url = `${location.pathname}${location.search}${location.hash}`;

    if (!isModuleLoaded(url)) {

      // If route is not preloaded in background then show loader
      if(!isModulePreLoaded(url)) {
        renderAllRoutes();
      }

      loadModuleByUrl(url, () => {
        renderRoutes(url);
      });
    } else {
      renderRoutes(url);
    }
  });
};
initBrowserOperations();

/**
 * Load routes when a bundle is included,
 * this will be called from pages
 * @param routes
 */
export const updateRoutes = (routes) => {
  "use strict";
  collectedRoutes = [...routes,...collectedRoutes];
};
