import { type SearchResult } from '../../../src/types/search'; // Assuming SearchResult is a type

// Define the types of content that can be searched
export type SearchableContentType = 'template' | 'email' | 'document';

// Interface for our frontend search results
export interface FrontendSearchResult {
  id: string | number;
  type: SearchableContentType;
  title: string;
  snippet: string;
  category?: string;
  path: string;
  score?: number;
  metadata?: Record<string, any>;
  originalData?: any; // Store the original data for use in the UI
}

class SearchService {
  private static instance: SearchService;
  // This would be initialized with the actual SearchEngine in a production environment
  // private searchEngine: SearchEngine;

  private constructor() {
    // this.searchEngine = SearchEngine.getInstance();
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Search for content across the application
   * @param query The search query
   * @param options Search options
   * @returns Promise with search results
   */
  public async search(
    query: string,
    options: {
      contentTypes?: SearchableContentType[];
      category?: string;
      maxResults?: number;
    } = {}
  ): Promise<FrontendSearchResult[]> {
    try {
      // In a real implementation, we would use the SearchEngine:
      // const searchParams: SearchParams = {
      //   query,
      //   filters: []
      // };
      // 
      // if (options.category) {
      //   searchParams.filters.push({
      //     field: 'category',
      //     operator: 'equals',
      //     value: options.category
      //   });
      // }
      // 
      // if (options.contentTypes && options.contentTypes.length > 0) {
      //   searchParams.filters.push({
      //     field: 'type',
      //     operator: 'equals',
      //     value: options.contentTypes[0] // For now, just use the first content type
      //   });
      // }
      // 
      // const searchOptions: SearchOptions = {
      //   maxResults: options.maxResults || 20,
      //   includeHighlights: true,
      //   includeMetadata: true
      // };
      // 
      // const results = await this.searchEngine.search(searchParams, searchOptions);
      // return this.mapSearchResults(results.results);

      // For now, use mock data
      return this.getMockSearchResults(query, options);
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial input
   * @param query Partial query
   * @returns Promise with suggestions
   */
  public async getSuggestions(query: string): Promise<string[]> {
    try {
      // In a real implementation, we would use the SearchEngine:
      // return await this.searchEngine.suggestQueries(query);

      // For now, return mock suggestions
      return [
        `${query} template`,
        `${query} email`,
        `${query} document`,
        `${query} meeting`,
        `${query} follow-up`
      ].filter(suggestion => suggestion.trim() !== query.trim());
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Clear the search cache
   */
  public async clearCache(): Promise<void> {
    try {
      // In a real implementation, we would use the SearchEngine:
      // await this.searchEngine.clearCache();
      console.log('Search cache cleared');
    } catch (error) {
      console.error('Error clearing search cache:', error);
      throw error;
    }
  }

  /**
   * Map search results from the SearchEngine to our frontend format
   * @param results Search results from the SearchEngine
   * @returns Mapped frontend search results
   */
  private mapSearchResults(results: SearchResult[]): FrontendSearchResult[] {
    return results.map(result => {
      // Default mapping
      const mappedResult: FrontendSearchResult = {
        id: result.id,
        type: 'template', // Default to template
        title: result.metadata.title,
        snippet: result.content.substring(0, 100) + '...',
        category: result.metadata.category,
        path: `/templates/edit/${result.id}`,
        score: result.score,
        metadata: result.metadata,
        originalData: result
      };

      // Customize based on content type
      if (result.metadata.category === 'Email') {
        mappedResult.type = 'email';
        mappedResult.path = `/email/view/${result.id}`;
      } else if (result.metadata.category === 'Document') {
        mappedResult.type = 'document';
        mappedResult.path = `/documents/view/${result.id}`;
      }

      return mappedResult;
    });
  }

  /**
   * Get mock search results for development
   * @param query Search query
   * @param options Search options
   * @returns Mock search results
   */
  private getMockSearchResults(
    query: string,
    options: {
      contentTypes?: SearchableContentType[];
      category?: string;
      maxResults?: number;
    }
  ): FrontendSearchResult[] {
    // Sample templates (copied from TemplatesPage for consistency)
    const sampleTemplates = [
      { id: 1, name: 'Meeting Follow-up', category: 'Business', subject: 'Follow-up: {{meeting_name}} - Next Steps', body: `Hi {{recipient_name}},\n\nThank you for your time...`, favorite: true },
      { id: 2, name: 'Thank You Note', category: 'Personal', subject: 'Thank You for {{event_or_gift}}', body: `Dear {{recipient_name}},\n\nI wanted to express my sincere thanks...`, favorite: false },
      { id: 3, name: 'Project Status Update', category: 'Business', subject: '{{project_name}} Status Update - {{date}}', body: `Hello Team,\n\nHere is the latest status update...`, favorite: true },
      { id: 4, name: 'Customer Feedback Request', category: 'Customer Support', subject: 'We Value Your Feedback on {{product_name}}', body: `Dear {{customer_name}},\n\nThank you for choosing our products...`, favorite: false },
      { id: 5, name: 'Job Application', category: 'Personal', subject: 'Application for {{position_title}} - {{applicant_name}}', body: `Dear Hiring Manager,\n\nI am writing to apply for the {{position_title}} position...`, favorite: true }
    ];

    // Filter templates based on query
    const searchTerm = query.toLowerCase();
    let filteredResults = sampleTemplates.filter(template => {
      return (
        template.name.toLowerCase().includes(searchTerm) ||
        template.subject.toLowerCase().includes(searchTerm) ||
        template.body.toLowerCase().includes(searchTerm) ||
        template.category.toLowerCase().includes(searchTerm)
      );
    });

    // Apply category filter if provided
    if (options.category) {
      filteredResults = filteredResults.filter(template => 
        template.category === options.category
      );
    }

    // Apply content type filter if provided
    if (options.contentTypes && options.contentTypes.length > 0 && !options.contentTypes.includes('template')) {
      // If templates are not included in the content types, return empty array
      return [];
    }

    // Apply max results limit
    if (options.maxResults) {
      filteredResults = filteredResults.slice(0, options.maxResults);
    }

    // Map to frontend search result format
    return filteredResults.map(template => ({
      id: template.id,
      type: 'template',
      title: template.name,
      snippet: template.subject,
      category: template.category,
      path: `/templates/edit/${template.id}`,
      score: Math.random(), // Mock relevance score
      originalData: template
    }));
  }
}

export const searchService = SearchService.getInstance();
export default searchService;