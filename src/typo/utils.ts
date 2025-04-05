/**
 * Utility functions for Typo.js
 */
import { FlagType, TypoError, TypoErrorType } from './types';

/**
 * Checks if a string of flags contains a specific flag
 * @param flags - String containing flags
 * @param flag - Flag to check for
 * @returns True if the flag is present
 */
export function hasFlag(flags: string, flag: string): boolean {
  if (!flags || !flag) return false;
  return flags.indexOf(flag) !== -1;
}

/**
 * Parses flag value based on the flag type
 * @param flagValue - Flag value to parse
 * @param flagType - Type of flag (char, long, num, utf8)
 * @returns Array of flag characters
 */
export function parseFlags(flagValue: string, flagType: string): string[] {
  if (!flagValue) return [];

  switch (flagType) {
    case FlagType.CHAR: {
      // Each character is a flag
      return flagValue.split('');
    }
    case FlagType.LONG: {
      // Every two characters form a flag
      const flags: string[] = [];
      for (let i = 0; i < flagValue.length; i += 2) {
        if (i + 1 < flagValue.length) {
          flags.push(flagValue.substring(i, i + 2));
        }
      }
      return flags;
    }
    case FlagType.NUM: {
      // Comma-separated numbers
      return flagValue.split(',');
    }
    case FlagType.UTF8: {
      // Each UTF-8 character is a flag
      return Array.from(flagValue);
    }
    default:
      throw new TypoError(
        `Unsupported flag type: ${flagType}`,
        TypoErrorType.UNSUPPORTED_FEATURE
      );
  }
}

/**
 * Calculates Levenshtein distance between two strings
 * @param a - First string
 * @param b - Second string
 * @returns The edit distance between the strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  
  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Checks if a word matches a condition pattern
 * @param word - Word to check
 * @param condition - Condition pattern
 * @returns True if the word matches the condition
 */
export function matchesCondition(word: string, condition: string): boolean {
  if (!condition || condition === '.') return true;
  
  // Empty words never match
  if (!word) return false;
  
  // Parse character class condition [abc] or [^abc]
  if (condition.startsWith('[')) {
    const isNegated = condition[1] === '^';
    const startIndex = isNegated ? 2 : 1;
    const endIndex = condition.indexOf(']', startIndex);
    
    if (endIndex === -1) return false;
    
    const charClass = condition.substring(startIndex, endIndex);
    const firstChar = word.charAt(0);
    
    const isInClass = charClass.includes(firstChar);
    return isNegated ? !isInClass : isInClass;
  }
  
  // Simple prefix match
  return word.startsWith(condition);
}

/**
 * Creates a new word by applying an affix
 * @param word - Base word
 * @param stripping - Characters to strip
 * @param affix - Affix to add
 * @param isPrefix - Whether this is a prefix
 * @returns The new affixed word
 */
export function applyAffix(
  word: string,
  stripping: string,
  affix: string,
  isPrefix: boolean
): string {
  if (!word) return '';
  
  if (isPrefix) {
    // For prefixes, strip from the beginning and add to the beginning
    if (stripping && stripping !== '0') {
      if (!word.startsWith(stripping)) return '';
      word = word.substring(stripping.length);
    }
    return affix + word;
  } else {
    // For suffixes, strip from the end and add to the end
    if (stripping && stripping !== '0') {
      if (!word.endsWith(stripping)) return '';
      word = word.substring(0, word.length - stripping.length);
    }
    return word + affix;
  }
}

/**
 * Converts a string to consistent case based on preferences
 * @param word - Word to normalize
 * @param caseSensitive - Whether to preserve case
 * @returns Normalized word
 */
export function normalizeCase(word: string, caseSensitive: boolean): string {
  return caseSensitive ? word : word.toLowerCase();
}

/**
 * Generates variations of a word with common typos
 * @param word - Original word
 * @returns Array of word variations with possible typos
 */
export function generateTypoVariations(word: string): string[] {
  if (!word || word.length <= 1) return [word];
  
  const variations: string[] = [];
  const len = word.length;
  
  // Character swaps (transpositions)
  for (let i = 0; i < len - 1; i++) {
    const swapped = 
      word.substring(0, i) + 
      word.charAt(i + 1) + 
      word.charAt(i) + 
      word.substring(i + 2);
    variations.push(swapped);
  }
  
  // Character deletions
  for (let i = 0; i < len; i++) {
    const deleted = word.substring(0, i) + word.substring(i + 1);
    variations.push(deleted);
  }
  
  return variations;
}

/**
 * Creates n-grams from a word
 * @param word - Input word
 * @param n - Size of n-gram (2 for bigrams, 3 for trigrams, etc.)
 * @returns Array of n-grams
 */
export function createNGrams(word: string, n: number): string[] {
  if (!word || word.length < n) return [];
  
  const ngrams: string[] = [];
  for (let i = 0; i <= word.length - n; i++) {
    ngrams.push(word.substring(i, i + n));
  }
  
  return ngrams;
}

/**
 * Calculates similarity score between two words based on shared n-grams
 * @param word1 - First word
 * @param word2 - Second word
 * @param n - Size of n-gram
 * @returns Similarity score (higher means more similar)
 */
export function nGramSimilarity(word1: string, word2: string, n: number = 2): number {
  const ngrams1 = createNGrams(word1, n);
  const ngrams2 = createNGrams(word2, n);
  
  if (ngrams1.length === 0 || ngrams2.length === 0) return 0;
  
  // Count common n-grams
  let commonCount = 0;
  for (const ngram of ngrams1) {
    if (ngrams2.includes(ngram)) {
      commonCount++;
    }
  }
  
  // Dice coefficient: 2 * common / (total1 + total2)
  return (2 * commonCount) / (ngrams1.length + ngrams2.length);
} 