/**
 * Authentication Integration Component
 * 
 * Demonstrates how to integrate the enhanced authentication system with the existing demo mode.
 */

import React, { useEffect, useState } from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { isDemoMode } from '../../utils/envUtils';
import MFAVerification from './MFAVerification';
import LoadingSpinner from '../common/LoadingSpinner';

interface AuthIntegrationProps {
  children: React.ReactNode;
}

const AuthIntegration: React.FC<AuthIntegrationProps> = ({ children }) => {
  const { isAuthenticated, requiresMfa, isLoading } = useEnhancedAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // In a real implementation, this might perform additional initialization
        // For now, we'll just set the initialized flag
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing authentication:', err);
        setIsInitialized(true); // Still mark as initialized to avoid blocking the UI
      }
    };
    
    initializeAuth();
  }, []);
  
  // Show loading spinner while initializing
  if (!isInitialized || isLoading) {
    return <LoadingSpinner message="Initializing authentication..." />;
  }
  
  // If in demo mode, skip MFA
  if (isDemoMode()) {
    return <>{children}</>;
  }
  
  // If authenticated but MFA is required, show MFA verification
  if (isAuthenticated && requiresMfa) {
    return <MFAVerification />;
  }
  
  // Render children if authenticated and MFA requirements are met
  return <>{children}</>;
};

export default AuthIntegration;
