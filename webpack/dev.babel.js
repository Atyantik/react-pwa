/**
 * @author: Atyantik Technologies Private Limited
 */
import webpack from "webpack";

/**
 * @description PostCSS plugin to parse CSS and add vendor prefixes
 * to CSS rules using values from Can I Use. It is recommended by Google
 * and used in Twitter and Taobao.
 */
import autoprefixer from "autoprefixer";
import path from "path";
import fs from "fs";

import {
  srcDir,
  buildDir,
  buildPublicPath,
  srcPublicDir
} from "./directories";

const pagesFolder = path.join(srcDir, "pages");
const pages = fs.readdirSync(pagesFolder);
let entries = {};
pages.forEach(page => {
  const slugishName = page.replace(".js", "").replace(/['" \-!@#$%]/g, "_");
  entries[`mod-${slugishName}`] = path.join(pagesFolder, page);
});


export default {

  // The base directory, an absolute path, for resolving entry points
  // and loaders from configuration. Lets keep it to /src
  context: srcDir,

  // The point or points to enter the application. At this point the
  // application starts executing. If an array is passed all items will
  // be executed.
  entry: Object.assign({}, {
    // Adding react hot loader as entry point for
    "dev-react-hot-loader": "react-hot-loader/patch",

    // development with webpack
    "dev-webpack": "webpack-hot-middleware/client?path=/__hot_update&timeout=2000&overlay=true",

    "client": path.join(srcDir, "client.js"),
  }, entries),

  //These options determine how the different types of modules within
  // a project will be treated.
  module: {
    rules: [
      // Rules for js or jsx files. Use the babel loader.
      // Other babel configuration can be found in .babelrc
      {
        test: /\.jsx?$/,
        include: srcDir,
        use: [
          {
            loader: "react-hot-loader/webpack",
          },
          {
            loader: "babel-loader",
          }
        ]
      },
      {
        test: /\.(sass|scss)$/, //Check for sass or scss file names
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader?modules&localIdentName=[name]__[local]&minimize&sourceMap&importLoaders=2",
          },
          {
            loader: "postcss-loader",
          },
          {
            loader: "sass-loader?outputStyle=expanded&sourceMap&sourceMapContents",
          }
        ]
      },
    ],
  },
  output: {

    // Output everything in build folder (dist/public/build)
    path: buildDir,

    // The file name to output
    filename: "[name].[hash].bundle.js",

    // public path is assets path
    publicPath: buildPublicPath,
  },

  devServer: {
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
  },

  devtool: "source-map",

  plugins: [

    // Hot module replacement for getting latest updates
    // thus no reload required
    new webpack.HotModuleReplacementPlugin(),

    // Create common chunk of data
    // Break data in common so that we have minimum data to load
    new webpack.optimize.CommonsChunkPlugin({
      name: "commons-vendor",
      filename: "common-vendor-[hash].js",
      minChunks: function (module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context &&
          (
            module.context.indexOf("node_modules") !== -1 ||
            module.resource.indexOf("/src/client") !== -1
          );
      },
    }),

    //CommonChunksPlugin will now extract all the common modules from vendor and main bundles
    new webpack.optimize.CommonsChunkPlugin({
      name: "commons-manifest",
      filename: "common-manifest-[hash].js" //But since there are no more common modules between them we end up with just the runtime code included in the manifest file
    }),

    // Enable no errors plugin
    new webpack.NoEmitOnErrorsPlugin(),

    // Sass loader options for autoprefix
    new webpack.LoaderOptionsPlugin({
      options: {
        context: "/",
        sassLoader: {
          includePaths: [srcDir]
        },
        postcss: function () {
          return [autoprefixer];
        }
      }
    })
  ],
};
