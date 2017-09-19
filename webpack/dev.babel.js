/**
 * @author: Atyantik Technologies Private Limited
 */
import webpack from "webpack";

/**
 * @description Enable multiple loaders to be executed parallel for a single
 * RegExp match
 */
import multi from "multi-loader";

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

/**
 * Get FS filesystem from nodejs
 */
import fs from "fs";

import {
  enableServiceWorker,
  enableCommonStyles,
  images,
  isolateVendorScripts,
} from "../settings";

import {
  buildDir,
  buildPublicPath,
  distDir,
  pagesDir,
  srcDir,
  srcPublicDir,
} from "../directories";

const pages = fs.readdirSync(pagesDir);
let entries = {};

pages.forEach(page => {
  const slugishName = page.replace(".js", "").replace(/['" !@#$%]/g, "_");
  entries[`mod-${slugishName}`] = [
    "react-hot-loader/patch",
    path.join(pagesDir, page),
    "webpack-hot-middleware/client?path=/__hmr_update&timeout=2000&overlay=true"
  ];
});


const rules = [
  // Rules for js or jsx files. Use the babel loader.
  // Other babel configuration can be found in .babelrc
  {
    test: /\.jsx?$/,
    include: srcDir,
    use: [
      {
        loader: "babel-loader",
      },
      {
        loader: "eslint-loader",
      }
    ]
  },
  
  // Managing styles which are not present in resources folder
  {
    test: /\.(sass|scss|css)$/, // Check for sass or scss file names,
    ...(enableCommonStyles ? {
      exclude: [
        // We do not want to include sass|scss|css from resources with local ident
        path.join(srcDir, "resources"),
      ]
    }: {}),
    use: [
      {
        loader: "style-loader",
        options: { sourceMap: true }
      },
      {
        loader: "css-loader",
        options: {
          modules: true,
          localIdentName: "[name]__[local]",
          sourceMap: true,
          minimize: false,
          importLoaders: 2
        }
      },
      {
        loader: "postcss-loader",
        options: { sourceMap: true }
      },
      {
        loader: "sass-loader",
        options: {
          outputStyle: "expanded",
          sourceMap: true,
          sourceMapContents: true,
        }
      }
    ]
  },
  
  // Managing styles present in resources folder, they do not need complex IdentName
  // Just [local]
  ...(enableCommonStyles ? [
    {
      test: /\.(sass|scss|css)$/, //Check for sass or scss file names,
      include: [
        path.join(srcDir, "resources"),
      ],
      use: [
        {
          loader: "style-loader",
          options: { sourceMap: true }
        },
        {
          loader: "css-loader",
          options: {
            modules: true,
            localIdentName: "[local]",
            sourceMap: true,
            minimize: false,
            importLoaders: 2
          }
        },
        {
          loader: "postcss-loader",
          options: { sourceMap: true }
        },
        {
          loader: "sass-loader",
          options: {
            outputStyle: "expanded",
            sourceMap: true,
            sourceMapContents: true,
          }
        }
      ],
    }
  ]: {}),
  
  // Managing fonts
  {
    test: /\.(eot|ttf|woff|woff2)$/,
    use: "file-loader?outputPath=fonts/&name=[name].[ext]"
  },
  
  // Manage svg from overall application
  {
    test: /\.svg$/i,
    use: [
      "file-loader?outputPath=images/&name=[name].[ext]",
    ]
  },
  
  // Manage images
  // Create webp copy of jpeg,png and gif images if useWebP is set to true
  {
    test: /\.(jpe?g|png|gif)$/i,
    use: [
      multi(...[
        ...(images.useWebP ? ["file-loader?outputPath=images/&name=[name].[ext].webp!webp-loader?{quality: 80}"] : []),
        "file-loader?outputPath=images/&name=[name].[ext]",
      ])
    ]
  },
];

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
      path.join(srcDir, "client.js"),
      "webpack-hot-middleware/client?name=common-client&path=/__hmr_update&timeout=2000&overlay=true"
    ],
    ...(enableCommonStyles ? {
      "common-style": path.join(srcDir, "resources", "css", "style.scss")
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
      "node_modules",
      srcDir
    ],
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
    
    // Extract the CSS so that it can be moved to CDN as desired
    // Also extracted CSS can be loaded parallel
    new ExtractTextPlugin("[name].[hash].min.css"),
    
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
        include: srcDir,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "eslint-loader",
          }
        ]
      },
  
      {
        test: /\.(sass|scss|css)$/,
        ...(enableCommonStyles ? {
          exclude: [
            // We do not want to include sass|scss|css from resources with local ident
            path.join(srcDir, "resources"),
          ]
        }: {}),
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                modules: true,
                localIdentName: "[name]__[local]___[hash:base64:5]",
                minimize: true,
                sourceMap: false,
                importLoaders: 2,
              }
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: false
              }
            },
            {
              loader: "sass-loader",
              options: {
                outputStyle: "compressed",
                sourceMap: false,
                sourceMapContents: false,
              }
            },
          ]
        }),
      },
  
      // Managing styles present in resources folder, they do not need complex IdentName
      // Just [local]
      ...(enableCommonStyles? [
        {
          test: /\.(sass|scss|css)$/, //Check for sass or scss file names,
          include: [
            path.join(srcDir, "resources"),
          ],
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: {
                  modules: true,
                  localIdentName: "[local]",
                  sourceMap: true,
                  minimize: false,
                  importLoaders: 2
                }
              },
              {
                loader: "postcss-loader",
                options: { sourceMap: true }
              },
              {
                loader: "sass-loader",
                options: {
                  outputStyle: "expanded",
                  sourceMap: true,
                  sourceMapContents: true,
                }
              }
            ]
          }),
        }
      ]: {}),
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
      "node_modules",
      srcDir
    ],
  },
  
  devtool: "eval-source-map",
  
  plugins: [
    // Enable no errors plugin
    new webpack.NoEmitOnErrorsPlugin(),
  
    // Extract the CSS so that it can be moved to CDN as desired
    // Also extracted CSS can be loaded parallel
    new ExtractTextPlugin({
      filename: "service-worker.min.css"
    }),
  ]
};

// Export the client config by default
let exportConfig = commonClientConfig;

// service worker is enabled for the application
// export multiple config
if (enableServiceWorker) {
  exportConfig = [commonClientConfig, serviceWorkerConfig];
}
export default exportConfig;
