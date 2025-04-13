import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DraftGeneratorPageRefactored from '../pages/email/DraftGeneratorPageRefactored';

// Mock the toast context
jest.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}));

// Mock the components
jest.mock('../components/email/draft/BasicInfoForm', () => ({
  __esModule: true,
  default: () => <div data-testid="basic-info-form">Basic Info Form</div>
}));

jest.mock('../components/email/draft/DetailsForm', () => ({
  __esModule: true,
  default: () => <div data-testid="details-form">Details Form</div>
}));

jest.mock('../components/email/draft/DraftPreview', () => ({
  __esModule: true,
  default: ({ onSave, onSend }) => (
    <div data-testid="draft-preview">
      Draft Preview
      <button data-testid="save-draft-button" onClick={() => onSave({ subject: 'Test', content: 'Test content' })}>
        Save Draft
      </button>
      <button data-testid="send-draft-button" onClick={() => onSend({ subject: 'Test', content: 'Test content' })}>
        Send Draft
      </button>
    </div>
  )
}));

// Mock the DraftFormProvider
jest.mock('../contexts/DraftFormContext', () => ({
  DraftFormProvider: ({ children }) => <div data-testid="draft-form-provider">{children}</div>,
  useDraftForm: () => ({
    formData: {
      recipientType: 'colleague',
      purpose: 'update',
      tone: 'professional',
      subject: 'Test Subject',
      keyPoints: 'Test key points',
      formality: 'neutral'
    },
    updateField: jest.fn(),
    updateFields: jest.fn(),
    resetForm: jest.fn()
  })
}));

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the Tabs component
jest.mock('../components/ui/tabs', () => ({
  Tabs: ({ children }) => <div data-testid="tabs-container">{children}</div>,
  TabsContent: ({ children, value }) => <div data-testid={`tab-content-${value}`}>{children}</div>,
  TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }) => <button data-testid={`tab-${value}`}>{children}</button>
}));

describe('DraftGeneratorPageRefactored', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the draft generator page with basic info tab active by default', () => {
    render(
      <BrowserRouter>
        <DraftGeneratorPageRefactored />
      </BrowserRouter>
    );

    expect(screen.getByText('Email Draft Generator')).toBeInTheDocument();
    expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();
    expect(screen.getByTestId('draft-form-provider')).toBeInTheDocument();
  });

  test('navigates to inbox when send button is clicked', async () => {
    render(
      <BrowserRouter>
        <DraftGeneratorPageRefactored />
      </BrowserRouter>
    );

    // Find and click the send button in the preview tab
    const sendButton = screen.getByTestId('send-draft-button');
    fireEvent.click(sendButton);

    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/inbox');
  });

  test('shows success message when save button is clicked', async () => {
    // Mock console.log to check if it was called
    console.log = jest.fn();

    render(
      <BrowserRouter>
        <DraftGeneratorPageRefactored />
      </BrowserRouter>
    );

    // Find and click the save button in the preview tab
    const saveButton = screen.getByTestId('save-draft-button');
    fireEvent.click(saveButton);

    // Check that console.log was called with the correct message
    expect(console.log).toHaveBeenCalledWith('Saving draft:', expect.any(Object));
  });

  test('shows AI suggestions when AI button is clicked', async () => {
    // Mock console.log to check if it was called
    console.log = jest.fn();

    render(
      <BrowserRouter>
        <DraftGeneratorPageRefactored />
      </BrowserRouter>
    );

    // Find and click the AI suggestions button
    const aiButton = screen.getByText('AI Suggestions');
    fireEvent.click(aiButton);

    // Check that console.log was called with the correct message
    expect(console.log).toHaveBeenCalledWith('Generating AI suggestions');
  });
});
