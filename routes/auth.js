const express = require('express');
const router = express.Router();
const { login, verifyEmail, checkToken } = require('../controllers/authController');

router.post("/login", login);

router.post("/verify", verifyEmail);

router.post("/checktoken", checkToken);

module.exports = router;