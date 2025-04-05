import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IntegrationManager } from '../../services';
import { getCurrentUserId } from '../../utils/storage';
import { useCallback } from 'react'; // Import useCallback
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * Props for the OAuthCallback component
 */
interface OAuthCallbackProps {
  // Optional callback handlers
  onSuccess?: (connectionId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Component to handle OAuth redirects from third-party services.
 * This component extracts the authorization code and state from the URL,
 * validates them, and completes the connection through the IntegrationManager.
 */
const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onSuccess, onError }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Completing authentication...');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [connectionId, setConnectionId] = useState<string | null>(null);

  /**
   * Process the OAuth callback parameters
   */
  const handleCallback = useCallback(async () => {
    try {
      // Parse URL parameters
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      
      // Check for error from OAuth provider
      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        if (onError) onError(new Error(`Authorization failed: ${error}`));
        return;
      }
      
      // Check for missing params
      if (!code || !state) {
        setStatus('error');
        setMessage('Missing required parameters for authentication.');
        if (onError) onError(new Error('Missing required parameters for authentication.'));
        return;
      }
      
      // Get current user ID
      const userId = getCurrentUserId();
      if (!userId) {
        setStatus('error');
        setMessage('User not authenticated. Please log in and try again.');
        if (onError) onError(new Error('User not authenticated.'));
        navigate('/login');
        return;
      }
      
      // Process the callback
      const integrationManager = IntegrationManager.getInstance();
      const connection = await integrationManager.handleAuthCallback(code, state, userId);
      
      // Success
      setStatus('success');
      setMessage(`Successfully connected to ${connection.integrationId}!`);
      setConnectionId(connection.id);
      
      if (onSuccess) onSuccess(connection.id);
      
      // Redirect back to integrations page after 2 seconds
      setTimeout(() => {
        navigate('/settings/integrations');
      }, 2000);
      
    } catch (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${(error as Error).message}`);
      if (onError) onError(error as Error);
      
      // Redirect back to integrations page after 3 seconds
      setTimeout(() => {
        navigate('/settings/integrations');
      }, 3000);
    }
  }, [location, navigate, onError, onSuccess]); // Add dependencies for useCallback

  useEffect(() => {
    handleCallback();
  }, [handleCallback]); // Use the memoized handleCallback as dependency

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="max-w-md w-full rounded-lg border p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Service Connection</h1>
          
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center p-4">
              <Loader size={48} className="animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center p-4">
              <CheckCircle size={48} className="text-green-500 mb-4" />
              <p className="text-xl font-medium">Connected Successfully!</p>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-4">Redirecting you back...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center p-4">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-xl font-medium">Connection Failed</p>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-4">Redirecting you back...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { OAuthCallback }; 