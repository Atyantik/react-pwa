import path from "path";

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
export const rootDir = path.resolve(__dirname + "/../");

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