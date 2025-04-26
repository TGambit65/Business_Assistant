/**
 * Utility to handle PWA installation prompts
 * Captures the beforeinstallprompt event and provides methods to trigger install
 */

let deferredPrompt = null;
let hasPromptBeenShown = false;

/**
 * Initialize the install prompt handler
 * Captures the beforeinstallprompt event
 */
const init = () => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Optionally, send an analytics event that PWA install was available
    if (window.PerformanceMonitor && window.PerformanceMonitor.reportEvent) {
      window.PerformanceMonitor.reportEvent('pwa-installable');
    }
    
    // Notify any observers that the app is installable
    const event = new CustomEvent('appinstallable', { detail: true });
    window.dispatchEvent(event);
    
    return true;
  });
  
  // Listen for the appinstalled event
  window.addEventListener('appinstalled', (e) => {
    // Clear the deferredPrompt variable
    deferredPrompt = null;
    hasPromptBeenShown = false;
    
    // Optionally, send an analytics event that PWA was installed
    if (window.PerformanceMonitor && window.PerformanceMonitor.reportEvent) {
      window.PerformanceMonitor.reportEvent('pwa-installed');
    }
    
    // Notify any observers that the app was installed
    const event = new CustomEvent('appinstalled', { detail: true });
    window.dispatchEvent(event);
  });
};

/**
 * Check if the app can be installed
 * @returns {boolean} Whether the app can be installed
 */
const canInstall = () => {
  return !!deferredPrompt && !hasPromptBeenShown;
};

/**
 * Show the install prompt
 * @returns {Promise<boolean>} Whether the user accepted the prompt
 */
const showPrompt = async () => {
  if (!deferredPrompt) {
    return false;
  }
  
  // Show the install prompt
  hasPromptBeenShown = true;
  
  try {
    // Show the prompt
    const result = await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await result;
    
    // Record the outcome
    const accepted = choiceResult.outcome === 'accepted';
    
    // Optionally, send an analytics event with the outcome
    if (window.PerformanceMonitor && window.PerformanceMonitor.reportEvent) {
      window.PerformanceMonitor.reportEvent('pwa-install-prompt', {
        outcome: choiceResult.outcome
      });
    }
    
    // Clear the deferredPrompt variable if accepted
    if (accepted) {
      deferredPrompt = null;
    }
    
    return accepted;
  } catch (error) {
    console.error('Error showing install prompt:', error);
    
    // Reset prompt status on error
    hasPromptBeenShown = false;
    
    // Log the error
    if (window.PerformanceMonitor && window.PerformanceMonitor.reportError) {
      window.PerformanceMonitor.reportError(error);
    }
    
    return false;
  }
};

// Initialize on module load
init();

const installPrompt = {
  init,
  canInstall,
  showPrompt
}; 

export default installPrompt;