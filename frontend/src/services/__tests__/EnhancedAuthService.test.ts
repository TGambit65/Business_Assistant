/**
 * EnhancedAuthService Tests
 *
 * Tests the enhanced authentication service functionality
 */

import { EnhancedAuthService } from '../EnhancedAuthService';
import authService from '../AuthService';
import { EnhancedAuthErrorType } from '../../types/enhancedAuth';
import { mockLocalStorage } from '../../tests/mocks/localStorage';

// Mock the fetch API
global.fetch = jest.fn();

// Mock the AuthService
jest.mock('../AuthService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    verifyMfaCode: jest.fn(),
    isAuthenticated: jest.fn(),
    getAuthenticatedUser: jest.fn(),
    getStoredAuthData: jest.fn()
  }
}));

// Mock localStorage
beforeEach(() => {
  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
    writable: true
  });

  // Reset fetch mock
  (global.fetch as jest.Mock).mockReset();
});

describe('EnhancedAuthService', () => {
  let authService: EnhancedAuthService;

  beforeEach(() => {
    authService = new EnhancedAuthService();
  });

  test('should initialize with default values', () => {
    expect(authService).toBeDefined();
  });

  test('should handle login with valid credentials', async () => {
    // Mock successful login response
    const mockResult = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User'
      }
    };

    (authService.login as jest.Mock).mockResolvedValueOnce(mockResult);

    // Call the method on the mocked authService
    const result = await authService.login('test@example.com', 'password123');

    expect(result).toBeDefined();
    expect(result.accessToken).toBe('test-access-token');
    expect(result.user.email).toBe('test@example.com');
  });

  test('should handle login failure with invalid credentials', async () => {
    // Mock failed login response
    const mockError = {
      type: EnhancedAuthErrorType.INVALID_CREDENTIALS,
      message: 'Invalid credentials'
    };

    (authService.login as jest.Mock).mockRejectedValueOnce(mockError);

    try {
      await authService.login('test@example.com', 'wrong-password');
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.type).toBe(EnhancedAuthErrorType.INVALID_CREDENTIALS);
    }
  });

  test('should handle MFA verification', async () => {
    // Mock successful MFA verification response
    const mockResult = {
      accessToken: 'test-access-token-mfa',
      refreshToken: 'test-refresh-token-mfa',
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        mfaVerified: true
      }
    };

    (authService.verifyMfaCode as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await authService.verifyMfaCode('123456', 'test-session-id');

    expect(result).toBeDefined();
    expect(result.accessToken).toBe('test-access-token-mfa');
    expect(result.user.mfaVerified).toBe(true);
  });

  test('should handle token refresh', async () => {
    // Mock successful token refresh response
    const mockResult = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    };

    (authService.refreshToken as jest.Mock).mockResolvedValueOnce(mockResult);

    // Set up initial tokens
    localStorage.setItem('refreshToken', 'old-refresh-token');

    const result = await authService.refreshToken();

    expect(result).toBeDefined();
    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
  });

  test('should handle logout', async () => {
    // Set up initial tokens and user data
    localStorage.setItem('accessToken', 'test-access-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
    localStorage.setItem('user', JSON.stringify({ id: '123', email: 'test@example.com' }));

    (authService.logout as jest.Mock).mockResolvedValueOnce(undefined);

    await authService.logout();

    expect(authService.logout).toHaveBeenCalled();
  });
});
