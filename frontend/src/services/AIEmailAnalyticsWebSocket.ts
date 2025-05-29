/**
 * WebSocket service for real-time AI Email Analytics updates
 */

import { aiEmailAnalyticsService } from './AIEmailAnalyticsService';
import type { AnalyticsEvent, RealTimeAnalytics } from '../types/analytics';

export class AIEmailAnalyticsWebSocket {
  private static instance: AIEmailAnalyticsWebSocket;
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000; // 5 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();
  private isConnecting: boolean = false;
  private eventQueue: AnalyticsEvent[] = [];

  private constructor() {
    // Initialize connection if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  public static getInstance(): AIEmailAnalyticsWebSocket {
    if (!AIEmailAnalyticsWebSocket.instance) {
      AIEmailAnalyticsWebSocket.instance = new AIEmailAnalyticsWebSocket();
    }
    return AIEmailAnalyticsWebSocket.instance;
  }

  /**
   * Connect to the WebSocket server
   */
  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      // In production, this would connect to a real WebSocket server
      // For now, we'll simulate real-time updates
      this.simulateRealTimeUpdates();
      this.isConnecting = false;
    } catch (error) {
      console.error('Failed to connect to analytics WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Simulate real-time updates for development
   */
  private simulateRealTimeUpdates(): void {
    // Simulate incoming analytics events every few seconds
    setInterval(() => {
      const mockEvents: AnalyticsEvent[] = [
        {
          id: `${Date.now()}-${Math.random()}`,
          userId: `user_${Math.floor(Math.random() * 100)}`,
          eventType: this.getRandomEventType(),
          timestamp: new Date(),
          duration: Math.floor(Math.random() * 3000),
          metadata: {
            contentLength: Math.floor(Math.random() * 500) + 100,
            satisfaction: Math.floor(Math.random() * 5) + 1,
            accepted: Math.random() > 0.2,
            modified: Math.random() > 0.7,
            feature: this.getRandomFeature()
          }
        }
      ];

      mockEvents.forEach(event => {
        this.handleIncomingEvent(event);
      });
    }, 3000); // Every 3 seconds

    // Simulate real-time metrics updates
    setInterval(() => {
      this.broadcastRealTimeMetrics();
    }, 10000); // Every 10 seconds
  }

  /**
   * Handle incoming analytics event
   */
  private handleIncomingEvent(event: AnalyticsEvent): void {
    // Add to event queue
    this.eventQueue.push(event);
    
    // Keep only last 100 events
    if (this.eventQueue.length > 100) {
      this.eventQueue = this.eventQueue.slice(-100);
    }

    // Notify subscribers
    this.notifySubscribers('event', event);
    
    // Update analytics service
    if (event.eventType !== 'error_occurred') {
      // Track the event in the analytics service
      const eventId = aiEmailAnalyticsService.trackActionStart(
        event.eventType,
        event.metadata
      );
      
      if (event.duration > 0) {
        aiEmailAnalyticsService.trackActionComplete(
          eventId,
          event.eventType,
          event.metadata
        );
      }
    }
  }

  /**
   * Broadcast real-time metrics
   */
  private async broadcastRealTimeMetrics(): Promise<void> {
    try {
      const realTimeData = await aiEmailAnalyticsService.getRealTimeAnalytics();
      this.notifySubscribers('metrics', realTimeData);
    } catch (error) {
      console.error('Failed to broadcast real-time metrics:', error);
    }
  }

  /**
   * Subscribe to real-time updates
   */
  public subscribe(eventType: string, callback: (data: any) => void): () => void {
    const id = `${eventType}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id);
    };
  }

  /**
   * Notify all subscribers of an event
   */
  private notifySubscribers(eventType: string, data: any): void {
    this.subscribers.forEach((callback, id) => {
      if (id.startsWith(eventType)) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber ${id}:`, error);
        }
      }
    });
  }

  /**
   * Send an analytics event
   */
  public sendEvent(event: AnalyticsEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'analytics_event',
        data: event
      }));
    } else {
      // Queue the event to be sent when connection is restored
      this.eventQueue.push(event);
    }
  }

  /**
   * Get recent events
   */
  public getRecentEvents(): AnalyticsEvent[] {
    return [...this.eventQueue].reverse();
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribers.clear();
    this.eventQueue = [];
  }

  /**
   * Get random event type for simulation
   */
  private getRandomEventType(): AnalyticsEvent['eventType'] {
    const types: AnalyticsEvent['eventType'][] = [
      'compose_start',
      'compose_complete',
      'rewrite_start',
      'rewrite_complete',
      'reply_start',
      'reply_complete',
      'summarize_start',
      'summarize_complete',
      'draft_start',
      'draft_complete'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get random feature for simulation
   */
  private getRandomFeature(): string {
    const features = ['compose', 'rewrite', 'reply', 'summarize', 'draft'];
    return features[Math.floor(Math.random() * features.length)];
  }
}

// Export singleton instance
export const aiEmailAnalyticsWebSocket = AIEmailAnalyticsWebSocket.getInstance();