const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Middleware for handling express-validator validation errors
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    return next(new AppError('Validation Error', 400, errorMessages));
  }
  next();
};