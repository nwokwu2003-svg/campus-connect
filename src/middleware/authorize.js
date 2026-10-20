const AppError = require('../utils/AppError');
module.exports = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
        return next(new AppError(403, 'Insufficient permissions'));
    next();
};