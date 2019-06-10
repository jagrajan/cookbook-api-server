import { query } from '../db';

export const getAllUnits = async () => {
  const res = await query('SELECT * FROM cookbook.unit');
  return res.rows;
}

export const createUnit = async (name, plural) => {
  const res = await query(`INSERT INTO cookbook.unit(name, plural) 
  VALUES ($1, $2) RETURNING id`, [name, plural]);
  return res.rows[0].id;
}