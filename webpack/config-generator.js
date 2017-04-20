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
import path from "path";

/**
 * @description Public directory name preferred during
 * application building and in src folder
 * @type {string}
 */
const publicDirName = "public";

/**
 * @description Distribution directory name where all the code will
 * be available after a build is run
 * @type {string}
 */
const distDirName = "dist";

/**
 * @description When a build is generated its usually in format
 *  - dist
 *    - public
 *       - build
 *         {build files}
 *       - css
 *       - js
 *       - other assets
 *    - Server compilation files (server.prod.bundle.js)
 * @type {string}
 */
const buildDirName = "build";

/**
 * @description the source of all the files
 * This directory contains app, client, server, routes, configs
 * @type {string}
 */
const srcDirName = "src";

/**
 * @description buildPublicPath is the path that would be used by dev server
 * and the files will be dropped in the path relative to distribution folder
 * @type {string}
 */
const buildPublicPath = `/${publicDirName}/${buildDirName}/`;

// Directory structure
// Root dir is the project root
export const rootDir = path.resolve(__dirname + "/../");

// Distribution dir is the directory where
// We will put all the output dir
export const distDir = path.resolve(path.join(rootDir, distDirName));

// Src dir is the source of all the files, including server,
// api, client etc
export const srcDir = path.resolve(path.join(rootDir, srcDirName));

// Public directory where all the assets are stored
export const srcPublicDir = path.resolve(path.join(srcDir, publicDirName));

export const distPublicDir = path.join(distDir, publicDirName);

export const buildDir = path.join(distPublicDir, buildDirName);

const getConfig = ({

  // Default hash, will pass [chuckhash] when building for production
  hash = "[hash]",

  // Custom plugins
  plugins = [],

  // Entries may differ for client and server
  entry = {},

  // webpack-dev-server configurations
  devServer = {},

  // we need source map while developing
  devtool = "source-map",

  // Default target is web, except for server which would be
  // node
  target = "web",

  // By default we assume that everything will go to
  // /dist/public/build but would be configurable as
  // for server we would need /dist, so lets allow it to pass it
  // as parameter
  buildOutputDir = buildDir,
}) => {
  return {

    // The base directory, an absolute path, for resolving entry points
    // and loaders from configuration. Lets keep it to /src
    context: srcDir,

    // The point or points to enter the application. At this point the
    // application starts executing. If an array is passed all items will
    // be executed.
    entry: entry,

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

        // Output css and use postcss for only required css loading
        {
          test: /\.(sass|scss)$/, //Check for sass or scss file names
          loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              "css-loader?modules&localIdentName=[name]__[local]&minimize&sourceMap&importLoaders=2",
              "postcss-loader",
              "sass-loader?outputStyle=expanded&sourceMap&sourceMapContents"
            ]
          }),
        }
      ],
    },
    output: {

      // Output everything in dist folder
      path: buildOutputDir,

      // The file name to output
      filename: `[name].${hash}.bundle.js`,

      // public path is assets path
      publicPath: buildPublicPath,
    },

    target,

    devServer,

    devtool,

    plugins: [
      ...plugins,

      // Enable no errors plugin
      new webpack.NoEmitOnErrorsPlugin(),

      // Extract the CSS so that it can be moved to CDN as desired
      // Also extracted CSS can be loaded parallel
      new ExtractTextPlugin(`[name].${hash}.min.css`),

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
};

export default getConfig;
