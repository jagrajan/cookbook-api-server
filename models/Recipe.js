import { query, getClient } from '../db';
import pug from 'pug';

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
    rv.compiled_introduction,
    rv.image_file,
    rv.cook_time,
    rv.prep_time,
    rv.serves
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
    const notes_res = await query(`
      SELECT
        position,
        text
      FROM cookbook.recipe_note
      WHERE recipe_version_id = $1 AND global = TRUE
      ORDER BY position ASC
    `, [recipe.recipe_version_id]);
    const notes = notes_res.rows;
    return {
      ...recipe,
      steps,
      ingredients,
      notes
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

export const createRecipeVersion =
  async (
    recipe_id,
    version,
    name,
    description,
    introduction,
    steps,
    ingredients,
    image_file,
    cook_time,
    prep_time,
    serves,
    notes
  ) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    // create a new recipe version
    const res = await client.query(`INSERT INTO cookbook.recipe_version(
      recipe_id,
      version,
      name,
      description,
      introduction,
      compiled_introduction,
      image_file,
      prep_time,
      cook_time,
      serves
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        recipe_id,
        version,
        name,
        description,
        introduction,
        pug.render(introduction),
        image_file,
        prep_time,
        cook_time,
        serves
      ]);
    const rv = res.rows[0];
    // create each of the steps for that recipe version
    steps.forEach(async step => await client.query(
      `INSERT INTO cookbook.recipe_step (
        recipe_version_id,
        position,
        description
      ) VALUES ($1, $2, $3) `,
      [rv.id, step.position, step.description]));

    // create all the ingredients for that recipe version
    for (let c = 0; c < ingredients.length; c++) {
      const i = ingredients[c];
      let ing = await client.query(
        `SELECT id FROM cookbook.ingredient WHERE name = $1`, [i.ingredient]);
      if (ing.rowCount == 0) {
        ing = await client.query(
          `INSERT INTO cookbook.ingredient (name, plural)
          VALUES ($1, $2) RETURNING id`,
          [i.ingredient, i.ingredient]);
      }
      const ing_id = ing.rows[0].id;
      const res = await client.query(
        `INSERT INTO cookbook.measured_ingredient (
          min_amount,
          max_amount,
          position,
          ingredient_id,
          recipe_version_id,
          unit_id)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [i.minAmount, i.maxAmount, i.position, ing_id, rv.id, i.unit]);
    }

    // add notes for recipe version
    for (let c = 0; c < notes.length; c++) {
      const n =  notes[c];
      const res = await client.query(`INSERT INTO cookbook.recipe_note(
        recipe_id,
        recipe_version_id,
        global,
        position,
        text
      ) VALUES ($1, $2, $3, $4, $5)`,
      [rv.recipe_version, rv.id, true, n.position, n.text]);
    }
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


/**
 * Updates custom notes for a given recipe and user id.
 *
 * @param int     recipeId  Recipe to update custom notes for
 * @param string  userId    User to update custom notes for
 * @param array   notes     New set of notes for user
 */
export const updateCustomNotes = async (recipeId, userId, notes) => {
  const deleteQuery = `
    DELETE FROM cookbook.recipe_note
    WHERE user_id = $1 AND recipe_id = $2
  `;
  const insertQuery = `
    INSERT INTO cookbook.recipe_note(recipe_id, user_id, global, position, text)
    VALUES ($1, $2, false, $3, $4)
  `;

  const client = await getClient();
  let success = false;
  try {
    await client.query('BEGIN');
    // delete old notes first
    await client.query(deleteQuery, [userId, recipeId]);
    notes.forEach(async note => await client.query(
      insertQuery, [recipeId, userId, note.position, note.text]
    ));
    await client.query('COMMIT');
    success = true;
  } catch (e) {
    client.query('ROLLBACK');
  } finally {
    client.release();
  }
  return { success };
};

/**
 * Fetches custom notes for a given recipe and user id.
 *
 * @param int     recipeId  Recipe to fetch custom notes for
 * @param string  userId    User to fetch custom notes for
 * @return array List of user custom notes
 */
export const fetchCustomNotes = async (recipeId, userId) => {
  const fetchQuery = `
    SELECT text FROM cookbook.recipe_note
    WHERE recipe_id = $1 AND user_id = $2
  `;
  const res = await query(fetchQuery, [recipeId, userId]);
  return res.rows;
};

/**
 * Updates the tags for a given recipeId.
 *
 * @param int   recipeId  Id of the recipe to update tags for
 * @param array tags      New tags for the recipe
 * @return  array New set of user tags
 */
export const updateTags = async (recipeId, tags) => {
  const deleteQuery = `
    DELETE FROM cookbook.recipe_tag
    WHERE recipe_id = $1
  `;
  const insertTagQuery = `
    INSERT INTO cookbook.tag(text)
    SELECT $1
    WHERE NOT EXISTS (
      SELECT 1 FROM cookbook.tag
      WHERE text = $1
    )
  `;
  const insertRecipeTagQuery = `
    WITH tag AS (
      SELECT id FROM cookbook.tag
      WHERE text = $1
    )
    INSERT INTO cookbook.recipe_tag (recipe_id, tag_id)
    SELECT $2, tag.id
    FROM tag
  `;

  const client = await getClient();
  let success = false;
  try {
    await client.query('BEGIN');

    // Delete all old tags
    await client.query(deleteQuery, [recipeId]);

    for (let i = 0; i < tags.length; i++) {
      // Create tag if it doesn't exist
      await client.query(insertTagQuery, [tags[i]]);

      // Link the tag with the recipe
      await client.query(insertRecipeTagQuery, [tags[i], recipeId]);
    }
    await client.query('COMMIT');
    success = true;
  } catch(e) {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }

  return { success };
};

export const fetchTags = async recipeId => {
  const fetchQuery  = `
    SELECT t.text
    FROM cookbook.recipe_tag r
    JOIN cookbook.tag t
      ON t.id = r.tag_id
    WHERE r.recipe_id = $1
  `;

  const res = await query(fetchQuery, [recipeId]);
  return res.rows;
};

