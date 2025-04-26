import { LRUCache } from '../lru-cache';

describe('LRUCache', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache(3); // Small size for testing
  });

  test('should store and retrieve values', () => {
    cache.set('key1', 1);
    expect(cache.get('key1')).toBe(1);
  });

  test('should return undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  test('should evict least recently used item when full', () => {
    cache.set('key1', 1);
    cache.set('key2', 2);
    cache.set('key3', 3);
    cache.set('key4', 4); // Should evict key1

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(2);
    expect(cache.get('key3')).toBe(3);
    expect(cache.get('key4')).toBe(4);
  });

  test('should update access order on get', () => {
    cache.set('key1', 1);
    cache.set('key2', 2);
    cache.set('key3', 3);
    
    cache.get('key1'); // Move key1 to most recently used
    cache.set('key4', 4); // Should evict key2

    expect(cache.get('key1')).toBe(1);
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.get('key3')).toBe(3);
    expect(cache.get('key4')).toBe(4);
  });

  test('should clear all entries', () => {
    cache.set('key1', 1);
    cache.set('key2', 2);
    
    cache.clear();
    
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  test('should handle zero capacity', () => {
    const zeroCache = new LRUCache<string, number>(0);
    zeroCache.set('key1', 1);
    expect(zeroCache.get('key1')).toBeUndefined();
  });
});
