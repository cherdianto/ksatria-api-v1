import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express'; import morganBody from 'morgan-body';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';

import config from './config';
import router from './routes.index';
import { formatResponse, logger } from './util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { OK, NOT_FOUND } = StatusCodes;

/**
 * express app
 * @constant
 */
const app = express();

/**
 * logging all server activity
 * @function
*/
morganBody(app, {
  stream: {
    write: (message) => {
      logger.info(message);
    }
  }
});

/**
 * setup express app
 */
// app.use(cors({
//   // origin: [config.cors],
//   origin: 'http://127.0.0.1:3001', // allow all origin to be working on dummy server
//   credentials: true,
//   optionSuccessStatus: 200
// }));

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3001', 'http://127.0.0.1:3001', 'https://ksatria-v1.cherdianto.com','*'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use('/asset', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  console.log('Referer:', req.headers.referer);
  next();
});

/**
 * setup express route
 */
app.get('/ping', (req, res) => res.status(OK).send(formatResponse('pong', true)));
app.use(router);

/**
 * setup express middleware
 */
app.use((req, res) => {
  res.status(NOT_FOUND).json(formatResponse('Route not found', false, NOT_FOUND));
});

export default app;
