/**
 * Utility functions for spellchecking operations
 */

/**
 * Calculates the Levenshtein edit distance between two strings
 * @param source The source string
 * @param target The target string
 * @returns The edit distance (number of edits required to transform source to target)
 */
export function calculateLevenshteinDistance(source: string, target: string): number {
  // Handle edge cases
  if (source.length === 0) return target.length;
  if (target.length === 0) return source.length;
  
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= target.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= source.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= target.length; i++) {
    for (let j = 1; j <= source.length; j++) {
      if (target.charAt(i - 1) === source.charAt(j - 1)) {
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
  
  return matrix[target.length][source.length];
}

/**
 * Normalizes a word by converting to lowercase and removing special characters
 * @param word The word to normalize
 * @returns Normalized word
 */
export function normalizeWord(word: string): string {
  if (!word) return '';
  
  // Convert to lowercase
  let normalized = word.toLowerCase();
  
  // Remove accents/diacritics
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Remove non-alphabetic characters
  normalized = normalized.replace(/[^a-z0-9]/g, '');
  
  return normalized;
}

/**
 * Attempts to split a compound word into its component parts
 * @param word The potential compound word
 * @param dictionary Dictionary to check components against
 * @returns Array of component words, or empty array if not a compound word
 */
export function splitCompoundWord(word: string, dictionary: Map<string, boolean>): string[] {
  if (!word || dictionary.size === 0) {
    return [];
  }
  
  const maxWordLength = 20; // Avoid excessive recursion
  if (word.length > maxWordLength) {
    return [];
  }
  
  // Try to find valid splits
  for (let i = 2; i < word.length - 1; i++) {
    const firstPart = word.substring(0, i);
    const secondPart = word.substring(i);
    
    if (dictionary.has(firstPart) && dictionary.has(secondPart)) {
      return [firstPart, secondPart];
    }
    
    // Check if first part is valid and second part can be further split
    if (dictionary.has(firstPart)) {
      const remainingSplit = splitCompoundWord(secondPart, dictionary);
      if (remainingSplit.length > 0) {
        return [firstPart, ...remainingSplit];
      }
    }
  }
  
  return [];
}

/**
 * Generates possible variations of a word by adding/removing characters
 * @param word The original word
 * @returns Array of word variations
 */
export function generateWordVariations(word: string): string[] {
  const variations: string[] = [];
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  
  // Deletions (remove one character)
  for (let i = 0; i < word.length; i++) {
    variations.push(word.slice(0, i) + word.slice(i + 1));
  }
  
  // Insertions (add one character)
  if (word.length < 15) { // Avoid too many variations for long words
    for (let i = 0; i <= word.length; i++) {
      for (let j = 0; j < alphabet.length; j++) {
        variations.push(word.slice(0, i) + alphabet[j] + word.slice(i));
      }
    }
  }
  
  // Substitutions (change one character)
  for (let i = 0; i < word.length; i++) {
    for (let j = 0; j < alphabet.length; j++) {
      if (alphabet[j] !== word[i]) {
        variations.push(word.slice(0, i) + alphabet[j] + word.slice(i + 1));
      }
    }
  }
  
  // Transpositions (swap adjacent characters)
  for (let i = 0; i < word.length - 1; i++) {
    variations.push(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2));
  }
  
  return variations;
}

/**
 * Checks if a word contains any numbers
 * @param word The word to check
 * @returns True if the word contains numbers
 */
export function containsNumbers(word: string): boolean {
  return /\d/.test(word);
}

/**
 * Checks if a word is all uppercase
 * @param word The word to check
 * @returns True if the word is all uppercase
 */
export function isAllUppercase(word: string): boolean {
  return /^[A-Z]+$/.test(word);
}