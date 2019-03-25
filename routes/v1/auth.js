import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { set } from '../../cache/auth-cache';
import { login } from '../../models/Auth';

const router = Router();

router.get('/status', (req, res) => {
  return res.json(req.user);
});

router.get('/logout', (req, res) => {
  req.session = null;
  return res.json({ success: 'logged-out' });
});

router.post('/login', asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;

  if (email == null || email == '') {
    return res.json({
      error: {
        email: 'missing-email'
      }
    });
  }
  if (password == null || password == '') {
    return res.json({
      error: {
        password: 'missing-password'
      }
    });
  }

  const token = await login(email, password);
  if (!req.error) {
    set(token.id, token);
    req.session.token = token.id;
  }

  return res.json(token);

}));

export default router;