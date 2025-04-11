const express = require('express');
const router = express.Router();
const { tabellen } = require('../controllers/moduleController');

router.post('/tabellen', tabellen);

module.exports = router;