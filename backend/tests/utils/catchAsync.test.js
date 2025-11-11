/**
 * CatchAsync Tests
 * Tests for async error wrapper utility
 */
const catchAsync = require('../../utils/catchAsync');

describe('catchAsync', () => {
  it('should call next with error when async function throws', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const wrappedFn = catchAsync(asyncFn);

    const req = {};
    const res = {};
    const next = jest.fn();

    await wrappedFn(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should not call next when async function succeeds', async () => {
    const asyncFn = jest.fn().mockResolvedValue('success');
    const wrappedFn = catchAsync(asyncFn);

    const req = {};
    const res = {};
    const next = jest.fn();

    await wrappedFn(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it('should pass arguments to wrapped function', async () => {
    const asyncFn = jest.fn().mockResolvedValue('success');
    const wrappedFn = catchAsync(asyncFn);

    const req = { body: { test: 'data' } };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await wrappedFn(req, res, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
  });
});

