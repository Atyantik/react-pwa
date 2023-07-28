import { resolve } from 'node:path';
import { Configuration } from 'webpack';

export const getWebOutput = (options: {
  projectRoot: string;
  isDevelopment: boolean;
}): Configuration['output'] => ({
  module: false,
  asyncChunks: true,
  path: resolve(options.projectRoot, 'dist', 'build'),
  assetModuleFilename: '_rpwa/assets/[name]-[contenthash][ext]',
  filename: '_rpwa/js/[name]-[contenthash].js',
  cssFilename: '_rpwa/css/[name]-[contenthash].css',
  publicPath: '/',
});

export const getServerOutput = (options: {
  projectRoot: string;
  isDevelopment: boolean;
}): Configuration['output'] => ({
  module: false,
  asyncChunks: false,
  chunkFormat: 'commonjs',
  path: resolve(options.projectRoot, 'dist'),
  filename: 'server.cjs',
  assetModuleFilename: '_rpwa/assets/[name]-[contenthash][ext]',
  publicPath: '/',
  library: {
    type: 'commonjs-module',
  },
});
