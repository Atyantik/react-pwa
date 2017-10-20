import path from "path";
import ExtractTextPlugin from "extract-text-webpack-plugin";

import {rootDir, srcDir} from "../directories";
const __development = process.env.NODE_ENV === "development";

/**
 * Get style rules based on environment
 * @param development
 * @param isResource
 * @param extract
 */
export const getStylesRule = (
  {
    development = __development,
    isResource = false,
    extract = false,
  }
) => {
  
  const localIdentName = isResource ?
    "[local]":
    (
      development ? "[name]__[local]" : "[name]_[local]_[hash:base64:5]"
    );
  
  const loaderUse = [
    ...(!extract? [{
      loader: "style-loader",
      options: { sourceMap: development }
    }]: {}),
    {
      loader: "css-loader",
      options: {
        modules: true,
        localIdentName: localIdentName,
        sourceMap: development,
        minimize: !development,
        importLoaders: 2
      }
    },
    {
      loader: "postcss-loader",
      options: { sourceMap: development }
    },
    {
      loader: "sass-loader",
      options: {
        outputStyle: development ? "expanded": "compressed",
        sourceMap: development,
        sourceMapContents: development,
      }
    }
  ];
  
  return {
    test: /\.(sass|scss|css)$/, // Check for sass or scss file names,
    
    // If its for resource, include resource path
    ...(isResource ? {
      include: [
        path.join(srcDir, "resources"),
        path.join(rootDir, "node_modules"),
      ]
    }: {}),
  
    // If its not for resource, exclude resource path
    ...(!isResource ? {
      exclude: [
        path.join(srcDir, "resources"),
        path.join(rootDir, "node_modules"),
      ]
    }: {}),
    
    // If not extract is needed then implement use directly
    ...(!extract ? {use: loaderUse}: {}),
  
    ...(extract ? {
      loader: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: loaderUse
      }),
    }: {})
  };
};