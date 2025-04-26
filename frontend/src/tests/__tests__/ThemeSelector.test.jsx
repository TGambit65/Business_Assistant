import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ThemeSelector from '../../components/ui/ThemeSelector';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = jest.fn(() => 'mock-blob-url');
URL.revokeObjectURL = jest.fn();

// Remove the global document.createElement mock

describe('ThemeSelector Component', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    // Clear localStorage
    localStorage.clear();
  });
  
  test('renders theme toggle button', () => {
    act(() => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
    });
    
    // Check that button is rendered
    const button = screen.getByRole('button', { name: 'Select theme' });
    expect(button).toBeInTheDocument();
  });
  
  test('opens theme dropdown when clicked', () => {
    act(() => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
    });
    
    // Click the theme button
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select theme' }));
    });
    
    // Check that dropdown is shown
    expect(screen.getByText('Select Theme')).toBeInTheDocument();
    
    // Check theme options
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('High Contrast')).toBeInTheDocument();
  });
  
  test('changes theme when option is selected', async () => {
    // Mock localStorage
    jest.spyOn(window.localStorage.__proto__, 'setItem');
    
    act(() => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
    });
    
    // Open dropdown
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select theme' }));
    });
    
    // Select Dark theme
    act(() => {
      fireEvent.click(screen.getByText('Dark'));
    });
    
    // Check if localStorage was updated
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
    
    // Check if dropdown is closed
    expect(screen.queryByText('Select Theme')).not.toBeInTheDocument();
  });
  
  test('downloads theme when export is clicked', async () => {
    // Mock the download link creation and click specifically for this test
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
      // Mock methods needed by the component's logic if any (appendChild/removeChild seem needed)
      appendChild: jest.fn(), 
      removeChild: jest.fn(),
      setAttribute: jest.fn(), // Add setAttribute if used internally
      style: {}, // Add style object if used
    };
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor); // Remove 'as any'
    // Spy on appendChild and removeChild to ensure they are called if needed by the logic
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');

    act(() => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
    });
    
    // Open dropdown
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select theme' }));
    });
    
    // Click export button
    act(() => {
      fireEvent.click(screen.getByText('Export Current'));
    });
    
    // Check if URL.createObjectURL was called
    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    // Check if download was triggered
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.click).toHaveBeenCalled();
    // Optionally check if append/remove were called if the logic requires it
    // expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    // expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);

    // Restore mocks for this test
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
  
  test('shows import form when import is clicked', () => {
    act(() => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
    });
    
    // Open dropdown
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select theme' }));
    });
    
    // Click import button
    act(() => {
      fireEvent.click(screen.getByText('Import Theme'));
    });
    
    // Check if form is shown
    expect(screen.getByText('Import Custom Theme')).toBeInTheDocument();
    expect(screen.getByText('Theme File')).toBeInTheDocument();
    expect(screen.getByText('Theme Name')).toBeInTheDocument();
  });
  
  test('handles theme import with validation', async () => {
    // Create mock file with theme data
    const mockFile = new File([
      JSON.stringify({
        name: 'test-theme',
        description: 'Test theme',
        variables: {
          '--primary': '#ff0000',
          '--background': '#ffffff'
        }
      })
    ], 'test-theme.json', { type: 'application/json' });
    
    // Mock FileReader
    const originalFileReader = global.FileReader;
    global.FileReader = class {
      constructor() {
        this.result = JSON.stringify({
          name: 'test-theme',
          description: 'Test theme',
          variables: {
            '--primary': '#ff0000',
            '--background': '#ffffff'
          }
        });
      }
      readAsText() {
        this.onload && this.onload();
      }
    };
    
    act(() => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
    });
    
    // Open dropdown
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select theme' }));
    });
    
    // Click import button
    act(() => {
      fireEvent.click(screen.getByText('Import Theme'));
    });
    
    // Enter theme name
    act(() => {
      fireEvent.change(screen.getByPlaceholderText('my-custom-theme'), {
        target: { value: 'custom-red-theme' }
      });
    });
    
    // Mock file input change
    global.File = jest.fn().mockImplementation(() => mockFile);
    
    // Select file
    const fileInput = screen.getByLabelText('Theme File');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile]
    });
    
    act(() => {
      fireEvent.change(fileInput);
    });
    
    // Apply theme button should be clickable
    expect(screen.getByText('Apply Theme')).not.toBeDisabled();
    
    // Click apply
    act(() => {
      fireEvent.click(screen.getByText('Apply Theme'));
    });
    
    // Reset FileReader
    global.FileReader = originalFileReader;
  });
  
  test('shows error for invalid theme file', async () => {
    // Create invalid mock file
    const mockInvalidFile = new File([
      JSON.stringify({ invalid: 'data' })
    ], 'invalid-theme.json', { type: 'application/json' });
    
    act(() => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
    });
    
    // Open dropdown
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select theme' }));
    });
    
    // Click import button
    act(() => {
      fireEvent.click(screen.getByText('Import Theme'));
    });
    
    // Enter theme name
    act(() => {
      fireEvent.change(screen.getByPlaceholderText('my-custom-theme'), {
        target: { value: 'invalid-theme' }
      });
    });
    
    // Select file
    const fileInput = screen.getByLabelText('Theme File');
    Object.defineProperty(fileInput, 'files', {
      value: [mockInvalidFile]
    });
    
    act(() => {
      fireEvent.change(fileInput);
    });
    
    // Click apply
    await act(async () => {
      fireEvent.click(screen.getByText('Apply Theme'));
    });
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/Error loading theme/)).toBeInTheDocument();
    });
  });
}); 