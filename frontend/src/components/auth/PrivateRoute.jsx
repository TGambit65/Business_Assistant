import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * PrivateRoute component to protect routes that require authentication
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, allow access to the protected route
  return children;
};

export default PrivateRoute; 