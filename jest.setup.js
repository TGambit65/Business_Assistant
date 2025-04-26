// jest.setup.js
const { IDBFactory } = require('fake-indexeddb');
const { TextEncoder, TextDecoder } = require('util');

// Add TextEncoder and TextDecoder to global scope for tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Response and other fetch API classes for nock
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.type = 'default';
    this.url = '';
    this.ok = this.status >= 200 && this.status < 300;
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(String(this.body));
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }

  clone() {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    });
  }
};

global.Headers = class Headers {
  constructor(init = {}) {
    this._headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => this.set(key, value));
    }
  }

  append(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }

  delete(name) {
    this._headers.delete(name.toLowerCase());
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  has(name) {
    return this._headers.has(name.toLowerCase());
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }

  forEach(callback) {
    this._headers.forEach((value, key) => callback(value, key, this));
  }
};

global.Request = class Request {
  constructor(input, init = {}) {
    this.method = init.method || 'GET';
    this.url = typeof input === 'string' ? input : input.url;
    this.headers = new Headers(init.headers);
    this.body = init.body || null;
    this.credentials = init.credentials || 'same-origin';
    this.mode = init.mode || 'cors';
  }

  clone() {
    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
      credentials: this.credentials,
      mode: this.mode
    });
  }
};

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