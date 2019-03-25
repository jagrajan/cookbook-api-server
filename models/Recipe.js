import { query } from '../db';

export const createRecipe = async (name, user_id, description = '') => {
  const res = await query(`INSERT INTO cookbook.recipe(name, user_id, description)
  VALUES ($1, $2, $3) RETURNING *`, [name, user_id, description]);
  return res.rows[0];
}