import { Router } from 'express';
import AsyncHandler from 'express-async-handler';
import { getAllUnits } from '../../models/Unit';

const router = Router();

router.get('/', AsyncHandler(async (req, res, next) => {
  const units = await getAllUnits();
  res.json({ units });
}));

export default router;