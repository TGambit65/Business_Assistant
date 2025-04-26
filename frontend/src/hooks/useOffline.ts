import { useState, useEffect } from 'react';

interface SyncQueue {
  add: (type: string, data: any) => void;
  process: () => Promise<void>;
  clear: () => void;
}

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queue, setQueue] = useState<Array<{ type: string; data: any }>>([]);

  const syncQueue: SyncQueue = {
    add: (type: string, data: any) => {
      setQueue(prev => [...prev, { type, data }]);
    },
    process: async () => {
      for (const item of queue) {
        try {
          // Process queue items when back online
          console.log('Processing:', item);
        } catch (error) {
          console.error('Sync error:', error);
        }
      }
      setQueue([]);
    },
    clear: () => setQueue([])
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncQueue.process();
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline, syncQueue };
} 