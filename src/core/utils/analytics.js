import _ from "lodash";

/**
 * Get GoogleTagManager
 * @returns {Array}
 */
const getGTM = () => {
  if(typeof window !== "undefined" && _.get(window, "dataLayer", false)) {
    return _.get(window, "dataLayer", []);
  }
  return [];
};

/**
 * Get instance of facebook api
 * @returns {function()}
 */
const getFB = () => {
  if (typeof window !== "undefined" && _.get(window, "fbq", false)) {
    return _.get(window, "fbq", () => {});
  }
  return () => {};
};

/**
 * Get instance of google analytics
 * @returns {function()}
 */
const getGA = () => {
  if (typeof window !== "undefined" && _.get(window, "ga", false)) {
    return _.get(window, "ga", () => {});
  }
  return () => {};
};
/**
 * Get instance of segment
 * @returns {{page: (function()), track: (function()), identify: (function())}}
 */
const getSegment = () => {
  const defaults = {
    page: () => {},
    track: () => {},
    identify: () => {}
  };
  if (typeof window !== "undefined" && _.get(window, "analytics", false)) {
    return _.get(window, "analytics", defaults);
  }
  return defaults;
};

/**
 * Track page view
 * @param location URL to be tracked
 * @param title Page title
 * @returns {Promise.<void>}
 */
export const trackPageView = async (location = "", title = "") => {
  let loc = location;
  if (!loc) {
    loc = _.get(window, "location.pathname", "") + _.get(window, "location.search", "");
  }
  let t = title;
  if (!t) {
    t = "";
  }

  // Facebook track page view
  const fbq = getFB();
  fbq("track", "PageView");

  // Track page view via google analytics
  const ga = getGA();
  ga("send", "pageview", loc);

  // Track via google tag manager
  const dataLayer = getGTM();
  dataLayer.push({
    "event": "VirtualPageview",
    "virtualPageUrl": loc,
    "virtualPageTitle": t
  });
};

export const track = async (str, metaData = {}) => {
  metaData = _.assignIn({}, metaData);

  const segment = getSegment();
  segment.track(str, metaData);

  const ga = getGA();
  ga("send", "event", "Custom", str, str);

  // Track via Facebook Pixel
  const fbq = getFB();
  fbq("trackCustom", str, _.assignIn({}, {
    content_name: str,
    content_category: "Custom"
  }, metaData));

  const dataLayer = getGTM();
  dataLayer.push({
    event: "GAEvent",
    ...(_.assignIn({
      eventCategory: _.get(metaData, "eventCategory", "Custom"),
      eventAction: _.get(metaData, "eventAction", str),
      eventLabel: _.get(metaData, "eventLabel", str),
      eventValue: _.get(metaData, "eventValue", str),
      userId: _.get(metaData, "userId", false)
    }, metaData))
  });
};
