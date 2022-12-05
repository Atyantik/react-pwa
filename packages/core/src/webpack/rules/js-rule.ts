import { resolve } from 'path';
import { RuleSetRule } from 'webpack';
import { getBabelLoaderOptions } from '../loader-options/babel-loader-options.js';

export const getJsRule = (options: {
  projectRoot: string;
  isTargetServer: boolean;
  hotReload: boolean;
  cacheDirectory: boolean;
}): RuleSetRule => ({
  test: /\.(j|t)sx?$/,
  exclude: [/node_modules/],
  include: [resolve(options.projectRoot, 'src')],
  use: {
    // loader: "swc-loader",
    // options: this.getSwcLoaderOptions(),
    loader: 'babel-loader',
    options: getBabelLoaderOptions({
      cacheDirectory: options.cacheDirectory,
      isTargetServer: options.isTargetServer,
      hotReload: options.hotReload,
    }),
  },
});
