import React, { useState, useEffect } from 'react';
import { securityManager } from '../../security';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallerProps {
  children?: React.ReactNode;
  onInstallSuccess?: () => void;
  onInstallFailure?: (error: Error) => void;
}

const PWAInstaller: React.FC<PWAInstallerProps> = ({ 
  children,
  onInstallSuccess,
  onInstallFailure
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installable, setInstallable] = useState(false);
  const [installationInProgress, setInstallationInProgress] = useState(false);
  const [installationStatus, setInstallationStatus] = useState<'idle' | 'verifying' | 'requesting' | 'validating' | 'installing' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Store the event for later use, but don't prevent default
      // Only set as installable if not already running standalone
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        // We're commenting out e.preventDefault() as it prevents the banner from showing
        // e.preventDefault(); 
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Update UI to notify the user they can install the PWA
        setInstallable(true);
        console.log('PWA is installable');
      } else {
        console.log('PWA is installable but already running standalone.');
      }
    };

    // Check if app is already installed
    const checkAppInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('PWA is already installed');
        setInstallable(false);
      }
    };

    // Listen for installation completion
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setInstallable(false);
      setInstallationStatus('complete');
      
      if (onInstallSuccess) {
        onInstallSuccess();
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    checkAppInstalled();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstallSuccess]);

  /**
   * Verifies the installation source to prevent malicious prompts
   */
  const verifyInstallationSource = async (): Promise<boolean> => {
    setInstallationStatus('verifying');
    try {
      // Check if we have a valid deferred prompt
      if (!deferredPrompt) {
        throw new Error('No installation prompt available');
      }
      
      // Verify the origin of the installation
      const currentOrigin = window.location.origin;
      const manifestLink = document.querySelector('link[rel="manifest"]');
      
      if (!manifestLink) {
        throw new Error('No manifest found');
      }
      
      // Fetch and validate the manifest file
      const manifestUrl = new URL(
        manifestLink.getAttribute('href') || '/manifest.json',
        currentOrigin
      ).toString();
      
      console.log(`[Test Debug] Fetching manifest: ${manifestUrl}`); // Add debug log
      const manifestResponse = await fetch(manifestUrl);
      console.log(`[Test Debug] Manifest response:`, manifestResponse); // Add debug log

      if (!manifestResponse.ok) {
        throw new Error('Failed to fetch manifest');
      }
      
      const manifest = await manifestResponse.json();
      
      // Validate required manifest fields
      if (!manifest.name || !manifest.icons || !manifest.start_url) {
        throw new Error('Invalid manifest: missing required fields');
      }
      
      // Validate service worker registration
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`[Test Debug] SW Registrations:`, registrations); // Add debug log
        if (registrations.length === 0) {
          throw new Error('No service worker registered');
        }
      } else {
        throw new Error('Service workers not supported in this browser');
      }
      
      return true;
    } catch (error) {
      console.error('Installation source verification failed:', error);
      setErrorMessage((error as Error).message);
      setInstallationStatus('error');
      
      if (onInstallFailure) {
        onInstallFailure(error as Error);
      }
      
      return false;
    }
  };

  /**
   * Requests user consent for installation
   */
  const requestUserConsent = async (): Promise<boolean> => {
    setInstallationStatus('requesting');
    try {
      if (!deferredPrompt) {
        throw new Error('No installation prompt available');
      }
      
      // Show the installation prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      
      // Reset the deferred prompt variable
      setDeferredPrompt(null);
      
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('User consent request failed:', error);
      setErrorMessage((error as Error).message);
      setInstallationStatus('error');
      
      if (onInstallFailure) {
        onInstallFailure(error as Error);
      }
      
      return false;
    }
  };

  /**
   * Validates required permissions for the PWA
   */
  const validatePermissions = async (): Promise<boolean> => {
    setInstallationStatus('validating');
    try {
      // Check for necessary permissions
      const requiredPermissions = ['notifications'];
      
      // For browsers that support the permissions API
      if ('permissions' in navigator) {
        for (const permission of requiredPermissions) {
          try {
            // @ts-ignore - TypeScript doesn't recognize the permissions API
            const status = await navigator.permissions.query({ name: permission });
            if (status.state === 'denied') {
              console.warn(`Permission '${permission}' is denied`);
              // We continue anyway, as permissions can be granted later
            }
          } catch (permError) {
            console.warn(`Could not query permission '${permission}':`, permError);
            // Continue anyway as some browsers might not support querying all permission types
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Permission validation failed:', error);
      setErrorMessage((error as Error).message);
      setInstallationStatus('error');
      
      if (onInstallFailure) {
        onInstallFailure(error as Error);
      }
      
      return false;
    }
  };

  /**
   * Handles the Add to Home Screen (A2HS) installation flow
   */
  const handleA2HS = async (): Promise<void> => {
    setInstallationStatus('installing');
    setInstallationInProgress(true);
    
    try {
      // Step 1: Verify the installation source
      const sourceValid = await verifyInstallationSource(); // Remove bypass
      if (!sourceValid) {
        throw new Error('Installation source verification failed');
      }
      
      // Step 2: Validate required permissions
      const permissionsValid = await validatePermissions(); // Remove bypass
      if (!permissionsValid) {
        throw new Error('Permission validation failed');
      }
      
      // Step 3: Request user consent
      const userConsented = await requestUserConsent();
      if (!userConsented) {
        setInstallationStatus('idle');
        setInstallationInProgress(false);
        return; // User declined, not an error
      }
      
      // Installation successful
      setInstallationStatus('complete');
      
      if (onInstallSuccess) {
        onInstallSuccess();
      }
    } catch (error) {
      console.error('A2HS installation failed:', error);
      setErrorMessage((error as Error).message);
      setInstallationStatus('error');
      
      if (onInstallFailure) {
        onInstallFailure(error as Error);
      }
    } finally {
      setInstallationInProgress(false);
    }
  };

  /**
   * Verifies if an update is available for the PWA
   */
  const verifyUpdate = async (): Promise<boolean> => {
    try {
      if ('serviceWorker' in navigator) {
        // Check for service worker updates
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          try {
            // Trigger an update check
            await registration.update();
            
            // If there's a waiting worker, an update is available
            if (registration.waiting) {
              return true;
            }
          } catch (updateError) {
            console.warn('Failed to check for updates:', updateError);
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Update verification failed:', error);
      return false;
    }
  };

  // Define the spinning animation style
  const spinAnimation = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  // The component can be wrapped around an install button or other UI element
  return (
    <>
      {children ? (
        React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onClick: handleA2HS,
              disabled: !installable || installationInProgress,
              ...child.props,
            });
          }
          return child;
        })
      ) : (
        installable && (
          <button
            onClick={handleA2HS}
            disabled={installationInProgress}
            className="install-app-button"
            style={{
              cursor: installationInProgress ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {installationInProgress ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                Installing...
              </>
            ) : (
              <>
                <span>📱</span>
                Install App
              </>
            )}
          </button>
        )
      )}
      
      {errorMessage && (
        <div style={{ color: 'red', marginTop: '8px', fontSize: '14px' }}>
          Error: {errorMessage}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: spinAnimation }} />
    </>
  );
};

export default PWAInstaller; 