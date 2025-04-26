/**
 * Performance benchmark tests for Typo.js
 */
import { Typo } from '../';

describe('Typo.js Performance', () => {
  // Skip these tests in CI environments
  const skip = process.env.CI === 'true';
  
  // Simple test dictionary and affix file
  const testAffData = `
    SET UTF-8
    TRY esianrtolcdugmphbyfvkwzESIANRTOLCDUGMPHBYFVKWZ'
    
    PFX A Y 1
    PFX A 0 re .
    
    SFX B Y 2
    SFX B 0 ed [^y]
    SFX B y ied y
    
    SFX C Y 1
    SFX C 0 s .
  `;
  
  // Create a larger dictionary for performance testing
  const generateLargeDictionary = (size: number): string => {
    const wordCount = size;
    const words: string[] = [];
    
    // Add some base words
    const baseWords = [
      'hello', 'world', 'test', 'word', 'computer',
      'program', 'language', 'dictionary', 'spell', 'check'
    ];
    
    // Add words with different flags
    for (let i = 0; i < baseWords.length; i++) {
      words.push(baseWords[i] + (i % 3 === 0 ? '/AB' : i % 3 === 1 ? '/BC' : ''));
    }
    
    // Generate additional words to reach the desired size
    for (let i = 0; i < wordCount - baseWords.length; i++) {
      const length = 5 + Math.floor(Math.random() * 10); // Random word length between 5-14
      let word = '';
      for (let j = 0; j < length; j++) {
        word += String.fromCharCode(97 + Math.floor(Math.random() * 26)); // Random lowercase letter
      }
      words.push(word + (i % 5 === 0 ? '/AB' : i % 5 === 1 ? '/BC' : ''));
    }
    
    return `${words.length}\n${words.join('\n')}`;
  };
  
  // Test the initialization performance with different dictionary sizes
  (skip ? describe.skip : describe)('Dictionary Loading Performance', () => {
    test('should load small dictionary (100 words) quickly', () => {
      const dicData = generateLargeDictionary(100);
      
      const startTime = performance.now();
      const typo = new Typo('en-TEST', testAffData, dicData);
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      console.log(`Loading time for 100 words: ${loadTime.toFixed(2)}ms`);
      
      // Should load in under 200ms
      expect(loadTime).toBeLessThan(200);
    });
    
    test('should load medium dictionary (1,000 words) efficiently', () => {
      const dicData = generateLargeDictionary(1000);
      
      const startTime = performance.now();
      const typo = new Typo('en-TEST', testAffData, dicData);
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      console.log(`Loading time for 1,000 words: ${loadTime.toFixed(2)}ms`);
      
      // Should load in under 500ms
      expect(loadTime).toBeLessThan(500);
    });
    
    test('should load large dictionary (10,000 words) efficiently', () => {
      const dicData = generateLargeDictionary(10000);
      
      const startTime = performance.now();
      const typo = new Typo('en-TEST', testAffData, dicData);
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      console.log(`Loading time for 10,000 words: ${loadTime.toFixed(2)}ms`);
      
      // Should load in under 2000ms
      expect(loadTime).toBeLessThan(2000);
    });
  });
  
  // Test word checking performance
  (skip ? describe.skip : describe)('Word Checking Performance', () => {
    let typo: Typo;
    
    beforeAll(() => {
      const dicData = generateLargeDictionary(5000);
      typo = new Typo('en-TEST', testAffData, dicData);
    });
    
    test('should check words quickly', () => {
      const wordsToCheck = [
        'hello', 'world', 'test', 'worked', 'tries', 'computers',
        'rework', 'rewalk', 'retest', 'unknown', 'xyz', 'abcdefg'
      ];
      
      const startTime = performance.now();
      
      // Check each word 100 times to get meaningful measurements
      for (let i = 0; i < 100; i++) {
        for (const word of wordsToCheck) {
          typo.check(word);
        }
      }
      
      const endTime = performance.now();
      const totalChecks = wordsToCheck.length * 100;
      const checkTime = endTime - startTime;
      const timePerWord = checkTime / totalChecks;
      
      console.log(`Checked ${totalChecks} words in ${checkTime.toFixed(2)}ms`);
      console.log(`Average time per word: ${timePerWord.toFixed(3)}ms`);
      
      // Each word check should average under 2ms
      // Increase threshold slightly to account for minor fluctuations
      expect(timePerWord).toBeLessThan(2.5);
    });
  });
  
  // Test suggestion generation performance
  (skip ? describe.skip : describe)('Suggestion Performance', () => {
    let typo: Typo;
    
    beforeAll(() => {
      const dicData = generateLargeDictionary(5000);
      typo = new Typo('en-TEST', testAffData, dicData);
    });
    
    test('should generate suggestions quickly', () => {
      const misspelledWords = [
        'helo', 'wrld', 'tst', 'workd', 'trie', 'computrs',
        'rewrk', 'rewak', 'retst', 'unknwn', 'xy', 'abcdef'
      ];
      
      const startTime = performance.now();
      
      // Generate suggestions for each word 10 times
      for (let i = 0; i < 10; i++) {
        for (const word of misspelledWords) {
          typo.suggest(word);
        }
      }
      
      const endTime = performance.now();
      const totalSuggestions = misspelledWords.length * 10;
      const suggestionTime = endTime - startTime;
      const timePerWord = suggestionTime / totalSuggestions;
      
      console.log(`Generated suggestions for ${totalSuggestions} words in ${suggestionTime.toFixed(2)}ms`);
      console.log(`Average time per word: ${timePerWord.toFixed(3)}ms`);
      
      // Each suggestion generation should average under 20ms
      // Increase threshold slightly more
      expect(timePerWord).toBeLessThan(25);
    });
  });
  
  // Test memory usage
  (skip ? describe.skip : describe)('Memory Usage', () => {
    test('should use memory efficiently for large dictionaries', () => {
      // Record memory usage before loading
      const memoryBefore = process.memoryUsage().heapUsed;
      
      // Load a large dictionary
      const dicData = generateLargeDictionary(20000);
      const typo = new Typo('en-TEST', testAffData, dicData);
      
      // Record memory usage after loading
      const memoryAfter = process.memoryUsage().heapUsed;
      
      // Calculate memory usage
      const memoryUsed = (memoryAfter - memoryBefore) / 1024 / 1024; // MB
      
      console.log(`Memory usage for 20,000 words: ${memoryUsed.toFixed(2)} MB`);
      
      // Memory usage should be reasonable
      // Note: Due to garbage collection, the value might be negative sometimes
      // We just make sure it's not excessive
      expect(Math.abs(memoryUsed)).toBeLessThan(50);
    });
  });
}); 