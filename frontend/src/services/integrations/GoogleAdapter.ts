/**
 * Google Integration Adapter
 * 
 * Implements integration with Google services such as:
 * - Gmail
 * - Google Calendar
 * - Google Drive
 * - Google Contacts
 */

import { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  Connection,
  ConnectionStatus,
  SyncResult,
  Webhook,
  OAuthTokenResponse,
  } from '../../types/integration';
import { BaseIntegrationAdapter, BaseAdapterConfig } from './BaseIntegrationAdapter';
import { LogLevel, EventType } from '../../security/AuditLogger';

/**
 * Google user profile response
 */
interface GoogleUserProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

/**
 * Google adapter configuration
 */
interface GoogleAdapterConfig extends BaseAdapterConfig {
  userInfoEndpoint?: string;
  contactsSyncEnabled?: boolean;
  calendarSyncEnabled?: boolean;
  emailSyncEnabled?: boolean;
  driveSyncEnabled?: boolean;
}

/**
 * Google integration adapter implementation
 */
export class GoogleAdapter extends BaseIntegrationAdapter {
  private readonly userInfoEndpoint: string;
  private readonly contactsSyncEnabled: boolean;
  private readonly calendarSyncEnabled: boolean;
  private readonly emailSyncEnabled: boolean;
  private readonly driveSyncEnabled: boolean;
  
  /**
   * Create a new Google integration adapter
   */
  constructor(config: GoogleAdapterConfig) {
    super(config);
    
    this.userInfoEndpoint = config.userInfoEndpoint || 'https://www.googleapis.com/oauth2/v3/userinfo';
    this.contactsSyncEnabled = config.contactsSyncEnabled !== false;
    this.calendarSyncEnabled = config.calendarSyncEnabled !== false;
    this.emailSyncEnabled = config.emailSyncEnabled !== false;
    this.driveSyncEnabled = config.driveSyncEnabled !== false;
    
    // Ensure the integration is a Google provider
    if (this.integration.provider !== 'google') {
      throw new Error(`GoogleAdapter can only be used with Google integrations, got ${this.integration.provider}`);
    }
  }
  
  /**
   * Handle OAuth callback from Google
   */
  public async handleAuthCallback(code: string, state: string): Promise<Connection> {
    try {
      // Get PKCE verifier if PKCE is enabled
      let codeVerifier: string | null = null;
      if (this.integration.authConfig.pkceEnabled) {
        codeVerifier = this.getPKCEVerifier(state);
        if (!codeVerifier) {
          throw new Error('PKCE code verifier not found for state');
        }
      }
      
      // Exchange code for tokens
      const { tokenUrl, clientId, clientSecret, redirectUri } = this.integration.authConfig;
      
      const params = new URLSearchParams({
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });
      
      // Add PKCE verifier if enabled
      if (codeVerifier) {
        params.append('code_verifier', codeVerifier);
      }
      
      // Add client secret if provided
      if (clientSecret) {
        params.append('client_secret', clientSecret);
      }
      
      // Exchange code for tokens
      const response = await this.client.post<OAuthTokenResponse>(
        tokenUrl,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      // Get user profile
      const userProfile = await this.fetchUserProfile({
        id: 'temp',
        integrationId: this.integration.id,
        userId: '',
        accessToken: response.data.access_token,
        scopes: response.data.scope ? response.data.scope.split(' ') : [],
        expiresAt: Date.now() + (response.data.expires_in * 1000),
        createdAt: Date.now(),
        status: ConnectionStatus.CONNECTED
      });
      
      // Create connection
      const connection = this.createConnection(
        this.integration.id,
        '',
        response.data,
        userProfile.sub,
        userProfile.email
      );
      
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.INFO,
        description: `Google OAuth flow completed successfully for ${userProfile.email}`,
        metadata: { providerId: userProfile.sub }
      });
      
      return connection;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: 'Google OAuth callback failed',
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Fetch Google user profile
   */
  public async fetchUserProfile(connection: Connection): Promise<GoogleUserProfile> {
    try {
      const response = await this.client.get<GoogleUserProfile>(this.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.API_CALL,
        level: LogLevel.ERROR,
        description: 'Failed to fetch Google user profile',
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Synchronize data from Google services
   */
  public async syncData(connection: Connection, dataTypes?: string[]): Promise<SyncResult> {
    // Default data types if none specified
    const typesToSync = dataTypes && dataTypes.length > 0
      ? dataTypes
      : this.getDefaultDataTypes();
    
    const now = Date.now();
    
    // Initialize sync result
    const result: SyncResult = {
      connectionId: connection.id,
      syncedAt: now,
      progress: {
        total: typesToSync.length,
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        status: 'running',
        startedAt: now
      },
      newItems: 0,
      updatedItems: 0,
      deletedItems: 0,
      conflicts: 0,
      dataTypes: typesToSync
    };
    
    try {
      // Log the start of the sync
      this.auditLogger.log({
        type: EventType.SYNC_STARTED,
        level: LogLevel.INFO,
        description: `Started Google data sync for ${connection.id}`,
        userId: connection.userId,
        metadata: { dataTypes: typesToSync }
      });
      
      // Sync each data type
      for (const dataType of typesToSync) {
        try {
          const typeResult = await this.syncDataType(connection, dataType);
          
          // Update sync result
          result.newItems += typeResult.newItems;
          result.updatedItems += typeResult.updatedItems;
          result.deletedItems += typeResult.deletedItems;
          result.conflicts += typeResult.conflicts;
          
          // Update progress
          result.progress.processed++;
          result.progress.succeeded++;
        } catch (error) {
          // Update progress on error
          result.progress.processed++;
          result.progress.failed++;
          
          this.auditLogger.log({
            type: EventType.SYNC_FAILED,
            level: LogLevel.ERROR,
            description: `Failed to sync ${dataType} data for Google connection ${connection.id}`,
            userId: connection.userId,
            metadata: { error: (error as Error).message }
          });
        }
      }
      
      // Update result status
      result.progress.status = 'completed';
      result.progress.completedAt = Date.now();
      
      this.auditLogger.log({
        type: EventType.SYNC_COMPLETED,
        level: LogLevel.INFO,
        description: `Completed Google data sync for ${connection.id}`,
        userId: connection.userId,
        metadata: {
          newItems: result.newItems,
          updatedItems: result.updatedItems,
          deletedItems: result.deletedItems,
          conflicts: result.conflicts
        }
      });
      
      return result;
    } catch (error) {
      // Update result status
      result.progress.status = 'failed';
      result.progress.completedAt = Date.now();
      result.progress.error = (error as Error).message;
      
      this.auditLogger.log({
        type: EventType.SYNC_FAILED,
        level: LogLevel.ERROR,
        description: `Google data sync failed for ${connection.id}`,
        userId: connection.userId,
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Register a webhook with Google
   */
  public async registerWebhook(connection: Connection, events: string[]): Promise<Webhook> {
    // Google Cloud Pub/Sub or Push Notifications would be implemented here
    // For demonstration purposes, we'll create a mock webhook
    const webhook: Webhook = {
      id: uuidv4(),
      connectionId: connection.id,
      url: `https://api.example.com/webhooks/google/${connection.id}`,
      events,
      secret: this.generateRandomString(32),
      active: true,
      createdAt: Date.now(),
      failureCount: 0
    };
    
    this.auditLogger.log({
      type: EventType.WEBHOOK_REGISTERED,
      level: LogLevel.INFO,
      description: `Registered Google webhook for ${connection.id}`,
      userId: connection.userId,
      metadata: { events }
    });
    
    return webhook;
  }
  
  /**
   * Unregister a webhook with Google
   */
  public async unregisterWebhook(webhook: Webhook): Promise<boolean> {
    // Google Cloud Pub/Sub or Push Notifications would be implemented here
    // For demonstration purposes, we'll just return success
    
    this.auditLogger.log({
      type: EventType.WEBHOOK_REGISTERED,
      level: LogLevel.INFO,
      description: `Unregistered Google webhook ${webhook.id}`,
      metadata: { events: webhook.events }
    });
    
    return true;
  }
  
  /**
   * Get default data types to sync
   */
  private getDefaultDataTypes(): string[] {
    const dataTypes = [];
    
    if (this.contactsSyncEnabled) {
      dataTypes.push('contacts');
    }
    
    if (this.calendarSyncEnabled) {
      dataTypes.push('calendar');
    }
    
    if (this.emailSyncEnabled) {
      dataTypes.push('gmail');
    }
    
    if (this.driveSyncEnabled) {
      dataTypes.push('drive');
    }
    
    return dataTypes;
  }
  
  /**
   * Sync a specific data type
   */
  private async syncDataType(
    connection: Connection,
    dataType: string
  ): Promise<{
    newItems: number;
    updatedItems: number;
    deletedItems: number;
    conflicts: number;
  }> {
    // Implementation would depend on the data type
    switch (dataType) {
      case 'contacts':
        return this.syncContacts(connection);
      case 'calendar':
        return this.syncCalendar(connection);
      case 'gmail':
        return this.syncGmail(connection);
      case 'drive':
        return this.syncDrive(connection);
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
  }
  
  /**
   * Sync Google contacts
   */
  private async syncContacts(connection: Connection): Promise<{
    newItems: number;
    updatedItems: number;
    deletedItems: number;
    conflicts: number;
  }> {
    // Implementation would integrate with Google People API
    // For demonstration purposes, we'll return mock data
    return {
      newItems: 5,
      updatedItems: 10,
      deletedItems: 2,
      conflicts: 0
    };
  }
  
  /**
   * Sync Google calendar
   */
  private async syncCalendar(connection: Connection): Promise<{
    newItems: number;
    updatedItems: number;
    deletedItems: number;
    conflicts: number;
  }> {
    // Implementation would integrate with Google Calendar API
    // For demonstration purposes, we'll return mock data
    return {
      newItems: 3,
      updatedItems: 7,
      deletedItems: 1,
      conflicts: 0
    };
  }
  
  /**
   * Sync Gmail
   */
  private async syncGmail(connection: Connection): Promise<{
    newItems: number;
    updatedItems: number;
    deletedItems: number;
    conflicts: number;
  }> {
    // Implementation would integrate with Gmail API
    // For demonstration purposes, we'll return mock data
    return {
      newItems: 15,
      updatedItems: 5,
      deletedItems: 0,
      conflicts: 0
    };
  }
  
  /**
   * Sync Google Drive
   */
  private async syncDrive(connection: Connection): Promise<{
    newItems: number;
    updatedItems: number;
    deletedItems: number;
    conflicts: number;
  }> {
    // Implementation would integrate with Google Drive API
    // For demonstration purposes, we'll return mock data
    return {
      newItems: 8,
      updatedItems: 12,
      deletedItems: 3,
      conflicts: 1
    };
  }
  
  /**
   * Add authorization header to outgoing requests
   */
  protected async authInterceptor(
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> {
    // If config already has an Authorization header, use it
    if (config.headers && config.headers.Authorization) {
      return config;
    }
    
    // For requests to Google APIs, add the token
    if (config.url && (
      config.url.includes('googleapis.com') || 
      config.url === this.userInfoEndpoint
    )) {
      // Get connection ID from request context (this would be added in executeEndpoint)
      const connectionId = (config as any).connectionId;
      
      if (connectionId) {
        // In a real implementation, we would fetch the connection and add the token
        // For demonstration, we'll just use the token if it's already in the config
        if ((config as any).accessToken) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${(config as any).accessToken}`
          } as AxiosRequestHeaders;
        }
      }
    }
    
    return config;
  }
} 