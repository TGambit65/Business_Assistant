import '@testing-library/jest-dom';

describe('Global setInterval Mock', () => {

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

test('setInterval mock should call jest.fn() with provided callback and ms', () => {
  const mockCallback = jest.fn();
  const mockMs = 1000;

  global.setInterval(mockCallback, mockMs);

  // Check if the callback is called after advancing timers
  expect(mockCallback).not.toHaveBeenCalled(); // Should not be called immediately
  jest.advanceTimersByTime(mockMs);
  expect(mockCallback).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(mockMs);
  expect(mockCallback).toHaveBeenCalledTimes(2);
});
});
