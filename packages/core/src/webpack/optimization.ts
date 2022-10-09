import { Configuration } from 'webpack';

export const getWebOptimization = (
  options: { minimize: boolean },
): Configuration['optimization'] => ({
  minimize: options.minimize,
  splitChunks: {
    minSize: 2000,
    maxAsyncRequests: 20,
    maxInitialRequests: 20,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        reuseExistingChunk: true,
        name: (modulePath: any) => {
          if (modulePath && typeof modulePath.context === 'string') {
            const reactPackageMatch = modulePath.context.match(
              /[\\/]node_modules[\\/](react|react-dom|scheduler)([\\/]|$)/,
            );
            if (reactPackageMatch) {
              return 'react';
            }
            const packageName = modulePath.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
            )[1];
            // npm package names are URL-safe, but some servers don't like @ symbols
            return `${packageName.replace('@', '')}`;
          }
          return undefined;
        },
      },
    },
  },
});

export const getServerOptimization = (
  options: { minimize: boolean },
): Configuration['optimization'] => ({
  splitChunks: false,
  minimize: options.minimize,
});
