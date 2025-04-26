/**
 * Debug tools for resource monitoring and troubleshooting
 * These tools help identify and diagnose resource-related issues
 */

// Track network request history
const requestHistory = [];
const maxHistorySize = 50;

/**
 * Log resource information to console for debugging
 */
export function logResourceInfo() {
  console.group('Resource Diagnostics');
  
  // Memory info
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    const usedHeapSize = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const totalHeapSize = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
    const usagePercent = ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2);
    
    console.log(`Memory Usage: ${usedHeapSize}MB / ${totalHeapSize}MB (${usagePercent}%)`);
  } else {
    console.log('Memory performance API not available in this browser');
  }
  
  // Network requests
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    console.log(`Active Network Requests: ${resources.length}`);
    
    // Group by resource type
    const byType = resources.reduce((acc, resource) => {
      const type = resource.initiatorType || 'other';
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    }, {});
    
    console.table(byType);
    
    // Show slow requests
    const slowRequests = resources
      .filter(r => r.duration > 500)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
      
    if (slowRequests.length > 0) {
      console.log('Slow Requests:');
      slowRequests.forEach(r => {
        console.log(`${r.name.split('/').pop()} - ${r.duration.toFixed(0)}ms`);
      });
    }
  }
  
  // DOM stats
  const totalElements = document.querySelectorAll('*').length;
  console.log(`Total DOM Elements: ${totalElements}`);
  
  // Event listeners (estimation)
  const elementsWithEvents = Array.from(document.querySelectorAll('*'))
    .filter(el => typeof el.onclick === 'function' || 
                  typeof el.onchange === 'function' ||
                  typeof el.onmouseover === 'function');
  console.log(`Elements with inline event handlers: ${elementsWithEvents.length}`);
  
  // Animation frames
  if (window._lastFrameRate) {
    console.log(`Estimated Frame Rate: ${window._lastFrameRate.toFixed(1)} FPS`);
  }
  
  // Resource constrained mode status
  const isConstrained = document.body.classList.contains('resource-constrained');
  console.log(`Resource Constrained Mode: ${isConstrained ? 'Active' : 'Inactive'}`);
  
  console.groupEnd();
}

/**
 * Monitor request patterns 
 * @param {string} url - The URL being requested
 */
export function trackRequest(url) {
  const timestamp = Date.now();
  
  // Keep history size manageable
  if (requestHistory.length >= maxHistorySize) {
    requestHistory.shift();
  }
  
  requestHistory.push({ url, timestamp });
  
  // Check for potential request flooding
  const last5Seconds = timestamp - 5000;
  const recentRequests = requestHistory.filter(req => req.timestamp > last5Seconds);
  
  // Check for duplicates to same endpoint
  const endpoints = {};
  for (const req of recentRequests) {
    const endpoint = req.url.split('?')[0]; // Strip query params
    endpoints[endpoint] = (endpoints[endpoint] || 0) + 1;
  }
  
  // Warn about potential flooding
  Object.entries(endpoints).forEach(([endpoint, count]) => {
    if (count > 10) {
      console.warn(`Potential request flooding: ${count} requests to ${endpoint} in last 5 seconds`);
    }
  });
}

/**
 * Setup continuous frame rate monitoring
 */
export function setupPerformanceMonitoring() {
  if (window._frameMonitoring) return;
  
  let lastTime = performance.now();
  let frames = 0;
  
  const measureFrameRate = () => {
    frames++;
    const now = performance.now();
    
    // Calculate FPS every second
    if (now - lastTime > 1000) {
      const fps = (frames * 1000) / (now - lastTime);
      window._lastFrameRate = fps;
      
      // Mark constrained if consistently low FPS
      if (fps < 20) {
        document.body.classList.add('resource-constrained');
        console.warn(`Low frame rate detected: ${fps.toFixed(1)} FPS`);
      }
      
      frames = 0;
      lastTime = now;
    }
    
    window.requestAnimationFrame(measureFrameRate);
  };
  
  window._frameMonitoring = true;
  window.requestAnimationFrame(measureFrameRate);
}

/**
 * Add this to window for debugging in console
 */
export function registerGlobalDebugTools() {
  window.__debugTools = {
    logResourceInfo,
    trackRequest,
    setupPerformanceMonitoring,
    getRequestHistory: () => [...requestHistory],
    forceLowResourceMode: () => {
      document.body.classList.add('resource-constrained');
      return 'Resource constrained mode enabled';
    },
    exitLowResourceMode: () => {
      document.body.classList.remove('resource-constrained');
      return 'Resource constrained mode disabled';
    }
  };
  
  // Allow console access with window.debug
  window.debug = window.__debugTools;
  
  console.log('Debug tools registered. Access with window.debug or debug command in console.');
} 