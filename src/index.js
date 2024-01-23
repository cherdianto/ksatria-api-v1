import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import morganBody from 'morgan-body';
import { StatusCodes } from 'http-status-codes';

import router from './user/router';
import config from './config';
import { formatResponse, logger } from './util';

const app = express();

/**
 * logging all server activity
 * @function
*/
morganBody(app, {
  stream: {
    write: (message) => {
      logger.info(message);
    },
  },
});

/**
 * check if envy exist first
 */
if (!process.env.MONGODB_URI) logger.warn('No MONGODB_URI in env variable, make sure it exist.');

/**
 * setup mongoose
 *
 */
mongoose.connect(config.mongoose.uri)
  .then(logger.info(`Connected to: ${config.mongoose.uri}`))
  .catch((err) => logger.error(err));
mongoose.Promise = global.Promise;

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
app.use('/user', router);

/**
 * setup express middleware
 */
app.use((req, res) => {
  res.status(404).json(formatResponse('Not found', false, StatusCodes.NOT_FOUND));
});

/**
 * setup express server
 */
app.listen(config.port, () => {
  logger.info(`Server listening on: ${config.port}`);
});
