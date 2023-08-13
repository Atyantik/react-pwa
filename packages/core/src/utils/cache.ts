import type { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

const localCache: Map<string, { data: string; expires: number }> = new Map();

export async function cacheData(
  key: string,
  value: string,
  redisClient?: RedisClient,
  expirationInSeconds: number = 3600,
): Promise<void> {
  const rpwaKey = `__rpwa__${key}__`;
  if (redisClient?.isOpen && redisClient?.isReady) {
    await redisClient.set(rpwaKey, value, {
      EX: expirationInSeconds,
    });
  } else {
    localCache.set(rpwaKey, {
      data: value,
      expires: Date.now() + expirationInSeconds * 1000,
    });
  }
}

export async function retrieveData(
  key: string,
  redisClient?: RedisClient,
): Promise<string | null> {
  const rpwaKey = `__rpwa__${key}__`;
  if (redisClient?.isOpen && redisClient?.isReady) {
    const reply = await redisClient.get(rpwaKey);
    return reply || null;
  }
  const cached = localCache.get(rpwaKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  localCache.delete(rpwaKey); // Delete expired cache
  return null;
}
