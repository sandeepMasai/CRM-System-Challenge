/**
 * Auth Middleware Tests
 * Tests for authentication and authorization middleware
 */
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('../../models');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');

// --- Helpers ---
const generateTestToken = (user, expiresIn = '1h') => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn }
  );
};

// --- Test Setup ---
let testUser;

beforeAll(async () => {
  // ✅ Ensure database connection is ready
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  // ✅ Create a working test user
  testUser = await User.create({
    name: 'Token Test User',
    email: 'tokentest@example.com',
    password: 'Test123456',
    role: 'Sales Executive',
    isActive: true,
  });
});

afterAll(async () => {
  // ✅ Clean up DB and close connection
  await User.destroy({ where: {} });
  await sequelize.close();
});

// --- Test Suites ---
describe('Auth Middleware', () => {
  describe('authenticateToken', () => {
    it('should authenticate user with valid token', async () => {
      const token = generateTestToken(testUser);
      const req = {
        headers: { authorization: `Bearer ${token}` },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const req = { headers: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Access denied'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      const req = { headers: { authorization: 'Bearer invalidtoken' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid or expired token'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', async () => {
      const expiredToken = generateTestToken(testUser, '-1h');
      const req = { headers: { authorization: `Bearer ${expiredToken}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid or expired token'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request for inactive user', async () => {
      testUser.isActive = false;
      await testUser.save();

      const token = generateTestToken(testUser);
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Account is deactivated'),
        })
      );
      expect(next).not.toHaveBeenCalled();

      // ✅ Reactivate for other tests
      testUser.isActive = true;
      await testUser.save();
    });
  });

  describe('authorizeRoles', () => {
    it('should allow access for authorized role', () => {
      const req = { user: { role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const authorizeAdmin = authorizeRoles('Admin');
      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      const req = { user: { role: 'Sales Executive' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const authorizeAdmin = authorizeRoles('Admin', 'Manager');
      authorizeAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Access denied'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should require authentication before authorization', () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const authorizeAdmin = authorizeRoles('Admin');
      authorizeAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow access for multiple roles', () => {
      const req = { user: { role: 'Manager' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const authorizeAdminOrManager = authorizeRoles('Admin', 'Manager');
      authorizeAdminOrManager(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
