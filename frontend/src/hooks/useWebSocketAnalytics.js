import { useState, useEffect, useCallback } from 'react';
import { webSocketService, ConnectionState } from '../services/WebSocketService';

export const useWebSocketAnalytics = (enabled = false, onStatusChange = null) => {
  const [socketStatus, setSocketStatus] = useState(ConnectionState.DISCONNECTED);
  const [realTimeEnabled, setRealTimeEnabled] = useState(enabled);

  const handleSocketStatusChange = useCallback((status, message) => {
    setSocketStatus(status);
    
    if (status === ConnectionState.DISCONNECTED && realTimeEnabled) {
      console.warn('WebSocket disconnected:', message);
    }
    
    if (onStatusChange) {
      onStatusChange(status, message);
    }
  }, [realTimeEnabled, onStatusChange]);

  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeEnabled) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 
      (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + 
      window.location.host + '/api/ws';

    try {
      webSocketService.connect(wsUrl);
      webSocketService.addStatusListener(handleSocketStatusChange);
      
      // Subscribe to relevant topics
      webSocketService.subscribe('metrics.email.sent');
      webSocketService.subscribe('metrics.email.opened');
      webSocketService.subscribe('metrics.email.clicked');
      webSocketService.subscribe('metrics.user.active');
    } catch (error) {
      console.warn('WebSocket initialization failed:', error);
      setSocketStatus(ConnectionState.DISCONNECTED);
    }
  }, [realTimeEnabled, handleSocketStatusChange]);

  const toggleRealTime = useCallback(() => {
    if (realTimeEnabled) {
      webSocketService.disconnect();
    } else {
      setupRealTimeUpdates();
    }
    setRealTimeEnabled(!realTimeEnabled);
  }, [realTimeEnabled, setupRealTimeUpdates]);

  useEffect(() => {
    if (realTimeEnabled) {
      setupRealTimeUpdates();
    }

    return () => {
      if (realTimeEnabled) {
        webSocketService.disconnect();
      }
    };
  }, [realTimeEnabled, setupRealTimeUpdates]);

  return {
    socketStatus,
    realTimeEnabled,
    toggleRealTime,
    webSocketService
  };
}; 