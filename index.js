import 'babel-polyfill';
import express from 'express';
import cookieSession from 'cookie-session';
import fingerprint from 'express-fingerprint';
import { query } from './db';
import { getAllUsers, createUser } from './models/User';
import { login } from './models/Auth';

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
    login('jag@jagrajan.com', 'password', 'fingerprint')
    .then(id => res.json({ token: id }))
    .catch((err) => {
      console.error(err);
      res.json({ error: 'server-error' });
    }); 
});



app.listen(3000, () => console.log('App started.'));