// This script forces the light theme by removing the 'dark' class from the HTML element
// and setting the theme to 'light' in localStorage

(function() {
  console.log('Light theme forced by force-light-theme.js');
  
  // Force light mode
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
  
  // Store the theme preference in localStorage
  try {
    localStorage.setItem('theme', 'light');
  } catch (e) {
    console.error('Failed to set theme in localStorage:', e);
  }
  
  // Apply any additional light theme specific styles
  const applyLightTheme = () => {
    document.body.style.setProperty('--background', '#ffffff');
    document.body.style.setProperty('--foreground', '#000000');
  };
  
  // Apply light theme when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLightTheme);
  } else {
    applyLightTheme();
  }
})();