import _ from "lodash";
import config from "src/config";
// ** Icons for apple screens and
import pwaIcon72 from "src/resources/images/pwa/icon-72x72.png";
import pwaIcon96 from "src/resources/images/pwa/icon-96x96.png";
import pwaIcon128 from "src/resources/images/pwa/icon-128x128.png";
import pwaIcon144 from "src/resources/images/pwa/icon-144x144.png";
import pwaIcon152 from "src/resources/images/pwa/icon-152x152.png";
import pwaIcon192 from "src/resources/images/pwa/icon-192x192.png";
import pwaIcon384 from "src/resources/images/pwa/icon-384x384.png";
import pwaIcon512 from "src/resources/images/pwa/icon-512x512.png";

const seoSchema = _.defaultsDeep(_.get(config, "seo", {}),{
  title: "",
  description: "",
  keywords: [],
  image: "",
  site_name: "",
  twitter: {
    site: "",
    creator: ""
  },
  facebook: {
    admins: [],
  },
  type: "article", // article/product/music/video
  type_details: {
    section: "", // Lifestyle/sports/news
    published_time: "",
    modified_time: "",
  }
});

/**
 * Standard link keys to differentiate
 * @type {[*]}
 */
const linkKeys = [
  "href"
];

/**
 * Get full url appended with base url if no protocol present in the provided link
 * @param url
 * @param baseUrl
 * @returns {*}
 */
const getFullUrl = (url, baseUrl = "") => {
  let fullImageUrl = url;
  if (!_.startsWith(fullImageUrl, "http")) {
    fullImageUrl = `${baseUrl}${!_.startsWith(fullImageUrl, "/")?"/":""}${fullImageUrl}`;
  }
  return fullImageUrl;
};

/**
 * Return the link key detected from the meta provided.
 * if no link key from our standard linkKeys is found then return false
 * @param meta
 * @returns {boolean|string}
 */
const getLinkKey = (link) => {
  let selectedLinkKey = false;
  _.each(linkKeys, key => {
    if (!selectedLinkKey && _.get(link, key, false)) {
      selectedLinkKey = key;
    }
  });
  return selectedLinkKey;
};

/**
 * Update the source directly,
 * thus pass as array
 * @param source {Array}
 * @param customLinks {Array}
 */
const addUpdateLinks = (source = [], customLinks = []) => {
  
  _.each(customLinks, link => {
    const linkKey = getLinkKey(link);
    let linkUpdated = false;
    if (linkKey) {
      // Suppose we got a meta key in our generatedSchema
      // then we need to update the generated schema
      let generatedSchemaObj = _.find(source, { [linkKey]: link[linkKey]});
      
      if (generatedSchemaObj) {
        _.each(link, (value, key) => {
          _.set(generatedSchemaObj, key, value);
        });
        linkUpdated = true;
      }
    }
    // This means user is trying to add some meta that does
    // not match our standard criteria or is not present in our source, maybe for site verification
    // or google webmaster meta key etc
    if (!linkUpdated) {
      // Add data to source
      source.push(link);
    }
  });
};

/**
 * Return array of link tags required for the route
 * Pass seo data to the function and get array of links data
 * @param data
 * @param options
 * @returns {Array}
 */
export const generateLinks = (data = {}, options = { baseUrl: "" }) => {
  // deep defaults the seoSchema we have in config file and the data provided to us.
  let seoData = _.defaultsDeep(data, seoSchema);
  
  let links = [];
  
  links.push({
    rel: "apple-touch-icon",
    href: getFullUrl(pwaIcon192, options.baseUrl),
  });
  links.push({
    rel: "apple-touch-icon",
    sizes: "72x72",
    href: getFullUrl(pwaIcon72, options.baseUrl),
  });
  links.push({
    rel: "apple-touch-icon",
    sizes: "96x96",
    href: getFullUrl(pwaIcon96, options.baseUrl),
  });
  links.push({
    rel: "apple-touch-icon",
    sizes: "128x128",
    href: getFullUrl(pwaIcon128, options.baseUrl),
  });
  links.push({
    rel: "apple-touch-icon",
    sizes: "144x144",
    href: getFullUrl(pwaIcon144, options.baseUrl),
  });
  links.push({
    rel: "apple-touch-icon",
    sizes: "152x152",
    href: getFullUrl(pwaIcon152, options.baseUrl),
  });
  links.push({
    rel: "apple-touch-icon",
    sizes: "192x192",
    href: getFullUrl(pwaIcon192, options.baseUrl),
  });
  links.push({
    rel: "apple-touch-icon",
    sizes: "384x384",
    href: getFullUrl(pwaIcon384, options.baseUrl),
  });
  links.push({
    rel: "apple-touch-icon",
    sizes: "512x512",
    href: getFullUrl(pwaIcon512, options.baseUrl),
  });
  links.push({
    rel:"apple-touch-startup-image",
    href: getFullUrl(pwaIcon512, options.baseUrl)
  });
  
  const configLinks = _.get(config, "seo.links", []);
  addUpdateLinks(links, configLinks);
  
  const userLinks = _.get(seoData, "links", []);
  addUpdateLinks(links, userLinks);
  
  links = _.uniqWith(links, _.isEqual);
  
  return links;
};