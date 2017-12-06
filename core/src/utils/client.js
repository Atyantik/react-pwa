import _ from "lodash";
import { render, hydrate } from "react-dom";
import {getRouteFromPath,} from "./bundler";

import storage from "../libs/storage";
import api from "../libs/api";
import {NETWORK_STATE_OFFLINE} from "../libs/network/action";
/**
 * Rendering utilities
 */
import {
  getPreloadDataPromises,
  renderErrorPage,
  renderNotFoundPage,
  renderOfflinePage,
  renderRoutesByUrl
} from "./renderer";

import {generateMeta} from "./seo";
import {generateLinks} from "./links";
import {
  SCREEN_STATE_LOADED,
  SCREEN_STATE_PAGE_ENTER,
  SCREEN_STATE_PAGE_EXIT,
  screenLoaded,
  screenLoading,
  screenPageEnter,
  screenPageExit
} from "../components/screen/action";

// We require this cause we display screen loader as soon as there is
// url change, but if the loader function is completed in 100 milli-second then there is
// no sense in displaying the loader, rather wait for 100 milli-second and then show screen-loader
let screenLoaderTimeout = 0;
const waitTime = 100;

let DefaultRender = render;
let HydrateRender = process.env.NODE_ENV === "development" ? render: hydrate;
if (typeof HydrateRender === "undefined") {
  HydrateRender = render;
}

/**
 * Show screen loader and trigger dispatch accordingly
 * @param store
 */
export const showScreenLoader = (store) => {
  screenLoaderTimeout && clearTimeout(screenLoaderTimeout);
  screenLoaderTimeout = setTimeout(() => {
    store.dispatch(screenLoading());
    screenLoaderTimeout = 0;
  }, waitTime);
};

/**
 * Hide screen-loader
 * @param store
 */
export const hideScreenLoader = (store) => {
  screenLoaderTimeout && clearTimeout(screenLoaderTimeout);
  const state = store.getState();
  const screenState = _.get(state, "screen.state", SCREEN_STATE_LOADED);
  if (screenState === SCREEN_STATE_LOADED) return;
  store.dispatch(screenLoaded());
};

const ANIMATION_TIMEOUT = 400;
export const animateFadeIn = (global) => {
  return new Promise(resolve => {
    if (global.isInitialLoad) return resolve();
    const state = global.store.getState();
    const animationState = _.get(state, "screen.animation", SCREEN_STATE_PAGE_ENTER);
    if (animationState === SCREEN_STATE_PAGE_ENTER) return;
    global.store.dispatch(screenPageEnter());
    setTimeout(resolve, ANIMATION_TIMEOUT/2);
  });
};
export const animateFadeOut = (global) => {
  return new Promise(resolve => {
    if (global.isInitialLoad) return resolve();
    
    const state = global.store.getState();
    const animationState = _.get(state, "screen.animation", SCREEN_STATE_PAGE_ENTER);
    if (animationState === SCREEN_STATE_PAGE_EXIT) return resolve();
    
    global.store.dispatch(screenPageExit());
    setTimeout(resolve, ANIMATION_TIMEOUT/2);
  });
};


/**
 * Scroll to top for the specified route
 * @param currentRoutes
 */
export const scrollToTop = (currentRoutes = []) => {
  if (process.env.NODE_ENV === "development") {
    return;
  }
  const currExactRoute = _.find(currentRoutes, {match: {isExact: true}});
  let scrollTop = 0;
  if (currExactRoute) {
    scrollTop = _.get(currExactRoute, "scrollTop", 0);
    if (scrollTop === false) {
      return;
    }
  }
  return smoothScroll(undefined, scrollTop);
};

/**
 * Update meta-data for the specified url
 * @param routes
 */
const updateHtmlMeta = routes => {
  
  let seoData = {};
  _.each(routes, r => {
    seoData = _.defaults({}, _.get(r, "seo", {}), seoData);
  });
  
  const allMeta = generateMeta(seoData, {baseUrl: window.location.origin, url: window.location.href});
  
  // Remove all meta tags
  const head = document.head;
  let metaTags = Array.prototype.slice.call(head.getElementsByTagName("meta"));
  metaTags.forEach(tag => {
    if (tag && tag.parentNode && tag.parentNode.removeChild) {
      tag.parentNode.removeChild(tag);
    }
  });
  
  let title = "";
  _.forEach(allMeta, meta => {
    if (meta.name === "title") {
      title = meta.content;
    }
    const metaTag = document.createElement("meta");
    _.each(meta, (value, key) => {
      if (key === "itemProp") {
        key = "itemprop";
      }
      metaTag.setAttribute(key, value);
    });
    head.appendChild(metaTag);
  });
  document.title = title;
  head.getElementsByTagName("title")[0].innerHTML = title;
};


const getAttribute = (ele, attr) => {
  let result = (ele.getAttribute && ele.getAttribute(attr)) || null;
  if( !result ) {
    let attrs = ele.attributes;
    let length = attrs.length;
    for(let i = 0; i < length; i++)
      if(attrs[i].nodeName === attr)
        result = attrs[i].nodeValue;
  }
  return result;
};

const updateHeadLinks = routes => {
  
  let seoData = {};
  _.each(routes, r => {
    seoData = _.defaults({}, _.get(r, "seo", {}), seoData);
  });
  
  const allLinks = generateLinks(seoData, {baseUrl: window.location.origin, url: window.location.href});
  
  // Remove all seo links tags
  const head = document.head;
  let headLinks = Array.prototype.slice.call(head.getElementsByTagName("link"));
  headLinks.forEach(tag => {
    if (tag && tag.parentNode && tag.parentNode.removeChild) {
      const type = getAttribute(tag, "data-type");
      if(type === "seo") {
        tag.parentNode.removeChild(tag);
      }
    }
  });
  
  _.forEach(allLinks, link => {
    const linkTag = document.createElement("link");
    _.each(link, (value, key) => {
      linkTag.setAttribute(key, value);
    });
    linkTag.setAttribute("data-type", "seo");
    head.appendChild(linkTag);
  });
};


/**
 * Render routes for the provided url
 * @param url
 * @param collectedRoutes
 * @param renderRoot
 * @param store
 * @param history
 * @param options
 */
export const renderRoutes = async ({
  url,
  collectedRoutes,
  renderRoot,
  store,
  history,
  options = {
    showScreenLoader: false,
    isInitialLoad: false
  }
}) => {
  
  // Get current routes from the routes we need to load data
  const currentRoutes = getRouteFromPath(url, collectedRoutes);
  
  // If no routes are matching our criteria, that means we have a 404
  // else react-router is taking care of it.
  if (!currentRoutes.length) {
    renderNotFoundPage({
      render: options.isInitialLoad? HydrateRender: DefaultRender,
      history,
      renderRoot: renderRoot,
      url: url,
      routes: [],
      store
    }, () => {
      !options.isInitialLoad && hideScreenLoader(store);
      !options.isInitialLoad && scrollToTop(currentRoutes);
    });
    return Promise.resolve();
  }
  
  // Preload Data
  let promises = getPreloadDataPromises({
    routes: currentRoutes,
    storage,
    api,
    store,
    url: window.location.href.replace(window.location.origin, ""),
    host: `${window.location.protocol}//${window.location.host}`
  });
  
  try {
    await Promise.all(promises);
    
    updateHtmlMeta(currentRoutes);
    updateHeadLinks(currentRoutes);
    renderRoutesByUrl({
      render: options.isInitialLoad? HydrateRender: DefaultRender,
      routes: currentRoutes,
      history,
      renderRoot,
      url,
      store
    }, () => {
      !options.isInitialLoad && hideScreenLoader(store);
      scrollToTop(currentRoutes);
    });
    return Promise.resolve();
  } catch (err) {
    let error = err;
    if (err && err.error instanceof Error) {
      error = err.error;
    } else if (!(err instanceof Error)) {
      error = new Error(err);
    }
    
    error.statusCode = error.statusCode || 500;
    if (error.statusCode === 404) {
      renderNotFoundPage({
        render: options.isInitialLoad? HydrateRender: DefaultRender,
        history,
        renderRoot: renderRoot,
        url: url,
        routes: [],
        store
      }, () => {
        !options.isInitialLoad && hideScreenLoader(store);
        !options.isInitialLoad && scrollToTop(currentRoutes);
      });
    } else if (NETWORK_STATE_OFFLINE === error.networkState) {
      renderOfflinePage({
        render: options.isInitialLoad? HydrateRender: DefaultRender,
        history,
        renderRoot: renderRoot,
        error: error,
        routes: currentRoutes,
        store
      }, () => {
        !options.isInitialLoad && hideScreenLoader(store);
        !options.isInitialLoad && scrollToTop(currentRoutes);
      });
    } else {
      renderErrorPage({
        render: options.isInitialLoad? HydrateRender: DefaultRender,
        history,
        renderRoot: renderRoot,
        error: error,
        store,
        routes: currentRoutes
      }, () => {
        !options.isInitialLoad && hideScreenLoader(store);
        !options.isInitialLoad && scrollToTop(currentRoutes);
      });
    }
    return Promise.reject(err);
  }
};

/**
 * Load routes when a bundle is included,
 * this will be called from pages
 * @param routes
 * @param collectedRoutes
 */
export const updateRoutes = ({routes, collectedRoutes}) => {
  
  _.each(routes, route => {
    // remove functions as we cannot use find with functions in object
    const lessRoute = JSON.parse(JSON.stringify(route));
    const index = _.findIndex(collectedRoutes, lessRoute);
    
    if (index === -1) {
      collectedRoutes.push(route);
    } else {
      collectedRoutes[index] = route;
    }
  });
};

/**
 * Smooth scroll of window
 */
// Get y position of window
function currentYPosition() {
  // Firefox, Chrome, Opera, Safari
  if (self.pageYOffset) return self.pageYOffset;
  // Internet Explorer 6 - standards mode
  if (document.documentElement && document.documentElement.scrollTop) {
    return document.documentElement.scrollTop;
  }
  // Internet Explorer 6, 7 and 8
  if (document.body.scrollTop) return document.body.scrollTop;
  return 0;
}

// Get y position of element
function elmYPosition(element) {
  const elm = element;
  let y = elm.offsetTop;
  let node = elm;
  while (node.offsetParent && node.offsetParent !== document.body) {
    node = node.offsetParent;
    y += node.offsetTop;
  } return y;
}

/**
 * utils
 * @param eID
 * @param padding
 * @param speedMultiplier
 */
export const smoothScroll = (eID, padding = 0, speedMultiplier = 1) => {
  const startY = currentYPosition();
  let stopY = 0;
  if (eID) {
    stopY = elmYPosition(eID) - padding;
  } else {
    stopY = stopY + padding;
  }
  const distance = stopY > startY ? stopY - startY : startY - stopY;
  if (distance < 100) {
    scrollTo(0, stopY); return;
  }
  let speed = Math.round(distance / 100);
  if (speed >= 20) speed = 20;
  
  speed /= speedMultiplier;
  const step = Math.round(distance / 25);
  let leapY = stopY > startY ? startY + step : startY - step;
  let timer = 0;
  if (stopY > startY) {
    for (let i = startY; i < stopY; i += step) {
      //eslint-disable-next-line
      setTimeout(`window.scrollTo(0, ${leapY})`, timer * speed);
      leapY += step; if (leapY > stopY) leapY = stopY; timer++;
    } return;
  }
  for (let i = startY; i > stopY; i -= step) {
    //eslint-disable-next-line
    setTimeout(`window.scrollTo(0, ${leapY})`, timer * speed);
    leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
  }
};
