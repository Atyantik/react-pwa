/**
 * @description This file is for registering babel register
 * thus including server file
 */
const fs = require("fs");
const path = require("path");

const babelrc = fs.readFileSync(__dirname + "/../.babelrc");
let config;

try {
  config = JSON.parse(babelrc);
} catch (err) {
  // eslint-disable-next-line
  console.error("==> ERROR: Error parsing your .babelrc.");
  // eslint-disable-next-line
  console.error(err);
}

config.plugins.push([
  "css-modules-transform", {
    "generateScopedName": "[name]__[local]",
    "extensions": [".css", ".scss", ".sass"]
  }]);

config.cache = false;

require("babel-register")(config);
require("babel-polyfill");


const settings = require("../settings");
const _  = require("lodash");

const allowedImageExtensions = _.get(settings, "images.allowedExtensions", [
  ".jpeg",
  ".jpg",
  ".png",
  ".gif",
  ".svg",
  ".bmp",
]);

_.each(allowedImageExtensions, ext => {
  require.extensions[ext] = function (module, filename) {
    const name = filename.split("/").pop().replace(ext, "");
    module.exports = `${settings.buildPublicPath}images/${name}${ext}`;
  };
});

if (process.argv.indexOf("--ignore-babelize-require") === -1) {
  if (process.argv.length > 2) {
    const relativePathToFile = process.argv[2];
    const resolvedFile = path.resolve(`${__dirname}/${relativePathToFile}`);
    if (fs.existsSync(resolvedFile)) {
      require(resolvedFile);
    } else {
      // eslint-disable-next-line
      console.log(`Cannot resolve "${relativePathToFile}"`);
      
      // eslint-disable-next-line
      console.log(`Make sure the path os relative to ${path.resolve(__dirname)}`);
    }
  }
}
