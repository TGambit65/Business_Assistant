import { ErrorRecovery } from '../ErrorRecovery';
import { SearchResult, SearchParams } from '../../types/search';

describe('ErrorRecovery', () => {
  const mockResults: SearchResult[] = [
    {
      id: '1',
      score: 0.95,
      content: 'Test content',
      metadata: {
        title: 'Test Title',
        description: 'Test description',
        date: new Date(),
        author: 'Test Author',
        category: 'Test Category',
        tags: ['test']
      },
      highlights: []
    }
  ];

  describe('retry', () => {
    it('retries failed operations with exponential backoff', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary error');
        }
        return 'success';
      };

      const result = await ErrorRecovery.retry(operation, {
        maxAttempts: 3,
        delay: 100
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('throws after max attempts', async () => {
      const operation = async () => {
        throw new Error('Permanent error');
      };

      await expect(ErrorRecovery.retry(operation, { maxAttempts: 2 })).rejects.toThrow();
    });
  });

  describe('recoverFromSearchError', () => {
    it('falls back to offline results for network errors', async () => {
      const error = {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred during search',
        details: 'Network error details'
      };

      const params: SearchParams = {
        query: 'test',
        filters: []
      };

      const results = await ErrorRecovery.recoverFromSearchError(error, mockResults, params);
      expect(results).toEqual(mockResults);
    });

    it('falls back to offline results for timeout errors', async () => {
      const error = {
        code: 'TIMEOUT_ERROR',
        message: 'Search operation timed out',
        details: 'Timeout error details'
      };

      const params: SearchParams = {
        query: 'test',
        filters: []
      };

      const results = await ErrorRecovery.recoverFromSearchError(error, mockResults, params);
      expect(results).toEqual(mockResults);
    });

    it('throws for non-recoverable errors', async () => {
      const error = {
        code: 'SEARCH_ERROR',
        message: 'Search error',
        details: 'Error details'
      };

      const params: SearchParams = {
        query: 'test',
        filters: []
      };

      let didThrow = false;
      try {
        await ErrorRecovery.recoverFromSearchError(error, mockResults, params);
      } catch (e) {
        didThrow = true;
        // Optionally check the error type/message if needed
        expect(e).toEqual(error);
      }
      expect(didThrow).toBe(true); // Assert that an error was caught
    });
  });

  describe('handleSyncError', () => {
    it('preserves existing data for sync errors', async () => {
      const error = {
        code: 'SYNC_ERROR',
        message: 'Failed to sync search data',
        details: 'Sync error details'
      };

      const results = await ErrorRecovery.handleSyncError(error, mockResults);
      expect(results).toEqual(mockResults);
    });

    it('throws for non-sync errors', async () => {
      const error = {
        code: 'SEARCH_ERROR',
        message: 'Search error',
        details: 'Error details'
      };

      let didThrow = false;
      try {
        await ErrorRecovery.handleSyncError(error, mockResults);
      } catch (e) {
        didThrow = true;
        // Optionally check the error type/message if needed
        expect(e).toEqual(error);
      }
      expect(didThrow).toBe(true); // Assert that an error was caught
    });
  });

  describe('validateSearchParams', () => {
    it('validates valid search parameters', () => {
      const params: SearchParams = {
        query: 'test',
        filters: [
          {
            field: 'category',
            operator: 'equals',
            value: 'Test Category'
          }
        ]
      };

      expect(() => ErrorRecovery.validateSearchParams(params)).not.toThrow();
    });

    it('throws for missing parameters', () => {
      expect(() => ErrorRecovery.validateSearchParams(null as unknown as SearchParams)).toThrow();
    });

    it('throws for invalid query type', () => {
      const params = {
        query: 123,
        filters: []
      };

      expect(() => ErrorRecovery.validateSearchParams(params as unknown as SearchParams)).toThrow();
    });

    it('throws for invalid filters array', () => {
      const params = {
        query: 'test',
        filters: 'not an array'
      };

      expect(() => ErrorRecovery.validateSearchParams(params as unknown as SearchParams)).toThrow();
    });

    it('throws for invalid filter properties', () => {
      const params: SearchParams = {
        query: 'test',
        filters: [
          {
            field: '',
            operator: 'equals',
            value: 'test'
          }
        ]
      };

      expect(() => ErrorRecovery.validateSearchParams(params)).toThrow();
    });
  });

  describe('logError', () => {
    it('logs error details', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = {
        code: 'SEARCH_ERROR',
        message: 'Test error',
        details: 'Error details'
      };

      ErrorRecovery.logError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Search Error:', expect.objectContaining({
        code: 'SEARCH_ERROR',
        message: 'Test error',
        details: 'Error details'
      }));

      consoleSpy.mockRestore();
    });
  });
}); 