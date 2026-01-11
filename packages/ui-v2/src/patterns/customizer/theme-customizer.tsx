/**
 * Theme Customizer Component
 * Complete white-label theme customization interface
 */

'use client';

import React, { useReducer, useCallback, useState } from 'react';
import { ColorPicker, DEFAULT_COLOR_PRESETS } from './color-picker';
import { FontSelector, DEFAULT_FONTS } from './font-selector';
import { LogoUploader } from './logo-uploader';
import { ThemePreview } from './theme-preview';
import { customizerReducer, createInitialCustomizerState } from './customizer-reducer';
import type { ExperienceThemeConfig } from '../../whitelabel/experience-theme';
import './theme-customizer.css';

interface ThemeCustomizerProps {
  organizerId: string;
  initialConfig: ExperienceThemeConfig;
  onSave?: (config: ExperienceThemeConfig) => Promise<void>;
  previewContent?: React.ReactNode;
}

export function ThemeCustomizer({
  organizerId,
  initialConfig,
  onSave,
  previewContent,
}: ThemeCustomizerProps) {
  const [state, dispatch] = useReducer(
    customizerReducer,
    initialConfig,
    createInitialCustomizerState
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  // Handle save
  const handleSave = useCallback(async () => {
    dispatch({ type: 'SAVE_START' });
    setSaveError(null);

    try {
      // Call API to save configuration
      const response = await fetch(`/api/whitelabel/${organizerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.config),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const savedConfig = await response.json();
      dispatch({ type: 'SAVE_SUCCESS', config: savedConfig });

      if (onSave) {
        await onSave(savedConfig);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save';
      setSaveError(message);
      dispatch({ type: 'SAVE_ERROR', error: message });
    }
  }, [organizerId, state.config, onSave]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (
      state.hasUnsavedChanges &&
      !confirm('Are you sure you want to discard your changes?')
    ) {
      return;
    }
    dispatch({ type: 'SAVE_SUCCESS', config: initialConfig });
  }, [state.hasUnsavedChanges, initialConfig]);

  return (
    <div className="theme-customizer">
      {/* Header */}
      <div className="theme-customizer__header">
        <div className="theme-customizer__title-group">
          <h1 className="theme-customizer__title">Theme Customizer</h1>
          <p className="theme-customizer__subtitle">
            Customize your white-label experience pages
          </p>
        </div>

        {/* Actions */}
        <div className="theme-customizer__actions">
          <button
            type="button"
            className="theme-customizer__btn theme-customizer__btn--secondary"
            onClick={handleReset}
            disabled={!state.hasUnsavedChanges || state.isSaving}
          >
            Reset
          </button>
          <button
            type="button"
            className="theme-customizer__btn theme-customizer__btn--primary"
            onClick={handleSave}
            disabled={!state.hasUnsavedChanges || state.isSaving}
          >
            {state.isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Indicator */}
      {state.hasUnsavedChanges && (
        <div className="theme-customizer__unsaved-banner">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          You have unsaved changes
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="theme-customizer__error">
          <strong>Error:</strong> {saveError}
        </div>
      )}

      {/* Main Layout */}
      <div className="theme-customizer__layout">
        {/* Controls Panel */}
        <div className="theme-customizer__controls">
          {/* Tabs */}
          <div className="theme-customizer__tabs">
            <button
              type="button"
              className={`theme-customizer__tab ${
                state.activeTab === 'colors' ? 'theme-customizer__tab--active' : ''
              }`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'colors' })}
            >
              Colors
            </button>
            <button
              type="button"
              className={`theme-customizer__tab ${
                state.activeTab === 'typography' ? 'theme-customizer__tab--active' : ''
              }`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'typography' })}
            >
              Typography
            </button>
            <button
              type="button"
              className={`theme-customizer__tab ${
                state.activeTab === 'logo' ? 'theme-customizer__tab--active' : ''
              }`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'logo' })}
            >
              Logo
            </button>
            <button
              type="button"
              className={`theme-customizer__tab ${
                state.activeTab === 'navigation' ? 'theme-customizer__tab--active' : ''
              }`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'navigation' })}
            >
              Navigation
            </button>
          </div>

          {/* Tab Content */}
          <div className="theme-customizer__tab-content">
            {/* Colors Tab */}
            {state.activeTab === 'colors' && (
              <div className="theme-customizer__section">
                <h2 className="theme-customizer__section-title">Brand Colors</h2>
                <p className="theme-customizer__section-description">
                  Choose your brand colors to customize the look and feel of your pages.
                </p>

                <div className="theme-customizer__fields">
                  <ColorPicker
                    label="Primary Color"
                    value={state.config.branding.colors.primary}
                    onChange={(color) =>
                      dispatch({ type: 'SET_PRIMARY_COLOR', color })
                    }
                    presets={DEFAULT_COLOR_PRESETS}
                    description="Main brand color used for buttons, links, and accents"
                  />

                  <ColorPicker
                    label="Secondary Color"
                    value={state.config.branding.colors.secondary || '#06B6D4'}
                    onChange={(color) =>
                      dispatch({ type: 'SET_SECONDARY_COLOR', color })
                    }
                    presets={DEFAULT_COLOR_PRESETS}
                    description="Supporting color for secondary elements"
                  />

                  <ColorPicker
                    label="Accent Color"
                    value={state.config.branding.colors.accent || '#FF6B35'}
                    onChange={(color) =>
                      dispatch({ type: 'SET_ACCENT_COLOR', color })
                    }
                    presets={DEFAULT_COLOR_PRESETS}
                    description="Accent color for highlights and special elements"
                  />
                </div>
              </div>
            )}

            {/* Typography Tab */}
            {state.activeTab === 'typography' && (
              <div className="theme-customizer__section">
                <h2 className="theme-customizer__section-title">Typography</h2>
                <p className="theme-customizer__section-description">
                  Select fonts that match your brand identity.
                </p>

                <div className="theme-customizer__fields">
                  <FontSelector
                    label="Display Font"
                    value={state.config.branding.typography?.displayFont || 'Outfit'}
                    onChange={(font) =>
                      dispatch({ type: 'SET_DISPLAY_FONT', font })
                    }
                    fonts={DEFAULT_FONTS}
                    description="Used for headings and large text"
                  />

                  <FontSelector
                    label="Body Font"
                    value={state.config.branding.typography?.bodyFont || 'Inter'}
                    onChange={(font) => dispatch({ type: 'SET_BODY_FONT', font })}
                    fonts={DEFAULT_FONTS}
                    description="Used for body text and paragraphs"
                  />
                </div>
              </div>
            )}

            {/* Logo Tab */}
            {state.activeTab === 'logo' && (
              <div className="theme-customizer__section">
                <h2 className="theme-customizer__section-title">Brand Logo</h2>
                <p className="theme-customizer__section-description">
                  Upload your logo to display on your white-label pages.
                </p>

                <div className="theme-customizer__fields">
                  <LogoUploader
                    label="Logo Image"
                    value={state.config.branding.logo}
                    onChange={(url) => dispatch({ type: 'SET_LOGO', url })}
                    description="Recommended: PNG or SVG, max 5MB"
                  />
                </div>
              </div>
            )}

            {/* Navigation Tab */}
            {state.activeTab === 'navigation' && (
              <div className="theme-customizer__section">
                <h2 className="theme-customizer__section-title">Navigation Links</h2>
                <p className="theme-customizer__section-description">
                  Customize the navigation menu on your pages.
                </p>

                <div className="theme-customizer__fields">
                  <div className="theme-customizer__nav-links">
                    {state.config.content.customNavLinks.map((link, index) => (
                      <div key={index} className="theme-customizer__nav-link">
                        <div className="theme-customizer__nav-link-content">
                          <span className="theme-customizer__nav-link-label">
                            {link.label}
                          </span>
                          <span className="theme-customizer__nav-link-href">
                            {link.href}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="theme-customizer__nav-link-remove"
                          onClick={() =>
                            dispatch({ type: 'REMOVE_NAV_LINK', id: index.toString() })
                          }
                          aria-label={`Remove ${link.label}`}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="theme-customizer__add-link"
                      onClick={() => {
                        const label = prompt('Link label:');
                        const href = prompt('Link URL:');
                        if (label && href) {
                          dispatch({
                            type: 'ADD_NAV_LINK',
                            link: {
                              label,
                              href,
                              order: state.config.content.customNavLinks.length,
                              isEditing: false,
                            },
                          });
                        }
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Navigation Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="theme-customizer__preview">
          <ThemePreview config={state.config} mode={state.previewMode}>
            {previewContent || (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Preview Content</h2>
                <p>Your customized theme will appear here.</p>
                <button
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Sample Button
                </button>
              </div>
            )}
          </ThemePreview>

          {/* Preview Mode Switcher */}
          <div className="theme-customizer__preview-controls">
            <button
              type="button"
              className={`theme-customizer__preview-mode ${
                state.previewMode === 'desktop'
                  ? 'theme-customizer__preview-mode--active'
                  : ''
              }`}
              onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', mode: 'desktop' })}
              title="Desktop view"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </button>
            <button
              type="button"
              className={`theme-customizer__preview-mode ${
                state.previewMode === 'tablet'
                  ? 'theme-customizer__preview-mode--active'
                  : ''
              }`}
              onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', mode: 'tablet' })}
              title="Tablet view"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              className={`theme-customizer__preview-mode ${
                state.previewMode === 'mobile'
                  ? 'theme-customizer__preview-mode--active'
                  : ''
              }`}
              onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', mode: 'mobile' })}
              title="Mobile view"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ThemeCustomizer.displayName = 'ThemeCustomizer';
