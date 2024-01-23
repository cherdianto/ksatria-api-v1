import cors from 'cors';
import express from 'express';
import morganBody from 'morgan-body';
import { StatusCodes } from 'http-status-codes';

import router from './routes.index';
import { formatResponse, logger } from './util';

const { NOT_FOUND } = StatusCodes;

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * setup express route
 */
app.get('/ping', (req, res) => res.send('pong'));
app.use(router);

/**
 * setup express middleware
 */
app.use((req, res) => {
  res.status(NOT_FOUND).json(formatResponse('Not found', false, NOT_FOUND));
});

export default app;
