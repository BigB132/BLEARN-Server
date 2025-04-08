const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
    }
    
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Invalid token" });
    }
};

// Middleware to verify user token and email
const verifyUserToken = async (req, res, next) => {
    const { token, email } = req.body;
    
    if (!token || !email) {
        return res.status(400).json({ msg: "Token and email are required" });
    }
    
    try {
        const user = await User.findOne({ token, email });
        if (!user) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ msg: "Server error" });
    }
};

module.exports = {
    verifyToken,
    verifyUserToken
};