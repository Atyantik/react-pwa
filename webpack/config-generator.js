import webpack from "webpack";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import autoprefixer from "autoprefixer";
import path from "path";


const publicDirName = "public";
const distDirName = "dist";
const buildDirName = "build";
const srcDirName = "src";

const publicPath = `/${publicDirName}/${buildDirName}/`;

// Directory structure

// Root dir is the project root
export const rootDir = path.resolve(__dirname + "/../");

// Distribution dir is the directory where
// We will put all the output dir
export const distDir = path.join(rootDir, distDirName);

// Src dir is the source of all the files, including server,
// api, client etc
export const srcDir = path.join(rootDir, srcDirName);

// Public directory where all the assets are stored
export const publicDir = path.join(srcDir, publicDirName);

export const buildDir = path.join(distDir, publicDirName, buildDirName);

const getConfig = ({
  hash = "[hash]",
  plugins = [],
  entry = {},
  devServer = {},
  devtool = "source-map",
  target = "web",
  distDir = buildDir,
}) => {
  return {
    context: srcDir,
    entry: entry,
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
      path: distDir,

      // The file name to output
      filename: `[name].${hash}.bundle.js`,

      // public path is assets path
      publicPath: publicPath,
    },

    target,

    devServer,

    devtool,

    plugins: [
      ...plugins,

      // Enable no errors plugin
      new webpack.NoEmitOnErrorsPlugin(),

      // Extract the CSS so that it can be moved to CDN as desired
      // Also extracted CSS can be loaded parallely
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
