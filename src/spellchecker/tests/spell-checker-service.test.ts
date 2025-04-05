import { SpellCheckerService } from '../spell-checker-service';
import { DictionaryUtils } from '../dictionary-utils';
import { SpellCheckerError, SpellCheckerErrorType } from '../types';
import type { DictionaryMock } from '../types/mocks';
import fs from 'fs';
import path from 'path';
import fsPromises from 'fs/promises';

// Mock all used modules
jest.mock('../dictionary-utils');
jest.mock('fs');
jest.mock('path');
jest.mock('fs/promises');

describe('SpellCheckerService', () => {
  let service: SpellCheckerService;
  let mockDictionary: DictionaryMock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockDictionary = {
      words: new Set(['test', 'example', 'hello', 'world']),
      language: 'en-TEST'
    };

    // Mock filesystem functions
    (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
      return filePath.toString().includes('dictionaries');
    });
    
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.toString().includes('en-TEST')) {
        return 'test\nexample\nhello\nworld';
      }
      if (filePath.toString().includes('fr-TEST')) {
        return 'bonjour\nmonde';
      }
      return '';
    });
    
    (fsPromises.readFile as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.toString().includes('en-TEST')) {
        return Promise.resolve('test\nexample\nhello\nworld');
      }
      if (filePath.toString().includes('fr-TEST')) {
        return Promise.resolve('bonjour\nmonde');
      }
      return Promise.resolve('');
    });
    
    (path.join as jest.Mock).mockImplementation((...paths: string[]) => {
      return paths.join('/');
    });
    
    // Create service with consistent config
    service = new SpellCheckerService({
      languages: ['en-TEST'],
      defaultLanguage: 'en-TEST',
      maxRetries: 3,
      retryDelay: 5,
      dictionaryPath: './test/dictionaries/{language}.dic',
      cacheSize: 1000
    });

    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('should initialize with default language', async () => {
    (DictionaryUtils.loadDictionaryFile as jest.Mock)
      .mockResolvedValue(mockDictionary);

    await service.initialize();
    
    expect(await service.checkWord('test')).toBe(true);
    expect(await service.checkWord('invalid')).toBe(false);
  });

  test('should preload specified languages', async () => {
    const mockEnDict = {
      words: new Set(['hello', 'world']),
      language: 'en-TEST'
    };

    const mockFrDict = {
      words: new Set(['bonjour', 'monde']),
      language: 'fr-TEST'
    };

    (DictionaryUtils.loadDictionaryFile as jest.Mock)
      .mockImplementation((dictionaryPath: string, lang: string) => {
        return Promise.resolve(lang === 'en-TEST' ? mockEnDict : mockFrDict);
      });

    service = new SpellCheckerService({
      languages: ['en-TEST', 'fr-TEST'],
      defaultLanguage: 'en-TEST',
      preloadLanguages: ['fr-TEST'],
      retryDelay: 5
    });

    await service.initialize();

    expect(await service.checkWord('hello', 'en-TEST')).toBe(true);
    expect(await service.checkWord('bonjour', 'fr-TEST')).toBe(true);
  });

  describe('Suggestion Generation', () => {
    test('should generate suggestions for misspelled words', async () => {
      const mockEnDict = {
        words: new Set(['hello', 'help', 'held']),
        language: 'en-TEST'
      };

      (DictionaryUtils.loadDictionaryFile as jest.Mock)
        .mockResolvedValue(mockEnDict);

      service = new SpellCheckerService({
        languages: ['en-TEST'],
        defaultLanguage: 'en-TEST',
        dictionaryPath: './test/dictionaries/{language}.dic'
      });

      await service.initialize();

      const suggestions = await service.suggest('helo');
      expect(suggestions).toContain('hello');
      expect(suggestions).toContain('help');
      expect(suggestions).toContain('held');
    });
  });

  describe('Cache Management', () => {
    test('should cache results efficiently', async () => {
      (DictionaryUtils.loadDictionaryFile as jest.Mock)
        .mockResolvedValue(mockDictionary);

      await service.initialize();

      const spy = jest.spyOn(service['dictionaries'].get('en-TEST')!.words, 'has');
      
      await service.checkWord('test');
      await service.checkWord('test');
      
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
}); 
