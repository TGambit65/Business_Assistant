import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BasicInfoForm from '../components/email/draft/BasicInfoForm';

// Mock the useDraftForm hook
jest.mock('../contexts/DraftFormContext', () => ({
  useDraftForm: () => ({
    formData: {
      recipientType: 'colleague',
      purpose: 'update',
      tone: 'professional',
      subject: 'Test Subject',
      keyPoints: 'Test key points',
      formality: 'neutral',
      originalSender: '',
      originalSubject: '',
      originalContent: '',
      senderName: 'John Doe',
      senderRole: 'Manager'
    },
    updateField: jest.fn()
  })
}));

// Mock the UI components
jest.mock('../components/ui/label', () => ({
  Label: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>
}));

jest.mock('../components/ui/input', () => ({
  Input: ({ id, name, value, onChange, placeholder }) => (
    <input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid={id}
    />
  )
}));

jest.mock('../components/ui/textarea', () => ({
  Textarea: ({ id, name, value, onChange, placeholder, rows }) => (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      data-testid={id}
    />
  )
}));

jest.mock('../components/ui/select', () => ({
  Select: ({ children, value, onValueChange }) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange && onValueChange('new-value')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children, id }) => <div data-testid={id}>{children}</div>,
  SelectValue: ({ placeholder }) => <div>{placeholder}</div>
}));

describe('BasicInfoForm', () => {
  test('renders the form with correct fields', () => {
    render(<BasicInfoForm />);

    // Check for form fields
    expect(screen.getByLabelText('Recipient Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Purpose')).toBeInTheDocument();
    expect(screen.getByLabelText('Tone')).toBeInTheDocument();
    expect(screen.getByLabelText('Formality Level')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Key Points')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Role/Title')).toBeInTheDocument();
  });

  test('shows original email fields when purpose is reply', () => {
    // Update the mock to set purpose to reply
    jest.mock('../contexts/DraftFormContext', () => ({
      useDraftForm: () => ({
        formData: {
          recipientType: 'colleague',
          purpose: 'reply',
          tone: 'professional',
          subject: 'Test Subject',
          keyPoints: 'Test key points',
          formality: 'neutral',
          originalSender: 'Jane Smith',
          originalSubject: 'Original Subject',
          originalContent: 'Original content',
          senderName: 'John Doe',
          senderRole: 'Manager'
        },
        updateField: jest.fn()
      })
    }), { virtual: true });

    render(<BasicInfoForm />);

    // Check for original email fields
    expect(screen.getByLabelText('Original Sender')).toBeInTheDocument();
    expect(screen.getByLabelText('Original Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Original Content')).toBeInTheDocument();
  });

  test('calls updateField when input values change', () => {
    const mockUpdateField = jest.fn();

    // Update the mock to provide our mock function
    jest.mock('../contexts/DraftFormContext', () => ({
      useDraftForm: () => ({
        formData: {
          recipientType: 'colleague',
          purpose: 'update',
          tone: 'professional',
          subject: 'Test Subject',
          keyPoints: 'Test key points',
          formality: 'neutral',
          originalSender: '',
          originalSubject: '',
          originalContent: '',
          senderName: 'John Doe',
          senderRole: 'Manager'
        },
        updateField: mockUpdateField
      })
    }), { virtual: true });

    render(<BasicInfoForm />);

    // Find the subject input and change its value
    const subjectInput = screen.getByTestId('subject');
    fireEvent.change(subjectInput, { target: { value: 'New Subject', name: 'subject' } });

    // Check that updateField was called with the correct arguments
    expect(mockUpdateField).toHaveBeenCalledWith('subject', 'New Subject');
  });
});
