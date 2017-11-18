import fetch from "universal-fetch";
import _ from "lodash";
import config from "src/config";
import {NETWORK_STATE_ONLINE} from "../network/action";

class api {
  baseUrl = _.get(config, "api.baseUrl", "");
  appState = {};
  storage = null;
  filters = {};
  /**
   * Store is required for API to get network status
   * @type {store} Redux Store
   */
  store = null;
  constructor({storage, store = null}) {
    this.storage = storage;
    this.store = store;
  }
  
  setStore(store) {
    this.store = store;
  }
  
  setState(variable, value) {
    _.set(this.appState, variable, value);
    return this;
  }
  
  getState(variable, defaultValue) {
    if (!variable) {
      return this.appState;
    }
    return _.get(this.appState, variable, defaultValue);
  }
  
  static checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    
    const error = new Error(response.statusText);
    error.response = response;
    error.statusCode = 500;
    throw error;
  }
  
  static parseJSON(response) {
    return response.json();
  }
  
  processSWCache(url, options) {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in window.navigator)
    ) {
      return false;
    }
    
    // Add extra headers if we need custom cache
    // these headers are only when serviceWorker is active & listening
    const swEnabled = this.getState("SW_ENABLED", false);
    if (swEnabled) {
      const swcache = _.get(options, "swcache", 0);
      if (swcache) {
        
        const currentServiceWorker = window.navigator.serviceWorker.controller;
        if (!currentServiceWorker || currentServiceWorker.state !== "activated") {
          return null;
        }
        currentServiceWorker.postMessage(JSON.stringify({
          action: "SWCACHE_TTL_STORE",
          ttl: swcache,
          url: url,
          options: options
        }));
      }
    }
    return false;
  }
  
  removeFilter(filterName, callback) {
    if (!this.filters[filterName]) {
      return;
    }
    _.remove(this.filters[filterName], f => f.callback.toString() === callback.toString());
  }
  
  addFilter(filterName, callback, priority = 100) {
    if (!this.filters[filterName]) {
      this.filters[filterName] = [];
    }
    this.filters[filterName].push({
      callback,
      priority,
      index: _.get(_.maxBy(this.filters[filterName], "index"), "index", 0) + 1
    });
    _.sortBy(this.filters[filterName], ["priority", "index"], ["asc", "asc"]);
    return this;
  }
  
  applyFilter(filterName, data, staticParams) {
    if (!this.filters[filterName] || !this.filters[filterName].length) return data;
    let filteredData = data;
    _.each(this.filters[filterName], filter => {
      filteredData = filter.callback(filteredData, staticParams);
    });
    return filteredData;
  }
  
  fetch(url, options = { ignoreHeaders: false }) {
    if (typeof options === "undefined") {
      options = {};
    }
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    
    // Remove our custom headers
    if(options.ignoreHeaders) {
      headers = {};
    }
    
    let apiUrl = url;
    let externalRequest = true;
    
    if (
      !_.startsWith(url, "//") &&
      !_.startsWith(url, "http")
    ) {
      // this means that its a pure API call. We can add the authorization headers here
      apiUrl = _.trimStart(apiUrl, "/");
      apiUrl = this.baseUrl + apiUrl;
      externalRequest = false;
    }
    if (_.startsWith(url, "http") && url.indexOf(this.baseUrl) !== -1) {
      externalRequest = false;
    }
    
    let requestOptions = Object.assign({}, {
      method: "GET",
      mode: "cors",
      headers: _.assignIn(headers, options.headers),
    }, options);
    
    requestOptions = this.applyFilter("beforeFetch", requestOptions, {
      url: apiUrl,
      external: externalRequest,
    });
    
    return new Promise((resolve, reject) => {
      
      // Inform service worker if sw-cache is present
      this.processSWCache(apiUrl, requestOptions);
      
      fetch(apiUrl, requestOptions)
        .then(api.checkStatus)
        .then(api.parseJSON)
        .then(data => {
          resolve(data);
        }).catch(error => {
          
          if (!this.store) {
            error.networkState = NETWORK_STATE_ONLINE;
          } else {
            error.networkState = _.get(this.store.getState(), "network.state", NETWORK_STATE_ONLINE);
          }
        
          if (error && error.response && typeof error.response.text === "function") {
            error.response.text().then(text => {
              let errorData = text;
              try {
                errorData = JSON.parse(text);
                reject({response: errorData, error});
              } catch (err) {
                reject({response: text, error});
              }
            });
          } else {
            reject({response: {}, error});
          }
        });
    });
  }
}

export default api;