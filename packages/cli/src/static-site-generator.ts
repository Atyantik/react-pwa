import fs from 'node:fs';
import fse from 'fs-extra';
import path from 'node:path';
import { MultiStats } from 'webpack';
import fetch from 'node-fetch';
import { Server } from 'http';
import { Application } from 'express';

let localServer: Server;

const startLocalServer = async (app: Application) => new Promise<string>((resolve, reject) => {
  localServer = app.listen(() => {
    const address = localServer.address();
    if (!address || typeof address === 'string') {
      localServer.close();
      reject(new Error('Error with express server. Cannot resolve address for static file generation'));
      return;
    }
    resolve(`http://localhost:${address.port}`);
  });
});

const stopLocalServer = async () => localServer.close();

export const generateStaticSite = async (stats: MultiStats | undefined) => {
  if (!stats) {
    return;
  }
  const serverStats = stats.stats.find((s) => s.compilation.name === 'node');
  const webStats = stats.stats.find((s) => s.compilation.name === 'web');

  if (!serverStats || !webStats) {
    return;
  }
  const { outputOptions: serverOutputOptions } = serverStats.compilation;
  const { outputOptions: webOutputOptions } = webStats.compilation;

  const webPath = webOutputOptions.path;
  if (
    serverOutputOptions.path
    && webPath
    && serverOutputOptions.filename
    && fs.existsSync(path.resolve(serverOutputOptions.path, serverOutputOptions.filename.toString()))
  ) {
    const serverCjs = await import(path.resolve(serverOutputOptions.path, serverOutputOptions.filename.toString()));
    const fastifyServer = await (await serverCjs?.default)?.default?.();
    if (fastifyServer) {
      const indexFile = 'index.html';
      const manifestFile = 'manifest.webmanifest';
      // eslint-disable-next-line no-console
      console.info('\nGenerating static files..');
      const localServerBase = await startLocalServer(fastifyServer);

      const [indexResponse, manifestResponse] = await Promise.all([
        fetch(new URL(localServerBase).toString()).then((r) => r.text()),
        fetch(new URL(manifestFile, localServerBase).toString()).then((r) => r.text()),
      ]);
      await stopLocalServer();

      const indexPath = path.join(webPath, indexFile);
      const manifestPath = path.join(webPath, manifestFile);
      fs.writeFileSync(indexPath, indexResponse, 'utf-8');
      fs.writeFileSync(manifestPath, manifestResponse, 'utf-8');
      const currentDir = process.cwd();

      // eslint-disable-next-line no-console
      console.info(`\nStatic files created:
 - index: ${indexPath.replace(currentDir, '')}
 - manifest: ${manifestPath.replace(currentDir, '')}`);
      // eslint-disable-next-line no-console
      console.info('\nRe-organizing static files:\n - Moving dist/build as dist\n');
      try {
        const tempBuildPath = path.join(currentDir, '.reactpwa');
        if (fse.existsSync(tempBuildPath)) {
          fse.removeSync(tempBuildPath);
        }

        fse.moveSync(webPath, tempBuildPath);
        fse.removeSync(serverOutputOptions.path);
        fse.moveSync(tempBuildPath, serverOutputOptions.path);

        // eslint-disable-next-line no-console
        console.info(`Static site generated successfully at: ${serverOutputOptions.path}`);
        process.exit(0);
      } catch (ex) {
        // eslint-disable-next-line
        console.log(ex);
      }
    }
  }
};
