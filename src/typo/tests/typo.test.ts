/**
 * Tests for Typo.js implementation
 */
import { Typo, TypoError, TypoErrorType } from '../';

describe('Typo.js', () => {
  let typo: Typo;
  
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
    
    COMPOUNDMIN 3
    COMPOUNDBEGIN U
    COMPOUNDMIDDLE V
    COMPOUNDEND W
  `;
  
  const testDicData = `
    12
    hello
    world
    test
    work/AB
    try/B
    walk/BC
    talk/BC
    computer/C
    university/U
    student/VW
    school/W
    house/V
  `;
  
  beforeEach(() => {
    typo = new Typo('en-TEST', testAffData, testDicData, { debug: true });
  });
  
  describe('Dictionary loading', () => {
    test('should load dictionary successfully', () => {
      const stats = typo.getDictionaryStats();
      expect(stats.wordCount).toBe(13);
      expect(stats.affixRuleCount).toBe(3);
      expect(stats.compoundRuleCount).toBe(4);
    });
    
    test('should handle empty dictionary with fallback', () => {
      const emptyTypo = new Typo('en-TEST', '', '', { debug: true });
      const stats = emptyTypo.getDictionaryStats();
      expect(stats.wordCount).toBeGreaterThan(0);
      expect(stats.affixRuleCount).toBe(0);
    });
    
    test('should throw error for invalid word', () => {
      expect(() => typo.check('')).toThrow(TypoError);
      expect(() => typo.suggest('')).toThrow(TypoError);
    });
  });
  
  describe('Word checking', () => {
    test('should check basic words correctly', () => {
      expect(typo.check('hello')).toBe(true);
      expect(typo.check('world')).toBe(true);
      expect(typo.check('test')).toBe(true);
      expect(typo.check('xyz')).toBe(false);
    });
    
    test('should handle case sensitivity correctly', () => {
      expect(typo.check('Hello')).toBe(true);
      expect(typo.check('WORLD')).toBe(true);
      expect(typo.check('Test')).toBe(true);
    });
    
    test('should check words with suffixes', () => {
      expect(typo.check('worked')).toBe(true);
      expect(typo.check('tried')).toBe(true);
      expect(typo.check('walks')).toBe(true);
      expect(typo.check('talks')).toBe(true);
      expect(typo.check('workeds')).toBe(false);
    });
    
    test('should check words with prefixes', () => {
      expect(typo.check('rework')).toBe(true);
      expect(typo.check('retalk')).toBe(true);
      expect(typo.check('rewalks')).toBe(true);
      expect(typo.check('rewalkeds')).toBe(false);
    });
    
    test('should check compound words', () => {
      expect(typo.check('universitystudentschool')).toBe(true);
      expect(typo.check('universityhouseschool')).toBe(true);
      expect(typo.check('helloworldtest')).toBe(false);
      expect(typo.check('schoolhouse')).toBe(false);
    });
  });
  
  describe('Suggestion generation', () => {
    test('should suggest corrections for misspelled words', () => {
      const suggestions = typo.suggest('helo');
      expect(suggestions).toContain('hello');
    });
    
    test('should suggest words with edit distance 1', () => {
      const suggestions = typo.suggest('tst');
      expect(suggestions).toContain('test');
    });
    
    test('should not suggest for correct words', () => {
      const suggestions = typo.suggest('hello');
      expect(suggestions.length).toBe(0);
    });
    
    test('should suggest variations with affixes', () => {
      const suggestions = typo.suggest('wrk');
      expect(suggestions).toContain('work');
    });
  });
}); 