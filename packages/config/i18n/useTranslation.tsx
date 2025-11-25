'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Locale, LocaleConfig } from './index';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, getLocaleConfig, isValidLocale } from './index';
import { en, TranslationKeys } from './translations/en';
import { es } from './translations/es';
import { fr } from './translations/fr';
import { de } from './translations/de';
import { it } from './translations/it';
import { pt } from './translations/pt';
import { ja } from './translations/ja';
import { zh } from './translations/zh';
import { ko } from './translations/ko';
import { ar } from './translations/ar';
import { ru } from './translations/ru';

// Translation dictionaries - all 11 languages fully supported
const translations: Record<Locale, TranslationKeys> = {
  en,
  es,
  fr,
  de,
  it,
  pt,
  ja,
  zh,
  ko,
  ar,
  ru,
};

interface I18nContextValue {
  locale: Locale;
  localeConfig: LocaleConfig;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (num: number) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = 'ghxstship_locale';

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export function I18nProvider({ children, defaultLocale = DEFAULT_LOCALE }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Load saved locale from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale && isValidLocale(savedLocale)) {
        setLocaleState(savedLocale);
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (isValidLocale(browserLang)) {
          setLocaleState(browserLang);
        }
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      // Update document direction for RTL languages
      document.documentElement.dir = getLocaleConfig(newLocale).direction;
      document.documentElement.lang = newLocale;
    }
  }, []);

  const localeConfig = getLocaleConfig(locale);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[locale], key) || 
                       getNestedValue(translations[DEFAULT_LOCALE], key) || 
                       key;
    
    if (!params) return translation;
    
    // Replace {{param}} placeholders with values
    return Object.entries(params).reduce(
      (str, [paramKey, value]) => str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value)),
      translation
    );
  }, [locale]);

  const formatDate = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  }, [locale]);

  const formatTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }, [locale]);

  const formatCurrency = useCallback((amount: number, currency?: string): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || localeConfig.currency,
    }).format(amount);
  }, [locale, localeConfig.currency]);

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat(locale).format(num);
  }, [locale]);

  const value: I18nContextValue = {
    locale,
    localeConfig,
    setLocale,
    t,
    formatDate,
    formatTime,
    formatCurrency,
    formatNumber,
    isRTL: localeConfig.direction === 'rtl',
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

// Note: SUPPORTED_LOCALES and getSupportedLocales are exported from ./index.ts
// Import them directly from there to avoid circular dependencies
