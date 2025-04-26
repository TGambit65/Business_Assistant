import { calculateLevenshteinDistance, normalizeWord, splitCompoundWord } from '../utils';

describe('Utils', () => {
  describe('calculateLevenshteinDistance', () => {
    test('should calculate correct distance between words', () => {
      expect(calculateLevenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(calculateLevenshteinDistance('hello', 'hello')).toBe(0);
      expect(calculateLevenshteinDistance('', 'test')).toBe(4);
      expect(calculateLevenshteinDistance('test', '')).toBe(4);
    });
  });

  describe('normalizeWord', () => {
    test('should normalize words correctly', () => {
      expect(normalizeWord('HeLLo')).toBe('hello');
      expect(normalizeWord('WORLD!')).toBe('world');
      expect(normalizeWord('test-case')).toBe('testcase');
      expect(normalizeWord('')).toBe('');
    });

    test('should handle special characters', () => {
      expect(normalizeWord('café')).toBe('cafe');
      expect(normalizeWord('über')).toBe('uber');
    });
  });

  describe('splitCompoundWord', () => {
    test('should split compound words correctly', () => {
      const dictionary = new Map([
        ['book', true],
        ['store', true],
        ['keeper', true]
      ]);

      expect(splitCompoundWord('bookstore', dictionary))
        .toEqual(['book', 'store']);
      expect(splitCompoundWord('storekeeper', dictionary))
        .toEqual(['store', 'keeper']);
    });

    test('should return empty array for non-compound words', () => {
      const dictionary = new Map([['test', true]]);
      expect(splitCompoundWord('hello', dictionary)).toEqual([]);
    });

    test('should handle empty dictionary', () => {
      expect(splitCompoundWord('test', new Map())).toEqual([]);
    });
  });
});
