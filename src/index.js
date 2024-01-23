import mongoose from 'mongoose';

import app from './app';
import config from './config';
import { logger } from './util';

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
 * setup express server
 */
app.listen(config.port, () => {
  logger.info(`Server listening on: ${config.port}`);
});
