import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineStorage from '../hooks/useOfflineStorage';
import { useTheme } from '../contexts/NewThemeContext';
import '../styles/settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme, allThemes } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    autoSync: true,
    sendReceipts: false,
    signature: '',
    language: 'en',
    syncFrequency: '5'
  });
  const [saveStatus, setSaveStatus] = useState(null);
  const { isReady, getItem, updateItem } = useOfflineStorage('userSettings');

  // Load settings from storage
  const isDarkTheme = useCallback(() => {
    return theme === 'dark' || 
           theme === 'warmDark' || 
           theme === 'coolDark';
  }, [theme]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!isReady) return;
      
      try {
        const storedSettings = await getItem('userSettings');
        if (storedSettings) {
          setSettings(storedSettings.data);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSaveStatus({ type: 'error', message: 'Failed to load settings.' });
      }
    };
    
    loadSettings();
  }, [isReady, getItem]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle theme toggle separately
    if (name === 'darkMode') {
      const newTheme = checked ? 'dark' : 'light';
      setTheme(newTheme);
      return;
    }
    
    // Handle other settings
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save settings
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!isReady) {
      setSaveStatus({ type: 'error', message: 'Storage not ready. Please try again.' });
      return;
    }
    
    try {
      await updateItem({
        id: 'userSettings',
        data: settings,
        timestamp: Date.now()
      });
      
      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
    }
  };

  // Reset settings to default
  const handleReset = () => {
    setSettings({
      notifications: true,
      autoSync: true,
      sendReceipts: false,
      signature: '',
      language: 'en',
      syncFrequency: '5'
    });
    
    setSaveStatus({ type: 'info', message: 'Settings reset to default. Click Save to apply.' });
  };

  // Navigate to theme manager
  const handleThemeManagerClick = () => {
    navigate('/theme-manager');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>
      
      {saveStatus && (
        <div className={`status-message ${saveStatus.type}`}>
          {saveStatus.message}
        </div>
      )}
      
      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-section">
          <h2>General Settings</h2>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
              />
              Enable notifications
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="darkMode"
                checked={isDarkTheme()}
                onChange={(e) => handleChange(e)}
              />
              Dark mode
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="language">Language:</label>
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div className="settings-section">
            <h2>Appearance</h2>
            
            <div className="form-group">
              <label htmlFor="theme">Current Theme:</label>
              <div className="theme-info">
                <span className="theme-name">{theme}</span>
                <button 
                  type="button" 
                  className="theme-manager-button"
                  onClick={handleThemeManagerClick}
                >
                  Manage Themes
                </button>
              </div>
            </div>
            
            <div className="theme-preview">
              <div className="theme-preview-box" style={{ 
                backgroundColor: allThemes[theme]?.['--background'] || '#ffffff',
                color: allThemes[theme]?.['--foreground'] || '#000000',
                border: `1px solid ${allThemes[theme]?.['--border'] || '#e5e7eb'}`
              }}>{theme} theme preview</div>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Synchronization</h2>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="autoSync"
                checked={settings.autoSync}
                onChange={handleChange}
              />
              Automatically sync when online
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="syncFrequency">Sync frequency (minutes):</label>
            <select
              id="syncFrequency"
              name="syncFrequency"
              value={settings.syncFrequency}
              onChange={handleChange}
              disabled={!settings.autoSync}
            >
              <option value="1">1</option>
              <option value="5">5</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
            </select>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Email Preferences</h2>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="sendReceipts"
                checked={settings.sendReceipts}
                onChange={handleChange}
              />
              Send read receipts
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="signature">Email signature:</label>
            <textarea
              id="signature"
              name="signature"
              value={settings.signature}
              onChange={handleChange}
              placeholder="Enter your email signature..."
              rows={4}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="reset-button" onClick={handleReset}>
            Reset to Default
          </button>
          <button type="submit" className="save-button">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
