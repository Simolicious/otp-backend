const Otp = require('../models/Otp');
const config = require('../config/config');
const { sendEmail } = require('../utils/email');
const { generateUniqueOtp, validateOtpCode } = require('../utils/OtpService');

exports.generateOtp = async (request, response) => {
    const { email } = request.body;

    if(!email) {
        return response.status(400).json({ message: 'Email is required.'});
    }

    try {
        const otpCode = await generateUniqueOtp(email);
        const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000);

        const otpToSave = new Otp({
            email: email,
            code: otpCode,
            expiresAt: expiresAt,
        });

        await otpToSave.save();

        // Checking if the user has requested more than the configured OTP requests per hour
        let otpCount = await Otp.countDocuments({
            email,
            createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) },
        });

        if(otpCount > config.OTP_REQUESTS_PER_HOUR) {
            await otpToSave.remove();
            return response.status(429).json({ message: 'You have run out of OTPs. Please try again later' });
        }

        await sendEmail(email, 'Entrostat OTP', `Your OTP: ${otpCode}`);

        response.status(200).send({ message: 'OTP sent successfully' });
    } catch(err) {
        response.status(500).send({ message: 'Failed to send', error: err });
    }
}

exports.validateOtp = async (request, response) => {
    const { email, otp } = request.body;

    if(!email || !otp) {
        return response.status(400).json({ message: 'Email and OTP are required.'});
    }

    try {
        const valid = await validateOtpCode(email, otp);

        return valid ? response.status(200).send({ message: 'OTP is valid!' }) : response.status(400).send({ message: 'OTP is invalid' });

    } catch (err) {
        response.status(500).send({ message: 'Failed to validate', error: err });
    }

    response.send('Validate');
}
exports.resendOtp = async (request, response) => {
    const { email } = request.body;

    if(!email) {
        return response.status(400).json({ message: 'Email is required.'});
    }

    response.send('Resend');
}