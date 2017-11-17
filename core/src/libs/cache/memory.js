import mcache from "memory-cache";
import _ from "lodash";
import isBot from "isbot";


const __development = process.env.NODE_ENV === "development";
/**
 *
 * @param routes
 * @returns {function(*, *, *)}
 */
export const pageCache = (routes = []) => {
  
  return (req, res, next) => {
  
    // Disable cache when env development
    if (__development) return next();
    
    const getExactRouteFromPath = require("../../utils/bundler").getExactRouteFromPath;
  
    const bot = isBot(_.get(req, "headers.user-agent", ""));
    let key = `__express__${req.originalUrl || req.url}`;
    let headerKey = `__express__headers__${req.originalUrl || req.url}`;
    
    if (bot) {
      key = `BOT_${key}`;
      headerKey = `BOT_${headerKey}`;
    }
    let cachedBody = mcache.get(key);
    let cachedHeaders = mcache.get(headerKey) || {};
  
    if (cachedBody) {
      // eslint-disable-next-line
      console.log(`Using cache to send ${bot?"(BOT)":""}: ${req.url}`);
      
      _.each(cachedHeaders, (value, key) => {
        res.setHeader(key, value);
      });
      
      return res.send(cachedBody);
    }
    
    const exactRoute = getExactRouteFromPath(req.path, routes);
    
    // If no route is found then just let it go with flow
    // i.e. do not cache 404 output
    if (!exactRoute) {
      return next();
    }
    
    const routeCacheSettings = _.assignIn({}, {
      enable: true,
      duration: 0
    },_.get(exactRoute, "cache", {}));
    
    if (!routeCacheSettings.enable) {
      return next();
    }
    // If cache is enabled and duration is not set then set it
    // 1 year (unlimited time I guess)
    const duration = !routeCacheSettings.duration ? 31556926: (routeCacheSettings.duration * 1000);
    
    res.sendResponse = res.send;
    res.send = (body, ...other) => {
      mcache.put(key, body, duration);
      mcache.put(headerKey, res.getHeaders(), duration);
      res.sendResponse(body, ...other);
    };
    return next();
  };
};

export const infiniteCache = () => {
  
  return (req, res, next) => {
    
    // Disable cache while development
    if (__development) return next();
  
    const bot = isBot(_.get(req, "headers.user-agent", ""));
  
    let key = `__express__infinite__${req.originalUrl || req.url}`;
    let headerKey = `__express__infinite__headers__${req.originalUrl || req.url}`;
    
    if (bot) {
      key = `BOT_${key}`;
      headerKey = `BOT_${headerKey}`;
    }
  
    let cachedBody = mcache.get(key);
    let cachedHeaders = mcache.get(headerKey);
  
    if (cachedBody) {
      // eslint-disable-next-line
      console.log(`Using cache to send ${bot?"(BOT)":""}: ${req.url}`);
      
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