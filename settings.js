export const images = {
  useWebP: true
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
export const enableServiceWorker = true;
