// Mock for service worker registration
const mockServiceWorkerRegistration = {
  register: jest.fn((config) => {
    if (config && config.onSuccess) {
      config.onSuccess({
        scope: '/mock-scope',
        update: jest.fn(),
        unregister: jest.fn().mockResolvedValue(true),
        waiting: null,
        active: { postMessage: jest.fn() }
      });
    }
    return Promise.resolve();
  }),
  unregister: jest.fn().mockResolvedValue(true)
};

export default mockServiceWorkerRegistration; 