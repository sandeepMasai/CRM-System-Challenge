/**
 * Auth Validators Tests
 * Tests for input validation rules
 */
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateUserValidation,
  adminRegisterValidation,
} = require('../../validators/authValidators');
const { validationResult } = require('express-validator');

describe('Auth Validators', () => {
  describe('registerValidation', () => {
    it('should pass validation with valid data', async () => {
      const req = {
        body: {
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123',
          role: 'Sales Executive',
        },
      };

      for (const validator of registerValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation without name', async () => {
      const req = {
        body: {
          email: 'test@test.com',
          password: 'Password123',
        },
      };

      for (const validator of registerValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringContaining('Name'),
          }),
        ])
      );
    });

    it('should fail validation with invalid email', async () => {
      const req = {
        body: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123',
        },
      };

      for (const validator of registerValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringContaining('email'),
          }),
        ])
      );
    });

    it('should fail validation with short password', async () => {
      const req = {
        body: {
          name: 'Test User',
          email: 'test@test.com',
          password: '12345', // Less than 6 characters
        },
      };

      for (const validator of registerValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringContaining('Password'),
          }),
        ])
      );
    });

    it('should fail validation with invalid role', async () => {
      const req = {
        body: {
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123',
          role: 'InvalidRole',
        },
      };

      for (const validator of registerValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringContaining('Invalid role'),
          }),
        ])
      );
    });
  });

  describe('loginValidation', () => {
    it('should pass validation with valid data', async () => {
      const req = {
        body: {
          email: 'test@test.com',
          password: 'Password123',
        },
      };

      for (const validator of loginValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation without email', async () => {
      const req = {
        body: {
          password: 'Password123',
        },
      };

      for (const validator of loginValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should fail validation without password', async () => {
      const req = {
        body: {
          email: 'test@test.com',
        },
      };

      for (const validator of loginValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('forgotPasswordValidation', () => {
    it('should pass validation with valid email', async () => {
      const req = {
        body: {
          email: 'test@test.com',
        },
      };

      for (const validator of forgotPasswordValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation with invalid email', async () => {
      const req = {
        body: {
          email: 'invalid-email',
        },
      };

      for (const validator of forgotPasswordValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('resetPasswordValidation', () => {
    it('should pass validation with valid data', async () => {
      const req = {
        body: {
          token: 'valid-token',
          password: 'NewPassword123',
        },
      };

      for (const validator of resetPasswordValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation without token', async () => {
      const req = {
        body: {
          password: 'NewPassword123',
        },
      };

      for (const validator of resetPasswordValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should fail validation with short password', async () => {
      const req = {
        body: {
          token: 'valid-token',
          password: '12345',
        },
      };

      for (const validator of resetPasswordValidation) {
        await validator(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });
  });
});

