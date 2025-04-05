/**
 * Documentation Management System Types
 * Contains all type definitions for the DocumentationManager system
 */

/**
 * Represents a specific version of a document
 */
export interface DocVersion {
  /** Unique version identifier */
  versionId: string;
  /** Document content */
  content: string;
  /** Timestamp when version was created */
  timestamp: Date;
  /** Author of this version */
  author?: string;
  /** Optional version notes */
  notes?: string;
}

/**
 * Metadata for a document
 */
export interface DocMetadata {
  /** Unique document identifier */
  id: string;
  /** Document title */
  title: string;
  /** Current version identifier */
  currentVersionId: string;
  /** List of available version identifiers */
  availableVersions: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
  /** Document tags for categorization */
  tags: string[];
  /** Document path in the file system */
  path?: string;
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Error message */
  message: string;
  /** Error severity: 'error', 'warning', or 'info' */
  severity: 'error' | 'warning' | 'info';
  /** Line number where error was found (optional) */
  line?: number;
  /** Column number where error was found (optional) */
  column?: number;
}

/**
 * Result of document validation
 */
export interface ValidationResult {
  /** Whether validation passed (no errors) */
  valid: boolean;
  /** List of validation errors found */
  errors: ValidationError[];
  /** Validation timestamp */
  timestamp: Date;
}

/**
 * Options for document validation
 */
export interface ValidationOptions {
  /** Skip specific validations */
  skip?: string[];
  /** Only run specific validations */
  only?: string[];
  /** Treat warnings as errors */
  strict?: boolean;
  /** Custom validator functions */
  customValidators?: DocumentValidator[];
}

/**
 * Function type for document validators
 */
export type DocumentValidator = (content: string) => ValidationError[];

/**
 * Options for document search
 */
export interface SearchOptions {
  /** Minimum relevance score (0-1) */
  minScore?: number;
  /** Maximum results to return */
  limit?: number;
  /** Tags to filter by (must match all) */
  tags?: string[];
  /** Whether to perform fuzzy matching */
  fuzzy?: boolean;
  /** Date range for filtering by creation date */
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Search result item
 */
export interface SearchResult {
  /** Document metadata */
  document: DocMetadata;
  /** Relevance score (0-1) */
  score: number;
  /** Matched content snippets */
  snippets?: string[];
}

/**
 * Options for DocumentationManager constructor
 */
export interface DocumentationManagerOptions {
  /** Base directory for document storage */
  baseDir?: string;
  /** Default validation options */
  defaultValidationOptions?: ValidationOptions;
  /** Whether to enable content encryption */
  enableEncryption?: boolean;
  /** Whether to create the base directory if it doesn't exist */
  createDirIfNotExists?: boolean;
}

/**
 * Options for document generation
 */
export interface GenerationOptions {
  /** Source code file path or directory */
  source: string;
  /** Output format (markdown, html, etc.) */
  format?: 'markdown' | 'html' | 'json';
  /** Include private members */
  includePrivate?: boolean;
  /** Include implementation details */
  includeImplementation?: boolean;
  /** Custom template for generation */
  template?: string;
} 