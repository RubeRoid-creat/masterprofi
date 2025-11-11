/**
 * Form Validation Tests
 * Tests for validation logic and error handling
 */

import { validateEmail, validatePhone, validatePassword } from '../utils/validation';

describe('Form Validation', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'user123@example-domain.com',
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example',
        '',
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle null and undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should validate Russian phone numbers', () => {
      const validPhones = [
        '+7 (999) 123-45-67',
        '+79991234567',
        '89991234567',
        '8 (999) 123-45-67',
      ];

      validPhones.forEach((phone) => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        '+1234567890',
        'abc',
        '',
        '+7 (999) 123-45',
      ];

      invalidPhones.forEach((phone) => {
        expect(validatePhone(phone)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate password length', () => {
      expect(validatePassword('short', 6)).toBe(false);
      expect(validatePassword('longenough', 6)).toBe(true);
      expect(validatePassword('verylongpassword123', 6)).toBe(true);
    });

    it('should reject passwords below minimum length', () => {
      expect(validatePassword('12345', 6)).toBe(false);
      expect(validatePassword('123456', 6)).toBe(true);
    });

    it('should handle empty passwords', () => {
      expect(validatePassword('', 6)).toBe(false);
    });
  });

  describe('Registration Form Validation', () => {
    it('should validate complete registration form', () => {
      const validForm = {
        email: 'test@example.com',
        phone: '+7 (999) 123-45-67',
        password: 'Password123!',
        name: 'John Doe',
      };

      // Mock validation function
      const validateForm = (form: any) => {
        const errors: string[] = [];
        
        if (!validateEmail(form.email)) errors.push('Invalid email');
        if (!validatePhone(form.phone)) errors.push('Invalid phone');
        if (!validatePassword(form.password, 6)) errors.push('Password too short');
        if (!form.name || form.name.length < 2) errors.push('Invalid name');
        
        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      const result = validateForm(validForm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return all errors for invalid form', () => {
      const invalidForm = {
        email: 'invalid-email',
        phone: '123',
        password: 'weak',
        name: '',
      };

      // Mock validation function
      const validateForm = (form: any) => {
        const errors: string[] = [];
        
        if (!validateEmail(form.email)) errors.push('Invalid email');
        if (!validatePhone(form.phone)) errors.push('Invalid phone');
        if (!validatePassword(form.password, 6)) errors.push('Password too short');
        if (!form.name || form.name.length < 2) errors.push('Invalid name');
        
        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      const result = validateForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

