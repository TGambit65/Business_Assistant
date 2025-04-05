import {
  levenshteinDistance,
  normalizeString,
  truncateString,
  escapeRegExp,
  splitIntoWords,
  joinWords,
  removeDuplicateWords,
  containsAllWords,
  wordOverlapSimilarity
} from '../string';

describe('String Utilities', () => {
  describe('levenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('returns 1 for single character difference', () => {
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
    });

    it('returns correct distance for different strings', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('sunday', 'saturday')).toBe(3);
    });

    it('handles empty strings', () => {
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('', 'hello')).toBe(5);
      expect(levenshteinDistance('hello', '')).toBe(5);
    });
  });

  describe('normalizeString', () => {
    it('converts to lowercase', () => {
      expect(normalizeString('Hello World')).toBe('hello world');
    });

    it('removes diacritics', () => {
      expect(normalizeString('café')).toBe('cafe');
      expect(normalizeString('über')).toBe('uber');
    });

    it('trims whitespace', () => {
      expect(normalizeString('  hello  ')).toBe('hello');
    });
  });

  describe('truncateString', () => {
    it('returns original string if shorter than max length', () => {
      expect(truncateString('hello', 10)).toBe('hello');
    });

    it('truncates and adds ellipsis if longer than max length', () => {
      expect(truncateString('hello world', 8)).toBe('hello...');
    });

    it('handles empty string', () => {
      expect(truncateString('', 5)).toBe('');
    });
  });

  describe('escapeRegExp', () => {
    it('escapes special regex characters', () => {
      expect(escapeRegExp('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    it('handles regular characters', () => {
      expect(escapeRegExp('hello')).toBe('hello');
    });
  });

  describe('splitIntoWords', () => {
    it('splits simple space-separated words', () => {
      expect(splitIntoWords('hello world')).toEqual(['hello', 'world']);
    });

    it('preserves quoted phrases', () => {
      expect(splitIntoWords('hello "world of wonders"')).toEqual([
        'hello',
        'world of wonders'
      ]);
    });

    it('handles multiple spaces', () => {
      expect(splitIntoWords('hello   world')).toEqual(['hello', 'world']);
    });

    it('handles empty string', () => {
      expect(splitIntoWords('')).toEqual([]);
    });
  });

  describe('joinWords', () => {
    it('joins words with spaces', () => {
      expect(joinWords(['hello', 'world'])).toBe('hello world');
    });

    it('quotes phrases with spaces', () => {
      expect(joinWords(['hello', 'world of wonders'])).toBe(
        'hello "world of wonders"'
      );
    });

    it('handles empty array', () => {
      expect(joinWords([])).toBe('');
    });
  });

  describe('removeDuplicateWords', () => {
    it('removes duplicate words while preserving order', () => {
      expect(removeDuplicateWords('hello world hello')).toBe('hello world');
    });

    it('preserves quoted phrases', () => {
      expect(removeDuplicateWords('hello "world of wonders" world')).toBe(
        'hello "world of wonders"'
      );
    });

    it('handles empty string', () => {
      expect(removeDuplicateWords('')).toBe('');
    });
  });

  describe('containsAllWords', () => {
    it('returns true when all words are present', () => {
      expect(containsAllWords('hello world', 'world hello')).toBe(true);
    });

    it('returns false when some words are missing', () => {
      expect(containsAllWords('hello world', 'world goodbye')).toBe(false);
    });

    it('handles quoted phrases', () => {
      expect(
        containsAllWords('hello "world of wonders"', 'world of wonders')
      ).toBe(true);
    });

    it('handles empty strings', () => {
      expect(containsAllWords('', '')).toBe(true);
      expect(containsAllWords('hello', '')).toBe(true);
      expect(containsAllWords('', 'hello')).toBe(false);
    });
  });

  describe('wordOverlapSimilarity', () => {
    it('returns 1 for identical strings', () => {
      expect(wordOverlapSimilarity('hello world', 'hello world')).toBe(1);
    });

    it('returns 0 for completely different strings', () => {
      expect(wordOverlapSimilarity('hello', 'goodbye')).toBe(0);
    });

    it('returns correct similarity for partial matches', () => {
      expect(wordOverlapSimilarity('hello world', 'hello')).toBe(0.5);
      expect(wordOverlapSimilarity('hello world', 'world hello')).toBe(1);
    });

    it('handles empty strings', () => {
      expect(wordOverlapSimilarity('', '')).toBe(0);
      expect(wordOverlapSimilarity('hello', '')).toBe(0);
      expect(wordOverlapSimilarity('', 'hello')).toBe(0);
    });
  });
}); 