import { Configuration } from 'webpack';

export const getWebOptimization = (options: {
  minimize: boolean;
}): Configuration['optimization'] => ({
  minimize: options.minimize,
  splitChunks: {
    minSize: 2000,
    maxAsyncRequests: 20,
    maxInitialRequests: 20,
    cacheGroups: {
      main: {
        name: 'main',
        type: 'css/mini-extract',
        chunks: 'all',
        minChunks: 1,
        reuseExistingChunk: true,
        enforce: true,
      },
    },
  },
});

export const getServerOptimization = (options: {
  minimize: boolean;
}): Configuration['optimization'] => ({
  splitChunks: false,
  minimize: options.minimize,
});
