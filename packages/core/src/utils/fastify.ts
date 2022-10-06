import { FastifyRequest } from 'fastify';

/**
 * Get full Url of the request, respect x-host,
 * x-forwarded-host, host header and finally the hostname by fastify
 * @todo: Not sure if we really need to add case sensitivity here for headers!
 * @param req FastifyRequest
 * @returns baseUrl without pathname
 */
export const getBaseUrl = (req: FastifyRequest): URL => {
  const { hostname, protocol } = req;
  return new URL('/', `${protocol}://${hostname}`);
};

export const getUrl = (req: FastifyRequest): URL => {
  const baseUrl = getBaseUrl(req);
  try {
    return new URL(req.url, baseUrl);
  } catch {
    // Some error with parsing of url
  }
  return baseUrl;
};
