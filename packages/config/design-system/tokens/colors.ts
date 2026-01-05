/**
 * MONOCHROMATIC + SINGLE ACCENT COLOR SYSTEM
 * 
 * Philosophy:
 * - Grayscale forms the foundation (black → white)
 * - ONE accent color per brand/tenant
 * - Semantic colors ONLY for system states
 * - No decorative colors
 * 
 * GHXSTSHIP Brand Colors:
 * - ATLVS: Pink (#FF10F0)
 * - COMPVSS: Yellow (#FFD100)
 * - GVTEWAY: Cyan (#00F0FF)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// GRAYSCALE FOUNDATION (Invariant - Same for all brands)
// ═══════════════════════════════════════════════════════════════════════════════

export const grayscale = {
  // Pure values
  white: '#FFFFFF',
  black: '#000000',
  
  // Light mode grays (warm undertone for approachability)
  gray: {
    25:  '#FCFCFC',  // Barely there - subtle backgrounds
    50:  '#FAFAFA',  // App background
    100: '#F5F5F5',  // Card backgrounds, elevated surfaces
    150: '#EFEFEF',  // Hover states on white
    200: '#E5E5E5',  // Borders, dividers
    300: '#D4D4D4',  // Stronger borders
    400: '#A3A3A3',  // Placeholder text, disabled
    500: '#737373',  // Secondary text
    600: '#525252',  // Primary text (light mode)
    700: '#404040',  // Headings
    800: '#262626',  // Strong emphasis
    900: '#171717',  // Near black
    950: '#0A0A0A',  // True dark
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ACCENT COLOR SYSTEM (GHXSTSHIP Brand Colors)
// ═══════════════════════════════════════════════════════════════════════════════

export interface AccentColorScale {
  /** Primary accent - buttons, links, active states */
  primary: string;
  /** Hover state - slightly darker/more saturated */
  hover: string;
  /** Active/pressed state */
  active: string;
  /** Very subtle background tint (6% opacity) */
  subtle: string;
  /** Light background for accent elements (12% opacity) */
  muted: string;
  /** Focus ring color (25% opacity) */
  ring: string;
  /** Text on accent background */
  foreground: string;
}

export const generateAccentScale = (primaryHex: string): AccentColorScale => {
  const primary = primaryHex;
  
  return {
    primary,
    hover: adjustLightness(primary, -10),
    active: adjustLightness(primary, -20),
    subtle: `${primary}10`,      // 6% opacity
    muted: `${primary}20`,       // 12% opacity  
    ring: `${primary}40`,        // 25% opacity
    foreground: getContrastingForeground(primary),
  };
};

// GHXSTSHIP Brand Accent Colors
export const brandAccents = {
  atlvs: generateAccentScale('#FF10F0'),    // Electric Pink
  compvss: generateAccentScale('#FFD100'),  // Electric Yellow
  gvteway: generateAccentScale('#00F0FF'),  // Electric Cyan
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC COLORS (System States - Invariant)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Semantic colors are ONLY for communicating system states.
 * They should NEVER be used for branding or decoration.
 * 
 * These remain constant across all brands/tenants to maintain
 * consistent meaning and accessibility.
 */

export const semantic = {
  // Success - Task complete, saved, positive outcome
  success: {
    base: '#22C55E',       // Green-500
    hover: '#16A34A',      // Green-600
    subtle: '#22C55E15',   // 8% opacity
    muted: '#22C55E25',    // 15% opacity
    foreground: '#FFFFFF',
    text: '#166534',       // Green-800 for text on light bg
  },
  
  // Warning - Caution, approaching limit, needs attention
  warning: {
    base: '#F59E0B',       // Amber-500
    hover: '#D97706',      // Amber-600
    subtle: '#F59E0B15',
    muted: '#F59E0B25',
    foreground: '#000000',
    text: '#92400E',       // Amber-800
  },
  
  // Error - Failed, invalid, destructive
  error: {
    base: '#EF4444',       // Red-500
    hover: '#DC2626',      // Red-600
    subtle: '#EF444415',
    muted: '#EF444425',
    foreground: '#FFFFFF',
    text: '#991B1B',       // Red-800
  },
  
  // Info - Neutral information, tips, guidance
  // NOTE: Uses accent color for brand consistency
  // Fallback to neutral gray if accent would conflict
  info: {
    base: '#6B7280',       // Gray-500
    hover: '#4B5563',      // Gray-600
    subtle: '#6B728015',
    muted: '#6B728025',
    foreground: '#FFFFFF',
    text: '#374151',       // Gray-700
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SURFACE COLORS (Light & Dark Mode)
// ═══════════════════════════════════════════════════════════════════════════════

export const surfaces = {
  light: {
    // Backgrounds
    background: grayscale.gray[50],
    backgroundSubtle: grayscale.white,
    backgroundElevated: grayscale.white,
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    
    // Interactive surfaces
    surfaceHover: grayscale.gray[100],
    surfaceActive: grayscale.gray[150],
    surfaceSelected: 'var(--color-accent-subtle)',
    surfaceSelectedHover: 'var(--color-accent-muted)',
    
    // Specific surfaces
    sidebar: grayscale.gray[100],
    card: grayscale.white,
    modal: grayscale.white,
    dropdown: grayscale.white,
    tooltip: grayscale.gray[900],
    input: grayscale.white,
    inputDisabled: grayscale.gray[100],
  },
  
  dark: {
    // Backgrounds
    background: grayscale.gray[950],
    backgroundSubtle: grayscale.gray[900],
    backgroundElevated: grayscale.gray[800],
    backgroundOverlay: 'rgba(0, 0, 0, 0.75)',
    
    // Interactive surfaces
    surfaceHover: grayscale.gray[800],
    surfaceActive: grayscale.gray[700],
    surfaceSelected: 'var(--color-accent-subtle)',
    surfaceSelectedHover: 'var(--color-accent-muted)',
    
    // Specific surfaces
    sidebar: grayscale.gray[900],
    card: grayscale.gray[900],
    modal: grayscale.gray[900],
    dropdown: grayscale.gray[800],
    tooltip: grayscale.gray[100],
    input: grayscale.gray[900],
    inputDisabled: grayscale.gray[800],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT COLORS (Light & Dark Mode)
// ═══════════════════════════════════════════════════════════════════════════════

export const text = {
  light: {
    primary: grayscale.gray[900],      // Main text
    secondary: grayscale.gray[600],    // Supporting text
    tertiary: grayscale.gray[500],     // Subtle text
    disabled: grayscale.gray[400],     // Disabled text
    placeholder: grayscale.gray[400],  // Input placeholder
    inverse: grayscale.white,          // Text on dark backgrounds
    link: 'var(--color-accent-primary)', // Links use accent
    linkHover: 'var(--color-accent-hover)',
  },
  
  dark: {
    primary: grayscale.gray[50],
    secondary: grayscale.gray[400],
    tertiary: grayscale.gray[500],
    disabled: grayscale.gray[600],
    placeholder: grayscale.gray[600],
    inverse: grayscale.gray[900],
    link: 'var(--color-accent-primary)',
    linkHover: 'var(--color-accent-hover)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BORDER COLORS (Light & Dark Mode)
// ═══════════════════════════════════════════════════════════════════════════════

export const borders = {
  light: {
    default: grayscale.gray[200],
    subtle: grayscale.gray[150],
    strong: grayscale.gray[300],
    focus: 'var(--color-accent-primary)',
    focusRing: 'var(--color-accent-ring)',
    error: semantic.error.base,
    errorRing: semantic.error.muted,
  },
  
  dark: {
    default: grayscale.gray[700],
    subtle: grayscale.gray[800],
    strong: grayscale.gray[600],
    focus: 'var(--color-accent-primary)',
    focusRing: 'var(--color-accent-ring)',
    error: semantic.error.base,
    errorRing: semantic.error.muted,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function adjustLightness(hex: string, percent: number): string {
  // Convert hex to HSL, adjust lightness, convert back
  const hsl = hexToHsl(hex);
  hsl.l = Math.max(0, Math.min(100, hsl.l + percent));
  return hslToHex(hsl);
}

function getContrastingForeground(hex: string): string {
  // Calculate relative luminance and return black or white
  const luminance = getRelativeLuminance(hex);
  return luminance > 0.5 ? grayscale.black : grayscale.white;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Implementation
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(hsl: { h: number; s: number; l: number }): string {
  const { h, s, l } = hsl;
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const adjust = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  
  return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export type GrayscaleType = typeof grayscale;
export type SemanticType = typeof semantic;
export type SurfacesType = typeof surfaces;
export type TextType = typeof text;
export type BordersType = typeof borders;
export type BrandAccentsType = typeof brandAccents;

// Brand ID type
export type BrandId = keyof typeof brandAccents;

// Color mode type
export type ColorMode = 'light' | 'dark';
