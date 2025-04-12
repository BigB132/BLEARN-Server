const express = require('express');
const router = express.Router();
const { main, tabellen } = require('../controllers/moduleController');

router.post('/main', main);
router.post('/tabellen', tabellen);

module.exports = router;