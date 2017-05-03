import React from "react";
import { render } from "react-dom";
import _ from "lodash";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

/**
 * Bundling utilities
 */
import {
  loadModuleByUrl,
  idlePreload,
  isModuleLoaded
} from "./utils/bundler";

import { isBrowser, getRouteFromPath } from "./utils";
import { generateMeta } from "./utils/seo";

import RouteWithSubRoutes from "app/components/route/with-sub-routes";
import NotFoundPage from "app/components/error/404";
import ErrorPage from "app/components/error/500";

// Collect routes from all the routes
// loaded over time
let collectedRoutes = [];

const updateMeta = (url) => {
  "use strict";
  if (!isBrowser()) return;
  const currentRoute = getRouteFromPath(collectedRoutes, url);
  const seoData = _.get(currentRoute, "seo", {});
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
const renderRoutes = (url) => {
  "use strict";
  if (!isBrowser()) return;

  updateMeta(url);

  try {
    render((
      <Router>
        <Switch>
          {_.map(collectedRoutes, (route, i) => {
            return <RouteWithSubRoutes key={i} {...route}/>;
          })}
          <Route component={NotFoundPage}/>
        </Switch>
      </Router>
    ), document.getElementById("app"));
  } catch (err) {
    render(<ErrorPage error={err}/>, document.getElementById("app"));
  }
};

// Browser operations
const initBrowserOperations = () => {
  "use strict";

  if (!isBrowser()) return;

  // Load in respect to current path on init
  loadModuleByUrl(window.location.pathname, () => {
    renderRoutes(window.location.pathname);
    idlePreload(1000);
  });

  // Override push state
  let pushState = window.history.pushState;
  window.history.pushState = function (e, page, url) {
    pushState.apply(history, arguments);
    document.dispatchEvent(new CustomEvent("location-change", {detail: {state: e.state, url, page}}));
  };
  window.onpopstate = function(e) {
    document.dispatchEvent(new CustomEvent("location-change", {detail: { state: e.state, url: window.location.pathname}}));
  };
  document.addEventListener("location-change", (e) => {
    const { url } = e.detail;
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
  if (typeof window !== "undefined") {
    render((
      <div>Loading your route.. please wait.</div>
    ), document.getElementById("app"));
  }
};
