// Mock nodemailer BEFORE any imports
jest.mock('nodemailer');

describe('Email Service', () => {
    let mockTransporter;
    let mockSendMail;
    let nodemailer;

    beforeEach(() => {
        // Get the mocked nodemailer
        nodemailer = require('nodemailer');

        // Setup mock transporter
        mockSendMail = jest.fn();
        mockTransporter = {
            verify: jest.fn((callback) => {
                // Simulate async verification - call immediately
                process.nextTick(() => callback(null, true));
            }),
            sendMail: mockSendMail
        };

        // Set up the mock to return our transporter
        nodemailer.createTransport.mockReturnValue(mockTransporter);
    });

    afterEach(() => {
        jest.clearAllMocks();
        // Clean up environment variables
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;
        delete process.env.EMAIL_HOST;
        delete process.env.EMAIL_PORT;
        delete process.env.EMAIL_FROM;
    });

    const loadEmailService = () => {
        // Reset modules to get fresh emailService
        jest.resetModules();
        // Ensure mock is set up before requiring
        nodemailer.createTransport.mockReturnValue(mockTransporter);
        // Now require the module
        return require('../utils/emailService');
    };

    describe('sendEmailNotification', () => {
        it('should skip sending email when EMAIL_USER is not configured', async () => {
            const { sendEmailNotification } = loadEmailService();

            const result = await sendEmailNotification({
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test message'
            });

            expect(result.skipped).toBe(true);
            expect(result.reason).toBe('Email service not configured');
            expect(mockSendMail).not.toHaveBeenCalled();
        });

        it('should skip sending email when EMAIL_PASS is not configured', async () => {
            process.env.EMAIL_USER = 'test@example.com';
            // Don't set EMAIL_PASS
            const { sendEmailNotification } = loadEmailService();

            const result = await sendEmailNotification({
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test message'
            });

            expect(result.skipped).toBe(true);
            expect(mockSendMail).not.toHaveBeenCalled();
        });

        it('should reject missing recipient', async () => {
            process.env.EMAIL_USER = 'sender@example.com';
            process.env.EMAIL_PASS = 'password123';
            const { sendEmailNotification } = loadEmailService();

            const result = await sendEmailNotification({
                subject: 'Test Subject',
                text: 'Test message'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid parameters');
            expect(mockSendMail).not.toHaveBeenCalled();
        });

        it('should reject missing subject', async () => {
            process.env.EMAIL_USER = 'sender@example.com';
            process.env.EMAIL_PASS = 'password123';
            const { sendEmailNotification } = loadEmailService();

            const result = await sendEmailNotification({
                to: 'test@example.com',
                text: 'Test message'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid parameters');
            expect(mockSendMail).not.toHaveBeenCalled();
        });

        it('should send email successfully when configured', async () => {
            process.env.EMAIL_USER = 'sender@example.com';
            process.env.EMAIL_PASS = 'password123';
            process.env.EMAIL_HOST = 'smtp.gmail.com';
            process.env.EMAIL_PORT = '587';
            const { sendEmailNotification } = loadEmailService();

            const mockInfo = {
                messageId: '<test-message-id>',
                accepted: ['test@example.com'],
                rejected: []
            };
            mockSendMail.mockResolvedValue(mockInfo);

            const result = await sendEmailNotification({
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test message',
                html: '<p>Test message</p>'
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('<test-message-id>');
            expect(mockSendMail).toHaveBeenCalledWith({
                from: 'CRM System <sender@example.com>',
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test message',
                html: '<p>Test message</p>'
            });
        });

        it('should use EMAIL_FROM if configured', async () => {
            process.env.EMAIL_USER = 'sender@example.com';
            process.env.EMAIL_PASS = 'password123';
            process.env.EMAIL_FROM = 'Custom Name <custom@example.com>';
            const { sendEmailNotification } = loadEmailService();

            const mockInfo = { messageId: '<test-id>' };
            mockSendMail.mockResolvedValue(mockInfo);

            await sendEmailNotification({
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test message'
            });

            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: 'Custom Name <custom@example.com>'
                })
            );
        });

        it('should handle email sending errors gracefully', async () => {
            process.env.EMAIL_USER = 'sender@example.com';
            process.env.EMAIL_PASS = 'password123';
            const { sendEmailNotification } = loadEmailService();

            const error = new Error('SMTP connection failed');
            mockSendMail.mockRejectedValue(error);

            const result = await sendEmailNotification({
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test message'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('SMTP connection failed');
            expect(result.details).toBe(error);
        });

        it('should use text as html if html is not provided', async () => {
            process.env.EMAIL_USER = 'sender@example.com';
            process.env.EMAIL_PASS = 'password123';
            const { sendEmailNotification } = loadEmailService();

            const mockInfo = { messageId: '<test-id>' };
            mockSendMail.mockResolvedValue(mockInfo);

            await sendEmailNotification({
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Plain text message'
            });

            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: 'Plain text message'
                })
            );
        });
    });
});
