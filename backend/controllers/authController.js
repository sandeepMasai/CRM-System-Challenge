const jwt = require('jsonwebtoken');
const { Sequelize, Op } = require('sequelize');
const { User } = require('../models');
const { sendEmailNotification } = require('../utils/emailService');
const { emitNotification } = require('../socket/socketHandler');
const { AppError } = require('../errors/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Generate JWT Token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};


/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({
            message: 'User with this email already exists',
        });
    }

    // Default role to Sales Executive if not provided
    const finalRole = role || 'Sales Executive';

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        role: finalRole,
    });

    // Generate JWT token
    const token = generateToken(user);

    // Send welcome email (non-blocking)
    sendEmailNotification({
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
    `,
    }).catch((err) => console.error('Welcome email error:', err));

    // Emit notification for admin users
    emitNotification('user_registered', {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });

    res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(401).json({
            message: 'Invalid email or password',
        });
    }

    // Check if account is active
    if (!user.isActive) {
        return res.status(401).json({
            message: 'Account is deactivated. Please contact administrator.',
        });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            message: 'Invalid email or password',
        });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Send login notification email (non-blocking)
    sendEmailNotification({
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
    `,
    }).catch((err) => console.error('Login email notification error:', err));

    res.json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = catchAsync(async (req, res, next) => {
    res.json({ message: 'Logout successful' });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getCurrentUser = catchAsync(async (req, res, next) => {
    res.json({
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        },
    });
});

/**
 * @route   GET /api/auth/users/list
 * @desc    Get all users for assignment (all authenticated users)
 * @access  Private
 */
const getUsersList = catchAsync(async (req, res, next) => {
    const users = await User.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'email', 'role'],
        order: [['name', 'ASC']],
    });

    res.json({ users });
});

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin/Manager only)
 * @access  Private (Admin, Manager)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.findAll({
        attributes: { exclude: ['password', 'resetToken'] },
        order: [['createdAt', 'DESC']],
    });

    res.json({ users });
});

/**
 * @route   POST /api/auth/admin/register
 * @desc    Create user (Admin only)
 * @access  Private (Admin)
 */
const adminRegister = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Prevent Manager from creating Admin users
    if (req.user.role === 'Manager' && role === 'Admin') {
        return res.status(403).json({
            message: 'Managers cannot create Admin users',
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({
            message: 'User with this email already exists',
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'Sales Executive',
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

/**
 * @route   PUT /api/auth/users/:id
 * @desc    Update user (Admin/Manager only)
 * @access  Private (Admin, Manager)
 */
const updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Prevent Manager from creating/updating Admin users
    if (req.body.role === 'Admin' && req.user.role === 'Manager') {
        return res.status(403).json({
            message: 'Managers cannot create or update Admin users',
        });
    }

    // Prevent Admin from being demoted
    if (req.body.role && user.role === 'Admin' && req.user.role !== 'Admin') {
        return res.status(403).json({
            message: 'Cannot modify Admin user',
        });
    }

    // Update user fields
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) {
        // Check if email is already taken
        const existingUser = await User.findOne({
            where: {
                email: req.body.email,
                id: { [Op.ne]: req.params.id },
            },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        updateData.email = req.body.email;
    }
    if (req.body.password) updateData.password = req.body.password;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    await user.update(updateData);

    const updatedUser = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password', 'resetToken'] },
    });

    res.json({
        message: 'User updated successfully',
        user: updatedUser,
    });
});

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user (Admin/Manager only)
 * @access  Private (Admin, Manager)
 */
const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
        return res.status(400).json({
            message: 'Cannot delete your own account',
        });
    }

    // Prevent deleting Admin users
    if (user.role === 'Admin' && req.user.role !== 'Admin') {
        return res.status(403).json({
            message: 'Cannot delete Admin user',
        });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
        return res.json({
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    }

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    sendEmailNotification({
        to: user.email,
        subject: 'Password Reset Request - CRM System',
        text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
        html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset for your CRM account.</p>
      <p>Click the button below to reset your password:</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you did not request this password reset, please ignore this email.</p>
    `,
    }).catch((err) => console.error('Error sending reset email:', err));

    res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
    });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
const resetPassword = catchAsync(async (req, res, next) => {
    const { token, password } = req.body;

    const user = await User.findOne({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                [Op.gt]: new Date(), // Token not expired
            },
        },
    });

    if (!user) {
        return res.status(400).json({
            message: 'Invalid or expired reset token. Please request a new password reset.',
        });
    }

    // Update password
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    // Send confirmation email
    sendEmailNotification({
        to: user.email,
        subject: 'Password Reset Successful - CRM System',
        text: `Your password has been successfully reset. If you did not make this change, please contact support immediately.`,
        html: `
      <h2>Password Reset Successful</h2>
      <p>Hello ${user.name},</p>
      <p>Your password has been successfully reset.</p>
      <p>If you did not make this change, please contact support immediately.</p>
    `,
    }).catch((err) => console.error('Error sending confirmation email:', err));

    res.json({ message: 'Password has been reset successfully' });
});

module.exports = {
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
};

