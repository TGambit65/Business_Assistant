import { DictionaryUtils } from '../dictionary-utils';
import fs from 'fs/promises';
import { DictionaryData } from '../types';

jest.mock('fs/promises');

describe('DictionaryUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadDictionaryFile', () => {
    test('should load and parse dictionary file correctly', async () => {
      const mockContent = `
# Comment line
word1
word2
word3/flags
`;
      (fs.readFile as jest.Mock).mockResolvedValue(mockContent);

      const dictionary = await DictionaryUtils.loadDictionaryFile('en-US');
      
      expect(dictionary.size).toBe(3);
      expect(dictionary.has('word1')).toBe(true);
      expect(dictionary.has('word2')).toBe(true);
      expect(dictionary.has('word3')).toBe(true);
    });

    test('should handle empty files', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('');
      
      const dictionary = await DictionaryUtils.loadDictionaryFile('en-US');
      expect(dictionary.size).toBe(0);
    });

    test('should handle file read errors', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));
      
      await expect(DictionaryUtils.loadDictionaryFile('en-US'))
        .rejects.toThrow('File not found');
    });
  });

  describe('getSuggestions', () => {
    test('should generate suggestions for misspelled words', () => {
      const dictionary = new Map([
        ['hello', true],
        ['help', true],
        ['world', true]
      ]);

      const suggestions = DictionaryUtils.getSuggestions('helo', dictionary);
      
      expect(suggestions).toContain('hello');
      expect(suggestions).toContain('help');
    });

    test('should handle empty dictionary', () => {
      const suggestions = DictionaryUtils.getSuggestions('test', new Map());
      expect(suggestions).toHaveLength(0);
    });

    test('should limit number of suggestions', () => {
      const dictionary = new Map([
        ['word1', true],
        ['word2', true],
        ['word3', true],
        ['word4', true],
        ['word5', true]
      ]);

      const suggestions = DictionaryUtils.getSuggestions('word', dictionary, 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  test('getSuggestions should work with dictionary data', () => {
    const dictionaryData: DictionaryData = {
      words: new Set(['test', 'word', 'world']),
      // Add other required properties if any
    };
    
    const suggestions = DictionaryUtils.getSuggestions('test', dictionaryData);
    expect(suggestions).toBeDefined();
  });
});
