const nodemailer = require('nodemailer');
require('dotenv').config();

let ioInstance = null;
let emailServiceReady = false;
let emailServiceError = null;

// Create transporter with timeout settings
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465, // auto secure if using 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' // stricter in prod
    },
    connectionTimeout: 5000, // 5 seconds connection timeout
    greetingTimeout: 5000, // 5 seconds greeting timeout
    socketTimeout: 10000, // 10 seconds socket timeout
    pool: false // Disable connection pooling to avoid hanging connections
});

// Verify transporter with timeout (non-blocking)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use setTimeout to add timeout to verification
    const verifyTimeout = setTimeout(() => {
        console.warn('⚠️  Email service verification timeout - will attempt to send emails anyway');
        emailServiceReady = false;
        emailServiceError = 'Verification timeout';
    }, 5000); // 5 second timeout

    transporter.verify((error, success) => {
        clearTimeout(verifyTimeout);
        if (error) {
            console.error('❌ Email service configuration error:', error.message);
            emailServiceReady = false;
            emailServiceError = error.message;
        } else {
            console.log('✅ Email service is ready to send messages');
            console.log(`   Using: ${process.env.EMAIL_USER} via ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
            emailServiceReady = true;
        }
    });
} else {
    console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env file.');
}

const sendEmailNotification = async ({ to, subject, text, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`📧 Email skipped: not configured (${subject} to ${to})`);
        return { skipped: true, reason: 'Email service not configured' };
    }

    if (!to || !subject) {
        console.warn('⚠️ Missing recipient or subject');
        return { success: false, error: 'Invalid parameters' };
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || `CRM System <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || text
        };

        // Add timeout to prevent hanging
        const sendPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Email send timeout after 15 seconds')), 15000);
        });

        const info = await Promise.race([sendPromise, timeoutPromise]);
        
        if (process.env.NODE_ENV !== 'production') {
            console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
        }
        return { success: true, messageId: info.messageId, info };
    } catch (error) {
        console.error(`❌ Error sending email to ${to}: ${error.message}`);
        return { success: false, error: error.message, details: error };
    }
};

module.exports = {
    sendEmailNotification,
    emailServiceReady,
    emailServiceError
};
