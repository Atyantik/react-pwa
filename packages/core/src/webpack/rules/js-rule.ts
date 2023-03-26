import { resolve } from 'path';
import { RuleSetRule } from 'webpack';
import { notBoolean } from '../../utils/not-boolean.js';
import { getBabelLoaderOptions } from '../loader-options/babel-loader-options.js';

export const getJsRule = (options: {
  projectRoot: string;
  isTargetServer: boolean;
  hotReload: boolean;
  useCache: boolean;
}): RuleSetRule => ({
  test: /\.(j|t)sx?$/,
  exclude: [/node_modules/],
  include: [resolve(options.projectRoot, 'src')],
  use: [
    {
      loader: 'babel-loader',
      options: getBabelLoaderOptions({
        useCache: options.useCache,
        isTargetServer: options.isTargetServer,
        hotReload: options.hotReload,
      }),
    },
  ].filter(notBoolean),
});
