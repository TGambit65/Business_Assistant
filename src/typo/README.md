# Typo.js

A JavaScript/TypeScript spellchecker with support for Hunspell dictionaries. The implementation includes support for:

- Dictionary parsing
- Affix rule support
- Compound word checking
- Word suggestion algorithm
- Memory-efficient storage

## Installation

```bash
npm install typo-js
```

## Usage

### Basic Usage

```typescript
import { Typo } from 'typo-js';

// Create a new Typo instance with dictionary data
const typo = new Typo(
  'en_US',              // Language
  affixFileContent,     // Content of .aff file
  dictionaryContent,    // Content of .dic file
  { debug: true }       // Options
);

// Check if a word is spelled correctly
const isCorrect = typo.check('hello');   // true
const isMisspelled = typo.check('helo'); // false

// Get suggestions for misspelled words
const suggestions = typo.suggest('helo'); // ['hello', 'help', 'held', ...]
```

### Loading Dictionary Files

In Node.js:

```typescript
import { Typo } from 'typo-js';
import * as fs from 'fs';

// Load dictionary files
const affData = fs.readFileSync('./dictionaries/en_US.aff', 'utf8');
const dicData = fs.readFileSync('./dictionaries/en_US.dic', 'utf8');

// Create a new instance
const typo = new Typo('en_US', affData, dicData);
```

In a browser:

```typescript
// Load dictionary files using fetch
async function loadTypo() {
  const affResponse = await fetch('/dictionaries/en_US.aff');
  const dicResponse = await fetch('/dictionaries/en_US.dic');
  
  const affData = await affResponse.text();
  const dicData = await dicResponse.text();
  
  return new Typo('en_US', affData, dicData);
}

// Use the spellchecker
loadTypo().then(typo => {
  console.log(typo.check('hello')); // true
  console.log(typo.suggest('helo')); // ['hello', ...]
});
```

## Configuration Options

The Typo constructor accepts an options object with the following properties:

```typescript
interface TypoOptions {
  encoding?: string;               // Dictionary encoding (default: 'UTF-8')
  complexPrefixes?: boolean;       // Use complex prefixes for RTL languages (default: false)
  forbiddenWord?: string;          // Flag for forbidden words
  keepCase?: string;               // Flag for case-sensitive words
  needAffix?: string;              // Flag for words only valid when affixed
  noSuggest?: string;              // Flag for words that shouldn't be suggested
  maxSuggestions?: number;         // Max number of suggestions (default: 5)
  maxPhoneticSuggestions?: number; // Max phonetic suggestions (default: 2)
  maxCompoundSuggestions?: number; // Max compound suggestions (default: 3)
  defaultDictionary?: string;      // Default dictionary (default: 'en_US')
  debug?: boolean;                 // Enable debug logging (default: false)
}
```

## Features

### Dictionary Parsing

Typo.js can parse Hunspell dictionaries (.dic and .aff files) and supports:

- Multiple encodings (UTF-8, ISO-8859, etc.)
- Word and flag parsing
- Dictionary file formats with word counts

### Affix Rules

Support for complex affix rules, including:

- Prefix and suffix rules
- Conditional affixes
- Continuation classes
- Cross-product affix combinations
- Two-fold affix stripping

### Compound Words

Support for compound word checking with:

- Compound minimum length
- Beginning, middle, and end word flags
- Compound word maximum
- Only-in-compound words

### Word Suggestions

Advanced suggestion algorithms:

- Edit distance (Levenshtein)
- N-gram similarity
- Common typo correction
- Suggestion ranking by relevance

## API Reference

### Typo Class

#### Constructor

```typescript
constructor(
  language: string,
  affData: string,
  dicData: string,
  options?: TypoOptions
)
```

#### Methods

- `check(word: string): boolean` - Check if a word is spelled correctly
- `suggest(word: string): string[]` - Get spelling suggestions for a word
- `getDictionaryStats(): { wordCount: number, affixRuleCount: number, compoundRuleCount: number }` - Get dictionary statistics

## License

MIT 