const express = require('express');
const router = express.Router();
const { getDocumentationStructure, getSectionContent, searchDocumentation } = require('../controllers/documentationController');

router.get('/structure', getDocumentationStructure);

router.get('/content/:sectionId/:email/:token', getSectionContent);

router.get('/search', searchDocumentation);

module.exports = router;