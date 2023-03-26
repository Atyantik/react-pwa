import { ReactElement } from 'react';
import bowser from 'bowser';
import { Request } from 'express';
import isbot from 'isbot';
import { RoutesArgs } from '../index.js';
import { LazyRouteMatch } from './asset-extract.js';
import { getBaseUrl, getUrl } from './express.js';
import { getInternalVar, setInternalVar } from './request-internals.js';

/**
 * get Http Status code for a request
 * @param request Fastify Request
 * @param matchedRoutes array of routes
 * @returns code number
 */
export const getHttpStatusCode = (
  request: Request,
  matchedRoutes?: LazyRouteMatch[],
) => {
  let code = 200;
  if (!matchedRoutes) {
    code = 404;
  }
  const hasError = getInternalVar(request, 'hasExecutionError', false);
  if (hasError) {
    code = 500;
  }
  return getInternalVar(request, 'httpStatusCode', code);
};

/**
 * Get redirect url
 * @param request FastifyRequest
 * @returns string
 */
export const getRedirectUrl = (request: Request) => {
  const location = getInternalVar(request, 'httpLocationHeader', '/');
  const baseUrl = getBaseUrl(request);
  const baseUrlStr = baseUrl.toString();
  const url = new URL(location, baseUrl);
  let urlString = url.toString();
  if (urlString.indexOf(baseUrlStr) !== -1) {
    urlString = urlString.replace(baseUrlStr, '');
  }
  if (!urlString) {
    urlString = '/';
  }
  return urlString;
};

/**
 * Get instance of isBot
 * @returns isbot
 */
export const getIsBot = () => {
  isbot.exclude(['chrome-lighthouse']);
  return isbot;
};

const scopedCache = new WeakMap();

const setScopedVar = (request: Request, key: string, value: any) => {
  const scopedVals = scopedCache.get(request) ?? {};
  scopedCache.set(request, {
    ...scopedVals,
    [key]: value,
  });
};

const hasScopedVar = (request: Request, key: string) => !!(scopedCache.get(request)?.[key] ?? false);

const getScopedVar = <T = any>(
  request: Request,
  key: string,
  defaultValue?: T,
) => scopedCache.get(request)?.[key] ?? defaultValue ?? null;

/**
 * Get request args for
 * @param request FastifyRequest
 */
export const getRequestArgs = (request: Request): RoutesArgs => {
  const userAgent = request.headers['user-agent'] ?? '';
  const isBot = isbot(userAgent);
  const getScoped = async (
    key: string,
    cb: (() => any) | (() => Promise<any>),
  ) => {
    if (hasScopedVar(request, key)) {
      return getScopedVar(request, key);
    }
    const computedScopeCB = await cb();
    setScopedVar(request, key, computedScopeCB);
    return computedScopeCB;
  };

  return {
    getLocation: () => getUrl(request),
    browserDetect: async () => {
      try {
        return bowser.parse(userAgent);
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
    getScoped,
    addToHeadPreStyles: (components: ReactElement | ReactElement[]) => {
      const previousComponents = getInternalVar(request, 'headPreStyles', []);
      setInternalVar(request, 'headPreStyles', [
        ...previousComponents,
        components,
      ]);
    },
    addToFooter: (components: ReactElement | ReactElement[]) => {
      const previousComponents = getInternalVar(request, 'footerScripts', []);
      setInternalVar(request, 'footerScripts', [
        ...previousComponents,
        components,
      ]);
    },
    addHeaders: (headers: Headers) => {
      const requestHeaders = getInternalVar(request, 'headers', new Headers());
      Array.from(headers.entries()).forEach(([key, value]) => {
        requestHeaders.set(key, value);
      });
      setInternalVar(request, 'headers', requestHeaders);
    },
  };
};
