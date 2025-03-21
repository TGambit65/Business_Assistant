import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import googleAuthService from '../services/GoogleAuthService';

// User roles in order of permissions (higher index = more permissions)
export const USER_ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin',
  OWNER: 'owner'
};

// Define AI models for email sorting to optimize costs
const AI_MODELS = {
  LITE: 'lite-model', // simple, low-cost model for basic sorting
  STANDARD: 'standard-model', // medium complexity model for general sorting
  ADVANCED: 'advanced-model' // high-end model for complex sorting tasks
};

// Default user data
const defaultUser = {
  id: '',
  name: '',
  email: '',
  role: USER_ROLES.USER,
  avatar: '',
  teams: [],
  permissions: {},
  settings: {
    notifications: {
      email: true,
      push: true
    },
    display: {
      compactMode: false,
      highContrast: false
    }
  }
};

// Create the auth context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if there's a Google token
        if (googleAuthService.isAuthenticated()) {
          // For a real app, we would validate the token and fetch fresh user data
          const googleToken = localStorage.getItem('googleAccessToken');
          try {
            const userProfile = await googleAuthService.fetchUserProfile(googleToken);
            const user = {
              id: userProfile.sub,
              name: userProfile.name,
              email: userProfile.email,
              avatar: userProfile.picture,
              provider: 'google',
              role: USER_ROLES.USER  // Default role, in a real app would come from your backend
            };
            
            setUser(user);
            setIsAuthenticated(true);
            
            // Run automatic email sorting for returning Google users
            sortEmailsAutomatically();
          } catch (error) {
            console.error('Error verifying Google token:', error);
            // Clear invalid token
            localStorage.removeItem('googleAccessToken');
          }
        } else {
          // For demo purposes, check localStorage
          const savedUser = localStorage.getItem('user');
          
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to automatically sort emails using multiple AI models to optimize cost
  const sortEmailsAutomatically = async () => {
    try {
      // This would be an API call to the backend in a real application
      console.log('Starting automatic email sorting...');
      
      // Simulate loading the user's labels and their AI rules
      // In a real app, these would come from the EmailRulesPage settings
      const mockLabels = [
        {
          id: 1,
          name: 'Important',
          aiRules: 'Emails from my boss, with urgent in the subject, or mentioning deadlines',
          isImportant: true,
          removeFromInbox: true
        },
        {
          id: 2,
          name: 'Work',
          aiRules: 'Professional emails related to projects, tasks, and work communications',
          isImportant: false,
          removeFromInbox: false
        },
        {
          id: 3,
          name: 'Personal',
          aiRules: 'Emails from friends, family, and non-work related messages',
          isImportant: false,
          removeFromInbox: true
        },
        {
          id: 4,
          name: 'Finance',
          aiRules: 'Bank statements, invoices, receipts, and payment confirmations',
          isImportant: true,
          removeFromInbox: true
        }
      ];
      
      // Simulate fetching new unsorted emails
      // In a real app, this would be an API call to your email server
      
      // Model selection strategy based on email complexity to optimize cost
      // 1. Simple newsletters, notifications -> LITE model (cheapest)
      // 2. Standard work/personal emails -> STANDARD model
      // 3. Complex emails (financial, legal, etc.) -> ADVANCED model (most expensive)
      
      // For each label, we would:
      // 1. Select the appropriate model based on the label's complexity
      // 2. Apply the label's AI rules using the selected model
      // 3. Sort the emails accordingly
      
      mockLabels.forEach(label => {
        // Select the appropriate model based on the label's characteristics
        let selectedModel;
        
        if (label.name === 'Finance' || label.isImportant) {
          // Use advanced model for financial or important emails
          selectedModel = AI_MODELS.ADVANCED;
        } else if (label.name === 'Work') {
          // Use standard model for work emails
          selectedModel = AI_MODELS.STANDARD;
        } else {
          // Use lite model for other emails to save costs
          selectedModel = AI_MODELS.LITE;
        }
        
        console.log(`Sorting "${label.name}" emails using ${selectedModel}`);
        
        // In a real app, this would make an API call to your AI service
        // passing the selected model, the label rules, and the emails to sort
      });
      
      // This information would be used to show a notification to the user
      localStorage.setItem('lastEmailSort', new Date().toISOString());
      
      console.log('Automatic email sorting completed');
      
      return true;
    } catch (error) {
      console.error('Error during automatic email sorting:', error);
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // This would normally be an API call
      // For demo, we'll mock a successful login
      const user = {
        id: '123',
        email,
        name: 'Demo User',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
      };
      
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Automatically sort emails after successful login
      await sortEmailsAutomatically();
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
      return { 
        success: false, 
        error: error.message || 'Failed to login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-in function
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Call the Google Auth Service
      const authData = await googleAuthService.signInWithGoogle();
      
      // Create a user object from the Google profile
      const user = {
        id: authData.userProfile.sub,
        name: authData.userProfile.name,
        email: authData.userProfile.email,
        avatar: authData.userProfile.picture,
        provider: 'google',
        role: USER_ROLES.USER  // Default role, in a real app would come from your backend
      };
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Automatically sort emails after successful login
      await sortEmailsAutomatically();
      
      return { success: true, user };
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to login with Google');
      return { 
        success: false, 
        error: error.message || 'Failed to login with Google' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    setIsLoading(true);
    try {
      // This would normally be an API call
      // For demo, we'll mock a successful signup
      const user = {
        id: '123',
        name,
        email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
      };
      
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign up' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Check if user is authenticated with Google and sign out
    if (user?.provider === 'google') {
      googleAuthService.signOut();
    }
    
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Update user profile
  const updateUserProfile = (updates) => {
    if (!user) return false;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Only save to localStorage if not a Google user
    if (user.provider !== 'google') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return true;
  };

  // Update user settings
  const updateUserSettings = (settings) => {
    if (!user) return false;
    
    const updatedUser = { 
      ...user,
      settings: {
        ...user.settings,
        ...settings
      }
    };
    
    setUser(updatedUser);
    
    // Only save to localStorage if not a Google user
    if (user.provider !== 'google') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return true;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Owner has all permissions
    if (user.role === USER_ROLES.OWNER) return true;
    
    // Check specific permissions
    return user.permissions?.[permission] === true;
  };

  // Check if user has a role at least as high as the specified role
  const checkRole = (minimumRole) => {
    if (!user) return false;
    
    const roleValues = {
      [USER_ROLES.USER]: 1,
      [USER_ROLES.MANAGER]: 2,
      [USER_ROLES.ADMIN]: 3,
      [USER_ROLES.OWNER]: 4
    };
    
    return roleValues[user.role] >= roleValues[minimumRole];
  };

  // Auth context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateUserProfile,
    updateUserSettings,
    hasPermission,
    checkRole,
    sortEmailsAutomatically,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 