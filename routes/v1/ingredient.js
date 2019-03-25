import { Router } from 'express';
import AsyncHandler from 'express-async-handler';
import { getAllIngredients } from '../../models/Ingredient';

const router = Router();

router.get('/', AsyncHandler(async (req, res, next) => {
  const ingredients = await getAllIngredients();
  res.json({ ingredients });
}));

export default router;