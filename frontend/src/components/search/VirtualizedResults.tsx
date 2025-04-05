import React, { useCallback, useRef, useState } from 'react';
import { SharedSearchResult, SharedHighlight, SharedMatch } from '../../types/shared-search';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

// Local interfaces for the component
interface HighlightMatch {
  text: string;
  start?: number;
  end?: number;
}

interface HighlightItem {
  field: string;
  matches: HighlightMatch[];
}

interface VirtualizedResultsProps {
  results: SharedSearchResult[];
  onResultClick: (result: SharedSearchResult) => void;
  itemHeight?: number;
  overscan?: number;
}

export const VirtualizedResults: React.FC<VirtualizedResultsProps> = ({
  results,
  onResultClick,
  itemHeight = 100,
  overscan = 5
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan
  });

  const renderResult = useCallback((result: SharedSearchResult, index: number) => {
    const isHovered = hoveredIndex === index;
    
    return (
      <div
        key={result.id}
        className={`p-4 border-b border-border transition-colors duration-200 ${
          isHovered ? 'bg-blue-50' : 'bg-background'
        }`}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => onResultClick(result)}
      >
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {result.metadata?.title || result.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {result.metadata?.description || result.snippet}
        </p>
        <div className="flex items-center text-xs text-gray-500">
          <span className="mr-4">Score: {result.score.toFixed(2)}</span>
          <span className="mr-4">Category: {result.metadata?.category || 'Uncategorized'}</span>
          <span>Date: {result.metadata?.date ? new Date(result.metadata.date).toLocaleDateString() : 'N/A'}</span>
        </div>
        {result.highlights.length > 0 && (
          <div className="mt-2">
            {result.highlights.map((highlight: HighlightItem, idx: number) => (
              <div key={idx} className="text-sm text-gray-700">
                <span className="font-medium">{highlight.field}:</span>{' '}
                {highlight.matches.map((match: HighlightMatch, matchIdx: number) => (
                  <span
                    key={matchIdx}
                    className="bg-yellow-200 px-1 rounded"
                  >
                    {match.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [hoveredIndex, onResultClick]);

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto border border-border rounded-lg"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            {renderResult(results[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}; 