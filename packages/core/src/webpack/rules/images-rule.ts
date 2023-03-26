import { RuleSetRule } from 'webpack';
import { imageAssetsExtensions } from '../image-assets-extensions.js';
import { extensionRegex } from '../utils.js';

export const getImagesRule = (options: { emit: boolean }): RuleSetRule => ({
  test: extensionRegex(imageAssetsExtensions),
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 0, // You can make it 4kb by 4 * 1024
    },
  },
  generator: {
    emit: options.emit,
  },
});
