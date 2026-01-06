"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { 
  languageSelectorVariants,
  languageSelectorDropdownVariants,
  languageSelectorOptionVariants 
} from "./LanguageSelector.variants.js";
import type { LanguageSelectorProps } from "./LanguageSelector.types.js";

/**
 * LanguageSelector component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Interactive dropdown
 * - Flag display
 * - CVA-based variants for consistent theming
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <LanguageSelector
 *   languages={[
 *     { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
 *     { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
 *     { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' }
 *   ]}
 *   currentLanguage="en"
 *   onLanguageChange={(code) => console.log('Language changed:', code)}
 * />
 * ```
 */
export function LanguageSelector({
  languages,
  currentLanguage,
  onLanguageChange,
  variant = "default",
  inverted = false,
  className,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle language selection
  const handleSelect = (code: string) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Minimal variant - simple button
  if (variant === "minimal") {
    return (
      <button
        className={languageSelectorVariants({ variant, className })}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={`Current language: ${currentLang.name}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
      </button>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        className={languageSelectorVariants({ variant, className })}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={`Current language: ${currentLang.name}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg">{currentLang.flag}</span>
        
        {variant === "default" && (
          <>
            <span className="hidden sm:inline">{currentLang.name}</span>
            <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
          </>
        )}
        
        {variant === "compact" && (
          <span>{currentLang.code.toUpperCase()}</span>
        )}
        
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-[var(--duration-fast)] ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>

      {/* Dropdown */}
      <div className={languageSelectorDropdownVariants({ isOpen })}>
        <div role="listbox" aria-label="Select language">
          {languages.map((language) => (
            <button
              key={language.code}
              className={languageSelectorOptionVariants({ 
                selected: language.code === currentLanguage, 
                inverted 
              })}
              onClick={() => handleSelect(language.code)}
              role="option"
              aria-selected={language.code === currentLanguage}
            >
              <span className="text-lg">{language.flag}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{language.name}</div>
                <div className="text-sm opacity-75">{language.nativeName}</div>
              </div>
              {language.code === currentLanguage && (
                <div className="w-2 h-2 bg-brand-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
