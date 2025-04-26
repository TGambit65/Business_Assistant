import { useEffect } from 'react';

// Global flag to ensure this only runs once across re-renders and multiple instances
let faviconLoaded = false;

const FaviconLoader = () => {
  useEffect(() => {
    // Skip if we've already loaded the favicon
    if (faviconLoaded) {
      return;
    }
    
    // Mark as loaded to prevent duplicate work
    faviconLoaded = true;
    
    // Check for existing favicon link
    const existingFavicon = document.querySelector("link[rel='icon']");
    
    if (!existingFavicon) {
      // Create standard favicon with appropriate cache settings
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = '/favicon.ico';
      
      // Add caching attributes to prevent multiple requests
      link.setAttribute('crossorigin', 'anonymous');
      
      // Add link to document
      document.head.appendChild(link);
      
      // Also ensure we have Apple touch icon for iOS devices
      if (!document.querySelector("link[rel='apple-touch-icon']")) {
        const appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        appleIcon.href = '/apple-touch-icon.png';
        appleIcon.setAttribute('crossorigin', 'anonymous');
        document.head.appendChild(appleIcon);
      }
    }
  }, []);
  
  return null; // This component doesn't render anything
};

export default FaviconLoader; 