import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '../useMediaQuery';

describe('useMediaQuery', () => {
  const matchMediaMock = jest.fn();

  beforeAll(() => {
    window.matchMedia = matchMediaMock;
  });

  it('returns initial match state', () => {
    matchMediaMock.mockImplementation(() => ({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('updates match state on media query change', () => {
    let listener: ((e: any) => void) | null = null; // Initialize to null
    
    matchMediaMock.mockImplementation(() => ({
      matches: false,
      addEventListener: (_: string, fn: (e: any) => void) => {
        listener = fn;
      },
      removeEventListener: jest.fn()
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    // Ensure listener was captured before calling it
    if (listener) {
      // Assign to a new const to help TS narrow the type
      const capturedListener = listener;
      // Use type assertion to assure TypeScript it's callable
      // Wrap state update in act
      act(() => {
        (capturedListener as (e: any) => void)({ matches: true });
      });
      expect(result.current).toBe(true);
    } else {
      // Fail the test if the listener wasn't captured, indicating a problem
      throw new Error('Media query listener was not captured by the mock.');
    }
  });
}); 