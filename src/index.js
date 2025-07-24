import mongoose from 'mongoose';
import app from './app.js';
import config from './config.js';
import { logger } from './util/index.js';
import UserModel from './services/user/user.model.js';
import cron from 'node-cron'
import { backupAndEmail } from './util/dbEmailBackup.js';
import { sendGeneralNotification } from './util/emailNotification.js';

/**
 * check if envy exist first
 */
if (!process.env.MONGODB_URI)
  logger.warn('No MONGODB_URI in env variable, make sure it exist.');

/**
 * setup mongoose
 *
 */
// mongoose
//   .connect(config.mongoose.uri)
//   .then(logger.info(`Connected to: ${config.mongoose.uri}`))
//   .catch((err) => logger.error(err));
// mongoose.Promise = global.Promise;


// const connectToDatabase = async (retries = 5, delay = 60000) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       await mongoose.connect(config.mongoose.uri);
//       logger.info(`Connected to MongoDB: ${config.mongoose.uri}`);
//       return;
//     } catch (error) {
//       logger.error(`MongoDB connection failed: ${error.message}`);
//       await sendGeneralNotification('Mongodb connection INITIALIZATION failed: ', JSON.stringify(error, null, 2));

//       if (i < retries - 1) {
//         logger.info(`Retrying in ${delay / 60000} minutes...`);
//         await new Promise((res) => setTimeout(res, delay));
//       } else {
//         await sendGeneralNotification('Mongodb connection RETRY failed: ', JSON.stringify(error, null, 2));

//         process.exit(1); // Exit if all retries fail
//       }
//     }
//   }
// };

const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.mongoose.uri);
    logger.info(`Connected to MongoDB: ${config.mongoose.uri}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    await sendGeneralNotification('Mongodb connection failed: ', JSON.stringify(error, null, 2));

    // Retry after 10 minutes WITHOUT exiting the process
    logger.info(`Retrying MongoDB connection in 10 minutes...`);
    setTimeout(connectToDatabase, 600000); // 600,000 ms = 10 minutes
  }
};

connectToDatabase();

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

// Schedule the backup task, deactivate until the mongodb-database-tools installed on the machine
// cron.schedule('59 23 * * *', async () => {
  cron.schedule('0 */6 * * *', async () => {
  console.log('Starting scheduled database backup...');
  try {
    await backupAndEmail();
    console.log('Database backup completed successfully.');
  } catch (error) {
    console.error('Failed to complete database backup:', error);
  }
});

initializeDefaultUser();

app.listen(config.port, () => {
  logger.info(`Server listening on: ${config.port}`);
});
