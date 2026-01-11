/**
 * Experience Theme System
 * Extension of white-label theming for GVTEWAY experiences
 */

import type { BrandConfig } from '../tokens/types';

// ============================================================================
// Experience Theme Types
// ============================================================================

export interface ExperienceThemeConfig {
  organizerId: string;
  branding: ExperienceBranding;
  features: ExperienceFeatures;
  content: ExperienceContent;
}

export interface ExperienceBranding {
  logo: string;
  colors: ExperienceColorTheme;
  typography: ExperienceTypography;
  customDomain?: string;
}

export interface ExperienceColorTheme {
  primary: string;
  secondary?: string;
  accent?: string;
  // Auto-generated
  primaryHover?: string;
  primaryActive?: string;
  primaryLight?: string;
}

export interface ExperienceTypography {
  displayFont?: string;
  bodyFont?: string;
}

export interface ExperienceFeatures {
  bookingEnabled: boolean;
  reviewsEnabled: boolean;
  socialSharingEnabled: boolean;
  chatEnabled: boolean;
}

export interface ExperienceContent {
  customNavLinks?: NavLink[];
  footerContent?: string;
  legalLinks?: LegalLink[];
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  order: number;
}

export interface LegalLink {
  id: string;
  type: 'terms' | 'privacy' | 'refund' | 'custom';
  label: string;
  href: string;
}

export interface ExperienceTheme {
  colors: ResolvedColorTheme;
  typography: ResolvedTypography;
  spacing: SpacingTheme;
  borderRadius: BorderRadiusTheme;
  shadows: ShadowTheme;
  animations: AnimationTheme;
}

export interface ResolvedColorTheme {
  // Primary brand colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;

  // Complementary colors
  secondary: string;
  accent: string;

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Neutral palette
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
}

export interface ResolvedTypography {
  displayFont: string;
  bodyFont: string;
  scale: TypographyScale;
  weights: TypographyWeights;
  lineHeights: LineHeights;
}

export interface TypographyScale {
  hero: string;
  displayXl: string;
  displayLg: string;
  displayMd: string;
  displaySm: string;
  xl: string;
  lg: string;
  base: string;
  sm: string;
  xs: string;
}

export interface TypographyWeights {
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
  black: number;
}

export interface LineHeights {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface SpacingTheme {
  grid: number;
  container: {
    maxWidth: string;
    padding: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  };
}

export interface BorderRadiusTheme {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ShadowTheme {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface AnimationTheme {
  fast: string;
  normal: string;
  slow: string;
  easing: {
    standard: string;
    decelerate: string;
    accelerate: string;
  };
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Adjust brightness of a hex color
 */
export function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  const color = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Adjust brightness
  const adjust = (value: number) => {
    const adjusted = value + (value * percent) / 100;
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };

  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

/**
 * Set opacity for a hex color (returns rgba)
 */
export function setOpacity(hex: string, opacity: number): string {
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Convert hex to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const color = hex.replace('#', '');
  return {
    r: parseInt(color.substring(0, 2), 16),
    g: parseInt(color.substring(2, 4), 16),
    b: parseInt(color.substring(4, 6), 16),
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Generate complementary color (180° on color wheel)
 */
export function generateComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Rotate hue by 180 degrees
  const compHsl = { ...hsl, h: (hsl.h + 180) % 360 };
  const compRgb = hslToRgb(compHsl.h, compHsl.s, compHsl.l);

  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(compRgb.r)}${toHex(compRgb.g)}${toHex(compRgb.b)}`;
}

/**
 * Generate triadic colors (120° and 240° on color wheel)
 */
export function generateTriadic(hex: string): [string, string] {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Rotate hue by 120 and 240 degrees
  const triadic1Hsl = { ...hsl, h: (hsl.h + 120) % 360 };
  const triadic2Hsl = { ...hsl, h: (hsl.h + 240) % 360 };

  const triadic1Rgb = hslToRgb(triadic1Hsl.h, triadic1Hsl.s, triadic1Hsl.l);
  const triadic2Rgb = hslToRgb(triadic2Hsl.h, triadic2Hsl.s, triadic2Hsl.l);

  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return [
    `#${toHex(triadic1Rgb.r)}${toHex(triadic1Rgb.g)}${toHex(triadic1Rgb.b)}`,
    `#${toHex(triadic2Rgb.r)}${toHex(triadic2Rgb.g)}${toHex(triadic2Rgb.b)}`,
  ];
}

// ============================================================================
// Theme Generation
// ============================================================================

/**
 * Generate complete experience theme from white-label config
 */
export function generateExperienceTheme(
  config: ExperienceThemeConfig
): ExperienceTheme {
  const primaryColor = config.branding.colors.primary;

  return {
    colors: {
      // Primary colors
      primary: primaryColor,
      primaryHover: adjustBrightness(primaryColor, -10),
      primaryActive: adjustBrightness(primaryColor, -20),
      primaryLight: setOpacity(primaryColor, 0.1),

      // Complementary colors
      secondary:
        config.branding.colors.secondary || generateComplementary(primaryColor),
      accent: config.branding.colors.accent || generateTriadic(primaryColor)[0],

      // Semantic colors
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',

      // Neutral palette
      background: '#FFFFFF',
      surface: '#F9FAFB',
      border: '#E5E7EB',
      text: '#111827',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
    },

    typography: {
      displayFont:
        config.branding.typography.displayFont || 'Outfit, sans-serif',
      bodyFont: config.branding.typography.bodyFont || 'Inter, system-ui',

      scale: {
        hero: 'clamp(3rem, 8vw, 6rem)',
        displayXl: 'clamp(2.5rem, 6vw, 4.5rem)',
        displayLg: 'clamp(2rem, 5vw, 3.5rem)',
        displayMd: 'clamp(1.75rem, 4vw, 2.5rem)',
        displaySm: 'clamp(1.5rem, 3vw, 2rem)',
        xl: '1.5rem',
        lg: '1.25rem',
        base: '1rem',
        sm: '0.875rem',
        xs: '0.75rem',
      },

      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        black: 900,
      },

      lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
      },
    },

    spacing: {
      grid: 8,
      container: {
        maxWidth: '1280px',
        padding: {
          mobile: '16px',
          tablet: '24px',
          desktop: '48px',
        },
      },
    },

    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },

    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.07)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    },

    animations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      easing: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
      },
    },
  };
}

/**
 * Generate CSS variables from experience theme
 */
export function generateExperienceCSS(theme: ExperienceTheme): string {
  return `
    :root {
      /* Colors */
      --color-primary: ${theme.colors.primary};
      --color-primary-hover: ${theme.colors.primaryHover};
      --color-primary-active: ${theme.colors.primaryActive};
      --color-primary-light: ${theme.colors.primaryLight};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      --color-info: ${theme.colors.info};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-border: ${theme.colors.border};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      --color-text-tertiary: ${theme.colors.textTertiary};

      /* Typography */
      --font-display: ${theme.typography.displayFont};
      --font-body: ${theme.typography.bodyFont};
      --text-hero: ${theme.typography.scale.hero};
      --text-display-xl: ${theme.typography.scale.displayXl};
      --text-display-lg: ${theme.typography.scale.displayLg};
      --text-display-md: ${theme.typography.scale.displayMd};
      --text-display-sm: ${theme.typography.scale.displaySm};
      --text-xl: ${theme.typography.scale.xl};
      --text-lg: ${theme.typography.scale.lg};
      --text-base: ${theme.typography.scale.base};
      --text-sm: ${theme.typography.scale.sm};
      --text-xs: ${theme.typography.scale.xs};

      /* Spacing */
      --spacing-unit: ${theme.spacing.grid}px;
      --container-max-width: ${theme.spacing.container.maxWidth};
      --container-padding-mobile: ${theme.spacing.container.padding.mobile};
      --container-padding-tablet: ${theme.spacing.container.padding.tablet};
      --container-padding-desktop: ${theme.spacing.container.padding.desktop};

      /* Border Radius */
      --radius-sm: ${theme.borderRadius.sm};
      --radius-md: ${theme.borderRadius.md};
      --radius-lg: ${theme.borderRadius.lg};
      --radius-xl: ${theme.borderRadius.xl};
      --radius-full: ${theme.borderRadius.full};

      /* Shadows */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      --shadow-xl: ${theme.shadows.xl};

      /* Animations */
      --animation-fast: ${theme.animations.fast};
      --animation-normal: ${theme.animations.normal};
      --animation-slow: ${theme.animations.slow};
      --easing-standard: ${theme.animations.easing.standard};
      --easing-decelerate: ${theme.animations.easing.decelerate};
      --easing-accelerate: ${theme.animations.easing.accelerate};
    }
  `;
}

/**
 * Convert experience theme config to BrandConfig for compatibility
 */
export function experienceToBrandConfig(
  config: ExperienceThemeConfig
): Partial<BrandConfig> {
  return {
    colors: {
      brand: config.branding.colors.primary,
      accent: config.branding.colors.accent || config.branding.colors.primary,
    },
    typography: {
      fontFamily:
        config.branding.typography.bodyFont || 'Inter, system-ui, sans-serif',
      scale: 'comfortable',
      weights: [400, 500, 600, 700],
    },
  };
}
