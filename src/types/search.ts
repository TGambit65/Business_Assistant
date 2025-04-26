/**
 * Search result interface
 */
export interface SearchResult {
  /**
   * Unique identifier for the result
   */
  id: string;

  /**
   * Relevance score (0-1)
   */
  score: number;

  /**
   * Fuzzy score for fuzzy search results
   */
  fuzzyScore?: number;

  /**
   * Content of the result
   */
  content: string;

  /**
   * Metadata associated with the result
   */
  metadata: {
    title: string;
    description: string;
    date: Date;
    author: string;
    category: string;
    tags: string[];
  };

  /**
   * Highlighted matches in the content
   */
  highlights: {
    field: string;
    matches: {
      start: number;
      end: number;
      text: string;
    }[];
  }[];
}

/**
 * Search options interface
 */
export interface SearchOptions {
  /**
   * Maximum number of results to return
   */
  maxResults?: number;

  /**
   * Whether to include highlights in results
   */
  includeHighlights?: boolean;

  /**
   * Whether to include metadata in results
   */
  includeMetadata?: boolean;

  /**
   * Minimum relevance score threshold
   */
  minScore?: number;

  /**
   * Whether to use semantic search
   */
  semantic?: boolean;
}

/**
 * Search statistics interface
 */
export interface SearchStats {
  /**
   * Total number of results found
   */
  totalResults: number;

  /**
   * Time taken to perform the search
   */
  searchTime: number;

  /**
   * Whether the results were cached
   */
  cached: boolean;

  /**
   * Number of filters applied
   */
  filterCount: number;
}

/**
 * Search error interface
 */
export interface SearchError {
  /**
   * Error code
   */
  code: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Additional error details
   */
  details?: any;
}

export interface SearchParams {
  query: string;
  filters: Filter[];
  semantic?: boolean;
}

export interface Filter {
  field: string;
  operator: 'equals' | 'contains' | 'between' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number | Date | { start: Date; end: Date };
}

export interface SearchEngine {
  search(params: SearchParams): Promise<SearchResult[]>;
  buildSearchIndex(): Promise<void>;
  suggestQueries(query: string): Promise<string[]>;
  clearCache(): Promise<void>;
}

export interface OfflineSearchManager {
  buildIndex(results: SearchResult[]): Promise<void>;
  search(params: SearchParams): Promise<SearchResult[]>;
  sync(): Promise<void>;
  clearCache(): Promise<void>;
} 