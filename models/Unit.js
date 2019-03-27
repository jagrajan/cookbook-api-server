import { query } from '../db';

export const getAllUnits = async () => {
  const res = await query('SELECT * FROM cookbook.unit');
  return res.rows;
}

export const createUnit = async (name) => {
  const res = await query(`INSERT INTO cookbook.unit(name) 
  VALUES ($1) RETURNING id`, [name]);
  return res.rows[0].id;
}