/**
 * TypeScript definitions for User-related types
 */

/**
 * User preferences for email and application settings
 */
export interface UserPreferences {
  defaultEmailSignature: string;
  defaultReplySignature: string;
  defaultLanguage: string;
  defaultTone: string;
  showNotifications: boolean;
  emailRefreshInterval: number; // in seconds
  sendReceiptConfirmation: boolean;
  defaultFontSize: string;
  defaultFontFamily: string;
  useRichTextEditor: boolean;
  useDarkMode?: boolean;
  useSpellCheck: boolean;
  alwaysShowBcc: boolean;
  useThreadView: boolean;
}

/**
 * User application settings
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  layout: 'compact' | 'comfortable' | 'spacious';
  sidebar: {
    expanded: boolean;
    favorites: string[]; // IDs of favorite folders
  };
  notifications: {
    email: boolean;
    browser: boolean;
    sound: boolean;
    desktop: boolean;
  };
  shortcuts: Record<string, string>; // Custom keyboard shortcuts
  ai: {
    enabled: boolean;
    useDemoMode: boolean;
    autoSuggest: boolean;
    suggestionThreshold: number; // 0-100
    allowBackgroundProcessing: boolean;
  };
  privacy: {
    sendAnonymousUsageData: boolean;
    storeHistory: boolean;
    historyRetentionDays: number;
  };
}

/**
 * User authentication data
 */
export interface UserAuth {
  id: string;
  email: string;
  isEmailVerified: boolean;
  provider: 'email' | 'google' | 'microsoft' | 'github';
  lastLogin: Date;
  twoFactorEnabled: boolean;
  failedLoginAttempts?: number;
  roles: ('user' | 'admin' | 'manager')[];
  permissions?: string[];
}

/**
 * User profile information
 */
export interface UserProfile {
  displayName: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  department?: string;
  organization?: string;
  avatar?: string; // URL to avatar image
  bio?: string;
  phoneNumber?: string;
  timezone?: string;
  location?: string;
  language?: string;
}

/**
 * User analytics and usage data
 */
export interface UserAnalytics {
  emailsSent: number;
  emailsReceived: number;
  responseTime: number; // Average response time in minutes
  activeHours: number[];
  mostActiveDay: string;
  aiUsage: {
    draftsGenerated: number;
    responsesUsed: number;
    tokensConsumed: number;
    suggestionsAccepted: number;
    suggestionsRejected: number;
  };
}

/**
 * Complete user object combining all user data
 */
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  settings: UserSettings;
  profile?: UserProfile;
  auth?: UserAuth;
  analytics?: UserAnalytics;
  createdAt: Date;
  updatedAt?: Date;
  lastActive?: Date;
  isPremium?: boolean;
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    features: string[];
  };
} 