/**
 * Shared search interfaces between frontend and backend
 * 
 * This file defines the common interface to be used when 
 * displaying search results from the backend.
 */

// Match interface for highlighting in search results
export interface SharedMatch {
  text: string;
  highlighted: boolean;
  start?: number;
  end?: number;
}

// Highlight interface for search results
export interface SharedHighlight {
  field: string;
  matches: SharedMatch[];
}

// Common search result structure
export interface SharedSearchResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
  url?: string;
  date?: Date | string;
  type?: string;
  content?: string;
  labels?: string[];
  metadata?: {
    title: string;
    description: string;
    date: Date | string;
    author?: string;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
  highlights: SharedHighlight[];
} 