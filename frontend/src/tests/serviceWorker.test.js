import { waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import * as serviceWorkerRegistration from '../serviceWorkerRegistration';
import mockServiceWorkerRegistration from '../__mocks__/serviceWorkerRegistration';

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    serviceWorker: {
      register: jest.fn().mockResolvedValue({
        scope: '/test',
        update: jest.fn(),
        unregister: jest.fn().mockResolvedValue(true),
        waiting: null,
        active: { postMessage: jest.fn() }
      }),
      ready: Promise.resolve({
        active: { postMessage: jest.fn() },
      }),
      addEventListener: jest.fn(), // Add missing mock
      removeEventListener: jest.fn() // Add for completeness
    }
  },
  writable: true
});

// Mock window methods
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue({})
});

describe('Service Worker Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock window.location
    delete window.location;
    // Provide a valid href for the URL constructor
    window.location = { reload: jest.fn(), href: 'http://localhost', origin: 'http://localhost' }; 
    
    // Setup DOM for update notification
    document.body.innerHTML = '';
  });
  
  // Helper to simulate the 'load' event and production environment
  const triggerRegistration = (config) => { // Make it synchronous again
    process.env.NODE_ENV = 'production'; // Set production environment
    serviceWorkerRegistration.register(config);
    // Simulate the load event which triggers the actual registration logic
    window.dispatchEvent(new Event('load')); 
    // Allow promises within the registration logic to resolve
    // Remove await - assertions will use waitFor 
    process.env.NODE_ENV = 'test'; // Reset environment
  };

  test('Service worker registers successfully', async () => {
    await triggerRegistration({
      onSuccess: jest.fn(),
      onUpdate: jest.fn()
    });
    
    // Wait for the mock to be called
    await waitFor(() => expect(window.navigator.serviceWorker.register).toHaveBeenCalled());
  });
  
  test('Service worker handles successful registration', async () => {
    const onSuccessMock = jest.fn();
    
    await triggerRegistration({
      onSuccess: onSuccessMock,
      onUpdate: jest.fn()
    });
    
    // Wait for the async callback to be called
    await waitFor(() => expect(onSuccessMock).toHaveBeenCalled()); 
  });
  
  test('Service worker handles update', async () => {
    // Mock service worker with waiting state
    window.navigator.serviceWorker.register.mockResolvedValueOnce({
      scope: '/test',
      update: jest.fn(),
      unregister: jest.fn().mockResolvedValue(true),
      waiting: { postMessage: jest.fn() },
      active: { postMessage: jest.fn() }
    });
    
    const onUpdateMock = jest.fn();
    
    await triggerRegistration({
      onSuccess: jest.fn(),
      onUpdate: onUpdateMock
    });
    
    // Wait for the async callback to be called
    await waitFor(() => expect(onUpdateMock).toHaveBeenCalled()); 
  });
}); 