// Mock indexedDB globally via jest.setup.js

// Increase timeout just in case, although mocks should prevent long operations
jest.setTimeout(60000); // 60 seconds

import { SearchEngine } from '../../SearchEngine';
import { OfflineSearchManager } from '../../OfflineSearchManager';
import { FuzzySearch } from '../../FuzzySearch';
import { SearchResult, SearchParams, SearchOptions } from '../../../types/search';

// Mock the OfflineSearchManager methods on the prototype *before* tests run
const mockOfflineSearch = jest.fn().mockResolvedValue([]);
const mockOfflineBuildIndex = jest.fn().mockResolvedValue(undefined);
const mockOfflineClearIndex = jest.fn().mockResolvedValue(undefined);

jest.mock('../../OfflineSearchManager', () => {
  return {
    OfflineSearchManager: jest.fn().mockImplementation(() => {
      // This mock constructor will be called by SearchEngine.getInstance()
      return {
        // Provide mocks for all public methods used by SearchEngine
        initDB: jest.fn().mockResolvedValue(undefined), // Assume initDB might be called internally
        buildIndex: mockOfflineBuildIndex,
        search: mockOfflineSearch,
        clearIndex: mockOfflineClearIndex,
        // Add other methods if SearchEngine uses them
      };
    })
  };
});


// Re-enabling to test with mocked OfflineSearchManager
describe('Search Integration', () => {
  let searchEngine: SearchEngine;
  let mockResults: SearchResult[];

  beforeEach(async () => {
    // Clear mocks before each test
    mockOfflineSearch.mockClear().mockResolvedValue([]);
    mockOfflineBuildIndex.mockClear().mockResolvedValue(undefined);
    mockOfflineClearIndex.mockClear().mockResolvedValue(undefined);

    // Get the singleton instance. It will have the mocked OfflineSearchManager.
    searchEngine = SearchEngine.getInstance();

    // Mock the private performSearch method for tests that need results
    // Default to returning some mock results for filtering tests etc.
     mockResults = [
      {
        id: '1', score: 0.95, content: 'Hello world, this is a test content',
        metadata: { title: 'Test Title', description: 'A test description', date: new Date(2024, 0, 1), author: 'Test Author', category: 'Test Category', tags: ['test', 'example'] }, highlights: []
      },
      {
        id: '2', score: 0.85, content: 'Another piece of example content for testing',
         metadata: { title: 'Example Title 2', description: 'More testing details', date: new Date(2024, 1, 15), author: 'Another Author', category: 'Examples', tags: ['example', 'content'] }, highlights: []
      },
       {
        id: '3', score: 0.75, content: 'Final test case content',
         metadata: { title: 'Final Case', description: 'Final description', date: new Date(2024, 2, 20), author: 'Test Author', category: 'Test Category', tags: ['final', 'test'] }, highlights: []
      }
    ];
    jest.spyOn(searchEngine as any, 'performSearch').mockResolvedValue([...mockResults]);


  });

   afterEach(() => {
      jest.restoreAllMocks(); // Restore any spies created directly on instances
   });

  it('should call OfflineSearchManager.buildIndex when building index', async () => {
    // The SearchEngine.buildSearchIndex implementation currently calls offlineManager.buildIndex
    await searchEngine.buildSearchIndex();
    expect(mockOfflineBuildIndex).toHaveBeenCalled();
  });

  // This test is less meaningful now as SearchEngine.search doesn't differentiate offline/online yet.
  // We verify that performSearch (which would contain the logic) is called.
  it('should call performSearch when searching', async () => {
    const params: SearchParams = { query: 'test', filters: [] };
    const options: SearchOptions = {}; // No useOffline option

    await searchEngine.search(params, options);

    // Verify the internal performSearch was called (which would handle offline/online)
    expect((searchEngine as any).performSearch).toHaveBeenCalledWith(params, options);
    // We don't directly check mockOfflineSearch here, as performSearch is mocked
  });

  it('should handle filters correctly after retrieving results', async () => {
      const params: SearchParams = {
          query: 'content',
          filters: [{ field: 'category', operator: 'equals', value: 'Test Category' }]
      };
      const options: SearchOptions = {};

      // performSearch mock returns all results
      const { results } = await searchEngine.search(params, options);

      // Verify filtering happened correctly on the results returned by performSearch
      expect(results.length).toBe(2);
      expect(results[0].id).toBe('1');
      expect(results[1].id).toBe('3');
  });

  // Removed test for clearOfflineIndex as the method doesn't exist on SearchEngine

  // Add more integration tests if SearchEngine logic becomes more complex
  // e.g., testing cache interaction, combined filtering/fuzzy search

});