import _ from "lodash";
import config from "../../config/config";
import { isBrowser } from "./utils";

/**
 * Seo Schema. This can be used while using it in routes
 */
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

const pwaSchema = _.defaultsDeep(_.get(config, "pwa", {}), {
  "name": "",
  "short_name": "",
  
  // Possible values ltr(left to right)/rtl(right to left)
  "dir": "ltr",
    
  // language: Default en-US
  "lang": "en-US",
    
  // Orientation of web-app possible:
  // any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary
  "orientation": "any",
  "start_url": "/",
  "background_color": "#fff",
  "theme_color": "#fff",
  "display": "standalone",
  "description": ""
});

const defaultMeta = [
  {
    charSet: "utf-8",
  },
  {
    httpEquiv: "x-ua-compatible",
    content: "ie=edge",
  },
  {
    name: "viewport",
    content: "width=device-width, initial-scale=1, shrink-to-fit=no",
  },
  {
    name: "application-name",
    content: _.get(pwaSchema, "name", ""),
  },
  {
    name: "generator",
    content: "ReactPWA",
  },
  {
    name: "rating",
    content: "General"
  },
  {
    name: "mobile-web-app-capable",
    content: "yes"
  },
  {
    name: "apple-mobile-web-app-capable",
    content: "yes"
  },
  {
    name: "apple-mobile-web-app-status-bar-style",
    content: _.get(pwaSchema, "theme_color", "#fff"),
  },
  {
    name: "apple-mobile-web-app-title",
    content: _.get(pwaSchema, "name", ""),
  },
  {
    name: "msapplication-tooltip",
    content: _.get(pwaSchema, "description", "")
  },
  {
    name:"msapplication-starturl",
    content: _.get(pwaSchema, "start_url", ""),
  },
  {
    name:"msapplication-TileColor",
    content: _.get(pwaSchema, "background_color", "#fff"),
  },
  {
    name: "renderer",
    content: "webkit|ie-comp|ie-stand"
  },
  {
    name: "full-screen",
    content: "yes",
  }
  
];

/**
 * Standard meta keys to differentiate
 * @type {[*]}
 */
const metaKeys = [
  "name",
  "itemProp",
  "property",
  "charSet"
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
 * Return array of meta tags required for the route
 * Pass seo data to the function and get array of meta data
 * @param data
 * @param options
 * @returns {Array}
 */
export const generateMeta = (data = {}, options = { baseUrl: "", url: "" }) => {
  // deep defaults the seoSchema we have in config file and the data provided to us.
  let seoData = _.defaultsDeep(data, seoSchema);
  
  // Let store the generated Schema in following variable
  let generatedSchema = [];
  
  // Get 155 words out of description
  const desc155words = trimTillLastSentence(seoData.description, 155);
  
  // Get 200 words out of description
  const desc200words = trimTillLastSentence(seoData.description, 200);
  
  // Base url after removing the end slash
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  
  // Add meta required for at top of head
  addUpdateMeta(generatedSchema, _.cloneDeep(defaultMeta));
  
  /**
   * Manage name/title
   */
  // Meta name
  generatedSchema.push({
    name: "title",
    content: seoData.title,
  });
  // Twitter title
  generatedSchema.push({
    name: "twitter:title",
    content: seoData.title
  });
  generatedSchema.push({
    property: "og:title",
    content: seoData.title
  });
  
  /**
   * Manage keywords (allow string and array as well)
   */
  if (_.isString(seoData.keywords) && seoData.keywords.trim().length) {
    generatedSchema.push({
      name: "keywords",
      content: seoData.keywords,
    });
  }
  if (_.isArray(seoData.keywords) && seoData.keywords.length) {
    generatedSchema.push({
      name: "keywords",
      content: seoData.keywords.join(","),
    });
  }
  
  /**
   * Manage twitter site & author
   */
  const twitterSite =_.get(seoData, "twitter.site", "");
  if (twitterSite.length) {
    generatedSchema.push({
      name: "twitter:site",
      content: twitterSite
    });
  }
  
  const twitterCreator =_.get(seoData, "twitter.creator", "");
  if (twitterCreator.length) {
    generatedSchema.push({
      name: "twitter:creator",
      content: twitterCreator
    });
  }
  
  /**
   * Manage facebook admins
   */
  const fbAdmins = _.get(seoData, "facebook.admins", []);
  if (fbAdmins && fbAdmins.length) {
    generatedSchema.push({
      property: "fb:admins",
      content: fbAdmins.join(",")
    });
  }
  
  /**
   * Manage description
   */
  // Meta description
  generatedSchema.push({
    name: "description",
    content: desc155words,
  });
  generatedSchema.push({
    name: "twitter:description",
    content: desc200words,
  });
  generatedSchema.push({
    property: "og:description",
    content: seoData.description
  });
  
  /**
   * Site name
   */
  if (seoData.site_name.length) {
    generatedSchema.push({
      property: "og:site_name",
      content: seoData.site_name,
    });
  }
  
  /**
   * Manage Primary Image
   */
  const hasImage = !!seoData.image.length;
  
  if (hasImage) {
    let images = hasImage ? seoData.image: [];
    if (!_.isArray(images)) {
      images = [images];
    }
  
    const image = _.first(images);
    const fullImageUrl = getFullUrl(image, baseUrl);
    generatedSchema.push({
      itemProp: "image",
      content: fullImageUrl
    });
    generatedSchema.push({
      name: "twitter:image:src",
      content: fullImageUrl
    });
    if (image.length > 1) {
      _.each(images, img => {
        generatedSchema.push({
          property: "og:image",
          content: getFullUrl(img, baseUrl)
        });
      });
    } else {
      generatedSchema.push({
        property: "og:image",
        content: fullImageUrl
      });
    }
  
    // Add type of twitter card
    generatedSchema.push({
      name: "twitter:card",
      content: "summary_large_image"
    });
  } else {
    generatedSchema.push({
      name: "twitter:card",
      content: "summary"
    });
  }
  
  /**
   * Manage Type article/product/music/movie etc
   */
  generatedSchema.push({
    property: "og:type",
    content: seoData.type,
  });
  
  let twitterDataCounter = 1;
  _.each(seoData.type_details, (value, key) => {
    if (_.isObject(value)) {
      _.each(value, (subValue, subKey) => {
        if (!_.isEmpty(subValue)) {
          generatedSchema.push({
            property: `${seoData.type}:${key}:${subKey}`,
            content: subValue
          });
          generatedSchema.push({
            name: `twitter:data${twitterDataCounter}`,
            content: subValue,
          });
          generatedSchema.push({
            name: `twitter:label${twitterDataCounter}`,
            content: subKey,
          });
          twitterDataCounter++;
        }
      });
    } else {
      if (!_.isEmpty(value)) {
        generatedSchema.push({
          property: `${seoData.type}:${key}`,
          content: value
        });
        generatedSchema.push({
          name: `twitter:data${twitterDataCounter}`,
          content: value,
        });
        generatedSchema.push({
          name: `twitter:label${twitterDataCounter}`,
          content: key,
        });
        twitterDataCounter++;
      }
    }
  });
  
  let url = _.get(seoData, "url", _.get(options, "url", ""));
  if (!url.length && isBrowser()) {
    url = _.get(window, "location.href", "");
  }
  if (url.trim().length) {
    generatedSchema.push({
      property: "og:url",
      content: url
    });
  }
  
  // Add config meta
  const configMeta = _.get(config, "seo.meta", []);
  addUpdateMeta(generatedSchema, configMeta);
  
  const userMeta = _.get(seoData, "meta", []);
  addUpdateMeta(generatedSchema, userMeta);
  
  generatedSchema = _.uniqWith(generatedSchema, _.isEqual);
  
  return generatedSchema;
};

/**
 * Return the meta key detected from the meta provided.
 * if no meta key from our standard metaKeys is found then return false
 * @param meta
 * @returns {boolean|string}
 */
const getMetaKey = (meta) => {
  let selectedMetaKey = false;
  _.each(metaKeys, key => {
    if (!selectedMetaKey && _.get(meta, key, false)) {
      selectedMetaKey = key;
    }
  });
  return selectedMetaKey;
};

/**
 * Update the source directly,
 * thus pass as array
 * @param source {Array}
 * @param customMetas {Array}
 */
const addUpdateMeta = (source = [], customMetas = []) => {

  _.each(customMetas, meta => {
    const metaKey = getMetaKey(meta);
    let metaUpdated = false;
    if (metaKey) {
      // Suppose we got a meta key in our generatedSchema
      // then we need to update the generated schema
      let generatedSchemaObj = _.find(source, { [metaKey]: meta[metaKey]});

      if (generatedSchemaObj) {
        _.each(meta, (value, key) => {
          _.set(generatedSchemaObj, key, value);
        });
        metaUpdated = true;
      }
    }
    // This means user is trying to add some meta that does
    // not match our standard criteria or is not present in our source, maybe for site verification
    // or google webmaster meta key etc
    if (!metaUpdated) {
      // Add data to source
      source.push(meta);
    }
  });
};

/**
 * Get text from html string
 * @param str
 * @returns {string}
 */
const getTextFromHtml = (str = "") => {
  return str.replace(/<(?:.|\n)*?>/gm, "").trim();
};

/**
 * Process string to get appropriate trimmed data
 * Thus string "Tirth Bodawala" should return "Tirth Bodawala" with length 14
 * & should return "Tirth" with length 13, first it tries to search for "." and then
 * for " "(space)
 * @param str
 * @param length
 * @returns String
 */
export const trimTillLastSentence = (str, length = 0) => {
  // Get pure text from string provided, necessary
  // to remove html tags
  str = getTextFromHtml(str);

  // If no min length specified or no string
  // length then return string
  if (!length || !str.length) {
    return str;
  }

  // Add leading space to preserve string length
  str += " ";

  //trim the string to the maximum length
  let trimmedString = str.substr(0, length + 1);

  // Re-trim if we are in the middle of a word
  let separator = ".";

  // Check if there is a sentence and a "." exists
  if (trimmedString.lastIndexOf(separator) === -1) {
    separator = " ";
    if (trimmedString.lastIndexOf(separator) === -1) {
      // if no space exists at all then return the string
      // with max length value
      trimmedString = str.substr(0, length);
      return trimmedString;
    }
  }
  return trimmedString.substr(0, Math.min(trimmedString.length - 1, trimmedString.lastIndexOf(separator))).trim();
};