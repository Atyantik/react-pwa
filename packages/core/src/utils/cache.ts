import type { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

const localCache: Map<string, { data: string; expires: number }> = new Map();

export async function cacheData(
  key: string,
  value: string,
  redisClient?: RedisClient,
  expirationInSeconds: number = 3600,
): Promise<void> {
  if (redisClient?.isOpen && redisClient?.isReady) {
    await redisClient.set(key, value, {
      EX: expirationInSeconds,
    });
  } else {
    localCache.set(key, {
      data: value,
      expires: Date.now() + expirationInSeconds * 1000,
    });
  }
}

export async function retrieveData(
  key: string,
  redisClient?: RedisClient,
): Promise<string | null> {
  if (redisClient?.isOpen && redisClient?.isReady) {
    const reply = await redisClient.get(key);
    return reply || null;
  }
  const cached = localCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  localCache.delete(key); // Delete expired cache
  return null;
}
