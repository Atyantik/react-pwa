import _ from "lodash";
import fetch from "universal-fetch";
import {
  isBrowser,
  loadScript,
  loadStyle,
  preLoadScript,
  generateStringHash,
  getModuleByPathname
} from "./utils";

/**
 * Load url specific modules & trigger call backs on load
 * @param url
 * @param cb
 */
export const loadModuleByUrl = (url, cb = () => {}) => {
  if (!isBrowser()) {
    return;
  }
  loadGlobals().then(() => {
    // location is an object like window.location
    // Load in respect to path
    let currentMod = getModuleByPathname(window.routes, url);

    let listOfPromises = [];
    _.each(window.allCss, css => {
      if (scriptBelongToMod(css,currentMod)) {
        listOfPromises.push(loadStyle(css));
      }
    });

    _.each(window.allJs, js => {
      if (scriptBelongToMod(js,currentMod)) {
        listOfPromises.push(loadScript(js));
      }
    });
    Promise.all(listOfPromises).then(cb).catch(cb);
  });
};

export const loadGlobals = async () => {
  "use strict";
  if (!isBrowser()) {
    return Promise.reject();
  }

  if (window.__GLOBALS_LOADED__) {
    return Promise.resolve();
  }

  return fetch("/_globals")
    .then(res => res.json())
    .then(responseBody => {
      _.each(responseBody, (value, key) => {
        _.set(window, key, value);
      });
      window.__GLOBALS_LOADED__ = true;
    });
};

/**
 * Check if script requested belongs to the modules specified
 * check if public/build/mod-home-cat-1982Aasdd12ascgt3.bundle.js
 * belongs to home module or home-cat module
 *
 * @param script
 * @param mod
 * @returns {boolean}
 */
export const scriptBelongToMod = (script, mod) => {
  const finalFileName = script.split("/").pop();
  if (!finalFileName) {
    return false;
  }
  let fileNameWithoutHash = finalFileName.split(".");
  if (fileNameWithoutHash.length < 4) {
    return false;
  }
  // Remove extension
  fileNameWithoutHash.pop();

  // Remove "bundle"
  fileNameWithoutHash.pop();

  // remove "hash"
  fileNameWithoutHash.pop();

  // Join with "." again
  fileNameWithoutHash = fileNameWithoutHash.join(".");

  return fileNameWithoutHash === `mod-${mod}`;
};

/**
 * Check if module for the url is loaded or not
 * @param url
 * @returns {boolean}
 */
export const isModuleLoaded = (url) => {
  "use strict";
  let mod = getModuleByPathname(window.routes, url);

  let loaded = true;

  _.each(window.allCss, css => {
    if (css.indexOf(`mod-${mod}`) !== -1 && !document.getElementById(`${generateStringHash(css, "CSS")}`)) {
      loaded = false;
    }
  });

  _.each(window.allJs, js => {
    if (js.indexOf(`mod-${mod}`) !== -1  && !document.getElementById(`${generateStringHash(js, "JS")}`)) {
      loaded = false;
    }
  });
  return loaded;
};

export const isModulePreLoaded = url => {
  "use strict";
  let mod = getModuleByPathname(window.routes, url);

  let loaded = true;

  _.each(window.allCss, css => {
    if (css.indexOf(`mod-${mod}`) !== -1 && !document.getElementById(`${generateStringHash(css, "PRELOAD")}`)) {
      loaded = false;
    }
  });

  _.each(window.allJs, js => {
    if (js.indexOf(`mod-${mod}`) !== -1  && !document.getElementById(`${generateStringHash(js, "PRELOAD")}`)) {
      loaded = false;
    }
  });
  return loaded;
};

/**
 * Get list of pending preloads
 * @returns {[*,*]}
 */
const getPendingPreloadModules = () => {
  "use strict";
  let pendingCss = [];
  let pendingJs = [];

  _.each(window.allCss, css => {
    if (css.indexOf("mod-") !== -1 && !document.getElementById(generateStringHash(css, "PRELOAD"))) {
      pendingCss.push(css);
    }
  });

  _.each(window.allJs, js => {
    if (js.indexOf("mod-") !== -1 && !document.getElementById(generateStringHash(js,"PRELOAD"))) {
      pendingJs.push(js);
    }
  });
  return [
    pendingCss,
    pendingJs,
  ];
};

/**
 * Detect idle time for user and download assets accordingly
 * @param idleTime
 */
export const idlePreload = (idleTime = 10000) => {
  if (!isBrowser()) return;

  let timerInt;

  const preload = () => {
    "use strict";
    let [pendingCss, pendingJs] = getPendingPreloadModules();
    let css = _.head(pendingCss);
    let js = _.head(pendingJs);
    if (css) {
      preLoadScript(css, () => {
        idlePreload(idleTime);
      });
    }
    if (js) {
      preLoadScript(js, () => {
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

/**
 * Extract files from given assets collection
 * @param assets
 * @param ext
 * @returns {[*,*,*]}
 */
export const extractFilesFromAssets = (assets, ext = ".js") => {
  let common = [];
  let dev = [];
  let other = [];

  const addToList = (file) => {

    let fileName = file.split("/").pop();

    if (_.startsWith(fileName, "common")) {
      common.push(file);
      return;
    }
    if (_.startsWith(fileName, "dev")) {
      dev.push(file);
      return;
    }
    other.push(file);
  };

  _.each(assets, asset => {
    "use strict";
    if (_.isArray(asset) || _.isObject(asset)) {
      _.each(asset, file => {
        if (_.endsWith(file, ext)) {
          addToList(file);
        }
      });
    } else {
      if (_.endsWith(asset, ext)) {
        addToList(asset);
      }
    }
  });

  return [
    ...common.sort(),
    ...dev.sort(),
    ...other.sort(),
  ];

};
