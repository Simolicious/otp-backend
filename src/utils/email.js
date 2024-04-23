const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: '127.0.0.1',
    port: 2500,
    secure: false,
    auth: {
        user: 'inbucket',
        pass: 'inbucket'
    }
});

const sendEmail = async (to, subject, body) => {
    const emailOptions = {
        from: 'no-reply@entrostat.xyz',
        subject: subject,
        to: to,
        text: body,
    }

    try {
        await transporter.sendMail(emailOptions);
        console.log('Email sent succesfully')
    } catch (err) {
        console.log('Error: Email failed to send', err);
        throw new Error('Error: Email failed to send');
    }
}

module.exports = {
    sendEmail
}