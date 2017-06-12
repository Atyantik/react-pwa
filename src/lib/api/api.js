import fetch from "universal-fetch";
import _ from "lodash";
import config from "../../config/config";

class api {
  baseUrl = _.get(config, "api.baseUrl", "");
  appState = {};
  storage = null;
  constructor({storage}) {
    this.storage = storage;
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

  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    const error = new Error(response.statusText);
    error.response = response;
    error.statusCode = 500;
    throw error;
  }

  parseJSON(response) {
    return response.json();
  }

  fetch(url, options = { ignoreHeaders: false }, ...others) {
    if (typeof options === "undefined") {
      options = {};
    }
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if(options.ignoreHeaders) {
      headers = {};
    }
    const requestOptions = Object.assign({}, {
      method: "GET",
      mode: "cors",
      headers: headers,
    }, options);

    let apiUrl = url;

    if (
      !_.startsWith(url, "//") &&
      !_.startsWith(url, "http")
    ) {
      apiUrl = _.trimStart(apiUrl, "/");
      apiUrl = this.baseUrl + apiUrl;
    }
    return new Promise((resolve, reject) => {
      fetch(apiUrl, requestOptions, ...others)
        .then(this.checkStatus)
        .then(this.parseJSON)
        .then(data => {
          resolve(data);
        }).catch(error => {
          if (error && error.response && typeof error.response.text === "function") {
            error.response.text().then(text => {
              let errorData = text;
              try {
                errorData = JSON.parse(text);
                reject(errorData);
              } catch (err) {
                reject(text);
              }
            });
          } else {
            reject(error);
          }
        });
    });
  }
}

export default api;