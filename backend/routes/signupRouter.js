const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
    signupUser, 
    verifyOTP, 
    loginUser, 
    verifyLoginOTP,
    getUserProfile,
    googleCallback,
    resendOTP,
    logoutUser
} = require('../controllers/signupController');
const validateToken = require('../middleware/validateTokenHandler');

// Public routes
router.post('/signup', signupUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/verify-login-otp', verifyLoginOTP);
router.post('/logout', logoutUser);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: 'http://localhost:5173/auth-callback?error=Google+authentication+failed'
    }),
    googleCallback
);

// Protected routes
router.get('/profile', validateToken, getUserProfile);

module.exports = router;