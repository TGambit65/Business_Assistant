/**
 * User Preferences Hooks
 * 
 * Convenience hooks for accessing and managing user preferences
 */

export {
  useUserPreferences,
  useLanguagePreference,
  useThemePreference,
  useAccessibilityPreferences,
  useNotificationPreferences,
  useSecurityPreferences,
  useDisplayPreferences,
  useEmailPreferences,
  useAIPreferences,
} from '../contexts/UserPreferencesContext';

// Re-export types for convenience
export type {
  UserPreferences,
  AccessibilityPreferences,
  NotificationPreferences,
  SecurityPreferences,
  DisplayPreferences,
  EmailPreferences,
  AIPreferences,
  RephraseSettings,
  AttachmentBehaviors,
} from '../types/preferences';