import { Router } from 'express';
import { login } from '../../models/Auth';

const router = Router();

router.get('/status', (req, res) => {
  return res.json(req.session.token);
});

router.post('/login', (req, res) => {
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

  login(email, password)
    .then(token => {
      req.session.token = token;
      return res.json(token);
    })
    .catch(error => res.json(error));
});

export default router;