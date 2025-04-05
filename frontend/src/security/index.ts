/**
 * Security Module Index
 * 
 * This file exports all security-related components from a single location
 * for easy importing throughout the application.
 */

import { SecurityManager } from './SecurityManager';
import { AnalyticsEncryption } from './AnalyticsEncryption';
import { AccessControl } from './AccessControl';
import { AuditLogger } from './AuditLogger';
import { TwoFactorAuth } from './TwoFactorAuth';
import { MobileSecurity } from './MobileSecurity';
import { ComplianceManager } from './ComplianceManager';
import { SecurityTesting } from './SecurityTesting';
import { HardwareSecurityManager } from './HardwareSecurityManager';
import { SecurityHeadersConfig } from './SecurityHeadersConfig';
import { ApiSecurityManager } from './ApiSecurityManager';
import { ZeroKnowledgeEncryption } from './ZeroKnowledgeEncryption';
import { EncryptedStorage } from './EncryptedStorage';
import { IntegrityVerifier } from './IntegrityVerifier';

export { KeyVault } from './KeyVault';
export { RateLimiter, type RateLimiterOptions } from './RateLimiter';
export { 
  AuditLogger, 
  LogLevel, 
  EventType, 
  type AuditLogEvent, 
  type AuditLoggerOptions 
} from './AuditLogger';
export { 
  SecurityManager, 
  type Request 
} from './SecurityManager';

// Export analytics security components
export {
  AnalyticsEncryption,
  type EncryptedData
} from './AnalyticsEncryption';

export {
  AccessControl,
  Permission,
  Resource,
  Role,
  type AccessControlEntry
} from './AccessControl';

// Export content security policy utilities
export { 
  DEFAULT_CSP_DIRECTIVES,
  PWA_CSP_DIRECTIVES,
  buildCSPString,
  mergeCSPDirectives,
  getPWAContentSecurityPolicy,
  applyCSP,
  generateCSPNonce,
  type CSPDirective
} from './csp';

// Export new security components
export {
  TwoFactorAuth,
  type TOTPOptions,
  type RecoveryCode,
  type TwoFactorSecret
} from './TwoFactorAuth';

export {
  MobileSecurity,
  type DeviceInfo,
  type BiometricAuthResult
} from './MobileSecurity';

export {
  ComplianceManager
} from './ComplianceManager';

export {
  SecurityTesting
} from './SecurityTesting';

// Export integrity verification components
export {
  IntegrityVerifier,
  IntegrityIssueType,
  IntegritySeverity,
  type IntegrityCheckResult,
  type IntegrityIssue,
  type ScriptIntegrityCheck,
  type ConfigIntegrityCheck,
  type IntegrityVerifierOptions
} from './IntegrityVerifier';

// Export hardware security components
export {
  HardwareSecurityManager,
  AuthenticatorAttachment,
  UserVerificationRequirement,
  AuthenticatorTransport,
  hardwareSecurityManager
} from './HardwareSecurityManager';
export type { 
  WebAuthnCredential,
  WebAuthnUser,
  RegistrationOptions,
  AuthenticationOptions,
  RegistrationResult,
  AuthenticationResult
} from './HardwareSecurityManager';

// Export security headers configuration
export {
  SecurityHeadersConfig,
  type SecurityHeaders,
  type SecurityHeadersOptions
} from './SecurityHeadersConfig';

// Export API security components
export {
  ApiSecurityManager,
  GrantType,
  TokenType,
  type TokenResponse,
  type JwtPayload,
  type ApiKeyConfig,
  type ApiSecurityConfig
} from './ApiSecurityManager';

// Export zero-knowledge encryption components
export {
  ZeroKnowledgeEncryption,
  type EncryptionKey,
  type EncryptedEnvelope
} from './ZeroKnowledgeEncryption';

export {
  EncryptedStorage,
  StorageCategory,
  type StorageItem,
  type EncryptedStorageItem
} from './EncryptedStorage';

// Export file security components
export {
  SecureFileManager,
  secureFileManager,
  MIME_TYPES,
  SUSPICIOUS_EXTENSIONS
} from './SecureFileManager';
export type { FileValidationOptions, FileValidationResult, EncryptedFile } from './SecureFileManager';

// Create singleton instances
export const securityManager = SecurityManager.getInstance();
export const analyticsEncryption = AnalyticsEncryption.getInstance();
export const accessControl = AccessControl.getInstance();
export const twoFactorAuth = TwoFactorAuth.getInstance();
export const mobileSecurity = MobileSecurity.getInstance();
export const complianceManager = ComplianceManager.getInstance();
export const securityTesting = SecurityTesting.getInstance();
export const hardwareSecurity = HardwareSecurityManager.getInstance();
export const securityHeadersConfig = SecurityHeadersConfig.getInstance();
export const apiSecurityManager = ApiSecurityManager.getInstance();
export const zeroKnowledgeEncryption = ZeroKnowledgeEncryption.getInstance();
export const encryptedStorage = EncryptedStorage.getInstance();
export const integrityVerifier = IntegrityVerifier.getInstance();

// Create a new instance of AuditLogger
const auditLoggerOptions = {
  enableConsoleLogging: true,
  enableRemoteLogging: false,
  maxLocalStorageEntries: 1000
};
export const auditLogger = new AuditLogger(auditLoggerOptions); 