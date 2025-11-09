const { User } = require('../models');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
    let testUser;

    afterEach(async () => {
        // Clean up test user
        if (testUser) {
            await User.destroy({ where: { id: testUser.id }, force: true });
            testUser = null;
        }
    });

    describe('User Creation', () => {
        it('should create a user with hashed password', async () => {
            testUser = await User.create({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123',
                role: 'Sales Executive'
            });

            expect(testUser).toBeDefined();
            expect(testUser.id).toBeDefined();
            expect(testUser.name).toBe('Test User');
            expect(testUser.email).toBe('testuser@example.com');
            expect(testUser.role).toBe('Sales Executive');
            expect(testUser.password).not.toBe('password123'); // Should be hashed
            expect(testUser.isActive).toBe(true);
        });

        it('should default role to Sales Executive', async () => {
            testUser = await User.create({
                name: 'Default Role User',
                email: 'defaultrole@example.com',
                password: 'password123'
            });

            expect(testUser.role).toBe('Sales Executive');
        });

        it('should hash password on creation', async () => {
            testUser = await User.create({
                name: 'Hash Test User',
                email: 'hashtest@example.com',
                password: 'password123'
            });

            const isHashed = await bcrypt.compare('password123', testUser.password);
            expect(isHashed).toBe(true);
        });

        it('should reject duplicate email', async () => {
            testUser = await User.create({
                name: 'First User',
                email: 'duplicate@example.com',
                password: 'password123'
            });

            await expect(
                User.create({
                    name: 'Second User',
                    email: 'duplicate@example.com',
                    password: 'password123'
                })
            ).rejects.toThrow();
        });

        it('should reject invalid email format', async () => {
            await expect(
                User.create({
                    name: 'Invalid Email',
                    email: 'notanemail',
                    password: 'password123'
                })
            ).rejects.toThrow();
        });

        it('should reject password less than 6 characters', async () => {
            await expect(
                User.create({
                    name: 'Short Password',
                    email: 'shortpass@example.com',
                    password: '12345'
                })
            ).rejects.toThrow();
        });
    });

    describe('Password Comparison', () => {
        it('should compare password correctly', async () => {
            testUser = await User.create({
                name: 'Password Test User',
                email: 'passwordtest@example.com',
                password: 'password123'
            });

            const isValid = await testUser.comparePassword('password123');
            expect(isValid).toBe(true);

            const isInvalid = await testUser.comparePassword('wrongpassword');
            expect(isInvalid).toBe(false);
        });
    });

    describe('Password Update', () => {
        it('should hash password on update', async () => {
            testUser = await User.create({
                name: 'Update Test User',
                email: 'updatetest@example.com',
                password: 'oldpassword'
            });

            const oldPasswordHash = testUser.password;

            testUser.password = 'newpassword123';
            await testUser.save();

            expect(testUser.password).not.toBe(oldPasswordHash);
            expect(testUser.password).not.toBe('newpassword123');

            const isValid = await testUser.comparePassword('newpassword123');
            expect(isValid).toBe(true);
        });

        it('should not rehash password if password did not change', async () => {
            testUser = await User.create({
                name: 'No Change User',
                email: 'nochange@example.com',
                password: 'password123'
            });

            const originalHash = testUser.password;

            testUser.name = 'Updated Name';
            await testUser.save();

            expect(testUser.password).toBe(originalHash);
        });
    });

    describe('User Roles', () => {
        it('should accept Admin role', async () => {
            testUser = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin'
            });

            expect(testUser.role).toBe('Admin');
        });

        it('should accept Manager role', async () => {
            testUser = await User.create({
                name: 'Manager User',
                email: 'manager@example.com',
                password: 'password123',
                role: 'Manager'
            });

            expect(testUser.role).toBe('Manager');
        });

        it('should accept Sales Executive role', async () => {
            testUser = await User.create({
                name: 'Sales User',
                email: 'sales@example.com',
                password: 'password123',
                role: 'Sales Executive'
            });

            expect(testUser.role).toBe('Sales Executive');
        });
    });
});

