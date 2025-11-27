import type { Config } from 'tailwindcss';

// Color palette types
type ColorScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string> & { DEFAULT: string };
type GreyScale = Record<100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
type InkScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950, string>;

// Monochrome palette
export declare const monochromePalette: {
  black: string;
  white: string;
  grey: GreyScale;
};

// Ink palette (dark-mode-first semantic alias)
export declare const inkPalette: InkScale;

// Text color palette for WCAG-compliant pairings
export declare const textColorPalette: {
  'on-dark': {
    primary: string;
    secondary: string;
    muted: string;
    disabled: string;
  };
  'on-light': {
    primary: string;
    secondary: string;
    muted: string;
    disabled: string;
  };
  'on-mid': {
    primary: string;
    secondary: string;
  };
};

// Status colors for accessibility
export declare const statusPalette: {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
};

// Accent colors for categories, tags, decorative elements
export declare const accentPalette: {
  purple: ColorScale;
  pink: ColorScale;
  cyan: ColorScale;
  teal: ColorScale;
  violet: ColorScale;
  indigo: ColorScale;
};

// Semantic CSS variable-based colors for theme switching
export declare const semanticSurfaceColors: Record<string, string>;
export declare const semanticTextColors: Record<string, string>;
export declare const semanticBorderColors: Record<string, string>;
export declare const semanticInteractiveColors: Record<string, string>;
export declare const semanticShadowTokens: Record<string, string>;

// Typography tokens
export declare const fontFamilies: {
  display: string[];
  heading: string[];
  body: string[];
  mono: string[];
  code: string[];
};

export declare const fontWeightTokens: {
  'weight-normal': string;
  'weight-medium': string;
  'weight-semibold': string;
  'weight-bold': string;
};

export declare const fontSizeScale: Record<string, [string, { lineHeight: string; letterSpacing?: string }]>;

export declare const lineHeightTokens: {
  'leading-display': string;
  'leading-heading': string;
  'leading-title': string;
  'leading-subtitle': string;
  'leading-body': string;
  'leading-relaxed': string;
  'leading-comfortable': string;
  'leading-none': string;
};

// Layout tokens
export declare const borderRadiusTokens: {
  'radius-none': string;
  'radius-subtle': string;
  'radius-sm': string;
  'radius-button': string;
  'radius-input': string;
  'radius-card': string;
  'radius-avatar': string;
  'radius-badge': string;
  'radius-tag': string;
};

export declare const shadowTokens: {
  none: string;
  outline: string;
  'outline-bold': string;
  hard: string;
  'hard-lg': string;
  'hard-white': string;
  'hard-lg-white': string;
};

export declare const breakpointTokens: {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
};

export declare const opacityTokens: Record<string | number, string>;

export declare const aspectRatioTokens: {
  auto: string;
  square: string;
  video: string;
  'video-vertical': string;
  photo: string;
  'photo-portrait': string;
  wide: string;
  ultrawide: string;
  golden: string;
};

export declare const ringTokens: {
  width: Record<string, string>;
  offset: Record<string, string>;
  colors: Record<string, string>;
};

export declare const outlineTokens: Record<string, [string, string]>;

export declare const backdropBlurTokens: Record<string, string>;

export declare const gridRowTokens: Record<string | number, string>;

// Tailwind configuration
export declare const baseTailwindConfig: Config;

export declare const createTailwindConfig: (overrides?: Partial<Config>) => Config;
