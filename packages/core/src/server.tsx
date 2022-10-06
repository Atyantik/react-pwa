import Cookies, { CookieChangeOptions } from 'universal-cookie';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
// @ts-ignore
import appRoutes from '@currentProject/routes';
// @ts-ignore
import appWebmanifest from '@currentProject/webmanifest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { matchRoutes } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { parse } from 'bowser';
import isbot from 'isbot';
import {
  ChunksMap,
  extractMainScript,
  extractStyles,
  LazyRouteMatch,
} from './utils/asset-extract.js';
import { App } from './components/app.js';
import { DataProvider } from './components/data.js';
import { HeadProvider } from './components/head.js';
import { ReactStrictMode } from './components/strict.js';
import { getUrl } from './utils/fastify.js';
import { ReactPWAContext } from './components/reactpwa.js';
import { getInternalVar, setInternalVar } from './utils/request-internals.js';
import { statusCodeWithLocations } from './utils/redirect.js';
import { getHttpStatusCode, getRedirectUrl } from './utils/server.js';
import { WebManifest } from './index.js';
import { IWebManifest } from './typedefs/webmanifest.js';

isbot.exclude(['chrome-lighthouse']);

const initWebmanifest = async (request: FastifyRequest) => {
  const computedWebmanifest = getInternalVar(request, 'Webmanifest', null);
  if (computedWebmanifest !== null) {
    return;
  }
  if (typeof appWebmanifest === 'function') {
    const userAgent = request.headers['user-agent'] ?? '';
    const isBot = isbot(userAgent);
    const webmanifest: WebManifest = await appWebmanifest({
      getLocation: async () => getUrl(request),
      browserDetect: async () => {
        try {
          return parse(userAgent);
        } catch {
          // Cannot parse useragent
        }
        return {
          browser: { name: '', version: '' },
          os: { name: '', version: '', versionName: '' },
          platform: { type: '' },
          engine: { name: '', version: '' },
        };
      },
      userAgent,
      isbot: async () => isBot,
    });
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
  let routes = appRoutes;
  const userAgent = request.headers['user-agent'] ?? '';
  await initWebmanifest(request);
  const isBot = isbot(userAgent);
  if (typeof appRoutes === 'function') {
    routes = await appRoutes({
      getLocation: async () => getUrl(request),
      browserDetect: async () => {
        try {
          return parse(userAgent);
        } catch {
          // Cannot parse useragent
        }
        return {
          browser: { name: '', version: '' },
          os: { name: '', version: '', versionName: '' },
          platform: { type: '' },
          engine: { name: '', version: '' },
        };
      },
      userAgent,
      isbot: async () => isBot,
    });
  }
  const matchedRoutes = matchRoutes(routes, request.url) as LazyRouteMatch[];
  const styles = extractStyles(matchedRoutes, chunksMap);
  const scripts = extractMainScript(chunksMap);

  // Initialize Cookies
  let universalCookies: Cookies | null = new Cookies(request.cookies);
  const onCookieChange = (change: CookieChangeOptions) => {
    if (reply.sent) return;
    if (change.value === undefined) {
      reply.clearCookie(change.name, change.options);
    } else {
      const cookieOpt = { ...change.options };
      if (cookieOpt.maxAge && change.options && change.options.maxAge) {
        // the standard for maxAge is seconds but npm cookie uses milliseconds
        cookieOpt.maxAge = change.options.maxAge * 1000;
      }

      try {
        reply.setCookie(change.name, change.value, cookieOpt);
        const setCookieHeader = reply.getHeader('set-cookie');
        if (reply.raw.headersSent) {
          // eslint-disable-next-line no-console
          console.warn(
            '\nWARNING : NO_EFFECT :: Cannot set cookie on SSR render as headers are already sent.\nCookie details:',
            change,
          );
        } else if (setCookieHeader) {
          reply.raw.setHeader('set-cookie', setCookieHeader);
        }
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.log(ex);
      }
    }
  };
  universalCookies.addChangeListener(onCookieChange);
  const clearCookieListener = () => {
    if (universalCookies) {
      universalCookies.removeChangeListener(onCookieChange);
      universalCookies = null;
    }
  };
  // release universal cookies
  reply.then(clearCookieListener, clearCookieListener);

  const setRequestValue = (key: string, val: any) => {
    setInternalVar(request, key, val);
  };
  const getRequestValue = (
    key: string,
    defaultValue: any = null,
  ) => getInternalVar(request, key, defaultValue);

  const { lang: webLang, charSet: webCharSet } = getInternalVar<IWebManifest>(request, 'Webmanifest', {});
  const lang = webLang ?? 'en';
  const charSet = webCharSet ?? 'UTF-8';
  reply.raw.setHeader('Content-type', `text/html; charset=${charSet}`);
  reply.header('Content-type', `text/html; charset=${charSet}`);
  const initialHtml = `<!DOCTYPE html><html lang="${lang}"><meta charset="${charSet}">`;

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
              >
                <app-content>
                  <App routes={routes} />
                </app-content>
                {scripts.map((script) => (
                  <script async type="module" key={script} src={script} />
                ))}
              </HeadProvider>
            </DataProvider>
          </StaticRouter>
        </CookiesProvider>
      </ReactPWAContext.Provider>
    </ReactStrictMode>,
    {
      onShellReady() {
        if (isBot) return;
        // The content above all Suspense boundaries is ready.
        // If something errored before we started streaming, we set the error code appropriately.
        reply.code(getHttpStatusCode(request, matchedRoutes));
        // @todo: Get html attributes as properties from
        // config file
        reply.raw.write(initialHtml);
        stream.pipe(reply.raw);
      },
      onShellError(error) {
        setInternalVar(request, 'hasExecutionError', true);
        // eslint-disable-next-line no-console
        console.log('An error occurred:\n', error);
        // Something errored before we could complete the shell so we emit an alternative shell.
        reply.code(500);
        reply.send(`${initialHtml}<app-content></app-content><script>SHELL_ERROR=true;</script>${
          scripts.map((script) => (
            `<script async type="module" src=${script}></script>`
          ))}`);
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
        reply.raw.write(initialHtml);
        stream.pipe(reply.raw);
      },
      onError(err: unknown) {
        setInternalVar(request, 'hasExecutionError', true);
        if (err instanceof Error && err?.message?.indexOf?.('closed early') === -1) {
          // eslint-disable-next-line no-console
          console.error('Rendering error', err);
        } else if (err?.toString?.().indexOf('closed early') === -1) {
          // eslint-disable-next-line no-console
          console.error('Rendering error', err);
        }
      },
    },
  );
};
