import { SpellCheckerService } from '../spell-checker-service';
import { DictionaryUtils } from '../dictionary-utils';
import type { DictionaryMock } from '../types/mocks';
import type { SpellCheckerConfig } from '../types';

describe('SpellCheckerService', () => {
  let service: SpellCheckerService;
  let mockDictionary: DictionaryMock;

  beforeEach(() => {
    mockDictionary = {
      words: new Set(['test', 'example']),
      language: 'en-TEST'
    };

    service = new SpellCheckerService({
      languages: ['en-TEST'],
      defaultLanguage: 'en-TEST',
      dictionaryPath: './dictionaries'
    });

    // Mock DictionaryUtils
    jest.spyOn(DictionaryUtils, 'loadDictionaryFile')
      .mockResolvedValue(mockDictionary);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('initializes with default language', async () => {
      await service.initialize();
      expect(DictionaryUtils.loadDictionaryFile).toHaveBeenCalledWith(
        expect.any(String),
        'en-TEST',
        expect.any(Number),
        expect.any(Number)
      );
    });

    test('checks words correctly', async () => {
      await service.initialize();

      const result = await service.check('test');
      expect(result).toBe(true);
    });

    test('handles unknown words', async () => {
      await service.initialize();
      
      const result = await service.check('unknownword');
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('handles initialization failures', async () => {
      jest.spyOn(DictionaryUtils, 'loadDictionaryFile')
        .mockRejectedValue(new Error('Failed to load dictionary'));

      await expect(service.initialize())
        .rejects
        .toThrow('Failed to load dictionary');
    });
  });

  describe('Performance', () => {
    test('caches dictionary lookups', async () => {
      await service.initialize();
      
      const spy = jest.spyOn(mockDictionary.words, 'has');
      
      await service.check('test');
      await service.check('test');
      
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
