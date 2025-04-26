import * as fs from 'fs/promises';
import * as path from 'path';
import { DictionaryData, SpellCheckerError, SpellCheckerErrorType } from './types';
import { calculateLevenshteinDistance } from './utils';

/**
 * Utility functions for dictionary operations
 */
export class DictionaryUtils {
  /**
   * Default path template for dictionary files
   */
  private static readonly DEFAULT_DICTIONARY_PATH = './dictionaries/{language}.dic';

  /**
   * Loads a dictionary file from disk with retry logic
   * 
   * @param language Language code for the dictionary
   * @param dictionaryPath Optional path to the dictionary file
   * @param maxRetries Maximum number of retry attempts
   * @param retryDelay Delay between retries in milliseconds
   * @returns Dictionary data ready for use in SpellChecker
   */
  static async loadDictionaryFile(
    language: string,
    dictionaryPath: string = this.DEFAULT_DICTIONARY_PATH,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<any> {
    const filePath = dictionaryPath.replace('{language}', language);
    
    let lastError: Error | null = null;
    
    // Try loading the dictionary with specified retries
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Read and parse the dictionary file
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return this.parseDictionaryContent(fileContent);
      } catch (error) {
        lastError = error as Error;
        
        // If this was the last attempt, don't delay
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    // If we got here, all attempts failed
    throw new Error(`Failed to load dictionary for language '${language}': ${lastError?.message || ''}`);
  }
  
  /**
   * Creates a fallback dictionary with common words
   * Used when a requested dictionary is not available
   * 
   * @param language Language code for the fallback dictionary
   * @returns A small fallback dictionary
   */
  static createFallbackDictionary(language: string): DictionaryData {
    // Common English words for fallback (very limited set)
    const commonWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
      'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
      'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
      'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
      'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also'
    ]);
    
    return {
      words: commonWords,
      metadata: {
        wordCount: commonWords.size,
        lastUpdated: new Date(),
        version: 'fallback-1.0'
      }
    };
  }
  
  /**
   * Parses dictionary content from a file
   * 
   * @param content Raw content of the dictionary file
   * @returns Parsed dictionary as a Map for backward compatibility
   */
  private static parseDictionaryContent(content: string): Map<string, boolean> {
    // Split content by lines and filter out empty lines or comments
    const lines = content.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    // Extract words and handle word variations
    const result = new Map<string, boolean>();
    
    for (const line of lines) {
      // Some dictionaries have format: word/flags
      // Extract just the word part
      const word = line.split('/')[0].toLowerCase().trim();
      if (word) {
        result.set(word, true);
      }
    }
    
    // No need to add custom size - Map already has size property
    
    return result;
  }
  
  /**
   * Generates suggestions for a misspelled word
   * 
   * @param word Misspelled word
   * @param dictionary Dictionary to use for suggestions (can be Map or DictionaryData)
   * @param maxSuggestions Maximum number of suggestions to return
   * @param maxDistance Maximum edit distance for suggestions
   * @returns Array of word suggestions
   */
  static getSuggestions(
    word: string, 
    dictionary: Map<string, boolean> | DictionaryData, 
    maxSuggestions: number = 5,
    maxDistance: number = 2
  ): string[] {
    if (!word) {
      return [];
    }
    
    // Handle different dictionary types
    let wordSet: Set<string>;
    if (dictionary instanceof Map) {
      wordSet = new Set([...dictionary.keys()]);
    } else if (dictionary && 'words' in dictionary) {
      wordSet = dictionary.words;
    } else {
      return [];
    }
    
    if (!wordSet || wordSet.size === 0) {
      return [];
    }
    
    const lowercaseWord = word.toLowerCase();
    const suggestions: Array<{word: string, distance: number}> = [];
    
    // Check all words in the dictionary
    for (const dictWord of wordSet) {
      // Skip exact match
      if (dictWord === lowercaseWord) continue;
      
      // Skip words with large length difference (optimization)
      if (Math.abs(dictWord.length - lowercaseWord.length) > maxDistance) {
        continue;
      }
      
      const distance = calculateLevenshteinDistance(lowercaseWord, dictWord);
      
      // Only consider words within the allowed edit distance
      if (distance <= maxDistance) {
        suggestions.push({ word: dictWord, distance });
      }
    }
    
    // Sort by distance (closest first) and return just the words
    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxSuggestions)
      .map(suggestion => suggestion.word);
  }
}