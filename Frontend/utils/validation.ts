/**
 * Validation utilities - Email, password, phone, and form validators
 */

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
export const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

/**
 * Validate email address
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

/**
 * Validate password strength
 * Requirements: min 6 chars (relaxed for development)
 */
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

/**
 * Validate name field
 */
export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Phone is required';
  if (!phoneRegex.test(phone)) return 'Invalid phone format';
  return null;
};

/**
 * Validate URL
 */
export const validateUrl = (url: string): string | null => {
  if (!url) return 'URL is required';
  if (!urlRegex.test(url)) return 'Invalid URL format';
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName = 'Field'): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, min: number, fieldName = 'Field'): string | null => {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value: string, max: number, fieldName = 'Field'): string | null => {
  if (value.length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return null;
};

/**
 * Combine multiple validators
 */
export const combineValidators = (...validators: ((val: any) => string | null)[]): ((val: any) => string | null) => {
  return (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
};
