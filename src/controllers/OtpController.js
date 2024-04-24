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
            createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000),  $lte: new Date()},
            resent: false,
        });

        if(otpCount > config.OTP_REQUESTS_PER_HOUR) {
            await otpToSave.remove();
            return response.status(429).json({ message: 'You have run out of OTPs. Please try again later' });
        }

        await sendEmail(email, 'Entrostat OTP', `Your OTP: ${otpCode}`);

        return response.status(200).send({ message: 'OTP sent successfully' });
    } catch(err) {
        console.log('Generate error:', err);
        return response.status(500).send({ message: 'Failed to send', error: err });
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
        console.log('Validate error:', err);
        return response.status(500).send({ message: 'Failed to validate', error: err });
    }
}

exports.resendOtp = async (request, response) => {
    const { email } = request.body;

    if(!email) {
        return response.status(400).json({ message: 'Email is required.'});
    }

    try {
        // Getting the original OTP by sorting by oldest
        const otps = await Otp.find({email, isUsed: false}).sort({ createdAt: 1}).exec();

        if(otps.length > 0) {
            const otp = otps[0];
            let otpToSave;
            if(otp.createdAt > new Date(Date.now() - config.OTP_RESEND_MINUTES * 60 * 1000) && otp.createdAt <= new Date()) {
                otpToSave = new Otp({
                    email: email,
                    code: otp.code,
                    expiresAt: new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000),
                    resent: true,
                });
            } else {
                otpToSave = new Otp({
                    email: email,
                    code: await generateUniqueOtp(email),
                    expiresAt: new Date(Date.now() + config.OTP_EXPIRY_SECONDS * 1000),
                    resent: true,
                });
            }

            await otpToSave.save();

            let otpCount = await Otp.countDocuments({
                email,
                resent: true,
            });
    
            if(otpCount > config.OTP_RESEND_LIMIT) {
                await otpToSave.remove();
                return response.status(429).json({ message: 'You have run out of Resends' });
            }

            await sendEmail(email, 'Entrostat Resent OTP', `We have resent your OTP: ${otpToSave.code}`);
            return response.status(200).send({ message: 'Successfully resent' });
        } else {
            return response.status(404).json({ message: 'Submit an OTP first' });
        }

    } catch (err) {
        console.log('Resend error', err);
        return response.status(500).send({ message: 'Failed to resend', error: err });
    }
}