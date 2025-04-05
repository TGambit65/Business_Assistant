# Documentation Management System

A comprehensive documentation management system with versioning, validation, generation, and search capabilities.

## Features

- **Documentation Versioning**: Keep track of all document versions with automatic versioning
- **Automated Validation**: Validate document content against custom validation rules
- **Code-based Generation**: Generate documentation from code comments and structure
- **Search Functionality**: Powerful search with relevance ranking and filtering
- **Disk Storage**: Automatic backup of documents to disk

## Usage

### Basic Usage

```typescript
import { DocumentationManager } from './documentation';

// Create a documentation manager
const docManager = new DocumentationManager();

// Add a document
docManager.addDocument('guides/getting-started.md', 'Getting Started Guide Content', {
  author: 'John Doe',
  tags: ['guide', 'beginner']
});

// Update a document (creates a new version)
docManager.addDocument('guides/getting-started.md', 'Updated Getting Started Guide', {
  author: 'Jane Smith',
  tags: ['guide', 'beginner', 'updated']
});

// Get the latest version
const latestVersion = docManager.getLatestVersion('guides/getting-started.md');
console.log(latestVersion.content);
console.log(`Version: ${latestVersion.version}`);

// Get a specific version
const v1 = docManager.getVersion('guides/getting-started.md', 1);
console.log(`Original content: ${v1.content}`);
```

### Validation

```typescript
// Validate a document
const validationResult = await docManager.validateDoc('guides/getting-started.md');
if (validationResult.valid) {
  console.log('Document is valid');
} else {
  console.log('Validation errors:');
  validationResult.errors.forEach(error => console.log(`- ${error.message}`));
}

// Custom validators
const customDocManager = new DocumentationManager({
  validators: [
    (content, metadata) => {
      const errors = [];
      if (!content.includes('# ' + metadata.title)) {
        errors.push({
          message: 'Document must include title as h1 heading',
          severity: 'error'
        });
      }
      return errors;
    }
  ]
});
```

### Generating Documentation

```typescript
// Generate documentation from code
await docManager.generateDocs({
  format: 'markdown',
  includeCode: true
});

// Generated docs are available through normal methods
const docIds = docManager.getAllDocumentIds();
console.log(`Generated ${docIds.length} documents`);
```

### Searching

```typescript
// Basic search
const results = docManager.search('api');

// Advanced search with filtering
const filteredResults = docManager.search('guide', {
  filterTags: ['beginner'],
  includeContent: true,
  maxResults: 5
});

// Display search results
for (const result of filteredResults) {
  console.log(`Document: ${result.docId} (Score: ${result.score})`);
  console.log(`Excerpt: ${result.excerpt}`);
  console.log('---');
}
```

## API Reference

### DocumentationManager

- `constructor(options?: DocumentationManagerOptions)`: Create a new documentation manager
- `addDocument(path: string, content: string, metadata?: Partial<DocMetadata>): number`: Add a document or create a new version
- `getLatestVersion(docId: string): DocVersion | undefined`: Get the latest version of a document
- `getVersion(docId: string, version: number): DocVersion | undefined`: Get a specific version of a document
- `getAllVersions(docId: string): DocVersion[]`: Get all versions of a document
- `validateDoc(docId: string): Promise<ValidationResult>`: Validate a document
- `validateDocs(): Promise<Map<string, ValidationResult>>`: Validate all documents
- `generateDocs(options?: GenerationOptions): Promise<void>`: Generate documentation
- `search(query: string, options?: SearchOptions): SearchResult[]`: Search for documents
- `getAllDocumentIds(): string[]`: Get all document IDs
- `getDocumentCount(): { documents: number, versions: number }`: Get document counts

## Types

### DocVersion

```typescript
interface DocVersion {
  version: number;
  content: string;
  timestamp: Date;
  metadata: DocMetadata;
}
```

### DocMetadata

```typescript
interface DocMetadata {
  author?: string;
  tags?: string[];
  lastModified?: Date;
  status?: 'draft' | 'review' | 'published' | 'archived';
  [key: string]: any;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
```

## License

MIT 