import { matchPath } from "react-router";
import _ from "lodash";
import {
  isBrowser,
  loadScript,
  loadStyle,
} from "./utils";

/**
 * Get requested module by specifying path
 * @param routes
 * @param pathname
 * @returns {boolean}
 */
export const getModuleByPathname = (routes, pathname) => {
  "use strict";
  let moduleName = false;
  _.each(routes, route => {
    if(matchPath(pathname, route)) {
      moduleName = route.bundleKey;
    }
  });
  return moduleName;
};

/**
 * Load url specific modules & trigger call backs on load
 * @param url
 * @param cb
 */
export const loadUrl = (url, cb = () => {}) => {
  if (!isBrowser()) {
    return;
  }
  // location is an object like window.location
  // Load in respect to path
  let currentMod = getModuleByPathname(window.routes, url);

  _.each(window.allCss, css => {
    if (css.indexOf(`mod-${currentMod}`) !== -1) {
      loadStyle(css);
    }
  });

  _.each(window.allJs, js => {
    if (js.indexOf(`mod-${currentMod}`) !== -1) {
      loadScript(js, () => {
        cb(js);
      });
    }
  });
};

export const isModuleLoaded = (url) => {
  "use strict";
  let mod = getModuleByPathname(window.routes, url);

  let loaded = true;

  _.each(window.allCss, css => {
    if (css.indexOf(`mod-${mod}`) !== -1 && !document.getElementById(css)) {
      loaded = false;
    }
  });

  _.each(window.allJs, js => {
    if (js.indexOf(`mod-${mod}`) !== -1  && !document.getElementById(js)) {
      loaded = false;
    }
  });
  return loaded;
};

const getPendingModules = () => {
  "use strict";
  let pendingCss = [];
  let pendingJs = [];

  _.each(window.allCss, css => {
    if (css.indexOf("mod-") !== -1 && !document.getElementById(css)) {
      pendingCss.push(css);
    }
  });

  _.each(window.allJs, js => {
    if (js.indexOf("mod-") !== -1 && !document.getElementById(js)) {
      pendingJs.push(js);
    }
  });
  return [
    pendingCss,
    pendingJs,
  ];
};

export const idlePreload = (idleTime = 1000) => {
  if (!isBrowser()) return;

  let timerInt;

  const preload = () => {
    "use strict";
    let [pendingCss, pendingJs] = getPendingModules();
    let css = _.head(pendingCss);
    let js = _.head(pendingJs);
    if (css) {
      loadStyle(css, () => {
        console.log(`Preloading complete for ${css}`);
        idlePreload(idleTime);
      });
    }
    if (js) {
      console.log(`Preloading ${js}`);
      loadScript(js, () => {
        console.log(`Preloading complete for ${js}`);
        idlePreload(idleTime);
      });
    }
  };
  const resetTimer = _.debounce(() => {
    clearTimeout(timerInt);
    timerInt = setTimeout(preload, idleTime);  // time is in milliseconds
  }, 10);

  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer; // catches touchscreen presses
  window.onclick = resetTimer;     // catches touchpad clicks
  window.onscroll = resetTimer;    // catches scrolling with arrow keys
  window.onkeypress = resetTimer;
};