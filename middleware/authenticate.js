import { get, set } from '../cache/auth-cache';
import { query } from '../db';

export default async (req, res, next) => {

  if (!req.session.token || req.session.token == null) {
    return next();
  }
  const user = await get(req.session.token);

  if (user != null) {
    req.user = user;
    return next();
  }

  const sql = 'SELECT * FROM users.auth_key WHERE id = $1 AND expire_on > NOW()';

  const result = await query(sql, [req.session.token]);

  if (result.rowCount > 0) {
    set(result.rows[0].id, result.rows[0]);
    req.user = result.rows[0];
  }
  return next();

}