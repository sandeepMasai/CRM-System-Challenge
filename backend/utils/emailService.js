const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify((error, success) => {
        if (error) {
            console.log('Email service configuration error:', error);
        } else {
            console.log('Email service is ready to send messages');
        }
    });
}

const sendEmailNotification = async ({ to, subject, text, html }) => {
    // Skip if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email service not configured. Skipping email notification.');
        return;
    }

    try {
        const mailOptions = {
            from: `CRM System <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmailNotification
};

