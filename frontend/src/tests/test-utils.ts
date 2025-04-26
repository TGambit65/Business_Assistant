/**
 * Test utilities for frontend tests
 * 
 * This file contains utility functions that are used across multiple test files.
 */

/**
 * Resize the browser window to the specified dimensions
 * @param width The new width of the window
 * @param height The new height of the window
 */
export function resizeWindow(width: number, height: number): void {
  // Update window.innerWidth and window.innerHeight
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  });
  
  // Dispatch a resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Mock the matchMedia API with a specific match value
 * @param matches Whether the media query should match
 */
export function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
}

/**
 * Wait for a specified time using setTimeout
 * @param ms Time to wait in milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock the intersection observer API
 * @param isIntersecting Whether the observed element is intersecting
 */
export function mockIntersectionObserver(isIntersecting: boolean = true): void {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  });
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver
  });
  
  // Mock the callback
  mockIntersectionObserver.mockImplementation((callback) => {
    callback([{ isIntersecting }]);
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    };
  });
}

/**
 * Reset all window mocks to their original values
 */
export function resetWindowMocks(): void {
  // Reset resize properties
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: global.innerWidth
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: global.innerHeight
  });
  
  // Reset matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: global.matchMedia
  });
  
  // Reset IntersectionObserver
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: global.IntersectionObserver
  });
} 