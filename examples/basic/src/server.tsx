import { createClient } from 'redis';

const client = createClient();
try {
  await client.connect();
} catch (ex) {
  // eslint-disable-next-line no-console
  console.error('Failed to connect to Redis', ex);
}

export const redisClient = client;
