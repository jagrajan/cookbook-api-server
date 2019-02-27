import { Router } from 'express';

const router = Router();

router.get('/login', (req, res) => {
  res.json({ data: req.fingerprint });
});

export default router;