const mongoose = require('mongoose');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGOD_URI || 'mongodb://127.0.0.1:27017/healthDB';

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE, 10) || 50,
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE, 10) || 5,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    w: 'majority'
  };

  try {
    const conn = await mongoose.connect(mongoUri, options);
    isConnected = true;
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB connection lost. Reconnecting...');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime connection error:', { error: err.message });
    });

    // Graceful Shutdown handling
    const gracefulExit = async () => {
      try {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection cleanly closed via app termination.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB connection shutdown:', { error: err.message });
        process.exit(1);
      }
    };

    process.on('SIGINT', gracefulExit);
    process.on('SIGTERM', gracefulExit);

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
