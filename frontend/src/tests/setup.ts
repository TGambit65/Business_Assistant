import '@testing-library/jest-dom';
import { mockSecurityManager, MockRateLimiter, MockAuditLogger, MockKeyVault } from './__mocks__/securityMocks';
import { analyticsServiceMock } from './__mocks__/analyticsMocks';
import { deepseekServiceMock, mockAxios } from './__mocks__/deepseekMocks';

// Mock browser globals
// @ts-ignore - Global typings are complex, but this works for testing
global.window = global;

// Add mock for navigator
Object.defineProperty(global, 'navigator', {
  value: {
    onLine: true,
    userAgent: 'jest-test-environment'
  },
  writable: true
});

// Add serviceWorker mock
Object.defineProperty(global.navigator, 'serviceWorker', {
  value: {
    register: jest.fn().mockResolvedValue({}),
    getRegistrations: jest.fn().mockResolvedValue([]),
    ready: Promise.resolve({})
  },
  writable: true
});

// @ts-ignore - Mock setInterval for testing
global.setInterval = jest.fn((callback, ms) => {
  return 0 as unknown as NodeJS.Timeout;
});

global.clearInterval = jest.fn();

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    status: 200
  })
);

// Mock security modules
jest.mock('../security', () => ({
  securityManager: mockSecurityManager,
  analyticsEncryption: {
    encrypt: jest.fn((data) => JSON.stringify({ data, iv: 'mock-iv', timestamp: Date.now(), version: 1 })),
    decrypt: jest.fn((encrypted) => {
      try {
        return typeof encrypted === 'string' ? JSON.parse(encrypted).data : encrypted;
      } catch (e) {
        return encrypted;
      }
    }),
    // @ts-ignore - Simplified types for testing
    encryptBatch: jest.fn((dataArray: any[]) => dataArray.map((item: any) =>
      JSON.stringify({ data: item, iv: 'mock-iv', timestamp: Date.now(), version: 1 })
    )),
    // @ts-ignore - Simplified types for testing
    decryptBatch: jest.fn((encryptedArray: any[]) => encryptedArray.map((item: any) => {
      try {
        return typeof item === 'string' ? JSON.parse(item).data : item;
      } catch (e) {
        return item;
      }
    }))
  },
  accessControl: {
    hasPermission: jest.fn().mockReturnValue(true),
    filterAccessibleData: jest.fn(data => data)
  }
}));

// Mock AnalyticsService
jest.mock('../services/AnalyticsService', () => ({
  analyticsService: analyticsServiceMock
}));

// Mock DeepseekService
jest.mock('../services/deepseek/DeepseekService', () => ({
  DeepseekService: {
    getInstance: jest.fn().mockReturnValue(deepseekServiceMock)
  }
}));

// Mock axios
jest.mock('axios', () => mockAxios);

jest.mock('../security/RateLimiter', () => ({
  RateLimiter: MockRateLimiter
}));

jest.mock('../security/AuditLogger', () => ({
  AuditLogger: MockAuditLogger,
  LogLevel: {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL'
  },
  EventType: {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    API_KEY_ROTATION: 'API_KEY_ROTATION',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
    CONFIGURATION_CHANGE: 'CONFIGURATION_CHANGE',
    PERMISSION_CHANGE: 'PERMISSION_CHANGE',
    DATA_ACCESS: 'DATA_ACCESS'
  }
}));

jest.mock('../security/KeyVault', () => ({
  KeyVault: MockKeyVault
}));