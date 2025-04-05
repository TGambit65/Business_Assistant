declare module '@/*/types/search' {
  export interface SearchResult {
    id: string;
    score: number;
    content: string;
    metadata: {
      title: string;
      description: string;
      date: Date;
      author: string;
      category: string;
      tags: string[];
    };
    highlights: {
      field: string;
      matches: {
        start: number;
        end: number;
        text: string;
      }[];
    }[];
  }

  export interface SearchParams {
    query: string;
    filters: Filter[];
    semantic?: boolean;
    dateRange?: DateRange;
    categories?: string[];
  }

  export interface Filter {
    field: string;
    operator: 'equals' | 'contains' | 'between' | 'gt' | 'lt' | 'gte' | 'lte';
    value: string | number | Date | { start: Date; end: Date };
  }

  export interface DateRange {
    start: Date;
    end: Date;
  }

  export interface SearchOptions {
    maxResults?: number;
    includeHighlights?: boolean;
    includeMetadata?: boolean;
    minScore?: number;
    semantic?: boolean;
  }

  export interface SearchStats {
    totalResults: number;
    searchTime: number;
    cached: boolean;
    filterCount: number;
  }

  export interface SearchError {
    code: string;
    message: string;
    details?: any;
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
} 