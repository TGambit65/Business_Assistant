/**
 * Types definitions for Typo.js
 */

/**
 * Options for Typo dictionary configuration
 */
export interface TypoOptions {
  /**
   * Dictionary character encoding
   * @default 'UTF-8'
   */
  encoding?: string;
  
  /**
   * Whether complex prefixes are used (for right-to-left languages)
   * @default false
   */
  complexPrefixes?: boolean;
  
  /**
   * Flag character for forbidden words
   */
  forbiddenWord?: string;
  
  /**
   * Flag character for words that should maintain their case
   */
  keepCase?: string;
  
  /**
   * Flag character for words that are only valid when affixed
   */
  needAffix?: string;
  
  /**
   * Flag to mark words that should not be suggested
   */
  noSuggest?: string;
  
  /**
   * Maximum number of suggestions to return
   * @default 5
   */
  maxSuggestions?: number;
  
  /**
   * Maximum number of phonetic suggestions to return
   * @default 2
   */
  maxPhoneticSuggestions?: number;
  
  /**
   * Maximum number of compound suggestions to return
   * @default 3
   */
  maxCompoundSuggestions?: number;
  
  /**
   * Default dictionary to use if no dictionary is provided
   */
  defaultDictionary?: string;
  
  /**
   * Enable debug mode
   * @default false
   */
  debug?: boolean;
}

/**
 * Affix rule types
 */
export type AffixType = 'PFX' | 'SFX';

/**
 * Affix rule representation
 */
export interface AffixRule {
  /**
   * Type of affix (prefix or suffix)
   */
  type: AffixType;
  
  /**
   * Flag character that represents this rule
   */
  flag: string;
  
  /**
   * Whether this affix can be combined with others
   */
  crossProduct: boolean;
  
  /**
   * Individual rule entries
   */
  entries: AffixEntry[];
}

/**
 * Individual affix rule entry
 */
export interface AffixEntry {
  /**
   * Flag character that represents this entry
   */
  flag: string;
  
  /**
   * Characters to strip before applying the affix
   */
  stripping: string;
  
  /**
   * Characters to add as the affix
   */
  affix: string;
  
  /**
   * Condition that must be met to apply this affix
   */
  condition: string;
  
  /**
   * Optional morphological data
   */
  morphCode?: string[];
  
  /**
   * Optional continuation flags
   */
  contFlags?: string[];
}

/**
 * Compound word rule
 */
export interface CompoundRule {
  /**
   * Type of compound rule
   * (COMPOUNDBEGIN, COMPOUNDMIDDLE, COMPOUNDEND, etc.)
   */
  type: string;
  
  /**
   * Value of the rule (usually a flag)
   */
  value: string;
}

/**
 * Dictionary data structure
 */
export interface Dictionary {
  /**
   * Map of words to their flags
   */
  words: Map<string, string>;
  
  /**
   * Map of flag characters to their meanings
   */
  flags: Map<string, string[]>;
  
  /**
   * Map of affix rules by flag
   */
  rules: Map<string, AffixRule>;
  
  /**
   * List of compound rules
   */
  compoundRules: CompoundRule[];
  
  /**
   * Dictionary character encoding
   */
  encoding: string;
  
  /**
   * Whether the dictionary is case-sensitive
   */
  caseSensitive: boolean;
  
  /**
   * Whether complex prefixes are used
   */
  complexPrefixes: boolean;
  
  /**
   * Type of flag used in the dictionary (char, long, num, UTF-8)
   */
  flagType: string;
}

/**
 * Enum for dictionary flag types
 */
export enum FlagType {
  CHAR = 'char',   // Single ASCII character flags
  LONG = 'long',   // Two-character flags
  NUM = 'num',     // Numeric flags separated by commas
  UTF8 = 'utf8',   // UTF-8 character flags
}

/**
 * Error types for Typo.js
 */
export enum TypoErrorType {
  DICTIONARY_NOT_FOUND = 'dictionary_not_found',
  DICTIONARY_PARSE_ERROR = 'dictionary_parse_error',
  AFFIX_PARSE_ERROR = 'affix_parse_error',
  INVALID_WORD = 'invalid_word',
  UNSUPPORTED_FEATURE = 'unsupported_feature'
}

/**
 * Custom error class for Typo.js
 */
export class TypoError extends Error {
  type: TypoErrorType;
  
  constructor(message: string, type: TypoErrorType) {
    super(message);
    this.type = type;
    this.name = 'TypoError';
  }
} 