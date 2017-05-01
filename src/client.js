import React from "react";
import { render } from "react-dom";
import _ from "lodash";
import {
  BrowserRouter as Router,
  Route
} from "react-router-dom";

import { isBrowser } from "./utils";
import { loadUrl, idlePreload, isModuleLoaded } from "./utils/bundler";

// Collect routes from all the routes
// loaded over time
let collectedRoutes = [];

/**
 * Render routes when routes are loaded
 */
const renderRoutes = () => {
  "use strict";
  if (typeof window !== "undefined") {
    render((
      <Router>
        <div>
          {_.map(collectedRoutes, (route, index) => {
            return <Route key={index} exact={route.exact} path={route.path} render={(props) => {
              return <route.component {...props} />;
            }} />;
          })}
        </div>
      </Router>
    ), document.getElementById("app"));
    hotReload();
  }
};

// Browser operations
const initBrowserOperations = () => {
  "use strict";

  if (!isBrowser()) return;

  // Load in respect to current path on init
  loadUrl(window.location.pathname, () => {
    renderRoutes();
    idlePreload(5000);
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

    console.log(isModuleLoaded(url));
    if (!isModuleLoaded(url)) {
      renderRouteLoader();
      loadUrl(url, () => {
        renderRoutes();
      });
    } else {
      renderRoutes();
    }
  });
};
initBrowserOperations();


// Try hot reloading, though its not happening right now
const hotReload = (callback) => {
  "use strict";
  if (module && module.hot) {
    module.hot.accept((err, result) => {
      if (!err) {
        callback();
      }
    });
  } else {
    callback();
  }
};

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
    hotReload(() => {
      render((
        <div>Loading your route.. please wait.</div>
      ), document.getElementById("app"));
    });
  }
};
