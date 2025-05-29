import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userPreferencesService } from '../services/UserPreferencesService';
import { userPreferencesAPI } from '../services/UserPreferencesAPI';
import type { 
  UserPreferences, 
  AccessibilityPreferences,
  NotificationPreferences,
  SecurityPreferences,
  DisplayPreferences,
  EmailPreferences,
  AIPreferences
} from '../types/preferences';
import type { PreferencesSyncResult, PreferenceConflict } from '../services/UserPreferencesAPI';

interface UserPreferencesContextValue {
  // Preferences state
  preferences: UserPreferences;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;
  hasPendingChanges: boolean;

  // Update methods
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<UserPreferences>;
  setLanguage: (language: string) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  setAccessibility: (accessibility: Partial<AccessibilityPreferences>) => Promise<void>;
  setNotifications: (notifications: Partial<NotificationPreferences>) => Promise<void>;
  setSecurity: (security: Partial<SecurityPreferences>) => Promise<void>;
  setDisplay: (display: Partial<DisplayPreferences>) => Promise<void>;
  setEmail: (email: Partial<EmailPreferences>) => Promise<void>;
  setAI: (ai: Partial<AIPreferences>) => Promise<void>;

  // Sync methods
  syncWithServer: () => Promise<PreferencesSyncResult>;
  forcePushToServer: () => Promise<PreferencesSyncResult>;
  forcePullFromServer: () => Promise<PreferencesSyncResult>;
  resolveConflicts: (conflicts: PreferenceConflict[], resolution: 'local' | 'server') => Promise<void>;

  // Utility methods
  resetPreferences: () => Promise<UserPreferences>;
  exportPreferences: () => string;
  importPreferences: (jsonString: string) => Promise<boolean>;
  
  // Trust device management
  addTrustedDevice: (deviceId: string) => Promise<void>;
  removeTrustedDevice: (deviceId: string) => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: React.ReactNode;
  enableSync?: boolean;
  syncIntervalMinutes?: number;
  onSyncError?: (error: string) => void;
  onConflict?: (conflicts: PreferenceConflict[]) => Promise<'local' | 'server' | 'merge'>;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({
  children,
  enableSync = false,
  syncIntervalMinutes = 5,
  onSyncError,
  onConflict,
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(
    userPreferencesService.getPreferences()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [autoSyncCleanup, setAutoSyncCleanup] = useState<(() => void) | null>(null);

  // Subscribe to preference changes
  useEffect(() => {
    const unsubscribe = userPreferencesService.subscribe((newPrefs) => {
      setPreferences(newPrefs);
      setHasPendingChanges(true);
    });

    return unsubscribe;
  }, []);

  // Set up auto-sync if enabled
  useEffect(() => {
    if (!enableSync) {
      if (autoSyncCleanup) {
        autoSyncCleanup();
        setAutoSyncCleanup(null);
      }
      return;
    }

    // Configure sync options
    userPreferencesService.configureSyncOptions({
      enabled: true,
      intervalMinutes: syncIntervalMinutes,
      conflictResolution: onConflict ? 'manual' : 'merge',
      onConflict: onConflict || undefined,
    });

    // Subscribe to sync events
    const unsubscribeSync = userPreferencesService.subscribeToSync((result) => {
      setIsSyncing(false);
      setLastSyncTime(Date.now());
      
      if (result.success) {
        setHasPendingChanges(false);
        setSyncError(null);
      } else {
        setSyncError(result.error || 'Unknown sync error');
        if (onSyncError) {
          onSyncError(result.error || 'Unknown sync error');
        }
      }
    });

    // Initial sync
    syncWithServer();

    // Store cleanup function
    setAutoSyncCleanup(() => unsubscribeSync);

    return () => {
      unsubscribeSync();
    };
  }, [enableSync, syncIntervalMinutes, onConflict, onSyncError]);

  const updatePreferences = useCallback(async (
    newPrefs: Partial<UserPreferences>
  ): Promise<UserPreferences> => {
    try {
      const updated = userPreferencesService.updatePreferences(newPrefs);
      setPreferences(updated);
      setHasPendingChanges(true);
      return updated;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }, []);

  const setLanguage = useCallback(async (language: string) => {
    await updatePreferences({ language });
  }, [updatePreferences]);

  const setTheme = useCallback(async (theme: string) => {
    await updatePreferences({ theme });
  }, [updatePreferences]);

  const setAccessibility = useCallback(async (
    accessibility: Partial<AccessibilityPreferences>
  ) => {
    await updatePreferences({
      accessibility: { ...preferences.accessibility, ...accessibility }
    });
  }, [updatePreferences, preferences.accessibility]);

  const setNotifications = useCallback(async (
    notifications: Partial<NotificationPreferences>
  ) => {
    await updatePreferences({
      notifications: { ...preferences.notifications, ...notifications }
    });
  }, [updatePreferences, preferences.notifications]);

  const setSecurity = useCallback(async (
    security: Partial<SecurityPreferences>
  ) => {
    await updatePreferences({
      security: { ...preferences.security, ...security }
    });
  }, [updatePreferences, preferences.security]);

  const setDisplay = useCallback(async (
    display: Partial<DisplayPreferences>
  ) => {
    await updatePreferences({
      display: { ...preferences.display, ...display }
    });
  }, [updatePreferences, preferences.display]);

  const setEmail = useCallback(async (
    email: Partial<EmailPreferences>
  ) => {
    await updatePreferences({
      email: { ...preferences.email, ...email }
    });
  }, [updatePreferences, preferences.email]);

  const setAI = useCallback(async (
    ai: Partial<AIPreferences>
  ) => {
    await updatePreferences({
      ai: { ...preferences.ai, ...ai }
    });
  }, [updatePreferences, preferences.ai]);

  const syncWithServer = useCallback(async (): Promise<PreferencesSyncResult> => {
    if (!enableSync) {
      return { success: false, error: 'Sync is not enabled' };
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await userPreferencesService.syncWithServer();
      
      if (result.success && result.preferences) {
        setPreferences(result.preferences);
        setHasPendingChanges(false);
        setLastSyncTime(Date.now());
      } else if (result.error) {
        setSyncError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, [enableSync]);

  const forcePushToServer = useCallback(async (): Promise<PreferencesSyncResult> => {
    if (!enableSync) {
      return { success: false, error: 'Sync is not enabled' };
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await userPreferencesService.pushToServer();
      
      if (result.success) {
        setHasPendingChanges(false);
        setLastSyncTime(Date.now());
      } else if (result.error) {
        setSyncError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, [enableSync]);

  const forcePullFromServer = useCallback(async (): Promise<PreferencesSyncResult> => {
    if (!enableSync) {
      return { success: false, error: 'Sync is not enabled' };
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await userPreferencesService.fetchFromServer();
      
      if (result.success && result.preferences) {
        setPreferences(result.preferences);
        setHasPendingChanges(false);
        setLastSyncTime(Date.now());
      } else if (result.error) {
        setSyncError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, [enableSync]);

  const resolveConflicts = useCallback(async (
    conflicts: PreferenceConflict[],
    resolution: 'local' | 'server'
  ) => {
    try {
      // Create resolutions map with all conflicts using the same resolution
      const resolutions: Record<string, 'local' | 'server'> = {};
      conflicts.forEach(conflict => {
        resolutions[conflict.field] = resolution;
      });
      
      await userPreferencesService.resolveConflicts(conflicts, resolutions);
      await syncWithServer();
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      throw error;
    }
  }, [syncWithServer]);

  const resetPreferences = useCallback(async (): Promise<UserPreferences> => {
    try {
      const reset = userPreferencesService.resetPreferences();
      setPreferences(reset);
      setHasPendingChanges(true);
      return reset;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw error;
    }
  }, []);

  const exportPreferences = useCallback((): string => {
    return userPreferencesService.exportPreferences();
  }, []);

  const importPreferences = useCallback(async (jsonString: string): Promise<boolean> => {
    try {
      const success = userPreferencesService.importPreferences(jsonString);
      if (success) {
        setPreferences(userPreferencesService.getPreferences());
        setHasPendingChanges(true);
      }
      return success;
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }, []);

  const addTrustedDevice = useCallback(async (deviceId: string) => {
    userPreferencesService.addTrustedDevice(deviceId);
    setPreferences(userPreferencesService.getPreferences());
    setHasPendingChanges(true);
  }, []);

  const removeTrustedDevice = useCallback(async (deviceId: string) => {
    userPreferencesService.removeTrustedDevice(deviceId);
    setPreferences(userPreferencesService.getPreferences());
    setHasPendingChanges(true);
  }, []);

  const value: UserPreferencesContextValue = {
    preferences,
    isLoading,
    isSyncing,
    lastSyncTime,
    syncError,
    hasPendingChanges,
    updatePreferences,
    setLanguage,
    setTheme,
    setAccessibility,
    setNotifications,
    setSecurity,
    setDisplay,
    setEmail,
    setAI,
    syncWithServer,
    forcePushToServer,
    forcePullFromServer,
    resolveConflicts,
    resetPreferences,
    exportPreferences,
    importPreferences,
    addTrustedDevice,
    removeTrustedDevice,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextValue => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

// Custom hooks for specific preference categories
export const useLanguagePreference = () => {
  const { preferences, setLanguage } = useUserPreferences();
  return { language: preferences.language, setLanguage };
};

export const useThemePreference = () => {
  const { preferences, setTheme } = useUserPreferences();
  return { theme: preferences.theme, setTheme };
};

export const useAccessibilityPreferences = () => {
  const { preferences, setAccessibility } = useUserPreferences();
  return { accessibility: preferences.accessibility, setAccessibility };
};

export const useNotificationPreferences = () => {
  const { preferences, setNotifications } = useUserPreferences();
  return { notifications: preferences.notifications, setNotifications };
};

export const useSecurityPreferences = () => {
  const { preferences, setSecurity, addTrustedDevice, removeTrustedDevice } = useUserPreferences();
  return { 
    security: preferences.security, 
    setSecurity,
    addTrustedDevice,
    removeTrustedDevice
  };
};

export const useDisplayPreferences = () => {
  const { preferences, setDisplay } = useUserPreferences();
  return { display: preferences.display, setDisplay };
};

export const useEmailPreferences = () => {
  const { preferences, setEmail } = useUserPreferences();
  return { email: preferences.email, setEmail };
};

export const useAIPreferences = () => {
  const { preferences, setAI } = useUserPreferences();
  return { ai: preferences.ai, setAI };
};