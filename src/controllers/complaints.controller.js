const Complaint = require('../models/Complaint');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const pagination = require('../utils/pagination');
const populate = [{ path: 'submittedBy', select: 'name email role' }, { path: 'assignedTo', select: 'name email role' }, { path: 'responses.sender', select: 'name role' }];
async function owned(id, user) { const filter = { _id: id }; if (user.role === 'student') filter.submittedBy = user._id; const c = await Complaint.findOne(filter).populate(populate); if (!c) throw new AppError(404, 'Complaint not found'); return c; }
exports.create = asyncHandler(async(req, res) => {
    const c = await Complaint.create({...req.body, submittedBy: req.user._id });
    res.status(201).json({ success: true, data: c });
});
exports.mine = asyncHandler(async(req, res) => {
    const { page, limit, skip } = pagination(req.query), filter = { submittedBy: req.user._id };
    const [items, total] = await Promise.all([Complaint.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(limit), Complaint.countDocuments(filter)]);
    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
exports.list = asyncHandler(async(req, res) => {
    const { page, limit, skip } = pagination(req.query), filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    const [items, total] = await Promise.all([Complaint.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(limit), Complaint.countDocuments(filter)]);
    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
exports.getOne = asyncHandler(async(req, res) =>
    res.json({
        success: true,
        data: await owned(req.params.id, req.user)
    }));
exports.updateStatus = asyncHandler(async(req, res) => {
    const c = await owned(req.params.id, req.user),
        s = req.body.status;
    if (req.user.role === 'student')
        throw new AppError(403, 'Students cannot change complaint status');
    if (req.user.role === 'support' && !['In Progress', 'Resolved', 'Closed'].includes(s)) throw new AppError(403, 'Support cannot reopen complaints');
    c.status = s;
    await c.save();
    res.json({ success: true, data: c });
});
exports.assign = asyncHandler(async(req, res) => {
    const c = await Complaint.findById(req.params.id);
    if (!c) throw new AppError(404, 'Complaint not found');
    const u = await User.findById(req.body.assignedTo);
    if (!u || u.role !== 'support' || u.status !== 'active')
        throw new AppError(400, 'Assignee must be an active support officer');
    c.assignedTo = u._id;
    if (c.status === 'Open') c.status = 'In Progress';
    await c.save();
    res.json({
        success: true,
        data: c
    });
});
exports.addResponse = asyncHandler(async(req, res) => {
    const c = await owned(req.params.id, req.user);
    if (req.user.role === 'support' && c.assignedTo && c.assignedTo._id.toString() !== req.user._id.toString()) throw new AppError(403, 'Only assigned support can respond');
    if (['Resolved', 'Closed'].includes(c.status))
        throw new AppError(400, 'Complaint is closed for responses');
    c.responses.push({ sender: req.user._id, message: req.body.message });
    await c.save();
    res.status(201).json({ success: true, data: c });
});