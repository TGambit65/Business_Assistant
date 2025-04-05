import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'; // Import useMemo

// Create context
const ThemeContext = createContext(undefined); // Initialize with undefined for better type checking with useContext

// Define default themes with comprehensive CSS variables
const themes = {
  // Base themes
  light: {
    // Core UI colors
    '--background': 'hsl(0, 0%, 100%)',
    '--foreground': 'hsl(222.2, 84%, 4.9%)',
    '--card': 'hsl(0, 0%, 100%)',
    '--card-foreground': 'hsl(222.2, 84%, 4.9%)',
    '--popover': 'hsl(0, 0%, 100%)',
    '--popover-foreground': 'hsl(222.2, 84%, 4.9%)',
    '--primary': 'hsl(221.2, 83.2%, 53.3%)',
    '--primary-foreground': 'hsl(210, 40%, 98%)',
    '--secondary': 'hsl(210, 40%, 96.1%)',
    '--secondary-foreground': 'hsl(222.2, 47.4%, 11.2%)',
    '--muted': 'hsl(210, 40%, 96.1%)',
    '--muted-foreground': 'hsl(215.4, 16.3%, 46.9%)',
    '--accent': 'hsl(210, 40%, 96.1%)',
    '--accent-foreground': 'hsl(222.2, 47.4%, 11.2%)',
    '--destructive': 'hsl(0, 84.2%, 60.2%)',
    '--destructive-foreground': 'hsl(210, 40%, 98%)',
    '--border': 'hsl(214.3, 31.8%, 91.4%)',
    '--input': 'hsl(214.3, 31.8%, 91.4%)',
    '--ring': 'hsl(222.2, 84%, 4.9%)',

    // Network status colors
    '--network-status-connected': '#22c55e', // Green 500
    '--network-status-connected-text': 'white',
    '--network-status-poor': '#f59e0b', // Amber 500
    '--network-status-poor-text': 'white',
    '--network-status-offline': '#ef4444', // Red 500
    '--network-status-offline-text': 'white',

    // Chart colors
    '--chart-1': 'hsl(221.2, 83.2%, 53.3%)',
    '--chart-2': 'hsl(40, 96%, 60%)',
    '--chart-3': 'hsl(120, 96%, 60%)',
    '--chart-4': 'hsl(280, 96%, 60%)',

    // PWA installation prompt
    '--install-prompt-bg': '#f8fafc',
    '--install-prompt-text': '#1e293b',
    '--install-prompt-border': '#e2e8f0',
    '--install-prompt-button': '#3b82f6',
    '--install-prompt-button-text': 'white',

    // Miscellaneous
    '--tooltip-bg': 'rgba(0, 0, 0, 0.8)',
    '--tooltip-text': 'white',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  dark: {
    // Core UI colors
    '--background': 'hsl(222.2, 84%, 4.9%)',
    '--foreground': 'hsl(210, 40%, 98%)',
    '--card': 'hsl(224, 71%, 4%)',
    '--card-foreground': 'hsl(210, 40%, 98%)',
    '--popover': 'hsl(224, 71%, 4%)',
    '--popover-foreground': 'hsl(210, 40%, 98%)',
    '--primary': 'hsl(210, 40%, 98%)',
    '--primary-foreground': 'hsl(222.2, 47.4%, 11.2%)',
    '--secondary': 'hsl(217.2, 32.6%, 17.5%)',
    '--secondary-foreground': 'hsl(210, 40%, 98%)',
    '--muted': 'hsl(217.2, 32.6%, 17.5%)',
    '--muted-foreground': 'hsl(215, 20.2%, 65.1%)',
    '--accent': 'hsl(217.2, 32.6%, 17.5%)',
    '--accent-foreground': 'hsl(210, 40%, 98%)',
    '--destructive': 'hsl(0, 62.8%, 30.6%)',
    '--destructive-foreground': 'hsl(210, 40%, 98%)',
    '--border': 'hsl(217.2, 32.6%, 17.5%)',
    '--input': 'hsl(217.2, 32.6%, 17.5%)',
    '--ring': 'hsl(212.7, 26.8%, 83.9%)',

    // Network status colors
    '--network-status-connected': '#22c55e', // Green 500
    '--network-status-connected-text': 'white',
    '--network-status-poor': '#f59e0b', // Amber 500
    '--network-status-poor-text': 'white',
    '--network-status-offline': '#ef4444', // Red 500
    '--network-status-offline-text': 'white',

    // Chart colors
    '--chart-1': 'hsl(210, 100%, 70%)',
    '--chart-2': 'hsl(40, 70%, 70%)',
    '--chart-3': 'hsl(120, 70%, 70%)',
    '--chart-4': 'hsl(280, 70%, 70%)',

    // PWA installation prompt
    '--install-prompt-bg': '#1e293b',
    '--install-prompt-text': '#f8fafc',
    '--install-prompt-border': '#334155',
    '--install-prompt-button': '#3b82f6',
    '--install-prompt-button-text': 'white',

    // Miscellaneous
    '--tooltip-bg': 'rgba(255, 255, 255, 0.8)',
    '--tooltip-text': 'black',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  },
  // High contrast theme for accessibility
  highContrast: {
    // Core UI colors
    '--background': 'black',
    '--foreground': 'white',
    '--card': 'black',
    '--card-foreground': 'white',
    '--popover': 'black',
    '--popover-foreground': 'white',
    '--primary': 'white',
    '--primary-foreground': 'black',
    '--secondary': '#333333',
    '--secondary-foreground': 'white',
    '--muted': '#333333',
    '--muted-foreground': 'white',
    '--accent': 'yellow',
    '--accent-foreground': 'black',
    '--destructive': 'red',
    '--destructive-foreground': 'white',
    '--border': 'white',
    '--input': 'white',
    '--ring': 'white',

    // Network status colors
    '--network-status-connected': '#00ff00',
    '--network-status-connected-text': 'black',
    '--network-status-poor': 'yellow',
    '--network-status-poor-text': 'black',
    '--network-status-offline': 'red',
    '--network-status-offline-text': 'white',

    // Chart colors
    '--chart-1': 'white',
    '--chart-2': 'yellow',
    '--chart-3': 'cyan',
    '--chart-4': 'magenta',

    // PWA installation prompt
    '--install-prompt-bg': 'black',
    '--install-prompt-text': 'white',
    '--install-prompt-border': 'white',
    '--install-prompt-button': 'white',
    '--install-prompt-button-text': 'black',

    // Miscellaneous
    '--tooltip-bg': 'white',
    '--tooltip-text': 'black',
    '--shadow-sm': 'none',
    '--shadow': 'none',
    '--shadow-md': 'none',
    '--shadow-lg': 'none',
  }
};

// Custom themes that extend base themes
const customThemes = {
  blue: {
    ...themes.light,
    '--primary': '#1d4ed8',
    '--primary-foreground': '#ffffff',
    '--secondary': '#6b7280',
    '--accent': '#1e40af',
    '--accent-hover': '#1e3a8a',
    '--network-status-connected': '#2563eb',
    '--chart-1': '#2563eb',
  },
  green: {
    ...themes.light,
    '--primary': '#16a34a',
    '--primary-foreground': '#ffffff',
    '--secondary': '#6b7280',
    '--accent': '#15803d',
    '--accent-hover': '#166534',
    '--network-status-connected': '#22c55e',
    '--chart-1': '#22c55e',
  },
  purple: {
    ...themes.light,
    '--primary': '#8b5cf6',
    '--primary-foreground': '#ffffff',
    '--secondary': '#6b7280',
    '--accent': '#7c3aed',
    '--accent-hover': '#6d28d9',
    '--network-status-connected': '#8b5cf6',
    '--chart-1': '#8b5cf6',
  },
  warmDark: {
    ...themes.dark,
    '--background': 'hsl(20, 14%, 4%)',
    '--card': 'hsl(20, 14%, 8%)',
    '--primary': 'hsl(20, 90%, 60%)',
    '--network-status-connected': 'hsl(20, 90%, 60%)',
    '--chart-1': 'hsl(20, 90%, 60%)',
  },
  coolDark: {
    ...themes.dark,
    '--background': 'hsl(220, 20%, 4%)',
    '--card': 'hsl(220, 20%, 8%)',
    '--primary': 'hsl(220, 90%, 60%)',
    '--network-status-connected': 'hsl(220, 90%, 60%)',
    '--chart-1': 'hsl(220, 90%, 60%)',
  },
  earthDark: {
    ...themes.dark,
    '--background': 'hsl(30, 10%, 10%)',  // Deep brown-black
    '--foreground': 'hsl(35, 25%, 88%)',  // Light sand color
    '--card': 'hsl(25, 15%, 15%)',        // Dark terracotta
    '--card-foreground': 'hsl(35, 25%, 88%)', // Light sand color
    '--popover': 'hsl(25, 15%, 15%)',     // Dark terracotta
    '--popover-foreground': 'hsl(35, 25%, 88%)', // Light sand color
    '--primary': 'hsl(35, 60%, 55%)',     // Tan/amber
    '--primary-foreground': 'hsl(35, 10%, 10%)', // Dark brown
    '--secondary': 'hsl(35, 25%, 25%)',   // Dark earthen
    '--secondary-foreground': 'hsl(35, 25%, 88%)', // Light sand
    '--muted': 'hsl(35, 10%, 20%)',       // Muted earth
    '--muted-foreground': 'hsl(35, 15%, 65%)', // Soft taupe
    '--accent': 'hsl(35, 25%, 35%)',      // Medium earth tone
    '--accent-foreground': 'hsl(35, 25%, 88%)', // Light sand
    '--destructive': 'hsl(10, 50%, 45%)',  // Earthy red
    '--destructive-foreground': 'hsl(35, 25%, 88%)', // Light sand
    '--border': 'hsl(35, 15%, 25%)',      // Medium brown
    '--input': 'hsl(35, 15%, 25%)',       // Medium brown
    '--ring': 'hsl(35, 60%, 55%)',        // Tan/amber
    
    // Chart colors 
    '--chart-1': 'hsl(35, 70%, 55%)',     // Amber
    '--chart-2': 'hsl(120, 30%, 60%)',    // Muted sage
    '--chart-3': 'hsl(15, 60%, 60%)',     // Terracotta
    '--chart-4': 'hsl(45, 70%, 70%)',     // Sand
    
    // Other UI elements
    '--tooltip-bg': 'hsl(35, 15%, 15%)',  // Dark earth
    '--tooltip-text': 'hsl(35, 25%, 88%)', // Light sand
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
  }
};

// Merge base and custom themes
const allThemes = { ...themes, ...customThemes };

// Default fallback theme in case of errors
const fallbackTheme = {
  // Essential minimum variables to prevent UI breaking
  '--background': 'white',
  '--foreground': 'black',
  '--primary': 'blue',
  '--primary-foreground': 'white',
  '--secondary': '#f3f4f6',
  '--secondary-foreground': 'black',
  '--border': '#e2e8f0',
  '--network-status-connected': 'green',
  '--network-status-connected-text': 'white',
  '--network-status-poor': 'orange',
  '--network-status-poor-text': 'white',
  '--network-status-offline': 'red',
  '--network-status-offline-text': 'white',
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.error('useTheme must be used within a ThemeProvider');
    // Return a minimal context with fallback theme to prevent crashes
    return {
      theme: 'light',
      setTheme: () => {},
      allThemes: { light: fallbackTheme },
      toggleTheme: () => {},
      isDarkTheme: () => false,
      getThemeVariables: () => fallbackTheme,
      addCustomTheme: () => {},
    };
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // State for tracking and recovering from errors
  const [hasError, setHasError] = useState(false);
  
  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    try {
      const storedTheme = localStorage.getItem('theme');
      return storedTheme || 'earthDark'; // Force earth tone dark theme as default
    } catch (error) {
      console.error('Error getting initial theme:', error);
      return 'system'; // Safe fallback
    }
  };
  
  // Get stored custom themes
  const getStoredCustomThemes = () => {
    try {
      const storedThemesJSON = localStorage.getItem('customThemes');
      if (storedThemesJSON) {
        return JSON.parse(storedThemesJSON);
      }
    } catch (error) {
      console.error('Error loading custom themes:', error);
    }
    return {};
  };
  
  const [theme, setTheme] = useState(getInitialTheme);
  const [customThemesState, setCustomThemesState] = useState(getStoredCustomThemes);
  
  // Combined themes including custom user themes
  const allAvailableThemes = useMemo(() => ({ ...allThemes, ...customThemesState }), [customThemesState]);
  
  // Effect to handle theme changes
  useEffect(() => {
    try {
      // Save theme to localStorage
      localStorage.setItem('theme', theme);
      
      // Get theme variables from theme name
      const themeToApply = theme === 'system' ? 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
        theme;
      
      // Apply theme variables to document root
      const root = document.documentElement;
      const themeVars = allAvailableThemes[themeToApply] || allThemes.light;
      
      // Apply each CSS variable
      Object.entries(themeVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
      
      // Add/remove class for dark theme
      if (['dark', 'warmDark', 'coolDark', 'earthDark'].includes(themeToApply)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Reset error state if successful
      if (hasError) setHasError(false);
    } catch (error) {
      console.error('Error applying theme:', error);
      setHasError(true);
      
      // Apply fallback theme in case of error
      try {
        const root = document.documentElement;
        Object.entries(fallbackTheme).forEach(([property, value]) => {
          root.style.setProperty(property, value);
        });
      } catch (fallbackError) {
        console.error('Failed to apply fallback theme:', fallbackError);
      }
    }
  }, [theme, allAvailableThemes, hasError]); // Added allAvailableThemes
  
  // Effect for system theme change listener
  useEffect(() => {
    try {
      // Listen for system theme changes
      const handleDarkModeChange = (e) => {
        if (theme === 'system') {
          // Force a re-render when system theme changes
          setTheme('system');
        }
      };
      
      // Listen for contrast preference changes
      const handleContrastChange = (e) => {
        if (e.matches) {
          setTheme('highContrast');
        } else if (theme === 'highContrast') {
          // If no longer in high contrast mode and previously using high contrast theme
          setTheme('system');
        }
      };
      
      // Add event listeners
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const contrastMediaQuery = window.matchMedia('(prefers-contrast: more)');
      
      if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
        contrastMediaQuery.addEventListener('change', handleContrastChange);
      } else if (darkModeMediaQuery.addListener) {
        // Fallback for older browsers
        darkModeMediaQuery.addListener(handleDarkModeChange);
        contrastMediaQuery.addListener(handleContrastChange);
      }
      
      // Cleanup
      return () => {
        if (darkModeMediaQuery.removeEventListener) {
          darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
          contrastMediaQuery.removeEventListener('change', handleContrastChange);
        } else if (darkModeMediaQuery.removeListener) {
          darkModeMediaQuery.removeListener(handleDarkModeChange);
          contrastMediaQuery.removeListener(handleContrastChange);
        }
      };
    } catch (error) {
      console.error('Error setting up theme listeners:', error);
    }
  }, [theme, setTheme]); // Removed allAvailableThemes, added setTheme as it's used indirectly
  
  // Add a custom theme
  const addCustomTheme = (themeName, themeVariables) => {
    try {
      // Create new theme by merging with light theme for fallback values
      const newTheme = {
        ...allThemes.light,
        ...themeVariables
      };
      
      // Update custom themes
      const updatedCustomThemes = {
        ...customThemesState,
        [themeName]: newTheme
      };
      
      // Update state
      setCustomThemesState(updatedCustomThemes);
      
      // Save to localStorage
      localStorage.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      
      return true;
    } catch (error) {
      console.error('Error adding custom theme:', error);
      return false;
    }
  };
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(currentTheme => 
      currentTheme === 'light' || currentTheme === 'system' ? 'dark' : 'light'
    );
  };
  
  // Get current theme variables
  const getThemeVariables = () => {
    const themeToUse = theme === 'system' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      theme;
    
    return allAvailableThemes[themeToUse] || allThemes.light;
  };
  
  // Check if current theme is dark
  const isDarkTheme = () => {
    const themeToCheck = theme === 'system' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      theme;
    
    return ['dark', 'warmDark', 'coolDark', 'earthDark'].includes(themeToCheck);
  };

  // Error boundary for the theme provider
  if (hasError) {
    console.warn('ThemeProvider encountered an error, using fallback theme');
  }
  
  return (
    <ThemeContext.Provider 
      value={{
        theme,
        setTheme,
        allThemes: allAvailableThemes,
        toggleTheme,
        isDarkTheme,
        getThemeVariables,
        addCustomTheme,
        hasThemeError: hasError
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
