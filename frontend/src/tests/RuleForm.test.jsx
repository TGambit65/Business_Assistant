import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RuleForm from '../components/email/rules/RuleForm';

describe('RuleForm', () => {
  const mockRule = {
    name: 'Test Rule',
    condition: 'FROM',
    value: 'test@example.com',
    action: 'PRIORITY',
    actionValue: '',
    enabled: true
  };
  
  const mockFolders = [
    { id: 1, name: 'Inbox' },
    { id: 2, name: 'Archive' },
    { id: 3, name: 'Newsletters' }
  ];
  
  const mockLabels = [
    { id: 1, name: 'Important' },
    { id: 2, name: 'Work' },
    { id: 3, name: 'Personal' }
  ];
  
  const mockHandlers = {
    onChange: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders form with correct title for new rule', () => {
    render(
      <RuleForm
        rule={mockRule}
        isEditing={false}
        folders={mockFolders}
        labels={mockLabels}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('Create New Rule')).toBeInTheDocument();
    expect(screen.getByText('Create Rule')).toBeInTheDocument();
  });
  
  test('renders form with correct title for editing rule', () => {
    render(
      <RuleForm
        rule={mockRule}
        isEditing={true}
        folders={mockFolders}
        labels={mockLabels}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('Edit Rule')).toBeInTheDocument();
    expect(screen.getByText('Update Rule')).toBeInTheDocument();
  });
  
  test('calls onChange when input values change', () => {
    render(
      <RuleForm
        rule={mockRule}
        isEditing={false}
        folders={mockFolders}
        labels={mockLabels}
        {...mockHandlers}
      />
    );
    
    // Change rule name
    const nameInput = screen.getByLabelText('Rule Name');
    fireEvent.change(nameInput, { target: { value: 'New Rule Name' } });
    
    expect(mockHandlers.onChange).toHaveBeenCalledWith({
      ...mockRule,
      name: 'New Rule Name'
    });
  });
  
  test('calls onSave when form is submitted', () => {
    render(
      <RuleForm
        rule={mockRule}
        isEditing={false}
        folders={mockFolders}
        labels={mockLabels}
        {...mockHandlers}
      />
    );
    
    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockHandlers.onSave).toHaveBeenCalledTimes(1);
  });
  
  test('calls onCancel when cancel button is clicked', () => {
    render(
      <RuleForm
        rule={mockRule}
        isEditing={false}
        folders={mockFolders}
        labels={mockLabels}
        {...mockHandlers}
      />
    );
    
    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
  });
  
  test('shows condition value input for appropriate conditions', () => {
    render(
      <RuleForm
        rule={mockRule}
        isEditing={false}
        folders={mockFolders}
        labels={mockLabels}
        {...mockHandlers}
      />
    );
    
    // FROM condition should show value input
    expect(screen.getByLabelText('Email Address(es)')).toBeInTheDocument();
    
    // Change to SUBJECT_CONTAINS
    const conditionSelect = screen.getByLabelText('Condition');
    fireEvent.click(conditionSelect);
    fireEvent.click(screen.getByText('Subject Contains'));
    
    // Should now show Keywords input
    expect(screen.getByLabelText('Keywords')).toBeInTheDocument();
  });
  
  test('shows appropriate action value input based on action', () => {
    const ruleWithMoveAction = {
      ...mockRule,
      action: 'MOVE_TO_FOLDER',
      actionValue: 'Inbox'
    };
    
    render(
      <RuleForm
        rule={ruleWithMoveAction}
        isEditing={false}
        folders={mockFolders}
        labels={mockLabels}
        {...mockHandlers}
      />
    );
    
    // Should show folder select
    expect(screen.getByLabelText('Folder')).toBeInTheDocument();
    
    // Change to APPLY_LABEL
    const actionSelect = screen.getByLabelText('Action');
    fireEvent.click(actionSelect);
    fireEvent.click(screen.getByText('Apply Label'));
    
    // Should now show label select
    expect(screen.getByLabelText('Label')).toBeInTheDocument();
    
    // Change to AUTO_REPLY
    fireEvent.click(actionSelect);
    fireEvent.click(screen.getByText('Send Auto-Reply'));
    
    // Should now show auto-reply textarea
    expect(screen.getByLabelText('Auto-Reply Message')).toBeInTheDocument();
    
    // Change to FORWARD
    fireEvent.click(actionSelect);
    fireEvent.click(screen.getByText('Forward'));
    
    // Should now show forward email input
    expect(screen.getByLabelText('Forward To')).toBeInTheDocument();
  });
});
