import mongoose from 'mongoose';

import app from './app.js';
import config from './config.js';
import { logger } from './util/index.js';
import UserModel from './services/user/user.model.js';

/**
 * check if envy exist first
 */
if (!process.env.MONGODB_URI)
  logger.warn('No MONGODB_URI in env variable, make sure it exist.');

/**
 * setup mongoose
 *
 */
mongoose
  .connect(config.mongoose.uri)
  .then(logger.info(`Connected to: ${config.mongoose.uri}`))
  .catch((err) => logger.error(err));
mongoose.Promise = global.Promise;

const initializeDefaultUser = async () => {
  try {
    const existingUser = await UserModel.findOne({
      username: 'ardianabuzafran',
    });

    if (!existingUser) {
      const defaultUser = new UserModel({
        username: 'ardianabuzafran',
        fullname: 'Ardian Abu Zafran',
        email: 'praptomojatiardian@gmail.com',
        whatsapp: '6285643007248', 
        password: 'BismillahLulus2025!',
        semester: 1, 
        faculty: 'psychology',
        roles: 'admin', // Set to admin as requested
        status: 'active', // Set status to active
      });

      await defaultUser.save();
      console.log('Default user created successfully');
    } else {
      console.log('Default user already exists');
    }
  } catch (err) {
    console.error('Error initializing default user:', err.message);
  }
};

initializeDefaultUser();
/**
 * setup express server
 */
app.listen(config.port, () => {
  logger.info(`Server listening on: ${config.port}`);
});
