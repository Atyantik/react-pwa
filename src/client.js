import createHistory from "history/createBrowserHistory";
import configureStore from "core/store";

/**
 * Client utilities
 */
import {
  renderRoutes,
  updateRoutes,
  isRelatedRoute,
  showScreenLoader
} from "./core/utils/client";

/**
 * Bundling utilities
 */
import {
  loadModuleByUrl,
  idlePreload,
  isModuleLoaded,
  isModulePreLoaded,
} from "./core/utils/bundler";

const hot = !!module.hot;

// Set a namespace-d global
let global = {};
if (hot && typeof window !== "undefined") {
  global = window["__GLOBALS"] || {};
  window["__GLOBALS"] = global;
}

// Collect routes from all the routes
// loaded over time
global.collectedRoutes = global.collectedRoutes || [];

// Create enhanced history with
global.history = global.history || createHistory();

// Create redux store
global.store = global.store || configureStore({
  history: global.history,
});

// Store previous url
global.previousUrl = global.previousUrl || null;

// Store state if we are working with history change
global.isHistoryChanging = global.isHistoryChanging || false;


// Get our dom app
global.renderRoot = global.renderRoot || document.getElementById("app");

const renderRoutesWrapper = ({
  url = global.previousUrl,
}) => {
  return renderRoutes({
    url,
    store: global.store,
    history: global.history,
    renderRoot: global.renderRoot,
    collectedRoutes: global.collectedRoutes
  }).then(() => {
    global.previousUrl = url;
  }).catch((ex) => {
    // eslint-disable-next-line
    console.log(ex);
  });
};

if (global.unlisten) global.unlisten();

global.unlisten = global.history.listen((location, type) => {

  global.isHistoryChanging = true;

  // Listen to history change and load modules accordingly
  const url = `${location.pathname}${location.search}${location.hash}`;

  if (!isModuleLoaded(url)) {

    // If route is not pre-loaded in background then show loader
    if(!isModulePreLoaded(url)) {
      // Let me module load till then show the loader
      // show loader
      if (global.previousUrl && global.previousUrl !== url) {
        showScreenLoader(global.store);
      }
    }

    loadModuleByUrl(url, () => {
      renderRoutesWrapper({
        url,
      }).then(() => {
        global.isHistoryChanging = false;
      });
    });

  } else {
    if (
      (type && type.toUpperCase() === "POP") ||
      !isRelatedRoute(global.previousUrl, url)
    ) {
      renderRoutesWrapper({
        url,
      }).then(() => {
        global.isHistoryChanging = false;
      });
    }
  }
});

// Add update routes globally
((w) =>{
  w.__updateRoutes = ({ routes }) => {
    const routesloadEvent = new CustomEvent("routesload");

    updateRoutes({ routes, collectedRoutes: global.collectedRoutes });
    w.dispatchEvent(routesloadEvent);
  };

  if (hot) {
    w.__renderRoutes = () => {
      if (!global.isHistoryChanging) {
        renderRoutesWrapper({
          url: global.previousUrl
        });
      }
    };
  }
})(window);

global.previousUrl = window.location.pathname;
loadModuleByUrl(global.previousUrl, () => {
  idlePreload(5000);
});

if (hot) module.hot.accept();
