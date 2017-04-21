import path from "path";
import webpack from "webpack";
import AssetsPlugin from "assets-webpack-plugin";
import CleanWebpackPlugin from "clean-webpack-plugin";
import UglifyJSPlugin from "uglifyjs-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

import generateConfig, { srcDir, rootDir, srcPublicDir, distPublicDir } from "./config-generator";

const hash = "[chunkhash]";

const configDirName = "config";

// Config dir is the dir that contains all the configurations
const configDir = path.join(srcDir, configDirName);

// We would need the assets as different file as we
// would like it to include in the dev.server.js
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
  // While building remove the dist dir
  new CleanWebpackPlugin(["dist"], {
    root: rootDir,
    verbose: true,
  }),
  // Assets plugin to generate
  AssetsPluginInstance,

  // Uglify the output so that we have the most optimized code
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
      from: srcPublicDir,
      to: distPublicDir,
    }

  ]),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("production")
  })
];

const devtool = false;

export default generateConfig({
  hash,
  plugins,
  entry,
  devtool
});
