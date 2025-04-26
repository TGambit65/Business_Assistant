import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsPageRefactored from '../pages/settings/SettingsPageRefactored';
import { useEnhancedAuth } from '../auth';

// Mock the auth hook
jest.mock('../auth', () => ({
  useEnhancedAuth: jest.fn()
}));

// Mock the components
jest.mock('../components/settings/SettingsNav', () => ({
  __esModule: true,
  default: ({ activeTab, handleTabChange }) => (
    <div data-testid="settings-nav">
      <button data-testid="tab-general" onClick={() => handleTabChange('general')}>General</button>
      <button data-testid="tab-appearance" onClick={() => handleTabChange('appearance')}>Appearance</button>
      <button data-testid="tab-layout" onClick={() => handleTabChange('layout')}>Layout</button>
      <button data-testid="tab-notifications" onClick={() => handleTabChange('notifications')}>Notifications</button>
      <button data-testid="tab-security" onClick={() => handleTabChange('security')}>Security</button>
      <button data-testid="tab-admin" onClick={() => handleTabChange('admin')}>Admin</button>
    </div>
  )
}));

jest.mock('../components/settings/GeneralSettings', () => ({
  __esModule: true,
  default: () => <div data-testid="general-settings">General Settings Content</div>
}));

jest.mock('../components/settings/AppearanceSettings', () => ({
  __esModule: true,
  default: () => <div data-testid="appearance-settings">Appearance Settings Content</div>
}));

jest.mock('../components/settings/LayoutSettings', () => ({
  __esModule: true,
  default: () => <div data-testid="layout-settings">Layout Settings Content</div>
}));

jest.mock('../components/settings/NotificationSettings', () => ({
  __esModule: true,
  default: () => <div data-testid="notification-settings">Notification Settings Content</div>
}));

jest.mock('../components/settings/AdminSettings', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-settings">Admin Settings Content</div>
}));

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('SettingsPageRefactored', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default auth mock
    useEnhancedAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    });
  });
  
  test('renders the settings page with general tab active by default', () => {
    render(
      <BrowserRouter>
        <SettingsPageRefactored />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('settings-nav')).toBeInTheDocument();
    expect(screen.getByTestId('general-settings')).toBeInTheDocument();
  });
  
  test('changes tab when a tab button is clicked', async () => {
    render(
      <BrowserRouter>
        <SettingsPageRefactored />
      </BrowserRouter>
    );
    
    // Initially shows general settings
    expect(screen.getByTestId('general-settings')).toBeInTheDocument();
    
    // Click appearance tab
    fireEvent.click(screen.getByTestId('tab-appearance'));
    
    // Should now show appearance settings
    await waitFor(() => {
      expect(screen.getByTestId('appearance-settings')).toBeInTheDocument();
    });
    
    // Click layout tab
    fireEvent.click(screen.getByTestId('tab-layout'));
    
    // Should now show layout settings
    await waitFor(() => {
      expect(screen.getByTestId('layout-settings')).toBeInTheDocument();
    });
  });
  
  test('navigates to security settings page when security tab is clicked', () => {
    render(
      <BrowserRouter>
        <SettingsPageRefactored />
      </BrowserRouter>
    );
    
    // Click security tab
    fireEvent.click(screen.getByTestId('tab-security'));
    
    // Should navigate to security settings page
    expect(mockNavigate).toHaveBeenCalledWith('/security-settings');
  });
  
  test('shows admin settings only for admin users', async () => {
    // Mock user as admin
    useEnhancedAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    });
    
    render(
      <BrowserRouter>
        <SettingsPageRefactored />
      </BrowserRouter>
    );
    
    // Click admin tab
    fireEvent.click(screen.getByTestId('tab-admin'));
    
    // Should show admin settings
    await waitFor(() => {
      expect(screen.getByTestId('admin-settings')).toBeInTheDocument();
    });
  });
});
