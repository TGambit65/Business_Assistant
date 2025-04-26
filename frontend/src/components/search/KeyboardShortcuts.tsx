import React, { useEffect, useCallback } from 'react';
import { SearchResult } from '../../../../src/types/search';

interface KeyboardShortcutsProps {
  onSearch: () => void;
  onClear: () => void;
  onNextResult: () => void;
  onPreviousResult: () => void;
  onSelectResult: (result: SearchResult) => void;
  onToggleFilters: () => void;
  onToggleVoiceSearch: () => void;
  isFiltersVisible: boolean;
  isVoiceSearchActive: boolean;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onSearch,
  onClear,
  onNextResult,
  onPreviousResult,
  onSelectResult,
  onToggleFilters,
  onToggleVoiceSearch,
  isFiltersVisible,
  isVoiceSearchActive
}) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Check for modifier keys
    const hasCtrl = event.ctrlKey || event.metaKey;
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;

    switch (event.key.toLowerCase()) {
      case 'enter':
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onSearch();
        }
        break;

      case 'escape':
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onClear();
        }
        break;

      case 'arrowdown':
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onNextResult();
        }
        break;

      case 'arrowup':
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onPreviousResult();
        }
        break;

      case 'f':
        if (hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onToggleFilters();
        }
        break;

      case 'v':
        if (hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onToggleVoiceSearch();
        }
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          const index = parseInt(event.key) - 1;
          onSelectResult({} as SearchResult); // This will be replaced with actual result
        }
        break;
    }
  }, [
    onSearch,
    onClear,
    onNextResult,
    onPreviousResult,
    onSelectResult,
    onToggleFilters,
    onToggleVoiceSearch
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed bottom-4 right-4 bg-background p-4 rounded-lg shadow-lg border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-2">Keyboard Shortcuts</h3>
      <ul className="text-xs text-gray-600 space-y-1">
        <li>Enter: Search</li>
        <li>Esc: Clear</li>
        <li>↑/↓: Navigate results</li>
        <li>Ctrl+F: Toggle filters</li>
        <li>Ctrl+V: Toggle voice search</li>
        <li>1-9: Select result</li>
      </ul>
    </div>
  );
}; 