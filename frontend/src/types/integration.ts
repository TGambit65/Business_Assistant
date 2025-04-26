/**
 * TypeScript definitions for third-party service integrations
 */

// import { User } from './user'; // Removed unused import

/**
 * Integration providers supported by the application
 */
export type IntegrationProvider = 'google' | 'microsoft' | 'slack' | 'zoom' | 'calendar' | 'trello' | 'custom';

/**
 * Permission scope for integration access
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  required: boolean;
  scopes: string[];
}

/**
 * API endpoint configuration
 */
export interface Endpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requiredPermissions: string[];
  rateLimitPerMinute?: number;
}

/**
 * Authentication configuration for integrations
 */
export interface IntegrationAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  responseType: 'code' | 'token';
  pkceEnabled: boolean;
  tokenRefreshEnabled: boolean;
  additionalParams?: Record<string, string>;
}

/**
 * Integration definition
 */
export interface Integration {
  id: string;
  provider: IntegrationProvider;
  name: string;
  description: string;
  authConfig: IntegrationAuthConfig;
  endpoints: Endpoint[];
  permissions: Permission[];
  iconUrl?: string;
  enabled: boolean;
}

/**
 * Connection to an integration service
 */
export interface Connection {
  id: string;
  integrationId: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  scopes: string[];
  expiresAt: number;
  createdAt: number;
  lastSyncAt?: number;
  status: ConnectionStatus;
  providerUserId?: string;
  providerUserEmail?: string;
  additionalData?: Record<string, any>;
}

/**
 * Connection status to a third-party service
 */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  ERROR = 'error',
  PENDING = 'pending'
}

/**
 * OAuth token response
 */
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  id_token?: string;
}

/**
 * Data sync progress information
 */
export interface SyncProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  status: 'running' | 'completed' | 'failed' | 'idle';
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  connectionId: string;
  syncedAt: number;
  progress: SyncProgress;
  newItems: number;
  updatedItems: number;
  deletedItems: number;
  conflicts: number;
  dataTypes: string[];
}

/**
 * Webhook configuration
 */
export interface Webhook {
  id: string;
  connectionId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: number;
  lastTriggeredAt?: number;
  failureCount: number;
}

/**
 * Integration service interface
 */
export interface IntegrationService {
  // Integration management
  listAvailableIntegrations(): Promise<Integration[]>;
  getIntegration(integrationId: string): Promise<Integration | null>;
  
  // Connection management
  connectService(integrationId: string, userId: string): Promise<Connection>;
  disconnectService(connectionId: string): Promise<boolean>;
  refreshConnection(connectionId: string): Promise<Connection>;
  getUserConnections(userId: string): Promise<Connection[]>;
  
  // Data synchronization
  syncData(connectionId: string, dataTypes?: string[]): Promise<SyncResult>;
  getSyncStatus(connectionId: string): Promise<SyncProgress>;
  
  // Webhook management
  registerWebhook(connectionId: string, events: string[]): Promise<Webhook>;
  unregisterWebhook(webhookId: string): Promise<boolean>;
  listWebhooks(connectionId: string): Promise<Webhook[]>;
}

/**
 * Integration adapter interface - implemented by provider-specific adapters
 */
export interface IntegrationAdapter {
  getAuthUrl(state: string): string;
  handleAuthCallback(code: string, state: string): Promise<Connection>;
  refreshAccessToken(connection: Connection): Promise<Connection>;
  fetchUserProfile(connection: Connection): Promise<any>;
  executeEndpoint(connection: Connection, endpointId: string, params?: any): Promise<any>;
  syncData(connection: Connection, dataTypes?: string[]): Promise<SyncResult>;
  registerWebhook(connection: Connection, events: string[]): Promise<Webhook>;
  unregisterWebhook(webhook: Webhook): Promise<boolean>;
} 