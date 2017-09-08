import path from "path";

/**
 * Directory structure for the application
 *  bin
 *  dist
 *    images  --> server images
 *    public --> Public folder that can be pushed to cdn
 *      build --> Compiled files
 *    middleware.js --> Single compiled server file
 *  node_modules
 *  src --> Main sources
 *    app
 *      components
 *      containers
 *    config
 *      assets.js --> Do not change this file, its used by webpack
 *      config.js
 *    pages --> All the bundled pages
 *    public --> Public folder adding schema or authentication data etc
 *    resources --> css/images/fonts etc
 *    utils --> Util functions
 *    client.js --> Client entry js
 *    routes.js --> Consolidated routes
 *    middleware.js --> Server instance
 *    start-middleware.js --> Simple start server
 */

/**
 * @description Public directory name preferred during
 * application building and in src folder
 * @type {string}
 */
export const publicDirName = "public";

/**
 * @description Distribution directory name where all the code will
 * be available after a build is run
 * @type {string}
 */
const distDirName = "dist";

/**
 * @description When a build is generated its usually in format
 *  - dist
 *    - public
 *       - build
 *         {build files}
 *       - css
 *       - js
 *       - other assets
 *    - Server compilation files (server.prod.bundle.js)
 * @type {string}
 */
const buildDirName = "build";

/**
 * @description the source of all the files
 * This directory contains app, client, server, routes, configs
 * @type {string}
 */
const srcDirName = "src";

/**
 * @description buildPublicPath is the path that would be used by dev server
 * and the files will be dropped in the path relative to distribution folder
 * @type {string}
 */
export const buildPublicPath = `/${publicDirName}/${buildDirName}/`;

// Directory structure
// Root dir is the project root
export const rootDir = path.resolve(__dirname);

// Distribution dir is the directory where
// We will put all the output dir
export const distDir = path.resolve(path.join(rootDir, distDirName));

// Src dir is the source of all the files, including server,
// api, client etc
export const srcDir = path.resolve(path.join(rootDir, srcDirName));

// Public directory where all the assets are stored
export const srcPublicDir = path.resolve(path.join(srcDir, publicDirName));

export const distPublicDir = path.join(distDir, publicDirName);

export const buildDir = path.join(distPublicDir, buildDirName);

export const images = {
  useWebP: true,
  allowedExtensions: [
    ".bmp",
    ".gif",
    ".jpeg",
    ".jpg",
    ".png",
    ".svg",
  ],
};

/**
 * Enabling this option will create a new file common-vendor which would contain
 * all the 3rdp party modules used anywhere.
 *
 * The drawback of turning this setting ON is when number of node_modules increases
 * the common-vendor JS file size increases
 * The benefit of using this setting is, other code splitting is comparatively less
 * so individual page JS file size decreases
 *
 * I prefer to let it stay ON and only turn it OFF when we need to use application in where
 * bandwidth & large file size is not a concern
 *
 * @type {boolean}
 */
export const isolateVendorScripts = false;

/**
 * Enable service worker for application
 * @type {boolean}
 */
export const enableServiceWorker = false;

/**
 * Isomorphic (Server rendering is disabled when developing app i.e. NODE_ENV = development) by default
 * This settings help you manipulate the setting, if server side rendering should be cached or not!
 *
 * Setting it to true might cause severe performance issues
 */
export const isomorphicDevelopment = false;

// export everything in single object
export default {
  directories: {
    buildPublicPath,
    rootDir,
    distDir,
    srcDir,
    srcPublicDir,
    distPublicDir,
    buildDir
  },
  images,
  isolateVendorScripts,
};