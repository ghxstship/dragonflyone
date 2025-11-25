/**
 * Internationalization (i18n) Configuration
 * Provides multilingual support for GHXSTSHIP platform
 */

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'ko' | 'it' | 'ru' | 'ar';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  flag: string;
}

export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    currency: 'USD',
    flag: '🇺🇸',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    flag: '🇪🇸',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    flag: '🇫🇷',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    flag: '🇩🇪',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'BRL',
    flag: '🇧🇷',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    currency: 'CNY',
    flag: '🇨🇳',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    currency: 'JPY',
    flag: '🇯🇵',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    dateFormat: 'YYYY.MM.DD',
    timeFormat: 'HH:mm',
    currency: 'KRW',
    flag: '🇰🇷',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    flag: '🇮🇹',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    currency: 'RUB',
    flag: '🇷🇺',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'AED',
    flag: '🇸🇦',
  },
};

export const DEFAULT_LOCALE: Locale = 'en';

export function getLocaleConfig(locale: Locale): LocaleConfig {
  return SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES[DEFAULT_LOCALE];
}

export function isRTL(locale: Locale): boolean {
  return getLocaleConfig(locale).direction === 'rtl';
}

export function getSupportedLocales(): LocaleConfig[] {
  return Object.values(SUPPORTED_LOCALES);
}

export function isValidLocale(locale: string): locale is Locale {
  return locale in SUPPORTED_LOCALES;
}

// Export all translations
export { en } from './translations/en.js';
export { es } from './translations/es.js';
export { fr } from './translations/fr.js';
export { de } from './translations/de.js';
export { it } from './translations/it.js';
export { pt } from './translations/pt.js';
export { ja } from './translations/ja.js';
export { zh } from './translations/zh.js';
export { ko } from './translations/ko.js';
export { ar } from './translations/ar.js';
export { ru } from './translations/ru.js';

// Re-export translation hook and provider
export { I18nProvider, useTranslation } from './useTranslation.js';

// Re-export detailed locale configuration
export {
  SUPPORTED_LOCALES as DETAILED_LOCALES,
  RTL_LOCALES,
  DATE_FORMATS,
  TIME_FORMATS,
  getLocaleByCode,
  getLocalesByLanguage,
  getDateFormat,
  getTimeFormat,
} from './locales.js';
