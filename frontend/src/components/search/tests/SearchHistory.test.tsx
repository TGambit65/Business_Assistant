import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchHistory } from '../SearchHistory';
import { SearchParams, FilterOperator } from '../../../types/search';

describe('SearchHistory', () => {
  // Mock HTMLElement properties for potential layout calculations
  let originalOffsetHeight: PropertyDescriptor | undefined;
  let originalOffsetWidth: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 600 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });
  });

  afterAll(() => {
    if (originalOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    }
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    }
  });

  const mockOnSelectHistoryItem = jest.fn();
  const mockOnClearHistory = jest.fn();

  const mockSearchParams: SearchParams = {
    query: 'test query',
    filters: [
      {
        field: 'category',
        operator: FilterOperator.EQUALS,
        value: 'test'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders history button', () => {
    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('shows empty state when no history', () => {
    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('No search history')).toBeInTheDocument();
  });

  it('loads history from localStorage on mount', () => {
    const savedHistory = [
      {
        id: '1',
        params: mockSearchParams,
        timestamp: Date.now()
      }
    ];
    localStorage.setItem('searchHistory', JSON.stringify(savedHistory));

    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('test query')).toBeInTheDocument();
  });

  it('displays history items correctly', () => {
    // Pre-populate localStorage instead of calling internal method
    const savedHistory = [
      { id: '2', params: { query: 'new query', filters: [] }, timestamp: Date.now() - 1000 },
      { id: '1', params: mockSearchParams, timestamp: Date.now() - 2000 }
    ];
    localStorage.setItem('searchHistory', JSON.stringify(savedHistory));

    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('new query')).toBeInTheDocument();
    expect(screen.getByText('test query')).toBeInTheDocument(); // Check original mock query too
  });

  it('removes item from history', () => {
    const savedHistory = [
      {
        id: '1',
        params: mockSearchParams,
        timestamp: Date.now()
      }
    ];
    localStorage.setItem('searchHistory', JSON.stringify(savedHistory));

    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    fireEvent.click(screen.getByText('History'));
    // Find the button associated with the specific history item
    const historyItemDiv = screen.getByText('test query').closest('div');
    const deleteButton = historyItemDiv?.querySelector('button[title="Remove"]'); 
    expect(deleteButton).toBeInTheDocument(); // Ensure button exists
    fireEvent.click(deleteButton!); // Non-null assertion as we expect it

    expect(screen.queryByText('test query')).not.toBeInTheDocument();
  });

  it('clears entire history', () => {
    const savedHistory = [
      {
        id: '1',
        params: mockSearchParams,
        timestamp: Date.now()
      }
    ];
    localStorage.setItem('searchHistory', JSON.stringify(savedHistory));

    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    fireEvent.click(screen.getByText('History'));
    fireEvent.click(screen.getByText('Clear History'));

    expect(screen.getByText('No search history')).toBeInTheDocument();
    expect(mockOnClearHistory).toHaveBeenCalled();
  });

  it('selects history item', () => {
    const savedHistory = [
      {
        id: '1',
        params: mockSearchParams,
        timestamp: Date.now()
      }
    ];
    localStorage.setItem('searchHistory', JSON.stringify(savedHistory));

    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    fireEvent.click(screen.getByText('History'));
    fireEvent.click(screen.getByText('test query'));

    expect(mockOnSelectHistoryItem).toHaveBeenCalledWith(mockSearchParams);
  });

  it('respects maxItems limit from localStorage', () => {
    // Pre-populate localStorage with more items than maxItems
    const searches = [
      { id: '3', params: { query: 'query 3', filters: [] }, timestamp: Date.now() - 1000 },
      { id: '2', params: { query: 'query 2', filters: [] }, timestamp: Date.now() - 2000 },
      { id: '1', params: { query: 'query 1', filters: [] }, timestamp: Date.now() - 3000 }
    ];
    localStorage.setItem('searchHistory', JSON.stringify(searches));

    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
        maxItems={2}
      />
    );

    fireEvent.click(screen.getByText('History'));
    // Should only display the latest 2 items based on maxItems prop
    expect(screen.getByText('query 2')).toBeInTheDocument();
    expect(screen.getByText('query 3')).toBeInTheDocument();
    expect(screen.queryByText('query 1')).not.toBeInTheDocument(); // Oldest should be gone
  });

  it('formats timestamps correctly', () => {
    const now = Date.now();
    const savedHistory = [
      {
        id: '1',
        params: mockSearchParams,
        timestamp: now - 30000 // 30 seconds ago
      },
      {
        id: '2',
        params: { ...mockSearchParams, query: 'older query' },
        timestamp: now - 7200000 // 2 hours ago
      }
    ];
    localStorage.setItem('searchHistory', JSON.stringify(savedHistory));

    render(
      <SearchHistory
        onSelectHistoryItem={mockOnSelectHistoryItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText(/Just now/)).toBeInTheDocument();
    expect(screen.getByText(/2h ago/)).toBeInTheDocument();
  });
});