/**
 * Font Selector Component
 * Font picker with preview and Google Fonts integration
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { FontOption } from './types';
import './font-selector.css';

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
  fonts?: FontOption[];
  description?: string;
}

export function FontSelector({
  label,
  value,
  onChange,
  fonts = DEFAULT_FONTS,
  description,
}: FontSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedFont = fonts.find((f) => f.family === value) || fonts[0];

  const filteredFonts = fonts.filter(
    (font) =>
      font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      font.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFontSelect = useCallback(
    (font: FontOption) => {
      onChange(font.family);
      setShowDropdown(false);
      setSearchQuery('');
    },
    [onChange]
  );

  return (
    <div className="font-selector">
      <div className="font-selector__header">
        <label className="font-selector__label">{label}</label>
        {description && <p className="font-selector__description">{description}</p>}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        className="font-selector__trigger"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="font-selector__current">
          <span
            className="font-selector__preview"
            style={{ fontFamily: selectedFont.family }}
          >
            {selectedFont.preview}
          </span>
          <div className="font-selector__details">
            <span className="font-selector__name">{selectedFont.name}</span>
            <span className="font-selector__category">{selectedFont.category}</span>
          </div>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="font-selector__dropdown">
          {/* Search */}
          <div className="font-selector__search">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="font-selector__search-input"
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Font List */}
          <div className="font-selector__list">
            {filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  className={`font-selector__option ${
                    font.family === value ? 'font-selector__option--active' : ''
                  }`}
                  onClick={() => handleFontSelect(font)}
                >
                  <span
                    className="font-selector__option-preview"
                    style={{ fontFamily: font.family }}
                  >
                    {font.preview}
                  </span>
                  <div className="font-selector__option-details">
                    <span className="font-selector__option-name">{font.name}</span>
                    <span className="font-selector__option-category">
                      {font.category}
                    </span>
                  </div>
                  {font.family === value && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="font-selector__check"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="font-selector__empty">
                No fonts found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Default font options
export const DEFAULT_FONTS: FontOption[] = [
  {
    id: 'inter',
    name: 'Inter',
    family: 'Inter, sans-serif',
    category: 'sans-serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: 'Outfit, sans-serif',
    category: 'sans-serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: 'Poppins, sans-serif',
    category: 'sans-serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    category: 'sans-serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    family: 'Open Sans, sans-serif',
    category: 'sans-serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: 'Montserrat, sans-serif',
    category: 'sans-serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'lato',
    name: 'Lato',
    family: 'Lato, sans-serif',
    category: 'sans-serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    family: 'Playfair Display, serif',
    category: 'serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    family: 'Merriweather, serif',
    category: 'serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
  {
    id: 'lora',
    name: 'Lora',
    family: 'Lora, serif',
    category: 'serif',
    preview: 'The quick brown fox',
    googleFont: true,
  },
];

FontSelector.displayName = 'FontSelector';
