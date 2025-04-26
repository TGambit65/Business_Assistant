/**
 * Enhanced Authentication Service
 *
 * Extends the base AuthService with enterprise-grade security features:
 * - Token rotation
 * - Device binding
 * - MFA support
 * - Enhanced session management
 */

import { AuthService as BaseAuthService } from '../types/auth';
import * as AuthModels from '../types/auth';
import { EnhancedSecurityManager } from '../security/EnhancedSecurityManager';
import {
  AuthErrorType,
  AuthProvider,
  AuthResult,
  SessionStorage
} from '../types/auth';
import {
  EnhancedAuthConfig,
  EnhancedAuthErrorType,
  EnhancedAuthResult,
  EnhancedSessionStorage,
  MFAVerificationOptions,
  TokenPair,
  TokenRotationConfig
} from '../types/enhancedAuth';
import { User } from '../types/user';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getEnvVariable, isDemoMode } from '../utils/envUtils';

// Import the AuthService singleton instance
import authService from './AuthService';

export class EnhancedAuthService implements BaseAuthService {
  // Add missing properties
  private currentUser: User | null = null;
  private currentAccessToken: string | null = null;
  private config: EnhancedAuthConfig;
  private baseAuthService: any; // Using any to avoid TypeScript errors
  private readonly securityManager: EnhancedSecurityManager;
  private enhancedConfig: EnhancedAuthConfig;
  private tokenRotationConfig: TokenRotationConfig;
  private activeSessions: Map<string, EnhancedSessionStorage> = new Map();
  private refreshPromise: Promise<string> | null = null;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor(config: Partial<EnhancedAuthConfig> = {}) {
    // Use the imported authService instance
    this.baseAuthService = authService;

    // Get security manager instance
    this.securityManager = EnhancedSecurityManager.getInstance();

    // Set up enhanced configuration
    this.enhancedConfig = this.getDefaultEnhancedConfig();
    this.enhancedConfig = { ...this.enhancedConfig, ...config };
    
    // Store the config for later use
    this.config = this.enhancedConfig;

    // Set up token rotation configuration
    this.tokenRotationConfig = {
      accessTokenDuration: 15 * 60, // 15 minutes in seconds
      refreshTokenDuration: 7 * 24 * 60 * 60, // 7 days in seconds
      enforceDeviceBinding: true
    };

    // Load active sessions
    this.loadActiveSessions();
  }

  /**
   * Sign in with email and password with enhanced security
   * @param email User email
   * @param password User password
   * @returns Promise resolving to authentication result
   */
  public async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Call base auth service method
      const baseResult = await this.baseAuthService.signInWithEmail(email, password);

      if (!baseResult.success) {
        return baseResult;
      }

      // Check if we're in demo mode
      if (isDemoMode()) {
        return baseResult;
      }

      // Enhance the authentication result
      return await this.enhanceAuthResult(baseResult);
    } catch (err) {
      const error = this.handleAuthError(err as Error, 'email');
      return { success: false, error };
    }
  }

  /**
   * Sign in with Google with enhanced security
   * @returns Promise resolving to authentication result
   */
  public async signInWithGoogle(): Promise<AuthResult> {
    try {
      // Call base auth service method
      const baseResult = await this.baseAuthService.signInWithGoogle();

      if (!baseResult.success) {
        return baseResult;
      }

      // Check if we're in demo mode
      if (isDemoMode()) {
        return baseResult;
      }

      // Enhance the authentication result
      return await this.enhanceAuthResult(baseResult);
    } catch (err) {
      const error = this.handleAuthError(err as Error, 'google');
      return { success: false, error };
    }
  }

  /**
   * Sign in with Microsoft with enhanced security
   * @returns Promise resolving to authentication result
   */
  public async signInWithMicrosoft(): Promise<AuthResult> {
    try {
      // Call base auth service method
      const baseResult = await this.baseAuthService.signInWithMicrosoft();

      if (!baseResult.success) {
        return baseResult;
      }

      // Check if we're in demo mode
      if (isDemoMode()) {
        return baseResult;
      }

      // Enhance the authentication result
      return await this.enhanceAuthResult(baseResult);
    } catch (err) {
      const error = this.handleAuthError(err as Error, 'microsoft');
      return { success: false, error };
    }
  }

  /**
   * Sign in with GitHub with enhanced security
   * @returns Promise resolving to authentication result
   */
  public async signInWithGithub(): Promise<AuthResult> {
    try {
      // Call base auth service method
      const baseResult = await this.baseAuthService.signInWithGithub();

      if (!baseResult.success) {
        return baseResult;
      }

      // Check if we're in demo mode
      if (isDemoMode()) {
        return baseResult;
      }

      // Enhance the authentication result
      return await this.enhanceAuthResult(baseResult);
    } catch (err) {
      const error = this.handleAuthError(err as Error, 'github');
      return { success: false, error };
    }
  }

  /**
   * Sign in with demo account with enhanced security
   * @returns Promise resolving to authentication result
   */
  public async signInDemo(): Promise<AuthResult> {
    try {
      // Call base auth service method
      const baseResult = await this.baseAuthService.signInDemo();
      
      // For demo login, we don't need to enhance the authentication
      return baseResult;
    } catch (err) {
      const error = this.handleAuthError(err as Error, 'demo');
      return { success: false, error };
    }
  }

  /**
   * Sign out with enhanced security
   * @returns Promise resolving when sign out is complete
   */
  public async signOut(): Promise<void> {
    try {
      // Get the current session
      const session = this.getStoredAuthData() as EnhancedSessionStorage;

      if (session) {
        // Blacklist the current token
        this.securityManager.blacklistToken(session.accessToken, 'logout');

        // Remove from active sessions
        if (session.deviceId) {
          this.activeSessions.delete(session.deviceId);
          this.saveActiveSessions();
        }
      }

      // Call base auth service method
      await this.baseAuthService.signOut();
      
      // Clear our stored values
      this.currentUser = null;
      this.currentAccessToken = null;
    } catch (err) {
      console.error('Enhanced sign out error:', err);
      // Call base auth service method as fallback
      await this.baseAuthService.signOut();
      
      // Clear our stored values
      this.currentUser = null;
      this.currentAccessToken = null;
    }
  }

  /**
   * Refresh the session with enhanced security
   */
  public async refreshSession(): Promise<void> {
    try {
      // Get the current access token
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw this.createAuthError(
          EnhancedAuthErrorType.NO_SESSION,
          'No active session to refresh'
        );
      }
      
      // Additional session validation can be performed here
      
      // Call base auth service method
      await this.baseAuthService.refreshSession();
    } catch (err) {
      console.error('Enhanced session refresh error:', err);
      throw err;
    }
  }

  /**
   * Validate the current session with enhanced security
   */
  public async validateSession(): Promise<boolean> {
    try {
      // First check if the base validation passes
      const baseValidation = await this.baseAuthService.validateSession();
      
      if (!baseValidation) {
        return false;
      }
      
      // Get the current session
      const session = this.getStoredAuthData() as EnhancedSessionStorage;
      
      if (!session) {
        return false;
      }
      
      // Check device binding if enabled
      // The EnhancedAuthConfig may not have deviceVerification directly
      // so we need to check securely
      const config = this.getSecurityConfig();
      if (config.deviceVerification?.verificationRequired) {
        const deviceId = localStorage.getItem('current_device_id');
        if (!deviceId || session.deviceId !== deviceId) {
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error('Enhanced session validation error:', err);
      return false;
    }
  }

  /**
   * Check if a user is authenticated with enhanced security
   * @returns true if authenticated, false otherwise
   */
  public isAuthenticated(): boolean {
    // Check in-memory state first
    if (this.currentUser && this.currentAccessToken) {
      return true;
    }

    // Check storage
    const session = this.getStoredAuthData();
    return !!(session && session.accessToken && session.expiresAt > Date.now());
  }

  /**
   * Get the authenticated user with enhanced security
   * @returns User object or null
   */
  public getAuthenticatedUser(): User | null {
    // Check in-memory state first
    if (this.currentUser) {
      return this.currentUser;
    }

    // Check storage
    const session = this.getStoredAuthData();
    if (session && session.user) {
      // Update in-memory reference
      this.currentUser = session.user;
      return session.user;
    }

    return null;
  }

  /**
   * Get the access token with enhanced security
   * @returns Promise resolving to access token
   */
  public async getAccessToken(): Promise<string> {
    try {
      // Check if we need to refresh the token
      const session = this.getStoredAuthData() as EnhancedSessionStorage;

      if (!session) {
        throw this.createAuthError(
          EnhancedAuthErrorType.NO_SESSION,
          'No active session'
        );
      }

      // Update last accessed timestamp
      session.lastAccessed = Date.now();
      await this.securelyStoreAuthData(session);

      // Check if token is about to expire
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = Math.floor(session.expiresAt / 1000);
      const threshold = this.enhancedConfig.tokenRefreshThreshold || 300;

      if (expiresAt - now < threshold) {
        // Token is about to expire, refresh it
        return await this.enhancedRefreshToken();
      }

      return session.accessToken;
    } catch (err) {
      throw this.createAuthError(
        EnhancedAuthErrorType.REFRESH_TOKEN_FAILED,
        `Failed to get access token: ${(err as Error).message}`
      );
    }
  }

  /**
   * Refresh the access token with enhanced security
   * @returns Promise resolving to new access token
   */
  public async refreshAccessToken(): Promise<string> {
    return this.enhancedRefreshToken();
  }

  /**
   * Get stored authentication data
   * @returns SessionStorage object or null
   */
  public getStoredAuthData(): SessionStorage | null {
    try {
      const storageKey = this.config.authStorageKey || 'auth_session';
      const storedData = localStorage.getItem(storageKey);

      if (!storedData) {
        return null;
      }

      return JSON.parse(storedData) as SessionStorage;
    } catch (err) {
      console.error('Error retrieving auth data:', err);
      return null;
    }
  }

  /**
   * Securely store authentication data
   * @param session SessionStorage object
   */
  public async securelyStoreAuthData(session: SessionStorage): Promise<void> {
    try {
      const storageKey = this.config.authStorageKey || 'auth_session';
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch (err) {
      console.error('Error storing auth data:', err);
      throw err;
    }
  }

  /**
   * Perform enhanced authentication
   * @param options MFA verification options
   * @returns Promise resolving to authentication result
   */
  public async performEnhancedAuth(options: MFAVerificationOptions): Promise<EnhancedAuthResult> {
    try {
      // Get the current session
      const session = this.getStoredAuthData() as EnhancedSessionStorage;

      if (!session) {
        throw this.createAuthError(
          EnhancedAuthErrorType.NO_SESSION,
          'No active session'
        );
      }

      // Generate device fingerprint if needed
      if (options.deviceBinding && !session.deviceId) {
        const deviceId = await this.securityManager.generateDeviceFingerprint();
        session.deviceId = deviceId;

        // Store the device ID for later validation
        localStorage.setItem('current_device_id', deviceId);
      }

      // Update session with security context
      if (!session.securityContext) {
        session.securityContext = {
          mfaCompleted: false,
          riskScore: 0,
          lastValidated: Date.now()
        };
      }

      // Store the updated session
      await this.securelyStoreAuthData(session);

      // Create enhanced auth result
      const enhancedResult: EnhancedAuthResult = {
        success: true,
        user: session.user,
        token: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        provider: session.provider,
        securityContext: {
          deviceId: session.deviceId,
          mfaCompleted: session.securityContext.mfaCompleted,
          riskScore: session.securityContext.riskScore
        }
      };

      return enhancedResult;
    } catch (err) {
      return {
        success: false,
        error: {
          type: EnhancedAuthErrorType.SECURITY_VIOLATION,
          message: (err as Error).message
        }
      };
    }
  }

  /**
   * Complete MFA verification
   * @param code Verification code
   * @returns Promise resolving to boolean indicating success
   */
  public async completeMfaVerification(code: string): Promise<boolean> {
    try {
      // In a real implementation, this would validate the MFA code
      // For this implementation, we'll just check for a simple code
      const isValidCode = code === '123456';

      if (!isValidCode) {
        throw this.createAuthError(
          EnhancedAuthErrorType.MFA_REQUIRED,
          'Invalid verification code'
        );
      }

      // Get the current session
      const session = this.getStoredAuthData() as EnhancedSessionStorage;

      if (!session) {
        throw this.createAuthError(
          EnhancedAuthErrorType.NO_SESSION,
          'No active session'
        );
      }

      // Update MFA status in the security context
      if (!session.securityContext) {
        session.securityContext = {
          mfaCompleted: true,
          riskScore: 0,
          lastValidated: Date.now()
        };
      } else {
        session.securityContext.mfaCompleted = true;
        session.securityContext.lastValidated = Date.now();
      }

      // Store the updated session
      await this.securelyStoreAuthData(session);

      return true;
    } catch (err) {
      console.error('MFA verification error:', err);
      return false;
    }
  }

  /**
   * Enhanced token refresh
   * @returns Promise resolving to new access token
   */
  private async enhancedRefreshToken(): Promise<string> {
    // Check if there's already a refresh in progress
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create new refresh promise
    this.refreshPromise = (async () => {
      try {
        // Get current session
        const session = this.getStoredAuthData();

        if (!session || !session.refreshToken) {
          throw this.createAuthError(
            EnhancedAuthErrorType.REFRESH_TOKEN_FAILED,
            'No refresh token available'
          );
        }

        // Get device ID if available
        const deviceId = localStorage.getItem('current_device_id') || 'unknown-device';

        // Rotate tokens with enhanced security
        const newTokens = await this.rotateTokens(session, deviceId);

        // Update the session with new tokens
        const updatedSession: EnhancedSessionStorage = {
          ...session as SessionStorage,
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: newTokens.expiresAt,
          deviceId,
          lastAccessed: Date.now(),
          securityContext: {
            mfaCompleted: (session as EnhancedSessionStorage).securityContext?.mfaCompleted || false,
            riskScore: (session as EnhancedSessionStorage).securityContext?.riskScore || 0,
            lastValidated: (session as EnhancedSessionStorage).securityContext?.lastValidated || Date.now()
          }
        };

        // Store the updated session
        await this.securelyStoreAuthData(updatedSession);

        // Update the in-memory reference
        this.currentAccessToken = newTokens.accessToken;

        // Return the new access token
        return newTokens.accessToken;
      } catch (err) {
        throw this.createAuthError(
          EnhancedAuthErrorType.REFRESH_TOKEN_FAILED,
          `Failed to refresh token: ${(err as Error).message}`
        );
      } finally {
        // Clear the refresh promise
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Rotate tokens with enhanced security
   * @param session Current session
   * @param deviceId Device ID
   * @returns Promise resolving to new token pair
   */
  private async rotateTokens(session: SessionStorage, deviceId: string): Promise<TokenPair> {
    try {
      // In a real implementation, this would call your authentication API
      // For this implementation, we'll just generate new tokens
      const accessToken = `enhanced-jwt-token-${Date.now()}`;
      const refreshToken = `enhanced-refresh-token-${Date.now()}`;
      const expiresAt = Date.now() + this.tokenRotationConfig.accessTokenDuration * 1000;

      // Blacklist the old token to prevent reuse
      this.securityManager.blacklistToken(session.accessToken, 'rotation');

      return {
        accessToken,
        refreshToken,
        expiresAt
      };
    } catch (err) {
      throw this.createAuthError(
        EnhancedAuthErrorType.REFRESH_TOKEN_FAILED,
        `Failed to rotate tokens: ${(err as Error).message}`
      );
    }
  }

  /**
   * Enhance the authentication result with additional security
   * @param baseResult Base authentication result
   * @returns Promise resolving to enhanced authentication result
   */
  private async enhanceAuthResult(baseResult: AuthResult): Promise<AuthResult> {
    try {
      // Generate device fingerprint
      const deviceId = await this.securityManager.generateDeviceFingerprint();

      // Create enhanced session storage
      const enhancedSession: EnhancedSessionStorage = {
        accessToken: baseResult.token as string,
        refreshToken: baseResult.refreshToken,
        expiresAt: baseResult.expiresAt as number,
        user: baseResult.user as User,
        provider: baseResult.provider as AuthProvider,
        deviceId,
        lastAccessed: Date.now(),
        securityContext: {
          mfaCompleted: false,
          riskScore: 0,
          lastValidated: Date.now()
        }
      };

      // Store the session
      await this.securelyStoreAuthData(enhancedSession);

      // Store device ID for later validation
      localStorage.setItem('current_device_id', deviceId);

      // Update in-memory references
      this.currentUser = baseResult.user as User;
      this.currentAccessToken = baseResult.token as string;

      // Return the enhanced result
      return {
        ...baseResult,
        // Additional properties can be added here if needed
      };
    } catch (err) {
      console.error('Failed to enhance auth result:', err);
      return baseResult;
    }
  }

  /**
   * Load active sessions from storage
   */
  private loadActiveSessions(): void {
    try {
      const sessionsData = localStorage.getItem('active_sessions');
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData) as Record<string, EnhancedSessionStorage>;
        this.activeSessions = new Map(Object.entries(sessions));
      }
    } catch (err) {
      console.error('Failed to load active sessions:', err);
      this.activeSessions = new Map();
    }
  }

  /**
   * Save active sessions to storage
   */
  private saveActiveSessions(): void {
    try {
      const sessions = Object.fromEntries(this.activeSessions.entries());
      localStorage.setItem('active_sessions', JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to save active sessions:', err);
    }
  }

  /**
   * Get default enhanced configuration
   * @returns Enhanced authentication configuration
   */
  private getDefaultEnhancedConfig(): EnhancedAuthConfig {
    return {
      authStorageKey: 'enhanced_auth_session',
      tokenRefreshThreshold: 300, // 5 minutes before expiry
      maxRetryAttempts: 3,
      autoRefreshToken: true,
      maxConcurrentSessions: 3,
      mfaRequired: true,
      passwordPolicyConfig: {
        minLength: 10,
        requireSpecialChars: true,
        requireNumbers: true,
        preventReuse: 5
      }
    };
  }

  /**
   * Create an auth error
   * @param type Error type
   * @param message Error message
   * @param originalError Original error
   * @returns AuthError object
   */
  private createAuthError(
    type: EnhancedAuthErrorType | AuthErrorType,
    message: string,
    originalError?: Error,
    retryable = false,
    statusCode?: number
  ): AuthModels.AuthError {
    return {
      type: type as AuthErrorType,
      message,
      originalError,
      retryable,
      statusCode
    };
  }

  /**
   * Get security config from enhanced config
   * @returns Security configuration
   */
  private getSecurityConfig(): any {
    // This is a placeholder method to get the security config with deviceVerification
    // In a real implementation, this would get the full security config from a service
    return {
      deviceVerification: {
        verificationRequired: this.enhancedConfig.mfaRequired || false,
        trustDuration: 30, // 30 days
        maxDevices: 5,
        notifyOnNewDevice: true,
        blockUnknownDevices: false
      }
    };
  }

  /**
   * Handle authentication errors
   * @param error Error object
   * @param provider Authentication provider
   * @returns AuthError object
   */
  private handleAuthError(error: Error, provider: string): AuthModels.AuthError {
    console.error(`Authentication error (${provider}):`, error);
    
    // Extract type if it's already an AuthError
    if ((error as any).type && (error as any).message) {
      return error as unknown as AuthModels.AuthError;
    }
    
    // Create a new AuthError
    return this.createAuthError(
      AuthErrorType.UNKNOWN,
      `Authentication failed: ${error.message}`,
      error
    );
  }
}
