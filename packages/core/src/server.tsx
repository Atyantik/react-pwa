import Cookies from 'universal-cookie';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
// @ts-ignore
import appRoutes from '@currentProject/routes';
// @ts-ignore
import appServer from '@currentProject/server';
// @ts-ignore
import appWebmanifest from '@currentProject/webmanifest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { matchRoutes } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import {
  ChunksMap,
  extractMainScript,
  extractStyles,
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
import { PwaStream } from './utils/stream.js';

const initWebmanifest = async (request: FastifyRequest) => {
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

export const webmanifestHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  await initWebmanifest(request);
  reply.send(getInternalVar(request, 'Webmanifest', {}));
};

export const handler = async (
  request: FastifyRequest,
  reply: FastifyReply,
  chunksMap: ChunksMap,
) => {
  if (appServer?.lookup && appServer?.find) {
    const routeHandler = appServer.find(request.method, request.url);
    if (routeHandler) {
      appServer.lookup(request, reply);
      return;
    }
  }

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
  const pwaStream = new PwaStream();
  reply.header('Content-type', `text/html; charset=${charSet}`);
  const initialHtml = `<!DOCTYPE html><html lang="${lang}"><meta charset="${charSet}">`;
  reply.send(pwaStream);

  if (!isBot) {
    pwaStream.push(initialHtml);
  }

  if (typeof appRoutes === 'function') {
    routes = await appRoutes(getRequestArgs(request));
  }
  const matchedRoutes = matchRoutes(routes, request.url) as LazyRouteMatch[];
  const styles = extractStyles(matchedRoutes, chunksMap);
  const scripts = extractMainScript(chunksMap);

  // Initialize Cookies
  let universalCookies: Cookies | null = new Cookies(request.cookies);
  const onCookieChange = cookieChangeHandler(reply);
  universalCookies.addChangeListener(onCookieChange);
  const clearCookieListener = () => {
    if (universalCookies) {
      universalCookies.removeChangeListener(onCookieChange);
      universalCookies = null;
    }
  };

  // release universal cookies
  reply.then(clearCookieListener, clearCookieListener);

  // Initiate the router to get manage the data
  const setRequestValue = (key: string, val: any) => {
    setInternalVar(request, key, val);
  };
  const getRequestValue = (key: string, defaultValue: any = null) => getInternalVar(request, key, defaultValue);

  const stream = renderToPipeableStream(
    <ReactStrictMode>
      <ReactPWAContext.Provider
        value={{ setValue: setRequestValue, getValue: getRequestValue }}
      >
        <CookiesProvider cookies={universalCookies}>
          <StaticRouter location={request.url}>
            <DataProvider>
              <HeadProvider
                styles={styles}
                preStyles={getRequestValue('headPreStyles', <></>)}
              >
                <app-content>
                  <App routes={routes} />
                </app-content>
                {scripts.map((script) => (
                  <script async type="module" key={script} src={script} />
                ))}
                {getRequestValue('footerScripts', <></>)}
              </HeadProvider>
            </DataProvider>
          </StaticRouter>
        </CookiesProvider>
      </ReactPWAContext.Provider>
    </ReactStrictMode>,
    {
      onShellReady() {
        if (isBot) return;
        // @todo: Get html attributes as properties from
        // config file
        stream.pipe(pwaStream);
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
          reply.code(500);
        }
        /**
         * @todo do not add script on shell error. After adding the scripts the
         * frontend may work fine, thus the error is not directly visible to developer
         */
        pwaStream.push(
          `<app-content></app-content><script>SHELL_ERROR=true;</script>${scripts.map(
            (script) => `<script async type="module" src=${script}></script>`,
          )}`,
        );
        pwaStream.end();
      },
      onAllReady() {
        if (!isBot) return;
        // If you don't want streaming, use this instead of onShellReady.
        // This will fire after the entire page content is ready.
        // You can use this for crawlers or static generation.
        const statusCode = getHttpStatusCode(request, matchedRoutes);
        reply.code(statusCode);
        if (statusCodeWithLocations.includes(statusCode)) {
          const redirectUrl = getRedirectUrl(request);
          reply.redirect(statusCode, redirectUrl);
          return;
        }
        pwaStream.push(initialHtml);
        stream.pipe(pwaStream);
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
