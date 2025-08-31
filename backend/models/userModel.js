const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add the user name"],
    },
    email: {
        type: String,
        required: [true, "Please add the user email address"],
        unique: [true, "Email address already taken"],
    },
    password: {
        type: String,
        // Not required if using Google OAuth
    },
    googleId: {
        type: String,
        // Only for Google OAuth users
    },
    profilePic: {
        type: String,
        default: '',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    authMethod: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    otp: {
        code: String,
        expiry: Date,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
