// Test setup file
// This file can be used for global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_for_jwt';
process.env.JWT_EXPIRE = '1h';

// Ensure database connection for tests
const { sequelize } = require('../config/database');

beforeAll(async () => {
    // Authenticate database connection
    try {
        await sequelize.authenticate();
        // Sync database schema (use force: false to preserve data)
        await sequelize.sync({ alter: false });
    } catch (error) {
        console.error('Database connection failed in tests:', error);
    }
});

afterAll(async () => {
    // Close database connection after all tests
    await sequelize.close();
});

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };
}

