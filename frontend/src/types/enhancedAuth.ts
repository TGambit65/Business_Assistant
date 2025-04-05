/**
 * Enhanced Authentication Types
 * 
 * Type definitions for the enhanced authentication system with enterprise-grade security features.
 */

import { AuthConfig, AuthErrorType, AuthProvider, JWTToken, SessionStorage } from './auth';
import { User } from './user';

/**
 * Enhanced Authentication Configuration
 * Extends the base AuthConfig with enterprise-grade security features
 */
export interface EnhancedAuthConfig extends AuthConfig {
  tokenRefreshThreshold: number;
  maxConcurrentSessions: number;
  mfaRequired: boolean;
  passwordPolicyConfig: PasswordPolicyConfig;
}

/**
 * Password Policy Configuration
 * Defines the rules for password strength and management
 */
export interface PasswordPolicyConfig {
  minLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  preventReuse: number; // Number of previous passwords to check against
}

/**
 * Token Rotation Configuration
 * Defines the settings for token rotation and expiration
 */
export interface TokenRotationConfig {
  accessTokenDuration: number;  // 15 minutes in seconds
  refreshTokenDuration: number; // 7 days in seconds
  enforceDeviceBinding: boolean;
}

/**
 * Enhanced Session Storage
 * Extends the base SessionStorage with additional security context
 */
export interface EnhancedSessionStorage extends SessionStorage {
  deviceId: string;
  lastAccessed: number;
  securityContext: {
    mfaCompleted: boolean;
    riskScore: number;
    lastValidated: number;
  };
}

/**
 * Enhanced Authentication Error Types
 * Extends the base AuthErrorType with additional security-related errors
 */
export enum EnhancedAuthErrorType {
  // Existing error types from AuthErrorType
  INVALID_CREDENTIALS = AuthErrorType.INVALID_CREDENTIALS,
  NETWORK_ERROR = AuthErrorType.NETWORK_ERROR,
  SERVER_ERROR = AuthErrorType.SERVER_ERROR,
  TOKEN_EXPIRED = AuthErrorType.TOKEN_EXPIRED,
  USER_CANCELLED = AuthErrorType.USER_CANCELLED,
  ACCOUNT_LOCKED = AuthErrorType.ACCOUNT_LOCKED,
  AUTHORIZATION_FAILED = AuthErrorType.AUTHORIZATION_FAILED,
  REFRESH_TOKEN_FAILED = AuthErrorType.REFRESH_TOKEN_FAILED,
  UNKNOWN = AuthErrorType.UNKNOWN,
  
  // New error types
  DEVICE_MISMATCH = 'device_mismatch',
  MFA_REQUIRED = 'mfa_required',
  SECURITY_VIOLATION = 'security_violation',
  NO_SESSION = 'no_session',
  MAX_SESSIONS_EXCEEDED = 'max_sessions_exceeded'
}

/**
 * Security Audit Log
 * Structure for logging security-related events
 */
export interface SecurityAuditLog {
  eventType: AuthEventType;
  userId: string;
  timestamp: number;
  securityContext: SecurityContext;
  riskAssessment: RiskScore;
}

/**
 * Authentication Event Types
 */
export enum AuthEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  MFA_CHALLENGE = 'mfa_challenge',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILURE = 'mfa_failure',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

/**
 * Security Context
 */
export interface SecurityContext {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  timestamp: number;
}

/**
 * Risk Score
 */
export interface RiskScore {
  score: number; // 0-100, higher means higher risk
  factors: string[];
  level: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Enhanced Authentication Result
 * Includes additional security information in the authentication result
 */
export interface EnhancedAuthResult {
  success: boolean;
  user?: User;
  error?: {
    type: EnhancedAuthErrorType;
    message: string;
  };
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  provider?: AuthProvider;
  securityContext?: {
    deviceId: string;
    mfaCompleted: boolean;
    riskScore: number;
  };
}

/**
 * MFA Verification Options
 */
export interface MFAVerificationOptions {
  mfaRequired: boolean;
  deviceBinding: boolean;
  auditLogging: boolean;
}

/**
 * Token Pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
