import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PerformanceTestHarness from '../PerformanceTestHarness';
import PerformanceTest from '../../utils/PerformanceTest';

// Mock the PerformanceTest module
jest.mock('../../utils/PerformanceTest', () => ({
  initPerformanceTests: jest.fn().mockImplementation(() => Promise.resolve()),
  getPerformanceTestResults: jest.fn()
}));

// Mock the PerformanceMonitor import in PerformanceTest
jest.mock('../../utils/PerformanceMonitor', () => ({
  initPerformanceMonitoring: jest.fn(),
  mark: jest.fn(),
  measure: jest.fn(),
  reportError: jest.fn(),
  reportEvent: jest.fn(),
  reportWebVital: jest.fn(),
  getAllPerformanceData: jest.fn()
}));

describe('Performance Testing Suite', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock window.performance
    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: jest.fn().mockReturnValue([]),
        mark: jest.fn(),
        measure: jest.fn(),
        now: jest.fn().mockReturnValue(1000),
        timing: {
          navigationStart: 0,
          loadEventEnd: 1000,
          domainLookupStart: 100,
          domainLookupEnd: 150,
          connectStart: 150,
          connectEnd: 200,
          requestStart: 200,
          responseStart: 300,
          responseEnd: 500,
          domLoading: 500,
          domComplete: 800
        }
      },
      configurable: true
    });
  });
  
  describe('PerformanceTest utility', () => {
    test('initPerformanceTests initializes performance monitoring', async () => {
      // Call the method
      await PerformanceTest.initPerformanceTests(false);
      
      // Verify it was called
      expect(PerformanceTest.initPerformanceTests).toHaveBeenCalledTimes(1);
      expect(PerformanceTest.initPerformanceTests).toHaveBeenCalledWith(false);
    });
    
    test('getPerformanceTestResults returns test results', () => {
      // Mock return value
      const mockResults = {
        loadTime: { totalPageLoad: 1000 },
        renderPerformance: { fpsReadings: [{ fps: 60 }] }
      };
      
      PerformanceTest.getPerformanceTestResults.mockReturnValue(mockResults);
      
      // Call the method
      const results = PerformanceTest.getPerformanceTestResults();
      
      // Verify result
      expect(results).toEqual(mockResults);
      expect(PerformanceTest.getPerformanceTestResults).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('PerformanceTestHarness Component', () => {
    test('renders the component correctly', () => {
      act(() => {
        render(<PerformanceTestHarness />);
      });
      
      // Check that the component rendered
      expect(screen.getByText('Performance Test Harness')).toBeInTheDocument();
      expect(screen.getByText('Start Tests')).toBeInTheDocument();
      expect(screen.getByText('Detailed Mode')).toBeInTheDocument();
    });
    
    test('starts tests when button is clicked', async () => {
      // Setup mock results
      const mockEmptyResults = {};
      const mockResultsWithRecommendations = {
        recommendations: {
          criticalIssues: [],
          loadTime: [],
          renderPerformance: [],
          networkOptimization: [],
          storageOptimization: [],
          batteryImpact: []
        }
      };
      
      // First return empty results, then return results with recommendations to simulate test completion
      PerformanceTest.getPerformanceTestResults
        .mockReturnValueOnce(mockEmptyResults)
        .mockReturnValueOnce(mockResultsWithRecommendations);
      
      act(() => {
        render(<PerformanceTestHarness />);
      });
      
      // Click the start tests button
      act(() => {
        userEvent.click(screen.getByText('Start Tests'));
      });
      
      // Check that tests started
      await waitFor(() => {
        expect(screen.getByText('Running Tests...')).toBeInTheDocument();
      });
      
      // Check that initPerformanceTests was called
      expect(PerformanceTest.initPerformanceTests).toHaveBeenCalledTimes(1);
      
      // Simulate test completion
      await waitFor(() => {
        expect(PerformanceTest.getPerformanceTestResults).toHaveBeenCalled();
      });
    });
    
    test('switches between tabs correctly', () => {
      act(() => {
        render(<PerformanceTestHarness />);
      });
      
      // Check default tab (Summary)
      expect(screen.getByText('No results available yet.')).toBeInTheDocument();
      
      // Switch to Issues tab
      act(() => {
        userEvent.click(screen.getByText('Issues'));
      });
      
      // Check Issues tab content
      expect(screen.getByText('No issues detected yet.')).toBeInTheDocument();
      
      // Switch to Data tab
      act(() => {
        userEvent.click(screen.getByText('Raw Data'));
      });
      
      // Check Data tab content
      expect(screen.getByText('No data available yet.')).toBeInTheDocument();
    });
    
    test('displays test results when available', async () => {
      // Setup mock results with data
      const mockResults = {
        loadTime: {
          totalPageLoad: 1500,
          dns: 50,
          tcp: 50,
          ttfb: 100,
          contentDownload: 200,
          domProcessing: 300
        },
        renderPerformance: {
          domAnalysis: {
            elementCount: 1000,
            domDepth: 10
          },
          fpsReadings: [
            { fps: 60, timestamp: 1000 },
            { fps: 58, timestamp: 2000 }
          ]
        },
        networkOptimization: {
          initialRequests: {
            total: 25,
            byType: {
              script: 10,
              css: 5,
              img: 8,
              fetch: 2,
              other: 0
            },
            totalSize: 1024
          },
          cacheHitRatio: 0.75
        },
        recommendations: {
          criticalIssues: [],
          loadTime: ['Optimize asset sizes'],
          renderPerformance: [],
          networkOptimization: [],
          storageOptimization: [],
          batteryImpact: []
        }
      };
      
      // Mock getPerformanceTestResults to return our test data
      PerformanceTest.getPerformanceTestResults.mockReturnValue(mockResults);
      
      act(() => {
        render(<PerformanceTestHarness />);
      });
      
      // Start tests
      act(() => {
        userEvent.click(screen.getByText('Start Tests'));
      });
      
      // Get results
      await waitFor(() => {
        expect(PerformanceTest.getPerformanceTestResults).toHaveBeenCalled();
      });
      
      // Switch to Issues tab to see recommendations
      act(() => {
        userEvent.click(screen.getByText('Issues'));
      });
      
      // Check that our recommendation appears
      await waitFor(() => {
        expect(screen.getByText('Optimize asset sizes')).toBeInTheDocument();
      });
    });
  });
}); 