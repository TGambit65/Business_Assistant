/**
 * Integration Manager Service
 * 
 * Manages third-party service integrations with:
 * - Provider registration and discovery
 * - Authentication and connection management
 * - Data synchronization
 * - Webhook management
 * - Security compliance
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Integration,
  Connection,
  ConnectionStatus,
  SyncResult,
  SyncProgress,
  Webhook,
  IntegrationService,
  IntegrationAdapter,
  IntegrationProvider
} from '../types/integration';
import { AuditLogger, EventType, LogLevel } from '../security/AuditLogger';
import { SecurityManager } from '../security/SecurityManager';
// import { User } from '../types/user'; // Removed unused import
import { getCurrentUserId, getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';

// Constants
// const AUTH_CALLBACK_URL = '/auth/callback'; // Removed unused constant

/**
 * Configuration options for the Integration Manager
 */
interface IntegrationManagerConfig {
  enabledProviders?: IntegrationProvider[];
  autoRefreshTokens?: boolean;
  connectionStorageKey?: string;
}

/**
 * Implementation of the Integration Manager Service
 * 
 * Acts as a central registry and orchestrator for all integrations
 */
export class IntegrationManager implements IntegrationService {
  private static instance: IntegrationManager;
  
  private readonly integrations: Map<string, Integration> = new Map();
  private readonly connections: Map<string, Connection> = new Map();
  private readonly adapters: Map<string, IntegrationAdapter> = new Map();
  private readonly syncProgress: Map<string, SyncProgress> = new Map();
  private readonly webhooks: Map<string, Webhook[]> = new Map();
  
  private readonly config: IntegrationManagerConfig;
  private readonly auditLogger: AuditLogger;
  private readonly securityManager: SecurityManager;
  private readonly storage: Storage | null;
  
  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(config: IntegrationManagerConfig = {}) {
    this.config = {
      enabledProviders: ['google', 'microsoft', 'slack', 'zoom', 'trello'],
      autoRefreshTokens: true,
      connectionStorageKey: STORAGE_KEYS.INTEGRATION_CONNECTIONS,
      ...config
    };
    
    this.auditLogger = new AuditLogger({
      enableConsoleLogging: true,
      enableRemoteLogging: process.env.NODE_ENV === 'production'
    });
    
    this.securityManager = SecurityManager.getInstance();
    this.storage = typeof localStorage !== 'undefined' ? localStorage : null;
    
    // Load saved connections from storage
    this.loadConnections();
    
    // Register available integrations
    this.registerDefaultIntegrations();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(config?: IntegrationManagerConfig): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager(config);
    }
    return IntegrationManager.instance;
  }
  
  /**
   * Initiate the OAuth flow for a specific integration type
   * This simplifies the connection process for users
   * 
   * @param integrationType The type identifier of the integration (e.g., 'google')
   * @param userId The user ID initiating the connection
   * @returns void - redirects the user to the OAuth provider's authorization page
   */
  public async initiateOAuthFlow(integrationType: string, userId?: string): Promise<void> {
    try {
      // Find the integration by type
      const integration = Array.from(this.integrations.values()).find(
        int => int.provider === integrationType
      );
      
      if (!integration) {
        throw new Error(`Integration provider '${integrationType}' not found`);
      }
      
      // Get current user ID if not provided
      const currentUser = userId || getCurrentUserId();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Connect to the service - this generates a pending connection
      const connection = await this.connectService(integration.id, currentUser);
      
      // Redirect to the auth URL
      if (connection.additionalData?.authUrl) {
        window.location.href = connection.additionalData.authUrl;
      } else {
        throw new Error('Failed to generate authentication URL');
      }
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: `Failed to initiate OAuth flow for ${integrationType}`,
        userId: userId || 'unknown',
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Get all available integrations that can be connected
   * This method is used by the UI to display available integration options
   */
  public async getAvailableIntegrations(): Promise<Integration[]> {
    return this.listAvailableIntegrations();
  }
  
  /**
   * Get all user's connected integrations
   * This method is used by the UI to display the user's active integrations
   */
  public async getUserIntegrations(userId?: string): Promise<Connection[]> {
    const currentUser = userId || getCurrentUserId();
    
    if (!currentUser) {
      return [];
    }
    
    return this.getUserConnections(currentUser);
  }
  
  /**
   * Disconnect a specific integration for a user
   */
  public async disconnectIntegration(connectionId: string): Promise<boolean> {
    return this.disconnectService(connectionId);
  }
  
  /**
   * Register a new integration
   */
  public registerIntegration(integration: Integration, adapter: IntegrationAdapter): void {
    if (this.integrations.has(integration.id)) {
      throw new Error(`Integration with ID ${integration.id} is already registered`);
    }
    
    // Ensure the integration is valid
    this.validateIntegration(integration);
    
    // Store the integration and its adapter
    this.integrations.set(integration.id, integration);
    this.adapters.set(integration.id, adapter);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: `Registered integration: ${integration.name} (${integration.provider})`,
    });
  }
  
  /**
   * Get a list of all available integrations
   */
  public async listAvailableIntegrations(): Promise<Integration[]> {
    return Array.from(this.integrations.values())
      .filter(integration => integration.enabled)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  
  /**
   * Get integration by ID
   */
  public async getIntegration(integrationId: string): Promise<Integration | null> {
    return this.integrations.get(integrationId) || null;
  }
  
  /**
   * Connect a user to a third-party service
   */
  public async connectService(integrationId: string, userId: string): Promise<Connection> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    if (!integration.enabled) {
      throw new Error(`Integration ${integration.name} is disabled`);
    }
    
    const adapter = this.adapters.get(integrationId);
    if (!adapter) {
      throw new Error(`Adapter for integration ${integrationId} not found`);
    }
    
    // Generate state parameter for OAuth
    const state = uuidv4();
    
    // Get the authentication URL
    const authUrl = adapter.getAuthUrl(state);
    
    // The actual connection will be completed in the OAuth callback
    // Here we just return a pending connection
    const pendingConnection: Connection = {
      id: `pending_${state}`,
      integrationId,
      userId,
      accessToken: '',
      scopes: [],
      expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour expiry for pending connections
      createdAt: Date.now(),
      status: ConnectionStatus.PENDING,
      additionalData: { state, authUrl }
    };
    
    // Store the pending connection
    this.connections.set(pendingConnection.id, pendingConnection);
    
    this.auditLogger.log({
      type: EventType.AUTHENTICATION,
      level: LogLevel.INFO,
      description: `Started OAuth flow for ${integration.name}`,
      userId,
    });
    
    return pendingConnection;
  }
  
  /**
   * Handle OAuth callback from third-party service
   */
  public async handleAuthCallback(code: string, state: string, userId: string): Promise<Connection> {
    // Find the pending connection with this state
    const pendingId = `pending_${state}`;
    const pendingConnection = this.connections.get(pendingId);
    
    if (!pendingConnection) {
      throw new Error('Invalid or expired OAuth state parameter');
    }
    
    // Verify user ID
    if (pendingConnection.userId !== userId) {
      throw new Error('User ID mismatch in OAuth callback');
    }
    
    const integration = await this.getIntegration(pendingConnection.integrationId);
    if (!integration) {
      throw new Error(`Integration not found for pending connection`);
    }
    
    const adapter = this.adapters.get(integration.id);
    if (!adapter) {
      throw new Error(`Adapter not found for ${integration.name}`);
    }
    
    try {
      // Process the callback with the adapter
      const connection = await adapter.handleAuthCallback(code, state);
      
      // Add userId to ensure it's set
      connection.userId = userId;
      
      // Delete the pending connection
      this.connections.delete(pendingId);
      
      // Store the completed connection
      this.connections.set(connection.id, connection);
      this.persistConnections();
      
      this.auditLogger.log({
        type: EventType.INTEGRATION_CONNECTED,
        level: LogLevel.INFO,
        description: `Connected to ${integration.name}`,
        userId: connection.userId,
      });
      
      return connection;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: `OAuth callback failed for ${integration.name}`,
        userId,
        metadata: { error: (error as Error).message }
      });
      
      // Delete the pending connection
      this.connections.delete(pendingId);
      
      throw error;
    }
  }
  
  /**
   * Disconnect user from a third-party service
   */
  public async disconnectService(connectionId: string): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    
    const integration = await this.getIntegration(connection.integrationId);
    if (!integration) {
      throw new Error(`Integration not found for connection ${connectionId}`);
    }
    
    try {
      // If there are any webhooks, unregister them
      const connWebhooks = this.webhooks.get(connectionId) || [];
      for (const webhook of connWebhooks) {
        try {
          await this.unregisterWebhook(webhook.id);
        } catch (e) {
          // Log but continue with disconnection
          console.warn(`Failed to unregister webhook ${webhook.id}:`, e);
        }
      }
      
      // Update connection status
      connection.status = ConnectionStatus.DISCONNECTED;
      connection.additionalData = {
        ...connection.additionalData,
        disconnectedAt: Date.now()
      };
      
      // Remove from active connections, but keep the data for reference
      this.persistConnections();
      
      this.auditLogger.log({
        type: EventType.INTEGRATION_DISCONNECTED,
        level: LogLevel.INFO,
        description: `Disconnected from ${integration.name}`,
        userId: connection.userId,
      });
      
      return true;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.INTEGRATION_DISCONNECTED,
        level: LogLevel.ERROR,
        description: `Failed to disconnect from ${integration.name}`,
        userId: connection.userId,
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Refresh a connection's access token
   */
  public async refreshConnection(connectionId: string): Promise<Connection> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    
    if (connection.status !== ConnectionStatus.CONNECTED && 
        connection.status !== ConnectionStatus.EXPIRED) {
      throw new Error(`Connection ${connectionId} is not in a valid state for refresh`);
    }
    
    const adapter = this.adapters.get(connection.integrationId);
    if (!adapter) {
      throw new Error(`Adapter not found for connection ${connectionId}`);
    }
    
    try {
      // Refresh the token
      const refreshedConnection = await adapter.refreshAccessToken(connection);
      
      // Update connection in the registry
      this.connections.set(connectionId, refreshedConnection);
      this.persistConnections();
      
      return refreshedConnection;
    } catch (error) {
      // Mark connection as expired
      connection.status = ConnectionStatus.EXPIRED;
      this.connections.set(connectionId, connection);
      this.persistConnections();
      
      this.auditLogger.log({
        type: EventType.AUTHENTICATION,
        level: LogLevel.ERROR,
        description: `Failed to refresh token for connection ${connectionId}`,
        userId: connection.userId,
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Get all active connections for a user
   */
  public async getUserConnections(userId: string): Promise<Connection[]> {
    return Array.from(this.connections.values())
      .filter(conn => conn.userId === userId && conn.status !== ConnectionStatus.PENDING);
  }
  
  /**
   * Synchronize data from a third-party service
   */
  public async syncData(connectionId: string, dataTypes?: string[]): Promise<SyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    
    if (connection.status !== ConnectionStatus.CONNECTED) {
      throw new Error(`Connection ${connectionId} is not in a connected state`);
    }
    
    const adapter = this.adapters.get(connection.integrationId);
    if (!adapter) {
      throw new Error(`Adapter not found for connection ${connectionId}`);
    }
    
    // Initialize sync progress
    const initialProgress: SyncProgress = {
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      status: 'running',
      startedAt: Date.now()
    };
    
    this.syncProgress.set(connectionId, initialProgress);
    
    this.auditLogger.log({
      type: EventType.SYNC_STARTED,
      level: LogLevel.INFO,
      description: `Started data sync for connection ${connectionId}`,
      userId: connection.userId,
      metadata: { dataTypes }
    });
    
    try {
      // Start the sync
      const result = await adapter.syncData(connection, dataTypes);
      
      // Update last sync timestamp
      connection.lastSyncAt = Date.now();
      this.connections.set(connectionId, connection);
      this.persistConnections();
      
      // Update sync progress
      const progress = this.syncProgress.get(connectionId) || initialProgress;
      progress.status = 'completed';
      progress.completedAt = Date.now();
      this.syncProgress.set(connectionId, progress);
      
      this.auditLogger.log({
        type: EventType.SYNC_COMPLETED,
        level: LogLevel.INFO,
        description: `Completed data sync for connection ${connectionId}`,
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
      // Update sync progress with error
      const progress = this.syncProgress.get(connectionId) || initialProgress;
      progress.status = 'failed';
      progress.completedAt = Date.now();
      progress.error = (error as Error).message;
      this.syncProgress.set(connectionId, progress);
      
      this.auditLogger.log({
        type: EventType.SYNC_FAILED,
        level: LogLevel.ERROR,
        description: `Failed data sync for connection ${connectionId}`,
        userId: connection.userId,
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Get the status of a data synchronization
   */
  public async getSyncStatus(connectionId: string): Promise<SyncProgress> {
    const progress = this.syncProgress.get(connectionId);
    if (!progress) {
      return {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0, 
        skipped: 0,
        status: 'idle'
      };
    }
    return progress;
  }
  
  /**
   * Register a webhook for a connection
   */
  public async registerWebhook(connectionId: string, events: string[]): Promise<Webhook> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    
    if (connection.status !== ConnectionStatus.CONNECTED) {
      throw new Error(`Connection ${connectionId} is not in a connected state`);
    }
    
    const adapter = this.adapters.get(connection.integrationId);
    if (!adapter) {
      throw new Error(`Adapter not found for connection ${connectionId}`);
    }
    
    try {
      // Create webhook through the adapter
      const webhook = await adapter.registerWebhook(connection, events);
      
      // Store webhook
      const connectionWebhooks = this.webhooks.get(connectionId) || [];
      connectionWebhooks.push(webhook);
      this.webhooks.set(connectionId, connectionWebhooks);
      
      this.auditLogger.log({
        type: EventType.WEBHOOK_REGISTERED,
        level: LogLevel.INFO,
        description: `Registered webhook for connection ${connectionId}`,
        userId: connection.userId,
        metadata: { events }
      });
      
      return webhook;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.WEBHOOK_REGISTERED,
        level: LogLevel.ERROR,
        description: `Failed to register webhook for connection ${connectionId}`,
        userId: connection.userId,
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * Unregister a webhook
   */
  public async unregisterWebhook(webhookId: string): Promise<boolean> {
    // Find the webhook by ID
    let foundWebhook: Webhook | undefined;
    let foundConnectionId: string | undefined;
    
    // Convert Map entries to array and iterate
    Array.from(this.webhooks.entries()).forEach(([connectionId, webhooks]) => {
      const webhook = webhooks.find((wh: Webhook) => wh.id === webhookId);
      if (webhook) {
        foundWebhook = webhook;
        foundConnectionId = connectionId;
      }
    });
    
    if (!foundWebhook || !foundConnectionId) {
      throw new Error(`Webhook ${webhookId} not found`);
    }
    
    const connection = this.connections.get(foundConnectionId);
    if (!connection) {
      throw new Error(`Connection for webhook ${webhookId} not found`);
    }
    
    const adapter = this.adapters.get(connection.integrationId);
    if (!adapter) {
      throw new Error(`Adapter not found for webhook ${webhookId}`);
    }
    
    try {
      // Unregister webhook through the adapter
      const result = await adapter.unregisterWebhook(foundWebhook);
      
      if (result) {
        // Remove webhook from the registry
        const webhooks = this.webhooks.get(foundConnectionId) || [];
        const updatedWebhooks = webhooks.filter((wh: Webhook) => wh.id !== webhookId);
        this.webhooks.set(foundConnectionId, updatedWebhooks);
      }
      
      return result;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.WEBHOOK_REGISTERED,
        level: LogLevel.ERROR,
        description: `Failed to unregister webhook ${webhookId}`,
        userId: connection.userId,
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  /**
   * List all webhooks for a connection
   */
  public async listWebhooks(connectionId: string): Promise<Webhook[]> {
    return this.webhooks.get(connectionId) || [];
  }
  
  /**
   * Execute a specific endpoint with a connection
   */
  public async executeEndpoint(
    connectionId: string,
    endpointId: string,
    params?: any
  ): Promise<any> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    
    if (connection.status !== ConnectionStatus.CONNECTED) {
      // Auto-refresh connection if possible
      if (this.config.autoRefreshTokens && 
          connection.status === ConnectionStatus.EXPIRED &&
          connection.refreshToken) {
        await this.refreshConnection(connectionId);
      } else {
        throw new Error(`Connection ${connectionId} is not in a connected state`);
      }
    }
    
    const adapter = this.adapters.get(connection.integrationId);
    if (!adapter) {
      throw new Error(`Adapter not found for connection ${connectionId}`);
    }
    
    return adapter.executeEndpoint(connection, endpointId, params);
  }
  
  /**
   * Handle webhook event from a third-party service
   */
  public async handleWebhookEvent(
    webhookId: string,
    event: string,
    payload: any
  ): Promise<void> {
    // Find the webhook
    let foundWebhook: Webhook | undefined;
    let foundConnectionId: string | undefined;
    
    // Convert Map entries to array and iterate
    Array.from(this.webhooks.entries()).forEach(([connectionId, webhooks]) => {
      const webhook = webhooks.find((wh: Webhook) => wh.id === webhookId);
      if (webhook) {
        foundWebhook = webhook;
        foundConnectionId = connectionId;
      }
    });
    
    if (!foundWebhook || !foundConnectionId) {
      throw new Error(`Webhook ${webhookId} not found`);
    }
    
    const connection = this.connections.get(foundConnectionId);
    if (!connection) {
      throw new Error(`Connection for webhook ${webhookId} not found`);
    }
    
    // Verify that the webhook is configured to handle this event
    if (!foundWebhook.events.includes(event)) {
      throw new Error(`Webhook ${webhookId} is not configured for event ${event}`);
    }
    
    // Update webhook metadata
    foundWebhook.lastTriggeredAt = Date.now();
    const webhooks = this.webhooks.get(foundConnectionId) || [];
    const updatedWebhooks = webhooks.map((wh: Webhook) => wh.id === webhookId ? foundWebhook! : wh);
    this.webhooks.set(foundConnectionId, updatedWebhooks);
    
    // Log the event
    this.auditLogger.log({
      type: EventType.WEBHOOK_TRIGGERED,
      level: LogLevel.INFO,
      description: `Webhook ${webhookId} triggered for event ${event}`,
      userId: connection.userId,
      metadata: { event }
    });
    
    // Process the payload based on the event type
    // This would typically dispatch to event handlers
    this.processWebhookPayload(connection, foundWebhook, event, payload);
  }
  
  /**
   * Process a webhook payload from a third-party service
   * This is a placeholder for integration-specific logic
   */
  private processWebhookPayload(
    connection: Connection,
    webhook: Webhook,
    event: string,
    payload: any
  ): void {
    // This would be implemented based on specific integration requirements
    console.log(`Processing webhook ${webhook.id} for ${event}`);
    
    // Example: dispatch events to handlers
    // EventBus.dispatch(`integration:${connection.integrationId}:${event}`, payload);
  }
  
  /**
   * Register default integrations
   */
  private registerDefaultIntegrations(): void {
    // This would load integrations from configuration
    // or from a service that provides integration definitions
    
    // In a real implementation, this would dynamically load
    // integrations from a registry or configuration
  }
  
  /**
   * Validate an integration configuration
   */
  private validateIntegration(integration: Integration): void {
    // Validate basic requirements
    if (!integration.id || !integration.provider || !integration.name) {
      throw new Error('Integration must have id, provider, and name');
    }
    
    // Validate auth config
    const { authConfig } = integration;
    if (!authConfig.clientId || !authConfig.redirectUri || 
        !authConfig.authUrl || !authConfig.tokenUrl) {
      throw new Error('Integration auth config is incomplete');
    }
    
    // Check that at least one permission is defined
    if (!integration.permissions.length) {
      throw new Error('Integration must define at least one permission');
    }
    
    // Validate required permissions
    for (const endpoint of integration.endpoints) {
      for (const permissionId of endpoint.requiredPermissions) {
        const permissionExists = integration.permissions.some(p => p.id === permissionId);
        if (!permissionExists) {
          throw new Error(`Endpoint ${endpoint.id} requires undefined permission ${permissionId}`);
        }
      }
    }
  }
  
  /**
   * Load connections from storage
   */
  private loadConnections(): void {
    try {
      const storedConnections = getStorageItem<Connection[]>(this.config.connectionStorageKey!);
      if (storedConnections) {
        // Filter out pending connections
        const validConnections = storedConnections.filter(
          conn => conn.status !== ConnectionStatus.PENDING
        );
        
        // Add connections to the registry
        validConnections.forEach(conn => {
          this.connections.set(conn.id, conn);
        });
        
        console.log(`Loaded ${validConnections.length} integration connections`);
      }
    } catch (error) {
      console.error('Failed to load integration connections:', error);
    }
  }
  
  /**
   * Save connections to storage
   */
  private persistConnections(): void {
    try {
      // Filter out pending connections for storage
      const connectionsToStore = Array.from(this.connections.values())
        .filter(conn => conn.status !== ConnectionStatus.PENDING);
      
      setStorageItem(this.config.connectionStorageKey!, connectionsToStore);
    } catch (error) {
      console.error('Failed to persist integration connections:', error);
    }
  }
} 