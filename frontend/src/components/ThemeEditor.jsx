import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/NewThemeContext';
import {
  Save,
  RefreshCw,
  Download,
  // Copy, // Removed unused import
  Paintbrush,
  Layers,
  Type,
  Grid,
  Info,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import ColorPicker from './ui/color-picker';

/**
 * Theme Editor Component
 *
 * A comprehensive editor for creating and customizing themes.
 * This component allows users to modify all theme variables and see changes in real-time.
 *
 * @param {Object} props
 * @param {string} props.baseTheme - Optional base theme to start with
 * @param {function} props.onSave - Callback when a theme is saved
 */
const ThemeEditor = ({ baseTheme = 'light', onSave }) => {
  const { getThemes, addTheme, updateTheme } = useTheme();
  const allThemes = getThemes();

  // Editor state
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [isThemeNameValid, setIsThemeNameValid] = useState(true);
  const [themeNameError, setThemeNameError] = useState('');
  const [activeSection, setActiveSection] = useState('colors');
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Create theme variables state
  const [themeVariables, setThemeVariables] = useState({});

  // Theme variable sections for UI organization
  const sections = [
    { id: 'colors', name: 'Colors', icon: <Paintbrush size={16} /> },
    { id: 'components', name: 'Components', icon: <Layers size={16} /> },
    { id: 'typography', name: 'Typography', icon: <Type size={16} /> },
    { id: 'spacing', name: 'Spacing', icon: <Grid size={16} /> },
  ];

  // Variables grouped by section for UI organization
  const variableGroups = {
    colors: [
      {
        name: 'Core Colors',
        variables: [
          { key: '--background', label: 'Background' },
          { key: '--foreground', label: 'Foreground' },
          { key: '--primary', label: 'Primary' },
          { key: '--primary-foreground', label: 'Primary Foreground' },
          { key: '--secondary', label: 'Secondary' },
          { key: '--secondary-foreground', label: 'Secondary Foreground' },
          { key: '--accent', label: 'Accent' },
          { key: '--accent-foreground', label: 'Accent Foreground' },
          { key: '--destructive', label: 'Destructive' },
          { key: '--destructive-foreground', label: 'Destructive Foreground' },
          { key: '--muted', label: 'Muted' },
          { key: '--muted-foreground', label: 'Muted Foreground' }
        ]
      },
      {
        name: 'Network Status Colors',
        variables: [
          { key: '--network-status-connected', label: 'Connected' },
          { key: '--network-status-connected-text', label: 'Connected Text' },
          { key: '--network-status-poor', label: 'Poor Connection' },
          { key: '--network-status-poor-text', label: 'Poor Connection Text' },
          { key: '--network-status-offline', label: 'Offline' },
          { key: '--network-status-offline-text', label: 'Offline Text' }
        ]
      },
      {
        name: 'Chart Colors',
        variables: [
          { key: '--chart-1', label: 'Chart 1' },
          { key: '--chart-2', label: 'Chart 2' },
          { key: '--chart-3', label: 'Chart 3' },
          { key: '--chart-4', label: 'Chart 4' }
        ]
      }
    ],
    components: [
      {
        name: 'UI Components',
        variables: [
          { key: '--card', label: 'Card Background' },
          { key: '--card-foreground', label: 'Card Foreground' },
          { key: '--popover', label: 'Popover Background' },
          { key: '--popover-foreground', label: 'Popover Foreground' },
          { key: '--border', label: 'Border' },
          { key: '--input', label: 'Input' },
          { key: '--ring', label: 'Focus Ring' }
        ]
      },
      {
        name: 'Tooltips & Notifications',
        variables: [
          { key: '--tooltip-bg', label: 'Tooltip Background' },
          { key: '--tooltip-text', label: 'Tooltip Text' }
        ]
      },
      {
        name: 'Shadows',
        variables: [
          { key: '--shadow-sm', label: 'Small Shadow', type: 'text' },
          { key: '--shadow', label: 'Medium Shadow', type: 'text' },
          { key: '--shadow-md', label: 'Large Shadow', type: 'text' },
          { key: '--shadow-lg', label: 'Extra Large Shadow', type: 'text' }
        ]
      }
    ],
    typography: [
      {
        name: 'Typography',
        variables: [
          { key: '--font-family', label: 'Font Family', type: 'text' },
          { key: '--font-size', label: 'Base Font Size', type: 'text' },
          { key: '--font-weight', label: 'Font Weight', type: 'text' }
        ]
      }
    ],
    spacing: [
      {
        name: 'Spacing',
        variables: [
          { key: '--spacing-px', label: 'Pixel', type: 'text', default: '1px' },
          { key: '--spacing-0-5', label: '0.5 Unit', type: 'text', default: '0.125rem' },
          { key: '--spacing-1', label: '1 Unit', type: 'text', default: '0.25rem' },
          { key: '--spacing-2', label: '2 Units', type: 'text', default: '0.5rem' },
          { key: '--spacing-4', label: '4 Units', type: 'text', default: '1rem' }
        ]
      },
      {
        name: 'Border Radius',
        variables: [
          { key: '--radius-sm', label: 'Small Radius', type: 'text', default: '0.125rem' },
          { key: '--radius', label: 'Default Radius', type: 'text', default: '0.25rem' },
          { key: '--radius-md', label: 'Medium Radius', type: 'text', default: '0.375rem' },
          { key: '--radius-lg', label: 'Large Radius', type: 'text', default: '0.5rem' }
        ]
      }
    ]
  };

  // Initialize theme from base theme
  useEffect(() => {
    if (allThemes && allThemes[baseTheme]) {
      const baseVars = allThemes[baseTheme].variables;
      setThemeVariables(baseVars);

      // Suggest a name based on the base theme
      const suggestedName = `custom-${baseTheme}`;
      setThemeName(suggestedName);
      setThemeDescription(`Custom theme based on ${baseTheme}`);
    }
  }, [baseTheme, allThemes]);

  // Apply theme changes to preview in real-time
  useEffect(() => {
    // Apply the temporary theme to preview changes
    Object.entries(themeVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Cleanup function to reset styles when component unmounts
    return () => {
      // We don't reset here because the theme should be applied by ThemeContext
    };
  }, [themeVariables]);

  // Validate theme name
  useEffect(() => {
    if (!themeName) {
      setIsThemeNameValid(false);
      setThemeNameError('Theme name is required');
      return;
    }

    // Check if name already exists
    if (allThemes && allThemes[themeName] && themeName !== baseTheme) {
      setIsThemeNameValid(false);
      setThemeNameError('A theme with this name already exists');
      return;
    }

    // Check if name is valid (only letters, numbers, hyphens)
    if (!/^[a-zA-Z0-9-]+$/.test(themeName)) {
      setIsThemeNameValid(false);
      setThemeNameError('Theme name can only contain letters, numbers, and hyphens');
      return;
    }

    setIsThemeNameValid(true);
    setThemeNameError('');
  }, [themeName, allThemes, baseTheme]);

  // Handle variable change
  const handleVariableChange = (key, value) => {
    setThemeVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset theme to base
  const handleReset = () => {
    if (allThemes && allThemes[baseTheme]) {
      setThemeVariables(allThemes[baseTheme].variables);
    }
    setShowConfirmReset(false);
  };

  // Save theme
  const handleSave = () => {
    if (!isThemeNameValid) return;

    const newTheme = {
      name: themeName,
      description: themeDescription,
      variables: themeVariables
    };

    // Check if we're updating an existing theme or creating a new one
    if (allThemes && allThemes[themeName]) {
      updateTheme(themeName, newTheme);
    } else {
      addTheme(themeName, newTheme);
    }

    // Show success message
    setIsSaveSuccess(true);
    setTimeout(() => setIsSaveSuccess(false), 3000);

    // Call onSave callback if provided
    if (onSave) {
      onSave(newTheme);
    }
  };

  // Download theme as JSON
  const handleDownload = () => {
    const themeData = {
      name: themeName,
      description: themeDescription,
      variables: themeVariables,
      version: '1.0',
      createdAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeName}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render variable editor based on type
  const renderVariableEditor = (variable) => {
    const { key, label, type = 'color' } = variable;
    const value = themeVariables[key] || variable.default || '';

    // For color values
    if (type === 'color' || (type !== 'text' && value.startsWith('#'))) {
      return (
        <ColorPicker
          label={label}
          value={value}
          onChange={(newValue) => handleVariableChange(key, newValue)}
          className="mb-4"
        />
      );
    }

    // For text values (fonts, shadows, etc)
    return (
      <div className="flex flex-col space-y-1 mb-4">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleVariableChange(key, e.target.value)}
          className="h-8 px-2 border rounded text-sm"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar with sections */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Theme Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Theme Name</label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className={`w-full rounded-md border ${
                  isThemeNameValid ? 'border-input' : 'border-destructive'
                } px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                placeholder="my-theme"
              />
              {!isThemeNameValid && (
                <p className="mt-1 text-xs text-destructive">{themeNameError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={themeDescription}
                onChange={(e) => setThemeDescription(e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="My custom theme"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Theme Editor</h3>
          <nav className="flex flex-col space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={!isThemeNameValid}
            className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md ${
              isThemeNameValid
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-primary/50 text-primary-foreground cursor-not-allowed'
            }`}
          >
            <Save size={16} className="mr-2" />
            Save Theme
          </button>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-secondary"
          >
            <RefreshCw size={16} className="mr-2" />
            Reset to Base
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-secondary"
          >
            <Download size={16} className="mr-2" />
            Download JSON
          </button>
        </div>

        {/* Information box */}
        <div className="mt-6 p-3 bg-muted/50 rounded-md border border-border">
          <div className="flex items-start">
            <Info size={16} className="mr-2 mt-0.5 text-primary" />
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">Changes are previewed in real-time. Save when you're satisfied with your theme.</p>
              <p>All theme changes are stored in your browser. Clearing browser data will remove custom themes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-xl font-semibold mb-4">
            {sections.find(s => s.id === activeSection)?.name || 'Theme Variables'}
          </h3>

          {variableGroups[activeSection]?.map((group, index) => (
            <div key={index} className="mb-8">
              <h4 className="text-lg font-medium mb-4">{group.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {group.variables.map((variable) => (
                  <div key={variable.key} className="mb-2">
                    {renderVariableEditor(variable)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success notification */}
      {isSaveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded flex items-center shadow-md">
          <Check size={16} className="mr-2" />
          <span>Theme saved successfully!</span>
        </div>
      )}

      {/* Reset confirmation modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-yellow-500 mr-2" />
              <h4 className="text-lg font-semibold">Reset Theme?</h4>
            </div>
            <p className="mb-6 text-muted-foreground">
              This will reset all changes back to the base theme. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-secondary"
              >
                <X size={16} className="mr-2 inline-block" />
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
              >
                <RefreshCw size={16} className="mr-2 inline-block" />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeEditor;