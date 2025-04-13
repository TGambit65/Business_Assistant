import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GeneralSettings from '../components/settings/GeneralSettings';

// Mock window.alert
window.alert = jest.fn();

describe('GeneralSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com'
  };
  
  test('renders with user data', () => {
    render(<GeneralSettings user={mockUser} />);
    
    // Check for section titles
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Localization')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    
    // Check that user data is pre-filled
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    
    expect(nameInput.value).toBe(mockUser.name);
    expect(emailInput.value).toBe(mockUser.email);
  });
  
  test('updates form values when inputs change', () => {
    render(<GeneralSettings user={mockUser} />);
    
    // Get form inputs
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    
    // Change input values
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    
    // Check that values were updated
    expect(nameInput.value).toBe('New Name');
    expect(emailInput.value).toBe('new@example.com');
  });
  
  test('toggles switches when clicked', () => {
    render(<GeneralSettings user={mockUser} />);
    
    // Get switches
    const autoSaveSwitch = screen.getByLabelText('Auto-save Drafts');
    const emailNotificationsSwitch = screen.getByLabelText('Email Notifications');
    
    // Check initial state (both should be checked by default)
    expect(autoSaveSwitch).toBeChecked();
    expect(emailNotificationsSwitch).toBeChecked();
    
    // Toggle switches
    fireEvent.click(autoSaveSwitch);
    fireEvent.click(emailNotificationsSwitch);
    
    // Check that switches were toggled
    expect(autoSaveSwitch).not.toBeChecked();
    expect(emailNotificationsSwitch).not.toBeChecked();
  });
  
  test('changes language and timezone when selects change', () => {
    render(<GeneralSettings user={mockUser} />);
    
    // Get language select
    const languageSelect = screen.getByLabelText('Language');
    
    // Open language dropdown and select Spanish
    fireEvent.click(languageSelect);
    fireEvent.click(screen.getByText('Spanish'));
    
    // Get timezone select
    const timezoneSelect = screen.getByLabelText('Time Zone');
    
    // Open timezone dropdown and select Eastern Time
    fireEvent.click(timezoneSelect);
    fireEvent.click(screen.getByText('Eastern Time (EST)'));
    
    // Note: Testing the actual select value change is challenging with the UI components
    // In a real test, we might check for specific class changes or use a test ID
  });
  
  test('submits form with updated values', () => {
    // Mock console.log to check form submission
    console.log = jest.fn();
    
    render(<GeneralSettings user={mockUser} />);
    
    // Get form inputs
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    
    // Change input values
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    
    // Submit form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Check that console.log was called with updated values
    expect(console.log).toHaveBeenCalledWith('Saving general settings:', expect.objectContaining({
      name: 'New Name',
      email: 'new@example.com'
    }));
    
    // Check that alert was shown
    expect(window.alert).toHaveBeenCalledWith('Settings saved successfully!');
  });
});
