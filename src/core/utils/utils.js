import componentMap from "../../config/classMap";
/**
 * Check if current script is running in browser or not
 * @returns {boolean}
 */

export const isBrowser = () => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Load stylesheet
 * @param path
 * @param fn
 * @param scope
 * @returns {Promise}
 */
export const loadStyle = (path, fn = () => {
}, scope) => {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      // If not a browser then do not allow loading of
      // css file, return with success->false
      fn.call(scope, false);
      reject("Cannot call from server. Function can be executed only from browser");
    }
    const pathHash = generateStringHash(path, "CSS");

    // Do not load css if already loaded
    const previousLink = document.getElementById(pathHash.toString());
    if (previousLink) {
      fn.call(scope, true, previousLink);
      resolve();
      return previousLink;
    }

    const head = document.getElementsByTagName("head")[0], // reference to document.head for appending/ removing link nodes
      link = document.createElement("link"); // create the link node

    link.setAttribute("href", path);
    link.setAttribute("id", pathHash.toString());
    link.setAttribute("rel", "stylesheet");
    link.async = true;
    link.defer = true;
    link.setAttribute("type", "text/css");

    let sheet, cssRules;
    // get the correct properties to check for depending on the browser
    if ("sheet" in link) {
      sheet = "sheet";
      cssRules = "cssRules";
    }
    else {
      sheet = "styleSheet";
      cssRules = "rules";
    }

    // start checking whether the style sheet has successfully loaded
    let interval_id = setInterval(function () {
        try {
          // SUCCESS! our style sheet has loaded
          if (link[sheet] && link[sheet][cssRules].length) {

            // clear the counters
            clearInterval(interval_id);

            // Declared after "," so it will be available in Interval
            clearTimeout(timeout_id);

            // fire the callback with success == true
            fn.call(scope || window, true, link);
            resolve();
          }
        } catch (e) {
          // Do nothing, timeout will handle it for fail after 15 seconds
        }
      }, 10),
      // how often to check if the stylesheet is loaded

      // start counting down till fail
      timeout_id = setTimeout(function () {
        // clear the counters
        clearInterval(interval_id);
        clearTimeout(timeout_id);

        // since the style sheet didn't load, remove the link node from the DOM
        head.removeChild(link);
        // fire the callback with success == false
        fn.call(scope || window, false, link);
        reject("Timeout, unable to load css file");
        // how long to wait before failing
      }, 15000);

    // insert the link node into the DOM and start loading the style sheet

    head.appendChild(link);
    // return the link node;
    return link;
  });
};

/**
 * Load javascript file by path
 * @param path
 * @param fn
 * @param scope
 * @returns {Promise}
 */
export const loadScript = (path, fn = () => {
}, scope) => {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      // If not a browser then do not allow loading of
      // css file, return with success->false
      fn.call(scope, false);
      reject("Cannot call from server. Function can be executed only from browser");
      return;
    }
    const pathHash = generateStringHash(path, "JS");

    // Do not load script if already loaded
    const previousLink = document.getElementById(pathHash);
    if (previousLink) {
      fn.call(scope, true, previousLink);
      resolve();
      return previousLink;
    }

    let s, r, t;
    r = false;
    s = document.createElement("script");
    s.type = "text/javascript";
    s.id = pathHash;
    s.src = path;
    s.defer = true;
    s.onload = s.onreadystatechange = function () {
      if (!r && (!this.readyState || this.readyState === "complete")) {
        r = true;
        fn.call(scope || window, true, s);
        resolve();
      }
    };
    t = document.getElementsByTagName("script")[0];
    t.parentNode.insertBefore(s, t);
    return s;
  });
};


/**
 * Simple numeric hash of a string, used for non-secure usage only
 * @param str
 * @param namespace
 * @returns {number}
 */
export const generateStringHash = (str, namespace) => {
  namespace = namespace || "";
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  str = `${namespace}_${str}`;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Get component via componentMap in settings
 * @param componentReference
 */
export const getComponent = (componentReference) => {
  const component = componentMap[componentReference] || false;
  if (!component) throw new Error(`Cannot find component with reference ${componentReference}`);
  return component;
};
