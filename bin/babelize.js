/**
 * @description This file is for registering babel register
 * thus including server file
 */
/* eslint-disable */
const fs = require("fs");
const path = require("path");

const babelrc = fs.readFileSync(__dirname + "/../.babelrc");
let config;

try {
  config = JSON.parse(babelrc);
} catch (err) {
  console.error("==> ERROR: Error parsing your .babelrc.");
  console.error(err);
}

require("babel-register")(config);

if (process.argv.length > 2) {
  const relativePathToFile = process.argv[2];
  const resolvedFile = path.resolve(`${__dirname}/${relativePathToFile}`);
  if (fs.existsSync(resolvedFile)) {
    require(resolvedFile);
  } else {
    console.log(`Cannot resolve "${relativePathToFile}"`);
    console.log(`Make sure the path os relative to ${path.resolve(__dirname)}`);
  }
} else {
  console.log("Babelize is only helpful when provided with a file name");
  console.log("Usage: nodejs babelize.js <relative path to file>");
  console.log("Example: nodejs babelize.js ./dev.server.js");
}
/* eslint-enable */
