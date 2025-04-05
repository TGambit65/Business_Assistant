import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import { SearchResult } from '../../../../src/types/search';

describe('KeyboardShortcuts', () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();
  const mockOnNextResult = jest.fn();
  const mockOnPreviousResult = jest.fn();
  const mockOnSelectResult = jest.fn();
  const mockOnToggleFilters = jest.fn();
  const mockOnToggleVoiceSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderKeyboardShortcuts = () => {
    return render(
      <KeyboardShortcuts
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        onNextResult={mockOnNextResult}
        onPreviousResult={mockOnPreviousResult}
        onSelectResult={mockOnSelectResult}
        onToggleFilters={mockOnToggleFilters}
        onToggleVoiceSearch={mockOnToggleVoiceSearch}
        isFiltersVisible={false}
        isVoiceSearchActive={false}
      />
    );
  };

  it('renders keyboard shortcuts help panel', () => {
    renderKeyboardShortcuts();

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Enter: Search')).toBeInTheDocument();
    expect(screen.getByText('Esc: Clear')).toBeInTheDocument();
    expect(screen.getByText('↑/↓: Navigate results')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+F: Toggle filters')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+V: Toggle voice search')).toBeInTheDocument();
    expect(screen.getByText('1-9: Select result')).toBeInTheDocument();
  });

  it('triggers search on Enter key', () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('triggers clear on Escape key', () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClear).toHaveBeenCalled();
  });

  it('triggers next result on ArrowDown key', () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(mockOnNextResult).toHaveBeenCalled();
  });

  it('triggers previous result on ArrowUp key', () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(mockOnPreviousResult).toHaveBeenCalled();
  });

  it('triggers toggle filters on Ctrl+F', () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });
    expect(mockOnToggleFilters).toHaveBeenCalled();
  });

  it('triggers toggle voice search on Ctrl+V', () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: 'v', ctrlKey: true });
    expect(mockOnToggleVoiceSearch).toHaveBeenCalled();
  });

  it('triggers result selection on number keys 1-9', () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: '1' });
    expect(mockOnSelectResult).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: '5' });
    expect(mockOnSelectResult).toHaveBeenCalledTimes(2);
  });

  it('does not trigger shortcuts when typing in input fields', () => {
    renderKeyboardShortcuts();

    // Create and focus an input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnSearch).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('does not trigger shortcuts with modifier keys', () => {
    renderKeyboardShortcuts();

    // Test with Shift key
    fireEvent.keyDown(window, { key: 'Enter', shiftKey: true });
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Test with Alt key
    fireEvent.keyDown(window, { key: 'Enter', altKey: true });
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Test with Ctrl key
    fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderKeyboardShortcuts();

    // Add a spy to the window.addEventListener method
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
}); 