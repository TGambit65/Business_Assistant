import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NetworkStatus from '../../components/ui/NetworkStatus';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock navigator.onLine
const originalNavigator = { ...navigator };
// Store the original property descriptor for navigator.onLine
let originalOnLineValue = navigator.onLine; // Store initial value
let hadOnLineInitially = 'onLine' in navigator; // Check if property existed

// Mock fetch
global.fetch = jest.fn();

describe('NetworkStatus Component', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Store original value before mocking
    hadOnLineInitially = 'onLine' in navigator;
    originalOnLineValue = navigator.onLine;

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: jest.fn(() => true),
    });
    
    // Mock fetch API to return successful response
    global.fetch.mockResolvedValue({
      ok: true,
    });
    
    // Mock performance.getEntriesByType
    window.performance.getEntriesByType = jest.fn().mockReturnValue([
      { duration: 500 }
    ]);
    
    // Create mock AbortController
    global.AbortController = class {
      constructor() {
        this.signal = {};
        this.abort = jest.fn();
      }
    };
  });
  
  // Clean up after tests
  afterEach(() => {
    // Restore original navigator.onLine value or delete if it wasn't there
    if (hadOnLineInitially) {
       Object.defineProperty(navigator, 'onLine', {
         configurable: true,
         writable: true, // Make it writable if needed for subsequent mocks
         value: originalOnLineValue
       });
    } else {
      // If it didn't exist originally, delete the mock property
      delete navigator.onLine; // Remove TS syntax
    }
    jest.restoreAllMocks();
  });
  
  test('renders online status with theme support', async () => {
    // Define a custom theme
    const testTheme = 'blue';
    
    // Render with theme provider
    act(() => {
      render(
        <ThemeProvider>
          <NetworkStatus />
        </ThemeProvider>
      );
    });
    
    // Component initially doesn't show
    expect(screen.queryByText('Connected')).not.toBeInTheDocument();
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        get: jest.fn(() => false),
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    // Wait for component to show
    await waitFor(() => {
      expect(screen.getByText('You are offline')).toBeInTheDocument();
    });
    
    // Check that retry button is present
    expect(screen.getByText('Retry connection')).toBeInTheDocument();
    
    // Simulate going back online
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        get: jest.fn(() => true),
      });
      window.dispatchEvent(new Event('online'));
    });
    
    // Wait for component to update
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });
  
  test('shows poor connection state with theme support', async () => {
    // Mock fetch API to return successful response but slow
    window.performance.getEntriesByType = jest.fn().mockReturnValue([
      { duration: 1500 } // Over 1000ms is considered poor
    ]);
    
    // Render with theme provider
    act(() => {
      render(
        <ThemeProvider>
          <NetworkStatus />
        </ThemeProvider>
      );
    });
    
    // Simulate going offline then online with poor connection
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        get: jest.fn(() => false),
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    // Wait for offline message
    await waitFor(() => {
      expect(screen.getByText('You are offline')).toBeInTheDocument();
    });
    
    // Now simulate going online with poor connection
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        get: jest.fn(() => true),
      });
      window.dispatchEvent(new Event('online'));
    });
    
    // Wait for poor connection message
    await waitFor(() => {
      expect(screen.getByText('Poor connection')).toBeInTheDocument();
      expect(screen.getByText('Some features may be limited')).toBeInTheDocument();
    });
  });
  
  test('handles retry action with theme support', async () => {
    // First make it offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        get: jest.fn(() => false),
      });
    });
    
    // Render with theme provider
    act(() => {
      render(
        <ThemeProvider>
          <NetworkStatus />
        </ThemeProvider>
      );
    });
    
    // Wait for component to show
    await waitFor(() => {
      expect(screen.getByText('You are offline')).toBeInTheDocument();
    });
    
    // Now prepare for retry
    global.fetch.mockClear();
    
    // Mock navigator.onLine to return true on retry
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: jest.fn(() => true),
    });
    
    // Click retry button
    act(() => {
      fireEvent.click(screen.getByText('Retry connection'));
    });
    
    // Check for loading state first
    await waitFor(() => {
      expect(screen.getByText('Checking connection...')).toBeInTheDocument();
    });
    
    // Verify fetch was called to check connection
    expect(global.fetch).toHaveBeenCalled();
    
    // Wait for connected state
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });
}); 