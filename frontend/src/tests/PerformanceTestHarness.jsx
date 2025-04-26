import React, { useState, useEffect } from 'react';
import PerformanceTest from '../utils/PerformanceTest';
import { motion } from 'framer-motion';
import { checkPWASupport } from '../utils/storageUtils';

/**
 * Performance Test Harness component
 * Runs comprehensive performance tests and displays results
 */
const PerformanceTestHarness = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState(null);
  const [pwaStatus, setPwaStatus] = useState(null);
  
  // Check PWA status on component mount
  useEffect(() => {
    try {
      const status = checkPWASupport();
      setPwaStatus(status);
    } catch (err) {
      console.error('Error checking PWA status:', err);
    }
  }, []);
  
  // Start performance tests
  const startTests = async () => {
    setIsRunning(true);
    setResults(null);
    setError(null);
    
    try {
      // Initialize tests
      await PerformanceTest.initPerformanceTests(isDetailedMode);
      
      // Poll for results every 3 seconds
      const intervalId = setInterval(() => {
        try {
          const currentResults = PerformanceTest.getPerformanceTestResults();
          setResults({ ...currentResults });
          
          // Check if testing is complete (recommendations exist)
          if (currentResults.recommendations) {
            clearInterval(intervalId);
            setIsRunning(false);
          }
        } catch (intervalError) {
          // Handle errors during polling
          console.error('Error polling test results:', intervalError);
          clearInterval(intervalId);
          setIsRunning(false);
          setError('Failed to retrieve test results. Please try again.');
        }
      }, 3000);
      
      // Force stop after 45 seconds as a safety
      setTimeout(() => {
        clearInterval(intervalId);
        if (isRunning) {
          setIsRunning(false);
          setError('Test timed out. Some results may be incomplete.');
        }
      }, 45000);
    } catch (error) {
      console.error('Error running performance tests:', error);
      setIsRunning(false);
      setError(`Failed to start performance tests: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Generate test summary
  const generateSummary = () => {
    if (!results) return null;
    
    // Create summary object
    const summary = {
      issues: {
        critical: results.recommendations?.criticalIssues?.length || 0,
        performance: 0,
        network: 0,
        storage: 0,
        battery: 0
      },
      metrics: {
        loadTime: results.loadTime?.totalPageLoad ? `${(results.loadTime.totalPageLoad / 1000).toFixed(2)}s` : 'N/A',
        domElements: results.renderPerformance?.domAnalysis?.elementCount || 'N/A',
        averageFps: results.renderPerformance?.fpsReadings?.length > 0 
          ? (results.renderPerformance.fpsReadings.reduce((sum, reading) => sum + reading.fps, 0) / 
             results.renderPerformance.fpsReadings.length).toFixed(1)
          : 'N/A',
        networkRequests: results.networkOptimization?.initialRequests?.total || 'N/A',
        cacheHitRatio: results.networkOptimization?.caching?.cacheHitRatio !== undefined 
          ? `${(results.networkOptimization.caching.cacheHitRatio * 100).toFixed(1)}%`
          : 'N/A',
        memoryUsage: results.resourceUsage?.memoryReadings?.length > 0
          ? `${results.resourceUsage.memoryReadings[results.resourceUsage.memoryReadings.length - 1].usedJSHeapSize?.toFixed(1) || 'N/A'} MB`
          : 'N/A'
      }
    };
    
    // Count issues by category
    if (results.recommendations) {
      summary.issues.performance = (results.recommendations.loadTime?.length || 0) + 
                                  (results.recommendations.renderPerformance?.length || 0);
      summary.issues.network = results.recommendations.networkOptimization?.length || 0;
      summary.issues.storage = results.recommendations.storageOptimization?.length || 0;
      summary.issues.battery = results.recommendations.batteryImpact?.length || 0;
    }
    
    return summary;
  };
  
  // Render PWA status section
  const renderPWAStatus = () => {
    if (!pwaStatus) return null;
    
    return (
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">PWA Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg text-center ${pwaStatus.supportsPWA ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <div className="text-sm font-medium">Service Worker</div>
            <div className="mt-1">{pwaStatus.supportsPWA ? 'Supported' : 'Not Supported'}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${pwaStatus.supportsInstallPrompt ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
            <div className="text-sm font-medium">Install Prompt</div>
            <div className="mt-1">{pwaStatus.supportsInstallPrompt ? 'Available' : 'Not Available'}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${pwaStatus.isStandalone ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <div className="text-sm font-medium">Standalone Mode</div>
            <div className="mt-1">{pwaStatus.isStandalone ? 'Yes' : 'No'}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${pwaStatus.isPWAInstalled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <div className="text-sm font-medium">Installed</div>
            <div className="mt-1">{pwaStatus.isPWAInstalled ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render error message if there is one
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-red-800 dark:text-red-200">{error}</span>
        </div>
      </div>
    );
  };
  
  // Render the summary tab
  const renderSummaryTab = () => {
    const summary = generateSummary();
    if (!summary) {
      return (
        <div className="p-4">
          {renderError()}
          <div className="text-center p-8">
            <p className="text-muted-foreground">No results available yet. Run the tests to see performance data.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4">
        {renderError()}
        
        {/* PWA Status */}
        {renderPWAStatus()}
        
        {/* Issues Overview */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">Issues Found</h4>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
            <div className={`p-3 rounded-lg text-center ${summary.issues.critical > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <div className="text-xl font-bold">{summary.issues.critical}</div>
              <div className="text-sm">Critical</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${summary.issues.performance > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <div className="text-xl font-bold">{summary.issues.performance}</div>
              <div className="text-sm">Performance</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${summary.issues.network > 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <div className="text-xl font-bold">{summary.issues.network}</div>
              <div className="text-sm">Network</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${summary.issues.storage > 0 ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <div className="text-xl font-bold">{summary.issues.storage}</div>
              <div className="text-sm">Storage</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${summary.issues.battery > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <div className="text-xl font-bold">{summary.issues.battery}</div>
              <div className="text-sm">Battery</div>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div>
          <h4 className="text-md font-medium mb-2">Key Metrics</h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm opacity-70">Page Load Time</div>
              <div className="text-lg font-medium">{summary.metrics.loadTime}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm opacity-70">DOM Elements</div>
              <div className="text-lg font-medium">{summary.metrics.domElements}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm opacity-70">Average FPS</div>
              <div className="text-lg font-medium">{summary.metrics.averageFps}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm opacity-70">Network Requests</div>
              <div className="text-lg font-medium">{summary.metrics.networkRequests}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm opacity-70">Cache Hit Ratio</div>
              <div className="text-lg font-medium">{summary.metrics.cacheHitRatio}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm opacity-70">Memory Usage</div>
              <div className="text-lg font-medium">{summary.metrics.memoryUsage}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the issues tab
  const renderIssuesTab = () => {
    if (!results || !results.recommendations) {
      return <div className="p-4">No issues detected yet.</div>;
    }
    
    const { recommendations } = results;
    
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium mb-4">Detected Issues</h3>
        
        {/* Critical Issues */}
        {recommendations.criticalIssues && recommendations.criticalIssues.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2 text-red-600 dark:text-red-400">Critical Issues</h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.criticalIssues.map((issue, index) => (
                <li key={index} className="text-red-600 dark:text-red-400">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Load Time Issues */}
        {recommendations.loadTime && recommendations.loadTime.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">Load Time Issues</h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.loadTime.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Render Performance Issues */}
        {recommendations.renderPerformance && recommendations.renderPerformance.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">Render Performance Issues</h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.renderPerformance.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Network Optimization Issues */}
        {recommendations.networkOptimization && recommendations.networkOptimization.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">Network Optimization Issues</h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.networkOptimization.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Storage Optimization Issues */}
        {recommendations.storageOptimization && recommendations.storageOptimization.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">Storage Optimization Issues</h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.storageOptimization.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Battery Impact Issues */}
        {recommendations.batteryImpact && recommendations.batteryImpact.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">Battery Impact Issues</h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.batteryImpact.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Render the data tab (raw data)
  const renderDataTab = () => {
    if (!results) {
      return <div className="p-4">No data available yet.</div>;
    }
    
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium mb-4">Raw Performance Data</h3>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-96">
          <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
        </div>
      </div>
    );
  };
  
  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return renderSummaryTab();
      case 'issues':
        return renderIssuesTab();
      case 'data':
        return renderDataTab();
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-background dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance Test Harness</h2>
          <p className="text-sm opacity-70">Comprehensive performance analysis for PWA optimization</p>
        </div>
        
        <div className="mt-3 md:mt-0 flex items-center">
          <label className="inline-flex items-center mr-4 cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isDetailedMode}
              onChange={(e) => setIsDetailedMode(e.target.checked)}
              disabled={isRunning}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-sm font-medium">Detailed Mode</span>
          </label>
          
          <button
            onClick={startTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? 'Running Tests...' : 'Start Tests'}
          </button>
        </div>
      </div>
      
      {/* Testing progress indicator */}
      {isRunning && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3"
            />
            <div>
              <div className="font-medium">Tests in progress...</div>
              <div className="text-sm opacity-70">This may take a couple of minutes. Please do not close this page.</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs navigation */}
      <div className="border-b border-border dark:border-gray-700">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'issues'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Issues
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'data'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Raw Data
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="bg-background dark:bg-gray-900">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PerformanceTestHarness; 