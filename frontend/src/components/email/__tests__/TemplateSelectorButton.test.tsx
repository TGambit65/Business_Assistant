import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithI18n } from '../../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import { TemplateSelectorButton } from '../TemplateSelectorButton';
import { emailTemplateServiceAPI } from '../../../services/EmailTemplateServiceAPI';

// Mock the email template service
jest.mock('../../../services/EmailTemplateServiceAPI');

const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}!',
    content: 'Hello {{name}}, welcome to our platform!',
    category: 'Onboarding',
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    variables: [],
    tags: ['welcome', 'onboarding'],
    permissions: [],
    aiSuggestions: false,
    metadata: {}
  },
  {
    id: '2',
    name: 'Meeting Follow-up',
    subject: 'Follow-up: {{meeting_topic}}',
    content: 'Hi {{recipient_name}}, thank you for the meeting...',
    category: 'Business',
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    variables: [],
    tags: ['meeting', 'follow-up'],
    permissions: [],
    aiSuggestions: false,
    metadata: {}
  }
];

describe('TemplateSelectorButton', () => {
  const mockOnTemplateSelect = jest.fn();
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (emailTemplateServiceAPI.getTemplates as jest.Mock).mockResolvedValue(mockTemplates);
  });

  it('renders the button correctly', () => {
    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    expect(screen.getByText('Use Template')).toBeInTheDocument();
  });

  it('opens the modal when button is clicked', async () => {
    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    const button = screen.getByText('Use Template');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Select a Template')).toBeInTheDocument();
    });
  });

  it('loads and displays templates when modal opens', async () => {
    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    const button = screen.getByText('Use Template');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
      expect(screen.getByText('Meeting Follow-up')).toBeInTheDocument();
    });

    expect(emailTemplateServiceAPI.getTemplates).toHaveBeenCalledWith(mockUserId);
  });

  it('filters templates based on search input', async () => {
    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    const button = screen.getByText('Use Template');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search templates...');
    await userEvent.type(searchInput, 'meeting');

    expect(screen.queryByText('Welcome Email')).not.toBeInTheDocument();
    expect(screen.getByText('Meeting Follow-up')).toBeInTheDocument();
  });

  it('calls onTemplateSelect when a template is selected', async () => {
    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    const button = screen.getByText('Use Template');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    const templateButton = screen.getByText('Welcome Email');
    fireEvent.click(templateButton);

    expect(mockOnTemplateSelect).toHaveBeenCalledWith({
      subject: 'Welcome to {{company}}!',
      content: 'Hello {{name}}, welcome to our platform!'
    });

    // Modal should close after selection
    await waitFor(() => {
      expect(screen.queryByText('Select a Template')).not.toBeInTheDocument();
    });
  });

  it('shows loading state while fetching templates', async () => {
    (emailTemplateServiceAPI.getTemplates as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockTemplates), 100))
    );

    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    const button = screen.getByText('Use Template');
    fireEvent.click(button);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (emailTemplateServiceAPI.getTemplates as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    const button = screen.getByText('Use Template');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('No templates available')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch templates for selection:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('closes modal when cancel button is clicked', async () => {
    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    const button = screen.getByText('Use Template');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Select a Template')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Select a Template')).not.toBeInTheDocument();
    });
  });

  it('closes modal when X button is clicked', async () => {
    renderWithI18n(
      <TemplateSelectorButton 
        userId={mockUserId} 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    const button = screen.getByText('Use Template');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Select a Template')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Select a Template')).not.toBeInTheDocument();
    });
  });

  it('does not render if userId is not provided', () => {
    const { container } = renderWithI18n(
      <TemplateSelectorButton 
        userId="" 
        onTemplateSelect={mockOnTemplateSelect} 
      />
    );

    expect(container.firstChild).toBeNull();
  });
});