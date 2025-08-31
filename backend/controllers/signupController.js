const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/userModel');
const { sendOTPEmail } = require('../utils/emailService');
const FRONTEND_URL = process.env.FRONTEND_URL;

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate user input using Zod
const validateSignupInput = (data) => {
    const schema = z.object({
        name: z.string().min(2, "Name should be at least 2 characters"),
        email: z.string().email("Invalid email address"),
    });
    
    return schema.safeParse(data);
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register a user and send OTP
// @route   POST /api/users/signup
// @access  Public
const signupUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    
    // Validate input
    const validationResult = validateSignupInput({ name, email });
    if (!validationResult.success) {
        res.status(400);
        throw new Error(validationResult.error.errors[0].message);
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already registered");
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Create user with OTP
    const user = await User.create({
        name,
        email,
        authMethod: 'email',
        otp: {
            code: otp,
            expiry: otpExpiry
        }
    });
    
    if (user) {
        try {
            // Send OTP via email
            await sendOTPEmail(email, name, otp);
            
            res.status(201).json({
                message: "OTP sent successfully to your email",
                userId: user._id,
                // Still include OTP in development for testing purposes
                otp: process.env.NODE_ENV === 'production' ? undefined : otp
            });
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            
            // Still return success to user, but log the email error
            res.status(201).json({
                message: "Registration successful but failed to send OTP email. Please contact support.",
                userId: user._id,
                otp // Include OTP in response since email failed
            });
        }
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }
});

// @desc    Verify OTP and complete signup (passwordless)
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { userId, otp } = req.body;
    
    console.log("OTP Verification request:", { userId, otp });
    
    if (!userId || !otp) {
        res.status(400);
        throw new Error("User ID and OTP are required");
    }
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    
    // Check if OTP is valid and not expired
    if (!user.otp) {
        res.status(400);
        throw new Error("No OTP found for this user");
    }
    
    if (user.otp.code !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }
    
    if (new Date() > new Date(user.otp.expiry)) {
        console.log("OTP expired:", { expiry: user.otp.expiry, current: new Date() });
        res.status(400);
        throw new Error("OTP has expired. Please request a new one.");
    }
    
    // Update user - no password needed for passwordless authentication
    user.isEmailVerified = true;
    user.otp = undefined; // Clear OTP
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set cookie with token
    res.cookie('jwt', token, {
        httpOnly: false, // Allow JavaScript to read for frontend auth
        secure: false, // Set to true in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'lax',
        path: '/' // Ensure cookie is available on all paths
    });
    
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token
    });
});

// @desc    Request login OTP
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        res.status(400);
        throw new Error("Email is required");
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // If user doesn't exist
    if (!user) {
        res.status(401);
        throw new Error("No account found with this email");
    }
    
    // If user signed up with Google
    if (user.authMethod === 'google') {
        res.status(400);
        throw new Error("This account was created with Google. Please sign in with Google instead.");
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Update user with new OTP
    user.otp = {
        code: otp,
        expiry: otpExpiry
    };
    
    await user.save();
    
    try {
        // Send OTP via email
        await sendOTPEmail(user.email, user.name, otp);
        
        res.status(200).json({
            message: "Login OTP sent successfully to your email",
            userId: user._id,
            // Include OTP in development for testing
            otp: process.env.NODE_ENV === 'production' ? undefined : otp
        });
    } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        
        res.status(200).json({
            message: "Generated login OTP but failed to send email. Please contact support.",
            userId: user._id,
            otp // Include OTP in response since email failed
        });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    
    res.status(200).json(user);
});

// @desc    Handle Google OAuth callback
// @route   GET /api/users/google/callback
// @access  Public
const googleCallback = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${FRONTEND_URL}/auth-callback?error=No+user+data+found`);
        }
        
        // Generate token for authenticated user
        const token = generateToken(req.user._id);
        
        // Set cookie with token
        res.cookie('jwt', token, {
            httpOnly: false, // Allow JavaScript to read for frontend auth
            secure: false, // Set to true in production
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: 'lax',
            path: '/' // Ensure cookie is available on all paths
        });
        
        // Redirect to frontend with token as a query parameter
        res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}`);
    } catch (error) {
        console.error('Error in Google callback:', error);
        res.redirect(`${FRONTEND_URL}/auth-callback?error=Server+error+processing+login`);
    }
});

// @desc    Resend OTP
// @route   POST /api/users/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        res.status(400);
        throw new Error("User ID is required");
    }
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Update user with new OTP
    user.otp = {
        code: otp,
        expiry: otpExpiry
    };
    
    await user.save();
    
    try {
        // Send OTP via email
        await sendOTPEmail(user.email, user.name, otp);
        
        res.status(200).json({
            message: "OTP resent successfully to your email",
            // Still include OTP in development for testing purposes
            otp: process.env.NODE_ENV === 'production' ? undefined : otp
        });
    } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        
        res.status(200).json({
            message: "Generated new OTP but failed to send email. Please contact support.",
            otp // Include OTP in response since email failed
        });
    }
});

// @desc    Verify login OTP
// @route   POST /api/users/verify-login-otp
// @access  Public
const verifyLoginOTP = asyncHandler(async (req, res) => {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
        res.status(400);
        throw new Error("User ID and OTP are required");
    }
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    
    // Check if OTP is valid and not expired
    if (!user.otp) {
        res.status(400);
        throw new Error("No OTP found for this user");
    }
    
    if (user.otp.code !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }
    
    if (new Date() > new Date(user.otp.expiry)) {
        res.status(400);
        throw new Error("OTP has expired. Please request a new one.");
    }
    
    // Clear OTP after successful verification
    user.otp = undefined;
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set cookie with token
    res.cookie('jwt', token, {
        httpOnly: false, // Allow JavaScript to read for frontend auth
        secure: false, // Set to true in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'lax',
        path: '/' // Ensure cookie is available on all paths
    });
    
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token
    });
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0) // Expire immediately
    });
    
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = {
    signupUser,
    verifyOTP,
    loginUser,
    verifyLoginOTP,
    getUserProfile,
    googleCallback,
    resendOTP,
    logoutUser
};
