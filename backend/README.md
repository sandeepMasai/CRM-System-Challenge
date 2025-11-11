# CRM Backend API

## Project Structure

```
backend/
├── config/              # Configuration files
│   └── database.js     # Database configuration
├── controllers/         # Business logic (controllers)
│   └── authController.js
├── errors/              # Error handling
│   ├── AppError.js     # Custom error class
│   └── errorHandler.js # Global error handler
├── middleware/          # Express middleware
│   ├── auth.js         # Authentication middleware
│   └── validation.js   # Validation middleware
├── models/              # Database models (Sequelize)
│   ├── User.js
│   ├── Lead.js
│   ├── Activity.js
│   └── index.js
├── routes/              # Route definitions
│   ├── auth.js
│   ├── leads.js
│   ├── activities.js
│   ├── dashboard.js
│   ├── notifications.js
│   └── integrations.js
├── socket/              # Socket.io handlers
│   └── socketHandler.js
├── utils/               # Utility functions
│   ├── emailService.js
│   └── catchAsync.js
├── validators/          # Input validation rules
│   └── authValidators.js
└── server.js            # Main server file
```

## Architecture

### Separation of Concerns

1. **Routes** (`routes/`): Define API endpoints and middleware chain
2. **Controllers** (`controllers/`): Handle business logic and request/response
3. **Validators** (`validators/`): Input validation rules
4. **Middleware** (`middleware/`): Authentication, authorization, validation
5. **Models** (`models/`): Database models and relationships
6. **Errors** (`errors/`): Error handling and custom error classes
7. **Utils** (`utils/`): Reusable utility functions

### Error Handling

- **AppError**: Custom error class for operational errors
- **errorHandler**: Global error handler middleware
- **catchAsync**: Wrapper to catch async errors automatically

### Best Practices

1. **Controllers**: All async functions wrapped with `catchAsync`
2. **Validation**: Centralized in `validators/` folder
3. **Error Handling**: Consistent error responses
4. **Documentation**: JSDoc comments for all functions
5. **Code Organization**: Clear separation of concerns

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `GET /users/list` - Get users for assignment
- `GET /users` - Get all users (Admin/Manager)
- `POST /admin/register` - Create user (Admin)
- `PUT /users/:id` - Update user (Admin/Manager)
- `DELETE /users/:id` - Delete user (Admin/Manager)
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

## Environment Variables

See `ENV_SETUP.md` for detailed environment variable configuration.

## Development

```bash
# Install dependencies
yarn install

# Run in development mode
yarn dev

# Run in production mode
yarn start
```

## Testing

```bash
yarn test
```

