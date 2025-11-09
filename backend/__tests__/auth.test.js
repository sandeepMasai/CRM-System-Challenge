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
        await User.destroy({
            where: {
                email: ['testadmin@example.com', 'newuser@example.com', 'defaultrole@example.com']
            }
        });
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
            expect(response.body.message).toBe('Invalid email or password');
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
        it('should create new user (public endpoint)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
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
            expect(response.body.user.role).toBe('Sales Executive');
        });

        it('should default to Sales Executive role if not provided', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Default Role User',
                    email: 'defaultrole@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body.user.role).toBe('Sales Executive');
        });

        it('should reject duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'testadmin@example.com',
                    password: 'password123',
                    role: 'Sales Executive'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('already exists');
        });

        it('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Invalid Email',
                    email: 'notanemail',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
        });

        it('should reject password less than 6 characters', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Short Password',
                    email: 'shortpass@example.com',
                    password: '12345'
                });

            expect(response.status).toBe(400);
        });
    });
});

