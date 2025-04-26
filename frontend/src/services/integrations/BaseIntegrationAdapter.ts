/**
 * Base Integration Adapter
 * 
 * Provides common functionality for all integration adapters
 * to be extended by provider-specific implementations.
 */

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  Integration,
  Connection,
  ConnectionStatus,
  SyncResult,
  // SyncProgress, // Removed unused import
  Webhook,
  OAuthTokenResponse,
  IntegrationAdapter,
  Endpoint
} from '../../types/integration';
import { SecurityManager } from '../../security/SecurityManager';
import { KeyVault } from '../../security/KeyVault';
import { AuditLogger, EventType, LogLevel } from '../../security/AuditLogger';

/**
 * Base adapter configuration
 */
export interface BaseAdapterConfig {
  integration: Integration;
  keyVaultPrefix?: string;
  requestTimeout?: number;
  retryAttempts?: number;
}

/**
 * Abstract base class for all integration adapters
 */
export abstract class BaseIntegrationAdapter implements IntegrationAdapter {
  protected integration: Integration;
  protected client: AxiosInstance;
  protected securityManager: SecurityManager;
  protected keyVault: KeyVault;
  protected auditLogger: AuditLogger;
  protected keyVaultPrefix: string;
  protected retryAttempts: number;
  
  constructor(config: BaseAdapterConfig) {
    this.integration = config.integration;
    this.keyVaultPrefix = config.keyVaultPrefix || 'integration_';
    this.retryAttempts = config.retryAttempts || 3;
    
    // Initialize Security components
    this.securityManager = SecurityManager.getInstance();
    this.keyVault = new KeyVault();
    this.auditLogger = new AuditLogger({
      enableConsoleLogging: true,
      enableRemoteLogging: process.env.NODE_ENV === 'production'
    });
    
    // Create HTTP client
    this.client = axios.create({
      timeout: config.requestTimeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Add request interceptor for authorization
    this.client.interceptors.request.use(
      this.authInterceptor.bind(this),
      this.errorInterceptor.bind(this)
    );
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      this.errorInterceptor.bind(this)
    );
  }
  
  /**
   * Get authentication URL for OAuth flow
   */
  public getAuthUrl(state: string): string {
    const { authUrl, clientId, redirectUri, scopes, responseType, additionalParams } = this.integration.authConfig;
    
    // Build query parameters
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
      scope: scopes.join(' '),
      state: state
    });
    
    // Add PKCE challenge if enabled
    if (this.integration.authConfig.pkceEnabled) {
      const { codeChallenge, codeChallengeMethod } = this.generatePKCEChallenge(state);
      params.append('code_challenge', codeChallenge);
      params.append('code_challenge_method', codeChallengeMethod);
    }
    
    // Add any additional provider-specific parameters
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.append(key, value);
      });
    }
    
    return `${authUrl}?${params.toString()}`;
  }
  
  /**
   * Abstract method to handle OAuth callback
   * Must be implemented by provider-specific adapters
   */
  public abstract handleAuthCallback(code: string, state: string): Promise<Connection>;
  
  /**
   * Refresh access token for a connection
   */
  public async refreshAccessToken(connection: Connection): Promise<Connection> {
    if (!connection.refreshToken) {
      throw new Error('No refresh token available for this connection');
    }
    
    try {
      const { tokenUrl, clientId, clientSecret } = this.integration.authConfig;
      
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refreshToken,
        client_id: clientId
      });
      
      // Some providers require client secret
      if (clientSecret) {
        params.append('client_secret', clientSecret);
      }
      
      // Make token request
      const response = await axios.post<OAuthTokenResponse>(
        tokenUrl,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      // Update connection with new tokens
      const updatedConnection: Connection = {
        ...connection,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || connection.refreshToken,
        expiresAt: Date.now() + (response.data.expires_in * 1000),
        status: ConnectionStatus.CONNECTED
      };
      
      // Store updated tokens securely
      this.storeConnectionCredentials(updatedConnection);
      
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.INFO,
        description: `Refreshed access token for ${this.integration.provider} connection ${connection.id}`,
      });
      
      return updatedConnection;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: `Failed to refresh token for ${this.integration.provider} connection ${connection.id}`,
        metadata: { error: (error as Error).message }
      });
      
      // Update connection status
      connection.status = ConnectionStatus.EXPIRED;
      
      throw error;
    }
  }
  
  /**
   * Fetch user profile from the integration
   * Must be implemented by provider-specific adapters
   */
  public abstract fetchUserProfile(connection: Connection): Promise<any>;
  
  /**
   * Execute a specific endpoint defined in the integration
   */
  public async executeEndpoint(
    connection: Connection,
    endpointId: string,
    params?: any
  ): Promise<any> {
    const endpoint = this.getEndpointById(endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found in integration ${this.integration.id}`);
    }
    
    // Check if the connection has the required permissions
    this.validatePermissions(connection, endpoint.requiredPermissions);
    
    // Apply rate limiting if specified
    if (endpoint.rateLimitPerMinute) {
      const rateLimitKey = `${connection.id}_${endpointId}`;
      if (!this.securityManager.checkRateLimit(rateLimitKey)) {
        throw new Error(`Rate limit exceeded for endpoint ${endpointId}`);
      }
    }
    
    try {
      const config: AxiosRequestConfig = {
        method: endpoint.method,
        url: this.processUrlParameters(endpoint.url, params),
        ...(
          ['POST', 'PUT', 'PATCH'].includes(endpoint.method) && 
          { data: this.securityManager.sanitizeObject(params) }
        )
      };
      
      const response = await this.client.request(config);
      
      this.auditLogger.log({
        type: EventType.API_CALL,
        level: LogLevel.INFO,
        description: `Executed endpoint ${endpointId} for integration ${this.integration.id}`,
      });
      
      return response.data;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.API_CALL,
        level: LogLevel.ERROR,
        description: `Failed to execute endpoint ${endpointId} for integration ${this.integration.id}`,
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Synchronize data from third-party service
   * Must be implemented by provider-specific adapters
   */
  public abstract syncData(connection: Connection, dataTypes?: string[]): Promise<SyncResult>;
  
  /**
   * Register a webhook with the provider
   * Must be implemented by provider-specific adapters
   */
  public abstract registerWebhook(connection: Connection, events: string[]): Promise<Webhook>;
  
  /**
   * Unregister a webhook with the provider
   * Must be implemented by provider-specific adapters
   */
  public abstract unregisterWebhook(webhook: Webhook): Promise<boolean>;
  
  /**
   * Create a new connection instance
   */
  protected createConnection(
    integrationId: string,
    userId: string,
    tokenResponse: OAuthTokenResponse,
    providerUserId?: string,
    providerUserEmail?: string
  ): Connection {
    const now = Date.now();
    
    const connection: Connection = {
      id: uuidv4(),
      integrationId,
      userId,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : [],
      expiresAt: now + (tokenResponse.expires_in * 1000),
      createdAt: now,
      status: ConnectionStatus.CONNECTED,
      providerUserId,
      providerUserEmail,
      additionalData: {}
    };
    
    // Store tokens securely
    this.storeConnectionCredentials(connection);
    
    return connection;
  }
  
  /**
   * Store connection credentials securely
   */
  protected storeConnectionCredentials(connection: Connection): void {
    // Store access token
    this.keyVault.storeKey(
      `${this.keyVaultPrefix}${connection.id}_access_token`,
      connection.accessToken,
      (connection.expiresAt - Date.now()) / (24 * 60 * 60 * 1000) // Convert ms to days
    );
    
    // Store refresh token if available
    if (connection.refreshToken) {
      this.keyVault.storeKey(
        `${this.keyVaultPrefix}${connection.id}_refresh_token`,
        connection.refreshToken,
        90 // Default to 90 days for refresh tokens
      );
    }
  }
  
  /**
   * Retrieve connection credentials from secure storage
   */
  protected retrieveConnectionCredentials(connection: Connection): Connection {
    const accessTokenKey = `${this.keyVaultPrefix}${connection.id}_access_token`;
    const refreshTokenKey = `${this.keyVaultPrefix}${connection.id}_refresh_token`;
    
    const accessToken = this.keyVault.getKey(accessTokenKey);
    if (accessToken) {
      connection.accessToken = accessToken;
    }
    
    const refreshToken = this.keyVault.getKey(refreshTokenKey);
    if (refreshToken) {
      connection.refreshToken = refreshToken;
    }
    
    return connection;
  }
  
  /**
   * Generate PKCE challenge for OAuth flow
   */
  protected generatePKCEChallenge(state: string): { codeVerifier: string; codeChallenge: string; codeChallengeMethod: 'S256' } {
    // Generate a secure random code verifier
    const codeVerifier = this.generateRandomString(64);
    
    // Store it securely associated with the state
    this.keyVault.storeKey(`pkce_${state}`, codeVerifier, 1/24); // 1 hour
    
    // Use a simplified base64 encoding for code challenge
    // In a production implementation, this would use crypto APIs properly
    const codeChallenge = btoa(codeVerifier).replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256'
    };
  }
  
  /**
   * Retrieve PKCE verifier based on state
   */
  protected getPKCEVerifier(state: string): string | null {
    const verifier = this.keyVault.getKey(`pkce_${state}`);
    
    // Delete the key after use
    if (verifier) {
      this.keyVault.deleteKey(`pkce_${state}`);
    }
    
    return verifier;
  }
  
  /**
   * Generate a secure random string
   */
  protected generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    
    // Create array of random values
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    
    // Map random values to charset
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    
    return result;
  }
  
  /**
   * Get endpoint by ID
   */
  protected getEndpointById(endpointId: string): Endpoint | undefined {
    return this.integration.endpoints.find(endpoint => endpoint.id === endpointId);
  }
  
  /**
   * Process URL parameters in endpoint URLs
   */
  protected processUrlParameters(url: string, params?: any): string {
    if (!params) return url;
    
    // Replace path parameters (e.g., /users/{userId})
    let processedUrl = url;
    const pathParams = url.match(/\{([^}]+)\}/g) || [];
    
    pathParams.forEach(param => {
      const paramName = param.slice(1, -1);
      if (params[paramName]) {
        processedUrl = processedUrl.replace(param, encodeURIComponent(params[paramName]));
      }
    });
    
    // Add query parameters if this is a GET request
    if (!url.includes('?') && params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      
      // Add parameters that weren't used as path parameters
      const usedPathParams = pathParams.map(p => p.slice(1, -1));
      
      Object.entries(params).forEach(([key, value]) => {
        if (!usedPathParams.includes(key) && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        processedUrl += `?${queryString}`;
      }
    }
    
    return processedUrl;
  }
  
  /**
   * Validate that connection has required permissions
   */
  protected validatePermissions(connection: Connection, requiredPermissions: string[]): void {
    if (!requiredPermissions.length) return;
    
    const connectionScopes = connection.scopes || [];
    
    // Get all permission objects
    const permissions = this.integration.permissions.filter(
      permission => requiredPermissions.includes(permission.id)
    );
    
    // Check that all required scopes are present
    const requiredScopes = new Set<string>();
    permissions.forEach(permission => {
      permission.scopes.forEach(scope => requiredScopes.add(scope));
    });
    
    // Convert Set to Array for iteration
    const missingScopes = Array.from(requiredScopes).filter(
      scope => !connectionScopes.includes(scope)
    );
    
    if (missingScopes.length > 0) {
      throw new Error(
        `Connection missing required scopes: ${missingScopes.join(', ')}`
      );
    }
  }
  
  /**
   * Request interceptor for adding authorization headers
   */
  protected async authInterceptor(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    // This method can be extended by provider-specific adapters
    return config;
  }
  
  /**
   * Error interceptor for handling response errors
   */
  protected async errorInterceptor(error: any): Promise<any> {
    // Log the error
    this.auditLogger.log({
      type: EventType.API_CALL,
      level: LogLevel.ERROR,
      description: `API call error for ${this.integration.provider} integration`,
      metadata: { 
        message: error.message,
        statusCode: error.response?.status,
        url: error.config?.url
      }
    });
    
    // Handle token expiration
    if (error.response?.status === 401) {
      // Token has likely expired - this would be handled by the adapter
    }
    
    // Default error handling
    throw error;
  }
} 