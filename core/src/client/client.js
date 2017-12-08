import _ from "lodash";
import createHistory from "history/createBrowserHistory";
import configureStore from "../store";
import * as customClient from "src/client";
/**
 * Network actions for monitoring network changes (online/offline)
 */
import {NETWORK_STATE_OFFLINE, NETWORK_STATE_ONLINE, networkOffline, networkOnline} from "../libs/network/action";
/**
 * Client utilities
 */
import {animateFadeIn, renderRoutes} from "../utils/client";
/**
 * Get API instance
 */
import ApiInstance from "../libs/api";

// Polyfill for CustomEvent & window.location.origin
(function(w) {
  // Adding origin to non-supported browsers
  if (!w.location.origin) {
    w.location.origin = w.location.protocol + "//" + w.location.hostname + (w.location.port ? ":" + w.location.port: "");
  }
  
  // Adding custom event
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
let { reduxReducers, reduxInitialState, onPageChange } = customClient;
if (!reduxReducers) reduxReducers = null;
if (!reduxInitialState) reduxInitialState = {};

// Provide onPageChange to globals
global.onPageChange = onPageChange;

// Collect routes from all the routes
// loaded over time
global.collectedRoutes = global.collectedRoutes || (!_.isEmpty(customClient.routes) ? customClient.routes : []);

// Create enhanced history with
global.history = global.history || createHistory();

// Create redux store
global.store = global.store || configureStore({
  history: global.history,
  
  initialState: _.assignIn({}, {
    network: {
      state: window.navigator.onLine ? NETWORK_STATE_ONLINE: NETWORK_STATE_OFFLINE,
    },
    router: {
      location: {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      }
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

// Get our dom app
global.renderRoot = global.renderRoot || document.getElementById("app");

export const renderRoutesWrapper = ({ url = global.previousUrl }) => {

  return renderRoutes({
    url: url,
    store: global.store,
    history: global.history,
    renderRoot: global.renderRoot,
    collectedRoutes: global.collectedRoutes,
    options: {
      isInitialLoad: global.isInitialLoad
    }
  }).then(() => {
    global.isInitialLoad = false;
    animateFadeIn(global);
  }).catch((ex) => {
    // eslint-disable-next-line
    console.log(ex);
    global.isInitialLoad = false;
    animateFadeIn(global);
  });
};

export default global;