const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function token(user) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new AppError(500, 'JWT_SECRET must be at least 32 characters');
    return jwt.sign({ sub: user._id.toString(), role: user.role, ver: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h', issuer: 'campusconnect-api' });
}
exports.register = asyncHandler(async(req, res) => {
    const user = await User.create({ name: req.body.name, email: req.body.email, password: req.body.password, role: 'student' });
    res.status(201).json({ success: true, data: { user: user.toSafeObject(), token: token(user) } });
});
exports.login = asyncHandler(async(req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) throw new AppError(401, 'Invalid email or password');
    if (user.status !== 'active') throw new AppError(403, 'Account is suspended');
    res.json({ success: true, data: { user: user.toSafeObject(), token: token(user) } });
});
exports.me = asyncHandler(async(req, res) => res.json({ success: true, data: { user: req.user.toSafeObject() } }));
exports.changePassword = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword))) throw new AppError(400, 'Current password is incorrect');
    user.password = req.body.newPassword;
    user.tokenVersion += 1;
    await user.save();
    res.json({ success: true, message: 'Password changed. Log in again.' });
});
exports.logout = asyncHandler(async(req, res) => {
    req.user.tokenVersion += 1;
    await req.user.save();
    res.json({ success: true, message: 'Logged out; previous tokens have been revoked.' });
});