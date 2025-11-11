/**
 * Test Setup
 * Global test configuration and setup
 */
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '1d';
process.env.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.test.com';
process.env.EMAIL_PORT = process.env.EMAIL_PORT || '587';
process.env.EMAIL_USER = process.env.EMAIL_USER || 'test@test.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'test-password';

// Database configuration for tests
process.env.DB_NAME = process.env.DB_NAME || 'crm_db_test';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';

// Mock email service
jest.mock('../utils/emailService', () => ({
  sendEmailNotification: jest.fn().mockResolvedValue({ success: true }),
  emailServiceReady: true,
  emailServiceError: null,
}));

// Mock socket.io
jest.mock('../socket/socketHandler', () => ({
  initializeSocket: jest.fn(),
  emitNotification: jest.fn(),
}));

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

