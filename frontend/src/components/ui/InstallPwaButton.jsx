import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Download, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';

/**
 * Button component that allows users to install the app as a PWA with enhanced error handling
 */
const InstallPwaButton = ({ className, ...props }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [installStatus, setInstallStatus] = useState('idle'); // idle, installing, success, error
  const [errorMessage, setErrorMessage] = useState(null);

  // Check if the app is already installed as PWA
  useEffect(() => {
    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone || 
        document.referrer.includes('android-app://')) {
      setIsPWA(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setIsPWA(true);
      setDeferredPrompt(null);
      setInstallStatus('success');
      console.log('PWA was installed successfully');
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setInstallStatus('idle');
      }, 3000);
    });

    // Check if browser supports PWA installation
    const checkPWASupport = () => {
      const isSupported = 
        ('serviceWorker' in navigator &&  window.location.protocol === 'https:') | // Group HTTPS check| 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
        
      if (!isSupported) {
        setErrorMessage('Your browser does not fully support PWA installation');
      }
    };
    
    checkPWASupport();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setErrorMessage('Installation prompt not available');
      setInstallStatus('error');
      setTimeout(() => setInstallStatus('idle'), 3000);
      return;
    }

    try {
      setInstallStatus('installing');
      
      // Show the installation prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Note: We don't set success here because the appinstalled event will trigger
      } else {
        console.log('User dismissed the install prompt');
        setInstallStatus('idle');
      }

      // Clear the saved prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation error:', error);
      setErrorMessage(error.message || 'Failed to install application');
      setInstallStatus('error');
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setInstallStatus('idle');
      }, 3000);
    }
  };

  // If running as PWA, don't show the button
  if (isPWA) return null;

  // Render button with appropriate state
  return (
    <div className="flex flex-col">
      {isInstallable || installStatus === 'error' ? (
        <Button 
          onClick={handleInstallClick} 
          className={`${className} ${installStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}`}
          disabled={installStatus === 'installing'}
          {...props}
        >
          {installStatus === 'installing' ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Installing...
            </>
          ) : installStatus === 'success' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Installed!
            </>
          ) : installStatus === 'error' ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Retry Install
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Install App
            </>
          )}
        </Button>
      ) : (
        <Button 
          className={className}
          disabled
          {...props}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Not installable
        </Button>
      )}
      
      {errorMessage && installStatus === 'error' && (
        <div className="text-sm text-red-500 mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

export default InstallPwaButton; 