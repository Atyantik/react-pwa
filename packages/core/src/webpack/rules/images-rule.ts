import { RuleSetRule } from 'webpack';
import { getGeneratorOptions } from '../generator-options.js';
import { imageAssetsExtensions } from '../image-assets-extensions.js';
import { extensionRegex } from '../utils.js';

export const getImagesRule = (options: { emit: boolean }): RuleSetRule => ({
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
    emit: options.emit,
  }),
});
