import _ from "lodash";
import global, {renderRoutesWrapper} from "./client";
import {animateFadeIn, animateFadeOut, hideScreenLoader, showScreenLoader} from "../utils/client";
import {getModuleByUrl, setGlobalRoutes} from "../utils/bundler";
import {renderNotFoundPage} from "../utils/renderer";
import Routes from "src/routes";

console.log(!_.isEmpty(global.collectedRoutes) ? global.collectedRoutes : Routes);
global.collectedRoutes = _.cloneDeep(!_.isEmpty(global.collectedRoutes) ? global.collectedRoutes : Routes);
setGlobalRoutes(global.collectedRoutes);

const updateByUrl = (url) => {
  return new Promise(resolve => {
    animateFadeOut(global).then(() => {
      // Show screen loader asap
      !global.isInitialLoad && showScreenLoader(global.store);
    
      const module = getModuleByUrl(url, global.collectedRoutes);
    
      if (!module) {
        // If no module found for the route simple ask to render it as it will display
        // 404 page
        renderNotFoundPage({
          history: global.history,
          renderRoot: global.renderRoot,
          url: url,
          routes: [],
          store: global.store
        }, () => {
          !global.isInitialLoad && hideScreenLoader(global.store);
          animateFadeIn(global);
        });
        return resolve();
      }
      return renderRoutesWrapper({ url }).then(() => {
        animateFadeIn(global);
        resolve();
      });
    });
  });
};

if (global.unlisten) global.unlisten();
global.unlisten = global.history.listen( location => {
  // Set the record for last changed url
  global.previousUrl = location.pathname;
  
  if (window["ignoreHistoryChange"]) {
    window["ignoreHistoryChange"] = null;
    delete window["ignoreHistoryChange"];
    return false;
  }
  updateByUrl(location.pathname).then(() => {
    global.onPageChange && _.isFunction(global.onPageChange) && global.onPageChange();
  });
});

updateByUrl(window.location.pathname);

if (module.hot) { module.hot.accept(); }