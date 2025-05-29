import { useState, useEffect, useCallback } from 'react';
import { aiEmailAnalyticsWebSocket } from '../services/AIEmailAnalyticsWebSocket';
import type { AnalyticsEvent, RealTimeAnalytics } from '../types/analytics';

interface UseRealTimeAnalyticsOptions {
  onEvent?: (event: AnalyticsEvent) => void;
  onMetricsUpdate?: (metrics: RealTimeAnalytics) => void;
}

export const useRealTimeAnalytics = (options: UseRealTimeAnalyticsOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeAnalytics | null>(null);

  useEffect(() => {
    // Subscribe to events
    const unsubscribeEvent = aiEmailAnalyticsWebSocket.subscribe('event', (event: AnalyticsEvent) => {
      setRecentEvents(prev => {
        const updated = [event, ...prev].slice(0, 50); // Keep last 50 events
        return updated;
      });
      
      if (options.onEvent) {
        options.onEvent(event);
      }
    });

    // Subscribe to metrics updates
    const unsubscribeMetrics = aiEmailAnalyticsWebSocket.subscribe('metrics', (metrics: RealTimeAnalytics) => {
      setRealTimeMetrics(metrics);
      
      if (options.onMetricsUpdate) {
        options.onMetricsUpdate(metrics);
      }
    });

    // Set initial recent events
    setRecentEvents(aiEmailAnalyticsWebSocket.getRecentEvents());
    setIsConnected(true);

    // Cleanup
    return () => {
      unsubscribeEvent();
      unsubscribeMetrics();
    };
  }, [options.onEvent, options.onMetricsUpdate]);

  const sendEvent = useCallback((event: AnalyticsEvent) => {
    aiEmailAnalyticsWebSocket.sendEvent(event);
  }, []);

  return {
    isConnected,
    recentEvents,
    realTimeMetrics,
    sendEvent
  };
};

// Hook for tracking AI email actions in components
export const useAIEmailTracking = () => {
  const trackActionStart = useCallback((
    eventType: AnalyticsEvent['eventType'],
    metadata?: Record<string, any>
  ): string => {
    const eventId = `${Date.now()}-${Math.random()}`;
    const event: AnalyticsEvent = {
      id: eventId,
      userId: localStorage.getItem('userId') || 'anonymous',
      eventType,
      timestamp: new Date(),
      duration: 0,
      metadata: metadata || {}
    };
    
    aiEmailAnalyticsWebSocket.sendEvent(event);
    return eventId;
  }, []);

  const trackActionComplete = useCallback((
    eventId: string,
    eventType: AnalyticsEvent['eventType'],
    metadata?: Record<string, any>
  ) => {
    const event: AnalyticsEvent = {
      id: eventId,
      userId: localStorage.getItem('userId') || 'anonymous',
      eventType,
      timestamp: new Date(),
      duration: Date.now() - parseInt(eventId.split('-')[0]),
      metadata: metadata || {}
    };
    
    aiEmailAnalyticsWebSocket.sendEvent(event);
  }, []);

  const trackSatisfaction = useCallback((
    feature: string,
    rating: number,
    eventId?: string
  ) => {
    const event: AnalyticsEvent = {
      id: eventId || `${Date.now()}-${Math.random()}`,
      userId: localStorage.getItem('userId') || 'anonymous',
      eventType: 'content_accepted',
      timestamp: new Date(),
      duration: 0,
      metadata: {
        feature,
        satisfaction: rating
      }
    };
    
    aiEmailAnalyticsWebSocket.sendEvent(event);
  }, []);

  const trackError = useCallback((
    feature: string,
    errorType: string,
    errorMessage?: string
  ) => {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random()}`,
      userId: localStorage.getItem('userId') || 'anonymous',
      eventType: 'error_occurred',
      timestamp: new Date(),
      duration: 0,
      metadata: {
        feature,
        errorType,
        errorMessage
      }
    };
    
    aiEmailAnalyticsWebSocket.sendEvent(event);
  }, []);

  return {
    trackActionStart,
    trackActionComplete,
    trackSatisfaction,
    trackError
  };
};