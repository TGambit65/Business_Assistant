/**
 * PWA and Modern Web APIs polyfills and compatibility helpers
 * This file provides fallbacks and polyfills for browsers with limited support
 */

/**
 * Initialize all browser polyfills
 * Should be called early in application startup
 */
export const initPolyfills = () => {
  polyfillPerformanceAPI();
  polyfillPromiseFinally();
  polyfillServiceWorkerRegistration();
  polyfillFetch();
  polyfillIndexedDB();
  polyfillArrayMethods();
  polyfillObjectMethods();
};

/**
 * Polyfill for Performance API features
 */
export const polyfillPerformanceAPI = () => {
  if (!window.performance) {
    window.performance = {};
  }
  
  if (!window.performance.now) {
    let navigationStart = Date.now();
    window.performance.now = () => Date.now() - navigationStart;
  }
  
  if (!window.performance.getEntriesByType) {
    window.performance.getEntriesByType = () => [];
    window.performance.mark = () => {};
    window.performance.measure = () => {};
  }
};

/**
 * Polyfill for Promise.finally
 */
export const polyfillPromiseFinally = () => {
  if (Promise.prototype.finally === undefined) {
    // Create a utility function instead of modifying the prototype
    window.promiseFinally = function(promise, callback) {
      return promise.then(
        value => Promise.resolve(callback()).then(() => value),
        reason => Promise.resolve(callback()).then(() => { throw reason; })
      );
    };
    console.info('Promise.finally not available, using utility function window.promiseFinally instead');
  }
};

/**
 * Polyfill for ServiceWorkerRegistration
 */
export const polyfillServiceWorkerRegistration = () => {
  // Check if we're on a network that might not support service workers
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
  
  // Check service worker compatibility
  const hasSWSupport = checkServiceWorkerCompatibility();
  
  // If service workers are not supported, provide fallback functionality
  if (!('serviceWorker' in navigator) || (!isLocalhost && !hasSWSupport)) {
    console.warn('Service Workers not supported in this environment');
    navigator.serviceWorker = {
      register: () => {
        console.warn('Service Workers not supported in this environment');
        return Promise.reject(new Error('Service Workers not supported in this environment'));
      },
      ready: Promise.reject(new Error('Service Workers not supported')),
      controller: null,
      getRegistrations: () => Promise.resolve([])
    };
    return;
  }
  
  // Make sure the ready promise is defined
  if (navigator.serviceWorker && !navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready = new Promise((resolve, reject) => {
      // If we already have a controller, resolve with its registration
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.getRegistration()
          .then(registration => {
            if (registration) {
              resolve(registration);
            } else {
              reject(new Error('Service worker controller exists but no registration found'));
            }
          })
          .catch(reject);
      } else {
        // Otherwise wait for the 'controllerchange' event
        const controllerChangeHandler = () => {
          navigator.serviceWorker.getRegistration()
            .then(resolve)
            .catch(reject);
          navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
        };
        navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
        
        // Set a timeout to reject the promise if no controller appears within 10 seconds
        setTimeout(() => {
          navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
          reject(new Error('Timed out waiting for service worker controller'));
        }, 10000);
      }
    });
  }
};

/**
 * Check if the browser environment fully supports service workers
 */
const checkServiceWorkerCompatibility = () => {
  try {
    // Check for critical service worker APIs
    return 'serviceWorker' in navigator && 
           'ServiceWorkerRegistration' in window &&
           'ServiceWorkerGlobalScope' in window &&
           'Clients' in window &&
           'pushManager' in ServiceWorkerRegistration.prototype;
  } catch (e) {
    console.warn('Error checking service worker compatibility:', e);
    return false;
  }
};

/**
 * Polyfill for Fetch API
 */
export const polyfillFetch = () => {
  if (!window.fetch) {
    console.info('Fetch API not available, using polyfill');
    // Simple polyfill that uses XMLHttpRequest
    window.fetch = function(url, options = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);
        
        // Set headers
        if (options.headers) {
          Object.keys(options.headers).forEach(key => {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }
        
        // Handle timeout
        if (options.timeout) {
          xhr.timeout = options.timeout;
        }
        
        // Handle response
        xhr.onload = function() {
          const response = {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: parseHeaders(xhr.getAllResponseHeaders()),
            url: xhr.responseURL || url,
            clone: function() { return response; },
            text: function() { return Promise.resolve(xhr.responseText); },
            json: function() {
              try {
                return Promise.resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                return Promise.reject(e);
              }
            },
            blob: function() { return Promise.resolve(new Blob([xhr.response])); },
            ok: xhr.status >= 200 && xhr.status < 300
          };
          resolve(response);
        };
        
        // Handle errors
        xhr.onerror = function() {
          reject(new TypeError('Network request failed'));
        };
        
        xhr.ontimeout = function() {
          reject(new TypeError('Network request timed out'));
        };
        
        // Send request
        xhr.send(options.body || null);
      });
    };
    
    // Helper to parse headers
    function parseHeaders(headerStr) {
      const headers = new Headers();
      if (!headerStr) {
        return headers;
      }
      
      const headerPairs = headerStr.trim().split('\r\n');
      headerPairs.forEach(headerPair => {
        const index = headerPair.indexOf(': ');
        if (index > 0) {
          const key = headerPair.slice(0, index);
          const val = headerPair.slice(index + 2);
          headers.append(key, val);
        }
      });
      
      return headers;
    }
  }
};

/**
 * Polyfill for IndexedDB and related features
 */
export const polyfillIndexedDB = () => {
  // Don't try to override window.indexedDB directly
  // Instead check for support and only provide polyfill functionality when needed
  const hasIndexedDB = !!(window.indexedDB || 
                       window.mozIndexedDB || 
                       window.webkitIndexedDB || 
                       window.msIndexedDB);
                   
  // If no IndexedDB support at all, create a non-functional version that fails gracefully
  if (!hasIndexedDB) {
    console.info('IndexedDB not available, using localStorage polyfill functionality');
    
    // Instead of replacing window.indexedDB, we'll create a global indexedDBPolyfill
    // that can be used by application code that expects IndexedDB
    window.indexedDBPolyfill = {
      open: function(name) {
        const request = {
          result: {
            transaction: function() {
              return {
                objectStore: function() {
                  return {
                    put: function(value) {
                      try {
                        localStorage.setItem(`${name}_${value.id}`, JSON.stringify(value));
                        setTimeout(() => {
                          if (request.onsuccess) request.onsuccess();
                        }, 0);
                      } catch (e) {
                        setTimeout(() => {
                          if (request.onerror) request.onerror(e);
                        }, 0);
                      }
                      return {};
                    },
                    get: function(key) {
                      const getRequest = {};
                      setTimeout(() => {
                        try {
                          const data = localStorage.getItem(`${name}_${key}`);
                          if (getRequest.onsuccess) {
                            getRequest.result = data ? JSON.parse(data) : undefined;
                            getRequest.onsuccess();
                          }
                        } catch (e) {
                          if (getRequest.onerror) getRequest.onerror(e);
                        }
                      }, 0);
                      return getRequest;
                    },
                    delete: function(key) {
                      const deleteRequest = {};
                      setTimeout(() => {
                        try {
                          localStorage.removeItem(`${name}_${key}`);
                          if (deleteRequest.onsuccess) deleteRequest.onsuccess();
                        } catch (e) {
                          if (deleteRequest.onerror) deleteRequest.onerror(e);
                        }
                      }, 0);
                      return deleteRequest;
                    },
                    getAll: function() {
                      const getAllRequest = {};
                      setTimeout(() => {
                        try {
                          const results = [];
                          for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key.startsWith(`${name}_`)) {
                              results.push(JSON.parse(localStorage.getItem(key)));
                            }
                          }
                          if (getAllRequest.onsuccess) {
                            getAllRequest.result = results;
                            getAllRequest.onsuccess();
                          }
                        } catch (e) {
                          if (getAllRequest.onerror) getAllRequest.onerror(e);
                        }
                      }, 0);
                      return getAllRequest;
                    }
                  };
                }
              };
            },
            objectStoreNames: {
              contains: function() { return true; }
            }
          }
        };
        
        // Simulate async opening
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        
        return request;
      },
      // Add databases() method used by the storage check utility
      databases: function() {
        return Promise.resolve([]);
      }
    };
    
    // Add detection method to check if we're using the polyfill
    window.isIndexedDBPolyfilled = true;
  } else {
    window.isIndexedDBPolyfilled = false;
  }
};

/**
 * Polyfill for Array methods
 */
export const polyfillArrayMethods = () => {
  // Use utility functions instead of modifying prototypes
  if (!Array.prototype.find) {
    window.arrayFind = function(array, predicate, thisArg) {
      if (array === null || array === undefined) {
        throw new TypeError('arrayFind called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      
      const list = Object(array);
      const length = list.length >>> 0;
      
      for (let i = 0; i < length; i++) {
        if (i in list) {
          const val = list[i];
          if (predicate.call(thisArg, val, i, list)) {
            return val;
          }
        }
      }
      return undefined;
    };
    console.info('Array.prototype.find not available, using utility function window.arrayFind instead');
  }
  
  if (!Array.prototype.findIndex) {
    window.arrayFindIndex = function(array, predicate, thisArg) {
      if (array === null || array === undefined) {
        throw new TypeError('arrayFindIndex called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      
      const list = Object(array);
      const length = list.length >>> 0;
      
      for (let i = 0; i < length; i++) {
        if (i in list) {
          if (predicate.call(thisArg, list[i], i, list)) {
            return i;
          }
        }
      }
      return -1;
    };
    console.info('Array.prototype.findIndex not available, using utility function window.arrayFindIndex instead');
  }
  
  if (!Array.from) {
    Array.from = (function() {
      const toStr = Object.prototype.toString;
      const isCallable = function(fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
      };
      const toInteger = function(value) {
        const number = Number(value);
        if (isNaN(number)) { return 0; }
        if (number === 0 || !isFinite(number)) { return number; }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
      };
      const maxSafeInteger = Math.pow(2, 53) - 1;
      const toLength = function(value) {
        const len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
      };
      
      return function from(arrayLike) {
        const C = this;
        const items = Object(arrayLike);
        
        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }
        
        let mapFn = arguments.length > 1 ? arguments[1] : void undefined;
        let T;
        if (typeof mapFn !== 'undefined') {
          if (!isCallable(mapFn)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function');
          }
          if (arguments.length > 2) {
            T = arguments[2];
          }
        }
        
        const len = toLength(items.length);
        const A = isCallable(C) ? Object(new C(len)) : new Array(len);
        
        let k = 0;
        let kValue;
        
        while (k < len) {
          kValue = items[k];
          if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
          } else {
            A[k] = kValue;
          }
          k += 1;
        }
        
        A.length = len;
        return A;
      };
    }());
  }
};

/**
 * Polyfill for Object methods
 */
export const polyfillObjectMethods = () => {
  if (!Object.assign) {
    Object.assign = function(target) {
      if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      
      const to = Object(target);
      
      for (let i = 1; i < arguments.length; i++) {
        const nextSource = arguments[i];
        
        if (nextSource !== null && nextSource !== undefined) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      
      return to;
    };
  }
};

// Support both default and named export
export default initPolyfills; 