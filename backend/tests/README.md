# Backend Tests

## Test Structure

```
tests/
├── setup.js                    # Global test setup
├── helpers/
│   └── testHelpers.js         # Test utility functions
├── controllers/
│   └── authController.test.js # Auth controller tests
├── middleware/
│   └── auth.test.js           # Auth middleware tests
├── validators/
│   └── authValidators.test.js # Validation tests
├── routes/
│   └── auth.test.js           # Route integration tests
├── errors/
│   └── AppError.test.js       # Error class tests
└── utils/
    └── catchAsync.test.js     # Utility function tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests with coverage
npm test -- --coverage
```

## Test Coverage

Tests cover:
- ✅ Authentication controllers
- ✅ Authorization middleware
- ✅ Input validation
- ✅ Error handling
- ✅ Route integration
- ✅ Utility functions

## Test Database

Tests use a separate test database. Make sure to:
1. Create a test database: `crm_db_test`
2. Set up test environment variables in `.env.test`
3. Tests will clean up after themselves

## Writing New Tests

1. Create test file in appropriate directory
2. Use test helpers from `helpers/testHelpers.js`
3. Clean up database in `afterEach` hook
4. Follow existing test patterns

