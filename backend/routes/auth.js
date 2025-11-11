const express = require('express');
const router = express.Router();

// Middleware
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Controllers
const {
    register,
    login,
    logout,
    getCurrentUser,
    getUsersList,
    getAllUsers,
    adminRegister,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

// Middleware
const { handleValidationErrors } = require('../middleware/validation');

// Validators
const {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateUserValidation,
    adminRegisterValidation,
} = require('../validators/authValidators');

/**
 *   POST /api/auth/register
 *   Register a new user
 *   Public
 */
router.post('/register', registerValidation, handleValidationErrors, register);

/**
 *   POST /api/auth/login
 *   Login user
 *   Public
 */
router.post('/login', loginValidation, handleValidationErrors, login);

/**
 *   POST /api/auth/logout
 *   Logout user
 *   Private
 */
router.post('/logout', authenticateToken, logout);

/**
 *   GET /api/auth/me
 *   Get current user
 *   Private
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 *   GET /api/auth/users/list
 *   Get all users for assignment (all authenticated users)
 *   Private
 */
router.get('/users/list', authenticateToken, getUsersList);

/**
 *   GET /api/auth/users
 *   Get all users (Admin/Manager only)
 *   Private (Admin, Manager)
 */
router.get('/users', authenticateToken, authorizeRoles('Admin', 'Manager'), getAllUsers);

/**
 *   POST /api/auth/admin/register
 *   Create user (Admin only)
 *   Private (Admin)
 */
router.post(
    '/admin/register',
    authenticateToken,
    authorizeRoles('Admin'),
    adminRegisterValidation,
    handleValidationErrors,
    adminRegister
);

/**
 *   PUT /api/auth/users/:id
 *   Update user (Admin/Manager only)
 *   Private (Admin, Manager)
 */
router.put(
    '/users/:id',
    authenticateToken,
    authorizeRoles('Admin', 'Manager'),
    updateUserValidation,
    handleValidationErrors,
    updateUser
);

/**
 *   DELETE /api/auth/users/:id
 *   Delete user (Admin/Manager only)
 *   Private (Admin, Manager)
 */
router.delete('/users/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), deleteUser);

/**
 *   POST /api/auth/forgot-password
 *   Request password reset
 *   Public
 */
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);

/**
 *  POST /api/auth/reset-password
 *  Reset password with token
 *  Public
 */
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, resetPassword);

module.exports = router;
