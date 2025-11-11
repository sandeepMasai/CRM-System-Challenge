/**
 * Test Utilities
 * Common utilities for tests
 */

/**
 * Wrap test with database check
 * @param {Function} testFn - Test function
 * @param {boolean} dbAvailable - Whether database is available
 */
const withDatabase = (testFn, dbAvailable) => {
  return async (...args) => {
    if (!dbAvailable) {
      console.log('⏭️  Skipping test - database not available');
      return;
    }
    return testFn(...args);
  };
};

/**
 * Skip describe block if database not available
 * @param {string} name - Describe block name
 * @param {Function} fn - Describe block function
 * @param {boolean} dbAvailable - Whether database is available
 */
const describeWithDb = (name, fn, dbAvailable) => {
  if (!dbAvailable) {
    return describe.skip(name, fn);
  }
  return describe(name, fn);
};

module.exports = {
  withDatabase,
  describeWithDb,
};

