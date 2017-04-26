import path from "path";
import webpack from "webpack";
import AssetsPlugin from "assets-webpack-plugin";
import CleanWebpackPlugin from "clean-webpack-plugin";
import UglifyJSPlugin from "uglifyjs-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

/**
 * @description It moves all the require("style.css")s in entry chunks into
 * a separate single CSS file. So your styles are no longer inlined
 * into the JS bundle, but separate in a CSS bundle file (styles.css).
 * If your total stylesheet volume is big, it will be faster because
 * the CSS bundle is loaded in parallel to the JS bundle.
 */
import ExtractTextPlugin from "extract-text-webpack-plugin";

/**
 * @description PostCSS plugin to parse CSS and add vendor prefixes
 * to CSS rules using values from Can I Use. It is recommended by Google
 * and used in Twitter and Taobao.
 */
import autoprefixer from "autoprefixer";

import {
  srcDir,
  rootDir,
  srcPublicDir,
  distPublicDir,
  buildDir,
  buildPublicPath
} from "./directories";
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

import fs from "fs";

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
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            "css-loader?modules&localIdentName=[name]__[local]___[hash:base64:5]&minimize&sourceMap&importLoaders=2",
            "postcss-loader",
            "sass-loader?outputStyle=expanded&sourceMap&sourceMapContents"
          ]
        }),
      },
    ],
  },
  output: {

    // Output everything in dist folder
    path: buildDir,

    // The file name to output
    filename: "[name].[chunkhash].bundle.js",

    // public path is assets path
    publicPath: buildPublicPath,
  },

  devtool: false,

  plugins: [
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
    // Break data in common so that we have minimum data to load
    new webpack.optimize.CommonsChunkPlugin({
      name: "commons-vendor",
      filename: "common-vendor-[chunkhash].js",
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
      filename: "common-manifest-[chunkhash].js" //But since there are no more common modules between them we end up with just the runtime code included in the manifest file
    }),

    new CopyWebpackPlugin([
      {
        from: srcPublicDir,
        to: distPublicDir,
      }

    ]),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),

    // Enable no errors plugin
    new webpack.NoEmitOnErrorsPlugin(),

    // Extract the CSS so that it can be moved to CDN as desired
    // Also extracted CSS can be loaded parallel
    new ExtractTextPlugin("[name].[chunkhash].min.css"),
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
