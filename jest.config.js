module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Explicitly set environment
  setupFilesAfterEnv: ['./jest.setup.js'], // Setup file for global mocks
  testPathIgnorePatterns: [ // Ignore frontend tests if they have separate config
      "<rootDir>/frontend/"
  ],
  coveragePathIgnorePatterns: [
      "<rootDir>/frontend/"
  ],
  // Optional: Increase global test timeout if many tests are slow
  // testTimeout: 30000,
};