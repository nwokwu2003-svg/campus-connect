const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const pagination = require('../utils/pagination');
exports.me = asyncHandler(async(req, res) => res.json({ success: true, data: { user: req.user.toSafeObject() } }));
exports.updateMe = asyncHandler(async(req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true
    });
    res.json({
        success: true,
        data: { user: user.toSafeObject() }
    });
});
exports.list = asyncHandler(async(req, res) => {
    const { page, limit, skip } = pagination(req.query), filter = {};
    if (req.query.search) {
        const q = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
    }
    const [items, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), User.countDocuments(filter)]);
    res.json({ success: true, data: items.map(u => u.toSafeObject()), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
exports.getById = asyncHandler(async(req, res) => {
    const u = await User.findById(req.params.id);
    if (!u || (req.user.role !== 'admin' && u._id.toString() !== req.user._id.toString())) throw new AppError(404, 'User not found');
    res.json({
        success: true,
        data: {
            user: u.toSafeObject()
        }
    });
});
exports.updateRole = asyncHandler(async(req, res) => {
    const u = await User.findById(req.params.id);
    if (!u) throw new AppError(404, 'User not found');
    u.role = req.body.role;
    u.tokenVersion += 1;
    await u.save();
    res.json({
        success: true,
        data: {
            user: u.toSafeObject()
        }
    });
});
exports.updateStatus = asyncHandler(async(req, res) => {
    if (req.params.id === req.user._id.toString() && req.body.status === 'suspended')
        throw new AppError(400, 'Cannot suspend your own account');
    const u = await User.findById(req.params.id);
    if (!u)
        throw new AppError(404, 'User not found');
    u.status = req.body.status;
    u.tokenVersion += 1;
    await u.save();
    res.json({
        success: true,
        data: {
            user: u.toSafeObject()
        }
    });
});