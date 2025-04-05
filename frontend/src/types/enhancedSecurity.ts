/**
 * Enhanced Security Types
 *
 * Type definitions for the enhanced security system with enterprise-grade features.
 */

import { SecurityConfig } from './security';
import { EncryptionConfig } from './security';

/**
 * Enhanced Security Configuration
 * Extends the base SecurityConfig with enterprise-grade security features
 */
export interface EnhancedEncryptionConfig extends EncryptionConfig {
  useHardwareEncryption: boolean;
}

export interface EnhancedSecurityConfig extends Omit<SecurityConfig, 'encryption'> {
  encryption: EnhancedEncryptionConfig;
  storage: {
    tokenStorage: 'localStorage' | 'sessionStorage' | 'cookie';
    secureCookieConfig: SecureCookieOptions;
  };
}

/**
 * Secure Cookie Options
 * Configuration for secure cookies
 */
export interface SecureCookieOptions {
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
  httpOnly: boolean;
  domain?: string;
  path: string;
  maxAge: number; // in seconds
}

/**
 * Token Blacklist Entry
 * Structure for blacklisted tokens
 */
export interface TokenBlacklistEntry {
  token: string;
  expiresAt: number;
  reason: 'logout' | 'rotation' | 'security_violation' | 'user_request';
  userId: string;
  timestamp: number;
}

/**
 * Device Fingerprint
 * Structure for device fingerprinting
 */
export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  platform: string;
  screenResolution?: string;
  colorDepth?: number;
  timezone?: string;
  language?: string;
  hardware?: {
    cpuCores?: number;
    memory?: number;
    gpu?: string;
  };
  network?: {
    connectionType?: string;
    ipAddress?: string;
  };
  createdAt: number;
  lastSeen: number;
}

/**
 * Security Violation
 * Structure for security violations
 */
export interface SecurityViolation {
  type: 'token_reuse' | 'device_mismatch' | 'suspicious_location' | 'brute_force' | 'rate_limit';
  userId: string;
  deviceId?: string;
  ipAddress?: string;
  timestamp: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionTaken: 'none' | 'alert' | 'block' | 'lockout';
}
