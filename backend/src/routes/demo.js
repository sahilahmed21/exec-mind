const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { authenticate } = require('../middleware/auth');

router.post('/chat', authenticate, demoController.getDemoResponse);

module.exports = router;