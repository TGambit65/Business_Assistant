import { SearchResult, SearchParams } from '../types/search';

export class PerformanceOptimizer {
  private static readonly BATCH_SIZE = 50;
  private static readonly DEBOUNCE_DELAY = 300; // ms
  private static readonly CACHE_SIZE = 1000;

  /**
   * Debounces a function call
   */
  public static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number = this.DEBOUNCE_DELAY
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Processes results in batches
   */
  public static async *processInBatches<T>(
    items: T[],
    batchSize: number = this.BATCH_SIZE
  ): AsyncGenerator<T[]> {
    for (let i = 0; i < items.length; i += batchSize) {
      yield items.slice(i, i + batchSize);
    }
  }

  /**
   * Optimizes search results by limiting the number of items
   */
  public static limitResults(
    results: SearchResult[],
    maxResults: number
  ): SearchResult[] {
    return results.slice(0, maxResults);
  }

  /**
   * Optimizes filter operations by using Set for faster lookups
   */
  public static optimizeFilters(
    results: SearchResult[],
    filters: SearchParams['filters']
  ): SearchResult[] {
    if (filters.length === 0) return results;

    // Create lookup tables for faster filtering
    const lookupTables = new Map<string, Set<any>>();
    for (const filter of filters) {
      if (!lookupTables.has(filter.field)) {
        lookupTables.set(filter.field, new Set());
      }
      lookupTables.get(filter.field)!.add(filter.value);
    }

    return results.filter(result => {
      return filters.every(filter => {
        const value = result.metadata[filter.field as keyof typeof result.metadata];
        if (value === undefined) return false;

        const lookupTable = lookupTables.get(filter.field);
        if (!lookupTable) return false;

        switch (filter.operator) {
          case 'equals':
            return lookupTable.has(value);
          case 'contains':
            return Array.from(lookupTable).some(v => 
              String(value).includes(String(v))
            );
          case 'between':
            if (typeof filter.value === 'object' && 'start' in filter.value && 'end' in filter.value) {
              if (value instanceof Date) {
                return value >= filter.value.start && value <= filter.value.end;
              }
              if (typeof value === 'string' && !isNaN(Date.parse(value))) {
                const dateValue = new Date(value);
                return dateValue >= filter.value.start && dateValue <= filter.value.end;
              }
              return false;
            }
            return false;
          case 'gt':
            return value > filter.value;
          case 'lt':
            return value < filter.value;
          case 'gte':
            return value >= filter.value;
          case 'lte':
            return value <= filter.value;
          default:
            return false;
        }
      });
    });
  }

  /**
   * Optimizes search by using a worker thread for heavy computations
   */
  public static async optimizeSearch(
    results: SearchResult[],
    params: SearchParams,
    options: { useWorker?: boolean } = {}
  ): Promise<SearchResult[]> {
    if (options.useWorker && typeof Worker !== 'undefined') {
      // Use Web Worker for heavy computations
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./SearchWorker.ts', import.meta.url));
        worker.postMessage({ results, params });
        worker.onmessage = (event) => resolve(event.data);
        worker.onerror = (error) => reject(error);
      });
    }

    // Fallback to synchronous processing
    return this.optimizeFilters(results, params.filters);
  }

  /**
   * Implements virtual scrolling for large result sets
   */
  public static getVisibleResults(
    results: SearchResult[],
    startIndex: number,
    endIndex: number
  ): SearchResult[] {
    return results.slice(startIndex, endIndex);
  }

  /**
   * Caches results with a size limit
   */
  public static cacheResults(
    results: SearchResult[],
    cache: Map<string, SearchResult[]>,
    key: string
  ): void {
    if (cache.size >= this.CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = cache.keys().next().value;
      // Add type safety check for firstKey
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    cache.set(key, results);
  }

  /**
   * Optimizes memory usage by removing unnecessary data
   */
  public static optimizeMemory(results: SearchResult[]): SearchResult[] {
    return results.map(result => ({
      ...result,
      content: (result.content || '').slice(0, 500),
      metadata: {
        ...result.metadata,
        // Remove large fields that aren't needed for display
        description: (result.metadata.description || '').slice(0, 200)
      }
    }));
  }
} 