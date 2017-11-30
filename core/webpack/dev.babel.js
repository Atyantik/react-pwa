/**
 * @author: Atyantik Technologies Private Limited
 */
import webpack from "webpack";
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
/**
 * Get path from nodejs
 */
import path from "path";

import fs from "fs";

import {
  buildDir,
  buildPublicPath,
  coreRootDir,
  coreSrcDir,
  distDir,
  rootDir,
  srcDir,
  srcPublicDir,
} from "../../directories";

import {getStylesRule} from "./utils";

let entries = {};

const isolateVendorScripts = false;

const rules = [
  {
    test: /pages(\/|\\).*\.jsx?$/,
    include: [
      srcDir,
      coreSrcDir
    ],
    use: [
      {
        loader: "babel-loader",
      },
      {
        loader: "route-loader",
      }
    ]
  },
  // Rules for js or jsx files. Use the babel loader.
  // Other babel configuration can be found in .babelrc
  {
    test: /\.jsx?$/,
    include: [
      srcDir,
      coreSrcDir
    ],
    use: [
      {
        loader: "babel-loader",
      }
    ]
  },
  ...[getStylesRule({ isResource: false })],
  ...[getStylesRule({ isResource: true })],
  
  // Managing fonts
  {
    test: /\.(eot|ttf|woff|woff2)$/,
    use: "file-loader?outputPath=fonts/&name=[hash].[ext]"
  },
  
  // Manage images
  {
    test: /\.(jpe?g|png|svg|gif|webp)$/i,
    // match one of the loader's main parameters (sizes and placeholder)
    resourceQuery: /[?&](sizes|placeholder)(=|&|\[|$)/i,
    use: [
      "pwa-srcset-loader",
    ]
  },
  {
    test: /\.(jpe?g|png|gif|svg|webp)$/i,
    // match one of the loader's main parameters (sizes and placeholder)
    use: [
      `file-loader?outputPath=images/&name=[path][hash].[ext]&context=${srcDir}`
    ]
  },
];

const commonStylePath = path.join(srcDir, "resources", "css", "style.scss");
const hasCommonStyle = fs.existsSync(commonStylePath);

const commonClientConfig = {
  name: "common-client",
  // The base directory, an absolute path, for resolving entry points
  // and loaders from configuration. Lets keep it to /src
  context: srcDir,
  
  // The point or points to enter the application. At this point the
  // application starts executing. If an array is passed all items will
  // be executed.
  entry: Object.assign({}, {
    "client": [
      "babel-polyfill",
      "react-hot-loader/patch",
      path.join(coreSrcDir, "client/dev.client.js"),
      "webpack-hot-middleware/client?name=common-client&path=/__hmr_update&timeout=2000&overlay=true"
    ],
    ...(hasCommonStyle ? {
      "common-style": commonStylePath
    }: {})
  }, entries),
  
  //These options determine how the different types of modules within
  // a project will be treated.
  module: {
    rules,
  },
  output: {
    
    // Output everything in build folder (dist/public/build)
    path: buildDir,
    
    // The file name to output
    filename: "[name].[hash].bundle.js",
    
    // public path is assets path
    publicPath: buildPublicPath,
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
  
  devServer: {
    // Do not open browser when dev server is started
    open: false,
    
    // the base of content, in our case its the "src/public" folder
    contentBase: srcPublicDir,
    
    compress: false,
    
    // Show errors and warning on overlap
    overlay: {
      warnings: true,
      errors: true
    },
  },
  
  devtool: "eval-source-map",
  
  plugins: [
  
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    }),
    
    // Hot module replacement for getting latest updates
    // thus no reload required
    new webpack.HotModuleReplacementPlugin(),
    
    // Create common chunk of data
    // Break data in common so that we have minimum data to load
    ...(
      isolateVendorScripts ? [
        new webpack.optimize.CommonsChunkPlugin({
          name: "commons-vendor",
          filename: "common-0-vendor-[hash].js",
          minChunks: function (module) {
            
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
        })
      ]: []
    ),
    
    // Enable no errors plugin
    new webpack.NoEmitOnErrorsPlugin(),
    
    // Sass loader options for autoprefix
    new webpack.LoaderOptionsPlugin({
      options: {
        context: "/",
        sassLoader: {
          includePaths: [
            srcDir,
            path.join(rootDir, "core", "src")
          ]
        },
        postcss: function () {
          return [autoprefixer];
        }
      }
    })
  ]
};

/**
 * Service worker need to only worry about JavaScript, other thing should be
 * available via cache or install activity
 */
const serviceWorkerConfig = {
  name: "service-worker",
  // The base directory, an absolute path, for resolving entry points
  // and loaders from configuration. Lets keep it to /src
  context: srcDir,
  
  // The point or points to enter the application. At this point the
  // application starts executing. If an array is passed all items will
  // be executed.
  entry: Object.assign({}, {
    "service-worker": [
      "babel-polyfill",
      path.join(srcDir, "service-worker.js"),
    ]
  }),
  
  //These options determine how the different types of modules within
  // a project will be treated.
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          srcDir,
          coreSrcDir
        ],
        use: [
          {
            loader: "babel-loader",
          }
        ]
      },
  
      ...[getStylesRule({isResource: false, extract: true})],
      ...[getStylesRule({isResource: true, extract: true})],
    ],
  },
  output: {
    
    // Output everything in build folder (dist)
    path: distDir,
    
    // The file name to output
    filename: "[name].js",
    
    // public path is assets path
    publicPath: "/",
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
  
  devtool: "eval-source-map",
  
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    }),
    
    // Enable no errors plugin
    new webpack.NoEmitOnErrorsPlugin(),
  
    // Extract the CSS so that it can be moved to CDN as desired
    // Also extracted CSS can be loaded parallel
    new ExtractTextPlugin({
      filename: "service-worker.min.css"
    }),
  ]
};

export default [commonClientConfig, serviceWorkerConfig];
