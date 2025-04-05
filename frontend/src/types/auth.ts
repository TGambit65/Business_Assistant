/**
 * TypeScript definitions for authentication-related types
 */

import { User } from './user';

/**
 * Authentication providers supported by the application
 */
export type AuthProvider = 'email' | 'google' | 'microsoft' | 'github' | 'demo';

/**
 * Authentication service interface
 */
export interface AuthService {
  // Core authentication methods
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult>;
  signInWithMicrosoft(): Promise<AuthResult>;
  signInWithGithub(): Promise<AuthResult>;
  signInDemo(): Promise<AuthResult>;
  signOut(): Promise<void>;
  
  // Session management
  refreshSession(): Promise<void>;
  validateSession(): Promise<boolean>;
  
  // Token management
  getAccessToken(): Promise<string>;
  refreshAccessToken(): Promise<string>;
  
  // Status checks
  isAuthenticated(): boolean;
  getAuthenticatedUser(): User | null;
}

/**
 * Authentication result returned from sign-in methods
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: AuthError;
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  provider?: AuthProvider;
}

/**
 * Token response from authentication providers
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
  scope?: string;
  tokenType?: string;
}

/**
 * Session storage interface for persisting authentication state
 */
export interface SessionStorage {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: User;
  provider: AuthProvider;
}

/**
 * Authentication error types for granular error handling
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  TOKEN_EXPIRED = 'token_expired',
  USER_CANCELLED = 'user_cancelled',
  ACCOUNT_LOCKED = 'account_locked',
  AUTHORIZATION_FAILED = 'authorization_failed',
  REFRESH_TOKEN_FAILED = 'refresh_token_failed',
  UNKNOWN = 'unknown',
}

/**
 * Authentication error structure
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable?: boolean;
}

/**
 * Proof Key for Code Exchange (PKCE) data
 */
export interface PKCEData {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  googleClientId?: string;
  microsoftClientId?: string;
  githubClientId?: string;
  apiUrl?: string;
  authStorageKey?: string;
  tokenRefreshThreshold?: number; // Time in seconds before expiry to refresh
  maxRetryAttempts?: number;
  autoRefreshToken?: boolean;
}

/**
 * JWT token structure (decoded)
 */
export interface JWTToken {
  sub: string; // Subject (user ID)
  iss: string; // Issuer
  aud: string; // Audience
  exp: number; // Expiration time
  iat: number; // Issued at
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
} 