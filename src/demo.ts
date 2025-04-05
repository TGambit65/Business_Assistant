import { SpellCheckerService } from './spellchecker';

async function runDemo() {
  console.log('SpellChecker Service Demo');
  console.log('=========================');

  // Create a SpellChecker with default options
  const spellChecker = new SpellCheckerService({
    // Set dictionary path to our sample dictionaries
    dictionaryPath: './dictionaries/{language}.dic',
    // Preload English and French dictionaries
    preloadLanguages: ['en-US', 'fr-FR'],
    // Default language is English US
    defaultLanguage: 'en-US',
    // Add required languages property
    languages: ['en-US', 'fr-FR']
  });

  console.log('Initializing spell checker...');
  await spellChecker.initialize();

  // Get available languages
  const languages = spellChecker.getAvailableLanguages();
  console.log(`\nAvailable languages: ${languages.join(', ')}`);

  // Get dictionary stats
  const enStats = spellChecker.getDictionaryStats('en-US');
  const frStats = spellChecker.getDictionaryStats('fr-FR');
  
  console.log('\nDictionary Statistics:');
  console.log(`- English (en-US): ${enStats?.wordCount} words (${enStats?.isFallback ? 'Fallback' : 'Standard'})`);
  console.log(`- French (fr-FR): ${frStats?.wordCount} words (${frStats?.isFallback ? 'Fallback' : 'Standard'})`);

  // Test some English words
  console.log('\nEnglish spell checking:');
  const englishWords = ['hello', 'world', 'splling', 'mistak', 'computer'];
  
  for (const word of englishWords) {
    const isCorrect = await spellChecker.check(word);
    console.log(`- "${word}": ${isCorrect ? 'Correct ✓' : 'Incorrect ✗'}`);
    
    if (!isCorrect) {
      const suggestions = await spellChecker.suggest(word);
      if (suggestions.length > 0) {
        console.log(`  Suggestions: ${suggestions.join(', ')}`);
      } else {
        console.log('  No suggestions available');
      }
    }
  }

  // Test some French words
  console.log('\nFrench spell checking:');
  const frenchWords = ['bonjour', 'le', 'monde', 'ordinator', 'parle'];
  
  for (const word of frenchWords) {
    const isCorrect = await spellChecker.check(word, 'fr-FR');
    console.log(`- "${word}": ${isCorrect ? 'Correct ✓' : 'Incorrect ✗'}`);
    
    if (!isCorrect) {
      const suggestions = await spellChecker.suggest(word, 'fr-FR');
      if (suggestions.length > 0) {
        console.log(`  Suggestions: ${suggestions.join(', ')}`);
      } else {
        console.log('  No suggestions available');
      }
    }
  }

  // Demonstrate caching
  console.log('\nTesting cache performance:');
  const startTime1 = Date.now();
  await spellChecker.check('hello');
  const time1 = Date.now() - startTime1;
  
  const startTime2 = Date.now();
  await spellChecker.check('hello'); // Should be cached
  const time2 = Date.now() - startTime2;
  
  console.log(`- First check: ${time1}ms`);
  console.log(`- Second check (cached): ${time2}ms`);
  console.log(`- Performance improvement: ${Math.round((time1 - time2) / time1 * 100)}%`);
}

// Run the demo
runDemo().catch(error => {
  console.error('Error in demo:', error);
}); 