/**
 * App-wide constants
 */

// ============================================
// API Configuration
// ============================================

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 30000; // 30 seconds

// ============================================
// Color Scheme
// ============================================

export const COLORS = {
  // Primary
  primary: '#2563eb', // Blue - for clients
  primaryLight: '#dbeafe',
  primaryDark: '#1e40af',

  // Secondary
  secondary: '#4f46e5', // Indigo - for consultants
  secondaryLight: '#e0e7ff',
  secondaryDark: '#3730a3',

  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Neutral
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// ============================================
// Text Styles
// ============================================

export const TEXT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

// ============================================
// Spacing
// ============================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// ============================================
// Border Radius
// ============================================

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',

  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_TAKEN: 'This email is already registered.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',

  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
  INVALID_PHONE: 'Please enter a valid phone number.',

  // General
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  NOT_FOUND: 'Resource not found.',
};

// ============================================
// Success Messages
// ============================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SESSION_BOOKED: 'Session booked successfully!',
  MESSAGE_SENT: 'Message sent!',
};

// ============================================
// Routes
// ============================================

export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
    SIGNUP: '/(auth)/signup',
    CONSULTANT_LOGIN: '/(consultant-auth)/login',
    CONSULTANT_SIGNUP: '/(consultant-auth)/signup',
  },
  TABS: {
    CHAT: '/(tabs)/chat',
    INDEX: '/(tabs)/index',
    PROFILE: '/(tabs)/profile',
    PSYCHOLOGISTS: '/(tabs)/psychologists',
    UPLOAD: '/(tabs)/upload',
  },
  CONSULTANT_TABS: {
    INDEX: '/(consultant-tabs)/index',
    SESSIONS: '/(consultant-tabs)/sessions',
    MESSAGES: '/(consultant-tabs)/messages',
    PROFILE: '/(consultant-tabs)/profile',
  },
};

// ============================================
// User Roles
// ============================================

export const USER_ROLES = {
  CLIENT: 'client',
  CONSULTANT: 'consultant',
} as const;

// ============================================
// Session Status
// ============================================

export const SESSION_STATUS = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// ============================================
// Message Status
// ============================================

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
} as const;

// ============================================
// Pagination
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// ============================================
// Timeouts (in milliseconds)
// ============================================

export const TIMEOUTS = {
  SHORT: 2000,
  MEDIUM: 5000,
  LONG: 10000,
  VERY_LONG: 30000,
};

// ============================================
// Date Formats
// ============================================

export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
};
