# Testing Guide

## Overview

This project uses **Jest** for testing with **Supertest** for HTTP integration tests.

## Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── helpers/
│   └── testHelpers.js         # Reusable test utilities
├── controllers/
│   └── authController.test.js # Controller unit tests
├── middleware/
│   └── auth.test.js           # Middleware tests
├── validators/
│   └── authValidators.test.js # Validation tests
├── routes/
│   └── auth.test.js           # Route integration tests
├── errors/
│   └── AppError.test.js       # Error class tests
└── utils/
    └── catchAsync.test.js     # Utility tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- authController.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

## Test Coverage

Current test coverage includes:

### ✅ Controllers
- User registration
- User login
- User logout
- Get current user
- Get users list
- Get all users (Admin/Manager)
- Admin user creation
- User update
- User deletion
- Forgot password
- Reset password

### ✅ Middleware
- Token authentication
- Role authorization
- Invalid token handling
- Expired token handling
- Inactive user handling

### ✅ Validators
- Registration validation
- Login validation
- Password reset validation
- User update validation

### ✅ Routes
- Route integration tests
- Authentication flow
- Authorization checks

### ✅ Errors
- Custom error class
- Error handling

### ✅ Utils
- Async error wrapper

## Test Database Setup

1. Create a test database:
```sql
CREATE DATABASE crm_db_test;
```

2. Set environment variables in `.env.test`:
```env
NODE_ENV=test
DB_NAME=crm_db_test
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=test-secret-key
```

## Writing Tests

### Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup before each test
    await cleanupDatabase();
  });

  afterEach(async () => {
    // Cleanup after each test
    await cleanupDatabase();
  });

  it('should do something', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Test Helpers

Use helper functions from `helpers/testHelpers.js`:

```javascript
const {
  generateTestToken,
  createTestUser,
  cleanupDatabase,
  getAuthHeaders,
} = require('../helpers/testHelpers');
```

### Example Test

```javascript
it('should register a new user', async () => {
  const req = {
    body: {
      name: 'Test User',
      email: 'test@test.com',
      password: 'Password123',
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await register(req, res, () => {});

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'User registered successfully',
      token: expect.any(String),
    })
  );
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Mocking**: Mock external services (email, socket.io)
4. **Assertions**: Use descriptive assertions
5. **Coverage**: Aim for >80% code coverage
6. **Naming**: Use descriptive test names

## Continuous Integration

Tests should run automatically in CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    npm install
    npm test
```

## Troubleshooting

### Database Connection Issues
- Ensure test database exists
- Check database credentials in `.env.test`
- Verify database is accessible

### Test Failures
- Check test database state
- Verify mocks are set up correctly
- Check environment variables

### Coverage Issues
- Run `npm test -- --coverage` to see coverage report
- Add tests for uncovered code paths

