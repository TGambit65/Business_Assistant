import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';
import { isDemoMode } from '../utils/envUtils';

/**
 * Custom hook for handling database container auto-login
 * 
 * This hook detects if the application is running in a database container environment
 * and performs auto-login if needed.
 */
export default function useContainerLogin() {
  const { signInDemo } = useEnhancedAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [usingDatabaseContainer, setUsingDatabaseContainer] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check if the app is running in a database container environment
  useEffect(() => {
    const checkDatabaseContainer = async () => {
      try {
        const containerId = localStorage.getItem('db_container_id');
        const databaseName = localStorage.getItem('database_name');
        const isUsingDb1 = containerId === '230065f663b90b63ac669e708144a92ae6b427c7703dcdcc546589fdc702287a' ||
                           databaseName === 'db-1';

        setUsingDatabaseContainer(isUsingDb1);

        // Only attempt auto-login if using the database container, in demo mode,
        // and hasn't attempted auto-login yet
        if (isUsingDb1 && isDemoMode() && !autoLoginAttempted && !isLoading && signInDemo) {
          setAutoLoginAttempted(true);
          setIsLoading(true);
          
          try {
            console.log('Auto-login for database container db-1');
            const result = await signInDemo();

            if (result && result.success) {
              localStorage.setItem('isAuthenticated', 'true');
              setSuccess(true);
            } else {
              throw new Error(result?.error?.message || 'Unknown error during database login');
            }
          } catch (err) {
            console.error('Auto-login error:', err);
            setError(err.message || 'Error during auto-login with database container');
          } finally {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error checking database container:', err);
        setError(err.message || 'Error checking database container');
        setIsLoading(false);
      }
    };

    checkDatabaseContainer();
  }, [signInDemo, autoLoginAttempted, isLoading]);

  // Manual login function for UI buttons
  const handleContainerLogin = async () => {
    if (isLoading || !signInDemo) return;
    
    setIsLoading(true);
    setError(null);
    console.log('Manual login for database container db-1');

    try {
      const result = await signInDemo();

      if (result && result.success) {
        localStorage.setItem('isAuthenticated', 'true');
        setSuccess(true);
        return true;
      } else {
        throw new Error(result?.error?.message || 'Unknown error during database login');
      }
    } catch (err) {
      console.error('Manual container login error:', err);
      setError(err.message || 'Error during login with database container');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    usingDatabaseContainer,
    error,
    success,
    handleContainerLogin
  };
}