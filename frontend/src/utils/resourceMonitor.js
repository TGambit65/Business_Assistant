/**
 * Utility for monitoring and managing browser resources
 * Helps prevent ERR_INSUFFICIENT_RESOURCES errors
 */

// Track if we're in a resource-constrained environment
let isResourceConstrained = false;

// Key metrics
let lastMemoryUsage = 0;
// Counter for resource warnings - removed as it's unused
let monitoringInterval = null;

/**
 * Check if the browser is experiencing resource constraints
 */
export function checkResourceConstraints() {
  // Check available memory if possible
  if (window.performance && window.performance.memory) {
    const memoryInfo = window.performance.memory;
    const usedHeapSize = memoryInfo.usedJSHeapSize;
    const totalHeapSize = memoryInfo.jsHeapSizeLimit;
    
    // Calculate memory usage as a percentage
    const memoryUsage = (usedHeapSize / totalHeapSize) * 100;
    
    // Check for rapid increase in memory usage
    const memoryIncreaseRate = memoryUsage - lastMemoryUsage;
    lastMemoryUsage = memoryUsage;
    
    if (memoryUsage > 80 || memoryIncreaseRate > 10) {
      console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}%`);
      document.body.classList.add('resource-constrained');
      return true;
    }
  }
  
  // Check for excessive HTTP requests
  // Note: This is a simplified example - in a real app you might
  // track actual requests using a network interceptor
  const activeNetworkRequests = (window.performance && 
    window.performance.getEntriesByType &&
    window.performance.getEntriesByType('resource').length) || 0;
  
  if (activeNetworkRequests > 100) {
    console.warn(`High number of network requests detected: ${activeNetworkRequests}`);
    document.body.classList.add('resource-constrained');
    return true;
  }
  
  // If everything looks good, remove the constrained flag if it was set
  if (isResourceConstrained) {
    document.body.classList.remove('resource-constrained');
    console.log('Resource constraints resolved');
  }
  
  isResourceConstrained = false;
  return false;
}

/**
 * Apply resource conservation measures when constraints are detected
 */
export function applyResourceConservation() {
  isResourceConstrained = true;
  
  // Apply the resource-constrained class to the body
  document.body.classList.add('resource-constrained');
  
  console.log('Applying resource conservation measures');
  
  // Clear unnecessary caches
  if (window.caches) {
    // We're not actually clearing caches, just logging that we would
    console.log('Would clear unnecessary caches');
  }
  
  // Reduce animations
  document.querySelectorAll('.animated, [class*="animate-"]').forEach(element => {
    element.style.animationPlayState = 'paused';
    element.style.transition = 'none';
  });
  
  // Clean up event listeners that might not be needed right now
  // This is just a placeholder - in a real app you would identify
  // non-critical event listeners and remove them
  console.log('Would clean up non-critical event listeners');
  
  // Reduce polling frequency of any background tasks
  // This is just a placeholder - in a real app you would identify
  // background tasks and reduce their frequency
  console.log('Would reduce background task frequency');
  
  return true;
}

/**
 * Start monitoring resources periodically
 */
export function startResourceMonitoring() {
  console.log('Starting resource monitoring');
  
  // Check for resource constraints immediately
  if (checkResourceConstraints()) {
    applyResourceConservation();
  }
  
  // Check every 30 seconds
  monitoringInterval = setInterval(() => {
    if (checkResourceConstraints()) {
      applyResourceConservation();
    } else if (document.body.classList.contains('resource-constrained')) {
      // If resources are no longer constrained, remove the class
      document.body.classList.remove('resource-constrained');
    }
  }, 30000);
  
  // Also check when the window is loaded or resized
  window.addEventListener('load', checkResourceConstraints);
  window.addEventListener('resize', checkResourceConstraints);
  
  return () => {
    // Return a cleanup function
    console.log('Stopping resource monitoring');
    clearInterval(monitoringInterval);
    window.removeEventListener('load', checkResourceConstraints);
    window.removeEventListener('resize', checkResourceConstraints);
  };
}

/**
 * Check if the app is currently running in resource-limited mode
 */
export function isResourceLimited() {
  return isResourceConstrained;
} 