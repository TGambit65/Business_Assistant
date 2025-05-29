/**
 * AIEmailAssistant.test.jsx
 * 
 * Tests for the AIEmailAssistant component
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithI18n } from '../../../tests/test-utils';
import AIEmailAssistant from '../AIEmailAssistant';
import { aiEmailService } from '../../../services';

// Mock the AIEmailService
jest.mock('../../../services', () => ({
  aiEmailService: {
    composeContent: jest.fn(),
    rewriteContent: jest.fn(),
    generateReply: jest.fn(),
    summarizeContent: jest.fn(),
    generateDraft: jest.fn()
  }
}));

// Mock the ToastContext
jest.mock('../../../contexts/ToastContext', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn()
  })
}));

describe('AIEmailAssistant', () => {
  const mockProps = {
    onApplyText: jest.fn(),
    onClose: jest.fn(),
    currentContent: 'Current email content',
    selectedText: 'Selected text',
    isReply: false,
    originalEmail: null,
    mode: 'compose'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    aiEmailService.composeContent.mockResolvedValue('Generated compose content');
    aiEmailService.rewriteContent.mockResolvedValue('Generated rewrite content');
    aiEmailService.generateReply.mockResolvedValue('Generated reply content');
    aiEmailService.summarizeContent.mockResolvedValue('Generated summary content');
    aiEmailService.generateDraft.mockResolvedValue({
      content: 'Generated draft content',
      subject: 'Generated subject'
    });
  });
  
  it('renders the component with the correct initial tab', () => {
    renderWithI18n(<AIEmailAssistant {...mockProps} />);
    
    expect(screen.getByText('AI Email Assistant')).toBeInTheDocument();
    expect(screen.getByText('What would you like to write about?')).toBeInTheDocument();
  });
  
  it('changes tab when a tab is clicked', () => {
    renderWithI18n(<AIEmailAssistant {...mockProps} />);
    
    // Click on the Rewrite tab
    fireEvent.click(screen.getByText('Rewrite'));
    
    // Check that the Rewrite tab content is displayed
    expect(screen.getByText('Text to rewrite')).toBeInTheDocument();
  });
  
  it('generates content when the generate button is clicked', async () => {
    renderWithI18n(<AIEmailAssistant {...mockProps} />);
    
    // Fill in the prompt field
    fireEvent.change(screen.getByPlaceholderText('Describe what you want to write about...'), {
      target: { value: 'Test prompt' }
    });
    
    // Click the generate button
    fireEvent.click(screen.getByText('Generate Text'));
    
    // Wait for the content to be generated
    await waitFor(() => {
      expect(aiEmailService.composeContent).toHaveBeenCalledWith({
        prompt: 'Test prompt',
        style: 'professional',
        length: 'medium'
      });
    });
  });
  
  it('applies the generated text when the apply button is clicked', async () => {
    renderWithI18n(<AIEmailAssistant {...mockProps} />);
    
    // Fill in the prompt field
    fireEvent.change(screen.getByPlaceholderText('Describe what you want to write about...'), {
      target: { value: 'Test prompt' }
    });
    
    // Click the generate button
    fireEvent.click(screen.getByText('Generate Text'));
    
    // Wait for the content to be generated
    await waitFor(() => {
      expect(screen.getByText('Generated compose content')).toBeInTheDocument();
    });
    
    // Click the apply button
    fireEvent.click(screen.getByText('Apply to Email'));
    
    // Check that the onApplyText function was called with the generated text
    expect(mockProps.onApplyText).toHaveBeenCalledWith('Generated compose content');
    
    // Check that the onClose function was called
    expect(mockProps.onClose).toHaveBeenCalled();
  });
  
  it('closes the component when the cancel button is clicked', () => {
    renderWithI18n(<AIEmailAssistant {...mockProps} />);
    
    // Click the cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check that the onClose function was called
    expect(mockProps.onClose).toHaveBeenCalled();
  });
  
  it('renders the rewrite tab with the selected text', () => {
    renderWithI18n(<AIEmailAssistant {...mockProps} mode="rewrite" />);
    
    // Check that the Rewrite tab is active
    expect(screen.getByText('Text to rewrite')).toBeInTheDocument();
    
    // Check that the selected text is displayed in the textarea
    expect(screen.getByText('Selected text')).toBeInTheDocument();
  });
  
  it('renders the reply tab with the original email', () => {
    const propsWithOriginalEmail = {
      ...mockProps,
      mode: 'reply',
      originalEmail: {
        subject: 'Original subject',
        body: 'Original body'
      }
    };
    
    renderWithI18n(<AIEmailAssistant {...propsWithOriginalEmail} />);
    
    // Check that the Reply tab is active
    expect(screen.getByText('Reply type')).toBeInTheDocument();
  });
  
  it('renders the summarize tab with the current content', () => {
    renderWithI18n(<AIEmailAssistant {...mockProps} mode="summarize" />);
    
    // Check that the Summarize tab is active
    expect(screen.getByText('Content to summarize')).toBeInTheDocument();
    
    // Check that the current content is displayed in the textarea
    expect(screen.getByText('Current email content')).toBeInTheDocument();
  });
  
  it('renders the draft tab', () => {
    renderWithI18n(<AIEmailAssistant {...mockProps} mode="draft" />);
    
    // Check that the Draft tab is active
    expect(screen.getByText('Email purpose')).toBeInTheDocument();
  });
});
