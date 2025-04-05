// jest.setup.js
const { IDBFactory } = require('fake-indexeddb');

// --- Mock indexedDB ---
// Use fake-indexeddb for a more complete mock
const fakeDBCore = new IDBFactory(); // Use a single factory instance

// Wrap the open method to allow intercepting for error simulation
const originalOpen = fakeDBCore.open.bind(fakeDBCore);

// Mock window.matchMedia for useMediaQuery hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default value, tests can override if needed
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),

});
fakeDBCore.open = (name, version) => {
  if (name === 'TEST_ERROR_DB') {
    // Simulate an error during open for specific test cases
    const request = originalOpen(name, version);
    // fake-indexeddb doesn't easily let us inject an error *before* onsuccess/onerror
    // So, we'll rely on the test checking for rejection instead.
    // Forcing an immediate rejection might be possible but complex.
    // Let's assume the test will handle the promise rejection.
    // We can simulate the request object having an error property after some delay
    const error = new Error('Simulated DB Open Error');
    setImmediate(() => {
        if (request.onerror) {
            Object.defineProperty(request, 'error', { value: error, writable: false });
            request.onerror(new Event('error')); // Dispatch generic error event
        }
    });
    return request;
  }
  // Otherwise, call the original fake-indexeddb open
  return originalOpen(name, version);
};

global.indexedDB = fakeDBCore;
// IDBKeyRange is usually provided globally by fake-indexeddb


// --- Mock localStorage ---
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) { return store[key] || null; },
    setItem(key, value) { store[key] = value.toString(); },
    removeItem(key) { delete store[key]; },
    clear() { store = {}; },
    get length() { return Object.keys(store).length; },
    key(index) { const keys = Object.keys(store); return keys[index] || null; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });


console.log('Global Jest setup: Using fake-indexeddb (intercepted open) and mocked localStorage.');