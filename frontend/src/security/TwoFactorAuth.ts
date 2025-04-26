/**
 * Two-Factor Authentication Service
 * 
 * Provides comprehensive 2FA functionality including:
 * - TOTP (Time-based One-Time Password) generation and verification
 * - SMS and email verification code handling
 * - Recovery codes management
 * - Push notification verification
 * - Hardware security key support via WebAuthn
 */

import { TwoFactorConfig, TwoFactorMethod } from '../types/security';
import { AuditLogger, EventType, LogLevel } from './AuditLogger';
import { KeyVault } from './KeyVault';
import { AnalyticsEncryption } from './AnalyticsEncryption';
import { HardwareSecurityManager /*, AuthenticatorAttachment, UserVerificationRequirement */ } from './HardwareSecurityManager'; // Removed unused imports

// Third-party library for TOTP implementation (would need to be installed)
// import * as OTPAuth from 'otpauth';

export interface TOTPOptions {
  issuer: string;
  label: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: 6 | 8;
  period: 30 | 60;
}

export interface RecoveryCode {
  code: string;
  used: boolean;
  createdAt: number;
}

export interface TwoFactorSecret {
  userId: string;
  secret: string;
  method: TwoFactorMethod;
  createdAt: number;
  lastUsed?: number;
}

export class TwoFactorAuth {
  private static instance: TwoFactorAuth;
  private readonly keyVault: KeyVault;
  private readonly auditLogger: AuditLogger;
  private readonly encryption: AnalyticsEncryption;
  private readonly hardwareSecurity: HardwareSecurityManager;
  private readonly SECRET_PREFIX = '2fa_secret_';
  private readonly RECOVERY_PREFIX = '2fa_recovery_';
  private readonly DEFAULT_TOTP_OPTIONS: TOTPOptions = {
    issuer: 'EmailAssistant',
    label: 'user',
    algorithm: 'SHA1',
    digits: 6,
    period: 30
  };
  
  private constructor() {
    this.keyVault = new KeyVault();
    this.auditLogger = new AuditLogger();
    this.encryption = AnalyticsEncryption.getInstance();
    this.hardwareSecurity = HardwareSecurityManager.getInstance();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): TwoFactorAuth {
    if (!TwoFactorAuth.instance) {
      TwoFactorAuth.instance = new TwoFactorAuth();
    }
    return TwoFactorAuth.instance;
  }

  /**
   * Enable 2FA for a user
   * @param userId User identifier
   * @param method 2FA method to enable
   * @returns Configuration with secret for setup
   */
  public async enable(userId: string, method: TwoFactorMethod): Promise<{ config: TwoFactorConfig, secret?: string, qrCode?: string }> {
    // Generate appropriate secret based on method
    let secret: string | undefined;
    let qrCode: string | undefined;
    
    switch (method) {
      case 'totp':
        const result = this.generateTOTPSecret(userId);
        secret = result.secret;
        qrCode = result.qrCodeUrl;
        break;
      case 'sms':
      case 'email':
      case 'push':
        // These methods don't need pre-shared secrets
        break;
      case 'hardware-key':
        // Hardware keys are registered through a separate flow
        if (!this.hardwareSecurity.isWebAuthnAvailable()) {
          throw new Error('WebAuthn is not supported in this browser');
        }
        const isAvailable = await this.hardwareSecurity.isPlatformAuthenticatorAvailable();
        if (!isAvailable) {
          throw new Error('No authenticator is available on this device');
        }
        break;
      case 'recovery-code':
        // Recovery codes are a backup method, not a primary method
        throw new Error('Recovery codes cannot be used as a primary 2FA method');
    }
    
    // Store the secret securely
    if (secret) {
      this.storeSecret(userId, method, secret);
    }
    
    // Create initial configuration
    const config: TwoFactorConfig = {
      enabled: false, // Not fully enabled until verified
      method,
      backupMethodEnabled: false,
      recoveryCodesGenerated: false
    };
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: `2FA setup started for user ${userId} using ${method}`,
      userId
    });
    
    return { config, secret, qrCode };
  }
  
  /**
   * Register a hardware security key for 2FA
   * @param userId User identifier
   * @param userName User's email or username
   * @param displayName User's display name
   * @returns Success indicator
   */
  public async registerHardwareKey(
    userId: string, 
    userName: string, 
    displayName: string
  ): Promise<boolean> {
    if (!this.hardwareSecurity.isWebAuthnAvailable()) {
      throw new Error('WebAuthn is not supported in this browser');
    }
    
    try {
      // Register the credential
      const result = await this.hardwareSecurity.registerCredential(
        userId,
        userName,
        displayName
      );
      
      if (!result.successful) {
        throw new Error(result.error || 'Registration failed');
      }
      
      // Store method as enabled
      this.storeSecret(userId, 'hardware-key', 'hardware-key-enabled');
      
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.INFO,
        description: `Hardware security key registered for user ${userId}`,
        userId
      });
      
      return true;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.ERROR,
        description: `Hardware security key registration failed for user ${userId}: ${(error as Error).message}`,
        userId
      });
      return false;
    }
  }
  
  /**
   * Verify a 2FA code to complete setup or authenticate
   * @param userId User identifier
   * @param method 2FA method being verified
   * @param code Code entered by the user
   * @returns Whether verification was successful
   */
  public async verify(userId: string, method: TwoFactorMethod, code: string): Promise<boolean> {
    try {
      const secret = this.getSecret(userId, method);
      if (!secret) {
        this.auditLogger.log({
          type: EventType.AUTHENTICATION,
          level: LogLevel.WARNING,
          description: `2FA verification failed: No secret found for user ${userId} with method ${method}`,
          userId
        });
        return false;
      }
      
      let verified = false;
      
      switch (method) {
        case 'totp':
          verified = this.verifyTOTP(secret.secret, code);
          break;
        case 'recovery-code':
          verified = this.verifyRecoveryCode(userId, code);
          break;
        case 'hardware-key':
          // Hardware keys are verified through a separate flow
          verified = false; // Default to false here since we need a different verification method
          break;
        case 'sms':
        case 'email':
        case 'push':
          // For demo, these would call out to a verification service
          // Here we'll just simulate with a simple check
          verified = this.simulateVerification(userId, code);
          break;
      }
      
      if (verified) {
        this.auditLogger.log({
          type: EventType.AUTHENTICATION,
          level: LogLevel.INFO,
          description: `2FA verification successful for user ${userId} using ${method}`,
          userId
        });
        
        // Update last verified timestamp
        this.updateLastVerified(userId, method);
      } else {
        this.auditLogger.log({
          type: EventType.AUTHENTICATION,
          level: LogLevel.WARNING,
          description: `2FA verification failed for user ${userId} using ${method}`,
          userId
        });
      }
      
      return verified;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: `2FA verification error for user ${userId}: ${(error as Error).message}`,
        userId
      });
      return false;
    }
  }
  
  /**
   * Verify using a hardware security key
   * @param userId User identifier
   * @returns Whether verification was successful
   */
  public async verifyWithHardwareKey(userId: string): Promise<boolean> {
    if (!this.hardwareSecurity.isWebAuthnAvailable()) {
      throw new Error('WebAuthn is not supported in this browser');
    }
    
    const secret = this.getSecret(userId, 'hardware-key');
    if (!secret) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.WARNING,
        description: `Hardware key verification failed: No hardware key configured for user ${userId}`,
        userId
      });
      return false;
    }
    
    try {
      // Authenticate with the hardware key
      const result = await this.hardwareSecurity.authenticate();
      
      if (!result.successful) {
        throw new Error(result.error || 'Authentication failed');
      }
      
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.INFO,
        description: `Hardware key verification successful for user ${userId}`,
        userId
      });
      
      // Update last verified timestamp
      this.updateLastVerified(userId, 'hardware-key');
      
      return true;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: `Hardware key verification failed for user ${userId}: ${(error as Error).message}`,
        userId
      });
      return false;
    }
  }
  
  /**
   * Generate recovery codes for a user
   * @param userId User identifier
   * @param count Number of recovery codes to generate (default: 10)
   * @returns Array of recovery codes
   */
  public generateRecoveryCodes(userId: string, count = 10): string[] {
    const codes: RecoveryCode[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate a random code in format: XXXX-XXXX-XXXX (12 alphanumeric chars)
      let code = '';
      for (let j = 0; j < 3; j++) {
        const segment = this.generateRandomString(4);
        code += (j > 0 ? '-' : '') + segment;
      }
      
      codes.push({
        code,
        used: false,
        createdAt: Date.now()
      });
    }
    
    // Store the recovery codes securely
    this.storeRecoveryCodes(userId, codes);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: `Generated ${count} recovery codes for user ${userId}`,
      userId
    });
    
    // Return just the codes as strings for display to the user
    return codes.map(c => c.code);
  }
  
  /**
   * Disable 2FA for a user
   * @param userId User identifier
   */
  public disable(userId: string): void {
    // Remove all 2FA secrets for this user
    this.removeSecret(userId, 'totp');
    this.removeSecret(userId, 'sms');
    this.removeSecret(userId, 'email');
    this.removeSecret(userId, 'push');
    
    // Remove recovery codes
    this.removeRecoveryCodes(userId);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: `2FA disabled for user ${userId}`,
      userId
    });
  }
  
  /**
   * Check if a user has 2FA enabled
   * @param userId User identifier
   * @returns Whether any 2FA method is enabled
   */
  public isEnabled(userId: string): boolean {
    return !!this.getSecret(userId, 'totp') || 
           !!this.getSecret(userId, 'sms') || 
           !!this.getSecret(userId, 'email') || 
           !!this.getSecret(userId, 'push');
  }
  
  /**
   * Get the current 2FA configuration for a user
   * @param userId User identifier
   * @returns Current 2FA configuration or null if not enabled
   */
  public getConfiguration(userId: string): TwoFactorConfig | null {
    // Check which methods are enabled
    const totpEnabled = !!this.getSecret(userId, 'totp');
    const smsEnabled = !!this.getSecret(userId, 'sms');
    const emailEnabled = !!this.getSecret(userId, 'email');
    const pushEnabled = !!this.getSecret(userId, 'push');
    
    if (!totpEnabled && !smsEnabled && !emailEnabled && !pushEnabled) {
      return null;
    }
    
    // Determine primary method (prioritizing TOTP)
    let primaryMethod: TwoFactorMethod = 'totp';
    if (!totpEnabled) {
      if (smsEnabled) primaryMethod = 'sms';
      else if (emailEnabled) primaryMethod = 'email';
      else if (pushEnabled) primaryMethod = 'push';
    }
    
    // Check if recovery codes are available
    const recoveryCodes = this.getRecoveryCodes(userId);
    const recoveryCodesGenerated = recoveryCodes.length > 0;
    const recoveryCodesRemaining = recoveryCodes.filter(c => !c.used).length;
    
    // Determine backup method
    let backupMethod: TwoFactorMethod | undefined;
    let backupMethodEnabled = false;
    
    if (primaryMethod !== 'totp' && totpEnabled) {
      backupMethod = 'totp';
      backupMethodEnabled = true;
    } else if (primaryMethod !== 'sms' && smsEnabled) {
      backupMethod = 'sms';
      backupMethodEnabled = true;
    } else if (primaryMethod !== 'email' && emailEnabled) {
      backupMethod = 'email';
      backupMethodEnabled = true;
    } else if (primaryMethod !== 'push' && pushEnabled) {
      backupMethod = 'push';
      backupMethodEnabled = true;
    }
    
    // Get last verification timestamp
    const secret = this.getSecret(userId, primaryMethod);
    const lastVerified = secret?.lastUsed;
    
    return {
      enabled: true,
      method: primaryMethod,
      backupMethodEnabled,
      backupMethod,
      recoveryCodesGenerated,
      recoveryCodesRemaining,
      lastVerified
    };
  }
  
  /**
   * Generate a TOTP secret and QR code URL
   */
  private generateTOTPSecret(userId: string, options?: Partial<TOTPOptions>): { 
    secret: string; 
    qrCodeUrl: string 
  } {
    // Merge default options with any provided options
    const opts = { ...this.DEFAULT_TOTP_OPTIONS, ...options };
    
    // Generate a random secret (base32 encoded)
    const secret = this.generateBase32Secret(20);
    
    // In a real implementation, we'd use OTPAuth to generate proper TOTP
    // For now, we'll return a placeholder URL that a QR code generator could use
    const encodedLabel = encodeURIComponent(`${opts.issuer}:${userId}`);
    const encodedIssuer = encodeURIComponent(opts.issuer);
    const qrCodeUrl = `otpauth://totp/${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${opts.algorithm}&digits=${opts.digits}&period=${opts.period}`;
    
    return { secret, qrCodeUrl };
  }
  
  /**
   * Verify a TOTP code
   */
  private verifyTOTP(secret: string, code: string): boolean {
    // In a real implementation, we'd use OTPAuth to verify the TOTP code
    // For this demo, we'll simulate verification with a simple check
    // Since we can't generate real TOTP codes here
    return code.length === 6 && /^\d+$/.test(code);
  }
  
  /**
   * Verify a recovery code
   */
  private verifyRecoveryCode(userId: string, code: string): boolean {
    const codes = this.getRecoveryCodes(userId);
    const matchingCode = codes.find(c => c.code === code && !c.used);
    
    if (matchingCode) {
      // Mark the code as used
      matchingCode.used = true;
      this.storeRecoveryCodes(userId, codes);
      return true;
    }
    
    return false;
  }
  
  /**
   * Store a 2FA secret securely
   */
  private storeSecret(userId: string, method: TwoFactorMethod, secret: string): void {
    const secretObj: TwoFactorSecret = {
      userId,
      secret,
      method,
      createdAt: Date.now()
    };
    
    const encryptedSecret = this.encryption.encrypt(secretObj);
    this.keyVault.storeKey(`${this.SECRET_PREFIX}${userId}_${method}`, JSON.stringify(encryptedSecret));
  }
  
  /**
   * Get a stored 2FA secret
   */
  private getSecret(userId: string, method: TwoFactorMethod): TwoFactorSecret | null {
    const encryptedSecretJson = this.keyVault.getKey(`${this.SECRET_PREFIX}${userId}_${method}`);
    
    if (!encryptedSecretJson) {
      return null;
    }
    
    try {
      const encryptedSecret = JSON.parse(encryptedSecretJson);
      return this.encryption.decrypt(encryptedSecret);
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Failed to decrypt 2FA secret for user ${userId}: ${(error as Error).message}`,
        userId
      });
      return null;
    }
  }
  
  /**
   * Remove a 2FA secret
   */
  private removeSecret(userId: string, method: TwoFactorMethod): void {
    this.keyVault.deleteKey(`${this.SECRET_PREFIX}${userId}_${method}`);
  }
  
  /**
   * Update the last verified timestamp for a secret
   */
  private updateLastVerified(userId: string, method: TwoFactorMethod): void {
    const secret = this.getSecret(userId, method);
    
    if (secret) {
      secret.lastUsed = Date.now();
      this.storeSecret(userId, method, secret.secret);
    }
  }
  
  /**
   * Store recovery codes securely
   */
  private storeRecoveryCodes(userId: string, codes: RecoveryCode[]): void {
    const encryptedCodes = this.encryption.encrypt(codes);
    this.keyVault.storeKey(`${this.RECOVERY_PREFIX}${userId}`, JSON.stringify(encryptedCodes));
  }
  
  /**
   * Get stored recovery codes
   */
  private getRecoveryCodes(userId: string): RecoveryCode[] {
    const encryptedCodesJson = this.keyVault.getKey(`${this.RECOVERY_PREFIX}${userId}`);
    
    if (!encryptedCodesJson) {
      return [];
    }
    
    try {
      const encryptedCodes = JSON.parse(encryptedCodesJson);
      return this.encryption.decrypt(encryptedCodes);
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Failed to decrypt recovery codes for user ${userId}: ${(error as Error).message}`,
        userId
      });
      return [];
    }
  }
  
  /**
   * Remove stored recovery codes
   */
  private removeRecoveryCodes(userId: string): void {
    this.keyVault.deleteKey(`${this.RECOVERY_PREFIX}${userId}`);
  }
  
  /**
   * Simulate verification for SMS/email/push methods
   * In a real implementation, this would call an actual verification service
   */
  private simulateVerification(userId: string, code: string): boolean {
    // For demonstration purposes only
    // A real implementation would verify against a previously sent code
    return code.length === 6 && /^\d+$/.test(code);
  }
  
  /**
   * Generate a random string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
  
  /**
   * Generate a base32 encoded secret
   */
  private generateBase32Secret(length: number): string {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += base32Chars.charAt(Math.floor(Math.random() * base32Chars.length));
    }
    
    return result;
  }
}

// Export a singleton instance
export const twoFactorAuth = TwoFactorAuth.getInstance(); 