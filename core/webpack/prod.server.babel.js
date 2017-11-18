import path from "path";
import webpack from "webpack";
import UglifyJSPlugin from "uglifyjs-webpack-plugin";
import WebpackDeleteAfterEmit from "webpack-delete-after-emit";
import MoveAfterEmit from "./move-after-emit";
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

import {buildDirName, distDir, publicDirName, rootDir, srcDir} from "../../directories";

import rules, {stats} from "./prod.rules";

export default [{
  
  name: "server",
  // The base directory, an absolute path, for resolving entry points
  // and loaders from configuration. Lets keep it to /src
  context: srcDir,
  
  // The point or points to enter the application. At this point the
  // application starts executing. If an array is passed all items will
  // be executed.
  entry: [
    "babel-polyfill",
    // Initial entry point
    path.join(srcDir, "server.js"),
  ],
  
  //These options determine how the different types of modules within
  // a project will be treated.
  module: {
    rules: rules({
      imageOutputPath: "build/images/",
    }),
  },
  resolve: {
    modules: [
      "node_modules",
      path.resolve(path.join(rootDir, "core", "node_modules")),
    ],
    alias: {
      core: path.resolve(path.join(rootDir, "core", "src")),
      src: path.resolve(path.join(rootDir, "src"))
    }
  },
  resolveLoader: {
    modules: [
      "node_modules",
      path.resolve(path.join(rootDir, "core", "node_modules")),
      path.resolve(path.join(rootDir, "core", "src", "webpack", "loaders"))
    ]
  },
  output: {
    
    // Output everything in dist folder
    path: distDir,
    
    // The file name to output
    filename: "server.js",
    
    // public path is assets path
    publicPath: "/",
  },
  
  node: {
    __filename: false,
    __dirname: false
  },
  target: "node",
  devtool: false,
  stats,
  
  plugins: [
    
    // Uglify the output so that we have the most optimized code
    new UglifyJSPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
        },
      },
      sourceMap: false,
      parallel: 3,
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
    }),
    // Enable no errors plugin
    new webpack.NoEmitOnErrorsPlugin(),
    
    // Extract the CSS so that it can be moved to CDN as desired
    // Also extracted CSS can be loaded parallel
    new ExtractTextPlugin("server.min.css"),
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
    }),
    // We are extracting server.min.css so that we do not have any window code in server.js
    // but we still need the css class names that are generated. Thus we remove the server.min.css
    // after the build process
    new WebpackDeleteAfterEmit({
      globs: [
        "server.min.css",
        "service-worker.min.css"
      ]
    }),
    // Remove build directory generated extra while compiling server
    // Remove build directory generated extra while compiling service-worker.js
    new MoveAfterEmit([{
      from: buildDirName,
      to: publicDirName
    }])
  ],
},
{
  name: "service-worker",
  
  // The base directory, an absolute path, for resolving entry points
  // and loaders from configuration. Lets keep it to /src
  context: srcDir,
  
  // The point or points to enter the application. At this point the
  // application starts executing. If an array is passed all items will
  // be executed.
  entry: {
    "service-worker" : [
      "babel-polyfill",
      // Initial entry point
      path.join(srcDir, "service-worker.js"),
    ]
  },
  
  // These options determine how the different types of modules within
  // a project will be treated.
  module: {
    rules: rules({
      imageOutputPath: "build/images/",
    }),
  },
  resolve: {
    modules: [
      "node_modules",
      path.resolve(path.join(rootDir, "core", "node_modules")),
    ],
    alias: {
      core: path.resolve(path.join(rootDir, "core", "src")),
      src: path.resolve(path.join(rootDir, "src"))
    }
  },
  resolveLoader: {
    modules: [
      "node_modules",
      path.resolve(path.join(rootDir, "core", "node_modules")),
      path.resolve(path.join(rootDir, "core", "src", "webpack", "loaders"))
    ]
  },
  output: {
    
    // Output everything in dist folder
    path: distDir,
    
    // The file name to output
    filename: "[name].js",
    
    // public path is assets path
    publicPath: "/",
  },
  target: "web",
  devtool: false,
  stats,
  
  plugins: [
    
    // Uglify the output so that we have the most optimized code
    new UglifyJSPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
        },
      },
      sourceMap: false,
      parallel: 3,
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
    }),
    // Enable no errors plugin
    new webpack.NoEmitOnErrorsPlugin(),
    
    // Extract the CSS so that it can be moved to CDN as desired
    // Also extracted CSS can be loaded parallel
    new ExtractTextPlugin("service-worker.min.css"),
    
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
    }),
  
    // We are extracting server.min.css so that we do not have any window code in service-worker.js
    // but we still need the css class names that are generated. Thus we remove the server.min.css
    // after the build process
    new WebpackDeleteAfterEmit({
      globs: [
        "server.min.css",
        "service-worker.min.css"
      ]
    }),
    
    // Remove build directory generated extra while compiling service-worker.js
    new MoveAfterEmit([{
      from: buildDirName,
      to: publicDirName
    }])
  ],
}];
