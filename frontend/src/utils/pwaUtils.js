/**
 * Utility functions for PWA features
 */

/**
 * Check if the application is running as a PWA
 * @returns {boolean} True if running as PWA
 */
export const isPwa = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if the browser supports PWA installation
 * @returns {boolean} True if PWA installation is supported
 */
export const isPwaInstallSupported = () => {
  return (
    'serviceWorker' in navigator &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  );
};

/**
 * Check if the Badging API is supported
 * @returns {boolean} True if Badging API is supported
 */
export const isBadgingSupported = () => {
  return 'setAppBadge' in navigator;
};

/**
 * Set the badge count on the app icon (if supported)
 * @param {number} count Badge count to display
 * @returns {Promise<void>} Promise that resolves when badge is set
 */
export const setAppBadge = async (count) => {
  if (isBadgingSupported()) {
    try {
      await navigator.setAppBadge(count);
      return true;
    } catch (error) {
      console.error('Failed to set app badge:', error);
      return false;
    }
  }
  return false;
};

/**
 * Clear the badge from the app icon (if supported)
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
export const clearAppBadge = async () => {
  if (isBadgingSupported()) {
    try {
      await navigator.clearAppBadge();
      return true;
    } catch (error) {
      console.error('Failed to clear app badge:', error);
      return false;
    }
  }
  return false;
};

/**
 * Check if the app can be updated
 * @returns {Promise<ServiceWorkerRegistration|null>} Promise with registration or null
 */
export const checkForAppUpdate = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      return registration;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    }
  }
  return null;
};

/**
 * Request notification permission
 * @returns {Promise<string>} Permission status: 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'error';
  }
};

/**
 * Subscribe to push notifications
 * @param {string} publicKey VAPID public key
 * @returns {Promise<PushSubscription|null>} Push subscription or null
 */
export const subscribeToPushNotifications = async (publicKey) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }
  
  try {
    // Get permission first
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return null;
    }
    
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }
    
    // Create new subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

/**
 * Helper to convert URL base64 to Uint8Array
 * @param {string} base64String Base64 string
 * @returns {Uint8Array} Uint8Array representation
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};

/**
 * Get caching status of the app
 * @returns {Promise<object>} Cache statistics
 */
export const getCacheStatus = async () => {
  if (!('caches' in window)) {
    return { supported: false };
  }
  
  try {
    const cacheNames = await caches.keys();
    const stats = { supported: true, caches: [] };
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      stats.caches.push({
        name,
        size: requests.length,
        urls: requests.slice(0, 5).map(req => req.url) // Just show first 5
      });
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting cache status:', error);
    return { supported: true, error: error.message };
  }
}; 