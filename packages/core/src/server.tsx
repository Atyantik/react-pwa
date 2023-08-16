import {
  NextFunction, Request, Response, Router,
} from 'express';
import { Writable } from 'stream';
import { matchRoutes } from 'react-router-dom';
import cookiesMiddleware from 'universal-cookie-express';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
// @ts-ignore
import appRoutes from '@currentProject/routes';
// @ts-ignore
import * as customAppServer from '@currentProject/server';

import { CookiesProvider } from 'react-cookie';
import compression from 'compression';
import type { createClient } from 'redis';
import { extractMainScripts, LazyRouteMatch } from './utils/asset-extract.js';
import { App } from './components/app.js';
import { ReactStrictMode } from './components/strict.js';
import { ReactPWAContext } from './components/reactpwa.js';
import { getInternalVar, setInternalVar } from './utils/request-internals.js';
import { statusCodeWithLocations } from './utils/redirect.js';
import {
  getHttpStatusCode,
  getRedirectUrl,
  getRequestArgs,
} from './utils/server.js';
import { IWebManifest } from './typedefs/webmanifest.js';
import {
  initWebmanifest,
  webmanifestHandler,
} from './utils/server/webmanifest.js';
import { getHeadContent } from './utils/server/head.js';
import { cacheData, retrieveData } from './utils/cache.js';
import { getRequestUniqueId } from './utils/server/request-id.js';

// @ts-ignore
const shouldUseCache = ServerCacheStrategy;
type RedisClient = ReturnType<typeof createClient>;

const redisClient = (customAppServer?.redisClient || undefined) as
  | RedisClient
  | undefined;

const extensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'svg',
  'ico',
  'css',
  'js',
  'html',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'mp3',
  'mp4',
  'wav',
  'pdf',
  'map',
  'js',
  'json',
  'css',
];

const isAssetRequest = (requestUrl: string) => requestUrl.match(new RegExp(`\\.(${extensions.join('|')})$`));
/**
 * Initialize the data and routes required to execute the request.
 * @param request Request
 * @returns { routes, mainScripts }
 */
const initializeDataAndRoutes = async (request: Request) => {
  await initWebmanifest(request);
  const routes = typeof appRoutes === 'function'
    ? await appRoutes(getRequestArgs(request))
    : appRoutes;
  const mainScripts = extractMainScripts(request.app.locals.chunksMap);
  return { routes, mainScripts };
};

/**
 *
 * @param request Request
 * @param resolve
 * @param data
 * @param webCharSet
 * @param matchedRoutes
 */
const handleWritableOnFinish = async (
  request: Request,
  resolve: Function,
  data: string,
  webCharSet: string | null,
  matchedRoutes: LazyRouteMatch[],
) => {
  const requestUniqueId = getRequestUniqueId(request);
  const headContent = await getHeadContent(request);
  const footerContent = getInternalVar(
    request,
    'footerScripts',
    [],
  ) as string[];
  const body = `${headContent}${data}${footerContent.join('')}`;

  const statusCode = getHttpStatusCode(request, matchedRoutes);
  let redirectUrl = '';

  if (statusCodeWithLocations.includes(statusCode)) {
    redirectUrl = getRedirectUrl(request);
  }

  const charSet = webCharSet ?? 'utf-8';
  const headers: Record<string, string> = {
    'content-type': `text/html; charset=${charSet}`,
  };

  if (shouldUseCache) {
    try {
      await cacheData(
        requestUniqueId,
        JSON.stringify({
          body,
          headers,
          statusCode,
          redirectUrl,
        }),
        redisClient,
      );
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  }

  resolve({
    body,
    headers,
    statusCode,
    redirectUrl,
  });
};

const handleStreamError = (request: Request, err: unknown) => {
  setInternalVar(request, 'hasExecutionError', true);
  if (err instanceof Error && err.message.indexOf('closed early') === -1) {
    // eslint-disable-next-line no-console
    console.error('An error occurred: ', err);
  } else if (err?.toString?.().indexOf('closed early') === -1) {
    // eslint-disable-next-line no-console
    console.error('An error occurred: ', err);
  }
};

const renderApp = (
  request: Request,
  app: JSX.Element,
  mainScripts: any,
  setRequestValue: (key: string, value: any) => void,
  getRequestValue: <T = any>(key: string, defaultValue: T) => T,
) => renderToPipeableStream(
    <ReactStrictMode>
      <ReactPWAContext.Provider
        value={{ setValue: setRequestValue, getValue: getRequestValue }}
      >
        {/* @ts-ignore */}
        <CookiesProvider cookies={request.universalCookies}>
          <StaticRouter location={request.url}>
            <app-content>{app}</app-content>
          </StaticRouter>
        </CookiesProvider>
      </ReactPWAContext.Provider>
    </ReactStrictMode>,
    {
      bootstrapScripts: mainScripts,
      onShellError(error) {
        handleStreamError(request, error);
      },
      onError(err: unknown) {
        handleStreamError(request, err);
      },
    },
);

const requestExecutionPromiseMap = new Map();

const executeAndCacheRequest = async (request: Request) => {
  const requestUniqueId = getRequestUniqueId(request);
  const existingRequestExecution = requestExecutionPromiseMap.get(requestUniqueId);
  if (existingRequestExecution) return existingRequestExecution;

  // eslint-disable-next-line no-async-promise-executor
  const requestExecutionPromise = new Promise(async (resolve, reject) => {
    try {
      const { routes, mainScripts } = await initializeDataAndRoutes(request);
      const webCharSet = getInternalVar<IWebManifest>(
        request,
        'Webmanifest',
        {},
      ).charSet;

      const matchedRoutes = matchRoutes(
        routes,
        request.url,
      ) as LazyRouteMatch[];

      /**
       * We need to catch all data from the stream and then
       * concatinate it. So we are using a writable stream
       */
      let data = '';
      const writable = new Writable({
        write(chunk, _, callback) {
          data += chunk;
          callback();
        },
      });

      writable.on('finish', () => handleWritableOnFinish(
        request,
        resolve,
        data,
        webCharSet,
        matchedRoutes,
      ));

      const setRequestValue = (key: string, val: any) => setInternalVar(request, key, val);
      const getRequestValue = (key: string, defaultValue: any = null) => getInternalVar(request, key, defaultValue);

      // @ts-ignore
      const app = EnableServerSideRender ? <App routes={routes} /> : <></>;
      const stream = renderApp(
        request,
        app,
        mainScripts,
        setRequestValue,
        getRequestValue,
      );
      stream.pipe(writable);
    } catch (ex) {
      reject(ex);
    }
  });

  /**
   * Cache the promise so that we don't execute the same request again
   * on the same server instance
   */
  requestExecutionPromiseMap.set(requestUniqueId, requestExecutionPromise);
  requestExecutionPromise.finally(() => {
    requestExecutionPromiseMap.delete(requestUniqueId);
  });
  return requestExecutionPromise;
};

const handleResponseData = (response: Response, data: any) => {
  if (data.redirectUrl) {
    response.status(data.statusCode).redirect(data.redirectUrl);
    return;
  }
  response.status(data.statusCode);
  // Cached data found, so use it to respond to the client
  Object.entries(data.headers).forEach(([key, value]: any) => {
    response.setHeader(key, value);
  });
  response.end(data.body);
};

const handler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  /**
   * Manually reject *.map as they should be directly served via static
   */
  const requestUrl = new URL(request.url, `http://${request.get('host')}`);
  if (isAssetRequest(requestUrl.toString())) {
    next();
    return;
  }

  const requestUniqueId = getRequestUniqueId(request); // Function to generate a unique ID based on the request
  if (shouldUseCache) {
    const cachedData = await retrieveData(requestUniqueId, redisClient);

    if (cachedData) {
      // Request cached data and try to parse it.
      try {
        const cachedRequestData = JSON.parse(cachedData);
        if (cachedRequestData) {
          handleResponseData(response, cachedRequestData);
          executeAndCacheRequest(request);
          next();
          return;
        }
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error('Error while parsing cached data: ', ex);
      }
    }
  }
  const data = await executeAndCacheRequest(request);
  handleResponseData(response, data);
  next();
};

const router = Router();
Object.defineProperty(router, 'name', { value: 'RPWA_Router' });

export const appServer = customAppServer?.default || undefined;

if (
  appServer
  && (Object.keys(appServer).length || typeof appServer === 'function')
) {
  Object.defineProperty(router, 'name', { value: 'RPWA_App_Server' });
}

// Add app server as priority handler
// Use /manifest.webmanifest as webmanifestHandler
router.get('/manifest.webmanifest', webmanifestHandler);

router.use(cookiesMiddleware());

// Enable compression
// @ts-ignore
if (EnableCompression) {
  router.use(compression());
}

// At end use * for default handler
router.use(handler);

export { router };
