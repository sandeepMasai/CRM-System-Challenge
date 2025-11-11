/**
 * AppError Tests
 * Tests for custom error class
 */
const AppError = require('../../errors/AppError');

describe('AppError', () => {
  it('should create error with message and status code', () => {
    const error = new AppError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('should set status to error for 5xx status codes', () => {
    const error = new AppError('Server error', 500);

    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
  });

  it('should set status to fail for 4xx status codes', () => {
    const error = new AppError('Client error', 404);

    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail');
  });

  it('should be instance of Error', () => {
    const error = new AppError('Test error', 400);

    expect(error).toBeInstanceOf(Error);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Test error', 400);

    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });
});

