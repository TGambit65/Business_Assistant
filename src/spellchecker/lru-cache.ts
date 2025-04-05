/**
 * LRU Cache implementation for SpellChecker service
 * Provides efficient caching with automatic cleanup of least recently used items
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  private recentKeys: K[];

  /**
   * Creates a new LRU Cache
   * @param capacity Maximum number of items to store in cache
   */
  constructor(capacity: number) {
    this.capacity = Math.max(0, capacity); // Ensure capacity is never negative
    this.cache = new Map<K, V>();
    this.recentKeys = [];
  }

  /**
   * Gets a value from the cache
   * @param key The key to lookup
   * @returns The value if found, undefined otherwise
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Update access order by moving key to the end
    this.updateRecentUse(key);
    return this.cache.get(key);
  }

  /**
   * Puts a value in the cache
   * @param key The key to store
   * @param value The value to store
   */
  put(key: K, value: V): void {
    this.addOrUpdate(key, value);
  }
  
  /**
   * Alias for put - sets a value in the cache
   * @param key The key to store
   * @param value The value to store
   */
  set(key: K, value: V): void {
    this.addOrUpdate(key, value);
  }
  
  /**
   * Helper method to add or update a cache entry
   * @param key The key to store
   * @param value The value to store
   */
  private addOrUpdate(key: K, value: V): void {
    // If capacity is 0, don't store anything
    if (this.capacity === 0) {
      return;
    }

    // If key already exists, update its value and access order
    if (this.cache.has(key)) {
      this.cache.set(key, value);
      this.updateRecentUse(key);
      return;
    }

    // If at capacity, remove least recently used item
    if (this.cache.size >= this.capacity) {
      const lruKey = this.recentKeys.shift();
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }

    // Add new item
    this.cache.set(key, value);
    this.recentKeys.push(key);
  }

  /**
   * Checks if a key exists in the cache
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Removes a key from the cache
   * @param key The key to remove
   * @returns True if the key was removed, false if it didn't exist
   */
  delete(key: K): boolean {
    if (!this.cache.has(key)) {
      return false;
    }

    this.cache.delete(key);
    const index = this.recentKeys.indexOf(key);
    if (index !== -1) {
      this.recentKeys.splice(index, 1);
    }
    return true;
  }

  /**
   * Clears the cache
   */
  clear(): void {
    this.cache.clear();
    this.recentKeys = [];
  }

  /**
   * Gets the current size of the cache
   * @returns Number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Gets the maximum capacity of the cache
   * @returns Maximum number of items the cache can hold
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Sets a new capacity for the cache
   * @param newCapacity The new maximum capacity
   */
  setCapacity(newCapacity: number): void {
    if (newCapacity < 1) {
      throw new Error('Cache capacity must be at least 1');
    }

    this.capacity = newCapacity;
    
    // Remove excess items if new capacity is smaller than current size
    while (this.cache.size > this.capacity) {
      const lruKey = this.recentKeys.shift();
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }
  }

  /**
   * Updates the recent use order for a key
   * @param key The key that was accessed
   */
  private updateRecentUse(key: K): void {
    const index = this.recentKeys.indexOf(key);
    if (index !== -1) {
      this.recentKeys.splice(index, 1);
    }
    this.recentKeys.push(key);
  }
} 