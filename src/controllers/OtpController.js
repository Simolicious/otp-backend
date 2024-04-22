const Otp = require('../models/Otp');
const config = require('../config/config');

exports.generateOtp = async (request, response) => {
    response.send('Generate');
}

exports.validateOtp = async (request, response) => {
    response.send('Validate');
}

exports.resendOtp = async (request, response) => {
    response.send('Resend');

}