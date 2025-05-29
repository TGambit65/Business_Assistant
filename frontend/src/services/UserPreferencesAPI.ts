/**
 * User Preferences API Service
 * 
 * Handles server-side storage and synchronization of user preferences
 */

import { UserPreferences } from '../types/preferences';
import { EnhancedAuthService } from './EnhancedAuthService';

export interface PreferencesSyncStatus {
  lastSync: number;
  syncInProgress: boolean;
  conflicts: PreferenceConflict[];
}

export interface PreferenceConflict {
  field: string;
  localValue: any;
  serverValue: any;
  localUpdated: number;
  serverUpdated: number;
}

export interface PreferencesSyncResult {
  success: boolean;
  preferences?: UserPreferences;
  conflicts?: PreferenceConflict[];
  error?: string;
}

export class UserPreferencesAPI {
  private static instance: UserPreferencesAPI;
  private baseUrl: string;
  private authService: EnhancedAuthService;
  private syncStatus: PreferencesSyncStatus = {
    lastSync: 0,
    syncInProgress: false,
    conflicts: []
  };

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '/api';
    this.authService = EnhancedAuthService.getInstance();
  }

  public static getInstance(): UserPreferencesAPI {
    if (!UserPreferencesAPI.instance) {
      UserPreferencesAPI.instance = new UserPreferencesAPI();
    }
    return UserPreferencesAPI.instance;
  }

  /**
   * Get user preferences from server
   */
  public async getPreferences(): Promise<PreferencesSyncResult> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.baseUrl}/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        preferences: data.preferences,
      };
    } catch (error) {
      console.error('Error fetching preferences from server:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Save user preferences to server
   */
  public async savePreferences(preferences: UserPreferences): Promise<PreferencesSyncResult> {
    if (this.syncStatus.syncInProgress) {
      return { 
        success: false, 
        error: 'Sync already in progress' 
      };
    }

    this.syncStatus.syncInProgress = true;

    try {
      const token = await this.authService.getAccessToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.baseUrl}/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          // Conflict - server has newer version
          const conflictData = await response.json();
          return {
            success: false,
            conflicts: conflictData.conflicts,
          };
        }
        throw new Error(`Failed to save preferences: ${response.statusText}`);
      }

      const data = await response.json();
      this.syncStatus.lastSync = Date.now();
      
      return {
        success: true,
        preferences: data.preferences,
      };
    } catch (error) {
      console.error('Error saving preferences to server:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  /**
   * Sync preferences between local and server
   */
  public async syncPreferences(
    localPreferences: UserPreferences,
    conflictResolution: 'local' | 'server' | 'merge' = 'merge'
  ): Promise<PreferencesSyncResult> {
    try {
      // First, get server preferences
      const serverResult = await this.getPreferences();
      
      if (!serverResult.success || !serverResult.preferences) {
        // If we can't get server preferences, just save local
        return await this.savePreferences(localPreferences);
      }

      const serverPreferences = serverResult.preferences;

      // Check if they're already in sync
      if (this.arePreferencesEqual(localPreferences, serverPreferences)) {
        return {
          success: true,
          preferences: localPreferences,
        };
      }

      // Detect conflicts
      const conflicts = this.detectConflicts(localPreferences, serverPreferences);

      if (conflicts.length === 0) {
        // No conflicts, save local preferences
        return await this.savePreferences(localPreferences);
      }

      // Resolve conflicts based on strategy
      let resolvedPreferences: UserPreferences;

      switch (conflictResolution) {
        case 'local':
          resolvedPreferences = localPreferences;
          break;
        case 'server':
          resolvedPreferences = serverPreferences;
          break;
        case 'merge':
          resolvedPreferences = this.mergePreferences(
            localPreferences,
            serverPreferences,
            conflicts
          );
          break;
      }

      // Save resolved preferences
      const saveResult = await this.savePreferences(resolvedPreferences);
      
      if (saveResult.success) {
        this.syncStatus.conflicts = [];
      }

      return saveResult;
    } catch (error) {
      console.error('Error syncing preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete user preferences from server
   */
  public async deletePreferences(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.baseUrl}/preferences`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete preferences: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting preferences from server:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): PreferencesSyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Check if preferences are equal
   */
  private arePreferencesEqual(
    prefs1: UserPreferences,
    prefs2: UserPreferences
  ): boolean {
    // Compare all fields except lastUpdated and version
    const compareFields = [
      'language',
      'theme',
      'accessibility',
      'notifications',
      'security',
      'display',
      'email',
      'ai',
    ];

    for (const field of compareFields) {
      if (JSON.stringify(prefs1[field as keyof UserPreferences]) !== 
          JSON.stringify(prefs2[field as keyof UserPreferences])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Detect conflicts between local and server preferences
   */
  private detectConflicts(
    local: UserPreferences,
    server: UserPreferences
  ): PreferenceConflict[] {
    const conflicts: PreferenceConflict[] = [];
    const fields = Object.keys(local) as (keyof UserPreferences)[];

    for (const field of fields) {
      if (field === 'lastUpdated' || field === 'version') {
        continue;
      }

      const localValue = local[field];
      const serverValue = server[field];

      if (JSON.stringify(localValue) !== JSON.stringify(serverValue)) {
        conflicts.push({
          field,
          localValue,
          serverValue,
          localUpdated: local.lastUpdated || 0,
          serverUpdated: server.lastUpdated || 0,
        });
      }
    }

    return conflicts;
  }

  /**
   * Merge preferences with conflict resolution
   */
  private mergePreferences(
    local: UserPreferences,
    server: UserPreferences,
    conflicts: PreferenceConflict[]
  ): UserPreferences {
    const merged = { ...local };

    for (const conflict of conflicts) {
      // Use the more recently updated value
      if (conflict.serverUpdated > conflict.localUpdated) {
        (merged as any)[conflict.field] = conflict.serverValue;
      }
      // Otherwise, keep local value (already in merged)
    }

    merged.lastUpdated = Date.now();
    return merged;
  }

  /**
   * Setup automatic sync
   */
  public setupAutoSync(
    intervalMinutes: number,
    onSync: (result: PreferencesSyncResult) => void
  ): () => void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    const intervalId = setInterval(async () => {
      if (!this.syncStatus.syncInProgress) {
        const result = await this.syncPreferences(
          {} as UserPreferences, // This should be passed from the service
          'merge'
        );
        onSync(result);
      }
    }, intervalMs);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }
}

// Export singleton instance
export const userPreferencesAPI = UserPreferencesAPI.getInstance();