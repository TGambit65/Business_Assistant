/**
 * Performance Test Utility
 * 
 * This utility provides comprehensive performance testing for web applications,
 * especially PWAs, with a focus on metrics that affect user experience.
 */

import { checkStorageUsage as safeCheckStorageUsage } from './storageUtils';

// Test results storage
let testResults = {
  loadTime: {},
  renderPerformance: {},
  networkOptimization: {},
  resourceUsage: {},
  storageUsage: {},
  batteryImpact: {},
  recommendations: null
};

// Testing flags and state
let isTestingActive = false;
let testStartTime = 0;
let monitoringIntervals = [];

/**
 * Initialize performance testing
 */
export const initPerformanceTests = async (detailed = false) => {
  // Reset state
  resetTestResults();
  isTestingActive = true;
  testStartTime = performance.now();
  
  // Clear any existing monitoring intervals
  monitoringIntervals.forEach(clearInterval);
  monitoringIntervals = [];
  
  // Start tests in sequence
  try {
    // Initial load time measurement
    await measureInitialLoadTime();
    
    // DOM analysis
    await analyzeDOMSize();
    
    // Network request analysis
    await checkNetworkRequests();
    
    // Start continuous monitoring
    startResourceUsageMonitoring(detailed);
    
    // Start animation performance tests
    analyzeAnimationPerformance();
    
    // Storage usage analysis
    await checkStorageUsage();
    
    // Battery usage estimation
    await monitorBatteryUsage();
    
    // Generate recommendations after 2 seconds (give time for data collection)
    setTimeout(() => {
      analyzeLoadTimeResults();
      generateRecommendations();
    }, 2000);
  } catch (error) {
    console.error('Error during performance testing:', error);
  }
};

/**
 * Reset test results to initial state
 */
const resetTestResults = () => {
  testResults = {
    loadTime: {},
    renderPerformance: { fpsReadings: [] },
    networkOptimization: {},
    resourceUsage: { 
      memoryReadings: [],
      cpuReadings: []
    },
    storageUsage: {},
    batteryImpact: {},
    recommendations: null
  };
};

/**
 * Measure initial page load metrics
 */
const measureInitialLoadTime = async () => {
  const timing = performance.timing || {};
  const navStart = timing.navigationStart || 0;
  
  if (navStart) {
    // Calculate timing metrics from the Navigation Timing API
    const loadTime = {
      dns: (timing.domainLookupEnd - timing.domainLookupStart) || 0,
      tcp: (timing.connectEnd - timing.connectStart) || 0,
      ttfb: (timing.responseStart - timing.requestStart) || 0,
      contentDownload: (timing.responseEnd - timing.responseStart) || 0,
      domProcessing: (timing.domComplete - timing.domLoading) || 0,
      totalPageLoad: (timing.loadEventEnd - navStart) || 0
    };
    
    // Get resource timings
    const resources = performance.getEntriesByType('resource') || [];
    
    // Analyze resource loading
    const resourceAnalysis = {
      totalResources: resources.length,
      totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      slowestResources: resources
        .filter(r => r.duration > 500)
        .map(r => ({ url: r.name, duration: r.duration }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
    };
    
    // Store the results
    testResults.loadTime = {
      ...loadTime,
      resourceAnalysis
    };
  } else {
    // Fallback if Navigation Timing API is not available
    testResults.loadTime = {
      message: "Navigation Timing API not available"
    };
  }
};

/**
 * Analyze DOM size and complexity
 */
const analyzeDOMSize = async () => {
  const documentElement = document.documentElement;
  
  // Get DOM depth recursively
  const getDOMDepth = (element, currentDepth = 0) => {
    if (!element || !element.children) return currentDepth;
    
    let maxChildDepth = currentDepth;
    
    for (let i = 0; i < element.children.length; i++) {
      const childDepth = getDOMDepth(element.children[i], currentDepth + 1);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
      
      // Avoid stack overflow by limiting depth calculation
      if (i > 1000) break;
    }
    
    return maxChildDepth;
  };
  
  // Count elements by type
  const elementCounts = {};
  const allElements = document.querySelectorAll('*');
  let elementCount = allElements.length;
  
  // Limit the number of elements we analyze
  const samplesToAnalyze = Math.min(allElements.length, 5000);
  
  for (let i = 0; i < samplesToAnalyze; i++) {
    const tagName = allElements[i].tagName.toLowerCase();
    elementCounts[tagName] = (elementCounts[tagName] || 0) + 1;
  }
  
  // Calculate DOM depth (limited to avoid performance issues)
  const domDepth = getDOMDepth(documentElement);
  
  // Store results
  testResults.renderPerformance.domAnalysis = {
    elementCount,
    domDepth,
    elementTypes: elementCounts
  };
};

/**
 * Check network requests and optimization opportunities
 */
const checkNetworkRequests = async () => {
  // Analyze current page resources
  const resources = performance.getEntriesByType('resource') || [];
  
  // Count by content type
  const resourceTypes = {
    script: 0,
    css: 0,
    font: 0,
    img: 0,
    fetch: 0,
    xhr: 0,
    other: 0
  };
  
  const sizes = {
    script: 0,
    css: 0,
    font: 0,
    img: 0,
    fetch: 0,
    xhr: 0,
    other: 0
  };
  
  let cacheable = 0;
  let cached = 0;
  let compressible = 0;
  let compressed = 0;
  let totalSize = 0;
  
  // Categorize resources
  resources.forEach(resource => {
    const url = resource.name;
    const size = resource.transferSize || 0;
    totalSize += size;
    
    // Determine resource type
    let type = 'other';
    if (url.match(/\.js(\?|$)/)) type = 'script';
    else if (url.match(/\.css(\?|$)/)) type = 'css';
    else if (url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)(\?|$)/)) type = 'img';
    else if (url.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/)) type = 'font';
    else if (resource.initiatorType === 'fetch') type = 'fetch';
    else if (resource.initiatorType === 'xmlhttprequest') type = 'xhr';
    
    // Count resource
    resourceTypes[type]++;
    sizes[type] += size;
    
    // Check caching
    if (resource.transferSize === 0 && resource.encodedBodySize > 0) {
      cached++;
    }
    
    // Count potentially cacheable resources
    if (url.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf)(\?|$)/)) {
      cacheable++;
    }
    
    // Count potentially compressible resources
    if (url.match(/\.(js|css|html|json|xml|txt)(\?|$)/)) {
      compressible++;
      
      // Estimate if compressed (this is an approximation)
      if (resource.encodedBodySize > 0 && 
          resource.transferSize > 0 && 
          resource.transferSize < resource.encodedBodySize) {
        compressed++;
      }
    }
  });
  
  // Calculate cache hit ratio
  const cacheHitRatio = resources.length > 0 ? cached / resources.length : 0;
  
  // Store results
  testResults.networkOptimization = {
    initialRequests: {
      total: resources.length,
      byType: resourceTypes,
      bySize: sizes,
      totalSize
    },
    caching: {
      cacheable,
      cached,
      cacheHitRatio
    },
    compression: {
      compressible,
      compressed,
      compressionRatio: compressible > 0 ? compressed / compressible : 0
    }
  };
};

/**
 * Start continuous monitoring of resource usage
 */
const startResourceUsageMonitoring = (detailed) => {
  // Monitor memory usage
  const memoryInterval = setInterval(monitorMemoryUsage, 1000);
  monitoringIntervals.push(memoryInterval);
  
  // Monitor frame rate
  const frameRateInterval = setInterval(monitorFrameRate, 1000);
  monitoringIntervals.push(frameRateInterval);
  
  // Monitor network activity
  const networkInterval = setInterval(monitorNetworkActivity, 2000);
  monitoringIntervals.push(networkInterval);
  
  // If detailed mode is enabled, collect more data
  if (detailed) {
    // Add more intensive monitoring here
  }
  
  // Auto-stop monitoring after 30 seconds
  setTimeout(() => {
    monitoringIntervals.forEach(clearInterval);
    monitoringIntervals = [];
    isTestingActive = false;
  }, 30000);
};

/**
 * Monitor memory usage
 */
const monitorMemoryUsage = () => {
  // Check if memory API is available
  if (performance.memory) {
    const { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
    
    // Convert to MB for readability
    const memoryData = {
      timestamp: performance.now() - testStartTime,
      totalJSHeapSize: totalJSHeapSize / (1024 * 1024),
      usedJSHeapSize: usedJSHeapSize / (1024 * 1024),
      jsHeapSizeLimit: jsHeapSizeLimit / (1024 * 1024),
      usageRatio: usedJSHeapSize / jsHeapSizeLimit
    };
    
    // Store reading
    testResults.resourceUsage.memoryReadings.push(memoryData);
    
    // Check for memory leaks (increasing trend)
    if (testResults.resourceUsage.memoryReadings.length > 5) {
      const readings = testResults.resourceUsage.memoryReadings;
      const firstFew = readings.slice(0, 3);
      const lastFew = readings.slice(-3);
      
      const firstAvg = firstFew.reduce((sum, r) => sum + r.usedJSHeapSize, 0) / firstFew.length;
      const lastAvg = lastFew.reduce((sum, r) => sum + r.usedJSHeapSize, 0) / lastFew.length;
      
      testResults.resourceUsage.memoryLeakDetected = lastAvg > firstAvg * 1.2; // 20% increase
    }
  } else {
    // If memory API is not available, add a placeholder
    if (testResults.resourceUsage.memoryReadings.length === 0) {
      testResults.resourceUsage.memoryReadings.push({
        timestamp: 0,
        error: "Memory API not available"
      });
    }
  }
};

/**
 * Monitor frame rate using requestAnimationFrame
 */
const monitorFrameRate = () => {
  let frameCount = 0;
  let lastTimestamp = performance.now();
  
  const countFrames = () => {
    // Increment frame counter
    frameCount++;
    
    // Calculate FPS every second
    const now = performance.now();
    const elapsed = now - lastTimestamp;
    
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      
      // Store FPS reading
      testResults.renderPerformance.fpsReadings.push({
        timestamp: now - testStartTime,
        fps,
        elapsed
      });
      
      // Reset counters
      frameCount = 0;
      lastTimestamp = now;
    }
    
    // Continue only if testing is active
    if (isTestingActive) {
      requestAnimationFrame(countFrames);
    }
  };
  
  // Start counting frames
  requestAnimationFrame(countFrames);
};

/**
 * Monitor ongoing network activity
 */
const monitorNetworkActivity = () => {
  const initialResourceCount = testResults.networkOptimization?.initialRequests?.total || 0;
  const currentResources = performance.getEntriesByType('resource')?.length || 0;
  
  // Store network activity
  if (!testResults.networkOptimization.ongoingActivity) {
    testResults.networkOptimization.ongoingActivity = [];
  }
  
  testResults.networkOptimization.ongoingActivity.push({
    timestamp: performance.now() - testStartTime,
    newRequests: Math.max(0, currentResources - initialResourceCount),
    totalRequests: currentResources
  });
  
  // Check for excessive polling or background requests
  const readings = testResults.networkOptimization.ongoingActivity;
  if (readings.length > 2) {
    const requestsPerSecond = readings.reduce((sum, r) => sum + r.newRequests, 0) / 
                             (readings[readings.length - 1].timestamp / 1000);
    
    testResults.networkOptimization.backgroundRequestRate = requestsPerSecond;
    testResults.networkOptimization.excessivePolling = requestsPerSecond > 2; // More than 2 requests per second
  }
};

/**
 * Check storage usage (localStorage, IndexedDB, etc.)
 */
const checkStorageUsage = async () => {
  try {
    // Use our safe storage checking utility
    const storageData = await safeCheckStorageUsage();
    
    // Store results
    testResults.storageUsage = storageData;
    
    // Check for excessive localStorage usage
    testResults.storageUsage.excessiveLocalStorage = 
      storageData.localStorage && storageData.localStorage.size > 2.5 * 1024 * 1024; // > 2.5MB
  } catch (error) {
    console.error('Error checking storage:', error);
    testResults.storageUsage = {
      error: 'Failed to check storage usage',
      errorDetail: error.message
    };
  }
};

/**
 * Monitor app's impact on battery (using Battery API and power-intensive operations detection)
 */
const monitorBatteryUsage = async () => {
  // Battery API check
  try {
    if (navigator.getBattery) {
      const battery = await navigator.getBattery();
      
      testResults.batteryImpact.batteryInfo = {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    }
  } catch (e) {
    console.error('Battery API error:', e);
  }
  
  // Estimate battery impact factors
  const estimateBatteryImpact = () => {
    // Gather metrics that correlate with battery usage
    const fpsReadings = testResults.renderPerformance.fpsReadings || [];
    const avgFps = fpsReadings.length > 0 
      ? fpsReadings.reduce((sum, r) => sum + r.fps, 0) / fpsReadings.length 
      : 60;
    
    const memoryReadings = testResults.resourceUsage.memoryReadings || [];
    const avgMemory = memoryReadings.length > 0
      ? memoryReadings.reduce((sum, r) => sum + (r.usedJSHeapSize || 0), 0) / memoryReadings.length
      : 0;
    
    const networkActivity = testResults.networkOptimization.backgroundRequestRate || 0;
    
    // Calculate estimated impact factors
    const lowFpsImpact = avgFps < 30 ? (30 - avgFps) / 30 : 0;
    const memoryImpact = avgMemory > 50 ? Math.min((avgMemory - 50) / 100, 1) : 0;
    const networkImpact = networkActivity * 0.2; // Each request/sec adds 0.2 to impact
    
    // Final battery impact score (0 to 100)
    const batteryImpactScore = Math.min(
      (lowFpsImpact * 30) + (memoryImpact * 40) + (networkImpact * 30),
      100
    );
    
    return {
      totalImpactScore: Math.round(batteryImpactScore),
      factors: {
        rendering: Math.round(lowFpsImpact * 100),
        memory: Math.round(memoryImpact * 100),
        network: Math.round(networkImpact * 100),
      }
    };
  };
  
  // Store impact estimation
  testResults.batteryImpact.estimatedImpact = estimateBatteryImpact();
};

/**
 * Analyze animation performance 
 */
const analyzeAnimationPerformance = () => {
  // Set up animation test measurement
  const testElement = document.createElement('div');
  testElement.style.width = '10px';
  testElement.style.height = '10px';
  testElement.style.position = 'fixed';
  testElement.style.bottom = '0';
  testElement.style.right = '0';
  testElement.style.opacity = '0.01';
  testElement.style.backgroundColor = 'red';
  testElement.style.zIndex = '-1000';
  testElement.id = 'performance-test-element';
  
  // Animation test runs for 2 seconds
  const animationTest = () => {
    const startTime = performance.now();
    let frameCount = 0;
    let lastPosition = 0;
    const duration = 2000; // 2 seconds
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed >= duration) {
        // Test complete
        testElement.remove();
        
        // Store results
        const fps = Math.round((frameCount / duration) * 1000);
        testResults.renderPerformance.animationTest = {
          frameCount,
          duration,
          fps,
          smoothness: Math.min(100, Math.round((fps / 60) * 100))
        };
        return;
      }
      
      // Update position for animation
      const newPosition = Math.sin(elapsed / 100) * 10;
      if (newPosition !== lastPosition) {
        lastPosition = newPosition;
        testElement.style.transform = `translateY(${newPosition}px)`;
        frameCount++;
      }
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    document.body.appendChild(testElement);
    requestAnimationFrame(animate);
  };
  
  // Wait a bit before running the animation test
  setTimeout(animationTest, 1000);
};

/**
 * Analyze load time results and create performance score
 */
const analyzeLoadTimeResults = () => {
  // Get load time metrics
  const { totalPageLoad, ttfb } = testResults.loadTime;
  
  // Calculate performance scores (0-100 scale)
  const getLoadTimeScore = () => {
    if (!totalPageLoad) return null;
    
    // Score based on total load time
    // Below 1000ms: excellent (90-100)
    // 1000-2000ms: good (70-90)
    // 2000-3000ms: average (50-70)
    // 3000-5000ms: slow (30-50)
    // Above 5000ms: very slow (0-30)
    if (totalPageLoad < 1000) return 90 + (1000 - totalPageLoad) / 100;
    if (totalPageLoad < 2000) return 70 + (2000 - totalPageLoad) / 33.3;
    if (totalPageLoad < 3000) return 50 + (3000 - totalPageLoad) / 50;
    if (totalPageLoad < 5000) return 30 + (5000 - totalPageLoad) / 66.7;
    return Math.max(0, 30 - (totalPageLoad - 5000) / 1000);
  };
  
  const getTtfbScore = () => {
    if (!ttfb) return null;
    
    // Score based on TTFB
    // Below 100ms: excellent (90-100)
    // 100-200ms: good (70-90)
    // 200-500ms: average (50-70)
    // 500-1000ms: slow (30-50)
    // Above 1000ms: very slow (0-30)
    if (ttfb < 100) return 90 + (100 - ttfb) / 10;
    if (ttfb < 200) return 70 + (200 - ttfb) / 3.33;
    if (ttfb < 500) return 50 + (500 - ttfb) / 10;
    if (ttfb < 1000) return 30 + (1000 - ttfb) / 16.67;
    return Math.max(0, 30 - (ttfb - 1000) / 100);
  };
  
  // Store performance scores
  testResults.performanceScores = {
    loadTime: getLoadTimeScore(),
    ttfb: getTtfbScore(),
    overall: Math.round((getLoadTimeScore() || 50) * 0.6 + (getTtfbScore() || 50) * 0.4)
  };
};

/**
 * Generate recommendations based on test results
 */
const generateRecommendations = () => {
  const recommendations = {
    criticalIssues: [],
    loadTime: [],
    renderPerformance: [],
    networkOptimization: [],
    storageOptimization: [],
    batteryImpact: []
  };
  
  // Load time recommendations
  if (testResults.loadTime.totalPageLoad > 3000) {
    recommendations.loadTime.push('Reduce page load time - current load time exceeds 3 seconds');
  }
  
  if (testResults.loadTime.ttfb > 500) {
    recommendations.loadTime.push('Improve Time to First Byte (TTFB) - server response time is too slow');
  }
  
  // Check resource size
  const resourceAnalysis = testResults.loadTime.resourceAnalysis;
  if (resourceAnalysis && resourceAnalysis.totalSize > 2 * 1024 * 1024) {
    recommendations.loadTime.push('Reduce total resource size - current size exceeds 2MB');
  }
  
  // Network optimization recommendations
  const networkOpt = testResults.networkOptimization;
  
  if (networkOpt.caching && networkOpt.caching.cacheHitRatio < 0.5) {
    recommendations.networkOptimization.push('Improve caching strategy - cache hit ratio is below 50%');
  }
  
  if (networkOpt.compression && networkOpt.compression.compressionRatio < 0.7) {
    recommendations.networkOptimization.push('Enable compression for more resources - current compression coverage is insufficient');
  }
  
  // Check for excessive requests
  if (networkOpt.initialRequests && networkOpt.initialRequests.total > 50) {
    recommendations.networkOptimization.push('Reduce number of network requests - over 50 requests detected');
  }
  
  // Check for excessive background polling
  if (networkOpt.excessivePolling) {
    recommendations.networkOptimization.push('Reduce background network activity - excessive polling detected');
  }
  
  // DOM size recommendations
  const domAnalysis = testResults.renderPerformance.domAnalysis;
  if (domAnalysis && domAnalysis.elementCount > 1500) {
    recommendations.renderPerformance.push('Reduce DOM size - over 1500 elements detected');
  }
  
  if (domAnalysis && domAnalysis.domDepth > 20) {
    recommendations.renderPerformance.push('Simplify DOM structure - excessive nesting depth detected');
  }
  
  // Frame rate recommendations
  const fpsReadings = testResults.renderPerformance.fpsReadings;
  if (fpsReadings && fpsReadings.length > 0) {
    const avgFps = fpsReadings.reduce((sum, r) => sum + r.fps, 0) / fpsReadings.length;
    if (avgFps < 30) {
      recommendations.renderPerformance.push('Improve frame rate - average FPS is below 30');
    }
  }
  
  // Animation performance
  const animTest = testResults.renderPerformance.animationTest;
  if (animTest && animTest.smoothness < 80) {
    recommendations.renderPerformance.push('Optimize animations - animation smoothness is below 80%');
  }
  
  // Memory usage recommendations
  const memReadings = testResults.resourceUsage.memoryReadings;
  if (memReadings && memReadings.length > 0) {
    const lastReading = memReadings[memReadings.length - 1];
    if (lastReading.usedJSHeapSize > 100) {
      recommendations.renderPerformance.push('Reduce memory usage - over 100MB of JS heap used');
    }
  }
  
  if (testResults.resourceUsage.memoryLeakDetected) {
    recommendations.criticalIssues.push('Potential memory leak detected - memory usage is continuously increasing');
  }
  
  // Storage recommendations
  const storage = testResults.storageUsage;
  
  if (storage.excessiveLocalStorage) {
    recommendations.storageOptimization.push('Reduce localStorage usage - excessive data stored locally');
  }
  
  if (storage.storageQuota && storage.storageQuota.usagePercent > 70) {
    recommendations.storageOptimization.push('Storage quota usage is high (over 70%) - consider cleaning up unused data');
  }
  
  // Battery impact recommendations
  const batteryImpact = testResults.batteryImpact.estimatedImpact;
  
  if (batteryImpact && batteryImpact.totalImpactScore > 60) {
    recommendations.batteryImpact.push('High battery usage detected - optimize app for better energy efficiency');
  }
  
  if (batteryImpact && batteryImpact.factors.network > 50) {
    recommendations.batteryImpact.push('Reduce network activity to improve battery life');
  }
  
  if (batteryImpact && batteryImpact.factors.rendering > 50) {
    recommendations.batteryImpact.push('Optimize rendering performance to reduce battery consumption');
  }
  
  // Store recommendations
  testResults.recommendations = recommendations;
};

/**
 * Get the current test results
 * @returns {Object} - The current performance test results
 */
export const getPerformanceTestResults = () => {
  return { ...testResults };
};

const PerformanceTestUtils = {
  initPerformanceTests,
  getPerformanceTestResults
}; 

export default PerformanceTestUtils;