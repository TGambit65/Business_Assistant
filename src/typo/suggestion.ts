/**
 * Word suggestion algorithms for Typo.js
 */
import { Dictionary, TypoOptions } from './types';
import { 
  createNGrams,
  generateTypoVariations, 
  levenshteinDistance, 
  nGramSimilarity, 
  normalizeCase, 
  parseFlags 
} from './utils';

/**
 * Class for generating spelling suggestions
 */
export class SuggestionGenerator {
  private dictionary: Dictionary;
  private options: Required<TypoOptions>;
  private noSuggestFlag: string | undefined;
  
  // Default options
  private static readonly DEFAULT_OPTIONS: Required<TypoOptions> = {
    encoding: 'UTF-8',
    complexPrefixes: false,
    forbiddenWord: '',
    keepCase: '',
    needAffix: '',
    noSuggest: '',
    maxSuggestions: 5,
    maxPhoneticSuggestions: 2,
    maxCompoundSuggestions: 3,
    defaultDictionary: 'en_US',
    debug: false
  };

  /**
   * Create a new SuggestionGenerator
   * @param dictionary - The dictionary to use for suggestions
   * @param options - Options for suggestion generation
   */
  constructor(dictionary: Dictionary, options: TypoOptions = {}) {
    this.dictionary = dictionary;
    this.options = { ...SuggestionGenerator.DEFAULT_OPTIONS, ...options };
    
    // Get the noSuggest flag from the dictionary if available
    if (this.dictionary.flags.has('NOSUGGEST')) {
      this.noSuggestFlag = this.dictionary.flags.get('NOSUGGEST')?.[0];
    } else if (this.options.noSuggest) {
      this.noSuggestFlag = this.options.noSuggest;
    }
  }

  /**
   * Generate suggestions for a misspelled word
   * @param word - The misspelled word
   * @returns Array of suggestions
   */
  public suggest(word: string): string[] {
    if (!word) return [];
    
    // Normalize case for dictionary lookup
    const normalizedWord = normalizeCase(word, !this.dictionary.caseSensitive);
    
    // If the word is already in the dictionary, no need for suggestions
    if (this.dictionary.words.has(normalizedWord)) {
      return [];
    }
    
    const suggestions: Set<string> = new Set();
    const maxSuggestions = this.options.maxSuggestions;
    
    // Try different suggestion methods
    
    // 1. Try variations of the word (typos)
    const typoVariations = generateTypoVariations(normalizedWord);
    for (const variation of typoVariations) {
      if (this.dictionary.words.has(variation)) {
        suggestions.add(variation);
        if (suggestions.size >= maxSuggestions) break;
      }
    }
    
    // 2. If we don't have enough suggestions, try edit distance
    if (suggestions.size < maxSuggestions) {
      const editSuggestions = this.getSuggestionsEdits(normalizedWord);
      for (const suggestion of editSuggestions) {
        suggestions.add(suggestion);
        if (suggestions.size >= maxSuggestions) break;
      }
    }
    
    // 3. If we still don't have enough, try n-gram similarity
    if (suggestions.size < maxSuggestions) {
      const ngramSuggestions = this.getSuggestionsNGrams(normalizedWord);
      for (const suggestion of ngramSuggestions) {
        suggestions.add(suggestion);
        if (suggestions.size >= maxSuggestions) break;
      }
    }
    
    // Convert to array and sort by relevance
    const result = Array.from(suggestions);
    return this.rankSuggestions(normalizedWord, result);
  }

  /**
   * Get suggestions based on edit distance
   * @param word - The misspelled word
   * @returns Array of suggestions
   */
  private getSuggestionsEdits(word: string): string[] {
    if (!word) return [];
    
    // Get all words with edit distance of 1 or 2
    const candidates: Array<{ word: string, distance: number }> = [];
    const maxDistance = word.length <= 4 ? 1 : 2;
    
    for (const [dictWord, flags] of this.dictionary.words.entries()) {
      // Skip words that shouldn't be suggested
      if (this.noSuggestFlag && flags.includes(this.noSuggestFlag)) {
        continue;
      }
      
      // Skip words with very different lengths
      if (Math.abs(dictWord.length - word.length) > maxDistance) {
        continue;
      }
      
      const distance = levenshteinDistance(word, dictWord);
      if (distance <= maxDistance) {
        candidates.push({ word: dictWord, distance });
      }
    }
    
    // Sort by edit distance (ascending)
    candidates.sort((a, b) => a.distance - b.distance);
    
    // Return just the words, in order
    return candidates.map(c => c.word);
  }

  /**
   * Get suggestions based on n-gram similarity
   * @param word - The misspelled word
   * @returns Array of suggestions
   */
  private getSuggestionsNGrams(word: string): string[] {
    if (!word) return [];
    
    const candidates: Array<{ word: string, similarity: number }> = [];
    
    // Create n-grams for the input word
    const wordBigrams = createNGrams(word, 2);
    const wordTrigrams = createNGrams(word, 3);
    
    if (wordBigrams.length === 0 && wordTrigrams.length === 0) {
      return [];
    }
    
    // Compare with dictionary words
    for (const [dictWord, flags] of this.dictionary.words.entries()) {
      // Skip words that shouldn't be suggested
      if (this.noSuggestFlag && flags.includes(this.noSuggestFlag)) {
        continue;
      }
      
      // Skip words with very different lengths
      if (Math.abs(dictWord.length - word.length) > 3) {
        continue;
      }
      
      // Calculate similarity based on bigrams and trigrams
      const bigramSimilarity = nGramSimilarity(word, dictWord, 2);
      const trigramSimilarity = nGramSimilarity(word, dictWord, 3);
      
      // Weighted average (trigrams are more significant)
      const similarity = (bigramSimilarity + trigramSimilarity * 2) / 3;
      
      if (similarity > 0.5) { // Only consider somewhat similar words
        candidates.push({ word: dictWord, similarity });
      }
    }
    
    // Sort by similarity (descending)
    candidates.sort((a, b) => b.similarity - a.similarity);
    
    // Return just the words, in order
    return candidates.map(c => c.word);
  }

  /**
   * Rank suggestions by relevance
   * @param original - The original misspelled word
   * @param suggestions - The suggested words
   * @returns Suggestions sorted by relevance
   */
  private rankSuggestions(original: string, suggestions: string[]): string[] {
    if (!original || suggestions.length === 0) return suggestions;
    
    // Score suggestions based on multiple factors
    const scoredSuggestions = suggestions.map(suggestion => {
      let score = 0;
      
      // Prioritize words with the same first letter
      if (suggestion.charAt(0) === original.charAt(0)) {
        score += 2;
      }
      
      // Prioritize words with the same length
      if (suggestion.length === original.length) {
        score += 1;
      }
      
      // Penalize very different lengths
      score -= Math.abs(suggestion.length - original.length) * 0.1;
      
      // Factor in edit distance (lower is better)
      const distance = levenshteinDistance(original, suggestion);
      score -= distance * 0.5;
      
      // Factor in n-gram similarity (higher is better)
      const similarity = nGramSimilarity(original, suggestion);
      score += similarity * 3;
      
      return { word: suggestion, score };
    });
    
    // Sort by score (descending)
    scoredSuggestions.sort((a, b) => b.score - a.score);
    
    // Return just the words, in order
    return scoredSuggestions.map(s => s.word);
  }

  /**
   * Find longest common substring between two strings
   * @param str1 - First string
   * @param str2 - Second string
   * @returns The longest common substring
   */
  private longestCommonSubstring(str1: string, str2: string): string {
    if (!str1 || !str2) return '';
    
    const m = str1.length;
    const n = str2.length;
    let maxLength = 0;
    let endIndex = 0;
    
    // Create a table to store lengths of longest common suffixes
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    
    // Fill the table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          
          if (dp[i][j] > maxLength) {
            maxLength = dp[i][j];
            endIndex = i;
          }
        }
      }
    }
    
    // Extract the substring
    if (maxLength === 0) return '';
    return str1.substring(endIndex - maxLength, endIndex);
  }
} 