const express = require('express');
const router = express.Router();
const { main, tabellen, lueckentexte } = require('../controllers/moduleController');

router.post('/main', main);
router.post('/tabellen', tabellen);
router.post('/lueckentexte', lueckentexte);

module.exports = router;