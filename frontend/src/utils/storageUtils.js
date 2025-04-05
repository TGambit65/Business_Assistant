/**
 * Storage utilities for checking storage availability and usage
 */

/**
 * Check if IndexedDB is available
 * @returns {boolean} - Whether IndexedDB is available
 */
export const isIndexedDBAvailable = () => {
  // Check for native IndexedDB or our polyfill flag
  return !!(window.indexedDB && !window.isIndexedDBPolyfilled);
};

/**
 * Get IndexedDB (polyfill-aware)
 * @returns {IDBFactory} - IndexedDB factory or polyfill
 */
export const getIndexedDB = () => {
  // Return either native IndexedDB or our polyfill
  return window.indexedDB || window.indexedDBPolyfill;
};

/**
 * Safely check storage usage
 * @returns {Promise<Object>} - Storage usage information
 */
export const checkStorageUsage = async () => {
  // Calculate localStorage usage
  const calculateLocalStorageSize = () => {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        total += (key.length + value.length) * 2; // UTF-16 characters (2 bytes each)
      }
    } catch (e) {
      console.error('Error calculating localStorage size:', e);
    }
    return total;
  };
  
  // Check IndexedDB availability
  const indexedDBStatus = {
    available: isIndexedDBAvailable(),
    polyfilled: window.isIndexedDBPolyfilled || false
  };
  
  // Check IndexedDB databases
  let indexedDBCount = 0;
  try {
    const idb = getIndexedDB();
    if (idb && idb.databases) {
      const databases = await idb.databases();
      indexedDBCount = databases.length;
    }
  } catch (e) {
    console.warn('Error checking IndexedDB:', e);
  }
  
  // Check storage estimate using the StorageManager API
  let storageEstimate = null;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      storageEstimate = {
        quota: estimate.quota,
        usage: estimate.usage,
        usagePercent: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0,
        details: estimate.usageDetails
      };
    }
  } catch (e) {
    console.warn('Error getting storage estimate:', e);
  }
  
  // Gather all storage data
  const localStorageSize = calculateLocalStorageSize();
  
  return {
    localStorage: {
      size: localStorageSize,
      sizeKB: Math.round(localStorageSize / 1024),
      itemCount: localStorage.length
    },
    indexedDB: {
      status: indexedDBStatus,
      databaseCount: indexedDBCount
    },
    storageQuota: storageEstimate
  };
};

/**
 * Check PWA installation capability
 * @returns {Object} - PWA installation status
 */
export const checkPWASupport = () => {
  const result = {
    supportsPWA: false,
    supportsInstallPrompt: false,
    isStandalone: false,
    isAppleDevice: false,
    isPWAInstalled: false
  };
  
  // Check if the app is running in standalone mode
  result.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator.standalone === true) ||
                       document.referrer.includes('android-app://');
  
  // Check if the app can be installed
  result.supportsInstallPrompt = 'BeforeInstallPromptEvent' in window;
  
  // Check if it's an Apple device
  result.isAppleDevice = /iPad|iPhone|iPod|Mac/.test(navigator.userAgent) && !window.MSStream;
  
  // Check if the device supports service workers
  result.supportsPWA = 'serviceWorker' in navigator;
  
  // Consider the app installed if it's running in standalone mode
  result.isPWAInstalled = result.isStandalone;
  
  return result;
};

const storageUtils = {
  isIndexedDBAvailable,
  getIndexedDB,
  checkStorageUsage,
  checkPWASupport
};

export default storageUtils; 