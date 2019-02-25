import { hash } from 'bcrypt';
import { query } from '../db';

export const getAllUsers = async () => {
  const res = await query('SELECT * FROM users.profile');
  return res.rows;
}

export const createUser = async (email, password) => {
  const pwHash = await hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
  const res = await query('INSERT INTO users.profile (email, password)'
    + 'VALUES ($1, $2) RETURNING id', [email, pwHash]);
  return res.rows[0].id;
}