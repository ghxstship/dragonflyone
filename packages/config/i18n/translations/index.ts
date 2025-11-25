/**
 * Translation exports for all supported languages
 * GHXSTSHIP Platform - 11 languages supported
 */

export { en, type TranslationKeys } from './en';
export { es } from './es';
export { fr } from './fr';
export { de } from './de';
export { it } from './it';
export { pt } from './pt';
export { ja } from './ja';
export { zh } from './zh';
export { ko } from './ko';
export { ar } from './ar';
export { ru } from './ru';

// All translations as a record
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { it } from './it';
import { pt } from './pt';
import { ja } from './ja';
import { zh } from './zh';
import { ko } from './ko';
import { ar } from './ar';
import { ru } from './ru';

export const translations = {
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
} as const;

export type SupportedLanguage = keyof typeof translations;
