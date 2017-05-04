import path from "path";
import webpack from "webpack";
import UglifyJSPlugin from "uglifyjs-webpack-plugin";

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
  distDir,
  buildPublicPath,
} from "../directories";

export default {

  // The base directory, an absolute path, for resolving entry points
  // and loaders from configuration. Lets keep it to /src
  context: srcDir,

  // The point or points to enter the application. At this point the
  // application starts executing. If an array is passed all items will
  // be executed.
  entry: [
    "babel-polyfill",
    // Initial entry point
    path.join(srcDir, "startServer.js"),
  ],

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
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        include: [
          path.join(srcDir, "resources", "fonts"),
        ],
        loader: "file-loader?outputPath=fonts/&name=[name]-[hash].[ext]"
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        include: [
          path.join(srcDir, "resources", "images"),
        ],
        use: [
          "url-loader?limit=10240&hash=sha512&digest=hex&outputPath=images/&name=[name]-[hash].[ext]",
          {
            loader: "img-loader",
            options: {
              enabled: true,
              gifsicle: {
                interlaced: false
              },
              mozjpeg: {
                progressive: true,
                arithmetic: false
              },
              optipng: false, // disabled
              pngquant: {
                floyd: 0.5,
                speed: 2
              },
              svgo: {
                plugins: [
                  { removeTitle: true },
                  { convertPathData: false }
                ]
              }
            }
          }
        ]
      },
    ],
  },
  resolve: {
    modules: [
      "node_modules",
      srcDir
    ],
  },
  output: {

    // Output everything in dist folder
    path: distDir,

    // The file name to output
    filename: "server.js",

    // public path is assets path
    publicPath: buildPublicPath,
  },

  target: "node",

  devtool: false,

  plugins: [

    // Uglify the output so that we have the most optimized code
    new UglifyJSPlugin({
      compress: true,
      comments: false,
      sourceMap: false,
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
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
    })
  ],
};