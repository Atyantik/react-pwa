import _ from "lodash";
// import React from "react";
// import ReactDOMServer from "react-dom/server";

// import Offline from "app/components/offline";
/* eslint-disable */
// ASSETS variable is inserted by dev.middleware.js & middleware.js on fly.
// So lets save it to variable
let WEB_ASSETS = ASSETS || [];

// As service worker has special scope for self lets store it to variable
const serviceWorker = self;

// VERSION is a variable injected by dev.middleware.js & middleware.js on fly. its basically hash of the
// service worker generated.
const APP_CACHE_PREFIX = "app-cache";
const CACHE_NAME = `${APP_CACHE_PREFIX}-${VERSION}`;

/* eslint-enable */

serviceWorker.addEventListener("install", function() {
  // eslint-disable-next-line
  console.log("install");
});

serviceWorker.addEventListener("activate", function() {
  // eslint-disable-next-line
  console.log("activate");
});

serviceWorker.addEventListener("fetch", event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      // eslint-disable-next-line
      console.log(event.request.url);
      return cache.match(event.request).then(function(cachedResponse) {
        return cachedResponse || fetch(event.request).then(function(networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

serviceWorker.addEventListener("install", function(event) {
  
  // Lets cache all the web assets
  
  let assetsToDownload = [];
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(_.map(WEB_ASSETS, asset => {
        return caches.match(asset).then(response => {
          if (response) {
            // eslint-disable-next-line
            console.log("Asset found in previous cache: ", asset, response);
            return cache.put(asset, response);
          } else {
            assetsToDownload.push(asset);
            return Promise.resolve();
          }
        });
      })).then(() => {
        // eslint-disable-next-line
        console.log("New files to cache: ", assetsToDownload);
        return cache.addAll(assetsToDownload);
      }).then(() => {
        // Delete previous cache
        return caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(function(cacheName) {
              if (CACHE_NAME !== cacheName && cacheName.startsWith(APP_CACHE_PREFIX)) {
                return caches.delete(cacheName);
              }
            })
          );
        });
      });
    })
  );
});