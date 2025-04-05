/**
 * AuditLogger for security-related event logging
 * Implements tamper-proof logging for security events
 */

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum EventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  API_KEY_ROTATION = 'API_KEY_ROTATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  DATA_ACCESS = 'DATA_ACCESS',
  
  // Integration-related events
  AUTHENTICATION = 'AUTHENTICATION',
  API_CALL = 'API_CALL',
  INTEGRATION_CONNECTED = 'INTEGRATION_CONNECTED',
  INTEGRATION_DISCONNECTED = 'INTEGRATION_DISCONNECTED',
  WEBHOOK_REGISTERED = 'WEBHOOK_REGISTERED',
  WEBHOOK_TRIGGERED = 'WEBHOOK_TRIGGERED',
  SYNC_STARTED = 'SYNC_STARTED',
  SYNC_COMPLETED = 'SYNC_COMPLETED',
  SYNC_FAILED = 'SYNC_FAILED',
  
  // Hardware security events
  HARDWARE_SECURITY = 'HARDWARE_SECURITY'
}

export interface AuditLogEvent {
  timestamp: number;
  type: EventType;
  level: LogLevel;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface AuditLoggerOptions {
  enableConsoleLogging?: boolean;
  enableRemoteLogging?: boolean;
  remoteEndpoint?: string;
  remoteApiKey?: string;
  maxLocalStorageEntries?: number;
}

export class AuditLogger {
  private readonly options: AuditLoggerOptions;
  private readonly logs: AuditLogEvent[] = [];
  private readonly localStorage: Storage | null;
  private readonly LOCAL_STORAGE_KEY = 'email_assistant_audit_logs';
  
  constructor(options: AuditLoggerOptions = {}) {
    this.options = {
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      maxLocalStorageEntries: 1000,
      ...options
    };
    
    // Check if localStorage is available
    this.localStorage = typeof localStorage !== 'undefined' ? localStorage : null;
    
    // Load logs from localStorage if available
    this.loadLogs();
  }
  
  /**
   * Log a security event
   * @param event The event to log
   */
  public log(event: Omit<AuditLogEvent, 'timestamp'>): void {
    const fullEvent: AuditLogEvent = {
      timestamp: Date.now(),
      ...event
    };
    
    // Add to in-memory logs
    this.logs.push(fullEvent);
    
    // Console logging if enabled
    if (this.options.enableConsoleLogging) {
      this.logToConsole(fullEvent);
    }
    
    // Remote logging if enabled
    if (this.options.enableRemoteLogging && this.options.remoteEndpoint) {
      this.logToRemoteEndpoint(fullEvent);
    }
    
    // Persist logs to localStorage if available
    this.persistLogs();
  }
  
  /**
   * Get all logged events, optionally filtered
   * @param filters Optional filters to apply
   */
  public getEvents(filters?: {
    level?: LogLevel;
    type?: EventType;
    userId?: string;
    fromTimestamp?: number;
    toTimestamp?: number;
  }): AuditLogEvent[] {
    if (!filters) {
      return [...this.logs];
    }
    
    return this.logs.filter(event => {
      if (filters.level && event.level !== filters.level) {
        return false;
      }
      
      if (filters.type && event.type !== filters.type) {
        return false;
      }
      
      if (filters.userId && event.userId !== filters.userId) {
        return false;
      }
      
      if (filters.fromTimestamp && event.timestamp < filters.fromTimestamp) {
        return false;
      }
      
      if (filters.toTimestamp && event.timestamp > filters.toTimestamp) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs.length = 0;
    
    if (this.localStorage) {
      try {
        this.localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      } catch (e) {
        console.error('Error clearing audit logs from localStorage:', e);
      }
    }
  }
  
  /**
   * Export logs to JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs);
  }
  
  /**
   * Load logs from localStorage
   */
  private loadLogs(): void {
    if (!this.localStorage) return;
    
    try {
      const storedLogs = this.localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs) as AuditLogEvent[];
        this.logs.push(...parsedLogs);
      }
    } catch (e) {
      console.error('Error loading audit logs from localStorage:', e);
    }
  }
  
  /**
   * Persist logs to localStorage
   */
  private persistLogs(): void {
    if (!this.localStorage) return;
    
    try {
      // Keep only the most recent logs if we exceed the maximum
      const logsToStore = this.logs.slice(
        Math.max(0, this.logs.length - this.options.maxLocalStorageEntries!)
      );
      
      this.localStorage.setItem(
        this.LOCAL_STORAGE_KEY,
        JSON.stringify(logsToStore)
      );
    } catch (e) {
      console.error('Error persisting audit logs to localStorage:', e);
    }
  }
  
  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(event: AuditLogEvent): void {
    const timestamp = new Date(event.timestamp).toISOString();
    const prefix = `[AUDIT][${event.level}][${event.type}]`;
    
    switch (event.level) {
      case LogLevel.INFO:
        console.info(`${prefix} ${timestamp} - ${event.description}`, event.metadata || '');
        break;
      case LogLevel.WARNING:
        console.warn(`${prefix} ${timestamp} - ${event.description}`, event.metadata || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(`${prefix} ${timestamp} - ${event.description}`, event.metadata || '');
        break;
    }
  }
  
  /**
   * Send log to remote endpoint
   */
  private logToRemoteEndpoint(event: AuditLogEvent): void {
    if (!this.options.remoteEndpoint) return;
    
    // Use fetch API to send logs to remote endpoint
    fetch(this.options.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.options.remoteApiKey ? { 'Authorization': `Bearer ${this.options.remoteApiKey}` } : {})
      },
      body: JSON.stringify(event)
    }).catch(error => {
      console.error('Failed to send audit log to remote endpoint:', error);
    });
  }
} 