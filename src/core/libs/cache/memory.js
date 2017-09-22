import mcache from "memory-cache";
import _ from "lodash";
import isBot from "isbot";
import md5 from "crypto";

import { getRouteFromPath } from "../../utils/bundler";

/**
 *
 * @param routes
 * @returns {function(*, *, *)}
 */
const pageCache = (routes = []) => {
  
  return (req, res, next) => {
  
    // Disable cache when env development
    if (process.env.NODE_ENV === "development") {
      return next();
    }
  
    const isBot = isBot(_.get(req, "headers.user-agent", ""));
    const key = `__express__${req.originalUrl || req.url}`;
    
    if (isBot) {
      // Try to get body from cache
      // const botKey = `BOT_${key}`;
      // const cachedBody = mcache.get(key);
    }
    let cachedBody = mcache.get(key);
    
  
    if (cachedBody) {
      // eslint-disable-next-line
      console.log("Using cache to send:", req.url);
      return res.send(cachedBody);
    }
    
    const currentRoutes = getRouteFromPath(routes, req.path);
    const exactRoute = _.find(currentRoutes, r => _.get(r, "match.isExact", false));
    
    // If not route is found then just let it go with flow
    if (!exactRoute) {
      return next();
    }
  
    // eslint-disable-next-line
    const cache = _.assignIn({}, {
      enable: false,
      duration: 0
    },_.get(exactRoute, "cache", {}));
    
    if (!cache.enable) {
      return next();
    }
    // If cache is enabled and duration is not set then set it
    // 1 year (unlimited time I guess)
    const duration = !cache.duration ? 31556926: (cache.duration * 1000);
    
    res.sendResponse = res.send;
    res.send = (body, ...other) => {
      mcache.put(key, body, duration);
 
      res.sendResponse(body, ...other);
    };
    return next();
  };
};

export const infiniteCache = () => {
  
  return (req, res, next) => {
    
    // Disable cache when env is not production
    if (process.env.NODE_ENV === "development" || isEditorDomain(req)) {
      return next();
    }
  
    const userAgent = _.get(req, "headers.user-agent", "").toLowerCase();
    const isBot = _.some(bots, (botString) => userAgent.indexOf(botString) !== -1);
  
    // Disable cache when env is not production
    if (process.env.NODE_ENV === "development" || isEditorDomain(req)) {
      return next();
    }
  
    let key = `__express__infinite__${req.originalUrl || req.url}`;
    let headerKey = `__express__infinite__headers__${req.originalUrl || req.url}`;
    
    if (isBot) {
      key = `BOT_${key}`;
      headerKey = `BOT_${headerKey}`;
    }
  
    let cachedBody = mcache.get(key);
    let cachedHeaders = mcache.get(headerKey);
  
    if (cachedBody) {
      // eslint-disable-next-line
      console.log("Using cache to send:", req.url);
      _.each(cachedHeaders, (value, key) => {
        res.setHeader(key, value);
      });
      return res.send(cachedBody);
    }
    
    // If cache is enabled and duration is not set then set it
    // 1 year (unlimited time I guess)
    const duration = 31556926;
    
    res.sendResponse = res.send;
    res.send = (body, ...other) => {
      mcache.put(key, body, duration);
      
      mcache.put(headerKey, res.getHeaders(), duration);
      res.sendResponse(body, ...other);
    };
    return next();
  };
};

export default pageCache;