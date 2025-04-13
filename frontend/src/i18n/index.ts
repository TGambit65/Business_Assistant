/**
 * Internationalization (i18n) Configuration
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
// Define language constants here to avoid circular dependencies
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'ja', 'ar'];
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Initialize i18next
i18n
  // Load translations from the /public/locales folder
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize
  .init({
    // Default language
    fallbackLng: DEFAULT_LANGUAGE,
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    // Supported languages
    supportedLngs: SUPPORTED_LANGUAGES,
    // Namespace for translations
    ns: ['common', 'auth', 'dashboard', 'settings', 'emails'],
    defaultNS: 'common',
    // Backend configuration
    backend: {
      // Path to load translations from
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // Interpolation configuration
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },
    // React configuration
    react: {
      // Wait for translations to load
      useSuspense: true,
    },
    // Detection configuration
    detection: {
      // Order of detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache language in localStorage
      caches: ['localStorage'],
      // LocalStorage key
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Function to change the language
export const changeLanguage = (language: string) => {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    i18n.changeLanguage(language);

    // Set the document direction for RTL languages
    document.documentElement.dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';

    // Add a class to the body for RTL styling
    if (RTL_LANGUAGES.includes(language)) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }

    // Store the language preference
    localStorage.setItem('i18nextLng', language);
  }
};

// Function to get the current language
export const getCurrentLanguage = () => {
  return i18n.language || DEFAULT_LANGUAGE;
};

// Function to check if the current language is RTL
export const isRTL = () => {
  return RTL_LANGUAGES.includes(getCurrentLanguage());
};

export default i18n;
