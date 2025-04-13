/**
 * Accessibility Utilities
 *
 * Provides utilities for improving accessibility in the application
 */

import { REDUCED_MOTION_ENABLED, HIGH_CONTRAST_MODE_ENABLED, SCREEN_READER_HINTS_ENABLED } from '../config/constants';

// Accessibility preferences
export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderHints: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  lineSpacing: 'normal' | 'wide' | 'wider';
  keyboardNavigation: boolean;
}

// Default preferences
const defaultPreferences: AccessibilityPreferences = {
  reducedMotion: REDUCED_MOTION_ENABLED,
  highContrast: HIGH_CONTRAST_MODE_ENABLED,
  screenReaderHints: SCREEN_READER_HINTS_ENABLED,
  fontSize: 'medium',
  lineSpacing: 'normal',
  keyboardNavigation: true,
};

// Get preferences from localStorage or use defaults
export const getAccessibilityPreferences = (): AccessibilityPreferences => {
  try {
    const storedPrefs = localStorage.getItem('accessibility_preferences');
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
  } catch (error) {
    console.error('Error reading accessibility preferences:', error);
  }
  return defaultPreferences;
};

// Save preferences to localStorage
export const saveAccessibilityPreferences = (preferences: AccessibilityPreferences): void => {
  try {
    localStorage.setItem('accessibility_preferences', JSON.stringify(preferences));
    applyAccessibilityPreferences(preferences);
  } catch (error) {
    console.error('Error saving accessibility preferences:', error);
  }
};

// Apply preferences to the document
export const applyAccessibilityPreferences = (preferences: AccessibilityPreferences): void => {
  // Apply reduced motion
  if (preferences.reducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  } else {
    document.documentElement.classList.remove('reduced-motion');
  }

  // Apply high contrast
  if (preferences.highContrast) {
    document.documentElement.classList.add('high-contrast');
  } else {
    document.documentElement.classList.remove('high-contrast');
  }

  // Apply font size
  document.documentElement.classList.remove('font-small', 'font-medium', 'font-large', 'font-x-large');
  document.documentElement.classList.add(`font-${preferences.fontSize}`);

  // Apply line spacing
  document.documentElement.classList.remove('line-spacing-normal', 'line-spacing-wide', 'line-spacing-wider');
  document.documentElement.classList.add(`line-spacing-${preferences.lineSpacing}`);

  // Apply keyboard navigation
  if (preferences.keyboardNavigation) {
    document.documentElement.classList.add('keyboard-navigation');
  } else {
    document.documentElement.classList.remove('keyboard-navigation');
  }
};

// Initialize accessibility preferences
export const initializeAccessibility = (): void => {
  const preferences = getAccessibilityPreferences();
  applyAccessibilityPreferences(preferences);

  // Check for system preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion && !preferences.reducedMotion) {
    const updatedPrefs = { ...preferences, reducedMotion: true };
    saveAccessibilityPreferences(updatedPrefs);
  }

  // Add focus visible polyfill
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-user');
    }
  });

  document.body.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-user');
  });
};

// Generate ARIA attributes for a component
export const getAriaAttributes = (
  role: string,
  label?: string,
  description?: string,
  expanded?: boolean,
  controls?: string,
  live?: 'off' | 'polite' | 'assertive',
  relevant?: string
): Record<string, string | boolean | undefined> => {
  const attributes: Record<string, string | boolean | undefined> = {
    role,
  };

  if (label) {
    attributes['aria-label'] = label;
  }

  if (description) {
    attributes['aria-describedby'] = description;
  }

  if (expanded !== undefined) {
    attributes['aria-expanded'] = expanded;
  }

  if (controls) {
    attributes['aria-controls'] = controls;
  }

  if (live) {
    attributes['aria-live'] = live;
  }

  if (relevant) {
    attributes['aria-relevant'] = relevant;
  }

  return attributes;
};

// Add screen reader only text - this would be a React component
// Since we're in a TypeScript file, we'll just provide a CSS class
// The actual component would be implemented in a JSX/TSX file

// Check if screen reader is active (best effort)
export const isScreenReaderActive = (): boolean => {
  // This is not 100% reliable, but it's a best effort
  return (
    document.documentElement.getAttribute('data-screen-reader') === 'true' ||
    navigator.userAgent.toLowerCase().includes('screenreader') ||
    // @ts-ignore - Non-standard property
    (window.speechSynthesis && window.speechSynthesis.speaking)
  );
};

// Announce message to screen readers
export const announceToScreenReader = (message: string, assertive = false): void => {
  const announcer = document.getElementById('screen-reader-announcer');

  if (!announcer) {
    // Create announcer if it doesn't exist
    const newAnnouncer = document.createElement('div');
    newAnnouncer.id = 'screen-reader-announcer';
    newAnnouncer.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    newAnnouncer.setAttribute('aria-atomic', 'true');
    newAnnouncer.classList.add('sr-only');
    document.body.appendChild(newAnnouncer);

    // Wait a moment before announcing
    setTimeout(() => {
      newAnnouncer.textContent = message;
    }, 100);
  } else {
    // Clear existing content first
    announcer.textContent = '';

    // Wait a moment before announcing
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }
};
