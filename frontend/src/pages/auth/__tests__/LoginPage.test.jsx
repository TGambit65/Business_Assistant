/**
 * LoginPage Tests
 *
 * Tests the login page component functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { useEnhancedAuth } from '../../../auth';
import { useToast } from '../../../contexts/ToastContext';
import { useTheme } from '../../../contexts/NewThemeContext';

// Mock the auth hook
jest.mock('../../../auth', () => ({
  useEnhancedAuth: jest.fn()
}));

// Mock the toast context
jest.mock('../../../contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

// Mock the theme context
jest.mock('../../../contexts/NewThemeContext', () => ({
  useTheme: jest.fn()
}));

describe('LoginPage', () => {
  // Setup default mocks
  const mockLogin = jest.fn();
  const mockSignInWithGoogle = jest.fn();
  const mockRequiresMfa = jest.fn();
  const mockSignInDemo = jest.fn();
  const mockSuccess = jest.fn();
  const mockError = jest.fn();
  const mockInfo = jest.fn();
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup auth hook mock
    useEnhancedAuth.mockReturnValue({
      login: mockLogin,
      signInWithGoogle: mockSignInWithGoogle,
      requiresMfa: mockRequiresMfa,
      signInDemo: mockSignInDemo
    });

    // Setup toast context mock
    useToast.mockReturnValue({
      success: mockSuccess,
      error: mockError,
      info: mockInfo
    });

    // Setup theme context mock
    useTheme.mockReturnValue({
      setTheme: mockSetTheme,
      isDarkMode: false
    });
  });

  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Check that important elements are rendered
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  test('calls login function with correct credentials', async () => {
    // Mock successful login
    mockLogin.mockResolvedValueOnce({ user: { email: 'test@example.com' } });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    // Check that login was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('shows error message on login failure', async () => {
    // Mock login failure
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong-password' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    // Check that error toast was shown
    await waitFor(() => {
      expect(mockError).toHaveBeenCalled();
    });
  });

  test('applies login theme on mount', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Check that the theme was set
    expect(mockSetTheme).toHaveBeenCalledWith('loginTheme');
  });
});
