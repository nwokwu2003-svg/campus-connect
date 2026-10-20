const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
module.exports = (param = 'id') => (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[param]))
        return next(new AppError(400, `Invalid ${param}`));
    next();
};