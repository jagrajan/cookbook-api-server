import { Router } from 'express';
import AsyncHandler from 'express-async-handler';
import path from 'path';
import slugify from 'slugify';

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


router.get('/recently-updated', AsyncHandler(async (req, res, next) => {
  const recipes = await getRecentlyUpdatedRecipes(req.query.timestamp, req.query.count);
  return res.json({
    recipes
  });
}));


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

router.put('/:id', AsyncHandler(async (req, res, next) => {
  let { name, description, introduction, steps, ingredients, imageURL } = req.body;
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
  const recipe = await createRecipeVersion(
    req.params.id, version, name, description, introduction, steps, ingredients, imageFileName);
  return res.json({
    recipe
  });

}));

router.post('/create', AsyncHandler(async (req, res, next) => {
  let { name,
    description,
    introduction,
    steps,
    ingredients, 
    imageURL } = req.body;
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
  const recipe_version = await createRecipeVersion(recipe.id, recipe.latest_version,
    name, description, introduction, steps, ingredients, imageFileName);

  return res.json({
    recipe: recipe_version
  });
}));

export default router;