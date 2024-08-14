import logger from '@core/utils/logger';
import config from '@config/config';
import mongoose from 'mongoose';

const connect = async () => {
  try {
    const connectionString = `${config.mongoUrl}/${config.mongoDbName}`;
    await mongoose.connect(connectionString);
    mongoose.set('debug', true);
    logger.info('Connected to MongoDB!');
    logger.info(`MongoDB URL: ${connectionString}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw new Error(err.message);
  }
};

export default { connect };
