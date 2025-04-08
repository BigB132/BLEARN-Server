const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const { sendVerificationEmail } = require('../services/emailService');
const generateToken = require('../utils/tokenGenerator');

const login = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }
        
        const user = await User.findOne({ email });
        const mailToken = Math.floor(1000 + Math.random() * 9000);

        if (!user) {
            const newUser = new User({
                email: email,
                mailToken: mailToken,
            });
            await newUser.save();
        } else {
            user.mailToken = mailToken;
            await user.save();
        }

        // Send verification email
        await sendVerificationEmail(email, mailToken);

        // Generate JWT token
        const token = jwt.sign({ userId: email }, jwtSecret, { expiresIn: jwtExpiresIn });
        res.json({ msg: "Login erfolgreich", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ msg: "Server error" });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, mailToken } = req.body;
        
        if (!email || !mailToken) {
            return res.status(400).json({ msg: "Email and verification code are required" });
        }
        
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ msg: "No user" });
        if (Number(user.mailToken) !== Number(mailToken)) return res.status(400).json({ msg: "fail" });
        
        const token = generateToken();
        
        user.token = token;
        await user.save();

        res.json({ msg: "success", token });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ msg: "Server error" });
    }
};

// Check token validity and update coin code
const checkToken = async (req, res) => {
    try {
        const { token, email, coincode } = req.body;
        
        if (!token || !email) {
            return res.status(400).json({ msg: "Token and email are required" });
        }

        const user = await User.findOne({ token, email });
        if (user) {
            if (coincode) {
                user.coinCode = coincode;
                await user.save();
            }
            res.json({ msg: "success", coins: user.coins });
        } else {
            res.json({ msg: "fail" });
        }
    } catch (error) {
        console.error("Token check error:", error);
        res.status(500).json({ msg: "Server error" });
    }
};

module.exports = {
    login,
    verifyEmail,
    checkToken
};