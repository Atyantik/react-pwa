import _ from "lodash";

import WorkboxSW from "workbox-sw";
// As service worker has special scope for self lets store it to variable
// eslint-disable-next-line
const serviceWorker = self;

// ASSETS variable is inserted by dev.server.js & server.js on fly.

let WEB_ASSETS = serviceWorker.ASSETS || [];
const workboxSW = new WorkboxSW({clientsClaim: true});

workboxSW.precache(_.map(WEB_ASSETS, asset => { return {url: asset};}));
/**
 * Set up a route that will match any URL requested that starts with /public/.
 * Handle those requests using a cache-first strategy.
 */
workboxSW.router.registerRoute(
  /^\/public\//,
  workboxSW.strategies.cacheFirst()
);
workboxSW.router.registerRoute(
  /^(?!\/public\/)/,
  workboxSW.strategies.networkFirst()
);

