import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { getDetails } from '../../models/User';

const router = Router();

router.get('/profile/:id', asyncHandler(async (req, res) => {
  console.log(req.user);
  console.log(req.params);
  if (!req.user.admin && req.params.id != req.user.user_id) {
    return res.status(403).json({ error: 'insufficient-permissions' });
  }
  const user = await getDetails(req.params.id);
  return res.json(user);
}));

export default router;