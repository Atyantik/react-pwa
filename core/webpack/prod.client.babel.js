import path from "path";
import fs from "fs";
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
  buildDir,
  buildPath,
  coreRootDir,
  coreSrcDir,
  distDirName,
  distPublicDir,
  pagesDir,
  rootDir,
  srcDir,
  srcPublicDir
} from "../../directories";

import rules, {stats} from "./prod.rules";

const isolateVendorScripts = false;

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
  assetsRegex: /\.(jpe?g|png|gif|svg)\?./i,
  processOutput: function (assets) {
    return `export default ${JSON.stringify(assets)};`;
  }
});

const pages = fs.readdirSync(pagesDir);
let entries = {};
pages.forEach(page => {
  const slugishName = page.replace(/\.jsx?$/, "");
  entries[`mod-${slugishName}`] = path.join(pagesDir, page);
});

const commonStylePath = path.join(srcDir, "resources", "css", "style.scss");
const hasCommonStyle = fs.existsSync(commonStylePath);

export default {
  
  // The base directory, an absolute path, for resolving entry points
  // and loaders from configuration. Lets keep it to /src
  context: srcDir,
  
  // The point or points to enter the application. At this point the
  // application starts executing. If an array is passed all items will
  // be executed.
  entry: Object.assign({}, {
    "client": [
      "babel-polyfill",
      path.resolve(path.join(coreSrcDir, "/client/prod.client.js")),
      (hasCommonStyle ? path.join(srcDir, "resources", "css", "style.scss"): undefined)
    ]
  }, entries),
  
  //These options determine how the different types of modules within
  // a project will be treated.
  module: {
    rules: rules({}),
  },
  
  resolve: {
    modules: [
      path.resolve(path.join(rootDir, "node_modules")),
      path.resolve(path.join(coreRootDir, "node_modules")),
    ],
    alias: {
      "src": srcDir,
    },
  },
  resolveLoader: {
    modules: [
      path.resolve(path.join(rootDir, "node_modules")),
      path.resolve(path.join(coreRootDir, "node_modules")),
      path.resolve(path.join(coreSrcDir, "webpack", "loaders"))
    ]
  },
  
  output: {
    
    // Output everything in dist folder
    path: buildDir,
    
    // The file name to output
    filename: "[name].[chunkhash].bundle.js",
    
    // public path is assets path
    publicPath: buildPath,
  },
  
  devtool: false,
  
  // Stats from rules
  stats,
  
  plugins: [
    // While building remove the dist dir
    new CleanWebpackPlugin([
      distDirName
    ], {
      root: rootDir,
      verbose: true,
    }),
    // Assets plugin to generate
    AssetsPluginInstance,
    
    // Uglify the output so that we have the most optimized code
    new UglifyJSPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
        }
      },
      sourceMap: false,
      parallel: 6,
    }),
    
    // Create common chunk of data
    // Break data in common so that we have minimum data to load
    ...(
      isolateVendorScripts ? [
        new webpack.optimize.CommonsChunkPlugin({
          name: "commons-vendor",
          filename: "common-vendor-[chunkhash].js",
          minChunks: function (module) {
            /** Ignore css files **/
            if(module.resource && (/^.*\.(css|scss|sass)$/).test(module.resource)) {
              return false;
            }
            // this assumes your vendor imports exist in the node_modules directory
            return module.context &&
              (
                module.context.indexOf("node_modules") !== -1 ||
                (module.resource && module.resource.indexOf("/src/client") !== -1)
              );
          },
        }),
      ]: []
    ),
    
    new CopyWebpackPlugin([{
      from: srcPublicDir,
      to: distPublicDir,
    }]),
    
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production")
    }),
    
    // Enable no errors plugin
    // new webpack.NoEmitOnErrorsPlugin(),
    
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
