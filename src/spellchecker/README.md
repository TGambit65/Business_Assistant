# SpellChecker Service

A robust and efficient spell checking service with proper dictionary management, multi-language support, caching, and error handling.

## Features

- Dictionary loading with retry mechanism
- LRU caching for improved performance
- Memory-efficient dictionary storage using Set
- Fallback spellchecking mechanism
- Multi-language support
- Word suggestions based on Levenshtein distance
- Comprehensive error handling

## Installation

```bash
npm install
# or
yarn
```

## Usage

### Basic Usage

```typescript
import { SpellCheckerService } from './spellchecker';

// Create SpellChecker with default options
const spellChecker = new SpellCheckerService();

// Initialize (loads default dictionary)
await spellChecker.initialize();

// Check spelling of a word
const isCorrect = await spellChecker.check('hello');
console.log(isCorrect); // true

// Get suggestions for misspelled words
const suggestions = await spellChecker.suggest('helo');
console.log(suggestions); // ['hello', 'help', ...]
```

### Configuration Options

You can customize the SpellChecker by passing options to the constructor:

```typescript
const spellChecker = new SpellCheckerService({
  // Default language for spell checking
  defaultLanguage: 'en-US',
  
  // Maximum number of words to cache
  cacheSize: 5000,
  
  // Languages to preload during initialization
  preloadLanguages: ['en-US', 'fr-FR'],
  
  // Number of retry attempts when loading dictionaries
  maxRetries: 5,
  
  // Delay between retry attempts in milliseconds
  retryDelay: 2000,
  
  // Path pattern to dictionary files
  dictionaryPath: './custom-dictionaries/{language}.dic'
});
```

### Multi-Language Support

You can check spelling in different languages:

```typescript
// Check in default language
const isCorrectEnglish = await spellChecker.check('hello');

// Check in French
const isCorrectFrench = await spellChecker.check('bonjour', 'fr-FR');

// Get suggestions in Spanish
const spanishSuggestions = await spellChecker.suggest('ola', 'es-ES');
```

### Cache Management

```typescript
// Clear the cache
spellChecker.clearCache();

// Set a new cache size
spellChecker.setCacheSize(10000);
```

### Dictionary Information

```typescript
// Get available languages
const languages = spellChecker.getAvailableLanguages();

// Get dictionary statistics
const stats = spellChecker.getDictionaryStats('en-US');
console.log(`Word count: ${stats.wordCount}`);
console.log(`Is fallback: ${stats.isFallback}`);
```

## Dictionary Format

The service expects dictionaries in a simple text format, with one word per line:

```
# Dictionary comments start with #
word1
word2
word3
...
```

## Error Handling

The service uses custom error types for better error handling:

```typescript
try {
  await spellChecker.check('');
} catch (error) {
  if (error instanceof SpellCheckerError) {
    switch (error.type) {
      case SpellCheckerErrorType.INVALID_WORD:
        console.error('Invalid word provided');
        break;
      case SpellCheckerErrorType.DICTIONARY_NOT_FOUND:
        console.error('Dictionary not found');
        break;
      case SpellCheckerErrorType.DICTIONARY_LOAD_ERROR:
        console.error('Error loading dictionary');
        break;
      case SpellCheckerErrorType.INITIALIZATION_ERROR:
        console.error('Initialization error');
        break;
    }
  }
}
```

## Running Tests

```bash
npm test
``` 