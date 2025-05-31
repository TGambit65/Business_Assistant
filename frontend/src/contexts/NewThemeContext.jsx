import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

// Built-in themes including Dark, Earth Dark, High Contrast, and Star Trek LCARS
const builtInThemes = {
  loginTheme: {
    name: 'Login Theme',
    description: 'Enhanced theme for login and authentication pages',
    variables: {
      '--background': 'hsl(220, 20%, 97%)',
      '--foreground': 'hsl(222.2, 84%, 4.9%)',
      '--primary': 'hsl(221.2, 83.2%, 53.3%)',
      '--primary-foreground': 'hsl(210, 40%, 98%)',
      '--secondary': 'hsl(210, 40%, 96.1%)',
      '--secondary-foreground': 'hsl(222.2, 47.4%, 11.2%)',
      '--muted': 'hsl(210, 40%, 96.1%)',
      '--muted-foreground': 'hsl(215.4, 16.3%, 46.9%)',
      '--accent': 'hsl(221, 70%, 55.5%)',
      '--accent-foreground': 'hsl(210, 40%, 98%)',
      '--destructive': 'hsl(0, 84.2%, 60.2%)',
      '--destructive-foreground': 'hsl(210, 40%, 98%)',
      '--border': 'hsl(214.3, 31.8%, 91.4%)',
      '--input': 'hsl(214.3, 31.8%, 91.4%)',
      '--ring': 'hsl(221.2, 83.2%, 53.3%)',
      '--card': 'hsl(0, 0%, 100%)',
      '--card-foreground': 'hsl(222.2, 84%, 4.9%)',
      '--popover': 'hsl(0, 0%, 100%)',
      '--popover-foreground': 'hsl(222.2, 84%, 4.9%)',
      // Network status colors
      '--network-status-connected': '#22c55e',
      '--network-status-connected-text': 'white',
      '--network-status-poor': '#f59e0b',
      '--network-status-poor-text': 'white',
      '--network-status-offline': '#ef4444',
      '--network-status-offline-text': 'white',
      // Chart colors
      '--chart-1': 'hsl(221.2, 83.2%, 53.3%)',
      '--chart-2': 'hsl(262, 83.2%, 58.3%)',
      '--chart-3': 'hsl(120, 96%, 60%)',
      '--chart-4': 'hsl(280, 96%, 60%)',
      // Miscellaneous
      '--tooltip-bg': 'rgba(0, 0, 0, 0.8)',
      '--tooltip-text': 'white',
      '--shadow-sm': '0 2px 4px 0 rgba(59, 130, 246, 0.1)',
      '--shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      '--shadow-md': '0 6px 10px -1px rgba(59, 130, 246, 0.1), 0 2px 6px -1px rgba(59, 130, 246, 0.06)',
      '--shadow-lg': '0 15px 25px -3px rgba(59, 130, 246, 0.1), 0 6px 10px -2px rgba(59, 130, 246, 0.05)',
    }
  },
  loginThemeDark: {
    name: 'Login Theme Dark',
    description: 'Enhanced dark theme for login and authentication pages',
    variables: {
      '--background': 'hsl(222, 47%, 11%)',
      '--foreground': 'hsl(210, 40%, 98%)',
      '--primary': 'hsl(217, 91%, 60%)',
      '--primary-foreground': 'hsl(210, 40%, 98%)',
      '--secondary': 'hsl(217, 32%, 17%)',
      '--secondary-foreground': 'hsl(210, 40%, 98%)',
      '--muted': 'hsl(217, 32%, 17%)',
      '--muted-foreground': 'hsl(215, 20%, 65%)',
      '--accent': 'hsl(217, 91%, 60%)',
      '--accent-foreground': 'hsl(210, 40%, 98%)',
      '--destructive': 'hsl(0, 84%, 60%)',
      '--destructive-foreground': 'hsl(210, 40%, 98%)',
      '--border': 'hsl(217, 32%, 17%)',
      '--input': 'hsl(217, 32%, 17%)',
      '--ring': 'hsl(224, 76%, 48%)',
      '--card': 'hsl(222, 47%, 11%)',
      '--card-foreground': 'hsl(210, 40%, 98%)',
      '--popover': 'hsl(222, 47%, 11%)',
      '--popover-foreground': 'hsl(210, 40%, 98%)',
      // Network status colors
      '--network-status-connected': '#22c55e',
      '--network-status-connected-text': 'white',
      '--network-status-poor': '#f59e0b',
      '--network-status-poor-text': 'white',
      '--network-status-offline': '#ef4444',
      '--network-status-offline-text': 'white',
      // Chart colors
      '--chart-1': 'hsl(217, 91%, 60%)',
      '--chart-2': 'hsl(262, 83%, 65%)',
      '--chart-3': 'hsl(120, 96%, 60%)',
      '--chart-4': 'hsl(280, 96%, 60%)',
      // Miscellaneous
      '--tooltip-bg': 'rgba(0, 0, 0, 0.8)',
      '--tooltip-text': 'white',
      '--shadow-sm': '0 2px 4px 0 rgba(30, 64, 175, 0.2)',
      '--shadow': '0 4px 6px -1px rgba(30, 64, 175, 0.2), 0 2px 4px -1px rgba(30, 64, 175, 0.15)',
      '--shadow-md': '0 6px 10px -1px rgba(30, 64, 175, 0.2), 0 2px 6px -1px rgba(30, 64, 175, 0.15)',
      '--shadow-lg': '0 15px 25px -3px rgba(30, 64, 175, 0.2), 0 6px 10px -2px rgba(30, 64, 175, 0.15)',
    }
  },
  light: {
    name: 'Light',
    description: 'Default light theme',
    variables: {
      '--background': 'hsl(0, 0%, 100%)',
      '--foreground': 'hsl(222.2, 84%, 4.9%)',
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
      '--card': 'hsl(0, 0%, 100%)',
      '--card-foreground': 'hsl(222.2, 84%, 4.9%)',
      '--popover': 'hsl(0, 0%, 100%)',
      '--popover-foreground': 'hsl(222.2, 84%, 4.9%)',
      // Network status colors
      '--network-status-connected': '#22c55e',
      '--network-status-connected-text': 'white',
      '--network-status-poor': '#f59e0b',
      '--network-status-poor-text': 'white',
      '--network-status-offline': '#ef4444',
      '--network-status-offline-text': 'white',
      // Chart colors
      '--chart-1': 'hsl(221.2, 83.2%, 53.3%)',
      '--chart-2': 'hsl(40, 96%, 60%)',
      '--chart-3': 'hsl(120, 96%, 60%)',
      '--chart-4': 'hsl(280, 96%, 60%)',
      // Miscellaneous
      '--tooltip-bg': 'rgba(0, 0, 0, 0.8)',
      '--tooltip-text': 'white',
      '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }
  },
  dark: {
    name: 'Dark',
    description: 'Default dark theme',
    variables: {
      '--background': 'hsl(222.2, 84%, 4.9%)',
      '--foreground': 'hsl(210, 40%, 98%)',
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
      '--card': 'hsl(224, 71%, 4%)',
      '--card-foreground': 'hsl(210, 40%, 98%)',
      '--popover': 'hsl(224, 71%, 4%)',
      '--popover-foreground': 'hsl(210, 40%, 98%)',
      // Network status colors
      '--network-status-connected': '#22c55e',
      '--network-status-connected-text': 'white',
      '--network-status-poor': '#f59e0b',
      '--network-status-poor-text': 'white',
      '--network-status-offline': '#ef4444',
      '--network-status-offline-text': 'white',
      // Chart colors
      '--chart-1': 'hsl(210, 100%, 70%)',
      '--chart-2': 'hsl(40, 70%, 70%)',
      '--chart-3': 'hsl(120, 70%, 70%)',
      '--chart-4': 'hsl(280, 70%, 70%)',
      // Miscellaneous
      '--tooltip-bg': 'rgba(255, 255, 255, 0.8)',
      '--tooltip-text': 'black',
      '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    }
  },
  earthDark: {
    name: 'Earth Dark',
    description: 'Earth tone dark theme',
    variables: {
      '--background': 'hsl(30, 10%, 10%)',
      '--foreground': 'hsl(35, 25%, 88%)',
      '--primary': 'hsl(35, 60%, 55%)',
      '--primary-foreground': 'hsl(35, 10%, 10%)',
      '--secondary': 'hsl(35, 25%, 25%)',
      '--secondary-foreground': 'hsl(35, 25%, 88%)',
      '--muted': 'hsl(35, 10%, 20%)',
      '--muted-foreground': 'hsl(35, 15%, 65%)',
      '--accent': 'hsl(35, 25%, 35%)',
      '--accent-foreground': 'hsl(35, 25%, 88%)',
      '--destructive': 'hsl(10, 50%, 45%)',
      '--destructive-foreground': 'hsl(35, 25%, 88%)',
      '--border': 'hsl(35, 15%, 25%)',
      '--input': 'hsl(35, 15%, 25%)',
      '--ring': 'hsl(35, 60%, 55%)',
      '--card': 'hsl(25, 15%, 15%)',
      '--card-foreground': 'hsl(35, 25%, 88%)',
      '--popover': 'hsl(25, 15%, 15%)',
      '--popover-foreground': 'hsl(35, 25%, 88%)',
      // Network status colors
      '--network-status-connected': 'hsl(35, 70%, 55%)',
      '--network-status-connected-text': 'hsl(35, 10%, 10%)',
      '--network-status-poor': 'hsl(40, 70%, 50%)',
      '--network-status-poor-text': 'hsl(35, 10%, 10%)',
      '--network-status-offline': 'hsl(10, 70%, 45%)',
      '--network-status-offline-text': 'hsl(35, 25%, 88%)',
      // Chart colors
      '--chart-1': 'hsl(35, 70%, 55%)',
      '--chart-2': 'hsl(120, 30%, 60%)',
      '--chart-3': 'hsl(15, 60%, 60%)',
      '--chart-4': 'hsl(45, 70%, 70%)',
      // Miscellaneous
      '--tooltip-bg': 'hsl(35, 15%, 15%)',
      '--tooltip-text': 'hsl(35, 25%, 88%)',
      '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
      '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
    }
  },
  highContrast: {
    name: 'High Contrast',
    description: 'Accessibility high contrast theme',
    variables: {
      '--background': '#000000',
      '--foreground': '#FFFFFF',
      '--primary': '#FFFFFF',
      '--primary-foreground': '#000000',
      '--secondary': '#333333',
      '--secondary-foreground': '#FFFFFF',
      '--muted': '#333333',
      '--muted-foreground': '#FFFFFF',
      '--accent': 'yellow',
      '--accent-foreground': '#000000',
      '--destructive': 'red',
      '--destructive-foreground': '#FFFFFF',
      '--border': '#FFFFFF',
      '--input': '#FFFFFF',
      '--ring': '#FFFFFF',
      '--card': '#000000',
      '--card-foreground': '#FFFFFF',
      '--popover': '#000000',
      '--popover-foreground': '#FFFFFF',
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
      // Miscellaneous
      '--tooltip-bg': 'white',
      '--tooltip-text': 'black',
      '--shadow-sm': 'none',
      '--shadow': 'none',
      '--shadow-md': 'none',
      '--shadow-lg': 'none',
    }
  },
  starTrekLCARS: {
    name: 'Star Trek TNG',
    description: 'Inspired by Star Trek TNG console interface',
    variables: {
      '--background': '#000000',
      '--foreground': '#FFCC66',
      '--primary': '#FF9933',
      '--primary-foreground': '#000000',
      '--secondary': '#9966FF',
      '--secondary-foreground': '#000000',
      '--muted': '#111111',
      '--muted-foreground': '#FFCC66',
      '--accent': '#66CCFF',
      '--accent-foreground': '#000000',
      '--destructive': '#FF3333',
      '--destructive-foreground': '#FFFFFF',
      '--border': '#FF9933',
      '--input': '#111111',
      '--ring': '#FF9933',
      '--card': '#000000',
      '--card-foreground': '#FFCC66',
      '--popover': '#000000',
      '--popover-foreground': '#FFCC66',
      // Network status colors
      '--network-status-connected': '#66FFCC',
      '--network-status-connected-text': '#000000',
      '--network-status-poor': '#FFCC00',
      '--network-status-poor-text': '#000000',
      '--network-status-offline': '#CC3333',
      '--network-status-offline-text': '#FFFFFF',
      // Chart colors
      '--chart-1': '#FF9933',
      '--chart-2': '#9966FF',
      '--chart-3': '#66CCFF',
      '--chart-4': '#CC99CC',
      // Miscellaneous
      '--tooltip-bg': '#111111',
      '--tooltip-text': '#FFCC66',
      '--shadow-sm': 'none',
      '--shadow': '0 0 10px rgba(255, 153, 51, 0.5)',
      '--shadow-md': '0 0 15px rgba(255, 153, 51, 0.5)',
      '--shadow-lg': '0 0 20px rgba(255, 153, 51, 0.5)',
    }
  },
  blue: {
    name: 'Blue',
    description: 'Modern blue theme',
    variables: {
      '--background': 'hsl(210, 100%, 98%)',
      '--foreground': 'hsl(222.2, 84%, 4.9%)',
      '--primary': 'hsl(210, 100%, 50%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(210, 100%, 96%)',
      '--secondary-foreground': 'hsl(222.2, 47.4%, 11.2%)',
      '--muted': 'hsl(210, 100%, 96%)',
      '--muted-foreground': 'hsl(215.4, 16.3%, 46.9%)',
      '--accent': 'hsl(210, 100%, 40%)',
      '--accent-foreground': 'hsl(0, 0%, 100%)',
      '--destructive': 'hsl(0, 84.2%, 60.2%)',
      '--destructive-foreground': 'hsl(210, 40%, 98%)',
      '--border': 'hsl(210, 100%, 90%)',
      '--input': 'hsl(210, 100%, 90%)',
      '--ring': 'hsl(210, 100%, 50%)',
      '--card': 'hsl(0, 0%, 100%)',
      '--card-foreground': 'hsl(222.2, 84%, 4.9%)',
      '--popover': 'hsl(0, 0%, 100%)',
      '--popover-foreground': 'hsl(222.2, 84%, 4.9%)',
      '--network-status-connected': '#22c55e',
      '--network-status-connected-text': 'white',
      '--network-status-poor': '#f59e0b',
      '--network-status-poor-text': 'white',
      '--network-status-offline': '#ef4444',
      '--network-status-offline-text': 'white',
      '--chart-1': 'hsl(210, 100%, 50%)',
      '--chart-2': 'hsl(190, 100%, 50%)',
      '--chart-3': 'hsl(230, 100%, 50%)',
      '--chart-4': 'hsl(250, 100%, 50%)',
      '--tooltip-bg': 'rgba(0, 0, 0, 0.8)',
      '--tooltip-text': 'white',
      '--shadow-sm': '0 1px 2px 0 rgba(0, 123, 255, 0.05)',
      '--shadow': '0 1px 3px 0 rgba(0, 123, 255, 0.1), 0 1px 2px 0 rgba(0, 123, 255, 0.06)',
      '--shadow-md': '0 4px 6px -1px rgba(0, 123, 255, 0.1), 0 2px 4px -1px rgba(0, 123, 255, 0.06)',
      '--shadow-lg': '0 10px 15px -3px rgba(0, 123, 255, 0.1), 0 4px 6px -2px rgba(0, 123, 255, 0.05)',
    }
  },
  loginThemeOld: {
    name: 'Login Theme (Old)',
    description: 'Clean, professional login interface theme',
    variables: {
      '--background': '#ffffff',
      '--foreground': '#1F2937',
      '--card': '#ffffff',
      '--card-foreground': '#1F2937',
      '--popover': '#ffffff',
      '--popover-foreground': '#1F2937',
      '--primary': '#1e40af',
      '--primary-foreground': '#ffffff',
      '--secondary': '#f1f5f9',
      '--secondary-foreground': '#1e293b',
      '--muted': '#f1f5f9',
      '--muted-foreground': '#64748b',
      '--accent': '#f1f5f9',
      '--accent-foreground': '#1e293b',
      '--destructive': '#ef4444',
      '--destructive-foreground': '#ffffff',
      '--border': '#e2e8f0',
      '--input': '#e2e8f0',
      '--ring': '#1e40af',

      // Login-specific variables
      '--login-background': 'linear-gradient(to right bottom, #ffffff, #f8fafc)',
      '--login-card-shadow': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '--login-input-background': '#ffffff',
      '--login-button-hover': '#1e4620',
    }
  },
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'light'
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  };

  const [themeName, setThemeName] = useState(getInitialTheme());
  const [previousTheme, setPreviousTheme] = useState(null);
  const [userThemes, setUserThemes] = useState({});

  // Calculate all themes by combining built-in and user themes
  const allThemes = useMemo(() => ({ ...builtInThemes, ...userThemes }), [userThemes]);

  // Get all available themes with their objects
  const getThemes = () => {
    return allThemes;
  };

  // Apply theme function - defined before it's used
  const applyTheme = React.useCallback((name) => {
    const theme = allThemes[name]?.variables;
    // console.log('[ThemeContext] applyTheme called with:', name);
    // console.log('[ThemeContext] theme variables to apply:', theme);
    if (!theme) {
      console.error(`[ThemeContext] Theme "${name}" not found!`);
      return;
    }

    // Debugging for special themes
    if (name === 'starTrekLCARS') {
      console.log('[ThemeContext] Applying Star Trek TNG theme specifically');
    } else if (name === 'earthDark') {
      console.log('[ThemeContext] Applying Earth Dark theme specifically');
    } else if (name === 'highContrast') {
      console.log('[ThemeContext] Applying High Contrast theme specifically');
    }

    // Apply all theme variables
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Properly set dark mode class based on theme
    if (['dark', 'earthDark', 'starTrekLCARS', 'highContrast'].includes(name) || name.includes('dark') || name.includes('Dark')) {
      // console.log('[ThemeContext] Adding "dark" class to documentElement');
      document.documentElement.classList.add('dark');
    } else {
      // console.log('[ThemeContext] Removing "dark" class from documentElement');
      document.documentElement.classList.remove('dark');
    }

    // For debugging
    // console.log(`[ThemeContext] Theme applied: ${name}`);
    // console.log(`[ThemeContext] Dark mode class present: ${document.documentElement.classList.contains('dark')}`);
  }, [allThemes]);

  // Load user themes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('userThemes');
    if (stored) {
      try {
        setUserThemes(JSON.parse(stored));
      } catch {
        setUserThemes({});
      }
    }
  }, []);

  // Initial theme application on mount with safeguards
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && allThemes[savedTheme] && savedTheme !== themeName) {
        setThemeName(savedTheme);
        applyTheme(savedTheme);
      } else if (!localStorage.getItem('theme')) {
        applyTheme(themeName);
      }
    }, 100); // Slightly longer delay to ensure DOM is ready
    return () => clearTimeout(timer);
  }, []); // No dependencies to prevent re-runs

  // Save user themes to localStorage
  useEffect(() => {
    localStorage.setItem('userThemes', JSON.stringify(userThemes));
  }, [userThemes]);

  // Apply theme when theme name changes - with safeguards
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== themeName) {
      setThemeName(savedTheme);
    } else {
      applyTheme(themeName);
      localStorage.setItem('theme', themeName);
    }
  }, [themeName]); // Only depend on themeName to reduce re-renders

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'loginTheme') {
      // Store current theme before switching to login theme
      if (themeName !== 'loginTheme') {
        setPreviousTheme(themeName);
      }
    }
    setThemeName(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [themeName]);

  const addTheme = (name, themeObj) => {
    setUserThemes(prev => ({ ...prev, [name]: themeObj }));
  };

  const updateTheme = (name, themeObj) => {
    setUserThemes(prev => ({ ...prev, [name]: themeObj }));
  };

  const deleteTheme = (name) => {
    setUserThemes(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  useEffect(() => {
    window.__allThemes = allThemes;
    window.__activeTheme = themeName;

    window.printThemeVars = () => {
      const styles = getComputedStyle(document.documentElement);
      console.log('--- Current CSS Variables ---');
      for (const key of Object.keys(allThemes[themeName]?.variables || {})) {
        console.log(`${key}: ${styles.getPropertyValue(key)}`);
      }
    };

    window.printActiveThemeObject = () => {
      console.log('--- Active Theme Object ---', allThemes[themeName]);
    };
  }, [allThemes, themeName]);

  return (
    <ThemeContext.Provider value={{
      themeName,
      setTheme,
      previousTheme,
      setPreviousTheme,
      addTheme,
      updateTheme,
      deleteTheme,
      getThemes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
