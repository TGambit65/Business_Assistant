import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import useOfflineStorage from '../hooks/useOfflineStorage';
import useOnlineStatus from '../hooks/useOnlineStatus';

// Mock the online status hook
jest.mock('../hooks/useOnlineStatus', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock the offline storage hook
jest.mock('../hooks/useOfflineStorage', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Offline Mode Functionality', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementation for online status hook
    useOnlineStatus.mockImplementation(() => ({
      isOnline: true,
      checking: false,
      connectionQuality: 'good',
      retry: jest.fn()
    }));
    
    // Default mock implementation for offline storage hook
    useOfflineStorage.mockImplementation(() => ({
      isReady: true,
      saveData: jest.fn().mockResolvedValue(true),
      getData: jest.fn().mockResolvedValue({ id: 1, data: 'test' }),
      deleteData: jest.fn().mockResolvedValue(true),
      getAllData: jest.fn().mockResolvedValue([{ id: 1, data: 'test' }]),
      addItem: jest.fn().mockResolvedValue(true),
      getItem: jest.fn().mockResolvedValue({ id: 1, data: 'test' }),
      updateItem: jest.fn().mockResolvedValue(true),
      removeItem: jest.fn().mockResolvedValue(true),
      getAllItems: jest.fn().mockResolvedValue([{ id: 1, data: 'test' }])
    }));
  });
  
  test('NetworkStatus component shows offline status correctly', async () => {
    // Mock offline status
    useOnlineStatus.mockImplementation(() => ({
      isOnline: false,
      checking: false,
      connectionQuality: 'none',
      retry: jest.fn()
    }));
    
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });
  
  test('Inbox page shows cached emails when offline', async () => {
    // Mock offline status
    useOnlineStatus.mockImplementation(() => ({
      isOnline: false,
      checking: false,
      connectionQuality: 'none',
      retry: jest.fn()
    }));
    
    // Mock offline storage with some emails
    const mockEmails = [
      {
        id: '1',
        subject: 'Offline Test Email',
        sender: 'test@example.com',
        preview: 'This is a test email for offline mode',
        date: new Date().toISOString(),
        read: false
      }
    ];
    
    useOfflineStorage.mockImplementation(() => ({
      isReady: true,
      getAllItems: jest.fn().mockResolvedValue(mockEmails)
    }));
    
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Offline Test Email')).toBeInTheDocument();
    });
  });
  
  test('Compose page saves draft when offline', async () => {
    // Mock offline status
    useOnlineStatus.mockImplementation(() => ({
      isOnline: false,
      checking: false,
      connectionQuality: 'none',
      retry: jest.fn()
    }));
    
    // Mock offline storage
    const addItemMock = jest.fn().mockResolvedValue(true);
    useOfflineStorage.mockImplementation(() => ({
      isReady: true,
      addItem: addItemMock
    }));
    
    render(
      <MemoryRouter initialEntries={['/compose']}>
        <App />
      </MemoryRouter>
    );
    
    // Fill out the form
    await waitFor(() => {
      screen.getByLabelText(/to/i);
    });
    
    await act(async () => {
      userEvent.type(screen.getByLabelText(/to/i), 'recipient@example.com');
      userEvent.type(screen.getByLabelText(/subject/i), 'Offline Draft');
      userEvent.type(screen.getByLabelText(/message/i), 'This is an offline draft');
    });
    
    // Click save draft
    await act(async () => {
      userEvent.click(screen.getByText(/save draft/i));
    });
    
    // Verify draft was saved
    await waitFor(() => {
      expect(addItemMock).toHaveBeenCalled();
      expect(screen.getByText(/draft saved/i)).toBeInTheDocument();
    });
  });
  
  test('Settings page works offline', async () => {
    // Mock offline status
    useOnlineStatus.mockImplementation(() => ({
      isOnline: false,
      checking: false,
      connectionQuality: 'none',
      retry: jest.fn()
    }));
    
    // Mock offline storage with settings
    const mockSettings = {
      notifications: true,
      darkMode: false,
      language: 'en'
    };
    
    const getItemMock = jest.fn().mockResolvedValue({ data: mockSettings });
    const updateItemMock = jest.fn().mockResolvedValue(true);
    
    useOfflineStorage.mockImplementation(() => ({
      isReady: true,
      getItem: getItemMock,
      updateItem: updateItemMock
    }));
    
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>
    );
    
    // Verify settings loaded
    await waitFor(() => {
      expect(getItemMock).toHaveBeenCalledWith('userSettings');
    });
    
    // Change a setting
    await act(async () => {
      const darkModeCheckbox = screen.getByLabelText(/dark mode/i);
      userEvent.click(darkModeCheckbox);
    });
    
    // Save settings
    await act(async () => {
      userEvent.click(screen.getByText(/save settings/i));
    });
    
    // Verify settings were saved
    await waitFor(() => {
      expect(updateItemMock).toHaveBeenCalled();
      expect(screen.getByText(/settings saved/i)).toBeInTheDocument();
    });
  });
}); 