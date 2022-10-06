import { FastifyRequest } from 'fastify';
import { LazyRouteMatch } from './asset-extract.js';
import { getBaseUrl } from './fastify.js';
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
