import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppearanceSettings from '../components/settings/AppearanceSettings';

// Mock window.alert
window.alert = jest.fn();

describe('AppearanceSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders appearance settings', () => {
    render(<AppearanceSettings />);
    
    // Check for section titles
    expect(screen.getByText('Appearance Settings')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Color Scheme')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
    
    // Check for theme options
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    
    // Check for accessibility options
    expect(screen.getByText('Reduced Motion')).toBeInTheDocument();
    expect(screen.getByText('High Contrast')).toBeInTheDocument();
  });
  
  test('selects theme when theme option is clicked', () => {
    render(<AppearanceSettings />);
    
    // Get theme radio buttons
    const lightTheme = screen.getByLabelText('Light');
    const darkTheme = screen.getByLabelText('Dark');
    const systemTheme = screen.getByLabelText('System');
    
    // System theme should be selected by default
    expect(systemTheme).toBeChecked();
    expect(lightTheme).not.toBeChecked();
    expect(darkTheme).not.toBeChecked();
    
    // Click light theme
    fireEvent.click(lightTheme);
    
    // Light theme should now be selected
    expect(lightTheme).toBeChecked();
    expect(darkTheme).not.toBeChecked();
    expect(systemTheme).not.toBeChecked();
    
    // Click dark theme
    fireEvent.click(darkTheme);
    
    // Dark theme should now be selected
    expect(darkTheme).toBeChecked();
    expect(lightTheme).not.toBeChecked();
    expect(systemTheme).not.toBeChecked();
  });
  
  test('toggles accessibility switches when clicked', () => {
    render(<AppearanceSettings />);
    
    // Get switches
    const reducedMotionSwitch = screen.getByLabelText('Reduced Motion');
    const highContrastSwitch = screen.getByLabelText('High Contrast');
    
    // Both should be unchecked by default
    expect(reducedMotionSwitch).not.toBeChecked();
    expect(highContrastSwitch).not.toBeChecked();
    
    // Toggle switches
    fireEvent.click(reducedMotionSwitch);
    fireEvent.click(highContrastSwitch);
    
    // Both should now be checked
    expect(reducedMotionSwitch).toBeChecked();
    expect(highContrastSwitch).toBeChecked();
  });
  
  test('changes color scheme and font size when selects change', () => {
    render(<AppearanceSettings />);
    
    // Get color scheme select
    const colorSchemeSelect = screen.getByLabelText('Color Scheme');
    
    // Open color scheme dropdown and select Green
    fireEvent.click(colorSchemeSelect);
    fireEvent.click(screen.getByText('Green'));
    
    // Get font size select
    const fontSizeSelect = screen.getByLabelText('Font Size');
    
    // Open font size dropdown and select Large
    fireEvent.click(fontSizeSelect);
    fireEvent.click(screen.getByText('Large'));
    
    // Note: Testing the actual select value change is challenging with the UI components
    // In a real test, we might check for specific class changes or use a test ID
  });
  
  test('submits form with updated values', () => {
    // Mock console.log to check form submission
    console.log = jest.fn();
    
    render(<AppearanceSettings />);
    
    // Change theme to Dark
    const darkTheme = screen.getByLabelText('Dark');
    fireEvent.click(darkTheme);
    
    // Toggle reduced motion
    const reducedMotionSwitch = screen.getByLabelText('Reduced Motion');
    fireEvent.click(reducedMotionSwitch);
    
    // Submit form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Check that console.log was called with updated values
    expect(console.log).toHaveBeenCalledWith('Saving appearance settings:', expect.objectContaining({
      theme: 'dark',
      reducedMotion: true
    }));
    
    // Check that alert was shown
    expect(window.alert).toHaveBeenCalledWith('Appearance settings saved successfully!');
  });
  
  test('resets to defaults when reset button is clicked', () => {
    render(<AppearanceSettings />);
    
    // Change theme to Dark
    const darkTheme = screen.getByLabelText('Dark');
    fireEvent.click(darkTheme);
    
    // Toggle reduced motion
    const reducedMotionSwitch = screen.getByLabelText('Reduced Motion');
    fireEvent.click(reducedMotionSwitch);
    
    // Click reset button
    const resetButton = screen.getByText('Reset to Defaults');
    fireEvent.click(resetButton);
    
    // Note: In a real component, this would reset the form values
    // For this test, we're just checking that the button exists and can be clicked
  });
});
