import { resolve } from 'node:path';
import { Configuration } from 'webpack';

export const getWebOutput = (options: {
  projectRoot: string;
  isDevelopment: boolean;
}): Configuration['output'] => ({
  clean: true,
  module: true,
  asyncChunks: true,
  path: resolve(options.projectRoot, 'dist', 'build'),
  assetModuleFilename: options.isDevelopment
    ? '_rpwa/assets/[file][ext]'
    : '_rpwa/assets/[name]-[contenthash][ext]',
  filename: options.isDevelopment
    ? '_rpwa/js/[id].mjs'
    : '_rpwa/js/[name]-[contenthash].mjs',
  cssFilename: options.isDevelopment
    ? '_rpwa/css/[id].css'
    : '_rpwa/css/[name]-[contenthash].css',
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
  assetModuleFilename: options.isDevelopment
    ? '_rpwa/assets/[file][ext]'
    : '_rpwa/assets/[name]-[contenthash][ext]',
  cssFilename: options.isDevelopment
    ? '_rpwa/css/[id].css'
    : '_rpwa/css/[name]-[contenthash].css',
  publicPath: '/',
  library: {
    type: 'commonjs-module',
  },
});
