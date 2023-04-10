import path from 'node:path';
import { existsSync } from 'node:fs';
import { Server } from 'http';
import { pathToFileURL } from 'url';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { WebpackHandler } from '../webpack.js';
import { requireFromString } from '../utils/require-from-string.js';
import { extractChunksMap } from '../utils/asset-extract.js';
import { RunOptions } from '../typedefs/server.js';

let expressServer: ReturnType<typeof express>;

const startServer = () => new Promise<Server>((resolve) => {
  const port = +(process?.env?.PORT ?? '0') || 3000;
  const httpServer = expressServer.listen(
    {
      port,
    },
    () => {
      // eslint-disable-next-line no-console
      console.info(`Server now listening on http://localhost:${port}`);
      resolve(httpServer);
    },
  );
});

export const run = async (options: RunOptions): Promise<Server> => {
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

  expressServer = express();
  expressServer.set('trust proxy', true);

  const webWebpackHandler = new WHandler({
    mode: options.mode,
    target: 'web',
    projectRoot: options.projectRoot,
    envVars: options.envVars,
    config: options.config,
    serverSideRender: options.serverSideRender ?? true,
  });

  const nodeWebpackHandler = new WHandler({
    mode: options.mode,
    target: 'node',
    projectRoot: options.projectRoot,
    envVars: options.envVars,
    config: options.config,
    serverSideRender: options.serverSideRender ?? true,
  });

  const WebConfig: webpack.Configuration = webWebpackHandler.getConfig();
  const ServerConfig: webpack.Configuration = nodeWebpackHandler.getConfig();

  const compiler = webpack([WebConfig, ServerConfig]);
  const devMiddleware = webpackDevMiddleware(compiler, {
    serverSideRender: true,
    writeToDisk: true,
  });
  expressServer.use(devMiddleware);

  const webCompiler = compiler.compilers.find((n) => n.name === 'web');
  if (webCompiler) {
    const hotMiddleware = webpackHotMiddleware(webCompiler);
    expressServer.use(hotMiddleware);
  }

  expressServer.use(
    express.static(path.join(options.projectRoot, 'src', 'public')),
  );

  compiler.hooks.done.tap('InformServerCompiled', async (compilation) => {
    const nodePath = process.env.NODE_PATH || '';

    const jsonWebpackStats = compilation.toJson();
    // Get webStats and nodeStats
    const webStats = jsonWebpackStats.children?.find?.((c) => c.name === 'web');
    const nodeStats = jsonWebpackStats.children?.find?.(
      (c) => c.name === 'node',
    );

    if (!webStats || !nodeStats) return;
    expressServer.locals.chunksMap = extractChunksMap(webStats);

    const { outputPath } = nodeStats;
    if (outputPath) {
      const serverFilePath = path.join(outputPath, 'server.cjs');
      const nodeCompiler = compiler.compilers.find(
        (c) => c.options.name === 'node',
      );

      // @ts-ignore
      const serverContent = nodeCompiler?.outputFileSystem?.readFileSync?.(
        serverFilePath,
        'utf-8',
      );

      const imported = await requireFromString(serverContent, {
        appendPaths: nodePath.split(path.delimiter),
      });

      /**
       * Remove the old RPWA Router attached to the express app
       * and assign the new router to it.
       */
      // @ts-ignore
      const rpwaRouterIndex = (expressServer.router?.stack ?? []).findIndex(
        (r: any) => r?.name === 'RPWA_Router',
      );
      if (rpwaRouterIndex !== -1) {
        // @ts-ignore
        expressServer.router.stack.splice(rpwaRouterIndex, 1);
      }
      // @ts-ignore
      const stack = expressServer.router?.stack ?? [];
      const rpwaClientRouterIndex = stack.findIndex(
        (r: any) => r?.name === 'RPWA_App_Server',
      );
      if (rpwaClientRouterIndex !== -1) {
        // @ts-ignore
        expressServer.router.stack.splice(rpwaClientRouterIndex, 1);
      }

      if (
        imported.appServer
        && (Object.keys(imported.appServer).length
          || typeof imported.appServer === 'function')
      ) {
        expressServer.use(imported.appServer);
      }
      expressServer.use(imported.router);
    }
  });

  const httpServer = await startServer();
  return httpServer;
};
