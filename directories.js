import path from "path";

/**
 * Directory structure for the application
 *  bin
 *  dist
 *    images  --> server images
 *    public --> Public folder that can be pushed to cdn
 *      build --> Compiled files
 *    server.js --> Single compiled server file
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
 *    server.js --> Server instance
 *    start-server.js --> Simple start server
 */

/**
 * @description Public directory name preferred during
 * application building and in src folder
 * @type {string}
 */
const publicDirName = "public";

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