/**
 * Application Constants
 */

// API URLs
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Authentication
export const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes
export const REFRESH_TOKEN_EXPIRY_DAYS = 30;
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Security
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIRES_UPPERCASE = true;
export const PASSWORD_REQUIRES_LOWERCASE = true;
export const PASSWORD_REQUIRES_NUMBER = true;
export const PASSWORD_REQUIRES_SPECIAL = true;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Analytics
export const ANALYTICS_ENABLED = process.env.REACT_APP_ANALYTICS_ENABLED === 'true';
export const ANALYTICS_TRACKING_ID = process.env.REACT_APP_ANALYTICS_TRACKING_ID || '';

// Accessibility
export const HIGH_CONTRAST_MODE_ENABLED = false;
export const REDUCED_MOTION_ENABLED = false;
export const SCREEN_READER_HINTS_ENABLED = true;

// Internationalization
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'];
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Feature Flags
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  ANALYTICS: true,
  ACCESSIBILITY: true,
  INTERNATIONALIZATION: true,
  DARK_MODE: true,
  MFA: true,
};
