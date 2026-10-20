const AppError = require('../utils/AppError');
module.exports = (schema, property = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[property],

        { abortEarly: false, stripUnknown: true, convert: true });
    if (error) return next(new AppError(400, 'Validation failed', error.details.map(d => ({
        message: d.message,
        path: d.path
    }))));
    req[property] = value;
    next();
};