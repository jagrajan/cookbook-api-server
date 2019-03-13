import asyncRedis from 'async-redis';
import { error, info } from '../util/logger';

const client = asyncRedis.createClient();

client.on('connect', () => {
  info('Redis client connected');
});

client.on('error', err => {
  error(`Redis: ${err}`)
});

export const set = async (key, value) => {
  await client.set(key, value);
}

export const get = async (key) => {
  const value = await client.get(key);
  return value;
}
