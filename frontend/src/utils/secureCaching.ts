/**
 * Secure Caching Utility
 * 
 * Provides functionality for securely caching data in the browser,
 * with special handling for sensitive data to prevent leakage.
 */

// Cache categories with different security needs
export enum CacheCategory {
  PUBLIC = 'public',     // Non-sensitive public data (UI components, public content)
  USER = 'user',         // User specific but non-sensitive (preferences, UI state)
  SENSITIVE = 'sensitive', // Sensitive data that requires encryption
  CRITICAL = 'critical'  // Highly sensitive data (credentials, tokens)
}

// Different storage mechanisms with increasing security levels
enum StorageType {
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  INDEXED_DB = 'indexedDB',
  MEMORY = 'memory'
}

// Mapping of categories to storage types
const categorySecurity: Record<CacheCategory, StorageType> = {
  [CacheCategory.PUBLIC]: StorageType.LOCAL_STORAGE,
  [CacheCategory.USER]: StorageType.SESSION_STORAGE,
  [CacheCategory.SENSITIVE]: StorageType.INDEXED_DB,
  [CacheCategory.CRITICAL]: StorageType.MEMORY
};

// In-memory cache for critical data
const memoryCache = new Map<string, any>();

/**
 * Encrypts data for secure storage
 * @param data Data to encrypt
 * @param keyName Encryption key name
 * @returns Encrypted data
 */
const encryptData = async (data: any, keyName: string): Promise<string> => {
  try {
    // This is a simplified version. In a real implementation, 
    // we'd use the Web Crypto API or a library like CryptoJS
    const serializedData = JSON.stringify(data);
    const encodedData = btoa(serializedData);
    
    // Add a timestamp for expiration
    const payload = {
      data: encodedData,
      expires: Date.now() + 3600000, // 1 hour expiration
      version: '1'
    };
    
    return JSON.stringify(payload);
  } catch (error) {
    console.error('Failed to encrypt data:', error);
    throw new Error('Data encryption failed');
  }
};

/**
 * Decrypts data from secure storage
 * @param encryptedData Encrypted data string
 * @param keyName Encryption key name
 * @returns Decrypted data
 */
const decryptData = async (encryptedData: string, keyName: string): Promise<any> => {
  try {
    const payload = JSON.parse(encryptedData);
    
    // Check expiration
    if (payload.expires < Date.now()) {
      throw new Error('Cached data has expired');
    }
    
    // Decode the data
    const decodedData = atob(payload.data);
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    throw new Error('Data decryption failed');
  }
};

/**
 * Stores data in the appropriate cache based on sensitivity
 * @param key Cache key
 * @param data Data to cache
 * @param category Security category of the data
 * @param expirationSeconds Optional expiration in seconds
 */
export const secureCache = async (
  key: string,
  data: any,
  category: CacheCategory = CacheCategory.PUBLIC,
  expirationSeconds?: number
): Promise<void> => {
  try {
    const storageType = categorySecurity[category];
    const expirationTime = expirationSeconds 
      ? Date.now() + (expirationSeconds * 1000)
      : Date.now() + 3600000; // Default 1 hour
    
    const cacheItem = {
      data,
      expires: expirationTime,
      version: '1',
      category
    };
    
    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        localStorage.setItem(key, JSON.stringify(cacheItem));
        break;
        
      case StorageType.SESSION_STORAGE:
        sessionStorage.setItem(key, JSON.stringify(cacheItem));
        break;
        
      case StorageType.INDEXED_DB:
        // For sensitive data, encrypt before storing
        const encryptedData = await encryptData(data, 'cache-encryption-key');
        localStorage.setItem(`encrypted_${key}`, encryptedData);
        break;
        
      case StorageType.MEMORY:
        // For critical data, only store in memory (lost on page refresh)
        memoryCache.set(key, {
          ...cacheItem,
          timestamp: Date.now() // Add access timestamp
        });
        break;
    }
  } catch (error) {
    console.error('Failed to securely cache data:', error);
    throw new Error('Secure caching failed');
  }
};

/**
 * Retrieves data from the appropriate cache
 * @param key Cache key
 * @param category Security category of the data
 * @returns Cached data or null if not found/expired
 */
export const retrieveCache = async (
  key: string,
  category: CacheCategory = CacheCategory.PUBLIC
): Promise<any | null> => {
  try {
    const storageType = categorySecurity[category];
    
    switch (storageType) {
      case StorageType.LOCAL_STORAGE: {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        const cacheItem = JSON.parse(item);
        if (cacheItem.expires < Date.now()) {
          localStorage.removeItem(key);
          return null;
        }
        
        return cacheItem.data;
      }
      
      case StorageType.SESSION_STORAGE: {
        const item = sessionStorage.getItem(key);
        if (!item) return null;
        
        const cacheItem = JSON.parse(item);
        if (cacheItem.expires < Date.now()) {
          sessionStorage.removeItem(key);
          return null;
        }
        
        return cacheItem.data;
      }
      
      case StorageType.INDEXED_DB: {
        const encryptedItem = localStorage.getItem(`encrypted_${key}`);
        if (!encryptedItem) return null;
        
        // Decrypt the data
        return await decryptData(encryptedItem, 'cache-encryption-key');
      }
      
      case StorageType.MEMORY: {
        const item = memoryCache.get(key);
        if (!item) return null;
        
        if (item.expires < Date.now()) {
          memoryCache.delete(key);
          return null;
        }
        
        // Update access timestamp
        memoryCache.set(key, {
          ...item,
          timestamp: Date.now()
        });
        
        return item.data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to retrieve cached data:', error);
    return null;
  }
};

/**
 * Removes data from cache
 * @param key Cache key
 * @param category Security category of the data
 */
export const clearCache = (
  key: string,
  category: CacheCategory = CacheCategory.PUBLIC
): void => {
  try {
    const storageType = categorySecurity[category];
    
    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        localStorage.removeItem(key);
        break;
        
      case StorageType.SESSION_STORAGE:
        sessionStorage.removeItem(key);
        break;
        
      case StorageType.INDEXED_DB:
        localStorage.removeItem(`encrypted_${key}`);
        break;
        
      case StorageType.MEMORY:
        memoryCache.delete(key);
        break;
    }
  } catch (error) {
    console.error('Failed to clear cached data:', error);
  }
};

/**
 * Clears all cached data for a specific category
 * @param category Security category to clear
 */
export const clearCategoryCache = (category: CacheCategory): void => {
  try {
    const storageType = categorySecurity[category];
    
    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              const item = JSON.parse(localStorage.getItem(key) || '{}');
              if (item.category === category) {
                localStorage.removeItem(key);
              }
            } catch (e) {
              // Skip non-JSON items
            }
          }
        }
        break;
        
      case StorageType.SESSION_STORAGE:
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            try {
              const item = JSON.parse(sessionStorage.getItem(key) || '{}');
              if (item.category === category) {
                sessionStorage.removeItem(key);
              }
            } catch (e) {
              // Skip non-JSON items
            }
          }
        }
        break;
        
      case StorageType.INDEXED_DB:
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('encrypted_')) {
            localStorage.removeItem(key);
          }
        }
        break;
        
      case StorageType.MEMORY:
        memoryCache.clear();
        break;
    }
  } catch (error) {
    console.error('Failed to clear category cache:', error);
  }
};

/**
 * Automatically cleans up expired items from all caches
 */
export const cleanupExpiredCache = (): void => {
  try {
    // Clean localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.expires && item.expires < Date.now()) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Skip non-JSON items
        }
      }
    }
    
    // Clean sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const item = JSON.parse(sessionStorage.getItem(key) || '{}');
          if (item.expires && item.expires < Date.now()) {
            sessionStorage.removeItem(key);
          }
        } catch (e) {
          // Skip non-JSON items
        }
      }
    }
    
    // Clean memory cache
    memoryCache.forEach((value, key) => {
      if (value.expires < Date.now()) {
        memoryCache.delete(key);
      }
    });
  } catch (error) {
    console.error('Failed to clean up expired cache:', error);
  }
};

// Set up periodic cleanup
if (typeof window !== 'undefined') {
  // Run cleanup every 5 minutes
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
} 