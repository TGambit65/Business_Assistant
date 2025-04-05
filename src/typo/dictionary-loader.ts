/**
 * Dictionary loading and parsing functionality for Typo.js
 */
import { 
  AffixEntry, 
  AffixRule, 
  CompoundRule, 
  Dictionary, 
  FlagType, 
  TypoError, 
  TypoErrorType 
} from './types';
import { parseFlags } from './utils';

/**
 * Parses a Hunspell .dic file and extracts words and their flags
 * @param content - Content of the .dic file
 * @param flagType - Type of flag used in the dictionary
 * @returns Map of words to their flags
 */
export function parseDicFile(content: string, flagType: string): Map<string, string> {
  if (!content) {
    throw new TypoError(
      'Dictionary content is empty',
      TypoErrorType.DICTIONARY_PARSE_ERROR
    );
  }

  const words = new Map<string, string>();
  const lines = content.split(/\r?\n/);
  
  // Skip the first line (word count) in official dictionaries
  // but allow dictionaries without count for flexibility
  let startIndex = 0;
  if (lines.length > 0 && /^\s*\d+\s*$/.test(lines[0])) {
    startIndex = 1;
  }
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      continue;
    }
    
    // Handle word/flags format
    // Note: We need to handle escaped slashes in words like "isn\\/t"
    let word: string;
    let flags = '';
    
    let slashIndex = -1;
    let escaped = false;
    
    // Find the first unescaped slash
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '\\') {
        escaped = !escaped;
      } else if (line[j] === '/' && !escaped) {
        slashIndex = j;
        break;
      } else {
        escaped = false;
      }
    }
    
    if (slashIndex >= 0) {
      word = line.substring(0, slashIndex).replace(/\\\//g, '/');
      flags = line.substring(slashIndex + 1);
    } else {
      word = line.replace(/\\\//g, '/');
    }
    
    words.set(word, flags);
  }
  
  return words;
}

/**
 * Parses a Hunspell .aff file and extracts rules and options
 * @param content - Content of the .aff file
 * @returns Object containing rules, flags, compound rules, and options
 */
export function parseAffFile(content: string): {
  rules: Map<string, AffixRule>;
  flags: Map<string, string[]>;
  compoundRules: CompoundRule[];
  options: Record<string, string>;
} {
  if (!content) {
    throw new TypoError(
      'Affix file content is empty',
      TypoErrorType.AFFIX_PARSE_ERROR
    );
  }

  const rules = new Map<string, AffixRule>();
  const flags = new Map<string, string[]>();
  const compoundRules: CompoundRule[] = [];
  const options: Record<string, string> = {
    // Default options
    SET: 'UTF-8',
    FLAG: FlagType.CHAR,
  };

  const lines = content.split(/\r?\n/);
  let currentRule: AffixRule | null = null;
  let entriesRemaining = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      continue;
    }
    
    const parts = line.split(/\s+/);
    const command = parts[0];
    
    // Handle common options
    if (
      command === 'SET' || 
      command === 'FLAG' || 
      command === 'LANG' || 
      command === 'IGNORE'
    ) {
      if (parts.length > 1) {
        options[command] = parts[1];
      }
      continue;
    }
    
    // Handle compound rule options
    if (
      command === 'COMPOUNDRULE' ||
      command === 'COMPOUNDMIN' ||
      command === 'COMPOUNDWORDMAX' ||
      command === 'COMPOUNDFLAG' ||
      command === 'COMPOUNDBEGIN' ||
      command === 'COMPOUNDMIDDLE' ||
      command === 'COMPOUNDEND' ||
      command === 'COMPOUNDPERMITFLAG' ||
      command === 'COMPOUNDFORBIDFLAG' ||
      command === 'COMPOUNDSYLLABLE' ||
      command === 'SYLLABLENUM' ||
      command === 'ONLYINCOMPOUND'
    ) {
      if (parts.length > 1) {
        compoundRules.push({
          type: command,
          value: parts.slice(1).join(' ')
        });
      }
      continue;
    }
    
    // Handle special flags
    if (
      command === 'FORBIDDENWORD' ||
      command === 'KEEPCASE' ||
      command === 'NEEDAFFIX' ||
      command === 'CIRCUMFIX' ||
      command === 'NOSUGGEST'
    ) {
      if (parts.length > 1) {
        flags.set(command, [parts[1]]);
      }
      continue;
    }
    
    // Handle prefix and suffix rules
    if (command === 'PFX' || command === 'SFX') {
      if (parts.length >= 4 && !currentRule) {
        // This is a rule header
        const flag = parts[1];
        const crossProduct = parts[2] === 'Y';
        const entryCount = parseInt(parts[3], 10);
        
        currentRule = {
          type: command as 'PFX' | 'SFX',
          flag,
          crossProduct,
          entries: []
        };
        
        entriesRemaining = entryCount;
        continue;
      } else if (currentRule && entriesRemaining > 0) {
        // This is a rule entry
        if (parts.length >= 4) {
          const entry: AffixEntry = {
            flag: parts[1],
            stripping: parts[2] === '0' ? '' : parts[2],
            affix: parts[3] === '0' ? '' : parts[3],
            condition: parts.length > 4 ? parts[4] : '.'
          };
          
          // Check for continuation flags in the affix
          const slashIndex = entry.affix.indexOf('/');
          if (slashIndex >= 0) {
            const contFlagStr = entry.affix.substring(slashIndex + 1);
            entry.affix = entry.affix.substring(0, slashIndex);
            entry.contFlags = parseFlags(contFlagStr, options.FLAG);
          }
          
          // Extract morphological data if present
          if (parts.length > 5) {
            entry.morphCode = parts.slice(5);
          }
          
          currentRule.entries.push(entry);
          entriesRemaining--;
          
          if (entriesRemaining === 0) {
            rules.set(currentRule.flag, currentRule);
            currentRule = null;
          }
        }
      }
    }
    
    // Handle REP (replacement) patterns for suggestions
    if (command === 'REP') {
      // Not implemented in this version
    }
  }
  
  return { rules, flags, compoundRules, options };
}

/**
 * Loads and parses both dictionary files to create a complete dictionary object
 * @param affData - Content of the .aff file
 * @param dicData - Content of the .dic file
 * @returns Complete dictionary object
 */
export function loadDictionary(affData: string, dicData: string): Dictionary {
  // Parse the affix file first to get options
  const { rules, flags, compoundRules, options } = parseAffFile(affData);
  
  // Parse dictionary with the correct flag type
  const words = parseDicFile(dicData, options.FLAG);
  
  // Determine if dictionary is case sensitive
  const caseSensitive = !options.LANG || 
                         !['tr', 'az', 'crh'].includes(options.LANG.toLowerCase());
  
  return {
    words,
    flags,
    rules,
    compoundRules,
    encoding: options.SET || 'UTF-8',
    caseSensitive,
    complexPrefixes: options.COMPLEXPREFIXES === 'true',
    flagType: options.FLAG
  };
}

/**
 * Creates a minimal fallback dictionary
 * @param language - Language code
 * @returns A minimal dictionary
 */
export function createFallbackDictionary(language: string): Dictionary {
  const commonWords = new Map<string, string>();
  
  // Add a few common words to the fallback dictionary
  ['the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'is', 'are', 'be', 'to', 'from', 'by', 'with', 'that', 'this'].forEach(word => {
    commonWords.set(word, '');
  });
  
  return {
    words: commonWords,
    flags: new Map(),
    rules: new Map(),
    compoundRules: [],
    encoding: 'UTF-8',
    caseSensitive: false,
    complexPrefixes: false,
    flagType: FlagType.CHAR
  };
} 