const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const { authenticate } = require('../middleware/auth');

router.post('/speak', authenticate, audioController.speak);

module.exports = router;