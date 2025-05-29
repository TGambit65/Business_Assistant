/**
 * Language detection utilities for email content
 */

import { SUPPORTED_LANGUAGES } from '../i18n';

// Common words in different languages for basic detection
const LANGUAGE_PATTERNS = {
  en: ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they'],
  es: ['que', 'de', 'no', 'la', 'el', 'en', 'es', 'se', 'lo', 'un'],
  fr: ['de', 'le', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
  de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
  pt: ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para'],
  ru: ['в', 'и', 'не', 'на', 'я', 'быть', 'он', 'с', 'как', 'а'],
  zh: ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人'],
  ja: ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し'],
  ar: ['في', 'من', 'إلى', 'على', 'أن', 'هذا', 'هذه', 'التي', 'الذي', 'كان']
};

/**
 * Simple language detection based on common words
 */
export function detectLanguage(text: string): string {
  if (!text || text.trim().length < 10) {
    return 'en'; // Default to English for short texts
  }

  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(word => word.length > 1);

  if (words.length < 5) {
    return 'en'; // Default to English for very short texts
  }

  const scores: { [key: string]: number } = {};

  // Initialize scores
  SUPPORTED_LANGUAGES.forEach(lang => {
    scores[lang] = 0;
  });

  // Count matches for each language
  words.forEach(word => {
    Object.entries(LANGUAGE_PATTERNS).forEach(([lang, patterns]) => {
      if (patterns.includes(word)) {
        scores[lang] = (scores[lang] || 0) + 1;
      }
    });
  });

  // Find the language with the highest score
  let detectedLang = 'en';
  let maxScore = 0;

  Object.entries(scores).forEach(([lang, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  });

  // Return detected language only if confidence is high enough
  const confidence = maxScore / words.length;
  return confidence > 0.1 ? detectedLang : 'en';
}

/**
 * Detect language with confidence score
 */
export function detectLanguageWithConfidence(text: string): { language: string; confidence: number } {
  if (!text || text.trim().length < 10) {
    return { language: 'en', confidence: 0 };
  }

  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(word => word.length > 1);

  if (words.length < 5) {
    return { language: 'en', confidence: 0 };
  }

  const scores: { [key: string]: number } = {};

  // Initialize scores
  SUPPORTED_LANGUAGES.forEach(lang => {
    scores[lang] = 0;
  });

  // Count matches for each language
  words.forEach(word => {
    Object.entries(LANGUAGE_PATTERNS).forEach(([lang, patterns]) => {
      if (patterns.includes(word)) {
        scores[lang] = (scores[lang] || 0) + 1;
      }
    });
  });

  // Find the language with the highest score
  let detectedLang = 'en';
  let maxScore = 0;

  Object.entries(scores).forEach(([lang, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  });

  const confidence = maxScore / words.length;
  return {
    language: confidence > 0.1 ? detectedLang : 'en',
    confidence
  };
}

/**
 * Check if the detected language is different from the current UI language
 */
export function shouldSuggestTranslation(text: string, currentLanguage: string): boolean {
  const detection = detectLanguageWithConfidence(text);
  return detection.confidence > 0.2 && detection.language !== currentLanguage;
}

/**
 * Get language suggestions for email content
 */
export function getLanguageSuggestions(text: string, currentLanguage: string): string[] {
  const detection = detectLanguageWithConfidence(text);
  const suggestions: string[] = [];

  if (detection.confidence > 0.2 && detection.language !== currentLanguage) {
    suggestions.push(detection.language);
  }

  // Always suggest English if it's not the detected language and not the current language
  if (detection.language !== 'en' && currentLanguage !== 'en') {
    suggestions.push('en');
  }

  return suggestions;
}

/**
 * Format language name for display
 */
export function getLanguageDisplayName(languageCode: string): string {
  const names: { [key: string]: string } = {
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

  return names[languageCode] || languageCode;
}

/**
 * Check if a language requires RTL layout
 */
export function isRTLLanguage(languageCode: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(languageCode);
}