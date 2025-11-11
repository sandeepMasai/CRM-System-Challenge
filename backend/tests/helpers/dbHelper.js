/**
 * Database Helper
 * Utility functions for database connection in tests
 */
const { sequelize } = require('../../config/database');

let dbConnected = false;
let dbConnectionError = null;

/**
 * Check if database is available
 * @returns {Promise<boolean>} True if database is available
 */
const checkDatabaseConnection = async () => {
  if (dbConnected) return true;
  
  try {
    await sequelize.authenticate();
    dbConnected = true;
    dbConnectionError = null;
    return true;
  } catch (error) {
    dbConnectionError = error;
    dbConnected = false;
    return false;
  }
};

/**
 * Setup database for tests
 * @returns {Promise<boolean>} True if setup successful
 */
const setupDatabase = async () => {
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.warn('⚠️  Database not available. Tests requiring database will be skipped.');
    console.warn('   To run all tests, ensure PostgreSQL is running and configured.');
    return false;
  }
  
  try {
    await sequelize.sync({ force: true });
    return true;
  } catch (error) {
    console.error('Database sync error:', error.message);
    return false;
  }
};

/**
 * Close database connection
 */
const closeDatabase = async () => {
  try {
    if (dbConnected) {
      await sequelize.close();
      dbConnected = false;
    }
  } catch (error) {
    // Ignore close errors
  }
};

/**
 * Skip test if database is not available
 * @param {Function} testFn - Test function
 */
const skipIfNoDb = (testFn) => {
  return async (...args) => {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('⏭️  Skipping test - database not available');
      return;
    }
    return testFn(...args);
  };
};

module.exports = {
  checkDatabaseConnection,
  setupDatabase,
  closeDatabase,
  skipIfNoDb,
  get dbConnected() {
    return dbConnected;
  },
  get dbConnectionError() {
    return dbConnectionError;
  },
};

