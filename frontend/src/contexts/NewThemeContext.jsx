import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

// Built-in themes including Star Trek LCARS
const builtInThemes = {
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
    }
  },
  starTrekLCARS: {
    name: 'Star Trek LCARS',
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
    }
  }
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light');
  const [userThemes, setUserThemes] = useState({});

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

  // Save user themes to localStorage
  useEffect(() => {
    localStorage.setItem('userThemes', JSON.stringify(userThemes));
  }, [userThemes]);

  const allThemes = useMemo(() => ({ ...builtInThemes, ...userThemes }), [userThemes]);

  const applyTheme = React.useCallback((name) => {
    const theme = allThemes[name]?.variables;
    console.log('[ThemeContext] applyTheme called with:', name);
    console.log('[ThemeContext] theme variables to apply:', theme);
    if (!theme) return;
    Object.entries(theme).forEach(([key, value]) => {
      console.log(`[ThemeContext] setting ${key} = ${value}`);
      document.documentElement.style.setProperty(key, value);
    });
    if (['dark', 'earthDark', 'starTrekLCARS', 'highContrast'].includes(name)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [allThemes]);

  // useEffect(() => {
  //   applyTheme(themeName);
  //   localStorage.setItem('theme', themeName);
  // }, [themeName, allThemes, applyTheme]);

  const setTheme = (name) => {
    console.log('[ThemeContext] setTheme called with:', name);
    setThemeName(name);
    applyTheme(name);
    localStorage.setItem('theme', name);
  };

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

  const getThemes = () => {
    return { ...builtInThemes, ...userThemes };
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
      addTheme,
      updateTheme,
      deleteTheme,
      getThemes,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
