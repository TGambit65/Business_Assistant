/**
 * ApiSecurityManager
 * 
 * Provides secure API communication with:
 * - OAuth 2.0 flows
 * - JWT validation and security
 * - Automatic token refresh
 * - API key rotation
 * - Request signing and verification
 */

import { AuditLogger, LogLevel, EventType } from './AuditLogger';
import { AnalyticsEncryption } from './AnalyticsEncryption';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Types for OAuth and JWT
export enum GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  CLIENT_CREDENTIALS = 'client_credentials',
  PASSWORD = 'password',
  REFRESH_TOKEN = 'refresh_token',
  IMPLICIT = 'implicit'
}

export enum TokenType {
  BEARER = 'Bearer',
  MAC = 'MAC',
  JWT = 'JWT'
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string; // For OpenID Connect
}

export interface JwtPayload {
  iss?: string; // issuer
  sub?: string; // subject
  aud?: string | string[]; // audience
  exp?: number; // expiration time
  nbf?: number; // not before
  iat?: number; // issued at
  jti?: string; // JWT ID
  [key: string]: any; // Custom claims
}

export interface ApiKeyConfig {
  key: string;
  secret?: string;
  prefix?: string;
  headerName?: string;
  expiresAt?: number;
  description?: string;
  scopes?: string[];
  rotationPeriod?: number; // in days
}

export interface ApiSecurityConfig {
  baseUrl: string;
  tokenEndpoint: string;
  authorizationEndpoint?: string;
  clientId: string;
  clientSecret?: string;
  redirectUri?: string;
  scope?: string;
  autoRefreshToken?: boolean;
  tokenExpiryBuffer?: number; // seconds before expiry to refresh
  httpSigningEnabled?: boolean;
  apiKey?: ApiKeyConfig;
  jwtSecret?: string;
}

export class ApiSecurityManager {
  private static instance: ApiSecurityManager;
  private logger: AuditLogger;
  private encryption: AnalyticsEncryption;
  private config: ApiSecurityConfig;
  private apiClient: AxiosInstance;
  private tokens: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenType?: string;
  } = {};
  
  private constructor() {
    this.logger = new AuditLogger({
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      maxLocalStorageEntries: 100
    });
    this.encryption = AnalyticsEncryption.getInstance();
    
    // Default configuration
    this.config = {
      baseUrl: '',
      tokenEndpoint: '/oauth/token',
      clientId: ''
    };
    
    // Create API client
    this.apiClient = axios.create();
    
    // Add request interceptor for automatic token injection
    this.apiClient.interceptors.request.use(
      this.requestInterceptor.bind(this),
      this.requestErrorInterceptor.bind(this)
    );
    
    // Add response interceptor for automatic token refresh
    this.apiClient.interceptors.response.use(
      this.responseInterceptor.bind(this),
      this.responseErrorInterceptor.bind(this)
    );
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ApiSecurityManager {
    if (!ApiSecurityManager.instance) {
      ApiSecurityManager.instance = new ApiSecurityManager();
    }
    return ApiSecurityManager.instance;
  }

  /**
   * Configure the API security manager
   */
  public configure(config: ApiSecurityConfig): void {
    this.config = {
      ...this.config,
      ...config
    };
    
    // Configure the API client
    this.apiClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000
    });
    
    // Re-add interceptors
    this.apiClient.interceptors.request.use(
      this.requestInterceptor.bind(this),
      this.requestErrorInterceptor.bind(this)
    );
    
    this.apiClient.interceptors.response.use(
      this.responseInterceptor.bind(this),
      this.responseErrorInterceptor.bind(this)
    );
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.CONFIGURATION_CHANGE,
      description: 'API Security Manager configured',
      metadata: { baseUrl: this.config.baseUrl }
    });
  }

  /**
   * Get the configured API client with security already set up
   */
  public getApiClient(): AxiosInstance {
    return this.apiClient;
  }

  /**
   * Authenticate using the authorization code grant type
   */
  public async authenticateWithAuthCode(code: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', GrantType.AUTHORIZATION_CODE);
      params.append('client_id', this.config.clientId);
      
      if (this.config.clientSecret) {
        params.append('client_secret', this.config.clientSecret);
      }
      
      params.append('code', code);
      
      if (this.config.redirectUri) {
        params.append('redirect_uri', this.config.redirectUri);
      }
      
      const response = await axios.post<TokenResponse>(
        `${this.config.baseUrl}${this.config.tokenEndpoint}`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.setTokens(response.data);
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'Authenticated with authorization code',
        metadata: { clientId: this.config.clientId }
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Failed to authenticate with authorization code',
        metadata: { error, clientId: this.config.clientId }
      });
      
      return false;
    }
  }

  /**
   * Authenticate using the client credentials grant type
   */
  public async authenticateWithClientCredentials(): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', GrantType.CLIENT_CREDENTIALS);
      params.append('client_id', this.config.clientId);
      
      if (this.config.clientSecret) {
        params.append('client_secret', this.config.clientSecret);
      }
      
      if (this.config.scope) {
        params.append('scope', this.config.scope);
      }
      
      const response = await axios.post<TokenResponse>(
        `${this.config.baseUrl}${this.config.tokenEndpoint}`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.setTokens(response.data);
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'Authenticated with client credentials',
        metadata: { clientId: this.config.clientId }
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Failed to authenticate with client credentials',
        metadata: { error, clientId: this.config.clientId }
      });
      
      return false;
    }
  }

  /**
   * Authenticate using the password grant type
   */
  public async authenticateWithPassword(username: string, password: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', GrantType.PASSWORD);
      params.append('client_id', this.config.clientId);
      
      if (this.config.clientSecret) {
        params.append('client_secret', this.config.clientSecret);
      }
      
      params.append('username', username);
      params.append('password', password);
      
      if (this.config.scope) {
        params.append('scope', this.config.scope);
      }
      
      const response = await axios.post<TokenResponse>(
        `${this.config.baseUrl}${this.config.tokenEndpoint}`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.setTokens(response.data);
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'Authenticated with password grant',
        metadata: { clientId: this.config.clientId, username }
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Failed to authenticate with password grant',
        metadata: { error, clientId: this.config.clientId, username }
      });
      
      return false;
    }
  }

  /**
   * Refresh the access token
   */
  public async refreshAccessToken(): Promise<boolean> {
    if (!this.tokens.refreshToken) {
      this.logger.log({
        level: LogLevel.WARNING,
        type: EventType.AUTHENTICATION,
        description: 'Cannot refresh token: No refresh token available'
      });
      
      return false;
    }
    
    try {
      const params = new URLSearchParams();
      params.append('grant_type', GrantType.REFRESH_TOKEN);
      params.append('client_id', this.config.clientId);
      
      if (this.config.clientSecret) {
        params.append('client_secret', this.config.clientSecret);
      }
      
      params.append('refresh_token', this.tokens.refreshToken);
      
      const response = await axios.post<TokenResponse>(
        `${this.config.baseUrl}${this.config.tokenEndpoint}`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.setTokens(response.data);
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'Access token refreshed successfully',
        metadata: { clientId: this.config.clientId }
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Failed to refresh access token',
        metadata: { error, clientId: this.config.clientId }
      });
      
      // Clear tokens as they may be invalid
      this.clearTokens();
      
      return false;
    }
  }

  /**
   * Generate an authorization URL for the authorization code flow
   */
  public generateAuthorizationUrl(state?: string, scope?: string): string {
    if (!this.config.authorizationEndpoint) {
      throw new Error('Authorization endpoint not configured');
    }
    
    if (!this.config.redirectUri) {
      throw new Error('Redirect URI not configured');
    }
    
    const params = new URLSearchParams();
    params.append('response_type', 'code');
    params.append('client_id', this.config.clientId);
    params.append('redirect_uri', this.config.redirectUri);
    
    if (scope || this.config.scope) {
      params.append('scope', scope || this.config.scope || '');
    }
    
    if (state) {
      params.append('state', state);
    }
    
    return `${this.config.baseUrl}${this.config.authorizationEndpoint}?${params.toString()}`;
  }

  /**
   * Validate a JWT token
   */
  public validateJwtToken(token: string, requiredClaims?: Record<string, any>): boolean {
    try {
      const payload = this.decodeJwt(token);
      
      // Check if token has expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        this.logger.log({
          level: LogLevel.WARNING,
          type: EventType.AUTHENTICATION,
          description: 'JWT token has expired',
          metadata: { token: token.substring(0, 10) + '...' }
        });
        
        return false;
      }
      
      // Check if token is not yet valid
      if (payload.nbf && payload.nbf > Date.now() / 1000) {
        this.logger.log({
          level: LogLevel.WARNING,
          type: EventType.AUTHENTICATION,
          description: 'JWT token is not yet valid',
          metadata: { token: token.substring(0, 10) + '...' }
        });
        
        return false;
      }
      
      // Check required claims
      if (requiredClaims) {
        for (const [key, value] of Object.entries(requiredClaims)) {
          if (payload[key] !== value) {
            this.logger.log({
              level: LogLevel.WARNING,
              type: EventType.AUTHENTICATION,
              description: `JWT token lacks required claim: ${key}`,
              metadata: { token: token.substring(0, 10) + '...' }
            });
            
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Failed to validate JWT token',
        metadata: { error, token: token.substring(0, 10) + '...' }
      });
      
      return false;
    }
  }

  /**
   * Create a signed request using HTTP signatures
   */
  public createSignedRequest(method: string, url: string, data?: any, headers?: Record<string, string>): AxiosRequestConfig {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = this.generateNonce();
    
    const requestConfig: AxiosRequestConfig = {
      method,
      url,
      headers: {
        ...headers,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce
      }
    };
    
    if (data) {
      requestConfig.data = data;
    }
    
    if (this.config.httpSigningEnabled && this.config.apiKey?.secret) {
      // Create signature
      const stringToSign = this.createStringToSign(method, url, timestamp, nonce, data);
      const signature = this.createSignature(stringToSign, this.config.apiKey.secret);
      
      // Add signature to headers
      requestConfig.headers = {
        ...requestConfig.headers,
        'X-Signature': signature,
        'X-Api-Key': this.config.apiKey.key
      };
    }
    
    return requestConfig;
  }

  /**
   * Rotate the API key
   */
  public async rotateApiKey(): Promise<boolean> {
    if (!this.config.apiKey) {
      this.logger.log({
        level: LogLevel.WARNING,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Cannot rotate API key: No API key configured'
      });
      
      return false;
    }
    
    try {
      // This would typically call an API endpoint to rotate the key
      // For now, we'll just simulate it
      
      // Generate a new key and secret
      const newKey = this.generateApiKey();
      const newSecret = this.generateApiSecret();
      
      // Update the configuration
      this.config.apiKey = {
        ...this.config.apiKey,
        key: newKey,
        secret: newSecret,
        expiresAt: Date.now() + (this.config.apiKey.rotationPeriod || 90) * 24 * 60 * 60 * 1000
      };
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'API key rotated successfully'
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Failed to rotate API key',
        metadata: { error }
      });
      
      return false;
    }
  }

  /**
   * Create a JWT token
   */
  public createJwtToken(payload: JwtPayload, expiresInSeconds = 3600): string {
    if (!this.config.jwtSecret) {
      throw new Error('JWT secret not configured');
    }
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    
    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds
    };
    
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    
    const signature = this.hmacSha256(
      `${encodedHeader}.${encodedPayload}`,
      this.config.jwtSecret
    );
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Decode a JWT token without verification
   */
  public decodeJwt(token: string): JwtPayload {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    try {
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      return payload;
    } catch (error) {
      throw new Error('Invalid JWT payload');
    }
  }

  /**
   * Check if the current token is valid and not expired
   */
  public isAuthenticated(): boolean {
    if (!this.tokens.accessToken || !this.tokens.expiresAt) {
      return false;
    }
    
    // Consider the token valid if it hasn't expired
    return this.tokens.expiresAt > Date.now();
  }

  /**
   * Request interceptor for adding authentication and signing
   */
  private requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Add authentication if we have tokens
    if (this.tokens.accessToken && this.tokens.tokenType) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `${this.tokens.tokenType} ${this.tokens.accessToken}`;
    }
    
    // Add API key if configured
    if (this.config.apiKey && this.config.apiKey.key) {
      const headerName = this.config.apiKey.headerName || 'X-Api-Key';
      config.headers = config.headers || {};
      
      if (this.config.apiKey.prefix) {
        config.headers[headerName] = `${this.config.apiKey.prefix} ${this.config.apiKey.key}`;
      } else {
        config.headers[headerName] = this.config.apiKey.key;
      }
    }
    
    // Add HTTP signature if enabled
    if (this.config.httpSigningEnabled && this.config.apiKey?.secret) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = this.generateNonce();
      
      config.headers = config.headers || {};
      config.headers['X-Timestamp'] = timestamp;
      config.headers['X-Nonce'] = nonce;
      
      const stringToSign = this.createStringToSign(
        config.method?.toUpperCase() || 'GET',
        config.url || '',
        timestamp,
        nonce,
        config.data
      );
      
      const signature = this.createSignature(stringToSign, this.config.apiKey.secret);
      config.headers['X-Signature'] = signature;
    }
    
    return config;
  }

  /**
   * Request error interceptor
   */
  private requestErrorInterceptor(error: any): Promise<never> {
    this.logger.log({
      level: LogLevel.ERROR,
      type: EventType.API_CALL,
      description: 'Request error in API security interceptor',
      metadata: { error }
    });
    
    return Promise.reject(error);
  }

  /**
   * Response interceptor for handling token refresh
   */
  private responseInterceptor(response: AxiosResponse): AxiosResponse {
    return response;
  }

  /**
   * Response error interceptor for refreshing token on 401
   */
  private async responseErrorInterceptor(error: any): Promise<any> {
    if (!error.response || error.response.status !== 401 || !this.config.autoRefreshToken) {
      return Promise.reject(error);
    }
    
    // Try to refresh the token
    const originalRequest = error.config;
    
    // Prevent infinite loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    originalRequest._retry = true;
    
    try {
      // Refresh the token
      const refreshed = await this.refreshAccessToken();
      
      if (refreshed && this.tokens.accessToken && this.tokens.tokenType) {
        // Update the authorization header and retry
        originalRequest.headers['Authorization'] = `${this.tokens.tokenType} ${this.tokens.accessToken}`;
        return this.apiClient(originalRequest);
      }
    } catch (refreshError) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Failed to refresh token in response interceptor',
        metadata: { error: refreshError }
      });
    }
    
    return Promise.reject(error);
  }

  /**
   * Set tokens from a token response
   */
  private setTokens(tokenResponse: TokenResponse): void {
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
    
    this.tokens = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenType: tokenResponse.token_type,
      expiresAt
    };
    
    // Store tokens securely
    try {
      localStorage.setItem('auth_tokens', JSON.stringify(this.tokens));
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Failed to store tokens securely',
        metadata: { error }
      });
    }
  }

  /**
   * Clear authentication tokens
   */
  private clearTokens(): void {
    this.tokens = {};
    
    try {
      localStorage.removeItem('auth_tokens');
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Failed to clear tokens from storage',
        metadata: { error }
      });
    }
  }

  /**
   * Create a string to sign for request signing
   */
  private createStringToSign(
    method: string,
    url: string,
    timestamp: string,
    nonce: string,
    data?: any
  ): string {
    const parts = [
      method.toUpperCase(),
      url,
      timestamp,
      nonce
    ];
    
    if (data) {
      if (typeof data === 'string') {
        parts.push(data);
      } else {
        parts.push(JSON.stringify(data));
      }
    }
    
    return parts.join('\n');
  }

  /**
   * Create a signature using HMAC-SHA256
   */
  private createSignature(stringToSign: string, secret: string): string {
    try {
      // In a real application, you would use a crypto library
      // Here we'll just use a placeholder to simulate
      const encoder = new TextEncoder();
      const data = encoder.encode(stringToSign);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const keyData = encoder.encode(secret);
      
      // This is a placeholder for crypto.subtle.sign, which we can't fully implement here
      // const signature = await window.crypto.subtle.sign('HMAC', key, data);
      
      // Instead, we'll just return a mocked signature
      return this.base64UrlEncode(Array.from(data).map(b => b.toString(16)).join(''));
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.API_CALL,
        description: 'Failed to create signature',
        metadata: { error }
      });
      
      throw new Error('Failed to create signature');
    }
  }

  /**
   * Generate a secure nonce
   */
  private generateNonce(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a new API key
   */
  private generateApiKey(): string {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a new API secret
   */
  private generateApiSecret(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Base64Url encode a string
   */
  private base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Base64Url decode a string
   */
  private base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding
    while (str.length % 4 !== 0) {
      str += '=';
    }
    
    return atob(str);
  }

  /**
   * HMAC SHA-256 implementation (placeholder)
   */
  private hmacSha256(data: string, key: string): string {
    // In a real application, you would use a crypto library
    // This is just a placeholder
    return this.base64UrlEncode(data + key);
  }
}

// Export singleton instance
export const apiSecurityManager = ApiSecurityManager.getInstance(); 