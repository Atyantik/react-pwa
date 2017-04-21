import path from "path";
import webpack from "webpack";
import generateConfig, { srcDir, srcPublicDir } from "./config-generator";
const hash = "[hash]";


const entry = {
  // Adding react hot loader as entry point for
  "dev-react-hot-loader": "react-hot-loader/patch",

  // development with webpack
  "dev-webpack": "webpack-hot-middleware/client?path=/__hot_update&timeout=2000&overlay=true",

  // Initial entry point
  // @todo Need to replace with routes
  "app": path.join(srcDir, "client", "index.js"),
};

const devServer = {
  // Do not open browser when dev server is started
  open: false,

  // the base of content, in our case its the "src/public" folder
  contentBase: srcPublicDir,

  compress: true,

  // Show errors and warning on overlap
  overlay: {
    warnings: true,
    errors: true
  },
};

const plugins = [
  // Hot module replacement for getting latest updates
  // thus no reload required
  new webpack.HotModuleReplacementPlugin(),

  // Create common chunk of data
  // Break data in common so that we have minimum data to load
  new webpack.optimize.CommonsChunkPlugin({
    name: "commons",
    filename: `common-${hash}.js`,
    minChunks: Infinity,
  }),
];

// use eval-source-map, fast but insecure. good for dev
const devtool = "eval-source-map";

export default generateConfig({
  entry,
  hash,
  devtool,
  devServer,
  plugins
});
