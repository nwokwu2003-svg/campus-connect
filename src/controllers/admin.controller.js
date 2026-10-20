const User = require('../models/User');
const Complaint = require('../models/Complaint');
const asyncHandler = require('../utils/asyncHandler');
exports.dashboard = asyncHandler(async(req, res) => {
    const [totalUsers, roles, totalComplaints, open, resolved] = await Promise.all([
        User.countDocuments(), User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]), Complaint.countDocuments(),
        Complaint.countDocuments({ status: { $in: ['Open', 'In Progress'] } }), Complaint.countDocuments({ status: 'Resolved' })
    ]);
    const byRole = { student: 0, admin: 0, support: 0 };
    roles.forEach(r => byRole[r._id] = r.count);
    res.json({ success: true, data: { users: { total: totalUsers, byRole }, complaints: { total: totalComplaints, open, resolved } } });
});