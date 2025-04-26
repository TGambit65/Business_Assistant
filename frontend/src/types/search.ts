/**
 * Search related type definitions
 */

export interface SearchParams {
  query: string;
  filters?: Filter[];
  sort?: Sort;
  page?: number;
  limit?: number;
  dateRange?: DateRange;
  semantic?: boolean;
}

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[] | number[] | {
    start?: Date | string;
    end?: Date | string;
    [key: string]: any;
  };
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_IN = 'not_in',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
  BETWEEN = 'between'
}

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DateRange {
  from: Date | string;
  to: Date | string;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url?: string;
  date?: Date | string;
  score?: number;
  type?: string;
  labels?: string[];
  metadata?: Record<string, any>;
  highlights?: Highlight[];
}

export interface Highlight {
  field: string;
  matches: Match[];
}

export interface Match {
  text: string;
  highlighted: boolean;
  start?: number;
  end?: number;
}

export interface SearchStats {
  totalResults: number;
  timeTaken: number;
  resultsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface SearchAggregation {
  field: string;
  buckets: {
    value: string | number;
    count: number;
  }[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date | string;
  filters?: Filter[];
  resultCount?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'field';
  score?: number;
}

export interface SearchError {
  code: string;
  message: string;
  details?: any;
} 