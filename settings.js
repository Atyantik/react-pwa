export const images = {
  useWebP: true,
  allowedExtensions: [
    ".bmp",
    ".gif",
    ".jpeg",
    ".jpg",
    ".png",
    ".svg",
  ],
};

/**
 * Enabling this option will create a new file common-vendor which would contain
 * all the 3rdp party modules used anywhere.
 *
 * The drawback of turning this setting ON is when number of node_modules increases
 * the common-vendor JS file size increases
 * The benefit of using this setting is, other code splitting is comparatively less
 * so individual page JS file size decreases
 *
 * I prefer to let it stay ON and only turn it OFF when we need to use application in where
 * bandwidth & large file size is not a concern
 *
 * @type {boolean}
 */
export const isolateVendorScripts = true;

/**
 * Enable service worker for application
 * @type {boolean}
 */
export const enableServiceWorker = false;

/**
 * Enable common styles. This if some one wants to integrate a common css framework
 * as boostrap and dont want to use the customized class for them. Its also important
 * when using 3rd party css and use it directly in application
 * @type {boolean}
 */
export const enableCommonStyles = true;

/**
 * Isomorphic (Server rendering is disabled when developing app i.e. NODE_ENV = development) by default
 * This settings help you manipulate the setting, if server side rendering should be cached or not!
 *
 * Setting it to true might cause severe performance issues
 */
export const isomorphicDevelopment = false;