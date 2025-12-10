/**
 * useAppearance Hook
 * Manages user appearance preferences with persistence and CSS variable updates
 */

import { useState, useEffect, useCallback } from 'react';
import { log } from '@ghxstship/config';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'default' | 'comfortable';
export type BorderRadius = 'sharp' | 'default' | 'rounded';
export type AccentColor = 'indigo' | 'violet' | 'amber' | 'emerald' | 'rose' | 'cyan';

export interface AppearanceSettings {
  theme: ThemeMode;
  density: Density;
  accentColor: AccentColor;
  borderRadius: BorderRadius;
  fontScale: number;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  sidebarCollapsed: boolean;
  highContrast: boolean;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  theme: 'dark',
  density: 'default',
  accentColor: 'indigo',
  borderRadius: 'default',
  fontScale: 1.0,
  animationsEnabled: true,
  reducedMotion: false,
  sidebarCollapsed: false,
  highContrast: false,
};

const STORAGE_KEY = 'ghxstship-appearance';

// Accent color CSS variable mappings
const ACCENT_COLORS: Record<AccentColor, { primary: string; primaryHover: string }> = {
  indigo: { primary: '#6366f1', primaryHover: '#4f46e5' },
  violet: { primary: '#8b5cf6', primaryHover: '#7c3aed' },
  amber: { primary: '#f59e0b', primaryHover: '#d97706' },
  emerald: { primary: '#10b981', primaryHover: '#059669' },
  rose: { primary: '#f43f5e', primaryHover: '#e11d48' },
  cyan: { primary: '#06b6d4', primaryHover: '#0891b2' },
};

// Density CSS variable mappings
const DENSITY_SCALES: Record<Density, { spacing: number; padding: number }> = {
  compact: { spacing: 0.75, padding: 0.75 },
  default: { spacing: 1.0, padding: 1.0 },
  comfortable: { spacing: 1.25, padding: 1.25 },
};

// Border radius CSS variable mappings
const BORDER_RADIUS: Record<BorderRadius, { button: string; card: string; modal: string }> = {
  sharp: { button: '2px', card: '4px', modal: '8px' },
  default: { button: '4px', card: '8px', modal: '16px' },
  rounded: { button: '8px', card: '16px', modal: '24px' },
};

/**
 * Apply appearance settings to CSS custom properties
 */
function applySettingsToDOM(settings: AppearanceSettings): void {
  const root = document.documentElement;

  // Theme mode
  if (settings.theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', settings.theme);
  }

  // Accent color
  const accent = ACCENT_COLORS[settings.accentColor];
  root.style.setProperty('--color-accent', accent.primary);
  root.style.setProperty('--color-accent-hover', accent.primaryHover);

  // Density
  const density = DENSITY_SCALES[settings.density];
  root.style.setProperty('--density-spacing', `${density.spacing}`);
  root.style.setProperty('--density-padding', `${density.padding}`);

  // Border radius
  const radius = BORDER_RADIUS[settings.borderRadius];
  root.style.setProperty('--radius-button', radius.button);
  root.style.setProperty('--radius-card', radius.card);
  root.style.setProperty('--radius-modal', radius.modal);

  // Font scale
  root.style.setProperty('--font-scale', `${settings.fontScale}`);
  root.style.fontSize = `${settings.fontScale * 100}%`;

  // Animations
  if (!settings.animationsEnabled || settings.reducedMotion) {
    root.style.setProperty('--transition-fast', '0ms');
    root.style.setProperty('--transition-base', '0ms');
    root.style.setProperty('--transition-slow', '0ms');
    root.classList.add('reduce-motion');
  } else {
    root.style.setProperty('--transition-fast', '100ms ease-in-out');
    root.style.setProperty('--transition-base', '200ms ease-in-out');
    root.style.setProperty('--transition-slow', '300ms ease-in-out');
    root.classList.remove('reduce-motion');
  }

  // High contrast
  if (settings.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // Sidebar state
  root.setAttribute('data-sidebar-collapsed', String(settings.sidebarCollapsed));
}

/**
 * Load settings from localStorage
 */
function loadSettings(): AppearanceSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    log.warn('Failed to load appearance settings', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: AppearanceSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    log.warn('Failed to save appearance settings', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export interface UseAppearanceReturn {
  settings: AppearanceSettings;
  isInitialized: boolean;
  updateSetting: <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => void;
  updateSettings: (updates: Partial<AppearanceSettings>) => void;
  resetToDefaults: () => void;
  presets: {
    applyPreset: (preset: 'default' | 'compact' | 'highContrast' | 'comfortable') => void;
  };
}

export function useAppearance(): UseAppearanceReturn {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    applySettingsToDOM(loaded);
    setIsInitialized(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (loaded.theme === 'system') {
        applySettingsToDOM(loaded);
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    // Listen for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && !loaded.reducedMotion) {
        const updated = { ...loaded, reducedMotion: true };
        setSettings(updated);
        saveSettings(updated);
        applySettingsToDOM(updated);
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Update single setting
  const updateSetting = useCallback(<K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      saveSettings(updated);
      applySettingsToDOM(updated);
      return updated;
    });
  }, []);

  // Update multiple settings
  const updateSettings = useCallback((updates: Partial<AppearanceSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      saveSettings(updated);
      applySettingsToDOM(updated);
      return updated;
    });
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    applySettingsToDOM(DEFAULT_SETTINGS);
  }, []);

  // Preset configurations
  const applyPreset = useCallback((preset: 'default' | 'compact' | 'highContrast' | 'comfortable') => {
    const presets: Record<string, Partial<AppearanceSettings>> = {
      default: DEFAULT_SETTINGS,
      compact: {
        density: 'compact',
        fontScale: 0.9,
        sidebarCollapsed: true,
      },
      highContrast: {
        highContrast: true,
        accentColor: 'amber',
      },
      comfortable: {
        density: 'comfortable',
        fontScale: 1.1,
        borderRadius: 'rounded',
      },
    };

    const presetSettings = { ...settings, ...presets[preset] };
    setSettings(presetSettings);
    saveSettings(presetSettings);
    applySettingsToDOM(presetSettings);
  }, [settings]);

  return {
    settings,
    isInitialized,
    updateSetting,
    updateSettings,
    resetToDefaults,
    presets: { applyPreset },
  };
}

export default useAppearance;
