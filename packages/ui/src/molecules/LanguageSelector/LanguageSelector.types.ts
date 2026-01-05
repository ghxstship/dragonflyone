/**
 * Language interface
 */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * LanguageSelector component props
 */
export interface LanguageSelectorProps {
  languages: Language[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  variant?: LanguageSelectorVariant;
  inverted?: boolean;
  className?: string;
}

/**
 * LanguageSelector variant types
 */
export type LanguageSelectorVariant = 
  | "default"
  | "compact"
  | "minimal";
