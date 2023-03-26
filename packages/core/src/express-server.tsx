import path from 'node:path';
import { readFileSync } from 'node:fs';
import express from 'express';
import compression from 'compression';
import { router, appServer } from './server.js';
import { ChunksMap } from './utils/asset-extract.js';

const app = express();
app.set('trust proxy', true);

let webChunksMap: ChunksMap = {
  chunks: [],
};
try {
  const jsonStatsContent = readFileSync(
    path.resolve(__dirname, 'chunks-map.json'),
    {
      encoding: 'utf-8',
    },
  );
  webChunksMap = JSON.parse(jsonStatsContent);
  app.locals.chunksMap = webChunksMap;
} catch {
  // web-chunks's map not found
}

// Enable compression
app.use(compression());

const staticOptions = {
  immutable: true,
  maxAge: 31536000,
  setHeaders: (res: express.Response, pathname: string) => {
    if (pathname.indexOf('/build/') && pathname.indexOf('sw.js') === -1) {
      // We ask the build assets to be cached for 1 year as it would be immutable
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
};

app.use(express.static(path.resolve(__dirname, 'build'), staticOptions));

const init = async () => {
  if (
    appServer
    && (Object.keys(appServer).length || typeof appServer === 'function')
  ) {
    app.use(appServer);
  }
  app.use(router);
  return app;
};

if (require.main === module) {
  const port = +(process?.env?.PORT ?? '0') || 3000;
  // Add host from env
  const host = (process?.env?.HOST ?? '0.0.0.0') || '0.0.0.0';
  const initedServer = await init();
  initedServer.listen(
    {
      port,
      host,
    },
    () => {
      // eslint-disable-next-line no-console
      console.info(`Server now listening on http://${host}:${port}`);
    },
  );
}

export default init;
