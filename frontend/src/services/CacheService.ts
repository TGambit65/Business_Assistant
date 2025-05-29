/**
 * Cache Service for API responses
 * Implements multiple caching strategies for optimal performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  strategy?: 'memory' | 'localStorage' | 'sessionStorage' | 'hybrid';
  maxSize?: number; // Maximum cache size in bytes
  compress?: boolean; // Whether to compress data
}

export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_MEMORY_SIZE = 10 * 1024 * 1024; // 10MB
  private currentMemorySize = 0;

  private constructor() {
    // Set up periodic cleanup
    this.startCleanupInterval();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Get data from cache
   */
  public async get<T>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    const strategy = options.strategy || 'hybrid';

    // Try memory cache first
    if (strategy === 'memory' || strategy === 'hybrid') {
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && this.isValid(memoryEntry)) {
        return memoryEntry.data;
      }
    }

    // Try storage cache
    if (strategy !== 'memory') {
      const storageEntry = await this.getFromStorage<T>(key, strategy);
      if (storageEntry && this.isValid(storageEntry)) {
        // Populate memory cache if using hybrid strategy
        if (strategy === 'hybrid') {
          this.setMemoryCache(key, storageEntry);
        }
        return storageEntry.data;
      }
    }

    return null;
  }

  /**
   * Set data in cache
   */
  public async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const strategy = options.strategy || 'hybrid';
    const ttl = options.ttl || this.DEFAULT_TTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    // Store in memory cache
    if (strategy === 'memory' || strategy === 'hybrid') {
      this.setMemoryCache(key, entry);
    }

    // Store in storage cache
    if (strategy !== 'memory') {
      await this.setInStorage(key, entry, strategy, options.compress);
    }
  }

  /**
   * Remove item from cache
   */
  public async remove(key: string): Promise<void> {
    // Remove from memory
    const entry = this.memoryCache.get(key);
    if (entry) {
      this.currentMemorySize -= this.getSize(entry);
      this.memoryCache.delete(key);
    }

    // Remove from storage
    localStorage.removeItem(this.getStorageKey(key));
    sessionStorage.removeItem(this.getStorageKey(key));
  }

  /**
   * Clear all cache
   */
  public async clear(strategy?: 'memory' | 'localStorage' | 'sessionStorage' | 'all'): Promise<void> {
    if (!strategy || strategy === 'all' || strategy === 'memory') {
      this.memoryCache.clear();
      this.currentMemorySize = 0;
    }

    if (!strategy || strategy === 'all' || strategy === 'localStorage') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }

    if (!strategy || strategy === 'all' || strategy === 'sessionStorage') {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Get cache statistics
   */
  public getStats() {
    const stats = {
      memoryCache: {
        size: this.currentMemorySize,
        entries: this.memoryCache.size,
        hitRate: this.calculateHitRate(),
      },
      localStorage: {
        size: this.getStorageSize(localStorage),
        entries: this.getStorageEntryCount(localStorage),
      },
      sessionStorage: {
        size: this.getStorageSize(sessionStorage),
        entries: this.getStorageEntryCount(sessionStorage),
      },
    };
    return stats;
  }

  /**
   * Cache API response with smart invalidation
   */
  public async cacheApiResponse<T>(
    url: string,
    fetcher: () => Promise<Response>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(url);
    const cachedData = await this.get<T>(cacheKey, options);

    // Check if we have valid cached data
    if (cachedData) {
      // Optionally validate with ETag
      const cachedEntry = this.memoryCache.get(cacheKey) || 
                          await this.getFromStorage<T>(cacheKey, options.strategy || 'hybrid');
      
      if (cachedEntry?.etag) {
        try {
          const response = await fetch(url, {
            headers: {
              'If-None-Match': cachedEntry.etag,
            },
          });

          if (response.status === 304) {
            // Not modified, return cached data
            return cachedData;
          }
        } catch (error) {
          // Network error, return cached data
          return cachedData;
        }
      } else {
        return cachedData;
      }
    }

    // Fetch fresh data
    const response = await fetcher();
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const etag = response.headers.get('ETag') || undefined;

    // Cache the response
    await this.set(cacheKey, data, {
      ...options,
      etag,
    } as any);

    return data;
  }

  /**
   * Batch cache operations
   */
  public async batchGet<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        results.set(key, value);
      })
    );

    return results;
  }

  public async batchSet<T>(entries: Array<{ key: string; data: T; options?: CacheOptions }>): Promise<void> {
    await Promise.all(
      entries.map(({ key, data, options }) => this.set(key, data, options))
    );
  }

  // Private methods

  private isValid(entry: CacheEntry<any>): boolean {
    return entry.expiresAt > Date.now();
  }

  private setMemoryCache<T>(key: string, entry: CacheEntry<T>): void {
    const size = this.getSize(entry);
    
    // Check if we need to evict entries
    if (this.currentMemorySize + size > this.MAX_MEMORY_SIZE) {
      this.evictLRU(size);
    }

    this.memoryCache.set(key, entry);
    this.currentMemorySize += size;
  }

  private async getFromStorage<T>(
    key: string,
    strategy: string
  ): Promise<CacheEntry<T> | null> {
    const storage = strategy === 'sessionStorage' ? sessionStorage : localStorage;
    const storageKey = this.getStorageKey(key);
    
    try {
      const item = storage.getItem(storageKey);
      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error('Cache retrieval error:', error);
    }
    
    return null;
  }

  private async setInStorage<T>(
    key: string,
    entry: CacheEntry<T>,
    strategy: string,
    compress?: boolean
  ): Promise<void> {
    const storage = strategy === 'sessionStorage' ? sessionStorage : localStorage;
    const storageKey = this.getStorageKey(key);
    
    try {
      let data = JSON.stringify(entry);
      
      if (compress) {
        // Implement compression if needed
        // data = compress(data);
      }
      
      storage.setItem(storageKey, data);
    } catch (error) {
      console.error('Cache storage error:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Clear old entries and retry
        this.clearOldStorageEntries(storage);
        try {
          storage.setItem(storageKey, JSON.stringify(entry));
        } catch (retryError) {
          console.error('Cache storage retry failed:', retryError);
        }
      }
    }
  }

  private getStorageKey(key: string): string {
    return `cache_${key}`;
  }

  private generateCacheKey(url: string): string {
    return `api_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private getSize(obj: any): number {
    return new Blob([JSON.stringify(obj)]).size;
  }

  private evictLRU(requiredSize: number): void {
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    let freedSize = 0;
    for (const [key, entry] of entries) {
      if (freedSize >= requiredSize) break;
      
      freedSize += this.getSize(entry);
      this.memoryCache.delete(key);
    }
    
    this.currentMemorySize -= freedSize;
  }

  private clearOldStorageEntries(storage: Storage): void {
    const now = Date.now();
    const keys = Object.keys(storage);
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const item = storage.getItem(key);
          if (item) {
            const entry = JSON.parse(item);
            if (entry.expiresAt < now) {
              storage.removeItem(key);
            }
          }
        } catch (error) {
          // Invalid entry, remove it
          storage.removeItem(key);
        }
      }
    });
  }

  private getStorageSize(storage: Storage): number {
    let size = 0;
    const keys = Object.keys(storage);
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        const item = storage.getItem(key);
        if (item) {
          size += item.length * 2; // UTF-16 encoding
        }
      }
    });
    
    return size;
  }

  private getStorageEntryCount(storage: Storage): number {
    return Object.keys(storage).filter(key => key.startsWith('cache_')).length;
  }

  private calculateHitRate(): number {
    // This would require tracking hits and misses
    // For now, return a placeholder
    return 0;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      // Clean up expired entries from memory
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expiresAt < now) {
          this.currentMemorySize -= this.getSize(entry);
          this.memoryCache.delete(key);
        }
      }
      
      // Clean up storage
      this.clearOldStorageEntries(localStorage);
      this.clearOldStorageEntries(sessionStorage);
    }, 60 * 1000); // Run every minute
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();