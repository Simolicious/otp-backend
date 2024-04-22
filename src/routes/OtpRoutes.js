const express = require('express');
const router = express.Router();
const otpController = require('../controllers/OtpController');

router.post('/generate', otpController.generateOtp);
router.post('/validate', otpController.validateOtp);
router.post('/resend', otpController.resendOtp);

module.exports = router;