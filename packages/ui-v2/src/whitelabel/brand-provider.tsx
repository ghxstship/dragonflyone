/**
 * UI v2 Brand Provider
 * RSC-compatible theme provider for white label support
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { BrandConfig, ColorMode, ResolvedColorMode, ThemeContext } from '../tokens/types';
import { generateDesignTokens, generateBrandCSS } from '../tokens/generator';
import { defaultBrandConfig } from './default-brand-config';

// ============================================================================
// Context
// ============================================================================

const BrandContext = createContext<ThemeContext | null>(null);

// ============================================================================
// Server Component: BrandStyles
// ============================================================================

/**
 * Server component that injects brand CSS
 * No runtime JavaScript - zero FOUC
 */
export function BrandStyles({ brand }: { brand: BrandConfig }) {
  const css = generateBrandCSS(brand);

  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      data-brand={brand.identity.slug}
    />
  );
}

// ============================================================================
// Client Component: BrandProvider
// ============================================================================

interface BrandProviderProps {
  children: React.ReactNode;
  brand?: BrandConfig;
  tenantId?: string;
  defaultColorMode?: ColorMode;
}

/**
 * Client component for runtime brand management
 * Handles color mode switching and dynamic brand updates
 */
export function BrandProvider({
  children,
  brand: initialBrand,
  tenantId,
  defaultColorMode = 'system',
}: BrandProviderProps) {
  const [brand, setBrand] = useState<BrandConfig>(initialBrand || defaultBrandConfig);
  const [colorMode, setColorMode] = useState<ColorMode>(defaultColorMode);
  const [resolvedColorMode, setResolvedColorMode] = useState<ResolvedColorMode>('light');
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load brand configuration if tenantId provided
  useEffect(() => {
    if (!mounted || !tenantId || initialBrand) return;

    loadBrandConfig(tenantId)
      .then(setBrand)
      .catch((error) => {
        console.error('Failed to load brand config:', error);
        setBrand(defaultBrandConfig);
      });
  }, [tenantId, initialBrand, mounted]);

  // Resolve color mode (system -> light/dark)
  useEffect(() => {
    if (!mounted) return;

    if (colorMode === 'system') {
      const resolveSystemMode = (): ResolvedColorMode => {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      };

      setResolvedColorMode(resolveSystemMode());

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        setResolvedColorMode(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

    setResolvedColorMode(colorMode as ResolvedColorMode);
    return undefined;
  }, [colorMode, mounted]);

  // Apply data attributes to HTML element
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;

    document.documentElement.setAttribute('data-tenant', brand.identity.slug);
    document.documentElement.setAttribute('data-theme', resolvedColorMode);

    return () => {
      document.documentElement.removeAttribute('data-tenant');
      document.documentElement.removeAttribute('data-theme');
    };
  }, [brand.identity.slug, resolvedColorMode, mounted]);

  const tokens = useMemo(() => generateDesignTokens(brand), [brand]);

  const value = useMemo<ThemeContext>(
    () => ({
      brand,
      tokens,
      colorMode,
      setColorMode,
      resolvedColorMode,
    }),
    [brand, tokens, colorMode, resolvedColorMode]
  );

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the complete theme context
 */
export function useTheme(): ThemeContext {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useTheme must be used within a BrandProvider');
  }
  return context;
}

/**
 * Access brand configuration
 */
export function useBrand(): BrandConfig {
  return useTheme().brand;
}

/**
 * Access design tokens
 */
export function useTokens() {
  return useTheme().tokens;
}

/**
 * Access and control color mode
 */
export function useColorMode() {
  const { colorMode, setColorMode, resolvedColorMode } = useTheme();
  return { colorMode, setColorMode, resolvedColorMode };
}

// ============================================================================
// Brand Loading
// ============================================================================

/**
 * Load brand configuration from API
 */
async function loadBrandConfig(tenantId: string): Promise<BrandConfig> {
  const response = await fetch(`/api/tenants/${tenantId}/brand-config`);

  if (!response.ok) {
    throw new Error(`Failed to load brand config: ${response.status}`);
  }

  return response.json();
}

/**
 * Preload brand configuration (for prefetching)
 */
export async function preloadBrandConfig(tenantId: string): Promise<BrandConfig> {
  return loadBrandConfig(tenantId);
}
