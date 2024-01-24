import dotenv from 'dotenv';
import path from 'path';

import logger from './util/logger';

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
  port: process.env.PORT || 8000,
  cors: process.env.CORS || '',
  mongoose: { uri: process.env.MONGODB_URI || '' },
  saltFactor: Number(process.env.SALT_WORK_FACTOR) || 10,
  secretKey: process.env.SECRET_KEY,
  secretKeyRefresh: process.env.SECRET_KEY_REFRESH
};
