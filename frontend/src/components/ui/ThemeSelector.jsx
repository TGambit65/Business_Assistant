import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Download, Upload, Check, X, /* PlusCircle, Trash2, */ Palette } from 'lucide-react'; // Re-added X for close button

/**
 * Theme Selector component
 * Allows users to choose themes and download/upload custom themes
 */
const ThemeSelector = ({ className = '', onClose }) => {
  const { theme, setTheme, allThemes, addCustomTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomThemeForm, setShowCustomThemeForm] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customThemeError, setCustomThemeError] = useState(null);
  const [customThemeFile, setCustomThemeFile] = useState(null);
  const [downloadThemeUrl, setDownloadThemeUrl] = useState(null);
  
  // List of theme options to display
  const themeOptions = [
    { id: 'light', name: 'Light', description: 'Clean, light background with blue accents' },
    { id: 'dark', name: 'Dark', description: 'Dark mode for low-light environments' },
    { id: 'highContrast', name: 'High Contrast', description: 'Maximum contrast for accessibility' },
    { id: 'blue', name: 'Blue', description: 'Light theme with blue color scheme' },
    { id: 'green', name: 'Green', description: 'Light theme with green color scheme' },
    { id: 'purple', name: 'Purple', description: 'Light theme with purple color scheme' },
    { id: 'warmDark', name: 'Warm Dark', description: 'Dark theme with warm color tones' },
    { id: 'coolDark', name: 'Cool Dark', description: 'Dark theme with cool color tones' },
    { id: 'system', name: 'System', description: 'Follows your system preference' },
  ];
  
  // Clean up download URL when component unmounts
  useEffect(() => {
    return () => {
      if (downloadThemeUrl) {
        URL.revokeObjectURL(downloadThemeUrl);
      }
    };
  }, [downloadThemeUrl]);
  
  // Handle theme selection
  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };
  
  // Create a downloadable theme
  const handleDownloadTheme = (themeId) => {
    // Create a JSON representation of the theme
    const themeData = allThemes[themeId];
    if (!themeData) return;
    
    const themeJson = JSON.stringify({
      name: themeId,
      description: themeOptions.find(opt => opt.id === themeId)?.description || '',
      variables: themeData,
      version: '1.0',
      createdAt: new Date().toISOString()
    }, null, 2);
    
    // Create a blob and downloadable URL
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Clean up previous URL if it exists
    if (downloadThemeUrl) {
      URL.revokeObjectURL(downloadThemeUrl);
    }
    
    // Set the new URL and trigger download
    setDownloadThemeUrl(url);
    
    // Create an anchor and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeId}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Handle file selection for theme upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomThemeFile(file);
      // Try to extract name from filename
      const nameMatch = file.name.match(/^([a-zA-Z0-9_-]+)-theme/);
      if (nameMatch && nameMatch[1]) {
        setCustomThemeName(nameMatch[1]);
      }
    }
  };
  
  // Upload and apply custom theme
  const handleUploadTheme = async () => {
    if (!customThemeFile) {
      setCustomThemeError('Please select a theme file');
      return;
    }
    
    if (!customThemeName || customThemeName.trim() === '') {
      setCustomThemeError('Please enter a theme name');
      return;
    }
    
    try {
      // Read file contents
      const text = await customThemeFile.text();
      const themeData = JSON.parse(text);
      
      // Validate theme structure
      if (!themeData.variables) {
        throw new Error('Invalid theme file: missing variables');
      }
      
      // Add the custom theme
      addCustomTheme(customThemeName, themeData.variables);
      
      // Apply the theme
      setTheme(customThemeName);
      
      // Close form and reset
      setShowCustomThemeForm(false);
      setCustomThemeFile(null);
      setCustomThemeName('');
      setCustomThemeError(null);
    } catch (error) {
      setCustomThemeError(`Error loading theme: ${error.message}`);
    }
  };
  
  // Cancel theme upload
  const handleCancelUpload = () => {
    setShowCustomThemeForm(false);
    setCustomThemeFile(null);
    setCustomThemeName('');
    setCustomThemeError(null);
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Theme toggle button */}
      <button
        onClick={() => {
          // If onClose is provided, we're in dropdown mode
          if (onClose) {
            // Always show the dropdown in this mode
            setIsOpen(true);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        aria-label="Select theme"
      >
        {theme === 'dark' || theme === 'warmDark' || theme === 'coolDark' ? (
          <Moon size={20} />
        ) : theme === 'highContrast' ? (
          <Palette size={20} />
        ) : (
          <Sun size={20} />
        )}
      </button>
      
      {/* Theme selector dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50"
          >
            <div className="p-2">
              <div className="flex justify-between items-center px-3 py-2">
                <div className="text-sm font-medium">Select Theme</div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-secondary"
                    aria-label="Close theme selector"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {/* Theme options */}
              <div className="space-y-1">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left ${
                      theme === option.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-xs opacity-70">{option.description}</div>
                    </div>
                    {theme === option.id && <Check size={16} />}
                  </button>
                ))}
              </div>
              
              {/* Custom theme actions */}
              <div className="border-t border-border mt-2 pt-2">
                {!showCustomThemeForm ? (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setShowCustomThemeForm(true)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-secondary"
                    >
                      <Upload size={14} />
                      <span>Import Theme</span>
                    </button>
                    <button
                      onClick={() => handleDownloadTheme(theme)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-secondary"
                    >
                      <Download size={14} />
                      <span>Export Current</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    <div className="text-sm font-medium">Import Custom Theme</div>
                    
                    {/* File input */}
                    <div>
                      <label className="block text-xs mb-1">Theme File</label>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="w-full text-xs border rounded p-1"
                      />
                    </div>
                    
                    {/* Theme name input */}
                    <div>
                      <label className="block text-xs mb-1">Theme Name</label>
                      <input
                        type="text"
                        value={customThemeName}
                        onChange={(e) => setCustomThemeName(e.target.value)}
                        placeholder="my-custom-theme"
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                    
                    {/* Error message */}
                    {customThemeError && (
                      <div className="text-destructive text-xs">{customThemeError}</div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelUpload}
                        className="px-3 py-1 text-xs rounded hover:bg-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUploadTheme}
                        className="px-3 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Apply Theme
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector; 