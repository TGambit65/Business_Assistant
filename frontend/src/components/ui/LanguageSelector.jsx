import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { changeLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '../../i18n';

const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية'
};

const LANGUAGE_FLAGS = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇵🇹',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ar: '🇸🇦'
};

const LanguageSelector = ({ variant = 'dropdown', showLabel = true, className = '' }) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setCurrentLang(languageCode);
    setIsOpen(false);
    
    // Store language preference in user preferences if available
    try {
      const existingPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      localStorage.setItem('userPreferences', JSON.stringify({
        ...existingPrefs,
        language: languageCode
      }));
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={t('language')}
        >
          <span className="text-lg">{LANGUAGE_FLAGS[currentLang]}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{LANGUAGE_FLAGS[lang]}</span>
                    <span>{LANGUAGE_NAMES[lang]}</span>
                  </div>
                  {currentLang === lang && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <Globe className="h-4 w-4" />
        {showLabel && (
          <>
            <span className="text-lg">{LANGUAGE_FLAGS[currentLang]}</span>
            <span>{LANGUAGE_NAMES[currentLang]}</span>
          </>
        )}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              {t('language')}
            </div>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{LANGUAGE_FLAGS[lang]}</span>
                  <span>{LANGUAGE_NAMES[lang]}</span>
                </div>
                {currentLang === lang && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;