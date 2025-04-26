/**
 * Options for configuring the SpellChecker service
 */
export interface SpellCheckerConfig {
  languages: string[];
  defaultLanguage: string;
  maxRetries?: number;
  retryDelay?: number;
  dictionaryPath?: string;
  preloadLanguages?: string[];
  cacheSize?: number;
}

/**
 * Structure for dictionary data in memory
 */
export interface DictionaryData {
  /**
   * Set of words in the dictionary for quick lookup
   */
  words: Set<string>;
  
  /**
   * Optional metadata about the dictionary
   */
  metadata?: {
    /**
     * Total word count in dictionary
     */
    wordCount: number;
    
    /**
     * Last updated timestamp
     */
    lastUpdated?: Date;
    
    /**
     * Dictionary version
     */
    version?: string;
  };
}

/**
 * Result of a spell check operation
 */
export interface SpellCheckResult {
  /**
   * Whether the word is correctly spelled
   */
  correct: boolean;
  
  /**
   * Language used for checking
   */
  language: string;
  
  /**
   * Whether the result came from cache
   */
  fromCache?: boolean;
}

/**
 * Error types for SpellChecker
 */
export enum SpellCheckerErrorType {
  DICTIONARY_LOAD_ERROR = 'dictionary_load_error',
  DICTIONARY_NOT_FOUND = 'dictionary_not_found',
  INVALID_WORD = 'invalid_word',
  INITIALIZATION_ERROR = 'initialization_error',
}

/**
 * Custom error class for SpellChecker errors
 */
export class SpellCheckerError extends Error {
  type: SpellCheckerErrorType;
  
  constructor(message: string, type: SpellCheckerErrorType) {
    super(message);
    this.type = type;
    this.name = 'SpellCheckerError';
  }
} 
