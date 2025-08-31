const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;
    
    // Check Authorization header first
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
    } 
    // If no token in header, check cookies
    else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (err) {
            console.error('Token validation error:', err);
            res.status(401);
            throw new Error("User is not authorized - invalid token");
        }
    } else {
        res.status(401);
        throw new Error("User is not authorized or token is missing");
    }
})

module.exports = validateToken;
