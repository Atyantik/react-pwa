import path from "path";
import webpack from "webpack";
import UglifyJSPlugin from "uglifyjs-webpack-plugin";

import generateConfig, { srcDir, distDir } from "./config-generator";

const hash = "prod";

const entry = {
  // Initial entry point
  "server": path.join(srcDir, "server", "server.js"),
};

const plugins = [
  // Uglify the output so that we have the most optimized code
  new UglifyJSPlugin({
    compress: true,
    comments: false,
    sourceMap: false,
  }),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("production")
  })
];

const devtool = false;

export default generateConfig({
  hash,
  buildOutputDir: distDir,
  entry,
  plugins,
  devtool,
  target: "node",
});
