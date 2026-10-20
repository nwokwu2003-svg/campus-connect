const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'support'],
        default: 'student',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active',
        required: true
    },
    tokenVersion: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: {
        transform(_d, r) {
            delete r.password;
            delete r.tokenVersion;
            delete r.__v;
            return r;
        }
    }
});
schema.pre('save', async function() { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_ROUNDS) || 12); });
schema.methods.comparePassword = function(p) { return bcrypt.compare(p, this.password); };
schema.methods.toSafeObject = function() {
    const o = this.toObject();
    delete o.password;
    delete o.tokenVersion;
    delete o.__v;
    return o;
};
module.exports = mongoose.model('User', schema);