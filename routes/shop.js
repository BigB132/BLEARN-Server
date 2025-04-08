const express = require('express');
const router = express.Router();
const { earnCoinsPage, claimCoins, buyModule, fetchProjects } = require('../controllers/shopController');

router.get('/earn/:randomId', earnCoinsPage);

router.post('/claim/:randomId', claimCoins);

router.get('/shop/buy/:module/:pack', buyModule);

router.post('/fetchProjects', fetchProjects);

module.exports = router;