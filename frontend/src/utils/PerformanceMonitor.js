/**
 * PerformanceMonitor utility
 * Tracks application performance metrics and errors
 */

// Storage for performance marks and measures
const performanceData = {
  marks: {},
  measures: {},
  errors: [],
  events: []
};

// Maximum number of entries to keep in history
const MAX_HISTORY = 100;

/**
 * Initialize performance monitoring
 */
const initPerformanceMonitoring = () => {
  // Only initialize if the Performance API is available
  if (!window.performance) {
    console.warn('Performance API not available');
    return false;
  }

  // Clear any existing performance data
  if (window.performance.clearMarks) {
    window.performance.clearMarks();
  }
  if (window.performance.clearMeasures) {
    window.performance.clearMeasures();
  }

  // Reset stored data
  performanceData.marks = {};
  performanceData.measures = {};
  performanceData.errors = [];
  performanceData.events = [];

  // Record initial load time
  mark('app_init');

  // Listen for errors
  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message));
  });

  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason || new Error('Unhandled promise rejection'));
  });

  // Track page visibility
  document.addEventListener('visibilitychange', () => {
    reportEvent('visibility_change', { 
      hidden: document.hidden,
      timestamp: Date.now()
    });
  });

  // Record network status
  window.addEventListener('online', () => {
    reportEvent('network_status', { status: 'online' });
  });
  window.addEventListener('offline', () => {
    reportEvent('network_status', { status: 'offline' });
  });

  return true;
};

/**
 * Create a performance mark
 * @param {string} name - Name of the mark
 */
const mark = (name) => {
  if (!window.performance || !window.performance.mark) {
    return;
  }

  try {
    // Create the mark
    window.performance.mark(name);
    
    // Store mark data
    performanceData.marks[name] = {
      name,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error creating performance mark:', error);
  }
};

/**
 * Create a performance measure between two marks
 * @param {string} name - Name of the measure
 * @param {string} startMark - Starting mark name
 * @param {string} endMark - Ending mark name
 * @returns {number|null} Duration in milliseconds or null if measure failed
 */
const measure = (name, startMark, endMark) => {
  if (!window.performance || !window.performance.measure) {
    return null;
  }

  try {
    // Create the measure
    window.performance.measure(name, startMark, endMark);
    
    // Get the measure
    const entries = window.performance.getEntriesByName(name, 'measure');
    const duration = entries.length > 0 ? entries[0].duration : null;
    
    // Store measure data
    performanceData.measures[name] = {
      name,
      startMark,
      endMark,
      duration,
      timestamp: Date.now()
    };
    
    return duration;
  } catch (error) {
    console.error('Error creating performance measure:', error);
    return null;
  }
};

/**
 * Report an error
 * @param {Error|string} error - Error object or message
 * @param {Object} [metadata] - Additional metadata about the error
 */
const reportError = (error, metadata = {}) => {
  const errorData = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : null,
    timestamp: Date.now(),
    metadata
  };
  
  // Add to local storage
  performanceData.errors.push(errorData);
  
  // Keep only the most recent errors
  if (performanceData.errors.length > MAX_HISTORY) {
    performanceData.errors = performanceData.errors.slice(-MAX_HISTORY);
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Application error:', errorData);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Here you would integrate with your analytics service
    // Example: sendToAnalytics('error', errorData);
  }
};

/**
 * Report a custom event
 * @param {string} eventName - Name of the event
 * @param {Object} [data] - Event data
 */
const reportEvent = (eventName, data = {}) => {
  const eventData = {
    name: eventName,
    data,
    timestamp: Date.now()
  };
  
  // Add to local storage
  performanceData.events.push(eventData);
  
  // Keep only the most recent events
  if (performanceData.events.length > MAX_HISTORY) {
    performanceData.events = performanceData.events.slice(-MAX_HISTORY);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Here you would integrate with your analytics service
    // Example: sendToAnalytics('event', eventData);
  }
};

/**
 * Report web vitals metric
 * @param {Object} metric - Web vitals metric object
 */
const reportWebVital = (metric) => {
  // Store the metric
  reportEvent('web_vital', metric);
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Here you would integrate with your analytics service
    // Example: sendToAnalytics('web_vital', metric);
  }
};

/**
 * Get all collected performance data
 * @returns {Object} All performance data
 */
const getAllPerformanceData = () => {
  return { ...performanceData };
};

const PerformanceMonitor = {
  initPerformanceMonitoring,
  mark,
  measure,
  reportError,
  reportEvent,
  reportWebVital,
  getAllPerformanceData
}; 

export default PerformanceMonitor;