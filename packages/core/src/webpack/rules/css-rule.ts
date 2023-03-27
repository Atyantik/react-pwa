import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { RuleSetRule } from 'webpack';
import { notBoolean } from '../../utils/not-boolean.js';
import { getCssLoaderOptions } from '../loader-options/css-loader-options.js';
import { getPostcssLoaderOptions } from '../loader-options/post-css-loader-options.js';
import { getSassLoaderOptions } from '../loader-options/sass-loader-options.js';

export const getCssRule = (options: {
  outputCss: boolean;
  emit: boolean;
  sourceMap: boolean;
  detailedIdentName: boolean;
  context: string;
  useCache: boolean;
  sassCompiler: 'sass' | 'node-sass' | 'sass-embedded';
}): RuleSetRule => ({
  test: /\.(css|s[ac]ss)$/i,
  use: [
    options.outputCss || { loader: 'style-loader' },
    options.outputCss && {
      loader: MiniCssExtractPlugin.loader,
      options: { emit: options.emit },
    },
    {
      loader: 'css-loader',
      options: getCssLoaderOptions({
        sourceMap: options.sourceMap,
        detailedIdentName: options.detailedIdentName,
        context: options.context,
      }),
    },
    {
      loader: 'postcss-loader',
      options: getPostcssLoaderOptions(),
    },
    // Compiles Sass to CSS
    {
      loader: 'sass-loader',
      options: getSassLoaderOptions({
        compiler: options.sassCompiler,
      }),
    },
  ].filter(notBoolean),
});
