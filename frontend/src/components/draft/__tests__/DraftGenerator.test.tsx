import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DraftGenerator } from '../DraftGenerator';
import { AIDraftGenerator } from '../../../services/AIDraftGenerator';
import { Draft } from '../../../types/draft';
import { useMediaQuery } from '../../../hooks/useMediaQuery'; // Import the hook correctly

// Mock the AIDraftGenerator service
const mockGenerateDraft = jest.fn(async (context) => ({
  id: '123',
  content: 'Generated draft content',
  context,
  metadata: { timestamp: Date.now() }
}));
const mockAIDraftGeneratorInstance = {
  generateDraft: mockGenerateDraft,
};
jest.mock('../../../services/AIDraftGenerator', () => ({
  AIDraftGenerator: {
    getInstance: jest.fn(() => mockAIDraftGeneratorInstance)
  }
}));

// Mock the useMediaQuery hook
jest.mock('../../../hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(() => false), // Default mock return value (false = not matching)
}));

describe('DraftGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the hook mock before each test
    (useMediaQuery as jest.Mock).mockReturnValue(false); 
  });

  it('renders with initial empty state', () => {
    render(<DraftGenerator />);
    
    expect(screen.getByPlaceholderText('What is the purpose of this email?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter the main points to include')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Recipient')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate draft/i })).toBeDisabled();
  });

  it('enables generate button when required fields are filled', () => {
    render(<DraftGenerator />);
    
    const purposeInput = screen.getByPlaceholderText('What is the purpose of this email?');
    
    act(() => {
      fireEvent.change(purposeInput, { target: { value: 'Test purpose' } });
    });

    expect(screen.getByRole('button', { name: /generate draft/i })).toBeEnabled();
  });

  it('generates draft when button is clicked', async () => {
    const onDraftGenerated = jest.fn();
    render(<DraftGenerator onDraftGenerated={onDraftGenerated} />);
    
    const purposeInput = screen.getByPlaceholderText('What is the purpose of this email?');
    const generateButton = screen.getByRole('button', { name: /generate draft/i });
    
    act(() => {
      fireEvent.change(purposeInput, { target: { value: 'Test purpose' } });
    });
    
    act(() => {
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Generated Draft')).toBeInTheDocument();
      expect(screen.getByText('Generated draft content')).toBeInTheDocument();
      expect(onDraftGenerated).toHaveBeenCalled();
    });
  });

  it('handles errors during draft generation', async () => {
    // Mock error case
    const mockError = new Error('Generation failed');
    // Use the mock instance directly
    mockAIDraftGeneratorInstance.generateDraft.mockRejectedValueOnce(mockError);

    const onError = jest.fn();
    render(<DraftGenerator onError={onError} />);
    
    const purposeInput = screen.getByPlaceholderText('What is the purpose of this email?');
    const generateButton = screen.getByRole('button', { name: /generate draft/i });
    
    act(() => {
      fireEvent.change(purposeInput, { target: { value: 'Test purpose' } });
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to generate draft')).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });
});
