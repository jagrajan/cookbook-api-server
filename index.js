import 'babel-polyfill';
import express from 'express';
import cookieSession from 'cookie-session';
import fingerprint from 'express-fingerprint';
import { query } from './db';
import { getAllUsers, createUser } from './models/User';
import { login, validateToken } from './models/Auth';

const app = express();

app.use(fingerprint({
  parameters: [
    fingerprint.useragent,
    fingerprint.acceptHeaders,
    fingerprint.geoip
  ]
}));

app.use(cookieSession({
  keys: [process.env.COOKIE_KEY]
}));

app.get('/', (req, res) => {
  console.log(req.session);
  validateToken(req.session.token, 'fingerprint')
    .then(token => res.json({ token }))
    .catch((error) => {
      console.error(error);
      res.json({ error });
    });   
});



app.listen(3000, () => console.log('App started.'));