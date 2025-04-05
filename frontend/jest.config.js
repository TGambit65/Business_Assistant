module.exports = {
  // displayName: 'frontend', // Optional: Keep if needed for clarity
  testEnvironment: 'jsdom',
  testMatch: [
    // Adjusted path relative to frontend directory
    '<rootDir>/src/**/*.test.{ts,tsx,js,jsx}' 
  ],
  // Adjusted path relative to frontend directory
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], // Use setupFilesAfterEnv for CRA
  // Allow Babel to transform specific ESM modules in node_modules
  transformIgnorePatterns: [
    '/node_modules/(?!date-fns|react-day-picker|axios)/'
  ],
  moduleNameMapper: {
    // Force module uuid to resolve with the CJS entry point
    "uuid": require.resolve('uuid'),
    // Force axios to resolve with the CJS entry point for Jest compatibility
    "^axios$": require.resolve("axios/dist/node/axios.cjs"),
    // Add mappings for CSS Modules, images, etc. if needed by CRA tests
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js', // Example mock
  },
  // Reset mocks between tests
  resetMocks: true,
  // Collect coverage from src, excluding specific files/folders
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.{js,jsx,ts,tsx}',
    '!src/serviceWorker.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js',
    '!src/types/**/*', // Exclude type definitions
    '!src/**/__mocks__/**/*', // Exclude mocks
    '!src/**/tests/**/*', // Exclude test files themselves
  ],
  coverageThreshold: { // Optional: Set coverage thresholds
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

