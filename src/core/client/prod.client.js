import _ from "lodash";
import global, {renderRoutesWrapper} from "./client";
import {hideScreenLoader, scrollToTop, showScreenLoader, updateRoutes} from "../utils/client";
import {getModuleByUrl, idlePreload, isModuleLoaded, loadModuleByUrl} from "../utils/bundler";
import {renderNotFoundPage} from "../utils/renderer";
import {injectAsyncReducers} from "../store";
import {enableServiceWorker} from "../../../settings";


// Check if current browser/client supports service worker
const supportsServiceWorker = !!_.get(window, "navigator.serviceWorker", false);

// Add update routes globally
((w) =>{
  
  w.__updatePage = ({ routes, reducers }) => {
    const routesloadEvent = new CustomEvent("routesload");
    injectAsyncReducers(global.store, reducers);
    updateRoutes({ routes, collectedRoutes: global.collectedRoutes });
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
});

global.previousUrl = window.location.pathname;
loadModuleByUrl(global.previousUrl, () => {
  // Start preloading data if service worker is not
  // supported. We can cache data with serviceWorker
  (!supportsServiceWorker || !enableServiceWorker) && idlePreload(5000);
});