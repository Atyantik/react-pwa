import _ from "lodash";
import createHistory from "history/createBrowserHistory";
import configureStore from "../store";
import * as customClient from "../../client";

/**
 * Network actions for monitoring network changes (online/offline)
 */
import {
  NETWORK_STATE_ONLINE,
  NETWORK_STATE_OFFLINE,
  networkOnline,
  networkOffline
} from "../libs/network/action";

/**
 * Client utilities
 */
import {
  renderRoutes
} from "../utils/client";

/**
 * Get API instance
 */
import ApiInstance from "../libs/api";

/**
 * Settings
 */
import {
  enableServiceWorker
} from "../../../settings";

// Polyfill for CustomEvent
(function(w) {
  if ( typeof w.CustomEvent === "function" ) return false; //If not IE
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    let evt = document.createEvent( "CustomEvent" );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }
  CustomEvent.prototype = w.Event.prototype;
  w.CustomEvent = CustomEvent;
})(window);

const __development = process.env.NODE_ENV === "development";

const hot = !!module.hot && __development;

// Set a namespace-d global when in development mode
let global = {};
if (hot && typeof window !== "undefined") {
  global = window["__GLOBALS"] || global;
  window["__GLOBALS"] = global;
}

// Custom reducers
let { reduxReducers, reduxInitialState } = customClient;
if (!reduxReducers) reduxReducers = null;
if (!reduxInitialState) reduxInitialState = {};


// Collect routes from all the routes
// loaded over time
global.collectedRoutes = global.collectedRoutes || [];

// Create enhanced history with
window.__history = global.history = global.history || createHistory();

// Create redux store
global.store = global.store || configureStore({
  history: global.history,
  
  initialState: _.assignIn({}, {
    network: {
      state: window.navigator.onLine ? NETWORK_STATE_ONLINE: NETWORK_STATE_OFFLINE,
    }
  }, reduxInitialState),
  ...(reduxReducers ? { reducers: reduxReducers} : {})
});

// check if application is loaded initially or its just a hot update from HMR
global.isInitialLoad = typeof global.isInitialLoad === Boolean ? global.isInitialLoad: true;

// Check if service worker already initialized
global.isSWInitialized = typeof global.isSWInitialized === Boolean ? global.isSWInitialized: false;

// Set previous url
global.previousUrl = global.previousUrl || "";

// Check if current browser/client supports service worker
const supportsServiceWorker = !!_.get(window, "navigator.serviceWorker", false);

// Monitor online and offline state of application
/**
 * Need to check for online/offline status
 */
const updateNetworkStatus = (status) => {
  global.store.dispatch((status === NETWORK_STATE_ONLINE ? networkOnline(): networkOffline()));
};
const setNetworkOnline = () => updateNetworkStatus(NETWORK_STATE_ONLINE);
const setNetworkOffline = () => updateNetworkStatus(NETWORK_STATE_OFFLINE);

// Just in case OR with HMR if client.js is included twice lets remove the
// eventListener and then add it again
window.removeEventListener("online",  setNetworkOnline);
window.addEventListener("online",  setNetworkOnline);

window.removeEventListener("offline", setNetworkOffline);
window.addEventListener("offline", setNetworkOffline);

/** Api requires store to check the network status */
ApiInstance.setStore(global.store);

/**
 * Service worker configuration
 */
if (!global.isSWInitialized && enableServiceWorker && supportsServiceWorker) {
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

// Unregister previously registered service worker if any when enableServiceWorker = false
if (supportsServiceWorker && !enableServiceWorker) {
  window.navigator.serviceWorker.getRegistrations().then(registrations => {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Get our dom app
global.renderRoot = global.renderRoot || document.getElementById("app");

export const renderRoutesWrapper = ({ url = global.previousUrl }) => {

  return renderRoutes({
    url: url,
    store: global.store,
    history: global.history,
    renderRoot: global.renderRoot,
    collectedRoutes: global.collectedRoutes,
    global: {
      isInitialLoad: global.isInitialLoad
    }
  }).then(() => {
    global.isInitialLoad = false;
  }).catch((ex) => {
    // eslint-disable-next-line
    console.log(ex);
    global.isInitialLoad = false;
  });
};

export default global;