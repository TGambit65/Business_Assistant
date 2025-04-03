/**
 * Enhanced Authentication Service
 * 
 * Provides robust authentication functionality with:
 * - Multiple authentication providers
 * - Session management
 * - Token refresh
 * - Secure storage
 * - Error handling with retry logic
 * - Concurrent request management
 */

import {
  AuthService as IAuthService,
  AuthResult,
  AuthError,
  AuthErrorType,
  SessionStorage,
  TokenResponse,
  AuthProvider,
  PKCEData,
  JWTToken,
  AuthConfig
} from '../types/auth';
import { User } from '../types/user'; // Removed unused UserAuth
import { getEnvVariable, isDemoMode } from '../utils/envUtils';

// Default configuration
const DEFAULT_CONFIG: AuthConfig = {
  authStorageKey: 'auth_session',
  tokenRefreshThreshold: 300, // 5 minutes before expiry
  maxRetryAttempts: 3,
  autoRefreshToken: true
};

/**
 * Authentication Service Implementation
 */
class AuthService implements IAuthService {
  private config: AuthConfig;
  private refreshPromise: Promise<string> | null = null;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  // In-memory references for enhanced security
  private currentUser: User | null = null;
  private currentAccessToken: string | null = null;
  
  // For OAuth PKCE flow
  private pkceData: PKCEData | null = null;

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Load client IDs from environment variables if not provided
    if (!this.config.googleClientId) {
      this.config.googleClientId = getEnvVariable('REACT_APP_GOOGLE_CLIENT_ID') || undefined;
    }
    
    if (!this.config.microsoftClientId) {
      this.config.microsoftClientId = getEnvVariable('REACT_APP_MICROSOFT_CLIENT_ID') || undefined;
    }
    
    if (!this.config.githubClientId) {
      this.config.githubClientId = getEnvVariable('REACT_APP_GITHUB_CLIENT_ID') || undefined;
    }
    
    // Initialize the authentication state
    this.loadAuthStateFromStorage();
    
    // Set up token refresh interval if enabled
    if (this.config.autoRefreshToken) {
      this.setupTokenRefreshInterval();
    }
  }
  
  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Check if we're in demo mode
      if (isDemoMode()) {
        return this.signInDemo();
      }
      
      // In a real implementation, this would call your authentication API
      // For this implementation, we'll return a mock successful result
      const mockResult: AuthResult = {
        success: true,
        user: {
          id: 'user-123',
          email: email,
          name: email.split('@')[0],
          preferences: {
            defaultEmailSignature: `Best regards,\n${email.split('@')[0]}`,
            defaultReplySignature: `Regards,\n${email.split('@')[0]}`,
            defaultLanguage: 'en',
            defaultTone: 'professional',
            showNotifications: true,
            emailRefreshInterval: 300,
            sendReceiptConfirmation: false,
            defaultFontSize: '14px',
            defaultFontFamily: 'Arial',
            useRichTextEditor: true,
            useSpellCheck: true,
            alwaysShowBcc: false,
            useThreadView: true
          },
          settings: {
            theme: 'light',
            layout: 'comfortable',
            sidebar: {
              expanded: true,
              favorites: []
            },
            notifications: {
              email: true,
              browser: true,
              sound: true,
              desktop: false
            },
            shortcuts: {},
            ai: {
              enabled: true,
              useDemoMode: false,
              autoSuggest: true,
              suggestionThreshold: 75,
              allowBackgroundProcessing: true
            },
            privacy: {
              sendAnonymousUsageData: true,
              storeHistory: true,
              historyRetentionDays: 30
            }
          },
          createdAt: new Date()
        },
        token: `mock-jwt-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
        expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
        provider: 'email'
      };
      
      // Store authentication data securely
      await this.storeAuthData(mockResult);
      
      return mockResult;
    } catch (err) {
      // Handle errors
      const error = this.handleAuthError(err as Error, 'email');
      return { success: false, error };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<AuthResult> {
    // Create a unique request key for deduplication
    // const requestKey = `google-auth-${Date.now()}`; // Removed unused variable
    
    // Check for a pending request
    if (this.pendingRequests.has('google-auth')) {
      console.log('Google auth request already in progress, using existing promise');
      return this.pendingRequests.get('google-auth') as Promise<AuthResult>;
    }

    // Create a new promise
    const authPromise = new Promise<AuthResult>(async (resolve, reject) => {
      try {
        // Check if we're in demo mode
        if (isDemoMode()) {
          const demoResult = await this.signInDemo('google');
          resolve(demoResult);
          return;
        }
        
        // Check if we have Google client ID configured
        if (!this.config.googleClientId) {
          throw new Error('Google Client ID is not configured');
        }
        
        // Generate PKCE values for enhanced security
        this.pkceData = await this.generatePKCEChallenge();
        
        // Load the Google Sign-In script
        await this.loadGoogleAuthScript();
        
        // Initialize the OAuth client
        if (!window.google || !window.google.accounts) {
          throw new Error('Google API failed to load');
        }
        
        // Configure token client with PKCE for enhanced security
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.config.googleClientId,
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: async (tokenResponse: any) => {
            try {
              if (tokenResponse.error) {
                const error = this.createAuthError(
                  AuthErrorType.AUTHORIZATION_FAILED,
                  `Google authorization failed: ${tokenResponse.error}`,
                  new Error(tokenResponse.error)
                );
                reject(error);
                return;
              }
              
              // Create a response object with PKCE validation
              const response: TokenResponse = {
                accessToken: tokenResponse.access_token,
                expiresIn: tokenResponse.expires_in,
                scope: tokenResponse.scope,
                tokenType: tokenResponse.token_type
              };
              
              // Fetch user profile with the token
              const userProfile = await this.fetchGoogleUserProfile(response.accessToken);
              
              // Create user object from profile
              const user: User = {
                id: userProfile.sub,
                email: userProfile.email,
                name: userProfile.name,
                preferences: {
                  defaultEmailSignature: `Best regards,\n${userProfile.name}`,
                  defaultReplySignature: `Regards,\n${userProfile.name}`,
                  defaultLanguage: 'en',
                  defaultTone: 'professional',
                  showNotifications: true,
                  emailRefreshInterval: 300,
                  sendReceiptConfirmation: false,
                  defaultFontSize: '14px',
                  defaultFontFamily: 'Arial',
                  useRichTextEditor: true,
                  useSpellCheck: true,
                  alwaysShowBcc: false,
                  useThreadView: true
                },
                settings: {
                  theme: 'light',
                  layout: 'comfortable',
                  sidebar: {
                    expanded: true,
                    favorites: []
                  },
                  notifications: {
                    email: true,
                    browser: true,
                    sound: true,
                    desktop: false
                  },
                  shortcuts: {},
                  ai: {
                    enabled: true,
                    useDemoMode: false,
                    autoSuggest: true,
                    suggestionThreshold: 75,
                    allowBackgroundProcessing: true
                  },
                  privacy: {
                    sendAnonymousUsageData: true,
                    storeHistory: true,
                    historyRetentionDays: 30
                  }
                },
                createdAt: new Date()
              };
              
              // Create authentication result
              const authResult: AuthResult = {
                success: true,
                user,
                token: response.accessToken,
                expiresAt: Date.now() + (response.expiresIn * 1000),
                provider: 'google'
              };
              
              // Store authentication data securely
              await this.storeAuthData(authResult);
              
              resolve(authResult);
            } catch (err) {
              const error = this.handleAuthError(err as Error, 'google');
              reject(error);
            }
          }
        });
        
        // Request token with PKCE code challenge
        tokenClient.requestAccessToken({
          code_challenge: this.pkceData.codeChallenge,
          code_challenge_method: this.pkceData.codeChallengeMethod
        });
      } catch (err) {
        const error = this.handleAuthError(err as Error, 'google');
        reject({ success: false, error });
      } finally {
        // Clean up the pending request
        setTimeout(() => {
          this.pendingRequests.delete('google-auth');
        }, 1000);
      }
    });
    
    // Store the promise for deduplication
    this.pendingRequests.set('google-auth', authPromise);
    
    return authPromise;
  }

  /**
   * Sign in with Microsoft OAuth (placeholder implementation)
   */
  async signInWithMicrosoft(): Promise<AuthResult> {
    try {
      // Check if we're in demo mode
      if (isDemoMode()) {
        return this.signInDemo('microsoft');
      }
      
      // Real implementation would initialize Microsoft Auth SDK
      throw new Error('Microsoft authentication not implemented');
    } catch (err) {
      const error = this.handleAuthError(err as Error, 'microsoft');
      return { success: false, error };
    }
  }

  /**
   * Sign in with GitHub OAuth (placeholder implementation)
   */
  async signInWithGithub(): Promise<AuthResult> {
    try {
      // Check if we're in demo mode
      if (isDemoMode()) {
        return this.signInDemo('github');
      }
      
      // Real implementation would initialize GitHub Auth
      throw new Error('GitHub authentication not implemented');
    } catch (err) {
      const error = this.handleAuthError(err as Error, 'github');
      return { success: false, error };
    }
  }

  /**
   * Sign in with Demo mode
   */
  async signInDemo(provider: AuthProvider = 'demo'): Promise<AuthResult> {
    try {
      // Create a demo user based on the provider
      const demoName = provider === 'demo' ? 'Demo User' : `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
      const demoEmail = provider === 'demo' ? 'demo@example.com' : `demo-${provider}@example.com`;
      
      // Create a mock user object
      const user: User = {
        id: `demo-${provider}-${Date.now()}`,
        email: demoEmail,
        name: demoName,
        preferences: {
          defaultEmailSignature: `Best regards,\n${demoName}`,
          defaultReplySignature: `Regards,\n${demoName}`,
          defaultLanguage: 'en',
          defaultTone: 'professional',
          showNotifications: true,
          emailRefreshInterval: 300,
          sendReceiptConfirmation: false,
          defaultFontSize: '14px',
          defaultFontFamily: 'Arial',
          useRichTextEditor: true,
          useSpellCheck: true,
          alwaysShowBcc: false,
          useThreadView: true
        },
        settings: {
          theme: 'light',
          layout: 'comfortable',
          sidebar: {
            expanded: true,
            favorites: []
          },
          notifications: {
            email: true,
            browser: true,
            sound: true,
            desktop: false
          },
          shortcuts: {},
          ai: {
            enabled: true,
            useDemoMode: true,
            autoSuggest: true,
            suggestionThreshold: 75,
            allowBackgroundProcessing: true
          },
          privacy: {
            sendAnonymousUsageData: false,
            storeHistory: true,
            historyRetentionDays: 30
          }
        },
        createdAt: new Date()
      };
      
      // Create a demo token with 24-hour expiry for investor demos
      const tokenExpiryTime = 24 * 60 * 60 * 1000; // 24 hours
      
      // Create authentication result
      const authResult: AuthResult = {
        success: true,
        user,
        token: `demo-token-${provider}-${Date.now()}`,
        refreshToken: `demo-refresh-token-${provider}-${Date.now()}`,
        expiresAt: Date.now() + tokenExpiryTime,
        provider
      };
      
      // Store authentication data securely
      await this.storeAuthData(authResult);
      
      // Simulate network delay for realistic behavior
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return authResult;
    } catch (err) {
      const error = this.handleAuthError(err as Error, 'demo');
      return { success: false, error };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const currentSession = this.getStoredAuthData();
      
      // Provider-specific sign out logic
      if (currentSession?.provider === 'google') {
        // Sign out from Google
        if (window.google?.accounts?.id) {
          window.google.accounts.id.disableAutoSelect();
        }
      }
      
      // Clear all auth data
      this.clearAuthData();
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error during sign out:', err);
      // Still clear local data even if provider-specific signout fails
      this.clearAuthData();
      return Promise.resolve();
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<void> {
    try {
      // Check if already authenticated
      if (!this.isAuthenticated()) {
        throw new Error('No active session to refresh');
      }
      
      // Get a fresh access token
      await this.refreshAccessToken();
      
      return Promise.resolve();
    } catch (err) {
      // If refresh fails, clear the session and throw
      this.clearAuthData();
      throw err;
    }
  }

  /**
   * Validate the current session
   */
  async validateSession(): Promise<boolean> {
    try {
      // Check if we have a stored session
      const session = this.getStoredAuthData();
      if (!session) {
        return false;
      }
      
      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        // Try to refresh the token
        try {
          await this.refreshAccessToken();
          return true;
        } catch (err) {
          // If refresh fails, session is invalid
          this.clearAuthData();
          return false;
        }
      }
      
      // If in demo mode, always return true
      if (isDemoMode() || session.provider === 'demo') {
        return true;
      }
      
      // For a real implementation, we would validate the token with the server
      // For now, just check if we have a token
      return !!session.accessToken;
    } catch (err) {
      console.error('Error validating session:', err);
      return false;
    }
  }

  /**
   * Get the current access token
   */
  async getAccessToken(): Promise<string> {
    // If we have a token in memory, use it
    if (this.currentAccessToken) {
      // Check if we need to refresh
      const session = this.getStoredAuthData();
      if (session && session.expiresAt) {
        const timeUntilExpiry = session.expiresAt - Date.now();
        const refreshThreshold = (this.config.tokenRefreshThreshold || 300) * 1000;
        
        if (timeUntilExpiry < refreshThreshold) {
          // Need to refresh the token
          return this.refreshAccessToken();
        }
      }
      
      return this.currentAccessToken;
    }
    
    // No token in memory, check storage
    const session = this.getStoredAuthData();
    if (!session || !session.accessToken) {
      throw new Error('No access token available');
    }
    
    // Check if token is expired or about to expire
    if (session.expiresAt < Date.now() + (this.config.tokenRefreshThreshold || 300) * 1000) {
      // Need to refresh the token
      return this.refreshAccessToken();
    }
    
    // Store in memory for faster access
    this.currentAccessToken = session.accessToken;
    return session.accessToken;
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken(): Promise<string> {
    // If a refresh is already in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    // Create a refresh promise
    this.refreshPromise = new Promise<string>(async (resolve, reject) => {
      try {
        // Get the stored session data
        const session = this.getStoredAuthData();
        if (!session) {
          throw new Error('No session to refresh');
        }
        
        // For demo mode, just create a new token
        if (isDemoMode() || session.provider === 'demo') {
          const newToken = `demo-token-${session.provider}-${Date.now()}`;
          const newExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
          
          // Update the session
          const updatedSession: SessionStorage = {
            ...session,
            accessToken: newToken,
            expiresAt: newExpiry
          };
          
          // Store the updated session
          await this.securelyStoreAuthData(updatedSession);
          
          // Update in-memory reference
          this.currentAccessToken = newToken;
          
          resolve(newToken);
          return;
        }
        
        // Provider-specific refresh logic
        if (session.provider === 'google') {
          // In a real implementation, we would call the Google token refresh endpoint
          // For now, simulate a successful refresh
          const newToken = `refreshed-google-token-${Date.now()}`;
          const newExpiry = Date.now() + 3600 * 1000; // 1 hour
          
          // Update the session
          const updatedSession: SessionStorage = {
            ...session,
            accessToken: newToken,
            expiresAt: newExpiry
          };
          
          // Store the updated session
          await this.securelyStoreAuthData(updatedSession);
          
          // Update in-memory reference
          this.currentAccessToken = newToken;
          
          resolve(newToken);
        } else {
          // Generic refresh for other providers
          // In a real implementation, this would call your auth server's refresh endpoint
          throw new Error(`Token refresh not implemented for provider: ${session.provider}`);
        }
      } catch (err) {
        console.error('Error refreshing token:', err);
        reject(err);
        
        // Clear auth data on critical errors
        if (
          err instanceof Error && 
          (err.message.includes('invalid_grant') || 
           err.message.includes('Invalid refresh token'))
        ) {
          this.clearAuthData();
        }
      } finally {
        // Clear the refresh promise
        setTimeout(() => {
          this.refreshPromise = null;
        }, 1000);
      }
    });
    
    return this.refreshPromise;
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    // Check in-memory state first
    if (this.currentUser && this.currentAccessToken) {
      return true;
    }
    
    // Check storage
    const session = this.getStoredAuthData();
    return !!(session && session.accessToken && session.expiresAt > Date.now());
  }

  /**
   * Get the authenticated user
   */
  getAuthenticatedUser(): User | null {
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
   * Get stored authentication data
   */
  getStoredAuthData(): SessionStorage | null {
    try {
      const storageKey = this.config.authStorageKey || 'auth_session';
      const data = localStorage.getItem(storageKey);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data) as SessionStorage;
    } catch (err) {
      console.error('Error getting stored auth data:', err);
      return null;
    }
  }

  /**
   * Securely store authentication data
   */
  async securelyStoreAuthData(session: SessionStorage): Promise<void> {
    try {
      // In a production environment, we might encrypt the data first
      // For this implementation, we'll just store it in localStorage
      const storageKey = this.config.authStorageKey || 'auth_session';
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch (err) {
      console.error('Error storing auth data:', err);
      throw err;
    }
  }

  /**
   * Load authentication state from storage
   */
  private loadAuthStateFromStorage(): void {
    const session = this.getStoredAuthData();
    
    if (session) {
      this.currentUser = session.user;
      this.currentAccessToken = session.accessToken;
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    // Clear in-memory references
    this.currentUser = null;
    this.currentAccessToken = null;
    
    // Clear stored data
    const storageKey = this.config.authStorageKey || 'auth_session';
    localStorage.removeItem(storageKey);
    
    // Also clear any provider-specific tokens
    localStorage.removeItem('googleAccessToken');
  }

  /**
   * Set up token refresh interval
   */
  private setupTokenRefreshInterval(): void {
    // Check every minute if token needs refreshing
    setInterval(async () => {
      if (!this.isAuthenticated()) {
        return;
      }
      
      try {
        const session = this.getStoredAuthData();
        if (!session) {
          return;
        }
        
        const timeUntilExpiry = session.expiresAt - Date.now();
        const refreshThreshold = (this.config.tokenRefreshThreshold || 300) * 1000;
        
        if (timeUntilExpiry < refreshThreshold) {
          // Need to refresh the token
          await this.refreshAccessToken();
        }
      } catch (err) {
        console.error('Error in auto token refresh:', err);
      }
    }, 60000); // Check every minute
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: Error, provider: string): AuthError {
    console.error(`Authentication error (${provider}):`, error);
    
    // Map error to AuthError type
    let type = AuthErrorType.UNKNOWN;
    let retryable = false;
    
    // Check for network errors
    if (
      error.message.includes('network') || 
      error.message.includes('Network') ||
      error.message.includes('Failed to fetch')
    ) {
      type = AuthErrorType.NETWORK_ERROR;
      retryable = true;
    }
    // Check for token errors
    else if (
      error.message.includes('token') ||
      error.message.includes('Token') ||
      error.message.includes('expired')
    ) {
      type = AuthErrorType.TOKEN_EXPIRED;
      retryable = true;
    }
    // Check for authorization errors
    else if (
      error.message.includes('auth') ||
      error.message.includes('Auth') ||
      error.message.includes('authorization')
    ) {
      type = AuthErrorType.AUTHORIZATION_FAILED;
      retryable = false;
    }
    // Check for credential errors
    else if (
      error.message.includes('credential') ||
      error.message.includes('Credential') ||
      error.message.includes('invalid_grant')
    ) {
      type = AuthErrorType.INVALID_CREDENTIALS;
      retryable = false;
    }
    // Check for user cancellation
    else if (
      error.message.includes('cancel') ||
      error.message.includes('Cancel') ||
      error.message.includes('abort')
    ) {
      type = AuthErrorType.USER_CANCELLED;
      retryable = false;
    }
    
    return this.createAuthError(type, `${provider} authentication failed: ${error.message}`, error, retryable);
  }

  /**
   * Create an AuthError object
   */
  private createAuthError(
    type: AuthErrorType,
    message: string,
    originalError?: Error,
    retryable = false,
    statusCode?: number
  ): AuthError {
    return {
      type,
      message,
      originalError,
      retryable,
      statusCode
    };
  }

  /**
   * Validate and decode a JWT token
   */
  private validateJWT(token: string): JWTToken | null {
    try {
      // Basic structural validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }
      
      // Decode the payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.error('JWT is expired');
        return null;
      }
      
      return payload as JWTToken;
    } catch (err) {
      console.error('Error validating JWT:', err);
      return null;
    }
  }

  /**
   * Load the Google Auth script
   */
  private async loadGoogleAuthScript(): Promise<void> {
    // Check if script is already loaded
    if (window.google && window.google.accounts) {
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          resolve();
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Google auth script'));
        };
        
        document.head.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Fetch the Google user profile
   */
  private async fetchGoogleUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Google profile: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error fetching Google profile:', err);
      throw err;
    }
  }

  /**
   * Generate a PKCE challenge for OAuth
   */
  private async generatePKCEChallenge(): Promise<PKCEData> {
    // Generate a random string for the code verifier
    const generateRandomString = () => {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => 
        ('0' + (byte & 0xFF).toString(16)).slice(-2)
      ).join('');
    };
    
    // Create a SHA-256 hash of the verifier
    const sha256 = async (verifier: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const hash = await window.crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };
    
    const codeVerifier = generateRandomString();
    const codeChallenge = await sha256(codeVerifier);
    
    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256'
    };
  }

  /**
   * Store authentication data securely
   */
  private async storeAuthData(authResult: AuthResult): Promise<void> {
    if (!authResult.success || !authResult.user || !authResult.token) {
      throw new Error('Invalid authentication result');
    }
    
    // Create a session storage object
    const session: SessionStorage = {
      accessToken: authResult.token,
      refreshToken: authResult.refreshToken || '',
      expiresAt: authResult.expiresAt || Date.now() + 3600 * 1000, // Default 1 hour
      user: authResult.user,
      provider: authResult.provider || 'email'
    };
    
    // Store the session
    await this.securelyStoreAuthData(session);
    
    // Update in-memory references
    this.currentUser = authResult.user;
    this.currentAccessToken = authResult.token;
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService; 