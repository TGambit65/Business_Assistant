/**
 * Network request interceptor to prevent resource exhaustion
 * This utility helps monitor and throttle network requests when needed
 */

import { trackRequest } from './debugTools';

// Global settings for network throttling
const settings = {
  enabled: true,
  maxConcurrentRequests: 10,
  requestDelay: 0, // ms to delay requests when throttling
  priorityEndpoints: ['/health-check.txt', '/api/auth'],
  lowPriorityEndpoints: ['/api/analytics', '/api/metrics'],
  activeRequests: 0,
  requestQueue: [],
  isThrottling: false
};

// Keep track of requests
const activeRequestMap = new Map();
const recentRequests = new Map();

/**
 * Check if the network interceptor should throttle requests
 * @returns {boolean} Whether to throttle requests
 */
function shouldThrottle() {
  // If throttling is disabled, never throttle
  if (!settings.enabled) return false;
  
  // If we're already throttling, continue doing so
  if (settings.isThrottling) return true;
  
  // If we have too many concurrent requests, start throttling
  if (settings.activeRequests >= settings.maxConcurrentRequests) {
    console.warn(`Network throttling activated: ${settings.activeRequests} concurrent requests`);
    settings.isThrottling = true;
    return true;
  }
  
  // If the body has the resource-constrained class, throttle low-priority requests
  const isResourceConstrained = document.body.classList.contains('resource-constrained');
  
  return isResourceConstrained;
}

/**
 * Process the next request in the queue
 */
function processQueue() {
  if (settings.requestQueue.length === 0) return;
  
  // Sort queue by priority (high priority endpoints first)
  settings.requestQueue.sort((a, b) => {
    const aPriority = isPriorityEndpoint(a.url) ? 1 : isLowPriorityEndpoint(a.url) ? -1 : 0;
    const bPriority = isPriorityEndpoint(b.url) ? 1 : isLowPriorityEndpoint(b.url) ? -1 : 0;
    return bPriority - aPriority;
  });
  
  // Process the next request
  const nextRequest = settings.requestQueue.shift();
  nextRequest.proceed();
}

/**
 * Check if a URL is a priority endpoint
 * @param {string} url - The URL to check
 * @returns {boolean} Whether the URL is a priority endpoint
 */
function isPriorityEndpoint(url) {
  return settings.priorityEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Check if a URL is a low priority endpoint
 * @param {string} url - The URL to check
 * @returns {boolean} Whether the URL is a low priority endpoint
 */
function isLowPriorityEndpoint(url) {
  return settings.lowPriorityEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Check if a request is a duplicate
 * @param {string} url - The URL to check
 * @returns {boolean} Whether the request is a potential duplicate
 */
function isDuplicateRequest(url) {
  const now = Date.now();
  const key = url.split('?')[0]; // Remove query params for comparison
  
  if (recentRequests.has(key)) {
    const timestamp = recentRequests.get(key);
    const timeSinceLastRequest = now - timestamp;
    
    // If the same endpoint was requested in the last 500ms, consider it a duplicate
    if (timeSinceLastRequest < 500) {
      console.warn(`Duplicate request detected: ${key}`);
      return true;
    }
  }
  
  // Update the recent requests map
  recentRequests.set(key, now);
  
  // Clean up old entries (older than 5 seconds)
  for (const [endpoint, timestamp] of recentRequests.entries()) {
    if (now - timestamp > 5000) {
      recentRequests.delete(endpoint);
    }
  }
  
  return false;
}

/**
 * Patch the fetch API to intercept requests
 */
export function setupNetworkInterceptor() {
  if (window._networkInterceptorInstalled) {
    return;
  }
  
  console.log('Setting up network request interceptor');
  
  // Keep a reference to the original fetch
  const originalFetch = window.fetch;
  
  // Override fetch with our interceptor
  window.fetch = function interceptedFetch(resource, options = {}) {
    const url = typeof resource === 'string' ? resource : resource.url;
    
    // Track the request for debugging
    trackRequest(url);
    
    // Skip intercepting for health check to avoid circular logic
    if (url === '/health-check.txt') {
      return originalFetch(resource, options);
    }
    
    // Check for duplicate requests
    if (isDuplicateRequest(url)) {
      return Promise.reject(new Error('Duplicate request rejected'));
    }
    
    // If we need to throttle, add to queue
    if (shouldThrottle() && !isPriorityEndpoint(url)) {
      return new Promise((resolve, reject) => {
        const requestId = Math.random().toString(36).substring(2);
        
        // Add to queue
        settings.requestQueue.push({
          url,
          requestId,
          proceed: () => {
            // Increment active requests
            settings.activeRequests++;
            
            // Add to active request map
            activeRequestMap.set(requestId, url);
            
            // Execute the fetch after delay (if throttling)
            setTimeout(() => {
              originalFetch(resource, options)
                .then(response => {
                  // Cleanup when done
                  settings.activeRequests--;
                  activeRequestMap.delete(requestId);
                  
                  // Process next request in queue
                  processQueue();
                  
                  resolve(response);
                })
                .catch(err => {
                  // Cleanup when done
                  settings.activeRequests--;
                  activeRequestMap.delete(requestId);
                  
                  // Process next request in queue
                  processQueue();
                  
                  reject(err);
                });
            }, settings.requestDelay);
          }
        });
        
        // If we have room to process a request, do it now
        if (settings.activeRequests < settings.maxConcurrentRequests) {
          processQueue();
        }
      });
    }
    
    // Normal request path
    settings.activeRequests++;
    const requestId = Math.random().toString(36).substring(2);
    activeRequestMap.set(requestId, url);
    
    return originalFetch(resource, options)
      .then(response => {
        settings.activeRequests--;
        activeRequestMap.delete(requestId);
        return response;
      })
      .catch(error => {
        settings.activeRequests--;
        activeRequestMap.delete(requestId);
        throw error;
      });
  };
  
  // Mark as installed
  window._networkInterceptorInstalled = true;
  
  // Clear throttling state periodically
  setInterval(() => {
    if (settings.isThrottling && settings.activeRequests < settings.maxConcurrentRequests / 2) {
      settings.isThrottling = false;
      console.log('Network throttling deactivated');
    }
  }, 5000);
  
  return {
    // Return settings object to allow configuration
    getSettings: () => ({ ...settings }),
    updateSettings: (newSettings) => {
      Object.assign(settings, newSettings);
    }
  };
}

/**
 * Get current network stats
 * @returns {Object} Current network statistics
 */
export function getNetworkStats() {
  return {
    activeRequests: settings.activeRequests,
    queuedRequests: settings.requestQueue.length,
    isThrottling: settings.isThrottling,
    throttleSettings: {
      maxConcurrentRequests: settings.maxConcurrentRequests,
      requestDelay: settings.requestDelay
    },
    activeRequestList: Array.from(activeRequestMap.values())
  };
} 