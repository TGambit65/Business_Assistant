/**
 * Secure Route Component
 * 
 * A route wrapper that enforces authentication and MFA requirements.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import MFAVerification from './MFAVerification';
import LoadingSpinner from '../common/LoadingSpinner';

interface SecureRouteProps {
  children: React.ReactNode;
  requireMfa?: boolean;
}

const SecureRoute: React.FC<SecureRouteProps> = ({ 
  children, 
  requireMfa = false 
}) => {
  const { isAuthenticated, isLoading, requiresMfa } = useEnhancedAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Show MFA verification if required
  if (requireMfa && requiresMfa) {
    return <MFAVerification />;
  }
  
  // Render children if authenticated and MFA requirements are met
  return <>{children}</>;
};

export default SecureRoute;
