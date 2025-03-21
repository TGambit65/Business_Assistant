import React, { createContext, useContext, useEffect, useState } from 'react';

// Create the theme context
const ThemeContext = createContext(null);

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Update body class when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Set a specific theme
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      if (newTheme === 'system') {
        // Use system preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light';
        setTheme(systemTheme);
        
        // Add listener for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
          setTheme(e.matches ? 'dark' : 'light');
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        setTheme(newTheme);
      }
    }
  };

  const value = {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    setTheme: setSpecificTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 