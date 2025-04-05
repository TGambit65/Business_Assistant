import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualizedResults } from '../VirtualizedResults';
import { SharedSearchResult } from '../../../types/shared-search';

const mockResults: SharedSearchResult[] = [
  {
    id: '1',
    score: 0.95,
    title: 'Test Title 1',
    snippet: 'Test Description 1',
    content: 'Test content 1',
    highlights: [
      {
        field: 'content',
        matches: [
          { text: 'Test', highlighted: true, start: 0, end: 5 }
        ]
      }
    ],
    metadata: {
      title: 'Test Title 1',
      description: 'Test Description 1',
      date: new Date('2023-01-01'),
      author: 'Test Author 1',
      category: 'Test Category 1',
      tags: ['tag1', 'tag2']
    }
  },
  {
    id: '2',
    score: 0.85,
    title: 'Test Title 2',
    snippet: 'Test Description 2', 
    content: 'Test content 2',
    highlights: [],
    metadata: {
      title: 'Test Title 2',
      description: 'Test Description 2',
      date: new Date('2023-01-02'),
      author: 'Test Author 2',
      category: 'Test Category 2',
      tags: ['tag3', 'tag4']
    }
  }
];

describe('VirtualizedResults', () => {
  // Mock HTMLElement properties for react-window/react-virtualized in JSDOM
  let originalOffsetHeight: PropertyDescriptor | undefined;
  let originalOffsetWidth: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    // Provide mock dimensions for the virtualized list container
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 600 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });
  });

  afterAll(() => {
    // Restore original properties
    if (originalOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    }
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    }
  });

  const mockOnResultClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search results', () => {
    render(
      <VirtualizedResults
        results={mockResults}
        onResultClick={mockOnResultClick}
      />
    );

    expect(screen.getByText('Test Title 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Title 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
  });

  it('displays result metadata', () => {
    render(
      <VirtualizedResults
        results={mockResults}
        onResultClick={mockOnResultClick}
      />
    );

    expect(screen.getByText('Score: 0.95')).toBeInTheDocument();
    expect(screen.getByText('Category: Test Category 1')).toBeInTheDocument();
    expect(screen.getByText('Date: 1/1/2023')).toBeInTheDocument();
  });

  it('displays highlights when present', () => {
    render(
      <VirtualizedResults
        results={mockResults}
        onResultClick={mockOnResultClick}
      />
    );

    const highlight = screen.getByText('Test');
    expect(highlight).toHaveClass('bg-yellow-200');
  });

  it('calls onResultClick when a result is clicked', () => {
    render(
      <VirtualizedResults
        results={mockResults}
        onResultClick={mockOnResultClick}
      />
    );

    const result = screen.getByText('Test Title 1');
    fireEvent.click(result);

    expect(mockOnResultClick).toHaveBeenCalledWith(mockResults[0]);
  });

  it('applies hover styles on mouse enter', () => {
    render(
      <VirtualizedResults
        results={mockResults}
        onResultClick={mockOnResultClick}
      />
    );

    const result = screen.getByText('Test Title 1').closest('div');
    fireEvent.mouseEnter(result!);

    expect(result).toHaveClass('bg-blue-50');
  });

  it('removes hover styles on mouse leave', () => {
    render(
      <VirtualizedResults
        results={mockResults}
        onResultClick={mockOnResultClick}
      />
    );

    const result = screen.getByText('Test Title 1').closest('div');
    fireEvent.mouseEnter(result!);
    fireEvent.mouseLeave(result!);

    expect(result).not.toHaveClass('bg-blue-50');
  });

  it('handles empty results array', () => {
    render(
      <VirtualizedResults
        results={[]}
        onResultClick={mockOnResultClick}
      />
    );

    expect(screen.queryByText('Test Title 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Title 2')).not.toBeInTheDocument();
  });

  it('respects custom item height', () => {
    const customHeight = 150;
    render(
      <VirtualizedResults
        results={mockResults}
        onResultClick={mockOnResultClick}
        itemHeight={customHeight}
      />
    );

    const result = screen.getByText('Test Title 1').closest('div');
    expect(result).toHaveStyle({ height: `${customHeight}px` });
  });
});