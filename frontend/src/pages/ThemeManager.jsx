import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/NewThemeContext';
import { Sun, Moon, Palette, Download, Upload, Check, HelpCircle, Zap, PlusCircle, /* Code, */ Brush, /* Layers, Paintbrush, Type, Grid, */ ExternalLink, Edit, Pencil, X } from 'lucide-react';
import '../styles/theme-manager.css';
import PerformanceTestHarness from '../tests/PerformanceTestHarness';
import ThemeEditor from '../components/ThemeEditor';

/**
 * Theme Manager Page
 * Allows users to view, select, and customize themes
 * Also includes performance testing tools for PWA optimization
 */
const ThemeManager = () => {
  const { themeName, setTheme, getThemes, addTheme, deleteTheme } = useTheme();
  const themes = getThemes() || {};
  const theme = themeName;
  const allThemes = themes;
  const addCustomTheme = addTheme;
  const [activeTab, setActiveTab] = useState('manage');
  const [previewTheme, setPreviewTheme] = useState(null);
  const [showPerformanceTesting, setShowPerformanceTesting] = useState(false);
  const [themeToEdit, setThemeToEdit] = useState(null);
  const fileInputRef = useRef(null);

  // Get all available themes
  const themeEntries = Object.entries(themes).filter(
    // Filter out high contrast if it's not explicitly enabled as system setting
    ([id]) => id !== 'highContrast' ||
      (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches)
  );

  // Theme categories
  const themeCategories = {
    'light': { name: 'Light Themes', icon: <Sun size={18} /> },
    'dark': { name: 'Dark Themes', icon: <Moon size={18} /> },
    'special': { name: 'Special Themes', icon: <Palette size={18} /> },
    'custom': { name: 'Custom Themes', icon: <Brush size={18} /> }
  };

  // Categorize themes
  const categorizedThemes = {
    'light': themeEntries.filter(([id]) =>
      id === 'light' ||
      (id !== 'dark' && id !== 'highContrast' && id !== 'earthDark' &&
       id !== 'starTrekLCARS' && id !== 'system' &&
       !id.includes('dark') && !id.includes('Dark'))
    ),
    'dark': themeEntries.filter(([id]) =>
      id === 'dark' || id === 'earthDark' ||
      id.includes('dark') || id.includes('Dark')
    ),
    'special': themeEntries.filter(([id]) =>
      id === 'highContrast' || id === 'system' || id === 'starTrekLCARS'
    ),
    'custom': themeEntries.filter(([id]) =>
      !['light', 'dark', 'highContrast', 'earthDark', 'starTrekLCARS',
        'system', 'blue', 'green', 'purple', 'warmDark', 'coolDark'].includes(id)
    )
  };

  // Check if we have any custom themes
  const hasCustomThemes = categorizedThemes.custom.length > 0;

  // Handle theme preview
  const handleThemePreview = (themeId) => {
    setPreviewTheme(themeId);
  };

  // Clear theme preview
  const handleClearPreview = () => {
    setPreviewTheme(null);
  };

  // Apply theme
  const handleApplyTheme = (themeId) => {
    setTheme(themeId);
    setPreviewTheme(null);
  };

  // Edit theme
  const handleEditTheme = (themeId) => {
    setThemeToEdit(themeId);
    setActiveTab('edit');
  };

  // Delete theme
  const handleDeleteTheme = (themeId) => {
    if (window.confirm(`Are you sure you want to delete the theme "${themeId}"?`)) {
      // Don't delete built-in themes
      if (!['light', 'dark', 'highContrast', 'warmDark', 'coolDark', 'system', 'blue', 'green', 'purple', 'earthDark', 'starTrekLCARS'].includes(themeId)) {
        deleteTheme(themeId);

        // If the deleted theme was active, switch to light theme
        if (themeName === themeId) {
          setTheme('light');
        }
      }
    }
  };

  // Generate a theme preview box
  const renderThemePreview = (themeId, themeVariables) => {
    // Basic CSS variables to preview
    const previewVars = {
      background: themeVariables['--background'] || '#ffffff',
      foreground: themeVariables['--foreground'] || '#000000',
      primary: themeVariables['--primary'] || '#3b82f6',
      secondary: themeVariables['--secondary'] || '#f3f4f6',
      accent: themeVariables['--accent'] || '#e5e7eb',
      networkConnected: themeVariables['--network-status-connected'] || '#22c55e',
      networkOffline: themeVariables['--network-status-offline'] || '#ef4444',
    };

    // Theme name mapping
    const themeNames = {
      'light': 'Light',
      'dark': 'Dark',
      'highContrast': 'High Contrast',
      'blue': 'Blue',
      'green': 'Green',
      'purple': 'Purple',
      'warmDark': 'Warm Dark',
      'coolDark': 'Cool Dark',
      'system': 'System',
      'earthDark': 'Earth Dark',
      'starTrekLCARS': 'Star Trek TNG',
    };

    const displayName = themeNames[themeId] || themeId;

    // Check if it's a built-in theme
    const isBuiltIn = ['light', 'dark', 'highContrast', 'warmDark', 'coolDark', 'system', 'blue', 'green', 'purple', 'earthDark', 'starTrekLCARS'].includes(themeId);

    return (
      <div
        className={`relative border rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md ${
          themeId === theme ? 'ring-2 ring-primary' :
          themeId === previewTheme ? 'ring-2 ring-primary/50' : 'hover:border-primary/50'
        }`}
        onMouseEnter={() => handleThemePreview(themeId)}
        onMouseLeave={handleClearPreview}
      >
        {/* Theme preview */}
        <div className="h-32 relative">
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{ background: previewVars.background }}
          />

          {/* Content samples */}
          <div className="absolute inset-0 p-3">
            {/* Header */}
            <div
              className="text-sm font-semibold mb-2"
              style={{ color: previewVars.foreground }}
            >
              {displayName}
            </div>

            {/* Button samples */}
            <div className="flex space-x-2 mb-2">
              <div
                className="rounded-md px-2 py-1 text-xs"
                style={{
                  background: previewVars.primary,
                  color: previewVars.foreground
                }}
              >
                Button
              </div>
              <div
                className="rounded-md px-2 py-1 text-xs"
                style={{
                  background: previewVars.secondary,
                  color: previewVars.foreground
                }}
              >
                Button
              </div>
            </div>

            {/* Network status samples */}
            <div className="flex space-x-2">
              <div
                className="rounded-full w-3 h-3"
                style={{ background: previewVars.networkConnected }}
              />
              <div
                className="rounded-full w-3 h-3"
                style={{ background: previewVars.networkOffline }}
              />
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="p-3 border-t bg-card flex justify-between items-center">
          <div className="text-sm font-medium">{displayName}</div>
          <div className="flex">
            {/* Download button */}
            <button
              className="p-1 rounded-md hover:bg-secondary mr-1"
              onClick={(e) => {
                e.stopPropagation();
                // Create a trigger to download this theme
                const themeData = JSON.stringify({
                  name: themeId,
                  description: `${displayName} theme`,
                  variables: themeVariables,
                  version: '1.0',
                  createdAt: new Date().toISOString()
                }, null, 2);

                // Create blob and trigger download
                const blob = new Blob([themeData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                // Create anchor and trigger download
                const a = document.createElement('a');
                a.href = url;
                a.download = `${themeId}-theme.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Clean up URL
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} />
            </button>

            {/* Edit button (only for custom themes) */}
            {!isBuiltIn && (
              <button
                className="p-1 rounded-md hover:bg-secondary mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTheme(themeId);
                }}
              >
                <Pencil size={16} />
              </button>
            )}

            {/* Clone button (for base themes) */}
            {isBuiltIn && (
              <button
                className="p-1 rounded-md hover:bg-secondary mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTheme(themeId);
                }}
                title="Customize this theme"
              >
                <Edit size={16} />
              </button>
            )}

            {/* Delete button (only for custom themes) */}
            {!isBuiltIn && (
              <button
                className="p-1 rounded-md hover:bg-secondary hover:text-destructive mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTheme(themeId);
                }}
              >
                <X size={16} />
              </button>
            )}

            {/* Use button */}
            <button
              className={`p-1 rounded-md ${
                theme === themeId
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleApplyTheme(themeId);
              }}
              disabled={theme === themeId}
            >
              {theme === themeId ? <Check size={16} /> : 'Use'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle file upload trigger
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const themeData = JSON.parse(event.target?.result?.toString() || '{}');
          if (!themeData.variables) {
            throw new Error('Invalid theme file: missing variables');
          }

          const themeName = themeData.name || 'custom-theme';
          addCustomTheme(themeName, themeData);
          setTheme(themeName);

          // Reset file input
          e.target.value = '';

          // Show success message
          alert(`Theme "${themeName}" imported successfully!`);
        } catch (error) {
          alert(`Error importing theme: ${error.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Theme Manager</h1>
          <p className="text-muted-foreground text-lg">Customize the appearance of your Business Assistant</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === 'manage'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            <Palette size={18} />
            <span>Manage Themes</span>
          </button>

          <button
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            onClick={() => {
              setThemeToEdit('light'); // Start with light theme as base
              setActiveTab('create');
            }}
          >
            <PlusCircle size={18} />
            <span>Create Theme</span>
          </button>

          <button
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === 'edit'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            onClick={() => {
              if (!themeToEdit) {
                setThemeToEdit(theme);
              }
              setActiveTab('edit');
            }}
          >
            <Edit size={18} />
            <span>Edit Theme</span>
          </button>

          <button
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === 'performance'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            onClick={() => {
              setActiveTab('performance');
              setShowPerformanceTesting(true);
            }}
          >
            <Zap size={18} />
            <span>Performance</span>
          </button>
        </div>
      </div>

      {/* Create Theme Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <PlusCircle size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create Custom Theme</h2>
                <p className="text-muted-foreground">Design your own theme for Business Assistant</p>
              </div>
            </div>

            <ThemeEditor baseTheme={themeToEdit} onSave={() => setActiveTab('manage')} />
          </div>
        </div>
      )}

      {/* Edit Theme Tab */}
      {activeTab === 'edit' && (
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Edit size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Theme</h2>
                <p className="text-muted-foreground">Customize an existing theme</p>
              </div>
            </div>

            {themeToEdit ? (
              <ThemeEditor baseTheme={themeToEdit} onSave={() => setActiveTab('manage')} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Please select a theme to edit</p>
                <button
                  onClick={() => setActiveTab('manage')}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Go to Manage Themes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Themes Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Current theme */}
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Check size={16} className="text-primary" />
              </div>
              <span>Current Theme: {theme}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Preview</div>
                {renderThemePreview(theme, allThemes[theme]?.variables)}
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Theme Information</div>
                <div className="bg-muted p-4 rounded-md">
                  <div className="mb-2">
                    <span className="text-sm font-medium">Theme Type:</span>
                    <span className="ml-2">
                      {categorizedThemes.light.find(([id]) => id === theme) ? 'Light' :
                       categorizedThemes.dark.find(([id]) => id === theme) ? 'Dark' :
                       categorizedThemes.special.find(([id]) => id === theme) ? 'Special' :
                       'Custom'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium">CSS Variables:</span>
                    <span className="ml-2">{Object.keys(allThemes[theme]?.variables || {}).length}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">System Preference:</span>
                    <span className="ml-2">{theme === 'system' ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available themes */}
          {Object.entries(themeCategories).map(([category, { name, icon }]) => (
            <div key={category} className={`mb-8 ${category === 'custom' && !hasCustomThemes ? 'hidden' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                {icon}
                <h2 className="text-xl font-semibold">{name}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {categorizedThemes[category].map(([themeId, themeObj]) => (
                  <div key={themeId}>
                    {renderThemePreview(themeId, themeObj.variables || themeObj)}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Upload theme section */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-full">
                <Upload size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Upload Custom Theme</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="mb-5 text-muted-foreground">
                  Upload a custom theme from a JSON file. You can download theme files from the theme previews above or create your own following the theme specification.
                </p>

                <div
                  className="bg-muted/50 p-8 rounded-lg border-2 border-dashed border-muted-foreground/30 text-center cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={handleUploadClick}
                >
                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <Upload size={36} className="mb-4 text-muted-foreground" />
                    <span className="text-base font-medium mb-1">Drag and drop a theme file</span>
                    <span className="text-sm text-muted-foreground mb-3">or click to browse</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">.json format</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                    onClick={handleUploadClick}
                  >
                    <Upload size={16} />
                    <span>Select Theme File</span>
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Need a theme to get started?</div>
                  <button
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                    onClick={() => {
                      setThemeToEdit('light');
                      setActiveTab('create');
                    }}
                  >
                    <PlusCircle size={14} />
                    <span>Create your own theme</span>
                  </button>
                </div>
              </div>

              <div className="bg-card p-4 rounded-md">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle size={16} />
                  <h3 className="text-base font-medium">Theme File Format</h3>
                </div>

                <div className="text-xs font-mono bg-muted p-3 rounded-md overflow-auto max-h-64 border">
                  {`{
  "name": "my-theme",
  "description": "My custom theme",
  "variables": {
    "--background": "#ffffff",
    "--foreground": "#000000",
    "--primary": "#3b82f6",
    "--primary-foreground": "#ffffff",
    "--secondary": "#f3f4f6",
    "--network-status-connected": "#22c55e",
    "--network-status-poor": "#f59e0b",
    "--network-status-offline": "#ef4444"
    // ... other variables
  },
  "version": "1.0"
}`}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Note:</span> Uploaded themes will be stored in your browser's local storage. Clearing your browser data will remove custom themes.
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="text-sm text-primary hover:underline flex items-center gap-1"
                onClick={() => window.open('https://github.com/your-repo/theme-gallery', '_blank')}
              >
                <ExternalLink size={14} />
                <span>Browse community themes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Performance Testing</h2>
            <p className="mb-6 text-muted-foreground">
              Run comprehensive performance tests to identify optimization opportunities for this PWA.
              This helps ensure the application works efficiently across all devices.
            </p>

            {showPerformanceTesting ? (
              <PerformanceTestHarness />
            ) : (
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onClick={() => setShowPerformanceTesting(true)}
              >
                Start Performance Testing
              </button>
            )}
          </div>

          {/* Theme testing section */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Theme Testing</h2>
            <p className="mb-6 text-muted-foreground">
              Test theme transitions and appearance across different devices and screen sizes.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Dark Themes Test</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Test all dark themes in sequence to ensure they render correctly.
                </p>
                <button
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                  onClick={() => {
                    // Define the dark themes to test
                    const darkThemes = ['dark', 'earthDark', 'highContrast', 'starTrekLCARS'];
                    let currentIndex = 0;

                    // Set up interval to cycle through themes
                    const themeInterval = setInterval(() => {
                      // Apply the current theme
                      setTheme(darkThemes[currentIndex]);
                      console.log(`Testing theme: ${darkThemes[currentIndex]}`);

                      // Increment index or reset to beginning
                      currentIndex = (currentIndex + 1) % darkThemes.length;

                      // If we've gone through all themes, clear the interval
                      if (currentIndex === 0) {
                        clearInterval(themeInterval);
                        alert('Dark theme testing complete!');
                      }
                    }, 2000);
                  }}
                >
                  Test Dark Themes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeManager;
