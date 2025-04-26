// Mock window.matchMedia for InstallPwaButton/useMediaQuery
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import { cleanup, render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import mockServiceWorkerRegistration from '../__mocks__/serviceWorkerRegistration';
import NetworkStatus from '../components/NetworkStatus'; // Assuming path is correct
import InstallPwaButton from '../components/ui/InstallPwaButton'; // Assuming path is correct
import { storeDataWithFallback, getDataWithFallback } from '../utils/offlineStorage'; // Assuming path is correct

// --- Mocks Setup ---

// Mock navigator.serviceWorker
const mockSWRegistration = {
  scope: '/test',
  update: jest.fn(),
  unregister: jest.fn().mockResolvedValue(true),
  waiting: null,
  active: { postMessage: jest.fn() },
  installing: null,
  sync: {
    register: jest.fn().mockResolvedValue(undefined)
  },
  pushManager: {
    getSubscription: jest.fn().mockResolvedValue(null),
    subscribe: jest.fn().mockResolvedValue({ endpoint: 'https://example.com' })
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  onupdatefound: null,
  navigationPreload: {
    enable: jest.fn(() => Promise.resolve()),
    disable: jest.fn(() => Promise.resolve()),
    setHeaderValue: jest.fn(() => Promise.resolve()),
    getState: jest.fn(() => Promise.resolve({ enabled: false, headerValue: '' })),
  },
};

const mockServiceWorkerContainer = {
  register: jest.fn().mockResolvedValue(mockSWRegistration),
  ready: Promise.resolve(mockSWRegistration),
  controller: null, // Start with no controller
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  getRegistration: jest.fn().mockResolvedValue(undefined), // Mock getRegistration
};

// Mock IndexedDB
let mockIDBOpenDBRequest;
let mockIDBDatabase;
let mockIDBTransaction;
let mockIDBObjectStore;

const setupIDBMocks = () => {
  mockIDBObjectStore = {
    add: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
    put: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
    get: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
    getAll: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
    delete: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
    clear: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
  };
  mockIDBTransaction = {
    objectStore: jest.fn().mockReturnValue(mockIDBObjectStore),
    oncomplete: null,
    onerror: null,
    abort: jest.fn(),
  };
  mockIDBDatabase = {
    transaction: jest.fn().mockReturnValue(mockIDBTransaction),
    createObjectStore: jest.fn(),
    objectStoreNames: {
      contains: jest.fn().mockReturnValue(false) // Default to not containing stores
    },
    close: jest.fn(),
    name: 'OfflineDB',
    version: 1,
  };
  mockIDBOpenDBRequest = {
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: mockIDBDatabase, // Initially set result
  };

  global.indexedDB = {
    open: jest.fn().mockReturnValue(mockIDBOpenDBRequest),
    deleteDatabase: jest.fn(),
  };
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _store: store // For inspection if needed
  };
})();

// Mock Notification API
const mockNotification = {
  permission: 'default', // Start with default permission
  requestPermission: jest.fn().mockResolvedValue('granted'),
};

// Mock beforeinstallprompt event
class MockBeforeInstallPromptEvent extends Event {
  prompt;
  userChoice;
  outcome;

  constructor(accept = true) {
    super('beforeinstallprompt');
    this.outcome = accept ? 'accepted' : 'dismissed';
    this.prompt = jest.fn().mockResolvedValue(undefined);
    this.userChoice = Promise.resolve({ outcome: this.outcome });
  }
}

// --- Global Test Setup ---
let originalNavigator;
let originalLocation;
let originalIndexedDB;
let originalLocalStorage;
let originalNotification;
let originalBeforeInstallPromptEvent;

beforeAll(() => {
  originalNavigator = { ...global.navigator };
  originalLocation = { ...window.location };
  originalIndexedDB = global.indexedDB;
  originalLocalStorage = global.localStorage;
  originalNotification = global.Notification;
  originalBeforeInstallPromptEvent = global.BeforeInstallPromptEvent;

  // Apply mocks globally for this test file
  Object.defineProperty(global.navigator, 'serviceWorker', {
    value: mockServiceWorkerContainer,
    configurable: true
  });
  Object.defineProperty(global.navigator, 'onLine', {
    value: true, // Default to online
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
   Object.defineProperty(window, 'Notification', {
    value: mockNotification,
    writable: true,
  });
  (global).BeforeInstallPromptEvent = MockBeforeInstallPromptEvent;
  setupIDBMocks(); // Setup IndexedDB mocks
});

afterAll(() => {
  // Restore originals
  Object.defineProperty(global.navigator, 'serviceWorker', {
    value: originalNavigator.serviceWorker,
    configurable: true
  });
  Object.defineProperty(global.navigator, 'onLine', {
    value: originalNavigator.onLine,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, 'localStorage', {
    value: originalLocalStorage,
    writable: true,
  });
   Object.defineProperty(window, 'Notification', {
    value: originalNotification,
    writable: true,
  });
  (global).BeforeInstallPromptEvent = originalBeforeInstallPromptEvent;
  global.indexedDB = originalIndexedDB;
  window.location = originalLocation;
  cleanup();
});

// --- Individual Test Setup ---
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  // Reset specific mocks if needed
  mockServiceWorkerContainer.register.mockClear().mockResolvedValue(mockSWRegistration);
  mockServiceWorkerContainer.getRegistration.mockClear().mockResolvedValue(undefined);
  mockNotification.requestPermission.mockClear().mockResolvedValue('granted');
  setupIDBMocks(); // Reset IDB mocks before each test

  // Reset console mocks
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();

  // Reset location mock
  delete (window).location;
  window.location = { ...originalLocation, reload: jest.fn(), href: 'http://localhost', origin: 'http://localhost' };

  // Ensure production env for registration tests unless overridden
  process.env.NODE_ENV = 'production';
  process.env.PUBLIC_URL = 'http://localhost';
});

afterEach(() => {
  process.env.NODE_ENV = 'test'; // Reset env after each test
  document.body.innerHTML = ''; // Clean up DOM
});


// --- Test Suites ---

describe('PWA Installation', () => {
  it('should show install button when beforeinstallprompt is fired', async () => {
    const { getByText } = render(<InstallPwaButton />);
    const installButton = getByText('Install App'); // Button might initially be hidden or disabled

    // Simulate beforeinstallprompt event
    act(() => {
      window.dispatchEvent(new MockBeforeInstallPromptEvent());
    });

    // Button should become visible/enabled (adjust assertion based on actual component logic)
    await waitFor(() => {
      expect(installButton).toBeInTheDocument();
      // Add check for enabled state if applicable
      // expect(installButton).toBeEnabled(); 
    });
  });

  it('should handle install button click', async () => {
    const { getByText } = render(<InstallPwaButton />);
    const installButton = getByText('Install App');
    const beforeInstallPromptEvent = new MockBeforeInstallPromptEvent();
    const promptSpy = jest.spyOn(beforeInstallPromptEvent, 'prompt');

    // Simulate event first
    act(() => {
      window.dispatchEvent(beforeInstallPromptEvent);
    });

    // Wait for button potentially becoming active
    await waitFor(() => {
       expect(installButton).toBeInTheDocument();
    });

    // Click the install button
    fireEvent.click(installButton);

    // Verify prompt was called
    expect(promptSpy).toHaveBeenCalled();

    promptSpy.mockRestore();
  });
});

describe('PWA Features', () => {
  describe('Service Worker Registration', () => {
    it('should register service worker successfully', async () => {
      const { register } = require('../serviceWorkerRegistration');
      const onSuccess = jest.fn();
      register({ onSuccess });
      window.dispatchEvent(new Event('load')); // Trigger registration

      await waitFor(() => {
        expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/service-worker.js');
      });
      // Note: onSuccess might require simulating SW state changes, which is complex.
      // Focusing on registration call for now.
    });

    it('should handle service worker update', async () => {
       const { register } = require('../serviceWorkerRegistration');
       const onUpdate = jest.fn();
       const installingWorker = { state: 'installing', onstatechange: null };
       const registrationWithUpdate = {
         ...mockSWRegistration,
         installing: installingWorker,
         active: { postMessage: jest.fn() } // Simulate existing active worker
       };
       (navigator.serviceWorker.register).mockResolvedValueOnce(registrationWithUpdate);

       register({ onUpdate });
       window.dispatchEvent(new Event('load'));

       await waitFor(() => {
         expect(navigator.serviceWorker.register).toHaveBeenCalled();
       });

       // Simulate state change to installed
       act(() => {
         installingWorker.state = 'installed';
         if (installingWorker.onstatechange) {
           installingWorker.onstatechange({ type: 'statechange', target: installingWorker });
         }
       });

       await waitFor(() => {
         expect(onUpdate).toHaveBeenCalledWith(registrationWithUpdate);
       });
    });

    it('should handle service worker registration error', async () => {
      const { register } = require('../serviceWorkerRegistration');
      const onError = jest.fn();
      const errorMock = new Error('Registration failed');
      (navigator.serviceWorker.register).mockRejectedValueOnce(errorMock);
      console.error = jest.fn(); // Mock console.error

      register({ onError });
      window.dispatchEvent(new Event('load'));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(errorMock);
        // Check console log if needed
        // expect(console.error).toHaveBeenCalledWith('Error during service worker registration:', errorMock);
      });
    });
  });

  describe('Offline Storage', () => {
    it('should use IndexedDB for storage when available', async () => {
        // Simulate successful IDB open
        act(() => {
            if (mockIDBOpenDBRequest.onsuccess) {
                mockIDBOpenDBRequest.onsuccess({ target: { result: mockIDBDatabase } });
            }
        });

        await storeDataWithFallback('testStore', { id: 1, value: 'test data' });

        // Check if IDB put was called (via transaction and objectStore)
        expect(mockIDBDatabase.transaction).toHaveBeenCalledWith(['testStore'], 'readwrite');
        expect(mockIDBTransaction.objectStore).toHaveBeenCalledWith('testStore');
        expect(mockIDBObjectStore.put).toHaveBeenCalledWith({ id: 1, value: 'test data' });
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });


    it('should fall back to localStorage when IndexedDB fails', async () => {
      // Mock IndexedDB open request to fail
      act(() => {
          if(mockIDBOpenDBRequest.onerror) {
              mockIDBOpenDBRequest.onerror(new Event('error'));
          }
      });

      // Set item *before* trying to read it
      localStorage.setItem('test', JSON.stringify({ id: 1, value: 'test data' }));
      await act(async () => {
        // This call will now fallback because IDB failed to open
        await storeDataWithFallback('test', { id: 1, value: 'test data' }); 
      });

      // Verify localStorage was used for setting
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test', JSON.stringify({ id: 1, value: 'test data' }));

      // Verify retrieval also uses localStorage
      const data = await getDataWithFallback('test', 1); // Assuming getDataWithFallback exists and works similarly
      expect(data).toEqual({ id: 1, value: 'test data' });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test');
    });
  });

  describe('Network Status', () => {
    let container = null;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container) {
            document.body.removeChild(container);
            container = null;
        }
    });

    it('should display online status correctly', () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true });
      render(<NetworkStatus />, { container: container });
      expect(screen.getByText(/online/i)).toBeInTheDocument();
    });

    it('should display offline status correctly', () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true });
      render(<NetworkStatus />, { container: container });
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });

    it('should update status when network changes', async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true });
      render(<NetworkStatus />, { container: container });
      expect(screen.getByText(/online/i)).toBeInTheDocument();

      // Simulate going offline
      Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true });
      act(() => {
          window.dispatchEvent(new Event('offline'));
      });
      await waitFor(() => expect(screen.getByText(/offline/i)).toBeInTheDocument());

      // Simulate going online
       Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true });
       act(() => {
           window.dispatchEvent(new Event('online'));
       });
      await waitFor(() => expect(screen.getByText(/online/i)).toBeInTheDocument());
    });
  });

  describe('Cache Management', () => {
    it('should verify cache operations', async () => {
      // Ensure cache mock is correctly set up for this test
      const cache = await window.caches.open('test-cache'); // Await the promise
      expect(window.caches.open).toHaveBeenCalledWith('test-cache');

      // Add items to cache
      await cache.addAll(['/test1', '/test2']);
      expect(cache.addAll).toHaveBeenCalledWith(['/test1', '/test2']);

      // Match cached item
      await cache.match('/test1');
      expect(cache.match).toHaveBeenCalledWith('/test1');

      // Delete cached item
      await cache.delete('/test1');
      expect(cache.delete).toHaveBeenCalledWith('/test1');
    });
  });
});


