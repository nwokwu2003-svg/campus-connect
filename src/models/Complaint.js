const mongoose = require('mongoose');
const responseSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    createdAt: { type: Date, default: Date.now }
});
const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10000
    },
    category: {
        type: String,
        enum: ['Academic', 'Accommodation', 'Finance', 'Technical', 'Other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    responses: { type: [responseSchema], default: [] }
}, { timestamps: true });
schema.index({ submittedBy: 1, createdAt: -1 });
module.exports = mongoose.model('Complaint', schema);