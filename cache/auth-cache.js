import asyncRedis from 'async-redis';
import { error, info } from '../util/logger';

const client = asyncRedis.createClient();

client.on('connect', () => {
  info('Redis client connected');
});

client.on('error', err => {
  error(`Redis: ${err}`)
});

export const set = async (token, data) => {
  await client.set(token, JSON.stringify(data));
}

export const get = async (token) => {
  const value = await client.get(token);
  return JSON.parse(value);
}
