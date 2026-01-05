import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { resolveColorConfig } from './color-config';
import { generateColorCSS } from '../../design-system/tokens/css-colors';
import { AccentColorScale, BrandId, ColorMode } from '../../design-system/tokens/colors';

interface ThemeContextValue {
  brandId: BrandId;
  accentColor: AccentColorScale;
  colorMode: ColorMode | 'system';
  resolvedColorMode: ColorMode;
  setColorMode: (mode: ColorMode | 'system') => void;
  setAccentColor: (hex: string) => void;
  setBrandId: (brandId: BrandId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  brandId?: BrandId;
  customAccentColor?: string;
  defaultColorMode?: ColorMode | 'system';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  brandId = 'atlvs',
  customAccentColor,
  defaultColorMode = 'system',
}) => {
  const [colorMode, setColorMode] = useState<ColorMode | 'system'>(defaultColorMode);
  const [resolvedColorMode, setResolvedColorMode] = useState<ColorMode>('light');
  const [currentBrandId, setCurrentBrandId] = useState<BrandId>(brandId);
  const [customAccent, setCustomAccent] = useState<string | undefined>(customAccentColor);
  
  // Resolve accent color from brand + custom override
  const accentColor = useMemo(
    () => resolveColorConfig(currentBrandId, customAccent ? { accentColor: customAccent } : undefined),
    [currentBrandId, customAccent]
  );
  
  // Handle system color mode
  useEffect(() => {
    if (colorMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedColorMode(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        setResolvedColorMode(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedColorMode(colorMode);
    }
  }, [colorMode]);
  
  // Inject CSS variables
  useEffect(() => {
    const css = generateColorCSS(accentColor, resolvedColorMode);
    
    let styleEl = document.getElementById('color-theme-variables');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'color-theme-variables';
      styleEl.setAttribute('data-generated', 'true');
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
    
    // Set data attributes for CSS targeting
    document.documentElement.setAttribute('data-brand', currentBrandId);
    document.documentElement.setAttribute('data-theme', resolvedColorMode);
    
    // Add brand class to body for convenience
    document.body.className = document.body.className
      .replace(/brand-\w+/g, '')
      .trim() + ` brand-${currentBrandId}`;
    
  }, [accentColor, resolvedColorMode, currentBrandId]);
  
  const value = useMemo(
    () => ({
      brandId: currentBrandId,
      accentColor,
      colorMode,
      resolvedColorMode,
      setColorMode,
      setAccentColor: setCustomAccent,
      setBrandId: setCurrentBrandId,
    }),
    [currentBrandId, accentColor, colorMode, resolvedColorMode]
  );
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hooks
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const useAccentColor = () => useTheme().accentColor;
export const useColorMode = () => {
  const { colorMode, setColorMode, resolvedColorMode } = useTheme();
  return { colorMode, setColorMode, resolvedColorMode };
};
export const useBrandId = () => useTheme().brandId;

// Utility hook for getting brand-specific classes
export const useBrandClasses = () => {
  const { brandId } = useTheme();
  
  return useMemo(() => ({
    brandAccent: `brand-${brandId}`,
    brandAccentHover: `brand-${brandId}-hover`,
    brandAccentActive: `brand-${brandId}-active`,
    // For backward compatibility
    'brand-pink': brandId === 'atlvs' ? 'accent' : '',
    'brand-yellow': brandId === 'compvss' ? 'accent' : '',
    'brand-cyan': brandId === 'gvteway' ? 'accent' : '',
  }), [brandId]);
};

// Server-side detection utility
export const getServerSideThemeConfig = (
  hostname?: string,
  userAgent?: string
): {
  brandId: BrandId;
  colorMode: ColorMode;
} => {
  // Detect brand from hostname
  let brandId: BrandId = 'atlvs';
  if (hostname) {
    if (hostname.includes('compvss')) brandId = 'compvss';
    else if (hostname.includes('gvteway')) brandId = 'gvteway';
    else if (hostname.includes('atlvs')) brandId = 'atlvs';
  }
  
  // Detect dark mode preference from user agent (limited but better than nothing)
  let colorMode: ColorMode = 'light';
  if (userAgent) {
    // This is a very basic heuristic - in practice, you'd want to use cookies or headers
    if (userAgent.includes('dark')) colorMode = 'dark';
  }
  
  return { brandId, colorMode };
};
