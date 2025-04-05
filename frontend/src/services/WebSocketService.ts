/**
 * WebSocket Service
 * 
 * Provides a secure WebSocket connection for real-time data streaming,
 * with automatic reconnection and event handling.
 */

// Define event types
export type WebSocketEvent = 
  | { type: 'analytics'; data: any }
  | { type: 'notification'; data: any }
  | { type: 'status'; data: { status: string; message?: string } };

// Define callback types
export type WebSocketEventCallback = (event: WebSocketEvent) => void;
export type WebSocketStatusCallback = (status: string, message?: string) => void;

// WebSocket connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting'
}

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private eventListeners: Map<string, Set<WebSocketEventCallback>> = new Map();
  private statusListeners: Set<WebSocketStatusCallback> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 2000; // Start with 2 seconds
  private reconnectTimer: number | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private url: string = '';
  private subscriptions: Set<string> = new Set();
  private pendingMessages: any[] = [];
  private authToken: string | null = null;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Connect to the WebSocket server
   * @param url The WebSocket server URL
   * @param authToken Optional authentication token
   */
  public connect(url: string, authToken?: string): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket is already connected or connecting');
      return;
    }

    this.url = url;
    this.authToken = authToken || null;
    this.connectionState = ConnectionState.CONNECTING;
    this.notifyStatusChange(ConnectionState.CONNECTING);

    try {
      // Check if we're in a development environment without a WebSocket endpoint
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
      
      // In development mode, log a warning instead of repeatedly trying to reconnect
      if (isDevelopment && isLocalhost) {
        console.warn('WebSocket connection attempted in development mode. This may fail if the backend WebSocket server is not running.');
        
        // Reduce max reconnect attempts for development mode
        this.maxReconnectAttempts = 2;
      }
      
      this.socket = new WebSocket(url);
      this.setupSocketHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionFailure();
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = this.handleOpen;
    this.socket.onmessage = this.handleMessage;
    this.socket.onclose = this.handleClose;
    this.socket.onerror = this.handleError;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen = (): void => {
    this.connectionState = ConnectionState.CONNECTED;
    this.reconnectAttempts = 0;
    this.reconnectInterval = 2000;
    this.notifyStatusChange(ConnectionState.CONNECTED);

    // Send authentication if available
    if (this.authToken) {
      this.send({
        type: 'auth',
        token: this.authToken
      });
    }

    // Resubscribe to topics
    this.resubscribe();

    // Send any pending messages
    this.sendPendingMessages();
  };

  /**
   * Handle WebSocket message event
   */
  private handleMessage = (event: MessageEvent): void => {
    try {
      const data = JSON.parse(event.data);
      
      // Ensure the message has a type
      if (!data.type) {
        console.warn('Received WebSocket message with no type:', data);
        return;
      }

      // Notify listeners for this event type
      this.notifyEventListeners(data.type, data);
      
      // Notify all listeners
      this.notifyEventListeners('*', data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, event.data);
    }
  };

  /**
   * Handle WebSocket close event
   */
  private handleClose = (event: CloseEvent): void => {
    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifyStatusChange(ConnectionState.DISCONNECTED, `Connection closed: ${event.reason} (${event.code})`);

    // Only try to reconnect for non-intentional disconnects
    if (!event.wasClean) {
      this.attemptReconnect();
    } else {
      // Clean resource
      this.socket = null;
    }
  };

  /**
   * Handle WebSocket error event
   */
  private handleError = (event: Event): void => {
    console.error('WebSocket error:', event);
    this.notifyStatusChange(ConnectionState.DISCONNECTED, 'Connection error');
  };

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`);
      this.notifyStatusChange(
        ConnectionState.DISCONNECTED,
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      );
      return;
    }

    this.reconnectAttempts++;
    this.connectionState = ConnectionState.RECONNECTING;
    this.notifyStatusChange(
      ConnectionState.RECONNECTING,
      `Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    // Exponential backoff with jitter
    const jitter = Math.random() * 1000;
    const delay = Math.min(30000, this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1)) + jitter;

    this.reconnectTimer = window.setTimeout(() => {
      if (this.url) {
        this.connect(this.url, this.authToken || undefined);
      }
    }, delay);
  }

  /**
   * Handle connection failure
   */
  private handleConnectionFailure(): void {
    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifyStatusChange(ConnectionState.DISCONNECTED, 'Failed to establish connection');
    this.attemptReconnect();
  }

  /**
   * Notify status change listeners
   */
  private notifyStatusChange(status: ConnectionState, message?: string): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(status, message);
      } catch (error) {
        console.error('Error in WebSocket status listener:', error);
      }
    });
  }

  /**
   * Notify event listeners for a specific event type
   */
  private notifyEventListeners(eventType: string, data: any): void {
    const eventData: WebSocketEvent = { type: eventType as any, data };
    
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(eventData);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  public send(data: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      // Queue message to send once connected
      this.pendingMessages.push(data);
      return false;
    }

    try {
      this.socket.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Send any pending messages
   */
  private sendPendingMessages(): void {
    if (this.pendingMessages.length === 0) return;

    console.log(`Sending ${this.pendingMessages.length} pending messages`);
    
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];
    
    messages.forEach(message => {
      this.send(message);
    });
  }

  /**
   * Subscribe to a topic
   * @param topic The topic to subscribe to
   */
  public subscribe(topic: string): void {
    this.subscriptions.add(topic);
    
    if (this.isConnected()) {
      this.send({
        type: 'subscribe',
        topic
      });
    }
  }

  /**
   * Unsubscribe from a topic
   * @param topic The topic to unsubscribe from
   */
  public unsubscribe(topic: string): void {
    this.subscriptions.delete(topic);
    
    if (this.isConnected()) {
      this.send({
        type: 'unsubscribe',
        topic
      });
    }
  }

  /**
   * Resubscribe to all topics
   */
  private resubscribe(): void {
    this.subscriptions.forEach(topic => {
      this.send({
        type: 'subscribe',
        topic
      });
    });
  }

  /**
   * Add an event listener
   * @param eventType The event type to listen for, or '*' for all events
   * @param callback The callback to call when an event is received
   */
  public addEventListener(eventType: string, callback: WebSocketEventCallback): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType)!.add(callback);
  }

  /**
   * Remove an event listener
   * @param eventType The event type to remove the listener from
   * @param callback The callback to remove
   */
  public removeEventListener(eventType: string, callback: WebSocketEventCallback): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  /**
   * Add a status listener
   * @param callback The callback to call when the status changes
   */
  public addStatusListener(callback: WebSocketStatusCallback): void {
    this.statusListeners.add(callback);
    
    // Immediately notify of current status
    callback(this.connectionState);
  }

  /**
   * Remove a status listener
   * @param callback The callback to remove
   */
  public removeStatusListener(callback: WebSocketStatusCallback): void {
    this.statusListeners.delete(callback);
  }

  /**
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get the current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      // Remove all event handlers to prevent reconnection
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      // Close the connection
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close(1000, 'Client disconnected');
      }
      
      this.socket = null;
    }

    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifyStatusChange(ConnectionState.DISCONNECTED, 'Disconnected by client');
  }
}

// Export a singleton instance
export const webSocketService = WebSocketService.getInstance(); 