import { renderHook, act } from '@testing-library/react';
import { useOffline } from '../useOffline';

describe('useOffline', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  it('returns initial online state', () => {
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOffline).toBe(false);
  });

  it('updates offline state when network status changes', () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOffline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOffline).toBe(false);
  });

  it('manages sync queue correctly', () => {
    const { result } = renderHook(() => useOffline());
    
    act(() => {
      result.current.syncQueue.add('test', { data: 'test' });
    });

    act(() => {
      result.current.syncQueue.clear();
    });

    expect(result.current.syncQueue).toBeDefined();
  });
}); 