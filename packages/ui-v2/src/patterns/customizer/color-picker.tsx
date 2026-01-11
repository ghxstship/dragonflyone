/**
 * Color Picker Component
 * Advanced color picker with presets and hex input
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { ColorPreset } from './types';
import './color-picker.css';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: ColorPreset[];
  description?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  presets,
  description,
}: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setHexInput(input);

      // Validate hex color
      if (/^#[0-9A-F]{6}$/i.test(input)) {
        onChange(input);
      }
    },
    [onChange]
  );

  const handlePresetClick = useCallback(
    (color: string) => {
      setHexInput(color);
      onChange(color);
      setShowPicker(false);
    },
    [onChange]
  );

  return (
    <div className="color-picker">
      <div className="color-picker__header">
        <label className="color-picker__label">{label}</label>
        {description && <p className="color-picker__description">{description}</p>}
      </div>

      <div className="color-picker__controls">
        {/* Color Preview & Trigger */}
        <button
          type="button"
          className="color-picker__trigger"
          onClick={() => setShowPicker(!showPicker)}
          aria-label={`Pick ${label}`}
        >
          <div
            className="color-picker__swatch"
            style={{ backgroundColor: value }}
          />
          <span className="color-picker__value">{value}</span>
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

        {/* Hex Input */}
        <input
          type="text"
          className="color-picker__hex-input"
          value={hexInput}
          onChange={handleHexChange}
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {/* Picker Dropdown */}
      {showPicker && (
        <div className="color-picker__dropdown">
          {/* Native Color Input */}
          <div className="color-picker__native">
            <label className="color-picker__native-label">
              Pick Custom Color
              <input
                type="color"
                value={value}
                onChange={(e) => {
                  setHexInput(e.target.value.toUpperCase());
                  onChange(e.target.value.toUpperCase());
                }}
                className="color-picker__native-input"
              />
            </label>
          </div>

          {/* Presets */}
          {presets && presets.length > 0 && (
            <div className="color-picker__presets">
              <div className="color-picker__presets-label">Preset Colors</div>
              <div className="color-picker__presets-grid">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`color-picker__preset ${
                      preset.primary === value ? 'color-picker__preset--active' : ''
                    }`}
                    onClick={() => handlePresetClick(preset.primary)}
                    title={preset.name}
                    aria-label={`Use ${preset.name}`}
                  >
                    <div
                      className="color-picker__preset-swatch"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span className="color-picker__preset-name">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Default color presets
export const DEFAULT_COLOR_PRESETS: ColorPreset[] = [
  { id: 'purple', name: 'Purple', primary: '#7B68EE' },
  { id: 'blue', name: 'Blue', primary: '#0066FF' },
  { id: 'teal', name: 'Teal', primary: '#06B6D4' },
  { id: 'green', name: 'Green', primary: '#10B981' },
  { id: 'orange', name: 'Orange', primary: '#FF6B35' },
  { id: 'red', name: 'Red', primary: '#EF4444' },
  { id: 'pink', name: 'Pink', primary: '#EC4899' },
  { id: 'indigo', name: 'Indigo', primary: '#6366F1' },
];

ColorPicker.displayName = 'ColorPicker';
