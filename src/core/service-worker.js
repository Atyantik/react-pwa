import _ from "lodash";

import WorkboxSW from "./libs/workbox-sw";
// As service worker has special scope for self lets store it to variable
// eslint-disable-next-line
const serviceWorker = self;

// ASSETS variable is inserted by dev.server.js & server.js on fly.

let WEB_ASSETS = serviceWorker.ASSETS || [];
const workboxSW = new WorkboxSW({skipWaiting: true, clientsClaim: true});

workboxSW.precache(_.map(WEB_ASSETS, asset => { return {url: asset};}));

workboxSW
  .router
  .registerRoute(
    /.*\.(css|bmp|tif|ttf|docx|woff2|js|pict|tiff|eot|xlsx|jpg|csv|eps|woff|xls|jpeg|doc|ejs|otf|pptx|gif|pdf|swf|svg|ps|ico|pls|midi|svgz|class|png|ppt|mid|webp|jar)/,
    workboxSW.strategies.cacheFirst()
  );

workboxSW
  .router
  .registerRoute(
    /_globals$/,
    workboxSW.strategies.cacheFirst()
  );