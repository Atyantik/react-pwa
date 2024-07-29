import { resolve } from 'node:path';
import { Configuration } from 'webpack';

export const getWebOutput = (options: {
  projectRoot: string;
  isDevelopment: boolean;
  publicPath: string;
}): Configuration['output'] => ({
  module: true,
  asyncChunks: true,
  path: resolve(options.projectRoot, 'dist', 'build'),
  assetModuleFilename: '_rpwa/assets/[name]-[contenthash][ext]',
  filename: '_rpwa/js/[name]-[contenthash].mjs',
  cssFilename: '_rpwa/css/[name]-[contenthash].css',
  publicPath: options.publicPath ? options.publicPath : '/',
});

export const getServerOutput = (options: {
  projectRoot: string;
  isDevelopment: boolean;
  publicPath: string;
}): Configuration['output'] => ({
  module: false,
  asyncChunks: false,
  chunkFormat: 'commonjs',
  path: resolve(options.projectRoot, 'dist'),
  filename: 'server.cjs',
  assetModuleFilename: '_rpwa/assets/[name]-[contenthash][ext]',
  publicPath: options.publicPath ? options.publicPath : '/',
  library: {
    type: 'commonjs-module',
  },
});
