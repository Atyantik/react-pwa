import zlib from 'zlib';
import { PassThrough } from 'node:stream';
import Cookies from 'universal-cookie';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
// @ts-ignore
import appRoutes from '@currentProject/routes';
// @ts-ignore
import appServer from '@currentProject/server';
// @ts-ignore
import appWebmanifest from '@currentProject/webmanifest';
import { Request, Response, Router } from 'express';
import { matchRoutes } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import {
  extractMainScripts,
  extractMainStyles,
  getCssFileContent,
  LazyRouteMatch,
} from './utils/asset-extract.js';
import { App } from './components/app.js';
import { DataProvider } from './components/data.js';
import { HeadProvider } from './components/head/provider.js';
import { ReactStrictMode } from './components/strict.js';
import { ReactPWAContext } from './components/reactpwa.js';
import { getInternalVar, setInternalVar } from './utils/request-internals.js';
import { statusCodeWithLocations } from './utils/redirect.js';
import {
  getHttpStatusCode,
  getIsBot,
  getRedirectUrl,
  getRequestArgs,
} from './utils/server.js';
import { WebManifest } from './index.js';
import { IWebManifest } from './typedefs/webmanifest.js';
import { cookieChangeHandler } from './utils/cookie.js';
import { notBoolean } from './utils/not-boolean.js';

const getCompression = (request: Request) => {
  const acceptEncoding = request.headers['accept-encoding'] ?? '';
  if (acceptEncoding.indexOf('br') !== -1) {
    return {
      compressionStream: zlib.createBrotliCompress(),
      encoding: 'br',
    };
  }
  if (acceptEncoding.indexOf('gzip') !== -1) {
    return {
      compressionStream: zlib.createGzip(),
      encoding: 'gzip',
    };
  }
  if (acceptEncoding.indexOf('deflate') !== -1) {
    return {
      compressionStream: zlib.createDeflate(),
      encoding: 'deflate',
    };
  }
  return {
    compressionStream: new PassThrough(),
    encoding: false,
  };
};

const initWebmanifest = async (request: Request) => {
  const computedWebmanifest = getInternalVar(request, 'Webmanifest', null);
  if (computedWebmanifest !== null) {
    return;
  }
  if (typeof appWebmanifest === 'function') {
    const webmanifest: WebManifest = await appWebmanifest(
      getRequestArgs(request),
    );
    setInternalVar(request, 'Webmanifest', webmanifest);
    return;
  }
  setInternalVar(request, 'Webmanifest', appWebmanifest ?? {});
};

const webmanifestHandler = async (request: Request, response: Response) => {
  await initWebmanifest(request);
  response.json(getInternalVar(request, 'Webmanifest', {}));
};

const handler = async (request: Request, response: Response) => {
  /**
   * Manually reject *.map as they should be directly served via static
   */
  const requestUrl = new URL(request.url, `http://${request.get('host')}`);
  if (requestUrl.pathname.endsWith('.map')) {
    response.status(404);
    response.send('Not found');
    return;
  }

  const { chunksMap } = request.app.locals;

  let routes = appRoutes;
  const userAgent = request.headers['user-agent'] ?? '';
  // get isbot instance
  const isBot = getIsBot()(userAgent);

  // Init web manifest for the request
  await initWebmanifest(request);
  const { lang: webLang, charSet: webCharSet } = getInternalVar<IWebManifest>(
    request,
    'Webmanifest',
    {},
  );
  const lang = webLang ?? 'en';
  const charSet = webCharSet ?? 'utf-8';
  /**
   * Set header to text/html with charset as per webmanifest
   * or default to utf-8
   */
  response.set({
    'content-type': `text/html; charset=${charSet}`,
  });

  const { compressionStream, encoding } = getCompression(request);
  if (typeof encoding === 'string') {
    response.set({ 'content-encoding': encoding });
  }

  const initialHtml = `<!DOCTYPE html><html lang="${lang}"><meta charset="${charSet}">`;
  compressionStream.pipe(response);

  if (!isBot) {
    compressionStream.write(initialHtml);
  }
  if (typeof appRoutes === 'function') {
    routes = await appRoutes(getRequestArgs(request));
  }
  const matchedRoutes = matchRoutes(routes, request.url) as LazyRouteMatch[];
  let stylesWithContent: { href: string; content: string }[] = [];
  let styles: string[] = [];

  const mainStyles = extractMainStyles(chunksMap);
  if (mainStyles?.length) {
    stylesWithContent = (
      await Promise.all(
        mainStyles.map(async (mainStyle) => {
          if (mainStyle.startsWith('http')) {
            return false;
          }
          return {
            content: await getCssFileContent(mainStyle),
            href: mainStyle,
          };
        }),
      )
    ).filter(notBoolean);

    styles = mainStyles
      .map((mainStyle) => {
        if (mainStyle.startsWith('http')) {
          return mainStyle;
        }
        return false;
      })
      .filter(notBoolean);
  }
  const mainScripts = extractMainScripts(chunksMap);

  // Initialize Cookies
  let universalCookies: Cookies | null = new Cookies(request.headers.cookie);
  const onCookieChange = cookieChangeHandler(response);
  universalCookies.addChangeListener(onCookieChange);
  const clearCookieListener = () => {
    if (universalCookies) {
      universalCookies.removeChangeListener(onCookieChange);
      universalCookies = null;
    }
  };

  // release universal cookies
  response.once('close', () => {
    clearCookieListener();
  });

  // Initiate the router to get manage the data
  const setRequestValue = (key: string, val: any) => {
    setInternalVar(request, key, val);
  };
  const getRequestValue = (key: string, defaultValue: any = null) => getInternalVar(request, key, defaultValue);
  // @ts-ignore
  const app = EnableServerSideRender ? <App routes={routes} /> : <></>;
  const stream = renderToPipeableStream(
    <ReactStrictMode>
      <ReactPWAContext.Provider
        value={{ setValue: setRequestValue, getValue: getRequestValue }}
      >
        <CookiesProvider cookies={universalCookies}>
          <StaticRouter location={request.url}>
            <DataProvider>
              <HeadProvider
                stylesWithContent={stylesWithContent}
                styles={styles}
                preStyles={getRequestValue('headPreStyles', <></>)}
              >
                <app-content>{app}</app-content>
                {getRequestValue('footerScripts', <></>)}
              </HeadProvider>
            </DataProvider>
          </StaticRouter>
        </CookiesProvider>
      </ReactPWAContext.Provider>
    </ReactStrictMode>,
    {
      bootstrapModules: mainScripts,
      onShellReady() {
        if (isBot) return;
        stream.pipe(compressionStream);
      },
      onShellError(error) {
        setInternalVar(request, 'hasExecutionError', true);
        // eslint-disable-next-line no-console
        console.log('A Shell error occurred:\n', error);
        // eslint-disable-next-line no-console
        console.log(
          'A shell error may also occur if wrong react components are injected in head or footer.'
            + 'Please check you are using addToHeadPreStyles & addToFooter wisely.',
        );
        // Something errored before we could complete the shell so we emit an alternative shell.
        if (!isBot) {
          response.status(500);
        }
        /**
         * @todo do not add script on shell error. After adding the scripts the
         * frontend may work fine, thus the error is not directly visible to developer
         */
        compressionStream.write(
          '<app-content></app-content><script>SHELL_ERROR=true;</script>',
        );
        compressionStream.end();
      },
      onAllReady() {
        if (!isBot) return;
        // If you don't want streaming, use this instead of onShellReady.
        // This will fire after the entire page content is ready.
        // You can use this for crawlers or static generation.
        const statusCode = getHttpStatusCode(request, matchedRoutes);
        response.status(statusCode);
        if (statusCodeWithLocations.includes(statusCode)) {
          const redirectUrl = getRedirectUrl(request);
          response.redirect(statusCode, redirectUrl);
          return;
        }
        compressionStream.write(initialHtml);
        stream.pipe(compressionStream);
      },
      onError(err: unknown) {
        setInternalVar(request, 'hasExecutionError', true);
        if (
          err instanceof Error
          && err.message.indexOf('closed early') === -1
        ) {
          // eslint-disable-next-line no-console
          console.error('An error occurred: ', err);
        } else if (err?.toString?.().indexOf('closed early') === -1) {
          // eslint-disable-next-line no-console
          console.error('An error occurred: ', err);
        }
      },
    },
  );
};

const router = Router();
Object.defineProperty(router, 'name', { value: 'RPWA_Router' });

if (
  appServer
  && (Object.keys(appServer).length || typeof appServer === 'function')
) {
  Object.defineProperty(router, 'name', { value: 'RPWA_App_Server' });
}

// Add app server as priority

// Use /manifest.webmanifest as webmanifestHandler
router.get('/manifest.webmanifest', webmanifestHandler);

// At end use * for default handler
router.use(handler);

export { router, appServer };
