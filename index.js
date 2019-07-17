import 'babel-polyfill';
import express from 'express';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import asyncHandler from 'express-async-handler';

import router from './routes';
import authMiddleware from './middleware/authenticate';

const app = express();

app.set('trust proxy', 1);
app.use(cors());

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(bodyParser.json({ limit: '50mb' }));

app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_KEY],
  maxAge: 24 * 60 * 60  * 1000 //24 hours
}));

app.use(asyncHandler(authMiddleware));

// app.use((req, res, next) => {
  // console.log(req);
  // next();
// });

app.use(router);

app.use((req, res) => {
  res.status(404).json({ error: 'not-found' });
});

app.listen(process.env.PORT, () => console.log(`App started on port ${process.env.PORT}.`));
