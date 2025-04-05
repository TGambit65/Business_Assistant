import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  DocVersion,
  DocMetadata,
  ValidationResult,
  ValidationOptions,
  ValidationError,
  SearchOptions,
  SearchResult,
  GenerationOptions,
  DocumentationManagerOptions,
  DocumentValidator
} from './types';

/**
 * DocumentationManager - Manages documentation with versioning, validation, and search capabilities
 */
export class DocumentationManager {
  private baseDir: string;
  private documents: Map<string, DocMetadata> = new Map();
  private versions: Map<string, DocVersion> = new Map();
  private defaultValidationOptions: ValidationOptions;
  private enableEncryption: boolean;

  /**
   * Creates a new DocumentationManager instance
   * @param options Configuration options
   */
  constructor(options?: DocumentationManagerOptions) {
    this.baseDir = options?.baseDir || './documentation';
    this.defaultValidationOptions = options?.defaultValidationOptions || {
      strict: false,
      customValidators: []
    };
    this.enableEncryption = options?.enableEncryption || false;

    // Create base directory if it doesn't exist and option is enabled
    if (options?.createDirIfNotExists && !fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    
    // Load documents from disk (if they exist)
    this.loadFromDisk();
  }

  /**
   * Loads documents and versions from disk
   */
  private loadFromDisk(): void {
    if (!fs.existsSync(this.baseDir)) {
      return;
    }

    // Load document metadata
    const metadataDir = path.join(this.baseDir, 'metadata');
    if (fs.existsSync(metadataDir)) {
      const files = fs.readdirSync(metadataDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(metadataDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          try {
            const metadata = JSON.parse(content) as DocMetadata;
            // Ensure dates are properly parsed
            metadata.createdAt = new Date(metadata.createdAt);
            metadata.updatedAt = new Date(metadata.updatedAt);
            this.documents.set(metadata.id, metadata);
          } catch (error) {
            console.error(`Failed to parse metadata file ${filePath}:`, error);
          }
        }
      }
    }

    // Load document versions
    const versionsDir = path.join(this.baseDir, 'versions');
    if (fs.existsSync(versionsDir)) {
      const files = fs.readdirSync(versionsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(versionsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          try {
            const version = JSON.parse(content) as DocVersion;
            // Ensure date is properly parsed
            version.timestamp = new Date(version.timestamp);
            
            // Decrypt content if encryption is enabled
            if (this.enableEncryption) {
              version.content = this.decryptContent(version.content);
            }
            
            this.versions.set(version.versionId, version);
          } catch (error) {
            console.error(`Failed to parse version file ${filePath}:`, error);
          }
        }
      }
    }
  }

  /**
   * Saves a document metadata to disk
   * @param metadata Document metadata to save
   */
  private saveMetadataToDisk(metadata: DocMetadata): void {
    const metadataDir = path.join(this.baseDir, 'metadata');
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }

    const filePath = path.join(metadataDir, `${metadata.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Saves a document version to disk
   * @param version Document version to save
   */
  private saveVersionToDisk(version: DocVersion): void {
    const versionsDir = path.join(this.baseDir, 'versions');
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir, { recursive: true });
    }

    // Create a copy for saving to avoid modifying the original
    const versionToSave = { ...version };
    
    // Encrypt content if encryption is enabled
    if (this.enableEncryption) {
      versionToSave.content = this.encryptContent(versionToSave.content);
    }

    const filePath = path.join(versionsDir, `${version.versionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(versionToSave, null, 2));
  }

  /**
   * Generates a unique ID
   * @returns A unique ID string
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Encrypts document content
   * @param content Content to encrypt
   * @returns Encrypted content
   */
  private encryptContent(content: string): string {
    // This is a simplified encryption example
    // In a real implementation, you'd use proper key management
    const key = 'your-secret-key-with-32-characters';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts document content
   * @param encryptedContent Encrypted content
   * @returns Decrypted content
   */
  private decryptContent(encryptedContent: string): string {
    // This is a simplified decryption example
    // In a real implementation, you'd use proper key management
    const key = 'your-secret-key-with-32-characters';
    const [ivHex, encrypted] = encryptedContent.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Creates a new document
   * @param title Document title
   * @param content Initial document content
   * @param tags Optional tags for categorization
   * @param author Optional author name
   * @returns Created document metadata
   */
  createDocument(title: string, content: string, tags: string[] = [], author?: string): DocMetadata {
    const docId = this.generateId();
    const versionId = this.generateId();
    const now = new Date();
    
    // Create version
    const version: DocVersion = {
      versionId,
      content,
      timestamp: now,
      author,
      notes: 'Initial version'
    };
    
    // Create metadata
    const metadata: DocMetadata = {
      id: docId,
      title,
      currentVersionId: versionId,
      availableVersions: [versionId],
      createdAt: now,
      updatedAt: now,
      tags,
      path: path.join(this.baseDir, 'documents', docId)
    };
    
    // Store in memory
    this.versions.set(versionId, version);
    this.documents.set(docId, metadata);
    
    // Save to disk
    this.saveVersionToDisk(version);
    this.saveMetadataToDisk(metadata);
    
    return metadata;
  }

  /**
   * Updates an existing document with new content
   * @param docId Document ID
   * @param content New content
   * @param author Optional author name
   * @param notes Optional version notes
   * @returns Updated document metadata or null if document not found
   */
  updateDocument(docId: string, content: string, author?: string, notes?: string): DocMetadata | null {
    const metadata = this.documents.get(docId);
    if (!metadata) {
      return null;
    }
    
    const versionId = this.generateId();
    const now = new Date();
    
    // Create new version
    const version: DocVersion = {
      versionId,
      content,
      timestamp: now,
      author,
      notes
    };
    
    // Update metadata
    metadata.currentVersionId = versionId;
    metadata.availableVersions.push(versionId);
    metadata.updatedAt = now;
    
    // Store in memory
    this.versions.set(versionId, version);
    this.documents.set(docId, metadata);
    
    // Save to disk
    this.saveVersionToDisk(version);
    this.saveMetadataToDisk(metadata);
    
    return metadata;
  }

  /**
   * Retrieves document metadata
   * @param docId Document ID
   * @returns Document metadata or null if not found
   */
  getDocumentMetadata(docId: string): DocMetadata | null {
    return this.documents.get(docId) || null;
  }

  /**
   * Lists all available documents
   * @param tags Optional tags to filter by
   * @returns Array of document metadata
   */
  listDocuments(tags?: string[]): DocMetadata[] {
    const documents = Array.from(this.documents.values());
    
    if (tags && tags.length > 0) {
      return documents.filter(doc => 
        tags.every(tag => doc.tags.includes(tag))
      );
    }
    
    return documents;
  }

  /**
   * Retrieves the latest version of a document
   * @param docId Document ID
   * @returns Latest document version or null if not found
   */
  getLatestVersion(docId: string): DocVersion | null {
    const metadata = this.documents.get(docId);
    if (!metadata) {
      return null;
    }
    
    return this.versions.get(metadata.currentVersionId) || null;
  }

  /**
   * Retrieves a specific version of a document
   * @param docId Document ID
   * @param versionId Version ID
   * @returns Document version or null if not found
   */
  getVersion(docId: string, versionId: string): DocVersion | null {
    const metadata = this.documents.get(docId);
    if (!metadata || !metadata.availableVersions.includes(versionId)) {
      return null;
    }
    
    return this.versions.get(versionId) || null;
  }

  /**
   * Validates document content
   * @param content Content to validate
   * @param options Validation options
   * @returns Validation result
   */
  validateDocument(content: string, options?: ValidationOptions): ValidationResult {
    const opts = { ...this.defaultValidationOptions, ...options };
    const errors: ValidationError[] = [];
    
    // Basic validation - check for empty content
    if (!content.trim()) {
      errors.push({
        message: 'Document content cannot be empty',
        severity: 'error'
      });
    }
    
    // Check minimum length
    if (content.length < 10 && !opts.skip?.includes('minLength')) {
      errors.push({
        message: 'Document content is too short (minimum 10 characters)',
        severity: 'warning'
      });
    }
    
    // Run custom validators
    if (opts.customValidators) {
      for (const validator of opts.customValidators) {
        const validationErrors = validator(content);
        errors.push(...validationErrors);
      }
    }
    
    // If in strict mode, treat warnings as errors
    if (opts.strict) {
      for (const error of errors) {
        if (error.severity === 'warning') {
          error.severity = 'error';
        }
      }
    }
    
    // Determine if valid (no errors)
    const hasErrors = errors.some(error => error.severity === 'error');
    
    return {
      valid: !hasErrors,
      errors,
      timestamp: new Date()
    };
  }

  /**
   * Generates documentation from code
   * @param options Generation options
   * @returns Generated documentation content or null if generation fails
   */
  generateDocumentation(options: GenerationOptions): string | null {
    // This is a simplified implementation
    // In a real system, this would parse source code and extract documentation
    
    const { source, format = 'markdown' } = options;
    
    // Check if source exists
    if (!fs.existsSync(source)) {
      return null;
    }
    
    // Simple generator that reads files and extracts JSDoc-style comments
    try {
      const content = fs.readFileSync(source, 'utf8');
      
      // Extract doc comments (this is a simple regex - a real implementation would be more robust)
      const docComments = content.match(/\/\*\*\s*\n([^*]|\*[^\/])*\*\//g) || [];
      
      if (format === 'markdown') {
        // Convert to markdown
        let markdown = `# API Documentation\n\n`;
        
        for (const comment of docComments) {
          // Extract descriptions and tags
          const description = comment.match(/@description\s+(.*?)(?=\s*@|\s*\*\/)/s)?.[1]?.trim();
          const params = comment.match(/@param\s+(\{[^}]+\})\s+([^\s]+)\s+([^@]*)/g);
          const returns = comment.match(/@returns\s+(.*?)(?=\s*@|\s*\*\/)/s)?.[1]?.trim();
          
          if (description) {
            markdown += `## ${description}\n\n`;
          }
          
          if (params && params.length > 0) {
            markdown += `### Parameters\n\n`;
            for (const param of params) {
              const [, type, name, desc] = param.match(/@param\s+(\{[^}]+\})\s+([^\s]+)\s+([^@]*)/) || [];
              markdown += `- **${name}** ${type}: ${desc.trim()}\n`;
            }
            markdown += '\n';
          }
          
          if (returns) {
            markdown += `### Returns\n\n${returns}\n\n`;
          }
          
          markdown += `---\n\n`;
        }
        
        return markdown;
      } else if (format === 'html') {
        // Convert to HTML (simplified)
        let html = `<h1>API Documentation</h1>`;
        
        for (const comment of docComments) {
          const description = comment.match(/@description\s+(.*?)(?=\s*@|\s*\*\/)/s)?.[1]?.trim();
          if (description) {
            html += `<h2>${description}</h2>`;
          }
        }
        
        return html;
      } else if (format === 'json') {
        // Convert to JSON
        const docs = docComments.map(comment => {
          const description = comment.match(/@description\s+(.*?)(?=\s*@|\s*\*\/)/s)?.[1]?.trim();
          return { description };
        });
        
        return JSON.stringify(docs, null, 2);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to generate documentation:', error);
      return null;
    }
  }

  /**
   * Searches for documents matching the query
   * @param query Search query
   * @param options Search options
   * @returns Array of search results
   */
  searchDocuments(query: string, options: SearchOptions = {}): SearchResult[] {
    const {
      minScore = 0.1,
      limit = 10,
      tags,
      fuzzy = false,
      dateRange
    } = options;
    
    // Handle empty query explicitly
    if (!query || !query.trim()) {
      return [];
    }
    
    const results: SearchResult[] = [];
    const terms = query.toLowerCase().split(/\s+/);
    
    // Search each document
    for (const metadata of this.documents.values()) {
      // Skip if it doesn't match tags filter
      if (tags && tags.length > 0) {
        if (!tags.every(tag => metadata.tags.includes(tag))) {
          continue;
        }
      }
      
      // Skip if outside date range
      if (dateRange) {
        if (dateRange.from && metadata.createdAt < dateRange.from) {
          continue;
        }
        if (dateRange.to && metadata.createdAt > dateRange.to) {
          continue;
        }
      }
      
      // Get the latest version content
      const version = this.versions.get(metadata.currentVersionId);
      if (!version) {
        continue;
      }
      
      // Calculate relevance score
      let score = 0;
      const content = version.content.toLowerCase();
      
      // Search in title (higher weight)
      const titleLower = metadata.title.toLowerCase();
      for (const term of terms) {
        if (titleLower.includes(term)) {
          score += 0.5;
        }
        
        // Fuzzy search in title
        if (fuzzy && this.fuzzyMatch(titleLower, term)) {
          score += 0.3;
        }
      }
      
      // Search in content
      for (const term of terms) {
        const termMatches = content.split(term).length - 1;
        if (termMatches > 0) {
          score += 0.1 * Math.min(termMatches, 10);
        }
        
        // Fuzzy search in content
        if (fuzzy && this.fuzzyMatch(content, term)) {
          score += 0.05;
        }
      }
      
      // Search in tags
      for (const term of terms) {
        for (const tag of metadata.tags) {
          if (tag.toLowerCase().includes(term)) {
            score += 0.2;
          }
        }
      }
      
      // Normalize score to 0-1 range
      score = Math.min(score, 1);
      
      // Add to results if above minimum score
      if (score >= minScore) {
        // Extract snippets
        const snippets: string[] = [];
        for (const term of terms) {
          const index = content.indexOf(term);
          if (index !== -1) {
            const start = Math.max(0, index - 40);
            const end = Math.min(content.length, index + term.length + 40);
            const snippet = content.substring(start, end);
            snippets.push(`...${snippet}...`);
            
            // Limit number of snippets
            if (snippets.length >= 3) {
              break;
            }
          }
        }
        
        results.push({
          document: metadata,
          score,
          snippets: snippets.length > 0 ? snippets : undefined
        });
      }
    }
    
    // Sort by score (descending) and limit results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Performs a fuzzy match between text and pattern
   * @param text Text to search in
   * @param pattern Pattern to search for
   * @returns Whether a fuzzy match was found
   */
  private fuzzyMatch(text: string, pattern: string): boolean {
    // Simple fuzzy matching algorithm
    // This is a simplified implementation - a real one would be more sophisticated
    
    let textIndex = 0;
    let patternIndex = 0;
    
    while (textIndex < text.length && patternIndex < pattern.length) {
      if (text[textIndex] === pattern[patternIndex]) {
        patternIndex++;
      }
      textIndex++;
    }
    
    return patternIndex === pattern.length;
  }

  /**
   * Deletes a document and all its versions
   * @param docId Document ID
   * @returns Whether deletion was successful
   */
  deleteDocument(docId: string): boolean {
    const metadata = this.documents.get(docId);
    if (!metadata) {
      return false;
    }
    
    // Delete all versions
    for (const versionId of metadata.availableVersions) {
      this.versions.delete(versionId);
      
      // Delete version file
      const versionPath = path.join(this.baseDir, 'versions', `${versionId}.json`);
      if (fs.existsSync(versionPath)) {
        fs.unlinkSync(versionPath);
      }
    }
    
    // Delete metadata
    this.documents.delete(docId);
    
    // Delete metadata file
    const metadataPath = path.join(this.baseDir, 'metadata', `${docId}.json`);
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }
    
    return true;
  }

  /**
   * Gets statistics about the documentation system
   * @returns Object with statistics
   */
  getStatistics(): {
    totalDocuments: number;
    totalVersions: number;
    averageVersionsPerDocument: number;
    documentsPerTag: Record<string, number>;
  } {
    const totalDocuments = this.documents.size;
    const totalVersions = this.versions.size;
    const averageVersionsPerDocument = totalDocuments > 0 
      ? totalVersions / totalDocuments 
      : 0;
    
    // Count documents per tag
    const documentsPerTag: Record<string, number> = {};
    this.documents.forEach(doc => {
      doc.tags.forEach(tag => {
        documentsPerTag[tag] = (documentsPerTag[tag] || 0) + 1;
      });
    });
    
    return {
      totalDocuments,
      totalVersions,
      averageVersionsPerDocument,
      documentsPerTag
    };
  }
} 