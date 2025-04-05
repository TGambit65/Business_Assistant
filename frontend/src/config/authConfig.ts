/**
 * Authentication Configuration
 *
 * Configuration for the enhanced authentication system.
 */

import { EnhancedAuthConfig } from '../types/enhancedAuth';
import { EnhancedSecurityConfig, SecureCookieOptions } from '../types/enhancedSecurity';
import { getEnvVariable } from '../utils/envUtils';

/**
 * Default enhanced authentication configuration
 */
export const DEFAULT_ENHANCED_AUTH_CONFIG: EnhancedAuthConfig = {
  googleClientId: getEnvVariable('REACT_APP_GOOGLE_CLIENT_ID') || undefined,
  microsoftClientId: getEnvVariable('REACT_APP_MICROSOFT_CLIENT_ID') || undefined,
  githubClientId: getEnvVariable('REACT_APP_GITHUB_CLIENT_ID') || undefined,
  apiUrl: getEnvVariable('REACT_APP_API_URL') || undefined,
  authStorageKey: 'auth_session',
  tokenRefreshThreshold: 300, // 5 minutes before expiry
  maxRetryAttempts: 3,
  autoRefreshToken: true,
  maxConcurrentSessions: 3,
  mfaRequired: true,
  passwordPolicyConfig: {
    minLength: 12,
    requireSpecialChars: true,
    requireNumbers: true,
    preventReuse: 5
  }
};

/**
 * Production enhanced authentication configuration
 */
export const PRODUCTION_ENHANCED_AUTH_CONFIG: EnhancedAuthConfig = {
  ...DEFAULT_ENHANCED_AUTH_CONFIG,
  tokenRefreshThreshold: 180, // 3 minutes before expiry
  maxConcurrentSessions: 2,
  mfaRequired: true,
  passwordPolicyConfig: {
    minLength: 16,
    requireSpecialChars: true,
    requireNumbers: true,
    preventReuse: 10
  }
};

/**
 * Development enhanced authentication configuration
 */
export const DEVELOPMENT_ENHANCED_AUTH_CONFIG: EnhancedAuthConfig = {
  ...DEFAULT_ENHANCED_AUTH_CONFIG,
  tokenRefreshThreshold: 600, // 10 minutes before expiry
  maxConcurrentSessions: 5,
  mfaRequired: false,
  passwordPolicyConfig: {
    minLength: 8,
    requireSpecialChars: false,
    requireNumbers: true,
    preventReuse: 3
  }
};

/**
 * Default secure cookie options
 */
export const DEFAULT_SECURE_COOKIE_OPTIONS: SecureCookieOptions = {
  sameSite: 'strict',
  secure: true,
  httpOnly: true,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
};

/**
 * Default enhanced security configuration
 */
export const DEFAULT_ENHANCED_SECURITY_CONFIG: EnhancedSecurityConfig = {
  encryption: {
    algorithm: 'AES-GCM',
    keySize: 256,
    useHardwareEncryption: false,
    storageStrategy: 'localStorage',
    autoEncryptFields: ['password', 'creditCard', 'ssn', 'apiKey'],
    ivStrategy: 'random'
  } as any,
  storage: {
    tokenStorage: 'localStorage',
    secureCookieConfig: DEFAULT_SECURE_COOKIE_OPTIONS
  },
  authentication: DEFAULT_ENHANCED_AUTH_CONFIG,
  compliance: [],
  monitoring: {
    logLevel: 'info',
    remoteLogging: false,
    logRotationDays: 30,
    alertThresholds: {
      failedLogins: 5,
      apiRateLimitExceeded: 10,
      suspiciousActivities: 3
    },
    realTimeAlerts: true
  },
  deviceVerification: {
    verificationRequired: true,
    trustDuration: 30, // 30 days
    maxDevices: 5,
    notifyOnNewDevice: true,
    blockUnknownDevices: false
  },
  version: '1.0.0'
};

/**
 * Get the appropriate authentication configuration based on environment
 */
export function getAuthConfig(): EnhancedAuthConfig {
  const environment = process.env.NODE_ENV;

  switch (environment) {
    case 'production':
      return PRODUCTION_ENHANCED_AUTH_CONFIG;
    case 'development':
      return DEVELOPMENT_ENHANCED_AUTH_CONFIG;
    default:
      return DEFAULT_ENHANCED_AUTH_CONFIG;
  }
}

/**
 * Get the appropriate security configuration based on environment
 */
export function getSecurityConfig(): EnhancedSecurityConfig {
  const environment = process.env.NODE_ENV;

  switch (environment) {
    case 'production':
      return {
        ...DEFAULT_ENHANCED_SECURITY_CONFIG,
        authentication: PRODUCTION_ENHANCED_AUTH_CONFIG,
        storage: {
          tokenStorage: 'cookie',
          secureCookieConfig: {
            ...DEFAULT_SECURE_COOKIE_OPTIONS,
            maxAge: 1 * 24 * 60 * 60 // 1 day in seconds
          }
        }
      };
    case 'development':
      return {
        ...DEFAULT_ENHANCED_SECURITY_CONFIG,
        authentication: DEVELOPMENT_ENHANCED_AUTH_CONFIG,
        storage: {
          tokenStorage: 'localStorage',
          secureCookieConfig: DEFAULT_SECURE_COOKIE_OPTIONS
        }
      };
    default:
      return DEFAULT_ENHANCED_SECURITY_CONFIG;
  }
}
