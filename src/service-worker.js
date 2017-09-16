import _ from "lodash";
import React from "react";
import { Cache } from "memory-cache";
import ReactDOMServer from "react-dom/server";
import {
  deleteOldCache,
  messageAllClients,
  decodeMessage
} from "./core/utils/service-worker";
import Html from "./core/components/html";
import {
  getModuleByUrl,
  getRouteFromPath
} from "./core/utils/bundler";

/* eslint-disable */
// ASSETS variable is inserted by dev.server.js & server.js on fly.
// So lets save it to variable
// let WEB_ASSETS = ["/favicon.ico",...ASSETS] || ["/favicon.ico"];
let WEB_ASSETS = ASSETS;

// As service worker has special scope for self lets store it to variable
const serviceWorker = self;

// VERSION is a variable injected by dev.server.js & server.js on fly. its basically hash of the
// service worker generated.
const APP_CACHE_PREFIX = "app-cache";
const CACHE_NAME = `${APP_CACHE_PREFIX}-${VERSION}`;
let _GLOBALS = {};
const LOCAL_CACHE = new Cache();

const log = (...args) => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line
    console.log(...args);
  }
};

/* eslint-enable */

/**
 * On activation of service worker
 */
serviceWorker.addEventListener("activate", event => {
  log("Activating the service worker!");
  event.waitUntil(
    // Delete old cache
    deleteOldCache(CACHE_NAME, APP_CACHE_PREFIX)
    // Claim all the clients
      .then(serviceWorker.clients.claim())
      
      // Message all claimed clients that there was an update
      .then(() => messageAllClients(serviceWorker, {action: "update"}))
  );
});

/**
 * When service worker is activated
 */
serviceWorker.addEventListener("activated", () => {
  // eslint-disable-next-line
  log("Service worker activated");
});


/**
 * When a fetch request is executed
 */
serviceWorker.addEventListener("fetch", event => {
  
  log("Request: ", event.request);
  log(`Fetch: ${event.request.url}`);
  
  // If any other request than GET method is triggered,
  // then forward it to network
  const authorizationHeader = _.get(event, "request.headers", {});
  if (event.request.method !== "GET" || authorizationHeader.get("authorization")) {
    return event.respondWith(fetch(event.request).catch(ex => {
      // eslint-disable-next-line
      console.log("error from network", ex);
    }));
  }
  
  return event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      if (_.indexOf(WEB_ASSETS, event.request.url.replace(serviceWorker.location.origin, "")) !== -1) {
        
        log(`Part of assets: ${event.request.url}`);
        return cache.match(event.request).then(function(cachedResponse) {
          
          log(`Found in cached response: ${event.request.url}`);
          return cachedResponse;
        });
      }
      
      log(`Checking SW cache: ${event.request.url}`);
      
      // Check if the request if marked for Local Cache
      // eslint-disable-next-line
      const swCacheTTL = LOCAL_CACHE.get(`__TTL__${event.request.url}`);
      if (swCacheTTL && event.request.method === "GET") {
        
        // eslint-disable-next-line
        log(`has SW cache TTL: ${event.request.url} - ${LOCAL_CACHE.get(event.request.url)}`);
        const isPresentInCache = LOCAL_CACHE.get(event.request.url) !== null;
        if (isPresentInCache) {
          
          log(`Present in SW cache: ${event.request.url}`);
          return cache.match(event.request).then(function(cachedResponse) {
            
            log(`Served from SW cached response: ${event.request.url}`);
            return cachedResponse;
          });
        }
      }
      
      // eslint-disable-next-line
      console.log("Executing request from network");
      return fetch(event.request).then(function(networkResponse) {
        
        log(`Network Fetch: ${event.request.url}`);
        
        let contentType = "";
        if (networkResponse && networkResponse.headers && networkResponse.headers.get) {
          contentType = networkResponse.headers.get("content-type");
          contentType = contentType ? contentType: "";
        }
        if (
          event.request.url.indexOf("fonts.google") >= 0 ||
          contentType.indexOf("text/html") < 0
        
        ) {
          if (
            networkResponse.type === "opaque" ||
            contentType.indexOf("font") !== -1 ||
            contentType.indexOf("image") !== -1 ||
            contentType.indexOf("audio") !== -1 ||
            contentType.indexOf("video") !== -1 ||
            contentType.indexOf("plain") !== -1
          ) {
            WEB_ASSETS.push(event.request.url.replace(serviceWorker.location.origin, ""));
          }
          log(`${contentType}: ${event.request.url}`, networkResponse);
          log(`Caching: ${event.request.url}`);
          cache.put(event.request, networkResponse.clone());
        }
        
        if (swCacheTTL && event.request.method === "GET") {
          cache.put(event.request, networkResponse.clone());
          
          // eslint-disable-next-line
          log(`Adding to SW Cache: ${event.request.url}`);
          LOCAL_CACHE.put(event.request.url, true, swCacheTTL * 1000);
        }
        return networkResponse;
      }).catch(ex => {
        // eslint-disable-next-line
        console.log("Executing request from network", ex);
        
        // eslint-disable-next-line
        log(`Error while Network Fetch: ${event.request.url}`, ex);
        // Try to get response from cache
        return cache.match(event.request).then(function(cachedResponse) {
          
          // eslint-disable-next-line
          log(`Network Fetch Error so search cache: ${event.request.url}`);
          
          if (cachedResponse) {
            // eslint-disable-next-line
            log(`Network Fetch Error but found in cache: ${event.request.url}`);
            return cachedResponse;
          }
          
          // If request fails for _globals create a new dummy response automatically
          if (event.request.url.indexOf("_globals") !== -1) {
            
            // eslint-disable-next-line
            log(`Network Fetch Error for globals: ${event.request.url}`);
            return new Response(
              JSON.stringify(_GLOBALS),
              { headers: { "Content-Type": "application/json" }}
            );
          }
          
          const requestHeaders = _.get(event, "request.headers", null);
          if (requestHeaders) {
            const acceptType = requestHeaders.get("Accept");
            if (!acceptType || acceptType.indexOf("text/html") !== -1) {
              
              // eslint-disable-next-line
              log(`NETWORK ERROR: Serving offline as Accept not-defined/text-html for cache: ${event.request.url}`);
              
              return new Response(
                getOfflineHtml(),
                { headers: { "Content-Type": "text/html" }}
              );
            }
          }
          
          // eslint-disable-next-line
          log(`Nothing just throwing error: ${event.request.url}`);
          throw ex;
        });
      });
    })
  );
});

serviceWorker.addEventListener("install", function(event) {
  
  // eslint-disable-next-line
  log("Executing service worker install");
  // Lets cache all the web assets
  
  let assetsToDownload = [];
  event.waitUntil(
    Promise.all(
      [
        // Manage cache, install everything for cache
        caches.open(CACHE_NAME).then(cache => {
          return Promise.all(_.map(WEB_ASSETS, asset => {
            return caches.match(asset).then(response => {
              if (response) {
                return cache.put(asset, response);
              } else {
                assetsToDownload.push(asset);
                return Promise.resolve();
              }
            });
          })).then(() => {
            return cache.addAll(assetsToDownload);
          });
        }),
        
        // Fetch and store the _globals, that contains values for routes & all assets
        fetch("/_globals")
          .then(res => res.json())
          .then(data => {
            _GLOBALS = data;
            return Promise.resolve();
          })
      ]
    ).then(() => {
      return serviceWorker.skipWaiting();
    })
  );
});

serviceWorker.addEventListener("message", event => {
  const message = decodeMessage(event.data);
  // eslint-disable-next-line
  if (message.action && message.action === "SWCACHE_TTL_STORE") {
    LOCAL_CACHE.put(`__TTL__${message.url}`, parseInt(message.ttl, 10));
  }
});

const getOfflineHtml = (url = "/") => {
  
  let routes = _.assignIn({}, _.get(_GLOBALS, "routes", []));
  const currentRoutes = getRouteFromPath(routes, url);
  
  const allCss = _.get(_GLOBALS, "allCss", []);
  const allJs = _.get(_GLOBALS, "allJs", []);
  //
  let mod = getModuleByUrl(routes, url);
  
  /**
   * Get css generated by current route and module
   */
  const currentRouteCss = _.filter(allCss, css => {
    const fileName = css.split("/").pop();
    return !(_.startsWith(fileName, "mod-") && fileName.indexOf(mod) === -1);
  });
  
  /**
   * Get all javascript but the modules
   */
  const currentRouteJs = _.filter(allJs, js => {
    const fileName = js.split("/").pop();
    return !_.startsWith(fileName, "mod-") && !_.startsWith(fileName, "service-worker.js");
  });
  
  // Get seo details for the routes in an inherited manner
  // i.e. get seo details of parent when feasible
  let seoDetails = {};
  
  _.each(currentRoutes, r => {
    seoDetails = _.defaults({}, _.get(r, "seo", {}), seoDetails);
  });
  
  /**
   * Trying offline solution. Continue on that
   */
  
  return ReactDOMServer.renderToStaticMarkup((
    <Html
      stylesheets={currentRouteCss}
      scripts={currentRouteJs}
      seo={seoDetails}
    >
    </Html>
  ));
};