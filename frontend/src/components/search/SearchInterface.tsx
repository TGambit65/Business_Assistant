import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mic, Filter, X } from 'lucide-react';
import { SearchParams, Filter as SearchFilter } from '../../types/search';
import { SharedSearchResult } from '../../types/shared-search';
import { AdvancedFilters } from './AdvancedFilters';
import { VoiceSearch } from './VoiceSearch';
import { SearchInterfaceProps } from './types';

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  onFilterChange,
  onVoiceSearch,
  results,
  isLoading,
  error
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [page, setPage] = useState(1);
  const resultsPerPage = 10;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        onSearch({
          query,
          filters,
          semantic: true
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters, onSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: SearchFilter[]) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [onFilterChange]);

  // Handle voice search
  const handleVoiceSearch = useCallback(() => {
    setShowVoiceSearch(true);
    onVoiceSearch(query);
  }, [onVoiceSearch, query]);

  // Calculate pagination
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Search Input */}
      <div className="relative flex items-center mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
          <button
            onClick={handleVoiceSearch}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="Voice Search"
          >
            <Mic className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded-full ${
              showFilters ? 'bg-primary text-white' : 'hover:bg-gray-100'
            }`}
            title="Toggle Filters"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-4">
          <AdvancedFilters
            filters={filters}
            onAddFilter={(filter: SearchFilter) => handleFilterChange([...filters, filter])}
            onRemoveFilter={(index: number) => handleFilterChange(filters.filter((_, i) => i !== index))}
            onUpdateFilter={(index: number, filter: SearchFilter) => {
              const newFilters = [...filters];
              newFilters[index] = filter;
              handleFilterChange(newFilters);
            }}
          />
        </div>
      )}

      {/* Voice Search Modal */}
      {showVoiceSearch && (
        <VoiceSearch
          onTranscript={(text: string) => {
            setQuery(text);
            setShowVoiceSearch(false);
          }}
          onError={(error: Error | string) => {
            console.error('Voice search error:', error);
            setShowVoiceSearch(false);
          }}
        />
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedResults.map((result) => (
            <div
              key={result.id}
              className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{result.metadata?.title || result.title}</h3>
              <p className="text-gray-600 mb-2">{result.metadata?.description || result.snippet}</p>
              {result.highlights && (
                <div className="mt-2">
                  {result.highlights.map((highlight, index) => (
                    <div key={index} className="text-sm text-gray-500">
                      <span className="font-medium">{highlight.field}:</span>{' '}
                      {highlight.matches.map((match, matchIndex) => (
                        <span
                          key={matchIndex}
                          className="bg-yellow-100 px-1 rounded"
                        >
                          {match.text}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 