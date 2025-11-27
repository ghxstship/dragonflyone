'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface LanguageSelectorProps {
  languages: Language[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

export function LanguageSelector({
  languages,
  currentLanguage,
  onLanguageChange,
  variant = 'default',
  className = '',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  if (variant === 'minimal') {
    return (
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-gap-xs px-spacing-2 py-spacing-1 text-mono-sm font-mono uppercase tracking-widest hover:bg-grey-100 transition-colors"
          aria-label="Select language"
        >
          <span>{currentLang.flag}</span>
          <span>{currentLang.code.toUpperCase()}</span>
          <ChevronDown className={`h-spacing-3 w-spacing-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-spacing-1 min-w-container-xs bg-surface-elevated text-text-primary border-2 border-border-primary shadow-hard z-popover">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-gap-xs px-spacing-3 py-spacing-2 text-left hover:bg-grey-100 transition-colors ${
                  lang.code === currentLanguage ? 'bg-grey-100 font-weight-bold' : ''
                }`}
              >
                <span>{lang.flag}</span>
                <span className="font-mono uppercase">{lang.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-gap-xs px-spacing-3 py-spacing-2 border-2 border-border-primary bg-surface-primary text-text-primary hover:bg-surface-secondary transition-colors"
          aria-label="Select language"
        >
          <span className="text-body-lg">{currentLang.flag}</span>
          <span className="font-heading text-mono-sm uppercase tracking-widest">{currentLang.code}</span>
          <ChevronDown className={`h-spacing-4 w-spacing-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-spacing-1 min-w-container-sm bg-surface-elevated text-text-primary border-2 border-border-primary shadow-hard z-popover">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-gap-sm px-spacing-3 py-spacing-2 text-left hover:bg-grey-100 transition-colors ${
                  lang.code === currentLanguage ? 'bg-grey-100' : ''
                }`}
              >
                <span className="text-body-lg">{lang.flag}</span>
                <span className="font-body text-body-sm">{lang.nativeName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-gap-sm px-spacing-4 py-spacing-3 border-2 border-border-primary bg-surface-primary text-text-primary hover:bg-surface-secondary transition-colors min-w-container-sm"
        aria-label="Select language"
      >
        <span className="text-body-lg">{currentLang.flag}</span>
        <div className="flex-1 text-left">
          <div className="font-heading text-mono-sm uppercase tracking-widest">{currentLang.name}</div>
          <div className="font-body text-mono-xs text-grey-600">{currentLang.nativeName}</div>
        </div>
        <ChevronDown className={`h-spacing-5 w-spacing-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-spacing-1 w-full bg-surface-elevated text-text-primary border-2 border-border-primary shadow-hard z-popover max-h-container-lg overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-gap-sm px-spacing-4 py-spacing-3 text-left hover:bg-grey-100 transition-colors border-b border-grey-200 last:border-b-0 ${
                lang.code === currentLanguage ? 'bg-grey-100' : ''
              }`}
            >
              <span className="text-body-lg">{lang.flag}</span>
              <div className="flex-1">
                <div className="font-heading text-mono-sm uppercase tracking-widest">{lang.name}</div>
                <div className="font-body text-mono-xs text-grey-600">{lang.nativeName}</div>
              </div>
              {lang.code === currentLanguage && (
                <span className="text-black font-weight-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
