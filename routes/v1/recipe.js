import { Router } from 'express';
import AsyncHandler from 'express-async-handler';

import { 
  createRecipe, 
  getAllRecipes, 
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

router.put('/:id', AsyncHandler(async (req, res, next) => {
  let { name, description, steps, ingredients } = req.body;
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
  const version = await incrementVersion(req.params.id);
  const recipe = await createRecipeVersion(req.params.id, version, name, description, steps, ingredients);
  return res.json({
    recipe
  });

}));

router.post('/create', AsyncHandler(async (req, res, next) => {
  console.log(req.body);
  let { name, description, steps, ingredients } = req.body;
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

  const recipe = await createRecipe('test-recipe');
  const recipe_version = await createRecipeVersion(recipe.id, recipe.latest_version,
    name, description, steps, ingredients);

  return res.json({
    recipe: recipe_version
  });
}));

export default router;