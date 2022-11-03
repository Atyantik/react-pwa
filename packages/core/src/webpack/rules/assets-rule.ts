import { getGeneratorOptions } from '../generator-options.js';
import { staticAssetsExtensions } from '../static-assets-extensions.js';
import { extensionRegex } from '../utils.js';

export const getAssetsRule = (
  options: {
    emit: boolean,
  },
) => ({
  test: extensionRegex(staticAssetsExtensions),
  type: 'asset/resource',
  generator: getGeneratorOptions({
    prefix: 'assets',
    emit: options.emit,
  }),
});
