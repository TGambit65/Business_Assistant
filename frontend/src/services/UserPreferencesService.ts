/**
 * User Preferences Service
 * 
 * Manages user preferences for language, accessibility, theme, and other settings
 */

import { DEFAULT_LANGUAGE } from '../i18n';
import { getAccessibilityPreferences, AccessibilityPreferences } from '../utils/accessibility';

// User preferences interface
export interface UserPreferences {
  language: string;
  theme: string;
  accessibility: AccessibilityPreferences;
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  display: DisplayPreferences;
  lastUpdated: number;
}

// Notification preferences
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  securityAlerts: boolean;
}

// Security preferences
export interface SecurityPreferences {
  mfaEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // in minutes
  loginNotifications: boolean;
  trustedDevices: string[];
}

// Display preferences
export interface DisplayPreferences {
  density: 'compact' | 'comfortable' | 'spacious';
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  colorMode: 'light' | 'dark' | 'system';
  animations: boolean;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  language: DEFAULT_LANGUAGE,
  theme: 'system',
  accessibility: getAccessibilityPreferences(),
  notifications: {
    email: true,
    push: true,
    inApp: true,
    marketing: false,
    securityAlerts: true,
  },
  security: {
    mfaEnabled: false,
    biometricEnabled: false,
    sessionTimeout: 30, // 30 minutes
    loginNotifications: true,
    trustedDevices: [],
  },
  display: {
    density: 'comfortable',
    fontSize: 'medium',
    colorMode: 'system',
    animations: true,
  },
  lastUpdated: Date.now(),
};

// Storage keys
const STORAGE_KEY = 'user_preferences';
const PREFERENCES_VERSION = '1.0.0';

export class UserPreferencesService {
  private static instance: UserPreferencesService;
  private preferences: UserPreferences;
  private listeners: Array<(prefs: UserPreferences) => void> = [];

  private constructor() {
    this.preferences = this.loadPreferences();
  }

  public static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  /**
   * Get all user preferences
   */
  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Update user preferences
   * @param newPrefs Partial preferences to update
   */
  public updatePreferences(newPrefs: Partial<UserPreferences>): UserPreferences {
    this.preferences = {
      ...this.preferences,
      ...newPrefs,
      lastUpdated: Date.now(),
    };
    
    this.savePreferences();
    this.notifyListeners();
    
    return { ...this.preferences };
  }

  /**
   * Update language preference
   * @param language Language code
   */
  public setLanguage(language: string): void {
    this.updatePreferences({ language });
  }

  /**
   * Update theme preference
   * @param theme Theme name
   */
  public setTheme(theme: string): void {
    this.updatePreferences({ theme });
  }

  /**
   * Update accessibility preferences
   * @param accessibility Accessibility preferences
   */
  public setAccessibility(accessibility: Partial<AccessibilityPreferences>): void {
    this.updatePreferences({
      accessibility: {
        ...this.preferences.accessibility,
        ...accessibility,
      },
    });
  }

  /**
   * Update notification preferences
   * @param notifications Notification preferences
   */
  public setNotifications(notifications: Partial<NotificationPreferences>): void {
    this.updatePreferences({
      notifications: {
        ...this.preferences.notifications,
        ...notifications,
      },
    });
  }

  /**
   * Update security preferences
   * @param security Security preferences
   */
  public setSecurity(security: Partial<SecurityPreferences>): void {
    this.updatePreferences({
      security: {
        ...this.preferences.security,
        ...security,
      },
    });
  }

  /**
   * Update display preferences
   * @param display Display preferences
   */
  public setDisplay(display: Partial<DisplayPreferences>): void {
    this.updatePreferences({
      display: {
        ...this.preferences.display,
        ...display,
      },
    });
  }

  /**
   * Add a trusted device
   * @param deviceId Device ID
   */
  public addTrustedDevice(deviceId: string): void {
    if (!this.preferences.security.trustedDevices.includes(deviceId)) {
      const trustedDevices = [...this.preferences.security.trustedDevices, deviceId];
      this.setSecurity({ trustedDevices });
    }
  }

  /**
   * Remove a trusted device
   * @param deviceId Device ID
   */
  public removeTrustedDevice(deviceId: string): void {
    const trustedDevices = this.preferences.security.trustedDevices.filter(
      (id) => id !== deviceId
    );
    this.setSecurity({ trustedDevices });
  }

  /**
   * Reset preferences to defaults
   */
  public resetPreferences(): UserPreferences {
    this.preferences = { ...defaultPreferences, lastUpdated: Date.now() };
    this.savePreferences();
    this.notifyListeners();
    return { ...this.preferences };
  }

  /**
   * Subscribe to preference changes
   * @param listener Callback function
   * @returns Unsubscribe function
   */
  public subscribe(listener: (prefs: UserPreferences) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Load preferences from storage
   */
  private loadPreferences(): UserPreferences {
    try {
      const storedPrefs = localStorage.getItem(STORAGE_KEY);
      
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs);
        
        // Merge with default preferences to ensure all fields exist
        return {
          ...defaultPreferences,
          ...parsedPrefs,
        };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
    
    return { ...defaultPreferences };
  }

  /**
   * Save preferences to storage
   */
  private savePreferences(): void {
    try {
      const prefsToSave = {
        ...this.preferences,
        version: PREFERENCES_VERSION,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  /**
   * Notify all listeners of preference changes
   */
  private notifyListeners(): void {
    const prefs = { ...this.preferences };
    this.listeners.forEach((listener) => {
      try {
        listener(prefs);
      } catch (error) {
        console.error('Error in preference listener:', error);
      }
    });
  }

  /**
   * Export preferences as a JSON file
   */
  public exportPreferences(): string {
    const prefsToExport = {
      ...this.preferences,
      version: PREFERENCES_VERSION,
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(prefsToExport, null, 2);
  }

  /**
   * Import preferences from a JSON file
   * @param jsonString JSON string of preferences
   * @returns Success status
   */
  public importPreferences(jsonString: string): boolean {
    try {
      const importedPrefs = JSON.parse(jsonString);
      
      // Validate imported preferences
      if (!importedPrefs || typeof importedPrefs !== 'object') {
        throw new Error('Invalid preferences format');
      }
      
      // Merge with default preferences to ensure all fields exist
      this.preferences = {
        ...defaultPreferences,
        ...importedPrefs,
        lastUpdated: Date.now(),
      };
      
      this.savePreferences();
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const userPreferencesService = UserPreferencesService.getInstance();
