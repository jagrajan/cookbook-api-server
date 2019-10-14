import { Router } from 'express';
import AsyncHandler from 'express-async-handler';
import path from 'path';
import slugify from 'slugify';

import { createImage } from '../../models/Image';
import isAdminMiddleware from '../../middleware/isAdmin';

import {
  createRecipe,
  getAllRecipes,
  getRecentlyUpdatedRecipes,
  getRecipe,
  incrementVersion,
  createRecipeVersion } from '../../models/Recipe';

const router = Router();

router.get('/', AsyncHandler(async (req, res, next) => {
  const recipes = await getAllRecipes();
  return res.json({
    recipes
  });
}));


/*
 * GET /v1/recipe/recently-updated
 *
 * Fetches recently updated recipes. Number of recipes returned depends on
 * values of req.query.count.
 */
router.get('/recently-updated', AsyncHandler(async (req, res, next) => {
  const recipes
    = await getRecentlyUpdatedRecipes(req.query.timestamp, req.query.count);
  return res.json({
    recipes
  });
}));

/*
 * GET /v1/recipe/:id
 *
 * Fetches recipe info for :id.
 */
router.get('/:id', AsyncHandler(async (req, res, next) => {
  let id = req.params.id;
  let slug = '';
  if (id && isNaN(id)) {
    slug = id;
    id = 0;
  }
  const recipe = await getRecipe(id, slug);
  if (recipe) {
    return res.json({
      recipe
    });
  }
  return res.json({ error: 'not-found' });
}));

/*
 * PUT /v1/recipe/:id
 *
 * Updates recipe :id with provided request body.
 *
 * RESTRICTED ROUTE: admins only
 */
router.put('/:id', isAdminMiddleware, AsyncHandler(async (req, res, next) => {

  // extract info from request body
  let {
    name,
    description,
    introduction,
    steps,
    ingredients,
    imageURL,
    cook_time,
    prep_time,
    serves,
    notes
  } = req.body;

  // parameter checking
  if (name == null) {
    return res.json({
      error: {
        name: 'missing-name'
      }
    });
  }
  name = name.trim();
  if (name == '') {
    return res.json({
      error: {
        name: 'empty-name'
      }
    });
  }

  // save the image and get the absolute location of the image file
  const fullPath = await createImage(imageURL);
  const imageFileName = path.basename(fullPath);

  const version = await incrementVersion(req.params.id);
  const recipe =
    await createRecipeVersion(
      req.params.id,
      version,
      name,
      description,
      introduction,
      steps,
      ingredients,
      imageFileName,
      cook_time,
      prep_time,
      serves,
      notes
    );
  return res.json({
    recipe
  });

}));

/*
 * POST /v1/recipe/create
 *
 * Creates a recipe with the provided request body
 *
 * RESTRICTED ROUTE: admins only
 */
router.post('/create', isAdminMiddleware,
  AsyncHandler(async (req, res, next) => {

  // extra info from request body
  let {
    name,
    description,
    introduction,
    steps,
    ingredients,
    imageURL,
    cook_time,
    prep_time,
    serves,
    notes
  } = req.body;
  if (name == null) {
    return res.json({
      error: {
        name: 'missing-name'
      }
    });
  }
  name = name.trim();
  if (name == '') {
    return res.json({
      error: {
        name: 'empty-name'
      }
    });
  }

  // save the image and get the absolute location of the image file
  const fullPath = await createImage(imageURL);
  const imageFileName = path.basename(fullPath);

  // generate a slug
  const slug = slugify(name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });

  // create the recipe
  const recipe = await createRecipe(slug);

  // create a recipe version
    const recipe_version = await createRecipeVersion(
      recipe.id,
      recipe.latest_version,
      name,
      description,
      introduction,
      steps,
      ingredients,
      imageFileName,
      cook_time,
      prep_time,
      serves,
      notes
    );

  return res.json({
    recipe: recipe_version
  });
}));

export default router;
