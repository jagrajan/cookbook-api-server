import { query } from '../db';

export const getAllIngredients = async () => {
  const res = await query('SELECT * FROM cookbook.ingredient');
  return res.rows;
};

export const createIngredient = async(name, plural = '') => {
  if (plural == '') {
    plural = name;
  }
  const res = await query(`INSERT INTO cookbook.ingredient(name, plural) 
  VALUES ($1, $2) RETURNING *`, [name, plural]);
  return res.rows[0].id
}