/**
 * Calculates the Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize first row and column
  for (let i = 1; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 1; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1 // insertion
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Normalizes a string by removing diacritics and converting to lowercase
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  if (maxLength <= 3) {
    return str.slice(0, maxLength);
  }
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Escapes special characters in a string for use in regular expressions
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits a string into words, removing quotes from quoted phrases.
 * Example: 'hello "world of wonders"' -> ['hello', 'world of wonders']
 */
export function splitIntoWords(str: string): string[] {
  const regex = /[^\s"]+|"([^"]*)"/g;
  let matches = str.match(regex);
  if (!matches) {
    return [];
  }
  return matches.map(match => match.startsWith('"') && match.endsWith('"') ? match.slice(1, -1) : match);
}

/**
 * Helper: Splits a string into tokens, preserving quoted phrases *with* quotes.
 * Example: 'hello "world of wonders"' -> ['hello', '"world of wonders"']
 */
function splitIntoTokensWithQuotes(str: string): string[] {
  const regex = /[^\s"]+|"([^"]*)"/g;
  const matches = str.match(regex);
  return matches || [];
}


/**
 * Joins words with spaces, properly handling quoted phrases by adding quotes if needed.
 */
export function joinWords(words: string[]): string {
  return words
    .map(word => (word.includes(' ') ? `"${word}"` : word))
    .join(' ');
}

/**
 * Removes duplicate words/phrases from a string while preserving order and handling quotes.
 */
export function removeDuplicateWords(str: string): string {
  const tokens = splitIntoTokensWithQuotes(str);
  const seenNormalizedContent = new Set<string>(); // Track normalized content seen
  const uniqueOriginalTokens: string[] = [];

  for (const token of tokens) {
    const isQuoted = token.startsWith('"') && token.endsWith('"');
    // Normalize the content *inside* quotes or the token itself if not quoted
    const contentToNormalize = isQuoted ? token.slice(1, -1) : token;
    const normalizedContent = normalizeString(contentToNormalize);

    // Check if the normalized content (or the full quoted phrase if empty inside) has been seen
    // Special case: empty quoted phrase "" should be treated uniquely if needed,
    // but normalizeString("") is "", same as an empty unquoted token.
    // Let's treat normalized content as the key for uniqueness.
    if (!seenNormalizedContent.has(normalizedContent)) {
      seenNormalizedContent.add(normalizedContent);
      uniqueOriginalTokens.push(token); // Keep the original token form

      // If it was a non-empty quoted phrase, add its individual normalized words to the seen set
      // to prevent individual words appearing later if they were part of the phrase.
      if (isQuoted && normalizedContent.length > 0) {
          const innerWords = splitIntoWords(contentToNormalize); // Use split that removes quotes
          innerWords.forEach(innerWord => seenNormalizedContent.add(normalizeString(innerWord)));
      }
    }
  }

  // Join the unique original tokens, removing outer quotes for joinWords
  return joinWords(uniqueOriginalTokens.map(token =>
      token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token
  ));
}

/**
 * Checks if a string contains all the words/phrases from another string, handling quotes.
 */
export function containsAllWords(str1: string, str2: string): boolean {
  const tokens1WithQuotes = splitIntoTokensWithQuotes(str1);
  const tokens2WithQuotes = splitIntoTokensWithQuotes(str2);

  // Create a set of normalized *individual* words from str1 for quick lookup
  const availableWords1Normalized = new Set<string>();
  tokens1WithQuotes.forEach(token => {
      const isQuoted = token.startsWith('"') && token.endsWith('"');
      const content = isQuoted ? token.slice(1, -1) : token;
      if (content.length > 0) { // Avoid adding empty strings from "" or spaces
          const innerWords = splitIntoWords(content); // Splits content, removes quotes if any were nested (unlikely)
          innerWords.forEach(innerWord => availableWords1Normalized.add(normalizeString(innerWord)));
      }
  });

  // Check if every token from str2 is present in the set from str1
  return tokens2WithQuotes.every(token2 => {
    const isQuoted2 = token2.startsWith('"') && token2.endsWith('"');
    const content2 = isQuoted2 ? token2.slice(1, -1) : token2;

    if (content2.length === 0) return true; // Empty token/phrase is considered contained

    const innerWords2 = splitIntoWords(content2); // Get individual words from token2

    // Check if *all* inner words of token2 exist in the normalized set of words from str1
    return innerWords2.every(iw => availableWords1Normalized.has(normalizeString(iw)));
  });
}

/**
 * Calculates the similarity between two strings using word overlap
 */
export function wordOverlapSimilarity(str1: string, str2: string): number {
  const words1 = new Set(splitIntoWords(str1).map(normalizeString));
  const words2 = new Set(splitIntoWords(str2).map(normalizeString));

  const intersection = new Set( [...words1].filter(word => words2.has(word)) );
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) { return 0; }
  return intersection.size / union.size;
}