import path from 'node:path';
import webpack from 'webpack';
import { writeFileSync } from 'node:fs';
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

export const run = (options: RunOptions) => {
  const webWebpackHandler = new WebpackHandler({
    mode: options.mode,
    target: 'web',
    projectRoot: options.projectRoot,
    buildWithHttpServer: false,
    envVars: options.envVars ?? {},
    config: options.config ?? {},
  });

  const nodeWebpackHandler = new WebpackHandler({
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
      if (ServerConfig.output?.path) {
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
