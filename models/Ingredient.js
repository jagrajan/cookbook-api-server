import { query } from '../db';

export const getAllIngredients = async () => {
  const res = await query('SELECT * FROM cookbook.ingredient');
  return res.rows;
};

export const createIngredient = async(name) => {
  const res = await query(`INSERT INTO cookbook.ingredient(name) 
  VALUES ($1) RETURNING *`, [name]);
  return res.rows[0].id
}