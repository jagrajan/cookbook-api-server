import { Router } from 'express';
import v1Router from './v1';

const router = Router();

router.use((req, res, next) => {
  console.log(req.fingerprint);
  next();
});

router.use('/api/v1', v1Router);

export default router;