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
          className="flex items-center gap-1 px-2 py-1 text-sm font-mono uppercase tracking-wider hover:bg-grey-100 transition-colors"
          aria-label="Select language"
        >
          <span>{currentLang.flag}</span>
          <span>{currentLang.code.toUpperCase()}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 min-w-[120px] bg-white border-2 border-black shadow-hard z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-grey-100 transition-colors ${
                  lang.code === currentLanguage ? 'bg-grey-100 font-bold' : ''
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
          className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white hover:bg-grey-100 transition-colors"
          aria-label="Select language"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="font-heading text-sm uppercase tracking-wider">{currentLang.code}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 min-w-[160px] bg-white border-2 border-black shadow-hard z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-grey-100 transition-colors ${
                  lang.code === currentLanguage ? 'bg-grey-100' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-body text-sm">{lang.nativeName}</span>
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
        className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white hover:bg-grey-100 transition-colors min-w-[200px]"
        aria-label="Select language"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <div className="flex-1 text-left">
          <div className="font-heading text-sm uppercase tracking-wider">{currentLang.name}</div>
          <div className="font-body text-xs text-grey-600">{currentLang.nativeName}</div>
        </div>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border-2 border-black shadow-hard z-50 max-h-[300px] overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-grey-100 transition-colors border-b border-grey-200 last:border-b-0 ${
                lang.code === currentLanguage ? 'bg-grey-100' : ''
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="font-heading text-sm uppercase tracking-wider">{lang.name}</div>
                <div className="font-body text-xs text-grey-600">{lang.nativeName}</div>
              </div>
              {lang.code === currentLanguage && (
                <span className="text-black font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
