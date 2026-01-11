/**
 * Theme Preview Component
 * Live preview of theme changes with device frames
 */

'use client';

import React from 'react';
import { ExperienceThemeProvider, ExperienceThemeStyles } from '../../whitelabel';
import type { ExperienceThemeConfig } from '../../whitelabel/experience-theme';
import './theme-preview.css';

interface ThemePreviewProps {
  config: ExperienceThemeConfig;
  mode?: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

export function ThemePreview({ config, mode = 'desktop', children }: ThemePreviewProps) {
  return (
    <div className="theme-preview">
      {/* Device Frame */}
      <div className={`theme-preview__frame theme-preview__frame--${mode}`}>
        <div className="theme-preview__viewport">
          {/* Inject theme and render preview */}
          <ExperienceThemeStyles config={config} />
          <ExperienceThemeProvider config={config}>
            <div className="theme-preview__content">{children}</div>
          </ExperienceThemeProvider>
        </div>
      </div>

      {/* Device Switcher */}
      <div className="theme-preview__controls">
        <span className="theme-preview__label">Preview Mode:</span>
        <div className="theme-preview__modes">
          <button
            type="button"
            className={`theme-preview__mode ${
              mode === 'desktop' ? 'theme-preview__mode--active' : ''
            }`}
            aria-label="Desktop view"
            title="Desktop (1280px)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>
          <button
            type="button"
            className={`theme-preview__mode ${
              mode === 'tablet' ? 'theme-preview__mode--active' : ''
            }`}
            aria-label="Tablet view"
            title="Tablet (768px)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`theme-preview__mode ${
              mode === 'mobile' ? 'theme-preview__mode--active' : ''
            }`}
            aria-label="Mobile view"
            title="Mobile (375px)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

ThemePreview.displayName = 'ThemePreview';
