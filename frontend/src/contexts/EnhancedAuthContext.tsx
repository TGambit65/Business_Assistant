/**
 * Enhanced Authentication Context
 * 
 * Provides application-wide authentication state management using the enhanced AuthService.
 * Handles user authentication, session persistence, MFA, and security features.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EnhancedAuthService } from '../services/EnhancedAuthService';
import { AuthError, AuthErrorType, AuthResult } from '../types/auth';
import { EnhancedAuthErrorType, MFAVerificationOptions } from '../types/enhancedAuth';
import { User, UserPreferences, UserSettings } from '../types/user';
import { getAuthConfig } from '../config/authConfig';
import { isDemoMode } from '../utils/envUtils';

// Context state interface
interface EnhancedAuthContextState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  requiresMfa: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithMicrosoft: () => Promise<AuthResult>;
  signInWithGithub: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  completeMfa: (code: string) => Promise<boolean>;
}

// Create context with default values
const EnhancedAuthContext = createContext<EnhancedAuthContextState>({
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  requiresMfa: false,
  login: async () => ({ success: false, error: { type: AuthErrorType.UNKNOWN, message: 'Not implemented' } }),
  signInWithGoogle: async () => ({ success: false, error: { type: AuthErrorType.UNKNOWN, message: 'Not implemented' } }),
  signInWithMicrosoft: async () => ({ success: false, error: { type: AuthErrorType.UNKNOWN, message: 'Not implemented' } }),
  signInWithGithub: async () => ({ success: false, error: { type: AuthErrorType.UNKNOWN, message: 'Not implemented' } }),
  signOut: async () => {},
  clearAuthError: () => {},
  updateUserPreferences: () => {},
  updateUserSettings: () => {},
  completeMfa: async () => false,
});

// Auth provider props
interface EnhancedAuthProviderProps {
  children: ReactNode;
}

// Enhanced Auth Provider component
export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [requiresMfa, setRequiresMfa] = useState<boolean>(false);
  
  // Create auth service instance
  const authService = new EnhancedAuthService(getAuthConfig());
  
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const currentUser = authService.getAuthenticatedUser();
          setUser(currentUser);
          
          // Check if MFA is required
          if (!isDemoMode() && getAuthConfig().mfaRequired) {
            try {
              // Try to perform enhanced auth to check MFA status
              const result = await authService.performEnhancedAuth({
                mfaRequired: true,
                deviceBinding: true,
                auditLogging: true
              });
              
              // If MFA is required, set the flag
              if (!result.success && result.error?.type === EnhancedAuthErrorType.MFA_REQUIRED) {
                setRequiresMfa(true);
              }
            } catch (err) {
              console.error('Error checking MFA status:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [authService]);
  
  /**
   * Sign in with email and password
   */
  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithEmail(email, password);
      
      if (result.success) {
        setUser(result.user!);
        
        // Check if MFA is required
        if (!isDemoMode() && getAuthConfig().mfaRequired) {
          try {
            // Try to perform enhanced auth to check MFA status
            const enhancedResult = await authService.performEnhancedAuth({
              mfaRequired: true,
              deviceBinding: true,
              auditLogging: true
            });
            
            // If MFA is required, set the flag
            if (!enhancedResult.success && enhancedResult.error?.type === EnhancedAuthErrorType.MFA_REQUIRED) {
              setRequiresMfa(true);
            }
          } catch (err) {
            console.error('Error checking MFA status:', err);
          }
        }
      } else {
        setError(result.error!);
      }
      
      return result;
    } catch (err) {
      const authError: AuthError = {
        type: AuthErrorType.UNKNOWN,
        message: (err as Error).message || 'An unknown error occurred during login'
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
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        setUser(result.user!);
        
        // Check if MFA is required
        if (!isDemoMode() && getAuthConfig().mfaRequired) {
          try {
            // Try to perform enhanced auth to check MFA status
            const enhancedResult = await authService.performEnhancedAuth({
              mfaRequired: true,
              deviceBinding: true,
              auditLogging: true
            });
            
            // If MFA is required, set the flag
            if (!enhancedResult.success && enhancedResult.error?.type === EnhancedAuthErrorType.MFA_REQUIRED) {
              setRequiresMfa(true);
            }
          } catch (err) {
            console.error('Error checking MFA status:', err);
          }
        }
      } else {
        setError(result.error!);
      }
      
      return result;
    } catch (err) {
      const authError: AuthError = {
        type: AuthErrorType.UNKNOWN,
        message: (err as Error).message || 'An unknown error occurred during Google sign-in'
      };
      
      setError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Sign in with Microsoft
   */
  const signInWithMicrosoft = async (): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithMicrosoft();
      
      if (result.success) {
        setUser(result.user!);
        
        // Check if MFA is required
        if (!isDemoMode() && getAuthConfig().mfaRequired) {
          try {
            // Try to perform enhanced auth to check MFA status
            const enhancedResult = await authService.performEnhancedAuth({
              mfaRequired: true,
              deviceBinding: true,
              auditLogging: true
            });
            
            // If MFA is required, set the flag
            if (!enhancedResult.success && enhancedResult.error?.type === EnhancedAuthErrorType.MFA_REQUIRED) {
              setRequiresMfa(true);
            }
          } catch (err) {
            console.error('Error checking MFA status:', err);
          }
        }
      } else {
        setError(result.error!);
      }
      
      return result;
    } catch (err) {
      const authError: AuthError = {
        type: AuthErrorType.UNKNOWN,
        message: (err as Error).message || 'An unknown error occurred during Microsoft sign-in'
      };
      
      setError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Sign in with Github
   */
  const signInWithGithub = async (): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithGithub();
      
      if (result.success) {
        setUser(result.user!);
        
        // Check if MFA is required
        if (!isDemoMode() && getAuthConfig().mfaRequired) {
          try {
            // Try to perform enhanced auth to check MFA status
            const enhancedResult = await authService.performEnhancedAuth({
              mfaRequired: true,
              deviceBinding: true,
              auditLogging: true
            });
            
            // If MFA is required, set the flag
            if (!enhancedResult.success && enhancedResult.error?.type === EnhancedAuthErrorType.MFA_REQUIRED) {
              setRequiresMfa(true);
            }
          } catch (err) {
            console.error('Error checking MFA status:', err);
          }
        }
      } else {
        setError(result.error!);
      }
      
      return result;
    } catch (err) {
      const authError: AuthError = {
        type: AuthErrorType.UNKNOWN,
        message: (err as Error).message || 'An unknown error occurred during Github sign-in'
      };
      
      setError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Sign out
   */
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.signOut();
      setUser(null);
      setRequiresMfa(false);
    } catch (err) {
      console.error('Error signing out:', err);
      setError({
        type: AuthErrorType.UNKNOWN,
        message: (err as Error).message || 'An unknown error occurred during sign-out'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Clear authentication error
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
  
  /**
   * Complete MFA verification
   */
  const completeMfa = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await authService.completeMfaVerification(code);
      
      if (result) {
        setRequiresMfa(false);
      } else {
        setError({
          type: AuthErrorType.INVALID_CREDENTIALS,
          message: 'Invalid verification code'
        });
      }
      
      return result;
    } catch (err) {
      setError({
        type: AuthErrorType.UNKNOWN,
        message: (err as Error).message || 'An unknown error occurred during MFA verification'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Compute authentication state
  const isAuthenticated = user !== null && (!requiresMfa || isDemoMode());

  // Context value
  const contextValue: EnhancedAuthContextState = {
    user,
    isLoading,
    error,
    isAuthenticated,
    requiresMfa,
    login,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithGithub,
    signOut,
    clearAuthError,
    updateUserPreferences,
    updateUserSettings,
    completeMfa,
  };

  return (
    <EnhancedAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useEnhancedAuth = () => useContext(EnhancedAuthContext);
