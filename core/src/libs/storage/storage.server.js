import _ from "lodash";

export default class Storage {
  request = null;
  response = null;

  constructor(req, res) {
    this.request = req;
    this.response = res;
  }

  /**
   * Set request
   * @param req
   * @returns {Storage}
   */
  setRequest(req) {
    this.request = req;
    return this;
  }

  /**
   * Set response
   *
   * @param res
   * @returns {Storage}
   */
  setResponse(res) {
    this.response = res;
    return this;
  }

  /**
   * Clear all cookies
   */
  clear() {
    _.each(_.get(this.request, "cookies", {}), (value, key) => {
      this.removeItem(key);
    });
  }

  /**
   * Get item from cookie
   * @param key
   */
  getItem(key) {
    return _.get(this.request, `cookies.${key}`, null);
  }

  key(index) {
    let keys = this.keys();
    if (index <= keys) {
      return keys[index];
    }
    return null;
  }
  keys() {
    return _.keys(_.get(this.request, "cookies", {}));
  }

  /**
   * Set a cookie
   * @param key
   * @param value
   * @returns {Storage}
   */
  setItem(key, value) {
    this.response.cookie(key, value);
    return this;
  }

  /**
   * Return total number of cookies
   */
  length() {
    return this.keys().length;
  }

  /**
   * Remove a cookie
   * @param key
   * @returns {Storage}
   */
  removeItem(key) {
    this.response.cookie(key, "", {expires: new Date(0)});
    return this;
  }
}