import { Router } from 'express';
import authRouter from './auth';
import ingredientRouter from './ingredient';
import recipeRouter from './recipe';
import unitRouter from './unit';
import userRouter from './user';

const router = Router();

router.use('/auth', authRouter);
router.use('/ingredient', ingredientRouter);
router.use('/recipe', recipeRouter);
router.use('/unit', unitRouter);
router.use('/user', userRouter);

export default router;