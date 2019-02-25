import { Pool } from 'pg';

import { info, error } from '../util/logger';

info('Starting database connection pool with the following settings:');
info(`DB_USER = ${process.env.DB_USER}`);
info(`DB_HOST = ${process.env.DB_HOST}`);
info(`DB_NAME = ${process.env.DB_NAME}`);
info(`DB_PASSWORD = ${process.env.DB_PASSWORD}`);
info(`DB_PORT = ${process.env.DB_PORT}`);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.query('SELECT NOW();', (err, res) => {
  if (err) {
    error('Error connecting to database');
    error(err);
  } else {
    info('Connection to database has been established');
  }
});

export const query = async (query, params) => {
  info(`Executing query ${query} with params: ${params}`);
  const res = await pool.query(query, params);
  info(`Result: ${JSON.stringify(res ? res.rows : res)}`);
  return res;
};