export const SUPPORTED_LOCALES = [
  { code: 'en-US', language: 'en', region: 'US', name: 'English (US)', nativeName: 'English (US)', direction: 'ltr' as const, isDefault: true },
  { code: 'en-GB', language: 'en', region: 'GB', name: 'English (UK)', nativeName: 'English (UK)', direction: 'ltr' as const },
  { code: 'es-ES', language: 'es', region: 'ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', direction: 'ltr' as const },
  { code: 'es-MX', language: 'es', region: 'MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', direction: 'ltr' as const },
  { code: 'fr-FR', language: 'fr', region: 'FR', name: 'French (France)', nativeName: 'Français (France)', direction: 'ltr' as const },
  { code: 'fr-CA', language: 'fr', region: 'CA', name: 'French (Canada)', nativeName: 'Français (Canada)', direction: 'ltr' as const },
  { code: 'de-DE', language: 'de', region: 'DE', name: 'German', nativeName: 'Deutsch', direction: 'ltr' as const },
  { code: 'it-IT', language: 'it', region: 'IT', name: 'Italian', nativeName: 'Italiano', direction: 'ltr' as const },
  { code: 'pt-BR', language: 'pt', region: 'BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', direction: 'ltr' as const },
  { code: 'pt-PT', language: 'pt', region: 'PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', direction: 'ltr' as const },
  { code: 'zh-CN', language: 'zh', region: 'CN', name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr' as const },
  { code: 'zh-TW', language: 'zh', region: 'TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', direction: 'ltr' as const },
  { code: 'ja-JP', language: 'ja', region: 'JP', name: 'Japanese', nativeName: '日本語', direction: 'ltr' as const },
  { code: 'ko-KR', language: 'ko', region: 'KR', name: 'Korean', nativeName: '한국어', direction: 'ltr' as const },
  { code: 'ar-SA', language: 'ar', region: 'SA', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' as const },
  { code: 'he-IL', language: 'he', region: 'IL', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl' as const },
  { code: 'ru-RU', language: 'ru', region: 'RU', name: 'Russian', nativeName: 'Русский', direction: 'ltr' as const },
  { code: 'nl-NL', language: 'nl', region: 'NL', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr' as const },
  { code: 'pl-PL', language: 'pl', region: 'PL', name: 'Polish', nativeName: 'Polski', direction: 'ltr' as const },
  { code: 'sv-SE', language: 'sv', region: 'SE', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr' as const },
] as const;

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code'];
export type LanguageCode = typeof SUPPORTED_LOCALES[number]['language'];
export type TextDirection = 'ltr' | 'rtl';

export const DEFAULT_LOCALE: LocaleCode = 'en-US';
export const FALLBACK_LOCALE: LocaleCode = 'en-US';

export const RTL_LOCALES: LocaleCode[] = SUPPORTED_LOCALES
  .filter(l => l.direction === 'rtl')
  .map(l => l.code);

export function getLocaleByCode(code: string): typeof SUPPORTED_LOCALES[number] | undefined {
  return SUPPORTED_LOCALES.find(l => l.code === code);
}

export function getLocalesByLanguage(language: string): typeof SUPPORTED_LOCALES[number][] {
  return SUPPORTED_LOCALES.filter(l => l.language === language);
}

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale as LocaleCode);
}

export function getTextDirection(locale: string): TextDirection {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

export const DATE_FORMATS: Record<string, string> = {
  'en-US': 'MM/DD/YYYY',
  'en-GB': 'DD/MM/YYYY',
  'es-ES': 'DD/MM/YYYY',
  'es-MX': 'DD/MM/YYYY',
  'fr-FR': 'DD/MM/YYYY',
  'fr-CA': 'YYYY-MM-DD',
  'de-DE': 'DD.MM.YYYY',
  'it-IT': 'DD/MM/YYYY',
  'pt-BR': 'DD/MM/YYYY',
  'pt-PT': 'DD/MM/YYYY',
  'zh-CN': 'YYYY/MM/DD',
  'zh-TW': 'YYYY/MM/DD',
  'ja-JP': 'YYYY/MM/DD',
  'ko-KR': 'YYYY.MM.DD',
  'ar-SA': 'DD/MM/YYYY',
  'he-IL': 'DD/MM/YYYY',
  'ru-RU': 'DD.MM.YYYY',
  'nl-NL': 'DD-MM-YYYY',
  'pl-PL': 'DD.MM.YYYY',
  'sv-SE': 'YYYY-MM-DD',
};

export const TIME_FORMATS: Record<string, string> = {
  'en-US': 'h:mm A',
  'en-GB': 'HH:mm',
  'es-ES': 'HH:mm',
  'es-MX': 'h:mm A',
  'fr-FR': 'HH:mm',
  'fr-CA': 'HH:mm',
  'de-DE': 'HH:mm',
  'it-IT': 'HH:mm',
  'pt-BR': 'HH:mm',
  'pt-PT': 'HH:mm',
  'zh-CN': 'HH:mm',
  'zh-TW': 'HH:mm',
  'ja-JP': 'HH:mm',
  'ko-KR': 'HH:mm',
  'ar-SA': 'HH:mm',
  'he-IL': 'HH:mm',
  'ru-RU': 'HH:mm',
  'nl-NL': 'HH:mm',
  'pl-PL': 'HH:mm',
  'sv-SE': 'HH:mm',
};

export function getDateFormat(locale: string): string {
  return DATE_FORMATS[locale] || DATE_FORMATS[DEFAULT_LOCALE];
}

export function getTimeFormat(locale: string): string {
  return TIME_FORMATS[locale] || TIME_FORMATS[DEFAULT_LOCALE];
}
