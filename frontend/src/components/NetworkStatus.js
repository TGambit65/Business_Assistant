import React, { useState, useEffect } from 'react';

/**
 * Component to display the current network connectivity status
 * This helps users understand when they're working offline
 */
const NetworkStatus = () => {
  // Track online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Handle visibility change - browser tab becomes active
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Update status when tab becomes visible again
      setIsOnline(navigator.onLine);
    }
  };

  useEffect(() => {
    // Update network status when online/offline events occur
    const handleOnline = () => {
      setIsOnline(true);
      
      // Report event if performance monitoring is available
      if (window.PerformanceMonitor && window.PerformanceMonitor.reportEvent) {
        window.PerformanceMonitor.reportEvent('network_status_change', { status: 'online' });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      
      // Report event if performance monitoring is available
      if (window.PerformanceMonitor && window.PerformanceMonitor.reportEvent) {
        window.PerformanceMonitor.reportEvent('network_status_change', { status: 'offline' });
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // If status is online and we don't want to show both states, return null
  // Uncomment this if you only want to show the offline status
  // if (isOnline) return null;

  return (
    <div className={`network-status ${isOnline ? 'online' : 'offline'}`} 
         role="status" 
         aria-live="polite">
      <div className="network-status-icon"></div>
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
};

export default NetworkStatus; 