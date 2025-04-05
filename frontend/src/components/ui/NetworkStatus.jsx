import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, /* RefreshCw, */ AlertTriangle } from 'lucide-react'; // Removed unused RefreshCw
import { motion, AnimatePresence } from 'framer-motion';
// import { useTheme } from '../../contexts/ThemeContext'; // Removed unused useTheme

/**
 * Enhanced NetworkStatus component with better error handling and user experience
 * Shows online/offline status and provides retry functionality
 * Now uses theme variables for styling
 */
const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good'); // good, poor, none
  const [isRetrying, setIsRetrying] = useState(false);
  const [, setRetryCount] = useState(0); // retryCount is unused, keep setter for now
  // const { theme } = useTheme(); // theme is unused

  // Check actual connection by pinging a resource
  const checkActualConnection = useCallback(async () => {
    if (!navigator.onLine) {
      setConnectionQuality('none');
      return false;
    }

    try {
      // Try to fetch a small resource to verify actual connectivity
      // Use a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      // Check response status
      if (response.ok) {
        // Get response time to gauge connection quality
        const performanceEntries = performance.getEntriesByType('resource');
        const lastEntry = performanceEntries[performanceEntries.length - 1];
        
        if (lastEntry && lastEntry.duration > 1000) {
          setConnectionQuality('poor');
        } else {
          setConnectionQuality('good');
        }
        return true;
      } else {
        setConnectionQuality('poor');
        return false;
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionQuality('poor');
      return false;
    }
  }, []);

  // Handle retry logic
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    const isConnected = await checkActualConnection();
    
    // Update online status based on actual connection
    setIsOnline(isConnected);
    setShowIndicator(true);
    
    // If connected, hide the indicator after a delay
    if (isConnected) {
      setTimeout(() => setShowIndicator(false), 3000);
    }
    
    setIsRetrying(false);
  }, [checkActualConnection]);

  useEffect(() => {
    // Handle online status changes with verification
    const handleOnline = async () => {
      // Verify the connection actually works
      const isActuallyConnected = await checkActualConnection();
      
      setIsOnline(isActuallyConnected);
      setShowIndicator(true);
      
      // If we're actually connected, hide the indicator after a delay
      if (isActuallyConnected) {
        setTimeout(() => setShowIndicator(false), 3000);
      }
    };

    // Handle offline status changes
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('none');
      setShowIndicator(true);
    };

    // Initial connection check
    checkActualConnection();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Use visibility change to check connection when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkActualConnection();
      }
    });

    // Check connection quality periodically when offline is shown
    let intervalId;
    if (!isOnline && showIndicator) {
      intervalId = setInterval(() => {
        checkActualConnection().then(isConnected => {
          if (isConnected) {
            setIsOnline(true);
            setTimeout(() => setShowIndicator(false), 3000);
            clearInterval(intervalId);
          }
        });
      }, 10000); // Check every 10 seconds
    }

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline, showIndicator, checkActualConnection]);

  // If not showing indicator, return null
  if (!showIndicator) return null;

  // Generate CSS classes based on connection status and theme
  const getStatusClasses = () => {
    // Default classes
    const baseClasses = "fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg";
    
    // Add theme-based status classes using CSS variables
    if (isOnline) {
      if (connectionQuality === 'good') {
        return `${baseClasses} bg-network-status-connected text-network-status-connected-text`;
      } else {
        return `${baseClasses} bg-network-status-poor text-network-status-poor-text`;
      }
    } else {
      return `${baseClasses} bg-network-status-offline text-network-status-offline-text`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className={getStatusClasses()}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            connectionQuality === 'good' ? (
              <>
                <Wifi size={18} />
                <span>Connected</span>
              </>
            ) : (
              <>
                <AlertTriangle size={18} />
                <span>Poor connection</span>
                <span className="ml-1 text-xs opacity-70">Some features may be limited</span>
              </>
            )
          ) : (
            <>
              <WifiOff size={18} />
              <span>You are offline</span>
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="ml-2 px-2 py-1 text-xs rounded-md bg-background/10 hover:bg-background/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
              >
                {isRetrying ? 'Checking connection...' : 'Retry connection'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NetworkStatus; 