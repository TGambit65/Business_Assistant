import React, { useState, useEffect } from 'react';
import { 
  isPwa, 
  isPwaInstallSupported, 
  isBadgingSupported,
  getCacheStatus,
  checkForAppUpdate
} from '../../utils/pwaUtils';
import { AlertCircle, CheckCircle, RefreshCw, Info } from 'lucide-react';
import { Button } from './button';

/**
 * Component to display PWA information and status
 */
const PwaInfo = () => {
  const [pwaStatus, setPwaStatus] = useState({
    isPwa: false,
    installSupported: false,
    badgingSupported: false,
    cacheInfo: null,
    checkingForUpdates: false,
    updateAvailable: false
  });
  
  useEffect(() => {
    // Check PWA status
    const checkPwaStatus = async () => {
      const cacheInfo = await getCacheStatus();
      
      setPwaStatus({
        isPwa: isPwa(),
        installSupported: isPwaInstallSupported(),
        badgingSupported: isBadgingSupported(),
        cacheInfo,
        updateAvailable: false,
        checkingForUpdates: false
      });
    };
    
    checkPwaStatus();
  }, []);
  
  const handleCheckForUpdate = async () => {
    setPwaStatus(prev => ({ ...prev, checkingForUpdates: true }));
    
    try {
      const registration = await checkForAppUpdate();
      
      if (registration && registration.waiting) {
        setPwaStatus(prev => ({ ...prev, updateAvailable: true }));
      } else {
        setPwaStatus(prev => ({ ...prev, updateAvailable: false }));
      }
    } catch (error) {
      console.error('Error checking for update:', error);
    } finally {
      setPwaStatus(prev => ({ ...prev, checkingForUpdates: false }));
    }
  };
  
  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          // Send message to waiting service worker
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Reload page to activate new service worker
          window.location.reload();
        }
      });
    }
  };
  
  // Clear cache for debugging
  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Refresh cache info
      const cacheInfo = await getCacheStatus();
      setPwaStatus(prev => ({ ...prev, cacheInfo }));
    }
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">PWA Status</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCheckForUpdate}
          disabled={pwaStatus.checkingForUpdates}
        >
          {pwaStatus.checkingForUpdates ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Check for updates
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center">
          {pwaStatus.isPwa ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          )}
          <span>
            {pwaStatus.isPwa ? 'Running as PWA' : 'Running in browser'}
          </span>
        </div>
        
        <div className="flex items-center">
          {pwaStatus.installSupported ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          )}
          <span>
            {pwaStatus.installSupported ? 'Installation supported' : 'Installation not supported'}
          </span>
        </div>
        
        <div className="flex items-center">
          {pwaStatus.badgingSupported ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <Info className="h-5 w-5 text-blue-500 mr-2" />
          )}
          <span>
            {pwaStatus.badgingSupported ? 'Badge API supported' : 'Badge API not supported'}
          </span>
        </div>
        
        {pwaStatus.updateAvailable && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
            <p className="text-sm mb-2">A new version is available!</p>
            <Button size="sm" onClick={handleUpdate}>
              Update now
            </Button>
          </div>
        )}
      </div>
      
      {pwaStatus.cacheInfo && pwaStatus.cacheInfo.supported && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Cache Information</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearCache}
            >
              Clear cache
            </Button>
          </div>
          
          <div className="text-sm">
            {pwaStatus.cacheInfo.caches && pwaStatus.cacheInfo.caches.map((cache, index) => (
              <div key={index} className="mb-1">
                <div className="flex justify-between">
                  <span>{cache.name}</span>
                  <span>{cache.size} items</span>
                </div>
              </div>
            ))}
            
            {pwaStatus.cacheInfo.caches && pwaStatus.cacheInfo.caches.length === 0 && (
              <p className="text-muted-foreground">No caches found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PwaInfo; 