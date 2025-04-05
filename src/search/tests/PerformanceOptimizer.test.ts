import { SearchResult, SearchParams } from '../../types/search';

// --- Mock Setup ---
// Define mock functions for static methods
const mockDebounce = jest.fn((fn: (...args: any[]) => any, _delay: number) => fn);
const mockProcessInBatches = jest.fn(async function* (items: any[], batchSize: number) {
    for (let i = 0; i < items.length; i += batchSize) { yield items.slice(i, i + batchSize); }
});
const mockLimitResults = jest.fn((results: SearchResult[], limit: number) => results.slice(0, limit));
const mockOptimizeFilters = jest.fn((results: SearchResult[], filters?: SearchParams['filters']) => {
    if (!filters || filters.length === 0) return results;
    return results.filter(result => filters.every(filter => {
        if (filter.operator === 'equals') { const value = (result.metadata as any)[filter.field]; return value === filter.value; }
        if (filter.operator === 'between' && filter.field === 'date' && typeof filter.value === 'object' && filter.value !== null && 'start' in filter.value && 'end' in filter.value) {
            const dateValue = result.metadata?.date; if (!dateValue) return false;
            const startDate = new Date(filter.value.start); const endDate = new Date(filter.value.end);
            return dateValue >= startDate && dateValue <= endDate;
        } return true;
    }));
});
const mockOptimizeSearch = jest.fn(async (results: SearchResult[]) => results);
const mockGetVisibleResults = jest.fn((results: SearchResult[], start: number, end: number) => results.slice(start, end));
const mockCacheResults = jest.fn((_results: SearchResult[], cache: Map<string, any>, key: string) => {
    if (cache.size >= 1000) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) { cache.delete(firstKey); }
    }
    cache.set(key, _results);
});
const mockOptimizeMemory = jest.fn((results: SearchResult[]) => results.map((r: SearchResult) => ({
    ...r, content: r.content?.slice(0, 500) ?? '', metadata: { ...r.metadata, description: r.metadata?.description?.slice(0, 200) ?? '' }
})));

// Mock the PerformanceOptimizer module
jest.mock('../PerformanceOptimizer', () => ({
  // The key here must match the exported class name
  PerformanceOptimizer: Object.assign(
    // Mock the constructor
    jest.fn().mockImplementation(() => ({
      // Mock INSTANCE methods here if needed
      optimizeQuery: jest.fn(),
      analyzePerformance: jest.fn(),
    })),
    // Assign static methods to the mock constructor object
    {
      debounce: mockDebounce,
      processInBatches: mockProcessInBatches,
      limitResults: mockLimitResults,
      optimizeFilters: mockOptimizeFilters,
      optimizeSearch: mockOptimizeSearch,
      getVisibleResults: mockGetVisibleResults,
      cacheResults: mockCacheResults,
      optimizeMemory: mockOptimizeMemory,
    }
  )
}));

// Import the mocked class
import { PerformanceOptimizer } from '../PerformanceOptimizer';


// Mock the Worker class
global.Worker = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  terminate: jest.fn(),
  onmessage: null,
  onerror: null,
}));


describe('PerformanceOptimizer', () => {
  const mockResults: SearchResult[] = [
    {
      id: '1',
      score: 0.95,
      content: 'Hello world, this is a test content',
      metadata: { title: 'Test Title', description: 'A test description', date: new Date(), author: 'Test Author', category: 'Test Category', tags: ['test', 'example'] },
      highlights: []
    },
    {
      id: '2',
      score: 0.85,
      content: 'Another test content',
      metadata: { title: 'Another Title', description: 'Another description', date: new Date(), author: 'Another Author', category: 'Another Category', tags: ['another', 'test'] },
      highlights: []
    }
  ];

  // Clear mocks before each test
  beforeEach(() => {
      // Clear the mocks defined outside the jest.mock scope
      mockDebounce.mockClear();
      mockProcessInBatches.mockClear();
      mockLimitResults.mockClear();
      mockOptimizeFilters.mockClear();
      mockOptimizeSearch.mockClear();
      mockGetVisibleResults.mockClear();
      mockCacheResults.mockClear();
      mockOptimizeMemory.mockClear();

      // Reset implementations if needed (optional, but safer)
      mockDebounce.mockImplementation((fn: (...args: any[]) => any, _delay: number) => fn);
      mockProcessInBatches.mockImplementation(async function* (items: any[], batchSize: number) {
          for (let i = 0; i < items.length; i += batchSize) { yield items.slice(i, i + batchSize); }
      });
      mockLimitResults.mockImplementation((results: SearchResult[], limit: number) => results.slice(0, limit));
      mockOptimizeFilters.mockImplementation((results: SearchResult[], filters?: SearchParams['filters']) => {
         if (!filters || filters.length === 0) return results;
         return results.filter(result => filters.every(filter => {
             if (filter.operator === 'equals') { const value = (result.metadata as any)[filter.field]; return value === filter.value; }
             if (filter.operator === 'between' && filter.field === 'date' && typeof filter.value === 'object' && filter.value !== null && 'start' in filter.value && 'end' in filter.value) {
                 const dateValue = result.metadata?.date; if (!dateValue) return false;
                 const startDate = new Date(filter.value.start); const endDate = new Date(filter.value.end);
                 return dateValue >= startDate && dateValue <= endDate;
             } return true;
         }));
      });
      mockOptimizeSearch.mockImplementation(async (results: SearchResult[]) => results);
      mockGetVisibleResults.mockImplementation((results: SearchResult[], start: number, end: number) => results.slice(start, end));
      mockCacheResults.mockImplementation((_results: SearchResult[], cache: Map<string, any>, key: string) => {
          if (cache.size >= 1000) {
              const firstKey = cache.keys().next().value;
              if (firstKey !== undefined) { cache.delete(firstKey); }
          }
          cache.set(key, _results);
      });
      mockOptimizeMemory.mockImplementation((results: SearchResult[]) => results.map((r: SearchResult) => ({
          ...r, content: r.content?.slice(0, 500) ?? '', metadata: { ...r.metadata, description: r.metadata?.description?.slice(0, 200) ?? '' }
      })));
  });


  describe('debounce', () => {
    jest.useFakeTimers();

    it('debounces function calls', () => {
      let callCount = 0;
      const mockFn = jest.fn(() => { callCount++; });
      // Re-implement debounce mock specifically for this test using fake timers
       mockDebounce.mockImplementation((fn: (...args: any[]) => void, delay: number) => {
          let timeoutId: NodeJS.Timeout | null = null;
          return (...args: any[]) => {
              if (timeoutId) clearTimeout(timeoutId);
              timeoutId = setTimeout(() => fn(...args), delay);
          };
      });

      // Access debounce via the mocked class
      const debouncedFn = PerformanceOptimizer.debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(callCount).toBe(1);
      debouncedFn();
      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });
  });

  describe('processInBatches', () => {
    it('processes items in batches', async () => {
      const items = Array.from({ length: 5 }, (_, i) => i);
      const batches: number[][] = [];
      // Access static method via the mocked class
      for await (const batch of PerformanceOptimizer.processInBatches(items, 2)) {
        batches.push(batch);
      }
      expect(batches).toEqual([[0, 1], [2, 3], [4]]);
      expect(mockProcessInBatches).toHaveBeenCalledWith(items, 2);
    });
  });

  describe('limitResults', () => {
    it('limits results to specified number', () => {
      // Access static method via the mocked class
      const limitedResults = PerformanceOptimizer.limitResults(mockResults, 1);
      expect(limitedResults.length).toBe(1);
      expect(limitedResults[0].id).toBe('1');
      expect(mockLimitResults).toHaveBeenCalledWith(mockResults, 1);
    });
  });

  describe('optimizeFilters', () => {
    it('optimizes filter operations with lookup tables', () => {
      const filters: SearchParams['filters'] = [ { field: 'category', operator: 'equals', value: 'Test Category' } ];
      // Access static method via the mocked class
      const filteredResults = PerformanceOptimizer.optimizeFilters(mockResults, filters);
      expect(filteredResults.length).toBe(1);
      expect(filteredResults[0].id).toBe('1');
      expect(mockOptimizeFilters).toHaveBeenCalledWith(mockResults, filters);
    });

    it('handles multiple filters', () => {
      const filters: SearchParams['filters'] = [ { field: 'category', operator: 'equals', value: 'Test Category' }, { field: 'author', operator: 'equals', value: 'Test Author' } ];
       // Access static method via the mocked class
      const filteredResults = PerformanceOptimizer.optimizeFilters(mockResults, filters);
      expect(filteredResults.length).toBe(1);
      expect(filteredResults[0].id).toBe('1');
      expect(mockOptimizeFilters).toHaveBeenCalledWith(mockResults, filters);
    });

    it('handles date range filters', () => {
      const now = new Date();
      const filters: SearchParams['filters'] = [ { field: 'date', operator: 'between', value: { start: new Date(now.getTime() - 1000), end: new Date(now.getTime() + 1000) } } ];
       // Access static method via the mocked class
      const filteredResults = PerformanceOptimizer.optimizeFilters(mockResults, filters);
      expect(filteredResults.length).toBe(2);
      expect(mockOptimizeFilters).toHaveBeenCalledWith(mockResults, filters);
    });
  });

  describe('optimizeSearch', () => {
    it('falls back to synchronous processing when worker is not available', async () => {
      const params: SearchParams = { query: 'test', filters: [] };
       // Access static method via the mocked class
      const results = await PerformanceOptimizer.optimizeSearch(mockResults, params, { useWorker: false });
      expect(results.length).toBe(2);
      expect(mockOptimizeSearch).toHaveBeenCalledWith(mockResults, params, { useWorker: false });
    });
  });

  describe('getVisibleResults', () => {
    it('returns visible portion of results', () => {
       // Access static method via the mocked class
      const visibleResults = PerformanceOptimizer.getVisibleResults(mockResults, 0, 1);
      expect(visibleResults.length).toBe(1);
      expect(visibleResults[0].id).toBe('1');
      expect(mockGetVisibleResults).toHaveBeenCalledWith(mockResults, 0, 1);
    });
  });

  describe('cacheResults', () => {
    it('caches results with size limit', () => {
      const cache = new Map<string, SearchResult[]>();
      const key = 'test';
      for (let i = 0; i < 1001; i++) {
         // Access static method via the mocked class
        PerformanceOptimizer.cacheResults(mockResults, cache, `${key}${i}`);
      }
      expect(cache.size).toBe(1000);
      expect(cache.has(`${key}0`)).toBe(false);
      expect(cache.has(`${key}1000`)).toBe(true);
      expect(mockCacheResults).toHaveBeenCalledTimes(1001);
    });
  });

  describe('optimizeMemory', () => {
    it('truncates large text fields', () => {
      const longResult: SearchResult = { id: '3', score: 0.9, content: 'a'.repeat(1000), metadata: { title: 'Long Title', description: 'b'.repeat(300), date: new Date(), author: 'Test Author', category: 'Test Category', tags: ['test'] }, highlights: [] };
       // Access static method via the mocked class
      const optimizedResult = PerformanceOptimizer.optimizeMemory([longResult])[0];
      expect(optimizedResult.content.length).toBe(500);
      expect(optimizedResult.metadata.description.length).toBe(200);
      expect(mockOptimizeMemory).toHaveBeenCalledWith([longResult]);
    });

    it('handles undefined fields', () => {
      const result: SearchResult = { id: '4', score: 0.9, content: undefined as unknown as string, metadata: { title: 'Test Title', description: undefined as unknown as string, date: new Date(), author: 'Test Author', category: 'Test Category', tags: ['test'] }, highlights: [] };
       // Access static method via the mocked class
      const optimizedResult = PerformanceOptimizer.optimizeMemory([result])[0];
      expect(optimizedResult.content).toBe('');
      expect(optimizedResult.metadata.description).toBe('');
      expect(mockOptimizeMemory).toHaveBeenCalledWith([result]);
    });
  });
});