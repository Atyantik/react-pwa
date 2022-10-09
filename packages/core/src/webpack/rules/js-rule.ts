import { resolve } from 'path';
import { RuleSetRule } from 'webpack';
import { getBabelLoaderOptions } from '../loader-options/babel-loader-options.js';

export const getJsRule = (
  options: {
    projectRoot: string,
    isTargetServer: boolean,
    hotReload: boolean,
  },
): RuleSetRule => ({
  test: /\.(j|t)sx?$/,
  exclude: [/node_modules/],
  include: [resolve(options.projectRoot, 'src')],
  use: {
    // loader: "swc-loader",
    // options: this.getSwcLoaderOptions(),
    loader: 'babel-loader',
    options: getBabelLoaderOptions({
      isTargetServer: options.isTargetServer,
      hotReload: options.hotReload,
    }),
  },
});
