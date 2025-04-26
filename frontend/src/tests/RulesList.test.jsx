import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RulesList from '../components/email/rules/RulesList';

describe('RulesList', () => {
  const mockRules = [
    {
      id: 1,
      name: 'Important clients',
      condition: 'FROM',
      value: 'client1@example.com, client2@example.com',
      action: 'PRIORITY',
      enabled: true
    },
    {
      id: 2,
      name: 'Newsletter filter',
      condition: 'SUBJECT_CONTAINS',
      value: 'newsletter, update, digest',
      action: 'MOVE_TO_FOLDER',
      actionValue: 'Newsletters',
      enabled: true
    },
    {
      id: 3,
      name: 'Vacation auto-reply',
      condition: 'ALL_MESSAGES',
      action: 'AUTO_REPLY',
      actionValue: 'I am currently on vacation and will reply upon my return.',
      enabled: false
    }
  ];
  
  const mockHandlers = {
    onEditRule: jest.fn(),
    onDeleteRule: jest.fn(),
    onToggleRule: jest.fn(),
    onAddRule: jest.fn()
  };
  
  test('renders rules list with correct number of rules', () => {
    render(<RulesList rules={mockRules} {...mockHandlers} />);
    
    // Check for header
    expect(screen.getByText('Email Rules')).toBeInTheDocument();
    
    // Check for rule names
    expect(screen.getByText('Important clients')).toBeInTheDocument();
    expect(screen.getByText('Newsletter filter')).toBeInTheDocument();
    expect(screen.getByText('Vacation auto-reply')).toBeInTheDocument();
  });
  
  test('renders empty state when no rules are provided', () => {
    render(<RulesList rules={[]} {...mockHandlers} />);
    
    expect(screen.getByText('No rules created yet. Click "Add Rule" to create your first rule.')).toBeInTheDocument();
  });
  
  test('calls onAddRule when Add Rule button is clicked', () => {
    render(<RulesList rules={mockRules} {...mockHandlers} />);
    
    fireEvent.click(screen.getByText('Add Rule'));
    
    expect(mockHandlers.onAddRule).toHaveBeenCalledTimes(1);
  });
  
  test('calls onEditRule when edit button is clicked', () => {
    render(<RulesList rules={mockRules} {...mockHandlers} />);
    
    // Find all edit buttons (they have Edit2 icon)
    const editButtons = screen.getAllByRole('button');
    
    // Click the first edit button (for "Important clients")
    fireEvent.click(editButtons[1]); // Index 1 because the first button is "Add Rule"
    
    expect(mockHandlers.onEditRule).toHaveBeenCalledWith(1);
  });
  
  test('calls onDeleteRule when delete button is clicked', () => {
    render(<RulesList rules={mockRules} {...mockHandlers} />);
    
    // Find all delete buttons (they have Trash2 icon)
    const deleteButtons = screen.getAllByRole('button');
    
    // Click the first delete button (for "Important clients")
    fireEvent.click(deleteButtons[2]); // Index 2 because the first buttons are "Add Rule" and Edit
    
    expect(mockHandlers.onDeleteRule).toHaveBeenCalledWith(1);
  });
  
  test('calls onToggleRule when switch is toggled', () => {
    render(<RulesList rules={mockRules} {...mockHandlers} />);
    
    // Find all switches
    const switches = screen.getAllByRole('switch');
    
    // Toggle the first switch (for "Important clients")
    fireEvent.click(switches[0]);
    
    expect(mockHandlers.onToggleRule).toHaveBeenCalledWith(1);
  });
  
  test('displays correct condition text', () => {
    render(<RulesList rules={mockRules} {...mockHandlers} />);
    
    expect(screen.getByText('From: client1@example.com, client2@example.com')).toBeInTheDocument();
    expect(screen.getByText('Subject contains: newsletter, update, digest')).toBeInTheDocument();
    expect(screen.getByText('All messages')).toBeInTheDocument();
  });
  
  test('displays correct action text', () => {
    render(<RulesList rules={mockRules} {...mockHandlers} />);
    
    expect(screen.getByText('Action: Mark as priority')).toBeInTheDocument();
    expect(screen.getByText('Action: Move to folder: Newsletters')).toBeInTheDocument();
    expect(screen.getByText('Action: Send auto-reply')).toBeInTheDocument();
  });
});
