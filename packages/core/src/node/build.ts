import path from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';
import fse from 'fs-extra';
import { pathToFileURL } from 'node:url';
import webpack from 'webpack';
import { extractChunksMap } from '../utils/asset-extract.js';
import { WebpackHandler } from '../webpack.js';
import { RunOptions } from '../typedefs/server.js';

const webpackStatsDisplayOptions: webpack.StatsOptions = {
  colors: true,
  performance: true,
  errors: true,
  warnings: true,
  assets: false,
  moduleAssets: false,
  modules: false,
};

export const run = async (options: RunOptions) => {
  const projectWebpack = path.resolve(options.projectRoot, 'webpack.js');
  let WHandler: typeof WebpackHandler = WebpackHandler;
  if (projectWebpack && existsSync(projectWebpack)) {
    const projectWebpackHandler = await import(pathToFileURL(projectWebpack).toString());
    if (!projectWebpackHandler.default) {
      // eslint-disable-next-line no-console
      console.error('webpack.js should default export a class extending WebpackHandler.');
    } else if (!(projectWebpackHandler.default.prototype instanceof WebpackHandler)) {
      // eslint-disable-next-line no-console
      console.error('webpack.js should extends WebpackHandler from "@reactpwa/core/webpack"');
    } else {
      // No issues at all, create an instance of project handler instead
      WHandler = projectWebpackHandler.default;
    }
  }

  const webWebpackHandler = new WHandler({
    mode: options.mode,
    target: 'web',
    projectRoot: options.projectRoot,
    buildWithHttpServer: false,
    envVars: options.envVars ?? {},
    config: options.config ?? {},
  });

  const nodeWebpackHandler = new WHandler({
    mode: options.mode,
    target: 'node',
    projectRoot: options.projectRoot,
    buildWithHttpServer: true,
    envVars: options.envVars ?? {},
    config: options.config ?? {},
    copyPublicFolder: true,
  });

  const WebConfig: webpack.Configuration = webWebpackHandler.getConfig();
  const ServerConfig: webpack.Configuration = nodeWebpackHandler.getConfig();

  const webCompiler = webpack(WebConfig);
  const serverCompiler = webpack(ServerConfig);

  webCompiler.run((webErr, webStats) => {
    if (webErr) {
      // eslint-disable-next-line no-console
      console.error(webErr);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log(webStats?.toString(webpackStatsDisplayOptions));

    const webChunksMap = extractChunksMap(webStats);
    serverCompiler.run((serverErr, serverStats) => {
      if (serverErr) {
        // eslint-disable-next-line no-console
        console.error(serverErr);
        process.exit(1);
      }
      // eslint-disable-next-line no-console
      console.log(serverStats?.toString(webpackStatsDisplayOptions));
      // Move images and assets folder to build
      if (ServerConfig.output?.path) {
        const serverImagesPath = path.resolve(
          ServerConfig.output.path,
          'images',
        );
        const buildImagesPath = path.resolve(
          ServerConfig.output.path,
          'build',
          'images',
        );
        if (existsSync(serverImagesPath)) {
          fse.copySync(serverImagesPath, buildImagesPath, {
            overwrite: false,
            recursive: true,
          });
          fse.removeSync(serverImagesPath);
        }

        const serverAssetsPath = path.resolve(
          ServerConfig.output.path,
          'assets',
        );
        // Copy to build/assets
        const buildAssetsPath = path.resolve(
          ServerConfig.output.path,
          'build',
          'assets',
        );
        if (existsSync(serverAssetsPath)) {
          fse.copySync(serverAssetsPath, buildAssetsPath, {
            overwrite: false,
            recursive: true,
          });
          fse.removeSync(serverAssetsPath);
        }
        const chunksMapFilePath = path.join(
          ServerConfig.output.path,
          'chunks-map.json',
        );
        writeFileSync(
          chunksMapFilePath,
          JSON.stringify(webChunksMap),
          {
            encoding: 'utf-8',
          },
        );
      }
    });
  });
};
