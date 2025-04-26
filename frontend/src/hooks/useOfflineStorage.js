import { useState, useEffect, useCallback } from 'react';
import { isIndexedDBAvailable, getIndexedDB } from '../utils/storageUtils';

const DB_NAME = 'OfflineDB';
const DB_VERSION = 1;
const STORES = {
  EMAILS: 'pendingEmails',
  DRAFTS: 'pendingDrafts',
  SETTINGS: 'userSettings',
  CACHE: 'dataCache'
};

// Helper function to create localStorage fallback
const createLocalStorageFallback = (storeName) => {
  const prefix = `${DB_NAME}_${storeName}_`;
  
  return {
    getItem: (id) => {
      try {
        const item = localStorage.getItem(`${prefix}${id}`);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error(`Error getting item ${id} from localStorage:`, e);
        return null;
      }
    },
    
    setItem: (id, value) => {
      try {
        localStorage.setItem(`${prefix}${id}`, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error(`Error setting item ${id} in localStorage:`, e);
        return false;
      }
    },
    
    removeItem: (id) => {
      try {
        localStorage.removeItem(`${prefix}${id}`);
        return true;
      } catch (e) {
        console.error(`Error removing item ${id} from localStorage:`, e);
        return false;
      }
    },
    
    getAllItems: () => {
      try {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(prefix)) {
            const id = key.substring(prefix.length);
            const item = JSON.parse(localStorage.getItem(key));
            items.push(item);
          }
        }
        return items;
      } catch (e) {
        console.error('Error getting all items from localStorage:', e);
        return [];
      }
    },
    
    clear: () => {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        
        // Remove all keys in a separate loop to avoid issues with changing indices
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return true;
      } catch (e) {
        console.error('Error clearing localStorage:', e);
        return false;
      }
    }
  };
};

// Offline storage hook
const useOfflineStorage = (storeName) => {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [fallbackStorage, setFallbackStorage] = useState(null);
  
  // Initialize IndexedDB or fallback
  useEffect(() => {
    let isMounted = true;
    
    // Check for IndexedDB support first
    const hasIndexedDBSupport = isIndexedDBAvailable();
    
    if (!hasIndexedDBSupport) {
      console.warn('IndexedDB not available, using localStorage fallback');
      setUsingFallback(true);
      setFallbackStorage(createLocalStorageFallback(storeName));
      setIsReady(true);
      return;
    }
    
    try {
      // Get our safe IndexedDB implementation
      const indexedDB = getIndexedDB();
      
      if (!indexedDB) {
        throw new Error('IndexedDB unavailable after getIndexedDB() call');
      }
      
      // Open the database
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        try {
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains(STORES.EMAILS)) {
            db.createObjectStore(STORES.EMAILS, { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
            db.createObjectStore(STORES.DRAFTS, { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
          }
          
          if (!db.objectStoreNames.contains(STORES.CACHE)) {
            const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
            cacheStore.createIndex('expires', 'expires');
          }
        } catch (err) {
          console.error('Error during database upgrade:', err);
          // Fall back to localStorage if upgrade fails
          if (isMounted) {
            setUsingFallback(true);
            setFallbackStorage(createLocalStorageFallback(storeName));
            setIsReady(true);
            setError('Failed to upgrade database: ' + err.message);
          }
        }
      };
      
      request.onsuccess = (event) => {
        if (isMounted) {
          setDb(event.target.result);
          setIsReady(true);
        }
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        if (isMounted) {
          setError(event.target.error);
          setUsingFallback(true);
          setFallbackStorage(createLocalStorageFallback(storeName));
          setIsReady(true);
        }
      };
    } catch (err) {
      console.error('Error initializing IndexedDB:', err);
      if (isMounted) {
        setError(err);
        setUsingFallback(true);
        setFallbackStorage(createLocalStorageFallback(storeName));
        setIsReady(true);
      }
    }
    
    return () => {
      isMounted = false;
      if (db) {
        db.close();
      }
    };
  }, [storeName, db]);
  
  // Save item to store
  const saveItem = useCallback(async (item) => {
    if (usingFallback && fallbackStorage) {
      return fallbackStorage.setItem(item.id || item.key, item);
    }
    
    if (!db || !isReady) {
      throw new Error('Database not ready');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }, [db, isReady, storeName, usingFallback, fallbackStorage]);
  
  // Get item by id
  const getItem = useCallback(async (id) => {
    if (usingFallback && fallbackStorage) {
      return fallbackStorage.getItem(id);
    }
    
    if (!db || !isReady) {
      throw new Error('Database not ready');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }, [db, isReady, storeName, usingFallback, fallbackStorage]);
  
  // Get all items
  const getAllItems = useCallback(async () => {
    if (usingFallback && fallbackStorage) {
      return fallbackStorage.getAllItems();
    }
    
    if (!db || !isReady) {
      throw new Error('Database not ready');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }, [db, isReady, storeName, usingFallback, fallbackStorage]);
  
  // Delete item by id
  const deleteItem = useCallback(async (id) => {
    if (usingFallback && fallbackStorage) {
      return fallbackStorage.removeItem(id);
    }
    
    if (!db || !isReady) {
      throw new Error('Database not ready');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }, [db, isReady, storeName, usingFallback, fallbackStorage]);
  
  // Clear all items in the store
  const clearItems = useCallback(async () => {
    if (usingFallback && fallbackStorage) {
      return fallbackStorage.clear();
    }
    
    if (!db || !isReady) {
      throw new Error('Database not ready');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }, [db, isReady, storeName, usingFallback, fallbackStorage]);
  
  return {
    isReady,
    error,
    usingFallback,
    saveItem,
    getItem,
    getAllItems,
    deleteItem,
    clearItems
  };
};

export default useOfflineStorage;
export { STORES }; 