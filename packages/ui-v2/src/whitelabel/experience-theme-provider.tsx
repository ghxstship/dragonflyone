/**
 * Experience Theme Provider
 * White-label theme provider for GVTEWAY experiences
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type {
  ExperienceTheme,
  ExperienceThemeConfig,
} from './experience-theme';
import {
  generateExperienceTheme,
  generateExperienceCSS,
} from './experience-theme';

// ============================================================================
// Context
// ============================================================================

interface ExperienceThemeContext {
  config: ExperienceThemeConfig;
  theme: ExperienceTheme;
}

const ExperienceThemeContext = createContext<ExperienceThemeContext | null>(
  null
);

// ============================================================================
// Server Component: ExperienceThemeStyles
// ============================================================================

/**
 * Server component that injects experience theme CSS
 * No runtime JavaScript - zero FOUC
 */
export function ExperienceThemeStyles({
  config,
}: {
  config: ExperienceThemeConfig;
}) {
  const theme = generateExperienceTheme(config);
  const css = generateExperienceCSS(theme);

  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      data-experience-theme={config.organizerId}
    />
  );
}

// ============================================================================
// Client Component: ExperienceThemeProvider
// ============================================================================

interface ExperienceThemeProviderProps {
  children: React.ReactNode;
  config: ExperienceThemeConfig;
}

/**
 * Client component for experience theme management
 * Provides theme context to all child components
 */
export function ExperienceThemeProvider({
  children,
  config,
}: ExperienceThemeProviderProps) {
  const theme = useMemo(() => generateExperienceTheme(config), [config]);

  const value = useMemo<ExperienceThemeContext>(
    () => ({
      config,
      theme,
    }),
    [config, theme]
  );

  // Apply data attributes for CSS targeting
  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.setAttribute(
      'data-organizer',
      config.organizerId
    );

    return () => {
      document.documentElement.removeAttribute('data-organizer');
    };
  }, [config.organizerId]);

  return (
    <ExperienceThemeContext.Provider value={value}>
      {children}
    </ExperienceThemeContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access experience theme context
 */
export function useExperienceTheme(): ExperienceThemeContext {
  const context = useContext(ExperienceThemeContext);
  if (!context) {
    throw new Error(
      'useExperienceTheme must be used within ExperienceThemeProvider'
    );
  }
  return context;
}

/**
 * Access experience theme colors
 */
export function useExperienceColors() {
  const { theme } = useExperienceTheme();
  return theme.colors;
}

/**
 * Access experience typography
 */
export function useExperienceTypography() {
  const { theme } = useExperienceTheme();
  return theme.typography;
}

/**
 * Access experience theme config
 */
export function useExperienceConfig() {
  const { config } = useExperienceTheme();
  return config;
}

/**
 * Access complete experience theme
 */
export function useExperienceThemeValues() {
  const { theme } = useExperienceTheme();
  return theme;
}
