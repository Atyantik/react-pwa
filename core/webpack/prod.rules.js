/**
 * @description It moves all the require("style.css")s in entry chunks into
 * a separate single CSS file. So your styles are no longer inlined
 * into the JS bundle, but separate in a CSS bundle file (styles.css).
 * If your total stylesheet volume is big, it will be faster because
 * the CSS bundle is loaded in parallel to the JS bundle.
 */
import path from "path";
import {rootDir, srcDir} from "../../directories";
import {getStylesRule} from "./utils";

// minimal logging
export const stats = {
  assets: false,
  colors: true,
  version: false,
  hash: false,
  timings: false,
  chunks: false,
  chunkModules: false,
  children: false
};

export default ({ imageOutputPath = "images/" }) => {
  return [
    // Rules for js or jsx files. Use the babel loader.
    // Other babel configuration can be found in .babelrc
    {
      test: /pages(\/|\\).*\.jsx?$/,
      include: [
        srcDir,
        path.join(rootDir, "core", "src")
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
    {
      test: /\.jsx?$/,
      include: [
        srcDir,
        path.join(rootDir, "core", "src")
      ],
      use: [
        {
          loader: "babel-loader",
        }
      ]
    },
  
    //Check for sass or scss file names directory other than resources.
    ...[getStylesRule({development: false, extract: true, isResource: false})],
    ...[getStylesRule({development: false, extract: true, isResource: true})],
  
    {
      test: /\.(eot|ttf|woff|woff2)$/,
      loader: `file-loader?outputPath=fonts/&name=[path][hash].[ext]&context=${srcDir}`
    },
  
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
        `file-loader?outputPath=${imageOutputPath}&name=[path][hash].[ext]&context=${srcDir}`,
        {
          loader: "imagemin-loader",
          options: {
            plugins: [
              {
                use: "imagemin-pngquant",
                options: {
                  quality: 80
                }
              },
              {
                use: "imagemin-mozjpeg",
                options: {
                  quality: 80
                }
              },
              {
                use: "imagemin-gifsicle",
                options: {
                  optimizationLevel: 3
                }
              },
              {
                use: "imagemin-optipng",
                options: {
                  optimizationLevel: 7
                }
              }

            ]
          }
        }
      ]
    }
  ];
};