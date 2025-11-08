const request = require('supertest');
const { app } = require('../server');
const { User } = require('../models');
const jwt = require('jsonwebtoken');

describe('Authentication API', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
        // Create a test user
        testUser = await User.create({
            name: 'Test Admin',
            email: 'testadmin@example.com',
            password: 'password123',
            role: 'Admin'
        });

        // Generate token for test user
        authToken = jwt.sign(
            { userId: testUser.id, email: testUser.email, role: testUser.role },
            process.env.JWT_SECRET || 'test_secret',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        // Clean up test data
        await User.destroy({ where: { email: 'testadmin@example.com' } });
        await User.destroy({ where: { email: 'newuser@example.com' } });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testadmin@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('testadmin@example.com');
        });

        it('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testadmin@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should reject missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'password123'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('testadmin@example.com');
        });

        it('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/auth/register', () => {
        it('should create new user (Admin only)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'password123',
                    role: 'Sales Executive'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe('newuser@example.com');
        });

        it('should reject duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Duplicate User',
                    email: 'testadmin@example.com',
                    password: 'password123',
                    role: 'Sales Executive'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('already exists');
        });
    });
});

