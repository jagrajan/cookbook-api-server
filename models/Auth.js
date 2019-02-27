import { query } from '../db';
import { compare } from 'bcrypt';

export const login = async (email, password) => {
  const res = await query(`SELECT id, email, password,
    CASE
      when id IN (
        SELECT user_id FROM admin.admin
      ) THEN true
      ELSE false
    END AS admin
    FROM users.profile WHERE email = $1`, [email]);
  if (res.rowCount < 1) {
    return {
      error: 'invalid-email'
    };
  }
  const user = res.rows[0];
  const hash = user.password;
  const match = await compare(password, hash);
  if (!match) {
    return {
      error: 'invalid-password'
    };
  }

  const token = await query(`INSERT INTO users.auth_key
    (user_id, expire_on, admin) VALUES
    ($1, NOW() + interval '1 day', $2) RETURNING *`,
    [user.id, user.admin]);

  return token.rows[0];
}

export const validateToken = async (token) => {
  const res = await query('SELECT * FROM users.auth_key WHERE id=$1',
    [token]);
  
  if (res.rowCount < 1) {
    return {
      error: 'invalid-token'
    };
  }

  const tokenData = res.rows[0];
  return tokenData;
}