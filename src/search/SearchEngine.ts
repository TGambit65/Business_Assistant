import { SearchResult, SearchParams, SearchOptions, SearchStats, SearchError } from '../types/search';
import { FuzzySearch } from './FuzzySearch';
import { OfflineSearchManager } from './OfflineSearchManager';

export class SearchEngine {
  private static instance: SearchEngine;
  private offlineManager: OfflineSearchManager;
  private cache: Map<string, { results: SearchResult[]; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.offlineManager = new OfflineSearchManager();
    this.cache = new Map();
  }

  public static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine();
    }
    return SearchEngine.instance;
  }

  /**
   * Performs a search with the given parameters
   */
  public async search(params: SearchParams, options: SearchOptions = {}): Promise<{
    results: SearchResult[];
    stats: SearchStats;
  }> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(params);

    try {
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return {
          results: cached.results,
          stats: {
            totalResults: cached.results.length,
            searchTime: 0,
            cached: true,
            filterCount: params.filters.length
          }
        };
      }

      // Perform search
      let results = await this.performSearch(params, options);

      // Apply filters
      if (params.filters.length > 0) {
        results = this.applyFilters(results, params.filters);
      }

      // Apply fuzzy search if needed
      if (!options.semantic && params.query.trim()) {
        results = FuzzySearch.search(results, params);
      }

      // Limit results if specified
      if (options.maxResults) {
        results = results.slice(0, options.maxResults);
      }

      // Cache results
      this.cache.set(cacheKey, {
        results,
        timestamp: Date.now()
      });

      return {
        results,
        stats: {
          totalResults: results.length,
          searchTime: Date.now() - startTime,
          cached: false,
          filterCount: params.filters.length
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Builds the search index
   */
  public async buildSearchIndex(): Promise<void> {
    try {
      await this.offlineManager.buildIndex([]); // TODO: Get actual results
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Suggests queries based on partial input
   */
  public async suggestQueries(query: string): Promise<string[]> {
    try {
      const searchHistory = await this.getSearchHistory();
      return FuzzySearch.suggestQueries(query, searchHistory);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Clears the search cache
   */
  public async clearCache(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Performs the actual search operation
   */
  private async performSearch(params: SearchParams, options: SearchOptions): Promise<SearchResult[]> {
    // TODO: Implement actual search logic
    // This could involve:
    // 1. Checking if offline search is available
    // 2. Using semantic search if enabled
    // 3. Falling back to basic search
    return [];
  }

  /**
   * Applies filters to search results
   */
  private applyFilters(results: SearchResult[], filters: SearchParams['filters']): SearchResult[] {
    return results.filter(result => {
      return filters.every(filter => {
        const value = result.metadata[filter.field as keyof typeof result.metadata];
        if (value === undefined) return false;

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).includes(String(filter.value));
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
   * Gets the search history
   */
  private async getSearchHistory(): Promise<Array<{ query: string; count: number }>> {
    const history = localStorage.getItem('searchHistory');
    if (!history) return [];

    const items = JSON.parse(history);
    return items.map((item: any) => ({
      query: item.params.query,
      count: 1 // TODO: Implement actual count tracking
    }));
  }

  /**
   * Generates a cache key for the given search parameters
   */
  private getCacheKey(params: SearchParams): string {
    return JSON.stringify(params);
  }

  /**
   * Handles search errors
   */
  private handleError(error: unknown): SearchError {
    if (error instanceof Error) {
      return {
        code: 'SEARCH_ERROR',
        message: error.message,
        details: error.stack
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred during search',
      details: error
    };
  }
} 