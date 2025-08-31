const nodemailer = require('nodemailer');

// Create a transporter with more specific Gmail SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-email-password'
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

/**
 * Send OTP email to user
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} otp - One-Time Password
 * @returns {Promise} - Promise with email send info
 */
const sendOTPEmail = async (to, name, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to,
            subject: 'Your Note Taker App Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">Hello, ${name}!</h2>
                    <p>Thank you for registering with Note Taker. To complete your registration, please use the verification code below:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="margin: 0; color: #4285f4; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated message, please do not reply.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendOTPEmail };
