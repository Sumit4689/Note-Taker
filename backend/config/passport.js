const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// Configure Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google authentication attempt for:', profile.emails[0].value);

            // Find if user exists with Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                console.log('User found by Google ID:', user._id);
                return done(null, user);
            }
            
            // Check if email already exists
            const emailUser = await User.findOne({ email: profile.emails[0].value });
            if (emailUser) {
                console.log('User with this email already exists, linking Google account:', emailUser._id);
                // Update existing user with Google ID
                emailUser.googleId = profile.id;
                emailUser.profilePic = profile.photos[0]?.value || '';
                emailUser.authMethod = 'google'; // Update the auth method
                await emailUser.save();
                return done(null, emailUser);
            }

            // Create new user since this is their first time logging in with Google
            console.log('Creating new user with Google account');
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                isEmailVerified: true, // Google already verified the email
                profilePic: profile.photos[0]?.value || '',
                authMethod: 'google' // Mark that this user uses Google authentication
            });
            
            console.log('New user created:', user._id);
            return done(null, user);
        } catch (error) {
            console.error('Google authentication error:', error);
            // Handle specific errors
            if (error.code === 11000) {
                console.log('Email already exists. Trying to link Google account...');
                try {
                    const emailUser = await User.findOne({ email: profile.emails[0].value });
                    if (emailUser) {
                        emailUser.googleId = profile.id;
                        emailUser.profilePic = profile.photos[0]?.value || '';
                        emailUser.authMethod = 'google';
                        await emailUser.save();
                        return done(null, emailUser);
                    }
                } catch (innerError) {
                    console.error('Error linking Google account:', innerError);
                    return done(innerError, false);
                }
            }
            return done(error, false);
        }
}));

// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
