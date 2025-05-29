/**
 * Local Storage Service
 * 
 * Provides a robust interface for local storage operations with error handling,
 * fallback mechanisms, and data validation.
 */

import {
  StorageError,
  StorageErrorType,
  StorageOptions,
  StorageResult,
  StorageVersion,
  VersionedStorageItem,
  StorageQuota
} from '../types/storage';

// Default storage options
const DEFAULT_OPTIONS: StorageOptions = {
  useSessionStorage: false,
  useCookies: false,
  compression: false,
};

export class LocalStorageService {
  private static instance: LocalStorageService;
  private options: StorageOptions;
  private storage: Storage;
  private isAvailable: boolean;

  private constructor(options: StorageOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.isAvailable = this.checkStorageAvailability();
    this.storage = this.getStorage();
  }

  /**
   * Get the singleton instance of LocalStorageService
   */
  public static getInstance(options?: StorageOptions): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService(options);
    }
    return LocalStorageService.instance;
  }

  /**
   * Set an item in storage
   * @param key Storage key
   * @param value Value to store
   * @param version Optional version information
   */
  public setItem<T>(key: string, value: T, version?: StorageVersion): StorageResult<void> {
    if (!this.isAvailable) {
      return this.handleStorageUnavailable();
    }

    try {
      const item: VersionedStorageItem<T> = {
        data: value,
        version: version || { version: '1.0.0', timestamp: Date.now() },
      };

      const serialized = JSON.stringify(item);
      this.storage.setItem(key, serialized);
      
      return { success: true };
    } catch (error) {
      return this.handleStorageError(error as Error, 'setItem');
    }
  }

  /**
   * Get an item from storage
   * @param key Storage key
   */
  public getItem<T>(key: string): StorageResult<T> {
    if (!this.isAvailable) {
      return this.handleStorageUnavailable();
    }

    try {
      const serialized = this.storage.getItem(key);
      
      if (serialized === null) {
        return { success: false, error: { type: StorageErrorType.NOT_AVAILABLE, message: `Item with key ${key} not found` } };
      }

      const item = JSON.parse(serialized) as VersionedStorageItem<T>;
      return { success: true, data: item.data };
    } catch (error) {
      return this.handleStorageError(error as Error, 'getItem');
    }
  }

  /**
   * Get an item with version information from storage
   * @param key Storage key
   */
  public getItemWithVersion<T>(key: string): StorageResult<VersionedStorageItem<T>> {
    if (!this.isAvailable) {
      return this.handleStorageUnavailable();
    }

    try {
      const serialized = this.storage.getItem(key);
      
      if (serialized === null) {
        return { success: false, error: { type: StorageErrorType.NOT_AVAILABLE, message: `Item with key ${key} not found` } };
      }

      const item = JSON.parse(serialized) as VersionedStorageItem<T>;
      return { success: true, data: item };
    } catch (error) {
      return this.handleStorageError(error as Error, 'getItemWithVersion');
    }
  }

  /**
   * Remove an item from storage
   * @param key Storage key
   */
  public removeItem(key: string): StorageResult<void> {
    if (!this.isAvailable) {
      return this.handleStorageUnavailable();
    }

    try {
      this.storage.removeItem(key);
      return { success: true };
    } catch (error) {
      return this.handleStorageError(error as Error, 'removeItem');
    }
  }

  /**
   * Clear all items from storage
   */
  public clear(): StorageResult<void> {
    if (!this.isAvailable) {
      return this.handleStorageUnavailable();
    }

    try {
      this.storage.clear();
      return { success: true };
    } catch (error) {
      return this.handleStorageError(error as Error, 'clear');
    }
  }

  /**
   * Get the number of items in storage
   */
  public getLength(): StorageResult<number> {
    if (!this.isAvailable) {
      return this.handleStorageUnavailable();
    }

    try {
      return { success: true, data: this.storage.length };
    } catch (error) {
      return this.handleStorageError(error as Error, 'getLength');
    }
  }

  /**
   * Get the key at the specified index
   * @param index Index of the key
   */
  public getKey(index: number): StorageResult<string | null> {
    if (!this.isAvailable) {
      return this.handleStorageUnavailable();
    }

    try {
      return { success: true, data: this.storage.key(index) };
    } catch (error) {
      return this.handleStorageError(error as Error, 'getKey');
    }
  }

  /**
   * Check if storage is available
   */
  public isStorageAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get storage quota information (if available)
   */
  public async getStorageQuota(): Promise<StorageResult<StorageQuota>> {
    if (!this.isAvailable) {
      return this.handleStorageUnavailable();
    }

    // Check if the StorageManager API is available
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          success: true,
          data: {
            used: estimate.usage || 0,
            remaining: estimate.quota ? estimate.quota - (estimate.usage || 0) : 0,
            total: estimate.quota || 0,
          },
        };
      } catch (error) {
        return this.handleStorageError(error as Error, 'getStorageQuota');
      }
    }

    // If StorageManager API is not available, return a default result
    return {
      success: true,
      data: {
        used: 0,
        remaining: 0,
        total: 0,
      },
    };
  }

  /**
   * Check if storage is available
   */
  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      this.storage.setItem(testKey, testKey);
      this.storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the appropriate storage object based on options
   */
  private getStorage(): Storage {
    if (this.options.useSessionStorage && window.sessionStorage) {
      return window.sessionStorage;
    }
    
    if (this.options.useCookies) {
      // If cookies are requested but localStorage is not available,
      // we would implement a cookie-based storage here
      // For now, we'll just use localStorage
      return window.localStorage;
    }
    
    return window.localStorage;
  }

  /**
   * Handle storage errors
   * @param error The error that occurred
   * @param operation The operation that failed
   */
  private handleStorageError(error: Error, operation: string): StorageResult<any> {
    console.error(`Storage error during ${operation}:`, error);
    
    let errorType = StorageErrorType.UNKNOWN;
    let message = `Unknown error during ${operation}`;
    
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      errorType = StorageErrorType.QUOTA_EXCEEDED;
      message = `Storage quota exceeded during ${operation}`;
    } else if (error.name === 'InvalidStateError') {
      errorType = StorageErrorType.INVALID_DATA;
      message = `Invalid data during ${operation}`;
    }
    
    return {
      success: false,
      error: {
        type: errorType,
        message,
        originalError: error,
      },
    };
  }

  /**
   * Handle storage unavailable
   */
  private handleStorageUnavailable(): StorageResult<any> {
    return {
      success: false,
      error: {
        type: StorageErrorType.NOT_AVAILABLE,
        message: 'Storage is not available',
      },
    };
  }
} 