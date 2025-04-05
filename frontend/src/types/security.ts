/**
 * Enhanced Security Types
 * 
 * Type definitions for the enhanced security framework
 */

import { AuthConfig } from './auth';

/**
 * Encryption configuration options
 */
export interface EncryptionConfig {
  algorithm: 'AES-GCM' | 'AES-CBC' | 'RSA' | 'ChaCha20';
  keySize: 128 | 192 | 256;
  useHardwareEncryption?: boolean;
  storageStrategy: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'inMemory';
  autoEncryptFields?: string[];
  ivStrategy: 'random' | 'timestamp' | 'counter';
}

/**
 * Monitoring configuration options
 */
export interface MonitoringConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'none';
  remoteLogging: boolean;
  remoteEndpoint?: string;
  logRotationDays: number;
  alertThresholds: {
    failedLogins: number;
    apiRateLimitExceeded: number;
    suspiciousActivities: number;
  };
  realTimeAlerts: boolean;
}

/**
 * Compliance rule definition
 */
export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  standard: 'GDPR' | 'HIPAA' | 'SOC2' | 'PCI-DSS' | 'CCPA' | 'ISO27001' | 'Custom';
  enforced: boolean;
  validationFn?: (data: any) => boolean;
  remediationSteps?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'data-protection' | 'access-control' | 'audit' | 'encryption' | 'authentication' | 'other';
}

/**
 * Compliance validation result
 */
export interface ComplianceValidationResult {
  compliant: boolean;
  rule: ComplianceRule;
  details?: string;
  timestamp: number;
  data?: any;
}

/**
 * Security audit result
 */
export interface AuditResult {
  timestamp: number;
  score: number;
  findings: AuditFinding[];
  summary: string;
  recommendations: string[];
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Security audit finding
 */
export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  remediation: string;
  cwe?: string; // Common Weakness Enumeration reference
  cvss?: number; // Common Vulnerability Scoring System score
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  data: string; // Base64-encoded encrypted data
  iv: string; // Initialization vector
  salt?: string; // Optional salt
  tag?: string; // Authentication tag for GCM mode
  timestamp: number;
  algorithm: string;
  keyId?: string; // Reference to the key used for encryption
}

/**
 * Two-factor authentication method
 */
export type TwoFactorMethod = 'totp' | 'sms' | 'email' | 'push' | 'recovery-code' | 'hardware-key';

/**
 * Two-factor authentication configuration
 */
export interface TwoFactorConfig {
  enabled: boolean;
  method: TwoFactorMethod;
  backupMethodEnabled: boolean;
  backupMethod?: TwoFactorMethod;
  recoveryCodesGenerated: boolean;
  recoveryCodesRemaining?: number;
  lastVerified?: number;
}

/**
 * Secure storage option for mobile
 */
export interface SecureStorageConfig {
  biometricProtection: boolean;
  encryptionEnabled: boolean;
  autoLockTimeout: number; // Seconds
  sensitiveFields: string[];
  backupEnabled: boolean;
  remoteWipeEnabled: boolean;
}

/**
 * Device verification options
 */
export interface DeviceVerificationConfig {
  verificationRequired: boolean;
  trustDuration: number; // Days
  maxDevices: number;
  notifyOnNewDevice: boolean;
  blockUnknownDevices: boolean;
}

/**
 * Complete security configuration
 */
export interface SecurityConfig {
  encryption: EncryptionConfig;
  authentication: AuthConfig;
  compliance: ComplianceRule[];
  monitoring: MonitoringConfig;
  twoFactor?: TwoFactorConfig;
  secureStorage?: SecureStorageConfig;
  deviceVerification?: DeviceVerificationConfig;
  version: string;
}

/**
 * Security test result
 */
export interface SecurityTestResult {
  passed: boolean;
  name: string;
  description: string;
  details?: string;
  timestamp: number;
  durationMs: number;
} 