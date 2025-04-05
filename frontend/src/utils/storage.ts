/**
 * Local Storage Utilities
 * 
 * A set of helper functions for consistently accessing and manipulating data in localStorage
 * with proper type safety and error handling.
 */

/**
 * Storage keys used in the application
 */
export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme',
  SETTINGS: 'settings',
  RECENT_EMAILS: 'recent_emails',
  DRAFTS: 'drafts',
  QUICK_ACCESS_ORDER: 'quickAccessOrder',
  CUSTOM_QUICK_ACCESS_ITEMS: 'customQuickAccessItems',
  MAILBOX_ORDER: 'mailboxOrder',
  LABEL_ORDER: 'labelOrder',
  INTEGRATION_CONNECTIONS: 'integration_connections'
};

/**
 * Get an item from localStorage with proper type safety and error handling
 * 
 * @param key The localStorage key to retrieve
 * @param defaultValue Optional default value to return if the item doesn't exist
 * @returns The parsed item or the default value
 */
export function getStorageItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue !== undefined ? defaultValue : null;
    }
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error retrieving item '${key}' from localStorage:`, error);
    return defaultValue !== undefined ? defaultValue : null;
  }
}

/**
 * Set an item in localStorage with proper error handling
 * 
 * @param key The localStorage key to set
 * @param value The value to store (will be JSON stringified)
 * @returns true if successful, false if failed
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item '${key}' in localStorage:`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage with proper error handling
 * 
 * @param key The localStorage key to remove
 * @returns true if successful, false if failed
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item '${key}' from localStorage:`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage with proper error handling
 * 
 * @returns true if successful, false if failed
 */
export function clearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Get the currently authenticated user from localStorage
 * 
 * @returns The user object or null if not authenticated
 */
export function getCurrentUser<T = any>(): T | null {
  return getStorageItem<T>(STORAGE_KEYS.USER);
}

/**
 * Get the current user ID from localStorage
 * 
 * @returns The user ID or null if not authenticated
 */
export function getCurrentUserId(): string | null {
  try {
    const user = getCurrentUser();
    if (!user) {
      return null;
    }
    
    return (user as any).id || (user as any).userId || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 * 
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
} 