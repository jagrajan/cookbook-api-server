import 'babel-polyfill';
import express from 'express';
import cookieSession from 'cookie-session';

import router from './routes';
import { query } from './db';
import { getAllUsers, createUser } from './models/User';
import { login, validateToken } from './models/Auth';

import { get } from './cache/auth-cache';

get('foo').then(val => console.log(val)).catch(err => console.log(err));

const app = express();


app.use(cookieSession({
  keys: [process.env.COOKIE_KEY]
}));

app.use(router);

app.use((req, res) => {
  res.status(404).json({ error: 'not-found' });
});

app.listen(3000, () => console.log('App started.'));