import { extensionRegex } from 'src/webpack';
import { RuleSetRule } from 'webpack';
import { getGeneratorOptions } from '../generator-options';
import { imageAssetsExtensions } from '../image-assets-extensions';

export const getImagesRule = (
  options: {
    withBuild: boolean,
    useBuildtimeGeneratorOptions: boolean,
  },
): RuleSetRule => ({
  test: extensionRegex(imageAssetsExtensions),
  type: 'asset',
  // Not doing dataURL condition as it is causing issues with SVG #use in safari
  parser: {
    dataUrlCondition: {
      maxSize: 0, // You can make it 4kb by 4 * 1024
    },
  },
  generator: getGeneratorOptions({
    prefix: 'images',
    withBuild: options.withBuild,
    useBuildtimeGeneratorOptions: options.useBuildtimeGeneratorOptions,
  }),
});
