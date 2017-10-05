import _ from "lodash";

import { Cache } from "memory-cache";

import {
  deleteOldCache,
  messageAllClients,
  decodeMessage,
  getOfflineHtml,
  log
} from "./utils/sw";

// As service worker has special scope for self lets store it to variable
// eslint-disable-next-line
const serviceWorker = self;

// ASSETS variable is inserted by dev.server.js & server.js on fly.
let WEB_ASSETS = serviceWorker.ASSETS || [];

// VERSION is a variable injected by dev.server.js & server.js on fly. its basically hash of the
// service worker generated.
const APP_CACHE_PREFIX = "app-cache";
const CACHE_NAME = `${APP_CACHE_PREFIX}-${serviceWorker.VERSION}`;
let _GLOBALS = {};

// New memory cache
const LOCAL_CACHE = new Cache();

// SW Cache
let SW_CACHE = null;
caches.open(CACHE_NAME).then(cache => {
  SW_CACHE = cache;
});


/**
 * On activation of service worker
 */
serviceWorker.addEventListener("activate", event => {
  log("Activating the service worker!");
  event.waitUntil(
    // Delete all old appliation cache not images or anything else
    // that is cached on the fly
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
  
  const requestUrl = event.request.url;
  
  // If any other request than GET method is triggered,
  // then forward it to network
  const requestHeaders = _.get(event, "request.headers", {});
  if (event.request.method !== "GET" || requestHeaders.get("authorization")) {
    log(`REQUEST IS NOT GET or has Authorization: ${requestUrl}`);
    return event.respondWith(fetch(event.request).catch(ex => {
      // eslint-disable-next-line
      console.log("Error from network", ex);
    }));
  }
  
  /**
   * If user is not online and is trying to request something without Accept header
   * or accept header as text/html return our offline page
   */
  if (!serviceWorker.navigator.onLine) {
    const acceptType = requestHeaders.get("Accept");
    if (!acceptType || acceptType.indexOf("text/html") !== -1) {
      
      log(`NETWORK OFFLINE: Serving offline as Accept not-defined/text-html for: ${requestUrl}`);
      return event.respondWith(new Response(
        getOfflineHtml(requestUrl),
        { headers: { "Content-Type": "text/html" }}
      ));
    }
  }
  
  // If request already part of WEB_ASSET return it immediately
  if (
    _.indexOf(
      WEB_ASSETS,
      requestUrl.replace(serviceWorker.location.origin, "")
    ) !== -1
  ) {
    log(`Part of assets: ${requestUrl}`);
    return event.respondWith(SW_CACHE.match(event.request));
  }
  
  // Check if the request if marked for Local Cache
  const swCacheTTL = LOCAL_CACHE.get(`__TTL__${requestUrl}`);
  if (swCacheTTL && event.request.method === "GET") {
    
    log(`has SW cache TTL: ${requestUrl} - ${LOCAL_CACHE.get(requestUrl)}`);
    
    const isPresentInCache = LOCAL_CACHE.get(requestUrl) !== null;
    if (isPresentInCache) {
      
      log(`Present in SW cache: ${requestUrl}`);
      return event.respondWith(SW_CACHE.match(event.request));
    }
  }
  
  // If the request is for _globals create a new dummy response automatically
  if (requestUrl.indexOf("_globals") !== -1) {
    log(`Dummy response for globals: ${event.request.url}`);
    return event.respondWith(new Response(
      JSON.stringify(_GLOBALS),
      { headers: { "Content-Type": "application/json" }}
    ));
  }
  
  
  
  return event
    .respondWith(fetch(event.request)
      .then(function(networkResponse) {
        // Let the below process run parallel
        // thus using setTimeout
        // Store the network response to cache anyhow
        SW_CACHE.put(event.request, networkResponse.clone());
        setTimeout(function() {
          
          log(`Network Fetched: ${requestUrl}`);
          let contentType = "";
          if (networkResponse && networkResponse.headers && networkResponse.headers.get) {
            contentType = networkResponse.headers.get("content-type");
            contentType = contentType ? contentType: "";
          }
          if (
            requestUrl.indexOf("fonts.google") >= 0 ||
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
              WEB_ASSETS.push(requestUrl.replace(serviceWorker.location.origin, ""));
            }
            log(`Caching: ${requestUrl}, ${contentType}`);
          }
          if (swCacheTTL && event.request.method === "GET") {
            log(`Adding to SW Cache: ${requestUrl}`);
            LOCAL_CACHE.put(requestUrl, true, swCacheTTL * 1000);
          }
        }, 10);
        
        return networkResponse;
      }).catch(ex => {
        // When network fails try to get the request from sw-cache if we did cached it.
        log(`Network Fetch Error so search cache: ${requestUrl}`);
        // Try to get response from cache
        return SW_CACHE.match(event.request).then(function(cachedResponse) {
          
          if (cachedResponse) {
            // eslint-disable-next-line
            log(`Network Fetch Error but found in cache: ${requestUrl}`);
            return cachedResponse;
          }
          // eslint-disable-next-line
          log(`Nothing just throwing error: ${event.request.url}`);
          
          throw ex;
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
            serviceWorker._GLOBALS = _GLOBALS = data;
            return Promise.resolve();
          })
      ]
    ).then(() => serviceWorker.skipWaiting())
  );
});

serviceWorker.addEventListener("message", event => {
  const message = decodeMessage(event.data);
  // eslint-disable-next-line
  if (message.action && message.action === "SWCACHE_TTL_STORE") {
    LOCAL_CACHE.put(`__TTL__${message.url}`, parseInt(message.ttl, 10));
  }
});
