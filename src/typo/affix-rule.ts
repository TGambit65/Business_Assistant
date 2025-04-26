/**
 * Affix rule processing for Typo.js
 */
import { AffixRule, Dictionary, TypoError, TypoErrorType } from './types';
import { applyAffix, matchesCondition, parseFlags } from './utils';

/**
 * Class for processing affix rules and generating word forms
 */
export class AffixProcessor {
  private rules: Map<string, AffixRule>;
  private dictionary: Dictionary;
  private wordCache: Map<string, string[]> = new Map();
  
  /**
   * Create a new AffixProcessor
   * @param dictionary - The dictionary containing rules and words
   */
  constructor(dictionary: Dictionary) {
    this.rules = dictionary.rules;
    this.dictionary = dictionary;
  }

  /**
   * Apply affix rules to generate variations of a word
   * @param word - The base word
   * @param flags - The flags associated with the word
   * @returns Array of generated words
   */
  public expandWord(word: string, flags: string): string[] {
    if (!word) return [word];
    
    // Check cache first
    const cacheKey = `${word}:${flags}`;
    if (this.wordCache.has(cacheKey)) {
      return this.wordCache.get(cacheKey) || [word];
    }
    
    const parsedFlags = parseFlags(flags || '', this.dictionary.flagType);
    const generatedWords = new Set<string>([word]);
    
    // Apply each affix rule
    for (const flag of parsedFlags) {
      const rule = this.rules.get(flag);
      if (!rule) continue;
      
      for (const entry of rule.entries) {
        // Check if condition matches
        if (rule.type === 'PFX') {
          // For prefixes
          if (matchesCondition(word, entry.condition)) {
            const newWord = this.applyPrefix(word, entry.stripping, entry.affix);
            if (newWord && newWord !== word) {
              generatedWords.add(newWord);
            }
          }
        } else {
          // For suffixes
          if (this.matchesSuffixCondition(word, entry.condition)) {
            const newWord = this.applySuffix(word, entry.stripping, entry.affix);
            if (newWord && newWord !== word) {
              generatedWords.add(newWord);
            }
          }
        }
      }
    }
    
    // Handle cross-product rules (prefix + suffix)
    for (const prefixFlag of parsedFlags) {
      const prefixRule = this.rules.get(prefixFlag);
      if (!prefixRule || prefixRule.type !== 'PFX' || !prefixRule.crossProduct) continue;
      
      for (const suffixFlag of parsedFlags) {
        const suffixRule = this.rules.get(suffixFlag);
        if (!suffixRule || suffixRule.type !== 'SFX' || !suffixRule.crossProduct) continue;
        
        // Apply prefix and suffix combinations
        for (const prefixEntry of prefixRule.entries) {
          if (!matchesCondition(word, prefixEntry.condition)) continue;
          
          const prefixedWord = this.applyPrefix(word, prefixEntry.stripping, prefixEntry.affix);
          if (!prefixedWord) continue;
          
          for (const suffixEntry of suffixRule.entries) {
            if (!this.matchesSuffixCondition(prefixedWord, suffixEntry.condition)) continue;
            
            const affixedWord = this.applySuffix(prefixedWord, suffixEntry.stripping, suffixEntry.affix);
            if (affixedWord && affixedWord !== word && affixedWord !== prefixedWord) {
              generatedWords.add(affixedWord);
            }
          }
        }
      }
    }
    
    const result = Array.from(generatedWords);
    this.wordCache.set(cacheKey, result);
    return result;
  }
  
  /**
   * Apply a prefix to a word
   * @param word - Base word
   * @param stripping - Characters to strip
   * @param affix - Prefix to add
   * @returns New word with prefix
   */
  private applyPrefix(word: string, stripping: string, affix: string): string {
    if (!word) return '';
    
    // Strip characters from the beginning if needed
    if (stripping && stripping !== '0') {
      if (!word.startsWith(stripping)) return '';
      word = word.substring(stripping.length);
    }
    
    return affix + word;
  }
  
  /**
   * Apply a suffix to a word
   * @param word - Base word
   * @param stripping - Characters to strip
   * @param affix - Suffix to add
   * @returns New word with suffix
   */
  private applySuffix(word: string, stripping: string, affix: string): string {
    if (!word) return '';
    
    // Strip characters from the end if needed
    if (stripping && stripping !== '0') {
      if (!word.endsWith(stripping)) return '';
      word = word.substring(0, word.length - stripping.length);
    }
    
    return word + affix;
  }
  
  /**
   * Check if a word matches a suffix condition
   * @param word - Word to check
   * @param condition - Condition pattern
   * @returns True if the word matches the condition
   */
  private matchesSuffixCondition(word: string, condition: string): boolean {
    if (!condition || condition === '.') return true;
    if (!word) return false;
    
    // Handle character class conditions for suffixes [abc] or [^abc]
    if (condition.startsWith('[')) {
      const isNegated = condition[1] === '^';
      const startIndex = isNegated ? 2 : 1;
      const endIndex = condition.indexOf(']', startIndex);
      
      if (endIndex === -1) return false;
      
      const charClass = condition.substring(startIndex, endIndex);
      const lastChar = word.charAt(word.length - 1);
      
      const isInClass = charClass.includes(lastChar);
      return isNegated ? !isInClass : isInClass;
    }
    
    // Simple suffix match (not used in Hunspell, but included for completeness)
    return word.endsWith(condition);
  }
  
  /**
   * Check if a word is allowed when affixed
   * @param word - The word to check
   * @param flags - The flags for the word
   * @returns True if the word is valid with affixes
   */
  public isValidWithAffixes(word: string, flags: string): boolean {
    if (!flags) return true;
    
    const parsedFlags = parseFlags(flags, this.dictionary.flagType);
    const needAffix = this.dictionary.flags.get('NEEDAFFIX');
    
    // If the word has the NEEDAFFIX flag, it's only valid when affixed
    if (needAffix && parsedFlags.includes(needAffix[0])) {
      // Generate all affixed forms
      const expandedForms = this.expandWord(word, flags);
      
      // If the only expanded form is the word itself, it's not valid
      return expandedForms.length > 1;
    }
    
    return true;
  }
} 