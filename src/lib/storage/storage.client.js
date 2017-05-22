let obj = {};
/**
 * @todo This can be optimized an should not be used with Object.defineProperty
 * -------
 * Use simple class instead.
 * -------
 */
Object.defineProperty(obj, "cookieHandler", new (function () {
  let aKeys = [], oStorage = {};

  Object.defineProperty(oStorage, "clear", {
    value: function () {
      aKeys.forEach(key => {
        this.removeItem(key);
      });
    },
    writable: false,
    configurable: false,
    enumerable: false
  });

  Object.defineProperty(oStorage, "getItem", {
    value: function (sKey) {
      return sKey ? this[sKey] : null;
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(oStorage, "key", {
    value: function (nKeyId) {
      return aKeys[nKeyId];
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(oStorage, "keys", {
    value: function () {
      return aKeys;
    },
    writable: false,
    configurable: false,
    enumerable: false
  });

  Object.defineProperty(oStorage, "setItem", {
    value: function (sKey, sValue) {
      if (!sKey) {
        return;
      }
      this[sKey] = sValue;
      window.document.cookie = encodeURI(sKey) + "=" + encodeURI(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(oStorage, "length", {
    get: function () {
      return aKeys.length;
    },
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(oStorage, "removeItem", {
    value: function (sKey) {
      if (!sKey) {
        return;
      }
      document.cookie = encodeURI(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    },
    writable: false,
    configurable: false,
    enumerable: false
  });
  this.get = function () {
    let iThisIndx;
    for (let sKey in oStorage) {
      iThisIndx = aKeys.indexOf(sKey);
      if (iThisIndx === -1) {
        oStorage.setItem(sKey, oStorage[sKey]);
      }
      else {
        aKeys.splice(iThisIndx, 1);
      }
      delete oStorage[sKey];
    }
    for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
      oStorage.removeItem(aKeys[0]);
    }
    for (let aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
      aCouple = aCouples[nIdx].split(/\s*=\s*/);
      if (aCouple.length > 1) {
        oStorage[iKey = decodeURI(aCouple[0])] = decodeURI(aCouple[1]);
        aKeys.push(iKey);
      }
    }
    return oStorage;
  };
  this.configurable = false;
  this.enumerable = true;
}));
export default obj.cookieHandler;