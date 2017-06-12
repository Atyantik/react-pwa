import _ from "lodash";
import { matchPath } from "react-router";
import api from "lib/api";
import {
  isBrowser,
  loadScript,
  loadStyle,
  generateStringHash
} from "./utils";

let globalsLoaded = false;
let globals = {};

/**
 * Load globals through the express route, we don't want to increase size of page
 * adding it to script tag
 * @returns {Promise.<*>}
 */
export const loadGlobals = async () => {
  if (!isBrowser()) {
    return Promise.reject();
  }

  if (globalsLoaded) {
    return Promise.resolve();
  }

  return api.fetch(`${location.protocol}//${location.host}/_globals`)
    .then(responseBody => {
      _.each(responseBody, (value, key) => {
        _.set(globals, key, value);
      });
      globalsLoaded = true;
    });
};

/**
 * Get requested module by specifying path
 * @todo >>> Improve function to cover the scenario where no bundleKey for child is
 * present but present for parent route. In such case make the bundleKey of parent
 * as the Module we are searching for
 * <<<
 * @param routes
 * @param pathname
 * @returns {boolean}
 */
export const getModuleByUrl = (routes, pathname) => {
  let moduleName = false;

  // Iterate through all the routes to get
  // the correct module name for the path
  _.each(routes, route => {

    // If already found a module name then return
    if (moduleName) return;

    // if current route is abstract then try to
    // search for sub routes
    if (_.get(route, "abstract", false)) {
      if (_.get(route, "routes", []).length) {
        moduleName = getModuleByUrl(route.routes, pathname);
      }
    } else if(matchPath(pathname, route)) {
      moduleName = route.bundleKey;
    }
  });
  return moduleName;
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
 * Keep track of modules loaded
 * @type {Array}
 */
let modulesLoaded = [];
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
    let currentMod = getModuleByUrl(globals.routes, url);

    let isLoaded = false;
    const afterLoad = () => {
      isLoaded = true;
      modulesLoaded.push(currentMod);
      cb();
      window.removeEventListener("routesload", afterLoad);
    };
    window.addEventListener("routesload", afterLoad);

    // Try to load after 5 second even if script does not call event
    const extendedAfterLoad = () => {
      setTimeout(() => {
        if (!isLoaded) {
          afterLoad();
        }
      }, 5000);
    };

    let listOfPromises = [];
    _.each(globals.allCss, css => {
      if (scriptBelongToMod(css, currentMod)) {
        listOfPromises.push(loadStyle(css));
      }
    });

    _.each(globals.allJs, js => {
      if (scriptBelongToMod(js,currentMod)) {
        listOfPromises.push(loadScript(js));
      }
    });
    Promise.all(listOfPromises).then(extendedAfterLoad).catch(extendedAfterLoad);
  });
};

/**
 * Check if module for the url is loaded or not
 * @param url
 * @returns {boolean}
 */
export const isModuleLoaded = (url) => {
  "use strict";
  let mod = getModuleByUrl(globals.routes, url);
  return _.indexOf(modulesLoaded, mod) !== -1;
};

/**
 * List of hash of files pre-loaded
 * @type {Array}
 */
let preLoadedFiles = [];

export const isModulePreLoaded = url => {

  let modulePreLoaded = true;
  let mod = getModuleByUrl(globals.routes, url);


  _.each(globals.allCss, css => {
    if (scriptBelongToMod(css, mod)) {
      let scriptHash = generateStringHash(css, "PRELOAD").toString();
      if (_.indexOf(preLoadedFiles, scriptHash) === -1) {
        modulePreLoaded = false;
      }
    }
  });

  _.each(globals.allJs, js => {
    if (scriptBelongToMod(js, mod)) {
      let scriptHash = generateStringHash(js, "PRELOAD").toString();
      if (_.indexOf(preLoadedFiles, scriptHash) === -1) {
        modulePreLoaded = false;
      }
    }
  });
  return modulePreLoaded;
};
/**
 * Get list of pending pre-loads files
 * @returns {[*,*]}
 */
const getPendingPreloadFiles = () => {
  "use strict";
  let pendingCss = [];
  let pendingJs = [];

  _.each(globals.allCss, css => {
    let cssHash = generateStringHash(css, "PRELOAD").toString();
    if (
      css.indexOf("mod-") !== -1 &&
      _.indexOf(preLoadedFiles, cssHash) === -1 &&
      _.indexOf(preLoadingFiles, cssHash) === -1) {
      pendingCss.push(css);
    }
  });

  _.each(globals.allJs, js => {
    let jsHash = generateStringHash(js, "PRELOAD").toString();
    if (
      js.indexOf("mod-") !== -1 &&
      _.indexOf(preLoadedFiles, jsHash) === -1 &&
      _.indexOf(preLoadingFiles, jsHash) === -1) {
      pendingJs.push(js);
    }
  });
  return [
    pendingCss,
    pendingJs,
  ];
};

/**
 * Preload a script, compatible with ie 6,7,8+ and all major browsers
 * @param path
 * @param fn
 * @param scope
 */
const preLoadingFiles = [];
export const preLoadFile = (path, fn = () => {}, scope) => {

  if (!isBrowser()) {
    // If not a browser then do not allow loading of
    // css file, return with success->false
    fn.call( scope, false );
  }

  const pathHash = generateStringHash(path, "PRELOAD").toString();

  if (_.indexOf(preLoadedFiles, pathHash) !== -1) {
    // Give a success callback
    fn.call( scope || window, true);
  }
  if (_.indexOf(preLoadingFiles, pathHash) !== -1) {
    return;
  }
  preLoadingFiles.push(pathHash);
  const isIE = navigator.appName.indexOf("Microsoft") === 0;
  let s, r;
  if (isIE) {
    // Load for internet explorer
    r = false;
    s = new Image();
    s.width = 0;
    s.height = 0;
    s.id = pathHash;
    s.style="display:none;";
    s.onload = s.onreadystatechange = function() {
      if(!r && (!this.readyState || this.readyState === "complete")) {
        r = true;
        preLoadedFiles.push(pathHash);
        fn.call( scope || window, true, s );
      }
    };
    s.onerror = function() {
      preLoadedFiles.push(pathHash);
      fn.call( scope || window, true, s );
    };
    s.src = path;
    return s;
  }
  s = document.createElement("object");
  s.width = 0;
  s.height = 0;
  s.style = "position:fixed; left:-200vw;top: -200vh; visibility:hidden;";
  s.id = pathHash;
  s.onload = s.onreadystatechange = function() {
    if (!r && (!this.readyState || this.readyState == "complete")) {
      r = true;
      preLoadedFiles.push(pathHash);
      fn.call( scope || window, true, s );
    }
  };
  s.onerror = function() {
    preLoadedFiles.push(pathHash);
    fn.call( scope || window, true, s );
  };
  s.data = path;
  document.body.appendChild(s);
  return s;
};

/**
 * Detect idle time for user and download assets accordingly
 * @param idleTime
 */
let timerEventInitialized  = false;
export const idlePreload = (idleTime = 10000) => {
  if (!isBrowser()) return;

  const concurrentLoading = 1;

  let timerInt;

  let loadingFile = false;
  let loadedFiles = 0;
  const preload = () => {
    if (loadingFile) {
      return;
    }

    const [pendingCss, pendingJs] = getPendingPreloadFiles();

    // Beauty is everything load css first
    // and then other files
    // BUT Load one file at a time
    let filesToBeLoaded = [];
    let isCss = false;

    if (pendingCss && pendingCss.length) {
      filesToBeLoaded = _.take(pendingCss, 1);
      isCss = true;
    } else if(pendingJs && pendingJs.length) {
      filesToBeLoaded = _.take(pendingJs, 1);
    }

    loadingFile = !!filesToBeLoaded.length;
    _.each(filesToBeLoaded, path => {
      preLoadFile(path, () => {
        loadedFiles++;

        if (isCss) {
          // Load stylesheet right away
          loadStyle(path);
        }
        // If files loaded change loadingFile to false
        if (loadedFiles >= concurrentLoading) {
          loadedFiles = 0;
          loadingFile = false;
          timerInt = setTimeout(preload, 100);
        }
      });
    });
  };

  const resetTimer = _.debounce(() => {
    clearTimeout(timerInt);
    timerInt = setTimeout(() => {
      preload();
    }, idleTime);  // time is in milliseconds
  }, 10);

  timerInt = setTimeout(() => {
    preload();
  }, idleTime);  // time is in milliseconds

  if (!timerEventInitialized) {
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer; // catches touchscreen presses
    window.onclick = resetTimer;     // catches touchpad clicks
    window.onscroll = resetTimer;    // catches scrolling with arrow keys
    window.onkeypress = resetTimer;
    timerEventInitialized = true;
  }
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

/**
 * Get route from path
 * @param routes
 * @param path
 */
export const getRouteFromPath = (routes, path) => {
  let selectedRoute = [];

  _.each(routes, route => {
    if (_.get(route, "abstract", false)) {
      // If abstract is present then Try to see if sub-routes matches
      // the path.

      if (route.routes && route.routes.length) {
        // If subRoutes are found to match the provided path,
        // that means we can add the abstract path to list of
        // our routes
        const subRoutes = getRouteFromPath(route.routes, path);

        if (subRoutes.length) {
          // Add abstract path to our list in expected order and then
          // add sub routes accordingly
          selectedRoute.push(_.assignIn(route, {match: null}));
          selectedRoute.push(...subRoutes);
        }
      }
    } else {

      // If route.path is found and route is not abstract
      // match with the path and if it matches try to match sub-routes
      // as well
      const match = matchPath(path, route);
      if(match) {
        selectedRoute.push(_.assignIn(route, {match: match}));
        if (route.routes && route.routes.length) {
          selectedRoute.push(...getRouteFromPath(route.routes, path));
        }
      }
    }
  });
  return selectedRoute;
};
