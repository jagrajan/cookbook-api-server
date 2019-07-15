import { hash } from 'bcrypt';
import { query } from '../db';

export const getAllUsers = async () => {
  const res = await query('SELECT * FROM users.profile');
  return res.rows;
}

export const createUser = async (email, password, name = '') => {
  const pwHash = await hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
  const res = await query('INSERT INTO users.profile (email, password, name)'
    + 'VALUES ($1, $2, $3) RETURNING id', [email, pwHash, name]);
  return res.rows[0].id;
}

export const getDetails = async (user_id) => {
  const res = await query('SELECT * FROM users.profile WHERE id = $1', [user_id]);
  return res.rows[0];
}

export const makeAdmin =
  async (user_id, expire_on = '1 year', master= false) => {
  const sql = `INSERT INTO admin.admin (user_id, expire_on, master)
    VALUES ($1, NOW() + $2::INTERVAL, $3)
    RETURNING *`;
  const res = await query(sql, [user_id, expire_on, master]);
  return res.rows[0];
};
