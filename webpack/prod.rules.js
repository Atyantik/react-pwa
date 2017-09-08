import path from "path";
import multi from "multi-loader";
/**
 * @description It moves all the require("style.css")s in entry chunks into
 * a separate single CSS file. So your styles are no longer inlined
 * into the JS bundle, but separate in a CSS bundle file (styles.css).
 * If your total stylesheet volume is big, it will be faster because
 * the CSS bundle is loaded in parallel to the JS bundle.
 */
import ExtractTextPlugin from "extract-text-webpack-plugin";

import {
  srcDir,
  images,
} from "../settings";

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
      test: /\.(sass|scss|css)$/,
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
  
    // Managing styles present in resources folder, they do not need complex IdentName
    // Just [local]
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
    },
  
    // Manage fonts
    {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      include: [
        path.join(srcDir, "resources", "fonts"),
      ],
      loader: "file-loader?outputPath=fonts/&name=[name]-[hash].[ext]"
    },
    
    // Handle svg files without converting them to base64 backward compatibility issue
    {
      test: /\.svg$/,
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
  
    {
      test: /\.(jpe?g|png|gif)$/i,
      use: [
        multi(...[
          ...(images.useWebP ? [`file-loader?outputPath=${imageOutputPath}&name=[name].[ext].webp!webp-loader?{quality: 80}`] : []),
          `file-loader?outputPath=${imageOutputPath}&name=[name].[ext]`,
        ])
      ]
    },
  ];
};