const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sendEmailNotification } = require('../utils/emailService');
const { emitNotification } = require('../socket/socketHandler');

const router = express.Router();

// Public registration endpoint (allows role selection)
router.post('/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').optional().isIn(['Admin', 'Manager', 'Sales Executive']).withMessage('Invalid role')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(err => err.msg).join(', ');
                return res.status(400).json({ message: errorMessages, errors: errors.array() });
            }

            const { name, email, password, role } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            // Allow role selection for public registration
            // Default to Sales Executive if not provided
            const finalRole = role || 'Sales Executive';

            const user = await User.create({
                name,
                email,
                password,
                role: finalRole
            });

            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            // Send welcome email to new user
            try {
                await sendEmailNotification({
                    to: user.email,
                    subject: 'Welcome to CRM System',
                    text: `Welcome ${user.name}! Your account has been successfully created with role: ${user.role}.`,
                    html: `
                        <h2>Welcome to CRM System!</h2>
                        <p>Hello ${user.name},</p>
                        <p>Your account has been successfully created.</p>
                        <ul>
                            <li><strong>Email:</strong> ${user.email}</li>
                            <li><strong>Role:</strong> ${user.role}</li>
                        </ul>
                        <p>You can now log in and start using the CRM system.</p>
                    `
                });
            } catch (emailError) {
                console.error('Welcome email error:', emailError);
                // Don't fail registration if email fails
            }

            // Emit notification for admin users about new registration
            emitNotification('user_registered', {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }
);

// Admin-only endpoint to create users with any role
router.post('/admin/register',
    authenticateToken,
    authorizeRoles('Admin'),
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').isIn(['Admin', 'Manager', 'Sales Executive']).withMessage('Invalid role')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(err => err.msg).join(', ');
                return res.status(400).json({ message: errorMessages, errors: errors.array() });
            }

            const { name, email, password, role } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            const user = await User.create({
                name,
                email,
                password,
                role: role || 'Sales Executive'
            });

            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }
);

// Login
router.post('/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(err => err.msg).join(', ');
                return res.status(400).json({ message: errorMessages, errors: errors.array() });
            }

            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            if (!user.isActive) {
                return res.status(401).json({ message: 'Account is deactivated. Please contact administrator.' });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            // Send login notification email
            try {
                await sendEmailNotification({
                    to: user.email,
                    subject: 'Login Notification - CRM System',
                    text: `Hello ${user.name}, you have successfully logged into the CRM System at ${new Date().toLocaleString()}.`,
                    html: `
                        <h2>Login Notification</h2>
                        <p>Hello ${user.name},</p>
                        <p>You have successfully logged into the CRM System.</p>
                        <ul>
                            <li><strong>Login Time:</strong> ${new Date().toLocaleString()}</li>
                            <li><strong>Email:</strong> ${user.email}</li>
                            <li><strong>Role:</strong> ${user.role}</li>
                        </ul>
                        <p>If you did not perform this login, please contact your administrator immediately.</p>
                    `
                });
            } catch (emailError) {
                console.error('Login email notification error:', emailError);
                // Don't fail login if email fails
            }

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Error during login', error: error.message });
        }
    }
);

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// Get all users (Admin/Manager only)
router.get('/users', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

module.exports = router;

