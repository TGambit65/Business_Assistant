import initPolyfills from '../utils/browserPolyfills';

describe('Browser Polyfills', () => {
  beforeEach(function() {
    // Save original browser objects
    this.originalPromise = global.Promise;
    this.originalFetch = global.fetch;
    this.originalIndexedDB = global.indexedDB;
    this.originalServiceWorker = global.navigator && global.navigator.serviceWorker;
    this.originalArray = global.Array;
    this.originalObject = global.Object;
  });
  
  afterEach(function() {
    // Restore original browser objects
    global.Promise = this.originalPromise;
    global.fetch = this.originalFetch;
    global.indexedDB = this.originalIndexedDB;
    
    if (this.originalServiceWorker) {
      if (!global.navigator) global.navigator = {};
      global.navigator.serviceWorker = this.originalServiceWorker;
    }
    
    global.Array = this.originalArray;
    global.Object = this.originalObject;
  });
  
  test('Promise.finally polyfill is applied when missing', () => {
    // Remove Promise.finally
    const PromiseWithoutFinally = function(executor) {
      return new Promise(executor);
    };
    PromiseWithoutFinally.prototype = Promise.prototype;
    PromiseWithoutFinally.all = Promise.all;
    PromiseWithoutFinally.race = Promise.race;
    PromiseWithoutFinally.resolve = Promise.resolve;
    PromiseWithoutFinally.reject = Promise.reject;
    
    delete PromiseWithoutFinally.prototype.finally;
    global.Promise = PromiseWithoutFinally;
    
    // Init polyfills
    initPolyfills();
    
    // Check if finally is now available
    expect(typeof Promise.prototype.finally).toBe('function');
    
    // Test the polyfill
    return Promise.resolve('test')
      .finally(() => {
        expect(true).toBe(true);
      });
  });
  
  test('fetch polyfill is applied when missing', () => {
    delete global.fetch;
    initPolyfills();
    expect(typeof global.fetch).toBe('function');
  });
  
  test('IndexedDB polyfill is applied when missing', () => {
    delete global.indexedDB;
    initPolyfills();
    expect(global.indexedDB).toBeDefined();
  });
  
  test('Service Worker polyfill is applied when missing', async () => {
    delete global.navigator;
    global.navigator = {};
    
    initPolyfills();
    
    expect(global.navigator.serviceWorker).toBeDefined();
    
    try {
      await global.navigator.serviceWorker.ready;
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe('Service Workers not supported');
    }
  });
  
  test('Array.includes polyfill is applied when missing', () => {
    const originalIncludes = Array.prototype.includes;
    delete Array.prototype.includes;
    
    initPolyfills();
    
    expect(typeof Array.prototype.includes).toBe('function');
    expect([1, 2, 3].includes(2)).toBe(true);
    
    Array.prototype.includes = originalIncludes;
  });
  
  test('Object.entries polyfill is applied when missing', () => {
    const originalEntries = Object.entries;
    delete Object.entries;
    
    initPolyfills();
    
    expect(typeof Object.entries).toBe('function');
    expect(Object.entries({a: 1, b: 2})).toEqual([['a', 1], ['b', 2]]);
    
    Object.entries = originalEntries;
  });
}); 
