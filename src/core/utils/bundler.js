import _ from "lodash";
import { matchPath } from "react-router";
import fetch from "universal-fetch";
import {
  isBrowser,
  loadScript,
  loadStyle,
  generateStringHash
} from "./utils";

let globalsLoaded = false;

let globals = {
  routes: []
};

export const setGlobalRoutes = (routes) => {
  globals.routes = _.cloneDeep(routes);
};
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
    return Promise.resolve(globals);
  }
  
  return fetch(`${location.protocol}//${location.host}/_globals`)
    .then(res => res.json())
    .then(responseBody => {
      _.each(responseBody, (value, key) => {
        _.set(globals, key, value);
      });
      globalsLoaded = true;
      return globals;
    })
    .catch(ex => {
      // eslint-disable-next-line
      console.log("Cannot load _globals: ", ex);
    });
};

/**
 * Get requested module by specifying path
 * @param pathname
 * @param routes
 * @returns {boolean}
 */
export const getModuleByUrl = (pathname, routes = globals.routes) => {
  let moduleName = false;
  
  // Try to get module if exact path is matched
  
  /**
   * Iterate through all the routes to get
   * the correct module name for the path.
   * This iteration is for exact match with pathname
   * thus giving more priority to /about/about-us to more than
   * /:something/:sub-something
   */
  _.each(routes, route => {
    
    // If already found a module name then return
    if (moduleName) return;
    
    // if current route is abstract then try to
    // search for sub routes
    if (_.get(route, "abstract", false)) {
      if (_.get(route, "routes", []).length) {
        moduleName = getModuleByUrl(pathname, route.routes);
      }
    } else if(route.path === pathname) {
      moduleName = route.bundleKey;
    }
  });
  
  /**
   * If no module name is found via match of react-router
   * i.e. using matchPath
   */
  if (!moduleName) {
    // Iterate through all the routes to get
    // the correct module name for the path
    _.each(routes, route => {
      
      // If already found a module name then return
      if (moduleName) return;
      
      // if current route is abstract then try to
      // search for sub routes
      if (_.get(route, "abstract", false)) {
        if (_.get(route, "routes", []).length) {
          moduleName = getModuleByUrl(pathname, route.routes);
        }
      } else if(matchPath(pathname, route)) {
        moduleName = route.bundleKey;
      }
    });
  }
  
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
    cb();
    return;
  }
  
  loadGlobals().then(() => {
    
    const currentMod = getModuleByUrl(url, globals.routes);
    
    //eslint-disable-next-line
    debugger;
    
    // location is an object like window.location
    // Load in respect to path
    let isLoaded = false;
    const afterLoad = () => {
      isLoaded = true;
      modulesLoaded.push(currentMod);
      cb(currentMod);
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
export const isModuleLoaded = (url, routes = globals.routes) => {
  let mod = getModuleByUrl(url, routes);
  return _.indexOf(modulesLoaded, mod) !== -1;
};

/**
 * List of hash of files pre-loaded
 * @type {Array}
 */
let preLoadedFiles = [];
/**
 * Get list of pending pre-loads files
 * @returns {[*,*]}
 */
const getPendingPreloadFiles = () => {
  let pendingCss = [];
  let pendingJs = [];
  
  _.each(globals.allCss, css => {
    let cssHash = generateStringHash(css, "PRELOAD");
    if (
      css.indexOf("mod-") !== -1 &&
      _.indexOf(preLoadedFiles, cssHash) === -1 &&
      _.indexOf(preLoadingFiles, cssHash) === -1) {
      pendingCss.push(css);
    }
  });
  
  _.each(globals.allJs, js => {
    let jsHash = generateStringHash(js, "PRELOAD");
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
  
  const pathHash = generateStringHash(path, "PRELOAD");
  
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
    if (!r && (!this.readyState || this.readyState === "complete")) {
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
 * Get routes from path
 * @param routes
 * @param path
 */
export const getRouteFromPath = (path, routes = globals.routes) => {
  let selectedRoute = [];
  
  const changeMatchToNull =(route) => {
    if (route.match) {
      route.match = null;
    }
    if (route.routes && route.routes.length) {
      _.each(route.routes, subRoute => changeMatchToNull(subRoute));
    }
  };
  
  const bundleKey = getModuleByUrl(path, routes);
  
  _.each(routes, route => {
    if (route.bundleKey !== bundleKey) return;
    if (_.get(route, "abstract", false)) {
      // If abstract is present then Try to see if sub-routes matches
      // the path.
      
      if (route.routes && route.routes.length) {
        // If subRoutes are found to match the provided path,
        // that means we can add the abstract path to list of
        // our routes
        const subRoutes = getRouteFromPath(path, route.routes);
        
        if (subRoutes.length) {
          // Add abstract path to our list in expected order and then
          // add sub routes accordingly
          selectedRoute.push(_.assignIn(route, {match: null}));
          selectedRoute.push(...subRoutes);
        } else {
          changeMatchToNull(route);
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
          selectedRoute.push(...getRouteFromPath(path, route.routes));
        }
      } else {
        changeMatchToNull(route);
      }
    }
  });
  // Do not repeat paths even if the provided routes to the function has repeated paths
  // Thus make them unique by path
  return _.uniqBy(selectedRoute, "path");
};

/**
 * Get end/exact route for path
 * @param routes
 * @param path
 */
export const getExactRouteFromPath = (path, routes = globals.routes) => {
  const currentRoutes = getRouteFromPath(path, routes);
  return _.find(currentRoutes, r => _.get(r, "match.isExact", false));
};



const addBundleKeyToRoutes = (routes, bundleKey = "") => {
  if (!_.isArray(routes)) {
    routes.bundleKey = bundleKey;
    _.isArray(routes.routes) && addBundleKeyToRoutes(routes.routes, bundleKey);
  } else {
    _.each(routes, route => {
      route.bundleKey = bundleKey;
      _.isArray(route.routes) && addBundleKeyToRoutes(route.routes, bundleKey);
    });
  }
  return routes;
};

export const configureRoutes = (routes) => {
  let finalRoutes = [];
  _.each(routes, route => {
    const bundleKey = route.bundleKey || "";
    finalRoutes = [
      ...finalRoutes,
      ...addBundleKeyToRoutes(route.default, bundleKey)
    ];
  });
  return finalRoutes;
};