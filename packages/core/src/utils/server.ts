import { parse } from 'bowser';
import { FastifyRequest } from 'fastify';
import isbot from 'isbot';
import { LazyRouteMatch } from './asset-extract.js';
import { getBaseUrl, getUrl } from './fastify.js';
import { getInternalVar } from './request-internals.js';

export const getHttpStatusCode = (
  request: FastifyRequest,
  matchedRoutes?: LazyRouteMatch[],
) => {
  let code = 200;
  if (!matchedRoutes || matchedRoutes[0]?.route?.path === '*') {
    code = 404;
  }
  const hasError = getInternalVar(request, 'hasExecutionError', false);
  if (hasError) {
    code = 500;
  }
  return getInternalVar(request, 'httpStatusCode', code);
};

export const getRedirectUrl = (request: FastifyRequest) => {
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

export const getIsBot = () => {
  isbot.exclude(['chrome-lighthouse']);
  return isbot;
};

export const getRequestArgs = (request: FastifyRequest) => {
  const userAgent = request.headers['user-agent'] ?? '';
  const isBot = isbot(userAgent);
  return {
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
  };
};
