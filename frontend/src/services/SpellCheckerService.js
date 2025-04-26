/**
 * SpellCheckerService.js - Service for spellchecking functionality 
 * Uses Typo.js and dictionaries located in public/dictionaries
 */

import { isDemoMode } from '../utils/envUtils';

class SpellCheckerService {
  constructor() {
    this.dictionaries = {};
    this.ignoredWords = new Set();
    this.customDictionary = new Set();
    this.initialized = false;
    this.initPromise = null;
  }
  
  /**
   * Initialize the spell checker service
   * @param {Object} options
   * @param {string[]} options.languages - Array of language codes to load
   * @param {boolean} options.loadCustomDictionary - Whether to load custom dictionary
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    if (this.initialized) return;
    
    // If initialization is in progress, return the promise
    if (this.initPromise) return this.initPromise;
    
    const defaultOptions = {
      languages: ['en-US'],
      loadCustomDictionary: true
    };
    
    const config = { ...defaultOptions, ...options };
    
    this.initPromise = (async () => {
      try {
        // Load dictionaries
        await Promise.all(config.languages.map(async (lang) => {
          await this.loadDictionary(lang);
        }));
        
        // Load custom dictionary and ignored words from localStorage
        if (config.loadCustomDictionary) {
          this.loadCustomDictionaryFromStorage();
          this.loadIgnoredWordsFromStorage();
        }
        
        this.initialized = true;
        console.log('SpellCheckerService initialized successfully');
      } catch (error) {
        console.error('Failed to initialize SpellCheckerService:', error);
        throw error;
      }
    })();
    
    return this.initPromise;
  }
  
  /**
   * Load a dictionary for a specific language
   * @param {string} lang - Language code
   * @returns {Promise<void>}
   */
  async loadDictionary(lang) {
    if (this.dictionaries[lang]) return;
    
    try {
      if (isDemoMode()) {
        // In demo mode, use a simple mock dictionary
        this.dictionaries[lang] = new Set([
          'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 
          'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'I',
          'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word',
          'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said',
          'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
          'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so',
          'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look',
          'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people',
          'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now',
          'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
          'email', 'draft', 'send', 'message', 'inbox', 'compose', 'reply', 'forward',
          'attachment', 'subject', 'recipient', 'sender', 'signature', 'template',
          'schedule', 'calendar', 'meeting', 'notification', 'alert', 'settings'
        ]);
        console.log(`Loaded demo dictionary for ${lang}`);
        return;
      }
      
      // In a real app, we would fetch the dictionary file
      const response = await fetch(`/dictionaries/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load dictionary for ${lang}: ${response.statusText}`);
      }
      
      const words = await response.json();
      this.dictionaries[lang] = new Set(words);
      console.log(`Loaded dictionary for ${lang} with ${words.length} words`);
    } catch (error) {
      console.error(`Error loading dictionary for ${lang}:`, error);
      // Fallback to empty dictionary
      this.dictionaries[lang] = new Set();
      throw error;
    }
  }
  
  /**
   * Check if a word is spelled correctly
   * @param {string} word - Word to check
   * @param {string} lang - Language code
   * @returns {boolean} - True if word is spelled correctly
   */
  checkWord(word, lang = 'en-US') {
    if (!this.initialized) {
      console.warn('SpellCheckerService not initialized yet');
      return true;
    }
    
    // Ignore empty strings, numbers, and URLs
    if (!word || word.trim() === '' || /^\d+$/.test(word) || /^https?:\/\//.test(word)) {
      return true;
    }
    
    // Normalize word for checking
    const normalizedWord = word.toLowerCase().trim();
    
    // Check if word is in ignored list
    if (this.ignoredWords.has(normalizedWord)) {
      return true;
    }
    
    // Check if word is in custom dictionary
    if (this.customDictionary.has(normalizedWord)) {
      return true;
    }
    
    // Check if word is in language dictionary
    const dictionary = this.dictionaries[lang];
    if (!dictionary) {
      console.warn(`Dictionary for ${lang} not loaded`);
      return true;
    }
    
    return dictionary.has(normalizedWord);
  }
  
  /**
   * Get suggestions for a misspelled word
   * @param {string} word - Misspelled word
   * @param {string} lang - Language code
   * @param {number} maxSuggestions - Maximum number of suggestions to return
   * @returns {string[]} - Array of suggestions
   */
  getSuggestions(word, lang = 'en-US', maxSuggestions = 5) {
    if (!this.initialized || !word) {
      return [];
    }
    
    const dictionary = this.dictionaries[lang];
    if (!dictionary || dictionary.size === 0) {
      return [];
    }
    
    // In demo mode, return some static suggestions
    if (isDemoMode()) {
      const lowercaseWord = word.toLowerCase();
      
      // Some common misspellings and their corrections
      const commonMisspellings = {
        'teh': ['the'],
        'recieve': ['receive'],
        'wierd': ['weird'],
        'accomodate': ['accommodate'],
        'occured': ['occurred'],
        'greatful': ['grateful'],
        'definately': ['definitely'],
        'beleive': ['believe'],
        'relevent': ['relevant'],
        'wich': ['which'],
        'recieved': ['received'],
        'seperate': ['separate'],
        'tommorow': ['tomorrow'],
        'acheive': ['achieve'],
        'freind': ['friend'],
        'thier': ['their'],
        'doesnt': ["doesn't"],
        'wont': ["won't"],
        'cant': ["can't"],
        'couldnt': ["couldn't"],
        'shouldnt': ["shouldn't"],
        'hasnt': ["hasn't"],
        'havent': ["haven't"],
        'isnt': ["isn't"],
        'arent': ["aren't"]
      };
      
      if (commonMisspellings[lowercaseWord]) {
        return commonMisspellings[lowercaseWord];
      }
      
      // Generate mock suggestions by character substitution
      const suggestions = [];
      
      // Add a corrected version with capitalization preserved
      if (word[0] === word[0].toUpperCase()) {
        suggestions.push(word[0].toUpperCase() + word.slice(1).toLowerCase());
      }
      
      // Common character substitutions
      const substitutions = {
        'a': ['e', 'i'],
        'e': ['a', 'i'],
        'i': ['e', 'y'],
        'o': ['a', 'u'],
        'u': ['o'],
        'c': ['k', 's'],
        'k': ['c'],
        's': ['c'],
        'y': ['i'],
        'z': ['s'],
        'f': ['ph'],
        'ph': ['f'],
        'mm': ['m'],
        'nn': ['n'],
        'll': ['l'],
        'rr': ['r'],
        'tt': ['t'],
        'pp': ['p']
      };
      
      // Create variations by substituting characters
      for (let i = 0; i < word.length; i++) {
        const char = word[i].toLowerCase();
        if (substitutions[char]) {
          for (const sub of substitutions[char]) {
            const suggestion = word.slice(0, i) + sub + word.slice(i + 1);
            if (!suggestions.includes(suggestion)) {
              suggestions.push(suggestion);
            }
          }
        }
      }
      
      // Create variations by adding/removing letters
      if (word.length > 1) {
        // Remove a letter
        for (let i = 0; i < word.length; i++) {
          const suggestion = word.slice(0, i) + word.slice(i + 1);
          if (!suggestions.includes(suggestion)) {
            suggestions.push(suggestion);
          }
        }
        
        // Add a letter
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        for (let i = 0; i <= word.length; i++) {
          for (const vowel of vowels) {
            const suggestion = word.slice(0, i) + vowel + word.slice(i);
            if (!suggestions.includes(suggestion)) {
              suggestions.push(suggestion);
            }
          }
        }
      }
      
      return suggestions.slice(0, maxSuggestions);
    }
    
    // In a real implementation, we would use a more sophisticated algorithm
    // like Levenshtein distance to find similar words
    
    // This is a simplified implementation for demonstration
    const suggestions = [];
    const lowercaseWord = word.toLowerCase();
    
    // First, check if we have the word with different capitalization
    if (dictionary.has(lowercaseWord)) {
      suggestions.push(lowercaseWord);
    }
    
    // Find words by calculating edit distance
    const maxDistance = Math.min(4, Math.floor(word.length / 2));
    
    for (const dictWord of dictionary) {
      if (suggestions.length >= maxSuggestions) break;
      
      const distance = this.levenshteinDistance(lowercaseWord, dictWord);
      if (distance <= maxDistance) {
        suggestions.push(dictWord);
      }
    }
    
    return suggestions.slice(0, maxSuggestions);
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {number} - Edit distance
   */
  levenshteinDistance(a, b) {
    const matrix = [];
    
    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    // Increment each column in the first row
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
   * Add a word to the ignored words list
   * @param {string} word - Word to ignore
   */
  ignoreWord(word) {
    if (!word) return;
    
    const normalizedWord = word.toLowerCase().trim();
    this.ignoredWords.add(normalizedWord);
    this.saveIgnoredWordsToStorage();
  }
  
  /**
   * Add a word to the custom dictionary
   * @param {string} word - Word to add
   */
  addToCustomDictionary(word) {
    if (!word) return;
    
    const normalizedWord = word.toLowerCase().trim();
    this.customDictionary.add(normalizedWord);
    this.saveCustomDictionaryToStorage();
  }
  
  /**
   * Remove a word from the ignored words list
   * @param {string} word - Word to remove
   */
  removeFromIgnoredWords(word) {
    if (!word) return;
    
    const normalizedWord = word.toLowerCase().trim();
    this.ignoredWords.delete(normalizedWord);
    this.saveIgnoredWordsToStorage();
  }
  
  /**
   * Remove a word from the custom dictionary
   * @param {string} word - Word to remove
   */
  removeFromCustomDictionary(word) {
    if (!word) return;
    
    const normalizedWord = word.toLowerCase().trim();
    this.customDictionary.delete(normalizedWord);
    this.saveCustomDictionaryToStorage();
  }
  
  /**
   * Load ignored words from localStorage
   */
  loadIgnoredWordsFromStorage() {
    try {
      const storedWords = localStorage.getItem('spellchecker_ignoredWords');
      if (storedWords) {
        const wordsList = JSON.parse(storedWords);
        this.ignoredWords = new Set(wordsList);
      }
    } catch (error) {
      console.error('Error loading ignored words from localStorage:', error);
    }
  }
  
  /**
   * Save ignored words to localStorage
   */
  saveIgnoredWordsToStorage() {
    try {
      const wordsList = Array.from(this.ignoredWords);
      localStorage.setItem('spellchecker_ignoredWords', JSON.stringify(wordsList));
    } catch (error) {
      console.error('Error saving ignored words to localStorage:', error);
    }
  }
  
  /**
   * Load custom dictionary from localStorage
   */
  loadCustomDictionaryFromStorage() {
    try {
      const storedWords = localStorage.getItem('spellchecker_customDictionary');
      if (storedWords) {
        const wordsList = JSON.parse(storedWords);
        this.customDictionary = new Set(wordsList);
      }
    } catch (error) {
      console.error('Error loading custom dictionary from localStorage:', error);
    }
  }
  
  /**
   * Save custom dictionary to localStorage
   */
  saveCustomDictionaryToStorage() {
    try {
      const wordsList = Array.from(this.customDictionary);
      localStorage.setItem('spellchecker_customDictionary', JSON.stringify(wordsList));
    } catch (error) {
      console.error('Error saving custom dictionary to localStorage:', error);
    }
  }
  
  /**
   * Get dictionary statistics
   * @returns {Object} - Dictionary statistics
   */
  getDictionaryStats() {
    const stats = {
      languages: {},
      ignoredWordsCount: this.ignoredWords.size,
      customDictionaryCount: this.customDictionary.size,
      totalWords: 0
    };
    
    for (const lang in this.dictionaries) {
      if (Object.prototype.hasOwnProperty.call(this.dictionaries, lang)) {
        const count = this.dictionaries[lang].size;
        stats.languages[lang] = count;
        stats.totalWords += count;
      }
    }
    
    return stats;
  }
  
  /**
   * Reset the spell checker service
   */
  reset() {
    this.dictionaries = {};
    this.ignoredWords = new Set();
    this.customDictionary = new Set();
    this.initialized = false;
    this.initPromise = null;
    
    // Clear localStorage
    localStorage.removeItem('spellchecker_ignoredWords');
    localStorage.removeItem('spellchecker_customDictionary');
  }
}

// Create singleton instance
const spellCheckerService = new SpellCheckerService();

export default spellCheckerService; 