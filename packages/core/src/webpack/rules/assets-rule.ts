import { getGeneratorOptions } from '../generator-options.js';
import { staticAssetsExtensions } from '../static-assets-extensions.js';
import { extensionRegex } from '../utils.js';

export const getAssetsRule = (
  options: {
    withBuild: boolean,
    useBuildtimeGeneratorOptions: boolean
  },
) => ({
  test: extensionRegex(staticAssetsExtensions),
  type: 'asset/resource',
  generator: getGeneratorOptions({
    prefix: 'assets',
    withBuild: options.withBuild,
    useBuildtimeGeneratorOptions: options.useBuildtimeGeneratorOptions,
  }),
});
