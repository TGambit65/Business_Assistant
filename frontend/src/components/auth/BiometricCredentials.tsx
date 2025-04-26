/**
 * BiometricCredentials Component
 * 
 * This component handles registration and management of biometric credentials
 * using the Web Authentication API (WebAuthn).
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Fingerprint, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BiometricCredential {
  id: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
}

interface BiometricCredentialsProps {
  onRegisterSuccess?: (message?: string) => void;
  onRegisterError?: (message: string) => void;
  onRemoveSuccess?: (message?: string) => void;
  onRemoveError?: (message: string) => void;
}

const BiometricCredentials: React.FC<BiometricCredentialsProps> = ({
  onRegisterSuccess,
  onRegisterError,
  onRemoveSuccess,
  onRemoveError
}) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<BiometricCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newCredentialName, setNewCredentialName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webAuthnSupported, setWebAuthnSupported] = useState(true);

  // Check for WebAuthn support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWebAuthnSupported(
        window.PublicKeyCredential !== undefined && 
        typeof window.PublicKeyCredential === 'function'
      );
    }
  }, []);

  // Fetch existing credentials on component mount
  useEffect(() => {
    fetchCredentials();
  }, [user]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to fetch the user's credentials
      // For now, we'll use mock data
      const mockCredentials: BiometricCredential[] = [
        {
          id: '1',
          name: 'Work Laptop',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Personal Phone',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setCredentials(mockCredentials);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching biometric credentials:', error);
      setErrorMessage('Failed to load your biometric credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerCredential = async () => {
    if (!newCredentialName.trim()) {
      setErrorMessage('Please provide a name for this device.');
      return;
    }

    setIsRegistering(true);
    setErrorMessage(null);

    try {
      // In a real implementation, this would:
      // 1. Request challenge from the server
      // 2. Create credentials with navigator.credentials.create()
      // 3. Send the response to the server for verification
      
      // Simulate registration success for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newCredential: BiometricCredential = {
        id: Math.random().toString(36).substring(2, 15),
        name: newCredentialName,
        createdAt: new Date().toISOString()
      };
      
      setCredentials(prev => [...prev, newCredential]);
      setNewCredentialName('');
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (error) {
      console.error('Error registering biometric credential:', error);
      setErrorMessage('Failed to register your biometric credential.');
      
      if (onRegisterError) {
        onRegisterError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const removeCredential = async (id: string) => {
    try {
      // In a real implementation, this would call the server to remove the credential
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCredentials(prev => prev.filter(cred => cred.id !== id));
      
      if (onRemoveSuccess) {
        onRemoveSuccess();
      }
    } catch (error) {
      console.error('Error removing biometric credential:', error);
      setErrorMessage('Failed to remove the biometric credential.');
      
      if (onRemoveError) {
        onRemoveError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  if (!webAuthnSupported) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-300">
            Biometric authentication not supported
          </h3>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          Your browser doesn't support the Web Authentication API, which is required for biometric authentication.
          Please use a modern browser like Chrome, Firefox, Safari, or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-300">
              Error
            </h3>
          </div>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* Current devices */}
      <div>
        <h3 className="text-lg font-medium mb-4">Your registered devices</h3>
        
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : credentials.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <ShieldCheck className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No devices registered</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Register a device to enable passwordless sign-in
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((credential) => (
              <Card key={credential.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
                    <Fingerprint className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium">{credential.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Added {new Date(credential.createdAt).toLocaleDateString()}
                      {credential.lastUsed && ` · Last used ${new Date(credential.lastUsed).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeCredential(credential.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                  aria-label={`Remove ${credential.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Register new device */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4">Register a new device</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="credential-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Device name
            </label>
            <input
              id="credential-name"
              type="text"
              className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-700"
              placeholder="e.g., Work Laptop, Personal Phone"
              value={newCredentialName}
              onChange={(e) => setNewCredentialName(e.target.value)}
              disabled={isRegistering}
            />
          </div>
          
          <Button
            onClick={registerCredential}
            disabled={isRegistering || !newCredentialName.trim()}
            className="w-full"
          >
            {isRegistering ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Register device
              </>
            )}
          </Button>
        </div>
        
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          You'll be prompted to use your device's biometric authentication (fingerprint, face recognition, etc.)
          to complete the registration.
        </p>
      </div>
    </div>
  );
};

export default BiometricCredentials; 