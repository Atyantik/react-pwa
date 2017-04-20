import path from "path";
import webpack from "webpack";
import AssetsPlugin from "assets-webpack-plugin";
import CleanWebpackPlugin from "clean-webpack-plugin";
import UglifyJSPlugin from "uglifyjs-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

import generateConfig, { srcDir,rootDir,publicDir,distDir } from "./config-generator";

const hash = "[chunkhash]";

const configDirName = "config";

// Config dir is the dir that contains all the configurations
const configDir = path.join(srcDir, configDirName);

const AssetsPluginInstance = new AssetsPlugin({
  filename: "assets.js",
  path: configDir,
  update: true,
  prettyPrint: true,
  processOutput: function (assets) {
    return `export default ${JSON.stringify(assets)};`;
  }
});

const entry = {
  // Initial entry point
  // @todo Need to replace with routes
  "app": path.join(srcDir, "client", "index.js"),
};

const plugins = [
  // While performing production build remove the dist & build dir
  new CleanWebpackPlugin(["dist"], {
    root: rootDir,
    verbose: true,
  }),
  AssetsPluginInstance,
  new UglifyJSPlugin({
    compress: true,
    comments: false,
    sourceMap: false,
  }),
  // Create common chunk of data
  new webpack.optimize.CommonsChunkPlugin({
    name: "commons",
    filename: `${hash}.commons.js`,
    minChunks: Infinity,
  }),
  new CopyWebpackPlugin([
    {
      from: publicDir,
      to: path.join(distDir, "public"),
    }
  ]),
];

const devtool = false;

export default [
  generateConfig({
    hash,
    plugins,
    entry,
    devtool
  }),
  generateConfig({
    hash: "prod",
    distDir: distDir,
    entry: {
      "server": path.join(srcDir, "server", "server.js"),
    },
    devtool,
    target: "node",
  }),
];
