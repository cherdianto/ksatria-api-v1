import dotenv from 'dotenv';
import path from 'path';

import constants from './constants';
import logger from './util/logger';

const { DEFAULT_PORT, DEFAULT_SALT_FACTOR, EMPTY_STRING } = constants;

/**
 * setup environment variable
 */
if (process.env.NODE_ENV !== 'production') {
  try {
    dotenv.config({
      path: path.resolve(path.dirname(''), '.env'),
      silent: true
    });
  } catch (e) {
    logger.error(e.message);
  }
}

export default {
  port: process.env.PORT || DEFAULT_PORT,
  cors: process.env.CORS || EMPTY_STRING,
  mongoose: { uri: process.env.MONGODB_URI || EMPTY_STRING },
  saltFactor: Number(process.env.SALT_WORK_FACTOR) || DEFAULT_SALT_FACTOR,
  secretKey: process.env.SECRET_KEY,
  secretKeyRefresh: process.env.SECRET_KEY_REFRESH,
  totalModules: process.env.TOTAL_MODULES
};
