const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

function notFound(req, res, next) { next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`)); }

function errorHandler(err, req, res, next) {
    let status = err.statusCode || 500,
        message = err.message || 'Internal server error',
        details = err.details;
    if (err instanceof mongoose.Error.CastError) {
        status = 400;
        message = 'Invalid resource ID';
    }
    if (err instanceof mongoose.Error.ValidationError) {
        status = 400;
        message = 'Database validation failed';
    }
    if (err.code === 11000) {
        status = 409;
        message = 'A record with that unique value already exists';
    }
    const body = { success: false, error: { message } };
    if (details) body.error.details = details;
    if (process.env.NODE_ENV !== 'production' && status === 500) body.error.debug = err.message;
    res.status(status).json(body);
}
module.exports = { notFound, errorHandler };