/**
 * Test Helpers
 * Utility functions for testing
 */
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

/**
 * Generate a test JWT token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateTestToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1d' }
  );
};

/**
 * Create a test user
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@test.com`,
    password: 'Test123456',
    role: 'Sales Executive',
    isActive: true,
    ...userData,
  };

  return await User.create(defaultUser);
};

/**
 * Clean up test database
 * @param {Array} models - Array of models to clean
 */
const cleanupDatabase = async (models = [User]) => {
  for (const model of models) {
    await model.destroy({ where: {}, force: true });
  }
};

/**
 * Create authenticated request headers
 * @param {String} token - JWT token
 * @returns {Object} Headers object
 */
const getAuthHeaders = (token) => {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

module.exports = {
  generateTestToken,
  createTestUser,
  cleanupDatabase,
  getAuthHeaders,
};

