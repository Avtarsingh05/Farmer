import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema } from '@/schemas/auth.schema';

describe('Auth Schema Validation', () => {
  describe('loginSchema', () => {
    it('accepts valid email/password', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const valid = {
      name: 'Ramesh Kumar',
      email: 'ramesh@example.com',
      password: 'strongPass1',
      confirmPassword: 'strongPass1',
      role: 'farmer' as const,
    };

    it('accepts valid farmer registration', () => {
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('accepts valid buyer registration', () => {
      const result = registerSchema.safeParse({ ...valid, role: 'buyer' });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({ ...valid, confirmPassword: 'different' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.confirmPassword).toBeDefined();
      }
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({ ...valid, password: 'short', confirmPassword: 'short' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid role', () => {
      const result = registerSchema.safeParse({ ...valid, role: 'admin' });
      expect(result.success).toBe(false);
    });

    it('rejects short name', () => {
      const result = registerSchema.safeParse({ ...valid, name: 'A' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid Indian phone number', () => {
      const result = registerSchema.safeParse({ ...valid, phone: '12345' });
      expect(result.success).toBe(false);
    });

    it('accepts valid Indian mobile number', () => {
      const result = registerSchema.safeParse({ ...valid, phone: '9876543210' });
      expect(result.success).toBe(true);
    });

    it('accepts empty phone (optional)', () => {
      const result = registerSchema.safeParse({ ...valid, phone: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('accepts valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'notanemail' });
      expect(result.success).toBe(false);
    });
  });
});
