/* eslint-disable @typescript-eslint/no-unused-vars */
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
    const projectWebpackHandler = await import(
      pathToFileURL(projectWebpack).toString()
    );
    if (!projectWebpackHandler.default) {
      // eslint-disable-next-line no-console
      console.error(
        'webpack.js should default export a class extending WebpackHandler.',
      );
    } else if (
      !(projectWebpackHandler.default.prototype instanceof WebpackHandler)
    ) {
      // eslint-disable-next-line no-console
      console.error(
        'webpack.js should extends WebpackHandler from "@reactpwa/core/webpack"',
      );
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
    serverSideRender: options.serverSideRender ?? true,
  });

  const nodeWebpackHandler = new WHandler({
    mode: options.mode,
    target: 'node',
    projectRoot: options.projectRoot,
    buildWithHttpServer: true,
    envVars: options.envVars ?? {},
    config: options.config ?? {},
    copyPublicFolder: true,
    serverSideRender: options.serverSideRender ?? true,
  });

  const WebConfig: webpack.Configuration = webWebpackHandler.getConfig();
  const ServerConfig: webpack.Configuration = nodeWebpackHandler.getConfig();

  const compiler = webpack([WebConfig, ServerConfig]);

  try {
    // Clean the dist folder
    if (
      ServerConfig?.output?.path
      && fse.existsSync(ServerConfig.output.path)
    ) {
      fse.removeSync(ServerConfig.output.path);
    }
    const compileStats: webpack.MultiStats | undefined = await new Promise(
      (resolve, reject) => {
        compiler.run((webErr, stats) => {
          if (webErr) {
            // eslint-disable-next-line no-console
            reject(webErr);
            return;
          }
          // eslint-disable-next-line no-console
          console.log(stats?.toString(webpackStatsDisplayOptions));

          if (ServerConfig.output?.path) {
            const webStats = stats?.stats.find(
              (s) => s.compilation.name === 'web',
            );
            const webChunksMap = extractChunksMap(webStats);
            const chunksMapFilePath = path.join(
              ServerConfig.output.path,
              'chunks-map.json',
            );
            writeFileSync(chunksMapFilePath, JSON.stringify(webChunksMap), {
              encoding: 'utf-8',
            });
          }
          resolve(stats);
        });
      },
    );
    return compileStats;
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.error(ex);
    process.exit(1);
  }
  return undefined;
};
