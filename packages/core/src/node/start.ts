import path from 'node:path';
import { pathToFileURL } from 'url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import HttpErrors from 'http-errors';
import webpack from 'webpack';
import fastifyExpress from '@fastify/express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import fastifyCookie from '@fastify/cookie';
import { WebpackHandler } from '../webpack.js';
import { requireFromString } from '../utils/require-from-string.js';
import { extractChunksMap } from '../utils/asset-extract.js';
import { RunOptions } from '../typedefs/server.js';

let fastifyServer: ReturnType<typeof Fastify>;

const startServer = async () => {
  const port = +(process?.env?.PORT ?? '0') || 3000;
  await fastifyServer.listen({
    port,
  });
  // eslint-disable-next-line no-console
  console.info(`Server now listening on http://localhost:${port}`);
};

export const run = async (options: RunOptions) => {
  const projectWebpack = path.resolve(options.projectRoot, 'webpack.js');
  let WHandler: typeof WebpackHandler = WebpackHandler;
  if (projectWebpack) {
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

  fastifyServer = Fastify({
    trustProxy: true,
  });

  fastifyServer.register(fastifyCookie, {
    hook: 'onRequest',
    parseOptions: {},
  });

  const webWebpackHandler = new WHandler({
    mode: options.mode,
    target: 'web',
    projectRoot: options.projectRoot,
    envVars: options.envVars,
    config: options.config,
    useBuildtimeGeneratorOptions: false,
  });

  const nodeWebpackHandler = new WHandler({
    mode: options.mode,
    target: 'node',
    projectRoot: options.projectRoot,
    envVars: options.envVars,
    config: options.config,
    useBuildtimeGeneratorOptions: false,
  });

  const WebConfig: webpack.Configuration = webWebpackHandler.getConfig();
  const ServerConfig: webpack.Configuration = nodeWebpackHandler.getConfig();

  const webCompiler = webpack(WebConfig);
  const serverCompiler = webpack(ServerConfig);

  await fastifyServer.register(fastifyExpress);
  // Web - webpack dev middleware
  const webDevMiddleware = webpackDevMiddleware(webCompiler, { serverSideRender: true });
  fastifyServer.use(webDevMiddleware);
  fastifyServer.use(webpackHotMiddleware(webCompiler));

  // Server - webpack dev middleware
  const serverDevMiddleware = webpackDevMiddleware(serverCompiler, { serverSideRender: true });
  fastifyServer.use(serverDevMiddleware);

  await fastifyServer.register(fastifyStatic, {
    root: path.join(options.projectRoot, 'src', 'public'),
    prefix: '/',
    wildcard: false,
  });

  fastifyServer.get('*', (request, reply) => {
    if (request.url === '/favicon.ico') {
      throw new HttpErrors.NotFound();
    }
    // @ts-ignores
    const { devMiddleware } = reply.raw.locals.webpack;
    const jsonWebpackStats = devMiddleware.stats.toJson();
    const { outputPath } = jsonWebpackStats;
    const { outputFileSystem } = devMiddleware;
    const serverFilePath = path.join(outputPath, 'server.cjs');

    const chunksMap = extractChunksMap(webDevMiddleware.context.stats);
    // fs.writeFileSync('/tmp/a.json', JSON.stringify(webStats, undefined, 2));
    // fs.writeFileSync('/tmp/b.json', JSON.stringify(chunksMap, undefined, 2));

    const serverFile = outputFileSystem.existsSync(serverFilePath);

    if (!serverFile) {
      throw new Error('Cannot find server.js at server.js');
    }

    const nodePath = process.env.NODE_PATH || '';
    try {
      const serverContent = outputFileSystem.readFileSync(serverFilePath, 'utf-8');
      const imported = requireFromString(serverContent, {
        appendPaths: nodePath.split(path.delimiter),
      });
      if (request.url === '/manifest.webmanifest') {
        imported.webmanifestHandler(request, reply);
      } else {
        imported.handler(request, reply, chunksMap);
      }
    } catch (ex) {
      reply.send('Error');
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  });

  await startServer();
  return fastifyServer;
};
