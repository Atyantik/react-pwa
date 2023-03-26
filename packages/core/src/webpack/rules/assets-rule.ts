import { staticAssetsExtensions } from '../static-assets-extensions.js';
import { extensionRegex } from '../utils.js';

export const getAssetsRule = (options: { emit: boolean }) => ({
  test: extensionRegex(staticAssetsExtensions),
  type: 'asset',
  generator: {
    emit: options.emit,
  },
});
