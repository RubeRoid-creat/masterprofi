/**
 * Validation utilities for login form
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove spaces, dashes, and other formatting
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  // Check if it's 10+ digits
  return /^\d{10,}$/.test(cleaned);
};

export const validateEmailOrPhone = (value: string): boolean => {
  return validateEmail(value) || validatePhone(value);
};

export const validatePassword = (password: string, minLength: number = 6): boolean => {
  return password.length >= minLength;
};

export const getInputType = (value: string): 'email' | 'phone' => {
  if (validateEmail(value)) return 'email';
  if (validatePhone(value)) return 'phone';
  return 'email'; // default
};









