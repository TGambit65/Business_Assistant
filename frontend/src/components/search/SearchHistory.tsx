import React, { useState, useEffect } from 'react';
import { SearchParams } from '../../../../src/types/search';

interface SearchHistoryProps {
  onSelectHistoryItem: (params: SearchParams) => void;
  onClearHistory: () => void;
  maxItems?: number;
}

interface HistoryItem {
  id: string;
  params: SearchParams;
  timestamp: number;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  onSelectHistoryItem,
  onClearHistory,
  maxItems = 10
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = (params: SearchParams) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      params,
      timestamp: Date.now()
    };

    setHistory(prevHistory => {
      const updatedHistory = [newItem, ...prevHistory].slice(0, maxItems);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(item => item.id !== id);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
    onClearHistory();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-foreground"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>History</span>
        {history.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {history.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="absolute right-0 mt-2 w-80 bg-background rounded-lg shadow-lg border border-border z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Search History</h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No search history</p>
            ) : (
              <ul className="space-y-2">
                {history.map(item => (
                  <li
                    key={item.id}
                    className="group flex items-start justify-between p-2 hover:bg-muted rounded-lg"
                  >
                    <button
                      onClick={() => onSelectHistoryItem(item.params)}
                      className="flex-1 text-left"
                    >
                      <div className="text-sm text-foreground">
                        {item.params.query}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.params.filters.length > 0 && (
                          <span className="mr-2">
                            {item.params.filters.length} filters
                          </span>
                        )}
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </button>
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 