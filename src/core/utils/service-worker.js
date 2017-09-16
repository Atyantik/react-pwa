import _ from "lodash";

/**
 *
 * @param currentCacheName
 * @param cachePrefix
 * @returns {Promise.<TResult>|*}
 */
export const deleteOldCache = (currentCacheName = "", cachePrefix = "") => {
  return caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        if (currentCacheName !== cacheName && cacheName.startsWith(cachePrefix)) {
          return caches.delete(cacheName);
        }
      })
    );
  });
};

/**
 * Send message to all clients
 * @param serviceWorker
 * @param message
 * @returns {Promise}
 */
export const messageAllClients = (serviceWorker, message) => {
  let msg = generateMessage(message);
  return new Promise(resolve => {
    serviceWorker
      .clients
      .matchAll()
      .then(clients => {
        return Promise.all(_.map(clients, client => {
          return postMessage(client, msg);
        }));
      }).then(resolve);
  });
};

/**
 * Generate message from * Generic data and send object accordingly
 * @param data
 * @returns {*}
 */
const generateMessage = (data) => {
  if (!data || _.isEmpty(data)) {
    throw new Error("Cannot send empty/null/undefined data!");
  }
  let message = data;
  if (_.isString(data)) {
    message = {
      message: data
    };
  }
  return message;
};

/**
 * Post a message to client
 * @param client
 * @param message
 * @returns {Promise.<*>}
 */
const postMessage = async (client, message = {}) => {
  if (client && client.postMessage) {
    return client.postMessage(JSON.stringify(message));
  }
  return Promise.resolve();
};

export const decodeMessage = data => {
  let msg = data;
  if (_.isString(data)) {
    try {
      msg = JSON.parse(data);
    } catch (ex) {
      msg = data;
    }
  }
  return msg;
};