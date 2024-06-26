const Otp = require('../models/Otp');
const config = require('../config/config');

/**
 * Generates a unique OTP for an email
 * 
 * @param {string} email - The email address to generate an OTP for.
 * @returns {Promise<string>} - A promise that resolves with a unique OTP.
 */
const generateUniqueOtp = async (email) => {
    let otpCode;
    let otpLast24Hours;
    
    // finds an OTP in the last 24 hours that has the same code as the one generated. If it matches then it will regenerate the code to keep it unique
    do {
        // randomly generate first digit between 0 and 9 then the remaining 5 digits for the possibility of the OTP starting with 0
        const randomNumber = Math.floor(Math.random() * 10).toString();
        const remainingDigits = Math.floor(10000 + Math.random() * 9000).toString();
        otpCode = randomNumber + remainingDigits;

        otpLast24Hours = await Otp.findOne({
            email,
            code: otpCode,
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000),  $lte: new Date() },
            isUsed: false,
        });
    } while(otpLast24Hours);

    return otpCode; 
}

/**
 * Validates OTP associated with the provided email
 * 
 * @param {string} email - The email address to validate the OTP for.
 * @param {string} otp - The OTP to validate
 * @returns {Promise<string>} - A promise boolean indicating the validation result.
 */
const validateOtpCode = async (email, otpCode) => {
    try {
        const otps = await Otp.find({ email, isUsed: false}).sort({ createdAt: -1 }).exec();

        if(otps?.length > 0 && otps[0].expiresAt > new Date() && otps[0].code === otpCode) {
            
            // remove otps associated to the email once it's valid
            await Otp.deleteMany({ email });

            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log('Error validating', err);
        throw new Error(`Error validating OTP: ${err}`);
    }
}

module.exports = {
    generateUniqueOtp,
    validateOtpCode
}