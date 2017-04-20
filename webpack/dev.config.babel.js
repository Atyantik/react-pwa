import path from "path";
import webpack from "webpack";
import generateConfig, {srcDir} from "./config-generator";
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
  contentBase: path.join(srcDir, "public"),

  compress: true,

  // Yes do a hot reload for sure
  hot: true,

  // Show errors and warning on overlap
  overlay: {
    warnings: true,
    errors: true
  },
};

console.log(devServer);

const plugins = [
  // Hot module replacement for getting latest updates
  new webpack.HotModuleReplacementPlugin(),
  // Create common chunk of data
  new webpack.optimize.CommonsChunkPlugin({
    name: "commons",
    filename: `${hash}.commons.js`,
    minChunks: Infinity,
  }),
];

const devtool = "eval-source-map";

export default generateConfig({
  entry,
  hash,
  devtool,
  devServer,
  plugins
});
