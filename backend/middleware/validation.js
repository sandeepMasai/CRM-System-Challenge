const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Checks for validation errors and returns formatted error response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return res.status(400).json({
      status: 'fail',
      message: errorMessages,
      errors: errors.array(),
    });
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
};

