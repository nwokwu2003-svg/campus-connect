const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
module.exports = asyncHandler(async(req, res, next) => {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ') || !h.slice(7).trim())
        throw new AppError(401, 'Authentication token required');
    let p;
    try { p = jwt.verify(h.slice(7).trim(), process.env.JWT_SECRET, { issuer: 'campusconnect-api' }); } catch (e) {
        throw new AppError(401, 'Invalid or expired token');
    }
    if (!p.sub || !Number.isInteger(p.ver))
        throw new AppError(401, 'Invalid token payload');
    const user = await User.findById(p.sub);
    if (!user)
        throw new AppError(401, 'User account no longer exists');
    if (user.status !== 'active')
        throw new AppError(403, 'Account is suspended');
    if (user.tokenVersion !== p.ver)
        throw new AppError(401, 'Token has been revoked');
    req.user = user;
    next();
});