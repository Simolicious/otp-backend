const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 6,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    resent: {
        type: Boolean,
        default: false,
    }
});

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;