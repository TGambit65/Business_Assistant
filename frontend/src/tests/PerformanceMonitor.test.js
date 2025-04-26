import PerformanceMonitor from '../utils/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Mock performance API
    if (!window.performance) {
      window.performance = {};
    }
    
    window.performance.clearMarks = jest.fn();
    window.performance.clearMeasures = jest.fn();
    window.performance.mark = jest.fn();
    window.performance.measure = jest.fn();
    window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}]);
    
    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
    
    // Mock event listeners
    window.addEventListener = jest.fn();
    document.addEventListener = jest.fn();
    
    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });
  
  test('initPerformanceMonitoring initializes successfully', () => {
    const result = PerformanceMonitor.initPerformanceMonitoring();
    
    expect(result).toBe(true);
    expect(window.performance.clearMarks).toHaveBeenCalled();
    expect(window.performance.clearMeasures).toHaveBeenCalled();
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(document.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
  
  test('initPerformanceMonitoring handles missing Performance API', () => {
    // Remove performance API
    const originalPerformance = window.performance;
    delete window.performance;
    
    const result = PerformanceMonitor.initPerformanceMonitoring();
    
    expect(result).toBe(false);
    expect(console.warn).toHaveBeenCalledWith('Performance API not available');
    
    // Restore performance API
    window.performance = originalPerformance;
  });
  
  test('mark creates a performance mark', () => {
    PerformanceMonitor.mark('test-mark');
    
    expect(window.performance.mark).toHaveBeenCalledWith('test-mark');
  });
  
  test('mark handles errors', () => {
    // Force mark to throw
    window.performance.mark.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    PerformanceMonitor.mark('test-mark');
    
    expect(console.error).toHaveBeenCalledWith('Error creating performance mark:', expect.any(Error));
  });
  
  test('measure creates a performance measure', () => {
    const result = PerformanceMonitor.measure('test-measure', 'start-mark', 'end-mark');
    
    expect(window.performance.measure).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark');
    expect(window.performance.getEntriesByName).toHaveBeenCalledWith('test-measure', 'measure');
    expect(result).toBe(100);
  });
  
  test('measure handles errors', () => {
    // Force measure to throw
    window.performance.measure.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    const result = PerformanceMonitor.measure('test-measure', 'start-mark', 'end-mark');
    
    expect(console.error).toHaveBeenCalledWith('Error creating performance measure:', expect.any(Error));
    expect(result).toBe(null);
  });
  
  test('reportError logs errors', () => {
    const testError = new Error('Test error');
    PerformanceMonitor.reportError(testError);
    
    // In development, should log to console
    process.env.NODE_ENV = 'development';
    PerformanceMonitor.reportError(testError);
  });
}); 