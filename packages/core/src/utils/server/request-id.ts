import type { Request } from 'express';
import crypto from 'crypto';
import xxhash from 'xxhash-wasm';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Function to get the current file name in a way that supports both CommonJS and ES Modules
function getCurrentFileName() {
  if (typeof __filename !== 'undefined') {
    return __filename; // CommonJS environment
  }
  if (typeof import.meta.url !== 'undefined') {
    return fileURLToPath(import.meta.url); // ES Module environment
  }
  throw new Error('Cannot determine the module type or environment.');
}

let lastModifiedTime = (new Date()).toISOString();
try {
  // Get file stats using the appropriate filename
  const stats = fs.statSync(getCurrentFileName());
  lastModifiedTime = stats.mtime.toISOString();
} catch {
  // Ignore the error when the application is run in START mode
}

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

  const finalUniqueId = `req_${host}_${lastModifiedTime}_${uniqueId}`;
  console.info(
    `request uniqueId:: ${finalUniqueId} with modifiedTime: ${lastModifiedTime}`,
  );
  requestUniqueIdMap.set(req, finalUniqueId);
  return finalUniqueId;
};
