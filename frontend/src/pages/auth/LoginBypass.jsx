import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

/**
 * Auto-authenticates and redirects to dashboard
 * This is a backup route in case the normal login fails
 */
const LoginBypass = () => {
  const { login } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    const autoLogin = async () => {
      try {
        console.log('Auto-login starting...');
        
        // Store authentication in localStorage first to ensure it's set immediately
        localStorage.setItem('isAuthenticated', 'true');
        
        // Auto-authenticate with demo credentials
        const loginResult = await login('demo@example.com', 'demo123');
        
        if (loginResult && loginResult.success) {
          console.log('Auto-login successful');
          success('Login successful');
          
          // Short timeout to ensure the success message is displayed
          setTimeout(() => {
            // Direct browser navigation - bypass React Router
            window.location.href = '/dashboard';
          }, 300);
        } else {
          console.error('Auto-login failed:', loginResult?.error);
          error('Auto-login failed. Please try manual login.');
          
          // Even if login fails, we'll try to navigate to dashboard since we set isAuthenticated
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      } catch (err) {
        console.error('Auto-login error:', err);
        error('An unexpected error occurred during auto-login.');
        
        // Fallback - attempt direct navigation anyway
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    };

    autoLogin();
  }, [login, success, error]);

  return (
    <div className="flex h-screen items-center justify-center bg-muted dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Auto-Login in progress...</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please wait while we log you in automatically.</p>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <button 
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            localStorage.setItem('isAuthenticated', 'true');
            window.location.href = '/dashboard';
          }}
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LoginBypass; 