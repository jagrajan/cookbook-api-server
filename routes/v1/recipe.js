import { Router } from 'express';
import AsyncHandler from 'express-async-handler';
import path from 'path';

import { createImage } from '../../models/Image';

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

router.get('/:id', AsyncHandler(async (req, res, next) => {
  const recipe = await getRecipe(req.params.id);
  if (recipe) {
    return res.json({
      recipe
    });
  }
  return res.json({ error: 'not-found' });
}));

router.get('/recently-updated', AsyncHandler(async (req, res, next) => {
  console.log(req.body);
  const recipes = getRecentlyUpdatedRecipes(req.body.timestamp, req.body.count);
  return res.json({
    recipes
  });
}));

router.put('/:id', AsyncHandler(async (req, res, next) => {
  let { name, description, steps, ingredients, imageURL } = req.body;
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
  // console.log(imageURL);

  // save the image and get the absolute location of the image file
  const fullPath = await createImage(imageURL);
  const imageFileName = path.basename(fullPath);

  const version = await incrementVersion(req.params.id);
  const recipe = await createRecipeVersion(req.params.id, version, name, description, steps, ingredients, imageFileName);
  return res.json({
    recipe
  });

}));

router.post('/create', AsyncHandler(async (req, res, next) => {
  let { name, description, steps, ingredients, imageURL } = req.body;
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

  // console.log(imageURL);

  // save the image and get the absolute location of the image file
  const fullPath = await createImage(imageURL);
  const imageFileName = path.basename(fullPath);

  // create the recipe itself
  const recipe = await createRecipe('test-recipe');

  // create a recipe version
  const recipe_version = await createRecipeVersion(recipe.id, recipe.latest_version,
    name, description, steps, ingredients, imageFileName);

  return res.json({
    recipe: recipe_version
  });
}));

export default router;