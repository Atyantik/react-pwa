import type { createClient, SetOptions } from 'redis';
import { hash } from './hash.js';

// Time to live in seconds
const REDIS_TTL = 3600; // 1 hour for Redis
const LOCAL_TTL = 600; // 10 minutes for local cache

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  createKey?: (...args: any[]) => string,
  client?: ReturnType<typeof createClient>,
  clientSetOptions?: SetOptions,
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  // Store both value and timestamp in the local cache
  const localCache = new Map();

  return async function (...args: any[]) {
    let key = createKey
      ? await Promise.resolve(createKey(...args))
      : JSON.stringify(args);
    if (typeof key !== 'string') {
      key = hash(JSON.stringify(key));
    }
    console.log('Memoization Key', key);

    // Try to use Redis
    if (client && client.isReady && client.isOpen) {
      let redisValue;
      try {
        redisValue = await client.get(key);
      } catch {
        redisValue = undefined;
      }

      if (redisValue) return JSON.parse(redisValue);

      const result = await Promise.resolve(fn(...args));
      const options = JSON.parse(JSON.stringify(clientSetOptions));
      if (options && options?.EX === undefined) {
        options.EX = REDIS_TTL;
      }
      client.set(key, JSON.stringify(result), clientSetOptions);
      return result;
    }

    // Fall back to Map if Redis is not connected
    if (localCache.has(key)) {
      const { value, timestamp } = localCache.get(key);
      const now = Date.now();
      if (now - timestamp < LOCAL_TTL * 1000) {
        return value; // If not expired, return value
      }
      localCache.delete(key); // If expired, remove from cache
    }

    const result = await Promise.resolve(fn(...args));
    localCache.set(key, { value: result, timestamp: Date.now() }); // Include timestamp
    return result;
  };
};
