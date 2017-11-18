import path from "path";

/**
 * Directory structure for the application
 *  dist
 *    images  --> server images
 *    public --> Public folder that can be pushed to cdn
 *      build --> Compiled files
 *    middleware.js --> Single compiled server file
 *  node_modules
 *  core --> Core root
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
 *    client.js --> Client entry js
 *    routes.js --> Consolidated routes
 *    server.js --> Start server
 *    service-worker.js --> Service worker of your own!
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
export const distDirName = "dist";

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
export const buildDirName = "build";

/**
 * @description the source of all the files
 * This directory contains app, client, server, routes, configs
 * @type {string}
 */
const srcDirName = "src";

/**
 * @description the source of all the pages that needs code splitting
 * @type {string}
 */
const pagesDirName = "pages";

export const buildPath = "/" + buildDirName + "/";
/**
 * @description buildPublicPath is the path that would be used by dev server
 * and the files will be dropped in the path relative to distribution folder
 * @type {string}
 */
export const buildPublicPath = "/" + publicDirName + buildPath;

// Directory structure
// Root dir is the project root
export const rootDir = path.resolve(__dirname);

export const coreDirName = "core";
export const coreRootDir = path.resolve(path.join(rootDir, coreDirName));
export const coreSrcDir = path.resolve(path.join(coreRootDir, "src"));

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

export const pagesDir = path.join(srcDir, pagesDirName);