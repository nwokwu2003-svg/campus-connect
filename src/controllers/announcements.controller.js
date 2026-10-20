const Announcement = require('../models/Announcement');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const pagination = require('../utils/pagination');
exports.create = asyncHandler(async(req, res) => {
    const a = await Announcement.create({...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: a });
});
exports.list = asyncHandler(async(req, res) => {
    const { page, limit, skip } = pagination(req.query), filter = req.user.role === 'admin' ? {} : { published: true };
    const [items, total] = await Promise.all([Announcement.find(filter).populate('createdBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit), Announcement.countDocuments(filter)]);
    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
exports.getOne = asyncHandler(async(req, res) => {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.published = true;
    const a = await Announcement.findOne(filter).populate('createdBy', 'name');
    if (!a) throw new AppError(404, 'Announcement not found');
    res.json({ success: true, data: a });
});
exports.update = asyncHandler(async(req, res) => {
    const a = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!a) throw new AppError(404, 'Announcement not found');
    res.json({ success: true, data: a });
});
exports.remove = asyncHandler(async(req, res) => {
    const a = await Announcement.findByIdAndDelete(req.params.id);
    if (!a) throw new AppError(404, 'Announcement not found');
    res.status(204).send();
});