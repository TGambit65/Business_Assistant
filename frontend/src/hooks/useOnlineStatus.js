import { useState, useEffect, useCallback, useRef } from 'react';

// Move timestamp outside hook to make it persist between renders
let globalLastCheckTimestamp = 0;

/**
 * Custom hook to track online/offline status
 * Provides more reliable online status detection than just navigator.onLine
 * @param {Object} options - Configuration options
 * @param {boolean} options.checkEndpoint - Whether to ping an endpoint to verify connection
 * @param {string} options.pingUrl - URL to ping to verify connection
 * @param {number} options.pingInterval - How often to ping in ms when showing offline status
 * @returns {Object} Online status state and utilities
 */
const useOnlineStatus = (options = {}) => {
  const {
    checkEndpoint = true,
    // Use the lightweight health-check.txt file instead of favicon.ico
    pingUrl = '/health-check.txt',
    pingInterval = 30000, // 30 seconds between checks
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checking, setChecking] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  
  // Use a ref to track timestamps within component
  const lastCheckRef = useRef(globalLastCheckTimestamp);

  // Function to actually check connection by pinging a resource
  const checkConnection = useCallback(async () => {
    // Don't check again if we've checked recently
    const now = Date.now();
    if (now - lastCheckRef.current < pingInterval) {
      return;
    }
    
    lastCheckRef.current = now;
    globalLastCheckTimestamp = now;
    
    if (!checkEndpoint) {
      return navigator.onLine;
    }

    // Prevent multiple simultaneous checks
    if (checking) return;
    
    setChecking(true);

    try {
      // Use AbortController to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const startTime = Date.now();
      const response = await fetch(pingUrl, {
        method: 'HEAD',
        // Use proper caching to prevent excessive requests
        cache: 'default',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=60'
        }
      });
      const endTime = Date.now();
      
      clearTimeout(timeoutId);
      
      // Check connection quality based on response time
      const responseTime = endTime - startTime;
      if (responseTime < 300) {
        setConnectionQuality('good');
      } else if (responseTime < 1000) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('poor');
      }
      
      setIsOnline(response.ok);
      return response.ok;
    } catch (error) {
      // Only log if not aborted - prevent console spam
      if (error.name !== 'AbortError') {
        console.warn('Connection check failed:', error.message);
        setConnectionQuality('none');
        setIsOnline(navigator.onLine);
      }
      return false;
    } finally {
      setChecking(false);
    }
  }, [checkEndpoint, pingUrl, pingInterval, checking]);

  // Handle browser's online event
  const handleOnline = useCallback(() => {
    // Just update based on navigator.onLine without pinging
    // This reduces load during reconnection
    setIsOnline(true);
    
    // Schedule a verification ping after a short delay
    setTimeout(() => {
      checkConnection();
    }, 2000);
  }, [checkConnection]);

  // Handle browser's offline event
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setConnectionQuality('none');
  }, []);

  // Manual retry function for user-triggered connection checks
  const retry = async () => {
    if (checking) return;
    
    const isConnected = await checkConnection();
    return isConnected;
  };

  useEffect(() => {
    // Initial check - but only if we haven't checked recently
    const now = Date.now();
    if (now - lastCheckRef.current > pingInterval) {
      checkConnection();
    }
    
    // Set up listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Use proper interval management
    const intervalId = setInterval(() => {
      // Only check if we've passed the throttle interval
      const now = Date.now();
      if (now - lastCheckRef.current >= pingInterval) {
        checkConnection();
      }
    }, pingInterval);
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnection, handleOnline, handleOffline, pingInterval]);

  return {
    isOnline,
    checking,
    connectionQuality,
    retry
  };
};

export default useOnlineStatus; 