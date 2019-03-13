import { Router } from 'express';

const router = Router();

router.get('/login', (req, res) => {
  res.json({ status: 'success' });
});

export default router;