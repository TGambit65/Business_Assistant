import React, { useState, useEffect } from 'react';
import installPrompt from '../utils/installPrompt';

/**
 * A button that allows users to install the PWA
 * Only displays when installation is available
 */
const InstallPWAButton = ({ 
  buttonText = 'Install App', 
  className = 'install-pwa-button',
  onInstallStart = () => {},
  onInstallSuccess = () => {},
  onInstallFailure = () => {}
}) => {
  // Track whether installation is available
  const [isInstallable, setIsInstallable] = useState(false);
  // Track installation state
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsInstallable(installPrompt.canInstall());

    // Listen for changes in installability
    const handleAppInstallable = () => {
      setIsInstallable(installPrompt.canInstall());
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstalling(false);
    };

    // Add event listeners
    window.addEventListener('appinstallable', handleAppInstallable);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('appinstallable', handleAppInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstallClick = async () => {
    try {
      setInstalling(true);
      onInstallStart();
      
      const success = await installPrompt.showPrompt();
      
      if (success) {
        onInstallSuccess();
      } else {
        setInstalling(false);
        onInstallFailure('User declined installation');
      }
    } catch (error) {
      console.error('Installation error:', error);
      setInstalling(false);
      onInstallFailure(error.message || 'Installation failed');
    }
  };

  // Don't render if installation isn't available
  if (!isInstallable) {
    return null;
  }

  return (
    <button 
      className={className}
      onClick={handleInstallClick}
      disabled={installing}
    >
      {installing ? 'Installing...' : buttonText}
    </button>
  );
};

export default InstallPWAButton; 