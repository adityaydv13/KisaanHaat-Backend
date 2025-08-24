const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
router.post('/enquiries', contactController.submitEnquiry);

module.exports = router;
