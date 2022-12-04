import { resolve } from 'node:path';
import { Configuration } from 'webpack';

export const getWebOutput = (options: {
  projectRoot: string;
}): Configuration['output'] => ({
  clean: true,
  module: true,
  asyncChunks: true,
  publicPath: '/',
  path: resolve(options.projectRoot, 'dist', 'build'),
  chunkFilename: 'js/[chunkhash].js',
  filename: 'js/[contenthash].js',
  assetModuleFilename: 'assets/[contenthash]-[name][ext][query]',
});

export const getServerOutput = (options: {
  projectRoot: string;
}): Configuration['output'] => ({
  module: false,
  chunkFormat: 'commonjs',
  publicPath: '/',
  path: resolve(options.projectRoot, 'dist'),
  filename: 'server.cjs',
  library: {
    type: 'commonjs',
  },
});
