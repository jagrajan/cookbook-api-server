import { query, getClient } from '../db';

export const getAllRecipes = async () => {
  const res = await query(`SELECT r.id, rv.name, rv.description, rv.introduction FROM cookbook.recipe r
	  JOIN cookbook.recipe_version rv ON r.id = rv.recipe_id AND r.latest_version = rv.version
	  WHERE r.hidden = FALSE`);
  return res.rows;
};

export const getRecentlyUpdatedRecipes = async (timestamp, count) => {
  const res = await query(`SELECT rv.*, r.slug FROM cookbook.recipe r
  JOIN cookbook.recipe_version rv
    ON r.id = rv.recipe_id AND r.latest_version = rv.version
    WHERE rv.create_date < $1
    ORDER BY rv.create_date DESC
    LIMIT $2`, [timestamp, count]);
  return res.rows;
};

export const getRecipe = async (id, slug = '') => {
  const res = await query(`SELECT 
    rv.recipe_id AS id,
    rv.id AS recipe_version_id,
    rv.name,
    rv.description,
    rv.introduction,
    rv.image_file
  FROM cookbook.recipe_version rv
  JOIN cookbook.recipe r
    ON r.id = rv.recipe_id
  WHERE rv.recipe_id = $1 OR r.slug = $2
  ORDER BY rv.version DESC
  LIMIT 1`, [id, slug]);
  if (res.rowCount == 1) {
    const recipe = res.rows[0];
    const steps_res = await query(`SELECT * FROM cookbook.recipe_step
      WHERE recipe_version_id = $1 ORDER BY position ASC`, [recipe.recipe_version_id]);
    const steps = steps_res.rows;
    const ingredients_res = await query (`SELECT 
        m.min_amount,
        m.max_amount,
        m.unit_id,
        i.name,
        i.plural,
        i.id AS ingredient_id,
        u.name AS singular_unit,
        u.plural AS plural_unit
      FROM cookbook.measured_ingredient m
      JOIN cookbook.ingredient i ON i.id = m.ingredient_id
      JOIN cookbook.unit u ON u.id = m.unit_id
      WHERE recipe_version_id = $1 ORDER BY position ASC`, [recipe.recipe_version_id]);
    const ingredients = ingredients_res.rows;
    return {
      ...recipe,
      steps,
      ingredients
    };
  }
  return false;
}

export const updateRecipe = async (id, name, description) => {
  const res = await query(`UPDATE cookbook.recipe SET name = $1, description = $2
    WHERE id = $3 RETURNING *`, [name, description, id]);
  return res.rows[0];
}

export const createRecipe = async (slug) => {
  const res = await query(`INSERT INTO cookbook.recipe(slug)
  VALUES ($1) RETURNING *`, [slug]);
  return res.rows[0];
};

export const incrementVersion = async (id) => {
  const res = await query(`UPDATE cookbook.recipe SET latest_version = latest_version + 1 
    WHERE id = $1 RETURNING latest_version`, [id]);
  return res.rows[0].latest_version;
}

export const createRecipeVersion = async (recipe_id, version, name, description, steps, ingredients, image_file) => {
  const client = await getClient();

  try {
    // create a new recipe version
    const res = await client.query(`INSERT INTO cookbook.recipe_version (recipe_id, version, name, description, image_file)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`, [recipe_id, version, name, description, image_file]);
    const rv = res.rows[0];
    // create each of the steps for that recipe version
    steps.forEach(async step => await client.query(`
      INSERT INTO cookbook.recipe_step (recipe_version_id, position, description)
        VALUES ($1, $2, $3)
    `, [rv.id, step.position, step.description]));

    // create all the ingredients for that recipe version
    ingredients.forEach(async i => {
      let ing = await client.query(`SELECT id FROM cookbook.ingredient WHERE name = $1`, [i.ingredient]);
      if (ing.rowCount == 0) {
        ing = await client.query(`INSERT INTO cookbook.ingredient (name) VALUES ($1) RETURNING id`, [i.ingredient]);
      }
      const ing_id = ing.rows[0].id;
      await client.query(`INSERT INTO cookbook.measured_ingredient (min_amount, max_amount, 
        position, ingredient_id, recipe_version_id, unit_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        [i.minAmount, i.maxAmount, i.position, ing_id, rv.id, i.unit]);
    });
    await client.query('COMMIT');
    return rv;
  } catch (e) {
    await client.query('ROLLBACK');
    return {
      error: 'db-error'
    };
  } finally {
    client.release();
  }
}