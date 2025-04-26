/**
 * Compound word processing for Typo.js
 */
import { CompoundRule, Dictionary, TypoError, TypoErrorType } from './types';
import { normalizeCase, parseFlags } from './utils';

/**
 * Class for processing compound words
 */
export class CompoundProcessor {
  private dictionary: Dictionary;
  private compoundRules: CompoundRule[];
  private compoundMin: number = 3;           // Minimum length of compound parts
  private compoundMax: number = 0;           // Maximum number of words in a compound
  private compoundBeginFlags: string[] = []; // Flags for words that can begin a compound
  private compoundMiddleFlags: string[] = []; // Flags for words that can be in the middle of a compound
  private compoundEndFlags: string[] = [];   // Flags for words that can end a compound
  private compoundForbidFlags: string[] = []; // Flags for words that cannot be in compounds
  private onlyInCompoundFlag: string = '';   // Flag for words that can only be in compounds

  /**
   * Create a new CompoundProcessor
   * @param dictionary - The dictionary containing words and rules
   */
  constructor(dictionary: Dictionary) {
    this.dictionary = dictionary;
    this.compoundRules = dictionary.compoundRules;
    this.processCompoundOptions();
  }

  /**
   * Process compound options from the affix file
   */
  private processCompoundOptions(): void {
    for (const rule of this.compoundRules) {
      switch (rule.type) {
        case 'COMPOUNDMIN':
          this.compoundMin = parseInt(rule.value, 10) || 3;
          break;
        case 'COMPOUNDWORDMAX':
          this.compoundMax = parseInt(rule.value, 10) || 0;
          break;
        case 'COMPOUNDBEGIN':
          this.compoundBeginFlags.push(rule.value);
          break;
        case 'COMPOUNDMIDDLE':
          this.compoundMiddleFlags.push(rule.value);
          break;
        case 'COMPOUNDEND':
          this.compoundEndFlags.push(rule.value);
          break;
        case 'COMPOUNDFORBIDFLAG':
          this.compoundForbidFlags.push(rule.value);
          break;
        case 'ONLYINCOMPOUND':
          this.onlyInCompoundFlag = rule.value;
          break;
      }
    }
  }

  /**
   * Check if a compound word is valid
   * @param word - The word to check
   * @returns True if the word is a valid compound
   */
  public checkCompoundWord(word: string): boolean {
    if (!word) return false;
    
    // If no compound rules are defined, compounds are not supported
    if (this.compoundRules.length === 0) return false;
    
    // Word is too short to be a compound
    if (word.length < this.compoundMin * 2) return false;
    
    // Try to find valid compound splits
    return this.findCompoundSplits(word).length > 0;
  }

  /**
   * Find all valid ways to split a word into compounds
   * @param word - The word to check
   * @returns Array of valid compound splits
   */
  private findCompoundSplits(word: string): string[][] {
    const result: string[][] = [];
    const normalizedWord = normalizeCase(word, !this.dictionary.caseSensitive);
    
    // Recursive helper function to find compound splits
    const findSplits = (
      remaining: string,
      currentPath: string[] = [],
      startIndex: number = 0
    ) => {
      // Stop if we've reached the maximum compound word count
      if (this.compoundMax > 0 && currentPath.length >= this.compoundMax) return;
      
      // Try all possible splits
      for (let i = this.compoundMin; i <= remaining.length - this.compoundMin; i++) {
        const leftPart = remaining.substring(0, i);
        const rightPart = remaining.substring(i);
        
        // Check if this left part is valid
        if (this.isValidCompoundPart(leftPart, currentPath.length === 0, false)) {
          const newPath = [...currentPath, leftPart];
          
          // If the right part is also valid as an ending, we have a complete compound
          if (this.isValidCompoundPart(rightPart, false, true)) {
            result.push([...newPath, rightPart]);
          }
          
          // Continue searching with the remaining part
          findSplits(rightPart, newPath, startIndex + i);
        }
      }
    };
    
    findSplits(normalizedWord);
    return result;
  }

  /**
   * Check if a word can be part of a compound
   * @param word - The word to check
   * @param isBeginning - Whether this is the beginning of a compound
   * @param isEnding - Whether this is the end of a compound
   * @returns True if the word can be part of a compound
   */
  private isValidCompoundPart(word: string, isBeginning: boolean, isEnding: boolean): boolean {
    if (word.length < this.compoundMin) return false;
    
    // First check if the word is in the dictionary
    const flags = this.dictionary.words.get(word);
    if (!flags) return false;
    
    const parsedFlags = parseFlags(flags, this.dictionary.flagType);
    
    // Check if the word is forbidden in compounds
    for (const forbidFlag of this.compoundForbidFlags) {
      if (parsedFlags.includes(forbidFlag)) return false;
    }
    
    // Check positional constraints
    if (isBeginning) {
      // Word must have a COMPOUNDBEGIN flag or no position flags at all
      if (
        this.compoundBeginFlags.length > 0 && 
        !this.compoundBeginFlags.some(flag => parsedFlags.includes(flag))
      ) {
        return false;
      }
    } else if (isEnding) {
      // Word must have a COMPOUNDEND flag or no position flags at all
      if (
        this.compoundEndFlags.length > 0 && 
        !this.compoundEndFlags.some(flag => parsedFlags.includes(flag))
      ) {
        return false;
      }
    } else {
      // Word must have a COMPOUNDMIDDLE flag or no position flags at all
      if (
        this.compoundMiddleFlags.length > 0 && 
        !this.compoundMiddleFlags.some(flag => parsedFlags.includes(flag))
      ) {
        return false;
      }
    }
    
    // Check ONLYINCOMPOUND constraint
    if (
      this.onlyInCompoundFlag && 
      !parsedFlags.includes(this.onlyInCompoundFlag)
    ) {
      return false;
    }
    
    return true;
  }

  /**
   * Get all possible compound suggestions for a misspelled word
   * @param word - The misspelled word
   * @param maxSuggestions - Maximum number of suggestions to return
   * @returns Array of compound word suggestions
   */
  public getCompoundSuggestions(word: string, maxSuggestions: number = 3): string[] {
    if (!word || this.compoundRules.length === 0) return [];
    
    const suggestions: string[] = [];
    const compoundSplits = this.findCompoundSplits(word);
    
    // First add any complete valid compounds
    for (const split of compoundSplits) {
      if (split.length >= 2) {
        suggestions.push(split.join(''));
        if (suggestions.length >= maxSuggestions) break;
      }
    }
    
    // If we don't have enough suggestions, try with hyphens
    if (suggestions.length < maxSuggestions) {
      for (const split of compoundSplits) {
        if (split.length >= 2) {
          suggestions.push(split.join('-'));
          if (suggestions.length >= maxSuggestions) break;
        }
      }
    }
    
    return suggestions;
  }
} 