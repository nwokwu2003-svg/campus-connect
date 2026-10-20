const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160
    },
    body: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10000
    },
    category: {
        type: String,
        enum: ['Academic', 'Events', 'Finance', 'General', 'Other'],
        default: 'General'
    },
    published: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });
module.exports = mongoose.model('Announcement', schema);