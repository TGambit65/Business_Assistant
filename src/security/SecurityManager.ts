import { SearchResult } from '../types/search';

/**
 * Security manager for handling search security
 */
export class SecurityManager {
  private readonly auditLog: Array<{
    timestamp: Date;
    query: string;
    userId: string;
    resultCount: number;
  }> = [];

  /**
   * Filter search results based on user permissions
   */
  async filterResults(results: SearchResult[]): Promise<SearchResult[]> {
    // Get current user's permissions
    const userPermissions = await this.getUserPermissions();

    // Filter results based on permissions
    return results.filter(result => {
      // Check if user has access to the result's category
      if (result.metadata.category && !userPermissions.categories.includes(result.metadata.category)) {
        return false;
      }

      // Check if user has access to the result's author
      if (result.metadata.author && !userPermissions.authors.includes(result.metadata.author)) {
        return false;
      }

      // Check if user has access to the result's tags
      if (result.metadata.tags) {
        const hasAccessToAllTags = result.metadata.tags.every(tag => 
          userPermissions.tags.includes(tag)
        );
        if (!hasAccessToAllTags) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Filter query suggestions based on user permissions
   */
  async filterSuggestions(suggestions: string[]): Promise<string[]> {
    // Get current user's permissions
    const userPermissions = await this.getUserPermissions();

    // Filter suggestions based on permissions
    return suggestions.filter(suggestion => {
      // Check if suggestion contains any restricted terms
      const hasRestrictedTerms = userPermissions.restrictedTerms.some(term =>
        suggestion.toLowerCase().includes(term.toLowerCase())
      );

      return !hasRestrictedTerms;
    });
  }

  /**
   * Sanitize search query
   */
  sanitizeQuery(query: string): string {
    // Remove potentially dangerous characters
    let sanitized = query.replace(/[<>{}()\[\]\\]/g, '');

    // Remove SQL injection attempts
    sanitized = sanitized.replace(/['"]/g, '');

    // Remove XSS attempts
    sanitized = sanitized.replace(/<script>/gi, '');

    return sanitized;
  }

  /**
   * Log search query for audit purposes
   */
  logSearch(query: string, userId: string, resultCount: number): void {
    this.auditLog.push({
      timestamp: new Date(),
      query,
      userId,
      resultCount
    });

    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
  }

  /**
   * Get user permissions
   */
  private async getUserPermissions(): Promise<{
    categories: string[];
    authors: string[];
    tags: string[];
    restrictedTerms: string[];
  }> {
    // This would typically fetch from a database or auth service
    // For now, return default permissions
    return {
      categories: ['public', 'internal'],
      authors: ['*'],
      tags: ['*'],
      restrictedTerms: []
    };
  }
} 