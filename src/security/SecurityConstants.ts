// Placeholder for SecurityConstants module
export class SecurityConstants {
  static readonly TOKEN_EXPIRATION = 3600; // 1 hour in seconds
  static readonly REFRESH_TOKEN_EXPIRATION = 604800; // 7 days in seconds
  static readonly MAX_LOGIN_ATTEMPTS = 5;
  static readonly LOCKOUT_DURATION = 900; // 15 minutes in seconds
  static readonly PASSWORD_MIN_LENGTH = 8;
  static readonly PASSWORD_MAX_LENGTH = 128;
  static readonly MFA_CODE_LENGTH = 6;
  static readonly KEY_ROTATION_INTERVAL = 86400; // 24 hours in seconds
  static readonly AUTH_COOKIE_NAME = 'auth_token';
  static readonly AUTH_HEADER_NAME = 'Authorization';
}