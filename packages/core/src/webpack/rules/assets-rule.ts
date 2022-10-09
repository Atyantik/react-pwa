import { extensionRegex } from '../../webpack.js';
import { getGeneratorOptions } from '../generator-options';
import { staticAssetsExtensions } from '../static-assets-extensions';

export const getAssetsRule = (
  options: {
    withBuild: boolean,
    useBuildtimeGeneratorOptions: boolean
  },
) => ({
  test: extensionRegex(staticAssetsExtensions),
  type: 'asset/resource',
  generator: {
    // We will use content hash for long term caching of asset
    filename: getGeneratorOptions({
      prefix: 'assets',
      withBuild: options.withBuild,
      useBuildtimeGeneratorOptions: options.useBuildtimeGeneratorOptions,
    }),
  },
});
