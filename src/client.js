import _ from "lodash";
import createHistory from "history/createBrowserHistory";

import storage from "lib/storage";
import api from "lib/api";
/**
 * Rendering utilities
 */
import {
  renderNotFoundPage,
  renderErrorPage,
  renderRoutesByUrl,
  getPreloadDataPromises
} from "./utils/renderer";

/**
 * Bundling utilities
 */
import {
  loadModuleByUrl,
  idlePreload,
  isModuleLoaded,
  isModulePreLoaded,
  getRouteFromPath,
} from "./utils/bundler";
import { generateMeta } from "./utils/seo";
import { generateStringHash } from "./utils";

// Collect routes from all the routes
// loaded over time
let collectedRoutes = [];
const history = createHistory();
let renderedUrlHash = null;
let previousUrl = null;

// Get our dom app
const renderRoot = document.getElementById("app");

const updateMeta = (url) => {

  const currentRoutes = getRouteFromPath(collectedRoutes, url);

  let seoData = {};
  _.each(currentRoutes, r => {
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
 * Render routes for the provided url
 * @param url
 * @param options
 */
const renderRoutes = (
  url,
  options = {
    showScreenLoader: false,
    isInitialLoad: false
  }) => {

  // Get current routes from the routes we need to load data
  const currentRoutes = getRouteFromPath(collectedRoutes, url);

  // If no routes are matching our criteria, that means we have a 404
  // else react-router is taking care of it.

  if (!currentRoutes.length) {
    return renderNotFoundPage({
      history: history,
      renderRoot: renderRoot,
      url: url
    });
  }

  // Preload Data
  let promises = getPreloadDataPromises({
    routes: currentRoutes,
    storage,
    api
  });

  if (options.showScreenLoader) {
    // Show loader
    return renderRoutesByUrl({
      routes: currentRoutes,
      history: history,
      renderRoot: renderRoot,
      url: url,
      showScreenLoader: true,
    });
  }

  if (promises.length && !options.isInitialLoad) {
    renderRoutesByUrl({
      routes: currentRoutes,
      history: history,
      renderRoot: renderRoot,
      url: url,
      showScreenLoader: true,
    });
  }

  Promise.all(promises).then(() => {
    options.showScreenLoader = false;
    updateMeta(url);
    renderRoutesByUrl({
      routes: currentRoutes,
      history: history,
      renderRoot: renderRoot,
      url: url,
      showScreenLoader: false,
    });

    // Keep track of url loaded
    previousUrl = url;
    renderedUrlHash = getRouteFromPath(url);

  }).catch(err => {
    if (!(err instanceof Error)) {
      err = new Error(err);
    }
    err.statusCode = err.statusCode || 500;
    renderErrorPage({
      history: history,
      renderRoot: renderRoot,
      error: err
    });
  });
};

const getRouteHashFromPath = (url) => {
  return generateStringHash(
    JSON.stringify(
      getRouteFromPath(collectedRoutes, url)
    )
  );
};

history.listen((location, type) => {

  // Listen to history change and load modules accordingly
  const url = `${location.pathname}${location.search}${location.hash}`;

  if (!isModuleLoaded(url)) {

    // If route is not pre-loaded in background then show loader

    if(!isModulePreLoaded(url)) {
      // Let me module load till then show the loader
      // show loader
      if (previousUrl && previousUrl !== url) {
        renderRoutes(previousUrl, {showScreenLoader: true});
      }
    }

    loadModuleByUrl(url, () => {
      renderRoutes(url);
    });
  } else {
    // If the module is pre-loaded then simple render current
    // routes.
    const urlRouteHash = getRouteHashFromPath(url);

    // Render if there is a POP in history or
    // the module loading is other than the current displayed module
    if (type && type.toUpperCase() === "POP") {
      renderRoutes(url);
    } else if (urlRouteHash !== renderedUrlHash) {
      renderRoutes(url);
    }
  }
});

/**
 * Load routes when a bundle is included,
 * this will be called from pages
 * @param routes
 */
const updateRoutes = (routes) => {
  collectedRoutes = [...collectedRoutes, ...routes];
};

// Add update routes globally
((w) =>{
  w.__updateRoutes = (...args) => {
    const routesloadEvent = new CustomEvent("routesload");
    updateRoutes(...args);
    w.dispatchEvent(routesloadEvent);
    if (module && module.hot) {
      module.hot.accept();
    }
  };
})(window);

// Load in respect to current path on init
loadModuleByUrl(window.location.pathname, () => {
  renderRoutes(window.location.pathname, { isInitialLoad: true });
  idlePreload(5000);
});
