import type { Request } from 'express';
import crypto from 'crypto';
import xxhash from 'xxhash-wasm';

const { h32ToString } = await xxhash();

const requestUniqueIdMap = new WeakMap<any, string>();

export const getRequestUniqueId = (
  req: Request,
  options = {
    includeHeaders: false,
    includeCookies: false,
    includeIp: false,
    includeUserAgent: false,
  },
): string => {
  if (requestUniqueIdMap.has(req)) {
    return requestUniqueIdMap.get(req) ?? '';
  }
  const host = req.get('host');
  let uniqueId: string;
  // If the method is not GET, create a unique ID
  if (req.method !== 'GET') {
    uniqueId = crypto.randomBytes(16).toString('hex');
  } else {
    // Combine the attributes you want to use for GET requests
    const data = `
    ${req.protocol}
    ${host}
    ${req.get('origin')}
    ${req.get('x-forwarded-host')}
    ${options.includeUserAgent ? req.get('user-agent') : ''}
    ${req.path}
    ${options.includeIp ? req.ip : ''}
    ${JSON.stringify(req.query)}
    ${options.includeHeaders ? JSON.stringify(req.headers) : ''}
    ${options.includeCookies ? JSON.stringify(req.cookies) : ''}
    `;

    // Create a hash from the combined attributes
    uniqueId = h32ToString(data);
  }

  const finalUniqueId = `req_${host}_${uniqueId}`;
  requestUniqueIdMap.set(req, finalUniqueId);
  return finalUniqueId;
};
