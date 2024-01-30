import cors from 'cors';
import express from 'express';
import morganBody from 'morgan-body';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';

import config from './config';
import router from './routes.index';
import { formatResponse, logger } from './util';

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
app.use(cors({
  origin: [config.cors],
  credentials: true,
  optionSuccessStatus: 200
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
