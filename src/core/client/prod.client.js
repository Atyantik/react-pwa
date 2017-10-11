import _ from "lodash";
import global, {renderRoutesWrapper} from "./client";
import {hideScreenLoader, scrollToTop, showScreenLoader, updateRoutes} from "../utils/client";
import {configureRoutes, getModuleByUrl, idlePreload, isModuleLoaded, loadModuleByUrl} from "../utils/bundler";
import {renderNotFoundPage} from "../utils/renderer";
import {injectAsyncReducers} from "../store";
import ApiInstance from "../libs/api";


// Check if current browser/client supports service worker
const supportsServiceWorker = !!_.get(window, "navigator.serviceWorker", false);

// Add update routes globally
((w) =>{
  
  w.__updatePage = ({ routes, bundleKey, reducers }) => {
    const routesloadEvent = new CustomEvent("routesload");
    injectAsyncReducers(global.store, reducers);
    updateRoutes({
      routes: configureRoutes([{default: routes, bundleKey: bundleKey}]),
      collectedRoutes: global.collectedRoutes
    });
    
    w.dispatchEvent(routesloadEvent);
  };
  
  w.__renderRoutes = () => {
    renderRoutesWrapper({url: window.location.pathname});
  };
  
})(window);

const updateByUrl = (url) => {
  // Show screen loader asap
  !global.isInitialLoad && showScreenLoader(global.store);
  
  const module = getModuleByUrl(url);
  
  if (!module) {
    // If no module found for the route simple ask to render it as it will display
    // 404 page
    return renderNotFoundPage({
      history: global.history,
      renderRoot: global.renderRoot,
      url: url,
      routes: [],
      store: global.store
    }, () => {
      !global.isInitialLoad && hideScreenLoader(global.store);
      scrollToTop();
    });
  }
  
  if (isModuleLoaded(url, global.collectedRoutes)) {
    return renderRoutesWrapper({ url });
  }
  // Load module, as the module load automatically triggers __renderRoutes,
  // it should just work fine
  loadModuleByUrl(url);
};

global.unlisten = global.history.listen( location => {
  
  // Set the record for last changed url
  global.previousUrl = location.pathname;
  
  if (window["ignoreHistoryChange"]) {
    window["ignoreHistoryChange"] = null;
    delete window["ignoreHistoryChange"];
    return false;
  }
  updateByUrl(location.pathname);
  
  // Execute onPageChange Event
  global.onPageChange && _.isFunction(global.onPageChange) && global.onPageChange();
});

global.previousUrl = window.location.pathname;

/**
 * Service worker configuration
 */
if (!global.isSWInitialized && supportsServiceWorker) {
  const serviceWorker = _.get(window, "navigator.serviceWorker", {
    register: async () => Promise.reject("Browser does not support service workers!")
  });
  
  // Register service worker
  serviceWorker.register("/sw.js", {scope: "/"})
    .then(reg => {
      
      // Inform API that it can now accept sw cache global
      ApiInstance.setState("SW_ENABLED", true);
      reg.onupdatefound = function() {
        let installingWorker = reg.installing;
        installingWorker.onstatechange = function() {
          switch (installingWorker.state) {
            case "activated":
              // eslint-disable-next-line
              console.log("Updated service worker");
              break;
          }
        };
      };
    })
    .catch(err => {
      // eslint-disable-next-line
      console.log("Cannot register Service Worker: ", err);
    });
  
  // @todo handle messaging via service worker
  if (serviceWorker.addEventListener) {
    serviceWorker.addEventListener("message", (event) => {
      let message = event.data;
      try {
        message = JSON.parse(event.data);
      } catch (ex) {
        if (_.isString(event.data)) {
          message = {
            message: event.data
          };
        }
      }
      /**
       * @todo Enable messaging via Service worker
       */
      // do nothing with messages as of now
      // eslint-disable-next-line
      console.log(message);
    });
  }
  global.isSWInitialized = true;
}

loadModuleByUrl(global.previousUrl, () => {
  // Start preloading data if service worker is not
  // supported. We can cache data with serviceWorker
  !supportsServiceWorker && idlePreload(5000);
});