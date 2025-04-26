import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchInterface } from '../SearchInterface';
import { SearchInterfaceProps } from '../types';
import { SearchParams, Filter } from '../../../types/search';
import { SharedSearchResult } from '../../../types/shared-search';

describe('SearchInterface', () => {
  const mockResults: SharedSearchResult[] = [
    {
      id: '1',
      score: 0.8,
      content: 'Test content 1',
      title: 'Test Title 1',
      snippet: 'Test Description 1',
      metadata: {
        title: 'Test Title 1',
        description: 'Test Description 1',
        date: new Date('2023-01-01'),
        author: 'Test Author 1',
        category: 'test',
        tags: ['test', 'example']
      },
      highlights: [
        {
          field: 'content',
          matches: [
            { start: 0, end: 5, text: 'Test', highlighted: true }
          ]
        }
      ]
    }
  ];

  const mockOnSearch = jest.fn();
  const mockOnFilterChange = jest.fn();
  const mockOnVoiceSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(
      <SearchInterface
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onVoiceSearch={mockOnVoiceSearch}
        results={[]}
        isLoading={false}
      />
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('handles search input changes', async () => {
    render(
      <SearchInterface
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onVoiceSearch={mockOnVoiceSearch}
        results={[]}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        query: 'test',
        filters: [],
        semantic: true
      });
    });
  });

  it('toggles filters panel', () => {
    render(
      <SearchInterface
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onVoiceSearch={mockOnVoiceSearch}
        results={[]}
        isLoading={false}
      />
    );

    const filterButton = screen.getByTitle('Toggle Filters');
    fireEvent.click(filterButton);

    expect(screen.getByText('Add Filter')).toBeInTheDocument();
  });

  it('handles voice search', () => {
    render(
      <SearchInterface
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onVoiceSearch={mockOnVoiceSearch}
        results={[]}
        isLoading={false}
      />
    );

    const voiceButton = screen.getByTitle('Voice Search');
    fireEvent.click(voiceButton);

    expect(mockOnVoiceSearch).toHaveBeenCalledWith('');
  });

  it('displays loading state', () => {
    render(
      <SearchInterface
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onVoiceSearch={mockOnVoiceSearch}
        results={[]}
        isLoading={true}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays search results', () => {
    render(
      <SearchInterface
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onVoiceSearch={mockOnVoiceSearch}
        results={mockResults}
        isLoading={false}
      />
    );

    expect(screen.getByText('Test Title 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test')).toHaveClass('bg-yellow-100');
  });

  it('displays error message', () => {
    const error = 'Search failed';
    render(
      <SearchInterface
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onVoiceSearch={mockOnVoiceSearch}
        results={[]}
        isLoading={false}
        error={error}
      />
    );

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('handles pagination', () => {
    const manyResults = Array(15).fill(null).map((_, i) => ({
      ...mockResults[0],
      id: String(i + 1)
    }));

    render(
      <SearchInterface
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onVoiceSearch={mockOnVoiceSearch}
        results={manyResults}
        isLoading={false}
      />
    );

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  });
}); 