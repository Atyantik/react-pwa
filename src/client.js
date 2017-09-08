/* eslint-disable */
import _ from "lodash";
import createHistory from "history/createBrowserHistory";
import configureStore, { injectAsyncReducers } from "core/store";

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

/**
 * Settings
 */
import {
  enableServiceWorker
} from "../settings";

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

// Store state if we are working with history change
global.isInitialLoad = typeof global.isInitialLoad === Boolean ? global.isInitialLoad: true;

global.isSWInitialized = typeof global.isSWInitialized === Boolean ? global.isSWInitialized: false;

// Check for service worker
const hasServiceWorker = !!_.get(window, "navigator.serviceWorker", false);

if (!global.isSWInitialized && enableServiceWorker) {
  const serviceWorker = _.get(window, "navigator.serviceWorker", {
    register: async () => Promise.reject("Browser does not support service workers!")
  });
  serviceWorker.register("/sw.js", {scope: "/"}).catch(err => {
    // eslint-disable-next-line
    console.log("Cannot register Service Worker: ", err);
  });
  global.isSWInitialized = true;
}


// Get our dom app
global.renderRoot = global.renderRoot || document.getElementById("app");

const renderRoutesWrapper = (
  {
    url = global.previousUrl,
  }
) => {
  return renderRoutes({
    url,
    store: global.store,
    history: global.history,
    renderRoot: global.renderRoot,
    collectedRoutes: global.collectedRoutes,
    options: {
      isInitialLoad: global.isInitialLoad
    }
  }).then(() => {
    global.previousUrl = url;
    global.isInitialLoad = false;
  }).catch((ex) => {
    // eslint-disable-next-line
    console.log(ex);
  });
};

const updateByUrl = (url) => {
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
        global.history.timeTravel = false;
      });
    });
    
  } else {
    if (
      !isRelatedRoute(global.previousUrl, url)
    ) {
      renderRoutesWrapper({
        url,
      }).then(() => {
        global.isHistoryChanging = false;
        global.history.timeTravel = false;
      });
    }
  }
};

if (global.unsubscribe) global.unsubscribe();

global.unsubscribe = global.store.subscribe(() => {
  
  const state = global.store.getState();
  const url = _.get(state, "router.location.pathname", global.previousUrl);
  const historyUrl = _.get(global.history, "location.pathname", url);
  
  if (url !== global.previousUrl) {
    global.previousUrl = url;
    if (historyUrl !== url) {
      global.history.timeTravel = true;
      global.history.replace(url, state);
    }
    global.isHistoryChanging = true;
    updateByUrl(url);
  }
});

// Add update routes globally
((w) =>{
  w.__updatePage = ({ routes, reducers }) => {
    const routesloadEvent = new CustomEvent("routesload");
    injectAsyncReducers(global.store, reducers);
    updateRoutes({ routes, collectedRoutes: global.collectedRoutes });
    w.dispatchEvent(routesloadEvent);
  };
  
  // if (hot) {
  w.__renderRoutes = () => {
    if (!global.isHistoryChanging) {
      renderRoutesWrapper({
        url: global.previousUrl
      });
    }
  };
  // }
})(window);

global.previousUrl = window.location.pathname;
loadModuleByUrl(global.previousUrl, () => {
  // Start preloading data if service worker is not
  // supported. We can cache data with serviceWorker
  !hasServiceWorker && idlePreload(5000);
});

if (hot) module.hot.accept();
