import path from "path";
/**
 * @description It moves all the require("style.css")s in entry chunks into
 * a separate single CSS file. So your styles are no longer inlined
 * into the JS bundle, but separate in a CSS bundle file (styles.css).
 * If your total stylesheet volume is big, it will be faster because
 * the CSS bundle is loaded in parallel to the JS bundle.
 */
import ExtractTextPlugin from "extract-text-webpack-plugin";

import {
  srcDir
} from "../directories";

export default ({ imageOutputPath = "images/" }) => {
  return [
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
  
    //Check for sass or scss file names directory other than resources.
    {
      test: /\.(sass|scss)$/,
      exclude: [
        path.join(srcDir, "resources"),
      ],
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
  
    // Handle svg files without converting them to base64 backward compatibility issue
    {
      test: /\.svg$/,
      include: [
        path.join(srcDir, "resources", "images"),
      ],
      use: [
        `file-loader?hash=sha512&digest=hex&outputPath=${imageOutputPath}&name=[name]-[hash].[ext]`,
        {
          loader: "img-loader",
          options: {
            enabled: true,
            svgo: {
              plugins: [
                { removeTitle: true },
                { convertPathData: false }
              ]
            }
          }
        },
      ]
    },
    
    // Manage PWA icons
    {
      test: /\.(jpe?g|png)$/,
      include: [
        path.join(srcDir, "resources", "images", "pwa"),
      ],
      use: [
        `file-loader?hash=sha512&digest=hex&outputPath=${imageOutputPath}pwa/&name=[name]-[hash].[ext]`,
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
          }
        }
      ]
    },
  
    // Add webp loading to jpeg/png/gif files, this causes issues with large files
    // remove webp in such case
    {
      test: /\.(jpe?g|png|gif)$/,
      include: [
        path.join(srcDir, "resources", "images"),
      ],
      exclude: [
        path.join(srcDir, "resources", "images", "pwa"),
      ],
      use: [
        `url-loader?limit=10240&hash=sha512&digest=hex&outputPath=${imageOutputPath}&name=[name]-[hash].webp`,
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
          }
        },
        "webp-loader?{quality: 80}",
      ]
    },
  
    // Manage fonts
    {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      include: [
        path.join(srcDir, "resources", "fonts"),
      ],
      loader: "file-loader?outputPath=fonts/&name=[name]-[hash].[ext]"
    },
  
    // Manage CSS and SASS from resources directory
    {
      test: /\.(sass|scss|css)$/, //Check for sass or scss file names,
      include: [
        path.join(srcDir, "resources"),
      ],
      loader: ExtractTextPlugin.extract({
        fallback: "style-loader?sourceMap=false",
        use: [
          {
            loader: "css-loader",
            options: {
              modules: true,
              localIdentName: "[local]",
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
              outputStyle: "expanded",
              sourceMap: false,
              sourceMapContents: false,
            }
          },
        ]
      }),
    },
  ];
};