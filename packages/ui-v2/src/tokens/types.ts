/**
 * UI v2 Token System - Type Definitions
 * Token-first design system with native white label support
 */

// ============================================================================
// Color Types
// ============================================================================

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ColorPalette {
  brand: ColorShades;
  neutral: ColorShades;
  success: ColorShades;
  warning: ColorShades;
  error: ColorShades;
  info: ColorShades;
}

export interface SemanticColors {
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
    linkHover: string;
    onBrand: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
    inverse: string;
    brand: string;
    brandSubtle: string;
    success: string;
    successSubtle: string;
    warning: string;
    warningSubtle: string;
    error: string;
    errorSubtle: string;
    info: string;
    infoSubtle: string;
  };
  border: {
    primary: string;
    secondary: string;
    tertiary: string;
    focus: string;
    inverse: string;
    brand: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryDisabled: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
    tertiary: string;
    tertiaryHover: string;
    danger: string;
    dangerHover: string;
  };
}

// ============================================================================
// Spacing Types
// ============================================================================

export interface SpacingScale {
  0: string;
  1: string;   // 0.25rem / 4px
  2: string;   // 0.5rem / 8px
  3: string;   // 0.75rem / 12px
  4: string;   // 1rem / 16px
  5: string;   // 1.25rem / 20px
  6: string;   // 1.5rem / 24px
  8: string;   // 2rem / 32px
  10: string;  // 2.5rem / 40px
  12: string;  // 3rem / 48px
  16: string;  // 4rem / 64px
  20: string;  // 5rem / 80px
  24: string;  // 6rem / 96px
  32: string;  // 8rem / 128px
}

// ============================================================================
// Typography Types
// ============================================================================

export interface FontFamily {
  sans: string;
  serif: string;
  mono: string;
  display: string;
}

export interface FontSize {
  xs: string;    // 0.75rem / 12px
  sm: string;    // 0.875rem / 14px
  base: string;  // 1rem / 16px
  lg: string;    // 1.125rem / 18px
  xl: string;    // 1.25rem / 20px
  '2xl': string; // 1.5rem / 24px
  '3xl': string; // 1.875rem / 30px
  '4xl': string; // 2.25rem / 36px
  '5xl': string; // 3rem / 48px
  '6xl': string; // 3.75rem / 60px
  '7xl': string; // 4.5rem / 72px
  '8xl': string; // 6rem / 96px
  '9xl': string; // 8rem / 128px
}

export interface FontWeight {
  thin: number;      // 100
  extralight: number; // 200
  light: number;     // 300
  normal: number;    // 400
  medium: number;    // 500
  semibold: number;  // 600
  bold: number;      // 700
  extrabold: number; // 800
  black: number;     // 900
}

export interface LineHeight {
  none: number;    // 1
  tight: number;   // 1.25
  snug: number;    // 1.375
  normal: number;  // 1.5
  relaxed: number; // 1.625
  loose: number;   // 2
}

export interface LetterSpacing {
  tighter: string; // -0.05em
  tight: string;   // -0.025em
  normal: string;  // 0
  wide: string;    // 0.025em
  wider: string;   // 0.05em
  widest: string;  // 0.1em
}

// ============================================================================
// Effects Types
// ============================================================================

export interface BorderRadius {
  none: string;
  xs: string;   // 0.125rem / 2px
  sm: string;   // 0.25rem / 4px
  md: string;   // 0.375rem / 6px
  lg: string;   // 0.5rem / 8px
  xl: string;   // 0.75rem / 12px
  '2xl': string; // 1rem / 16px
  '3xl': string; // 1.5rem / 24px
  full: string;  // 9999px
}

export interface Shadow {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface Transition {
  fast: string;    // 100ms
  base: string;    // 200ms
  slow: string;    // 300ms
  slower: string;  // 500ms
}

export interface ZIndex {
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  dropdown: number;  // 1000
  sticky: number;    // 1100
  fixed: number;     // 1200
  overlay: number;   // 1300
  modal: number;     // 1400
  popover: number;   // 1500
  tooltip: number;   // 1600
  notification: number; // 1700
}

// ============================================================================
// Brand Configuration Types
// ============================================================================

export interface BrandIdentity {
  name: string;
  slug: string;
  domain?: string;
  tagline?: string;
  logo: {
    light: string;
    dark: string;
    mark: string;
    favicon: string;
  };
}

export interface BrandColors {
  brand: string;        // Primary brand color
  brandLight?: string;  // Optional light variant
  brandDark?: string;   // Optional dark variant
  accent?: string;      // Optional accent color
}

export interface BrandTypography {
  fontFamily: string;
  fontUrl?: string;
  scale?: 'compact' | 'comfortable' | 'spacious';
  weights?: number[];
}

export interface BrandDesign {
  radius?: keyof BorderRadius;
  shadows?: 'none' | 'subtle' | 'soft' | 'hard';
  borders?: 'none' | 'subtle' | 'strong';
  animations?: boolean;
}

export interface BrandFeatures {
  darkMode: boolean;
  customDomain: boolean;
  removeBranding: boolean;
  customAuth: boolean;
}

export interface BrandContent {
  copyrightHolder: string;
  supportEmail: string;
  supportUrl?: string;
  docsUrl?: string;
  legalLinks: {
    terms: string;
    privacy: string;
    security?: string;
  };
}

export interface BrandConfig {
  id: string;
  identity: BrandIdentity;
  colors: BrandColors;
  typography: BrandTypography;
  design: BrandDesign;
  features: BrandFeatures;
  content: BrandContent;
}

// ============================================================================
// Design Token Collection
// ============================================================================

export interface DesignTokens {
  colors: {
    palette: ColorPalette;
    semantic: SemanticColors;
  };
  spacing: SpacingScale;
  typography: {
    family: FontFamily;
    size: FontSize;
    weight: FontWeight;
    lineHeight: LineHeight;
    letterSpacing: LetterSpacing;
  };
  effects: {
    radius: BorderRadius;
    shadow: Shadow;
    transition: Transition;
    zIndex: ZIndex;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedColorMode = 'light' | 'dark';

export interface ThemeContext {
  brand: BrandConfig;
  tokens: DesignTokens;
  colorMode: ColorMode;
  resolvedColorMode: ResolvedColorMode;
  setColorMode: (mode: ColorMode) => void;
}
