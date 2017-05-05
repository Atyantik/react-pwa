import React from "react";
import { render } from "react-dom";
import _ from "lodash";
import {
  Router,
  Switch,
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

  const currentRoutes = getRouteFromPath(collectedRoutes, url);
  // Preload Data
  _.each(currentRoutes, r => {
    "use strict";

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
  if (promises.length && !isInitialLoad) renderRouteLoader();

  Promise.all(promises).then(() => {
    "use strict";
    // Update SEO MetaData
    updateMeta(url);

    render((
      <Router history={history}>
        <Switch>
          {_.map(collectedRoutes, (route, i) => {
            return <RouteWithSubRoutes key={i} {...route}/>;
          })}
          <Route component={NotFoundPage}/>
        </Switch>
      </Router>
    ), document.getElementById("app"), () => {
      "use strict";
      window.__URL_LOADING__ = false;
    });
  }).catch(err => {
    "use strict";
    if (!(err instanceof Error)) {
      err = new Error(err);
    }
    err.statusCode = err.statusCode || 500;
    render((
      <ErrorPage error={err} />
    ), document.getElementById("app"), () => {
      "use strict";
      window.__URL_LOADING__ = false;
    });
  });
};

// Browser operations
const initBrowserOperations = () => {
  "use strict";

  if (!isBrowser()) return;

  const createHistory = require("history/createBrowserHistory").default;
  history = createHistory();

  // Load in respect to current path on init
  loadModuleByUrl(window.location.pathname, () => {
    renderRoutes(window.location.pathname, {isInitialLoad: true});
    idlePreload(1000);
  });

  history.listen((location, action) => {
    const url = `${location.pathname}${location.search}${location.hash}`;

    // If route is not preloaded in background then show loader
    if (!isModuleLoaded(url)) {
      renderRouteLoader();
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
  collectedRoutes = [...collectedRoutes, ...routes];
};
const renderRouteLoader = () => {
  "use strict";
  if (!isBrowser()) return;
  window.__URL_LOADING__ = true;
  render(<Loader />, document.getElementById("app"));
};
