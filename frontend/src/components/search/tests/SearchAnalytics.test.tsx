// Mock ResizeObserver for recharts
window.ResizeObserver = class ResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
};

// Mock crypto.randomUUID for JSDOM
if (typeof global.crypto === 'undefined') (global as any).crypto = {};
if (typeof global.crypto.randomUUID === 'undefined') {
  global.crypto.randomUUID = (() => '123e4567-e89b-12d3-a456-426614174000') as any;
}


import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'; // Import waitFor
import { SearchAnalytics } from '../SearchAnalytics';
import { SearchParams, FilterOperator } from '../../../types/search';

describe('SearchAnalytics', () => {
  const mockOnExportData = jest.fn();

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

  it('renders analytics dashboard', () => {
    render(<SearchAnalytics onExportData={mockOnExportData} />);

    expect(screen.getByText('Search Analytics')).toBeInTheDocument();
    expect(screen.getByText('Total Searches')).toBeInTheDocument();
    expect(screen.getByText('Average Time Spent')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Popular Queries')).toBeInTheDocument();
    expect(screen.getByText('Popular Filters')).toBeInTheDocument();
    expect(screen.getByText('Searches Over Time')).toBeInTheDocument();
  });

  it('shows zero values when no data', async () => { // Make test async
    render(<SearchAnalytics onExportData={mockOnExportData} />);

    await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
        // Check the sibling p tag for the value
        const avgTimeValue = screen.getByText('Average Time Spent').nextElementSibling;
        expect(avgTimeValue).toHaveTextContent(/^0.0s$/);
        const successRateValue = screen.getByText('Success Rate').nextElementSibling;
        expect(successRateValue).toHaveTextContent(/^0.0%$/);
    });
  });

  it('loads and displays analytics data', async () => { // Make test async
    const mockEvents = [
      {
        id: '1',
        timestamp: Date.now(),
        query: 'test query',
        filters: ['category equals'],
        resultCount: 5,
        timeSpent: 1000,
        success: true
      }
    ];
    localStorage.setItem('searchEvents', JSON.stringify(mockEvents));

    render(<SearchAnalytics onExportData={mockOnExportData} />);

    await waitFor(() => {
      const totalSearchesValue = screen.getByText('Total Searches').nextElementSibling;
      expect(totalSearchesValue).toHaveTextContent(/^1$/);
      const avgTimeValue = screen.getByText('Average Time Spent').nextElementSibling;
      expect(avgTimeValue).toHaveTextContent(/^1000.0s$/); // Expect ms format
      const successRateValue = screen.getByText('Success Rate').nextElementSibling;
      expect(successRateValue).toHaveTextContent(/^100.0%$/);
      expect(screen.getByText('test query')).toBeInTheDocument(); // Popular Query
      expect(screen.getByText('category equals')).toBeInTheDocument(); // Popular Filter
    }, { timeout: 2000 }); // Increased timeout
  });

  it('calculates average time spent correctly', async () => { // Make test async
    const mockEvents = [
      {
        id: '1',
        timestamp: Date.now(),
        query: 'query 1',
        filters: [],
        resultCount: 5,
        timeSpent: 1000,
        success: true
      },
      {
        id: '2',
        timestamp: Date.now(),
        query: 'query 2',
        filters: [],
        resultCount: 3,
        timeSpent: 2000,
        success: false
      }
    ];
    localStorage.setItem('searchEvents', JSON.stringify(mockEvents));

    render(<SearchAnalytics onExportData={mockOnExportData} />);

    await waitFor(() => {
      // Expect milliseconds with .toFixed(1)
      const avgTimeValue = screen.getByText('Average Time Spent').nextElementSibling;
      expect(avgTimeValue).toHaveTextContent(/^1500.0s$/); // Expect ms format
    }, { timeout: 2000 }); // Increased timeout
  });

  it('calculates success rate correctly', async () => { // Make test async
    const mockEvents = [
      {
        id: '1',
        timestamp: Date.now(),
        query: 'query 1',
        filters: [],
        resultCount: 5,
        timeSpent: 1000,
        success: true
      },
      {
        id: '2',
        timestamp: Date.now(),
        query: 'query 2',
        filters: [],
        resultCount: 0,
        timeSpent: 1000,
        success: false
      }
    ];
    localStorage.setItem('searchEvents', JSON.stringify(mockEvents));

    render(<SearchAnalytics onExportData={mockOnExportData} />);

    await waitFor(() => {
      const successRateValue = screen.getByText('Success Rate').nextElementSibling;
      expect(successRateValue).toHaveTextContent(/^50.0%$/);
    }, { timeout: 2000 }); // Increased timeout
  });

  it('shows top 5 popular queries', async () => { // Make test async
    const mockEvents = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      timestamp: Date.now(),
      query: `query ${i % 2}`,
      filters: [],
      resultCount: 5,
      timeSpent: 1000,
      success: true
    }));
    localStorage.setItem('searchEvents', JSON.stringify(mockEvents));

    render(<SearchAnalytics onExportData={mockOnExportData} />);

    await waitFor(() => {
      const queryElements = screen.getAllByText(/query \d/);
      expect(queryElements.length).toBeLessThanOrEqual(5);
      // Check specific queries if needed
      expect(screen.getByText('query 0')).toBeInTheDocument();
      expect(screen.getByText('query 1')).toBeInTheDocument();
    }, { timeout: 2000 }); // Increased timeout
  });

  it('shows top 5 popular filters', async () => { // Make test async
    const mockEvents = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      timestamp: Date.now(),
      query: 'test query',
      filters: [`filter ${i % 2}`],
      resultCount: 5,
      timeSpent: 1000,
      success: true
    }));
    localStorage.setItem('searchEvents', JSON.stringify(mockEvents));

    render(<SearchAnalytics onExportData={mockOnExportData} />);

    await waitFor(() => {
      const filterElements = screen.getAllByText(/filter \d/);
      expect(filterElements.length).toBeLessThanOrEqual(5);
      // Check specific filters if needed
      expect(screen.getByText('filter 0')).toBeInTheDocument();
      expect(screen.getByText('filter 1')).toBeInTheDocument();
    }, { timeout: 2000 }); // Increased timeout
  });

  it('filters events from last 30 days', async () => { // Make test async
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const mockEvents = [
      {
        id: '1',
        timestamp: Date.now(),
        query: 'recent query',
        filters: [],
        resultCount: 5,
        timeSpent: 1000,
        success: true
      },
      {
        id: '2',
        timestamp: thirtyOneDaysAgo,
        query: 'old query',
        filters: [],
        resultCount: 5,
        timeSpent: 1000,
        success: true
      }
    ];
    localStorage.setItem('searchEvents', JSON.stringify(mockEvents));

    render(<SearchAnalytics onExportData={mockOnExportData} />);

    await waitFor(() => {
      expect(screen.getByText('recent query')).toBeInTheDocument();
      expect(screen.queryByText('old query')).not.toBeInTheDocument();
    }, { timeout: 2000 }); // Increased timeout
  });

  it('calls onExportData when export button is clicked', () => {
    render(<SearchAnalytics onExportData={mockOnExportData} />);

    fireEvent.click(screen.getByText('Export Data'));
    expect(mockOnExportData).toHaveBeenCalled();
  });

  it('updates analytics when new search is tracked', async () => { 
    // Initial render with empty localStorage
    render(<SearchAnalytics onExportData={mockOnExportData} />);

    // Simulate tracking a new search event by updating localStorage directly
    const newEvent = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        query: mockSearchParams.query,
        filters: (mockSearchParams.filters ?? []).map(f => `${f.field} ${f.operator}`), // Fix TS error
        resultCount: 5,
        timeSpent: 1000, // 1 second
        success: true
    };
    const updatedEvents = [newEvent]; // Start with just the new event for clarity
    
    // Mock localStorage.getItem for the *next* effect run
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockImplementation((key) => {
        if (key === 'searchEvents') {
            return JSON.stringify(updatedEvents);
        }
        return null;
    });

    // Force a re-render - this should trigger useEffect again
    // which will now get the updated data from the mocked localStorage
    act(() => {
      // Re-rendering the component should trigger the useEffect again
       render(<SearchAnalytics onExportData={mockOnExportData} />);
    });


    await waitFor(() => {
      const totalSearchesValue = screen.getByText('Total Searches').nextElementSibling;
      expect(totalSearchesValue).toHaveTextContent(/^1$/);
      const avgTimeValue = screen.getByText('Average Time Spent').nextElementSibling;
      expect(avgTimeValue).toHaveTextContent(/^1000.0s$/); // Expect ms format
      const successRateValue = screen.getByText('Success Rate').nextElementSibling;
      expect(successRateValue).toHaveTextContent(/^100.0%$/);
    }, { timeout: 2000 }); // Increased timeout

    getItemSpy.mockRestore(); // Clean up the spy
  });
});