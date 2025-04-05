/**
 * Authentication Context
 * 
 * Provides application-wide authentication state management using the enhanced AuthService.
 * Handles user authentication, session persistence, and loading states.
 */

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/AuthService';
import { User, UserPreferences, UserSettings } from '../types/user';
import { AuthResult, AuthError, /* AuthProvider as AuthProviderType, */ AuthErrorType } from '../types/auth'; // Removed unused AuthProviderType
import { isDemoMode } from '../utils/envUtils';

// User roles
export const USER = 'user';
export const MANAGER = 'manager';
export const ADMIN = 'admin';
export const OWNER = 'owner';

// Context state interface
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextState>({
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  login: async () => ({ success: false, error: { type: AuthErrorType.UNKNOWN, message: 'Not implemented' } }),
  signInWithGoogle: async () => ({ success: false, error: { type: AuthErrorType.UNKNOWN, message: 'Not implemented' } }),
  signOut: async () => {},
  clearAuthError: () => {},
  updateUserPreferences: () => {},
  updateUserSettings: () => {},
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 */
export const AuthContextProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const navigate = useNavigate();

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if the user is already authenticated
        const isValid = await authService.validateSession();
        
        if (isValid) {
          // Get the authenticated user
          const currentUser = authService.getAuthenticatedUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error initializing auth state:', err);
        // Clear any invalid auth state
        await authService.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.signInWithEmail(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const authError: AuthError = {
        type: AuthErrorType.UNKNOWN,
        message: err instanceof Error ? err.message : 'Unknown error during login',
        originalError: err instanceof Error ? err : new Error('Unknown error'),
      };
      setError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For demo mode, use a simplified flow
      if (isDemoMode()) {
        console.log('Running in demo mode, using mock Google auth');
      }
      
      const result = await authService.signInWithGoogle();
      
      if (result.success && result.user) {
        setUser(result.user);
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const authError: AuthError = {
        type: AuthErrorType.UNKNOWN,
        message: err instanceof Error ? err.message : 'Unknown error during Google sign-in',
        originalError: err instanceof Error ? err : new Error('Unknown error'),
      };
      setError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      console.error('Error during sign out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear authentication errors
   */
  const clearAuthError = (): void => {
    setError(null);
  };

  /**
   * Update user preferences
   */
  const updateUserPreferences = (preferences: Partial<UserPreferences>): void => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };
    
    setUser(updatedUser);
    
    // In a real implementation, we would save this to the server
    // For now, we'll just update the local storage session
    const session = authService.getStoredAuthData();
    if (session) {
      authService.securelyStoreAuthData({
        ...session,
        user: updatedUser
      });
    }
  };

  /**
   * Update user settings
   */
  const updateUserSettings = (settings: Partial<UserSettings>): void => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      settings: {
        ...user.settings,
        ...settings
      }
    };
    
    setUser(updatedUser);
    
    // In a real implementation, we would save this to the server
    // For now, we'll just update the local storage session
    const session = authService.getStoredAuthData();
    if (session) {
      authService.securelyStoreAuthData({
        ...session,
        user: updatedUser
      });
    }
  };

  // Compute authentication state
  const isAuthenticated = user !== null;

  // Context value
  const contextValue: AuthContextState = {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    signInWithGoogle,
    signOut,
    clearAuthError,
    updateUserPreferences,
    updateUserSettings,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => useContext(AuthContext);

export default AuthContext; 