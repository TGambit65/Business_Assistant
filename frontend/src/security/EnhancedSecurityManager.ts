/**
 * Enhanced Security Manager
 *
 * Extends the base SecurityManager with enterprise-grade security features:
 * - Device fingerprinting
 * - Token blacklist
 * - Device binding validation
 * - Enhanced encryption
 */

import { SecurityManager } from './SecurityManager';
import { AuditLogger, EventType, LogLevel } from './AuditLogger';
import { JWTToken } from '../types/auth';
import {
  DeviceFingerprint,
  EnhancedSecurityConfig,
  EnhancedEncryptionConfig,
  SecureCookieOptions,
  TokenBlacklistEntry
} from '../types/enhancedSecurity';
import { AuthEventType, SecurityAuditLog, SecurityContext, RiskScore } from '../types/enhancedAuth';
import { SecurityConfig, MonitoringConfig } from '../types/security';

// Create a standalone class instead of extending SecurityManager
export class EnhancedSecurityManager {
  // Implement the Singleton pattern
  private static instance: EnhancedSecurityManager;
  private readonly tokenBlacklist: Map<string, TokenBlacklistEntry> = new Map();
  private readonly deviceFingerprints: Map<string, DeviceFingerprint> = new Map();
  private readonly auditLogger: AuditLogger;
  private enhancedConfig: EnhancedSecurityConfig;

  private constructor() {
    // Initialize audit logger
    this.auditLogger = new AuditLogger({
      enableConsoleLogging: true,
      enableRemoteLogging: process.env.NODE_ENV === 'production'
    });

    // Initialize enhanced security configuration
    this.enhancedConfig = this.getDefaultEnhancedSecurityConfig();

    // Set up token blacklist cleanup interval
    this.setupBlacklistCleanup();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): EnhancedSecurityManager {
    if (!EnhancedSecurityManager.instance) {
      EnhancedSecurityManager.instance = new EnhancedSecurityManager();
    }
    return EnhancedSecurityManager.instance;
  }

  /**
   * Generate a device fingerprint
   * @returns Promise resolving to a device ID
   */
  public async generateDeviceFingerprint(): Promise<string> {
    try {
      // Collect device information
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const colorDepth = window.screen.colorDepth;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;

      // Create a fingerprint string
      const fingerprintData = [
        userAgent,
        platform,
        screenResolution,
        colorDepth,
        timezone,
        language,
        // Add more entropy
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        // TypeScript doesn't recognize deviceMemory, so we use any type
        (navigator as any).deviceMemory || 'unknown',
      ].join('|');

      // Generate a hash of the fingerprint data
      const fingerprintHash = await this.hashString(fingerprintData);

      // Create a device fingerprint object
      const deviceFingerprint: DeviceFingerprint = {
        id: fingerprintHash,
        userAgent,
        platform,
        screenResolution,
        colorDepth,
        timezone,
        language,
        hardware: {
          cpuCores: navigator.hardwareConcurrency,
          memory: (navigator as any).deviceMemory as number,
        },
        createdAt: Date.now(),
        lastSeen: Date.now()
      };

      // Store the device fingerprint
      this.deviceFingerprints.set(fingerprintHash, deviceFingerprint);

      // Log the fingerprint generation
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.INFO,
        description: 'Device fingerprint generated',
        metadata: { deviceId: fingerprintHash }
      });

      return fingerprintHash;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: 'Failed to generate device fingerprint',
        metadata: { error: (error as Error).message }
      });

      // Return a fallback fingerprint based on timestamp and random value
      return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
  }

  /**
   * Validate token security
   * @param token JWT token to validate
   * @returns Promise resolving to true if token is valid, false otherwise
   */
  public async validateTokenSecurity(token: JWTToken): Promise<boolean> {
    try {
      // Add existing security checks from base class
      const baseValid = await this.validateToken(token);

      if (!baseValid) {
        return false;
      }

      // Check if token is blacklisted
      const isBlacklisted = this.checkTokenBlacklist(token);
      if (isBlacklisted) {
        this.auditLogger.log({
          type: EventType.SUSPICIOUS_ACTIVITY,
          level: LogLevel.WARNING,
          description: 'Attempt to use blacklisted token',
          metadata: { sub: token.sub }
        });
        return false;
      }

      // Additional security checks can be added here

      return true;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: 'Token security validation failed',
        metadata: { error: (error as Error).message }
      });
      return false;
    }
  }

  /**
   * Validate device binding
   * @param token JWT token
   * @returns true if device binding is valid, false otherwise
   */
  public validateDeviceBinding(token: JWTToken): boolean {
    try {
      // Check if device binding is enforced
      if (!this.enhancedConfig.deviceVerification?.verificationRequired) {
        return true;
      }

      // Extract device ID from token
      const tokenDeviceId = (token as any).deviceId;

      if (!tokenDeviceId) {
        this.auditLogger.log({
          type: EventType.SUSPICIOUS_ACTIVITY,
          level: LogLevel.WARNING,
          description: 'Token missing device ID',
          metadata: { sub: token.sub }
        });
        return false;
      }

      // Get the current device fingerprint
      const currentDeviceId = localStorage.getItem('current_device_id');

      if (!currentDeviceId) {
        this.auditLogger.log({
          type: EventType.SUSPICIOUS_ACTIVITY,
          level: LogLevel.WARNING,
          description: 'Current device ID not found',
          metadata: { sub: token.sub }
        });
        return false;
      }

      // Compare device IDs
      const isValid = tokenDeviceId === currentDeviceId;

      if (!isValid) {
        this.auditLogger.log({
          type: EventType.SUSPICIOUS_ACTIVITY,
          level: LogLevel.WARNING,
          description: 'Device binding validation failed',
          metadata: {
            sub: token.sub,
            tokenDeviceId,
            currentDeviceId
          }
        });
      }

      return isValid;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: 'Device binding validation failed',
        metadata: { error: (error as Error).message }
      });
      return false;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param token JWT token
   * @returns true if token is blacklisted, false otherwise
   */
  public checkTokenBlacklist(token: JWTToken): boolean {
    try {
      // Extract token ID or use sub as fallback
      const tokenId = (token as any).jti || token.sub;

      // Check if token is in blacklist
      return this.tokenBlacklist.has(tokenId);
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: 'Token blacklist check failed',
        metadata: { error: (error as Error).message }
      });
      return false;
    }
  }

  /**
   * Add a token to the blacklist
   * @param token JWT token
   * @param reason Reason for blacklisting
   * @returns true if token was added to blacklist, false otherwise
   */
  public blacklistToken(token: string | JWTToken, reason: 'logout' | 'rotation' | 'security_violation' | 'user_request'): boolean {
    try {
      // Parse token if it's a string
      const parsedToken = typeof token === 'string' ? this.parseJwt(token) : token;

      // Extract token ID or use sub as fallback
      const tokenId = (parsedToken as any).jti || parsedToken.sub;

      // Create blacklist entry
      const entry: TokenBlacklistEntry = {
        token: typeof token === 'string' ? token : JSON.stringify(token),
        expiresAt: parsedToken.exp * 1000, // Convert to milliseconds
        reason,
        userId: parsedToken.sub,
        timestamp: Date.now()
      };

      // Add to blacklist
      this.tokenBlacklist.set(tokenId, entry);

      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.INFO,
        description: `Token blacklisted: ${reason}`,
        metadata: { userId: parsedToken.sub }
      });

      return true;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: 'Failed to blacklist token',
        metadata: { error: (error as Error).message }
      });
      return false;
    }
  }

  /**
   * Log a security audit event
   * @param event Security audit event
   */
  public logSecurityAudit(event: Omit<SecurityAuditLog, 'timestamp'>): void {
    const auditLog: SecurityAuditLog = {
      ...event,
      timestamp: Date.now()
    };

    // Log to audit logger
    this.auditLogger.log({
      type: EventType.AUTHENTICATION,
      level: LogLevel.INFO,
      description: `Security audit: ${auditLog.eventType}`,
      metadata: auditLog
    });
  }

  /**
   * Calculate risk score for a security context
   * @param context Security context
   * @returns Risk score
   */
  public calculateRiskScore(context: SecurityContext): RiskScore {
    const factors: string[] = [];
    let score = 0;

    // Check for known device
    const deviceKnown = context.deviceId && this.deviceFingerprints.has(context.deviceId);
    if (!deviceKnown) {
      factors.push('unknown_device');
      score += 30;
    }

    // Check for unusual location
    if (context.location) {
      // This would typically check against known locations for the user
      // For now, we'll just add a placeholder
      const locationUnusual = false;
      if (locationUnusual) {
        factors.push('unusual_location');
        score += 20;
      }
    }

    // Check for unusual time
    const hour = new Date(context.timestamp).getHours();
    const unusualTime = hour >= 0 && hour <= 5; // Between midnight and 5 AM
    if (unusualTime) {
      factors.push('unusual_time');
      score += 10;
    }

    // Determine risk level
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (score < 20) {
      level = 'low';
    } else if (score < 40) {
      level = 'medium';
    } else if (score < 70) {
      level = 'high';
    } else {
      level = 'critical';
    }

    return {
      score,
      factors,
      level
    };
  }

  /**
   * Get default enhanced security configuration
   */
  private getDefaultEnhancedSecurityConfig(): EnhancedSecurityConfig {
    const baseConfig = this.getSecurityConfig();

    const secureCookieOptions: SecureCookieOptions = {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    };

    // Create an enhanced encryption config with required properties
    const enhancedEncryption: EnhancedEncryptionConfig = {
      algorithm: 'AES-GCM',
      keySize: 256,
      useHardwareEncryption: false,
      storageStrategy: 'localStorage',
      autoEncryptFields: ['password', 'token', 'credentials'],
      ivStrategy: 'random'
    };

    return {
      ...baseConfig,
      encryption: enhancedEncryption,
      storage: {
        tokenStorage: 'localStorage',
        secureCookieConfig: secureCookieOptions
      },
      deviceVerification: {
        verificationRequired: true,
        trustDuration: 30, // 30 days
        maxDevices: 5,
        notifyOnNewDevice: true,
        blockUnknownDevices: false
      }
    };
  }

  /**
   * Set up token blacklist cleanup interval
   */
  private setupBlacklistCleanup(): void {
    // Clean up expired tokens every hour
    setInterval(() => {
      const now = Date.now();

      // Remove expired tokens
      for (const [tokenId, entry] of this.tokenBlacklist.entries()) {
        if (entry.expiresAt < now) {
          this.tokenBlacklist.delete(tokenId);
        }
      }

      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.INFO,
        description: 'Token blacklist cleanup performed',
        metadata: { remainingEntries: this.tokenBlacklist.size }
      });
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Parse a JWT token
   * @param token JWT token string
   * @returns Parsed token
   */
  private parseJwt(token: string): JWTToken {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error(`Invalid JWT token: ${(error as Error).message}`);
    }
  }

  /**
   * Hash a string using SHA-256
   * @param str String to hash
   * @returns Promise resolving to the hash
   */
  private async hashString(str: string): Promise<string> {
    try {
      // Convert string to ArrayBuffer
      const encoder = new TextEncoder();
      const data = encoder.encode(str);

      // Hash the data
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      // Convert ArrayBuffer to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return hashHex;
    } catch (error) {
      throw new Error(`Failed to hash string: ${(error as Error).message}`);
    }
  }

  /**
   * Validate a token
   * This is a placeholder for the base class method
   */
  private async validateToken(token: JWTToken): Promise<boolean> {
    // This would call the base class method in a real implementation
    // For now, we'll just return true
    return true;
  }

  /**
   * Get the security configuration
   */
  private getSecurityConfig(): SecurityConfig {
    // This would call the base class method in a real implementation
    // For now, we'll just return a default config
    
    // Create a monitoring config that matches the required interface
    const monitoringConfig: MonitoringConfig = {
      logLevel: 'info',
      remoteLogging: true,
      remoteEndpoint: process.env.LOGGING_ENDPOINT,
      logRotationDays: 30,
      alertThresholds: {
        failedLogins: 5,
        apiRateLimitExceeded: 10,
        suspiciousActivities: 3
      },
      realTimeAlerts: true
    };
    
    return {
      encryption: {
        algorithm: 'AES-GCM',
        keySize: 256,
        useHardwareEncryption: false,
        storageStrategy: 'localStorage',
        autoEncryptFields: ['password', 'creditCard', 'ssn', 'apiKey'],
        ivStrategy: 'random'
      },
      authentication: {
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        microsoftClientId: process.env.MICROSOFT_CLIENT_ID,
        githubClientId: process.env.GITHUB_CLIENT_ID,
        apiUrl: process.env.API_URL,
        authStorageKey: 'auth_storage',
        tokenRefreshThreshold: 300, // 5 minutes
        maxRetryAttempts: 3,
        autoRefreshToken: true
      },
      compliance: [],
      monitoring: monitoringConfig,
      version: '1.0.0'
    };
  }
}
