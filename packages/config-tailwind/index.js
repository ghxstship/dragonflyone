const typographyPlugin = require('@tailwindcss/typography');

/**
 * GHXSTSHIP Design System - Monochromatic Palette
 * Contemporary Minimal Pop Art aesthetic
 */
const monochromePalette = {
  black: '#000000',
  white: '#FFFFFF',
  grey: {
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  }
};

/**
 * Ink palette - semantic alias for dark-mode-first design
 */
const inkPalette = {
  50: '#FFFFFF',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#000000'
};

/**
 * Semantic Text Colors - WCAG AA compliant text/background pairings
 * 
 * Usage:
 * - text-on-dark-*: Use when text appears on dark backgrounds (ink-700 to ink-950)
 * - text-on-light-*: Use when text appears on light backgrounds (ink-50 to ink-200)
 * - text-on-mid-*: Use when text appears on mid-tone backgrounds (ink-400 to ink-600)
 */
const textColorPalette = {
  // On dark backgrounds (ink-700, ink-800, ink-900, ink-950)
  'on-dark': {
    primary: inkPalette[50],      // #FFFFFF - 21:1 on ink-950
    secondary: inkPalette[300],   // #D4D4D4 - 12.6:1 on ink-950
    muted: inkPalette[400],       // #A3A3A3 - 7.4:1 on ink-950
    disabled: inkPalette[500],    // #737373 - 4.6:1 on ink-950
  },
  // On light backgrounds (ink-50, ink-100, ink-200)
  'on-light': {
    primary: inkPalette[950],     // #000000 - 21:1 on ink-50
    secondary: inkPalette[700],   // #404040 - 9.7:1 on ink-50
    muted: inkPalette[500],       // #737373 - 4.6:1 on ink-50
    disabled: inkPalette[400],    // #A3A3A3 - 2.7:1 on ink-50 (decorative only)
  },
  // On mid-tone backgrounds (ink-400, ink-500, ink-600)
  'on-mid': {
    primary: inkPalette[50],      // #FFFFFF - 7.4:1 on ink-500
    secondary: inkPalette[200],   // #E5E5E5 - 5.3:1 on ink-500
  },
};

/**
 * Semantic Status Colors - for status indicators, alerts, and data visualization
 * These are exceptions to the monochromatic palette for accessibility
 */
const statusPalette = {
  success: {
    DEFAULT: '#22C55E',
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  warning: {
    DEFAULT: '#F59E0B',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    DEFAULT: '#EF4444',
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  info: {
    DEFAULT: '#3B82F6',
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
};

/**
 * Accent Colors - for categories, tags, and decorative elements
 * Used for visual distinction, not semantic meaning
 */
const accentPalette = {
  purple: {
    DEFAULT: '#A855F7',
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },
  pink: {
    DEFAULT: '#EC4899',
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  cyan: {
    DEFAULT: '#06B6D4',
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  teal: {
    DEFAULT: '#14B8A6',
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  violet: {
    DEFAULT: '#8B5CF6',
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  indigo: {
    DEFAULT: '#6366F1',
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
};

const fontFamilies = {
  display: ['var(--font-anton)', 'Anton', 'Impact', 'Arial Black', 'sans-serif'],
  heading: ['var(--font-bebas-neue)', 'Bebas Neue', 'Arial Narrow', 'Arial', 'sans-serif'],
  body: ['var(--font-share-tech)', 'Share Tech', 'Monaco', 'Consolas', 'monospace'],
  mono: ['var(--font-share-tech-mono)', 'Share Tech Mono', 'Monaco', 'Consolas', 'monospace'],
  code: ['var(--font-share-tech-mono)', 'Share Tech Mono', 'Monaco', 'Consolas', 'monospace']
};

/**
 * Semantic font weight tokens
 * Use these instead of raw Tailwind font-weight classes
 */
const fontWeightTokens = {
  'weight-normal': '400',
  'weight-medium': '500',
  'weight-semibold': '600',
  'weight-bold': '700',
};

/**
 * Semantic border radius tokens - Bold Contemporary Pop Art Adventure
 * Sharp to rounded scale with component-specific tokens
 */
const borderRadiusTokens = {
  'radius-none': '0px',
  'radius-sm': 'var(--radius-sm, 2px)',        // Subtle rounding
  'radius-DEFAULT': 'var(--radius-DEFAULT, 4px)', // Default interactive
  'radius-md': 'var(--radius-md, 6px)',        // Medium elements
  'radius-lg': 'var(--radius-lg, 8px)',        // Cards, panels
  'radius-xl': 'var(--radius-xl, 12px)',       // Large cards
  'radius-2xl': 'var(--radius-2xl, 16px)',     // Modals, feature cards
  'radius-3xl': 'var(--radius-3xl, 24px)',     // Hero elements
  'radius-full': '9999px',                      // Pills, avatars
  // Component-specific
  'radius-button': 'var(--radius-button, 4px)', // Sharp, bold action
  'radius-input': 'var(--radius-input, 4px)',   // Matches buttons
  'radius-card': 'var(--radius-card, 8px)',     // Panel aesthetic
  'radius-modal': 'var(--radius-modal, 16px)',  // Contained, prominent
  'radius-badge': 'var(--radius-badge, 2px)',   // Label-like, sharp
  'radius-avatar': 'var(--radius-avatar, 9999px)', // Always circular
  'radius-tooltip': 'var(--radius-tooltip, 4px)', // Speech bubble
};

/**
 * Semantic line-height tokens
 * Use these instead of raw leading-* classes
 */
const lineHeightTokens = {
  'leading-display': '0.9',
  'leading-heading': '1.0',
  'leading-title': '1.1',
  'leading-subtitle': '1.2',
  'leading-body': '1.6',
  'leading-relaxed': '1.4',
  'leading-comfortable': '1.8',
  'leading-none': '1',
};

/**
 * Semantic Surface/Background Colors (CSS Variable-based)
 * These enable automatic theme switching without prop drilling
 * 
 * Usage:
 * - bg-surface-primary: Main content background
 * - bg-surface-secondary: Subtle differentiation (cards, sections)
 * - bg-surface-elevated: Modals, dropdowns, popovers
 * - bg-surface-overlay: Backdrop overlays
 * - bg-surface-inverse: Inverted sections (headers, CTAs)
 * - bg-surface-muted: Disabled/inactive states
 */
const semanticSurfaceColors = {
  'surface-primary': 'var(--surface-primary)',
  'surface-secondary': 'var(--surface-secondary)',
  'surface-tertiary': 'var(--surface-tertiary)',
  'surface-elevated': 'var(--surface-elevated)',
  'surface-overlay': 'var(--surface-overlay)',
  'surface-inverse': 'var(--surface-inverse)',
  'surface-muted': 'var(--surface-muted)',
  'surface-accent': 'var(--surface-accent)',
};

/**
 * Semantic Text Colors (CSS Variable-based)
 * Automatically adjust based on theme
 */
const semanticTextColors = {
  'text-primary': 'var(--text-primary)',
  'text-secondary': 'var(--text-secondary)',
  'text-tertiary': 'var(--text-tertiary)',
  'text-muted': 'var(--text-muted)',
  'text-inverse': 'var(--text-inverse)',
  'text-accent': 'var(--text-accent)',
  'text-link': 'var(--text-link)',
  'text-link-hover': 'var(--text-link-hover)',
};

/**
 * Semantic Border Colors (CSS Variable-based)
 */
const semanticBorderColors = {
  'border-primary': 'var(--border-primary)',
  'border-secondary': 'var(--border-secondary)',
  'border-muted': 'var(--border-muted)',
  'border-focus': 'var(--border-focus)',
  'border-inverse': 'var(--border-inverse)',
  'border-accent': 'var(--border-accent)',
};

/**
 * Semantic Interactive State Colors (CSS Variable-based)
 */
const semanticInteractiveColors = {
  'hover-surface': 'var(--hover-surface)',
  'active-surface': 'var(--active-surface)',
  'focus-ring': 'var(--focus-ring)',
};

/**
 * Semantic Shadow tokens (CSS Variable-based)
 */
const semanticShadowTokens = {
  'shadow-sm': 'var(--shadow-sm)',
  'shadow-md': 'var(--shadow-md)',
  'shadow-lg': 'var(--shadow-lg)',
};

/**
 * Typography Scale - based on design tokens
 */
const fontSizeScale = {
  'display-xl': ['7.5rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
  'display-lg': ['5.625rem', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
  'display-md': ['4.5rem', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
  'h1-lg': ['5rem', { lineHeight: '1.0', letterSpacing: '-0.01em' }],
  'h1-md': ['3.5rem', { lineHeight: '1.0', letterSpacing: '-0.01em' }],
  'h1-sm': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
  'h2-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '0.04em' }],
  'h2-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '0.04em' }],
  'h2-sm': ['1.75rem', { lineHeight: '1.1', letterSpacing: '0.04em' }],
  'h3-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '0.04em' }],
  'h3-md': ['2rem', { lineHeight: '1.1', letterSpacing: '0.04em' }],
  'h3-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0.04em' }],
  'h4-lg': ['2rem', { lineHeight: '1.2', letterSpacing: '0.04em' }],
  'h4-md': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0.04em' }],
  'h4-sm': ['1.25rem', { lineHeight: '1.2', letterSpacing: '0.04em' }],
  'h5-lg': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0.04em' }],
  'h5-md': ['1.25rem', { lineHeight: '1.3', letterSpacing: '0.04em' }],
  'h5-sm': ['1.125rem', { lineHeight: '1.3', letterSpacing: '0.04em' }],
  'h6-lg': ['1.25rem', { lineHeight: '1.3', letterSpacing: '0.04em' }],
  'h6-md': ['1.125rem', { lineHeight: '1.3', letterSpacing: '0.04em' }],
  'h6-sm': ['1rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
  'body-lg': ['1.25rem', { lineHeight: '1.6' }],
  'body-md': ['1.125rem', { lineHeight: '1.6' }],
  'body-sm': ['1rem', { lineHeight: '1.6' }],
  'body-xs': ['0.9375rem', { lineHeight: '1.6' }],
  'mono-lg': ['1rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
  'mono-md': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
  'mono-sm': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
  'mono-xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
  'mono-xxs': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
  'micro': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
  'micro-xs': ['0.5625rem', { lineHeight: '1.4', letterSpacing: '0.15em' }]
};

/**
 * Shadow tokens - Bold Contemporary Pop Art Adventure
 * Hard offset shadows for comic panel aesthetic
 */
const shadowTokens = {
  none: 'var(--shadow-none, none)',
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  DEFAULT: 'var(--shadow-DEFAULT)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  // Accent shadows - POP ART
  primary: 'var(--shadow-primary)',
  accent: 'var(--shadow-accent)',
  // State shadows
  hover: 'var(--shadow-hover)',
  active: 'var(--shadow-active)',
  focus: 'var(--shadow-focus)',
  inset: 'var(--shadow-inset)',
  // Legacy compatibility
  outline: '0 0 0 1px #404040',
  'outline-bold': '0 0 0 2px #000000',
  hard: 'var(--shadow-md)',
  'hard-lg': 'var(--shadow-lg)',
  'hard-white': '4px 4px 0 0 #FFFFFF',
  'hard-lg-white': '8px 8px 0 0 #FFFFFF',
  // Pop art specific
  pop: 'var(--shadow-md)',
  'pop-lg': 'var(--shadow-lg)',
  'pop-primary': 'var(--shadow-primary)',
  'pop-accent': 'var(--shadow-accent)',
};

/**
 * Breakpoint tokens - responsive design
 */
const breakpointTokens = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Opacity tokens - semantic opacity values
 */
const opacityTokens = {
  0: '0',
  5: '0.05',
  10: '0.1',
  15: '0.15',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  85: '0.85',
  90: '0.9',
  95: '0.95',
  100: '1',
  // Semantic opacity tokens
  'overlay-light': '0.3',
  'overlay': '0.5',
  'overlay-heavy': '0.7',
  'disabled': '0.5',
  'muted': '0.6',
  'hover': '0.8',
};

/**
 * Aspect ratio tokens
 */
const aspectRatioTokens = {
  auto: 'auto',
  square: '1 / 1',
  video: '16 / 9',
  'video-vertical': '9 / 16',
  photo: '4 / 3',
  'photo-portrait': '3 / 4',
  wide: '21 / 9',
  ultrawide: '32 / 9',
  golden: '1.618 / 1',
};

/**
 * Ring tokens - focus ring configuration for accessibility
 */
const ringTokens = {
  width: {
    DEFAULT: '2px',
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
  },
  offset: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
  },
  colors: {
    DEFAULT: inkPalette[50],
    focus: inkPalette[50],
    'focus-dark': inkPalette[950],
    error: '#EF4444',
    success: '#22C55E',
  },
};

/**
 * Outline tokens - outline configuration
 */
const outlineTokens = {
  none: ['2px solid transparent', '0px'],
  DEFAULT: ['2px solid currentColor', '2px'],
  dashed: ['2px dashed currentColor', '2px'],
};

/**
 * Backdrop blur tokens
 */
const backdropBlurTokens = {
  none: '0',
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
};

/**
 * Grid template rows tokens
 */
const gridRowTokens = {
  1: 'repeat(1, minmax(0, 1fr))',
  2: 'repeat(2, minmax(0, 1fr))',
  3: 'repeat(3, minmax(0, 1fr))',
  4: 'repeat(4, minmax(0, 1fr))',
  5: 'repeat(5, minmax(0, 1fr))',
  6: 'repeat(6, minmax(0, 1fr))',
  none: 'none',
  // Semantic grid rows
  'header-content': 'auto 1fr',
  'header-content-footer': 'auto 1fr auto',
  'sidebar-content': '16rem 1fr',
};

const baseTailwindConfig = {
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true
  },
  theme: {
    // Custom breakpoints/screens
    screens: breakpointTokens,
    // Container configuration
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
    },
    extend: {
      colors: {
        black: monochromePalette.black,
        white: monochromePalette.white,
        grey: monochromePalette.grey,
        ink: inkPalette,
        // Semantic status colors for accessibility
        success: statusPalette.success,
        warning: statusPalette.warning,
        error: statusPalette.error,
        info: statusPalette.info,
        // Accent colors for categories, tags, decorative elements
        purple: accentPalette.purple,
        pink: accentPalette.pink,
        cyan: accentPalette.cyan,
        teal: accentPalette.teal,
        violet: accentPalette.violet,
        indigo: accentPalette.indigo,
        // Semantic surface colors (CSS variable-based for theming)
        ...semanticSurfaceColors,
        // Semantic interactive state colors (CSS variable-based for theming)
        ...semanticInteractiveColors,
      },
      // Semantic text colors for WCAG-compliant text/background pairings
      // Usage: text-on-dark-primary, text-on-light-secondary, text-on-mid-muted, etc.
      textColor: {
        'on-dark': textColorPalette['on-dark'],
        'on-light': textColorPalette['on-light'],
        'on-mid': textColorPalette['on-mid'],
        // Semantic text colors (CSS variable-based for theming)
        ...semanticTextColors,
      },
      // Semantic border colors (CSS variable-based for theming)
      borderColor: {
        ...semanticBorderColors,
      },
      // Semantic shadows (CSS variable-based for theming)
      boxShadow: {
        ...shadowTokens,
        ...semanticShadowTokens,
      },
      // Opacity tokens
      opacity: opacityTokens,
      // Aspect ratio tokens
      aspectRatio: aspectRatioTokens,
      // Ring (focus) tokens
      ringWidth: ringTokens.width,
      ringOffsetWidth: ringTokens.offset,
      ringColor: ringTokens.colors,
      ringOffsetColor: {
        DEFAULT: inkPalette[950],
        light: inkPalette[50],
      },
      // Outline tokens
      outlineOffset: {
        0: '0px',
        1: '1px',
        2: '2px',
        4: '4px',
      },
      // Backdrop blur tokens
      backdropBlur: backdropBlurTokens,
      // Grid template rows
      gridTemplateRows: gridRowTokens,
      fontFamily: fontFamilies,
      fontSize: fontSizeScale,
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.02em',
        wider: '0.04em',
        widest: '0.05em',
        ultra: '0.1em',
        // Design system label/kicker tracking tokens
        label: '0.2em',
        kicker: '0.3em',
        display: '0.4em',
      },
      lineHeight: {
        tight: '0.9',
        snug: '1.0',
        normal: '1.1',
        relaxed: '1.2',
        loose: '1.4',
        body: '1.6',
        comfortable: '1.8',
        // Semantic line-height tokens
        ...lineHeightTokens,
      },
      spacing: {
        15: '3.75rem',
        18: '4.5rem',
        // Semantic spacing tokens
        'spacing-0': '0',
        'spacing-px': '1px',
        'spacing-0.5': '0.125rem',
        'spacing-1': '0.25rem',
        'spacing-1.5': '0.375rem',
        'spacing-2': '0.5rem',
        'spacing-2.5': '0.625rem',
        'spacing-3': '0.75rem',
        'spacing-3.5': '0.875rem',
        'spacing-4': '1rem',
        'spacing-5': '1.25rem',
        'spacing-6': '1.5rem',
        'spacing-7': '1.75rem',
        'spacing-8': '2rem',
        'spacing-9': '2.25rem',
        'spacing-10': '2.5rem',
        'spacing-11': '2.75rem',
        'spacing-12': '3rem',
        'spacing-14': '3.5rem',
        'spacing-16': '4rem',
        'spacing-20': '5rem',
        'spacing-24': '6rem',
        'spacing-28': '7rem',
        'spacing-32': '8rem',
        'spacing-36': '9rem',
        'spacing-40': '10rem',
        'spacing-44': '11rem',
        'spacing-48': '12rem',
        'spacing-52': '13rem',
        'spacing-56': '14rem',
        'spacing-60': '15rem',
        'spacing-64': '16rem',
        'spacing-72': '18rem',
        'spacing-80': '20rem',
        'spacing-96': '24rem',
        // Semantic gap tokens
        'gap-xs': '0.25rem',
        'gap-sm': '0.5rem',
        'gap-md': '1rem',
        'gap-lg': '1.5rem',
        'gap-xl': '2rem',
        'gap-2xl': '3rem',
        'gap-3xl': '4rem',
      },
      // Semantic width tokens
      width: {
        'icon-xs': '0.75rem',
        'icon-sm': '1rem',
        'icon-md': '1.25rem',
        'icon-lg': '1.5rem',
        'icon-xl': '2rem',
        'icon-2xl': '2.5rem',
        'avatar-xs': '1.5rem',
        'avatar-sm': '2rem',
        'avatar-md': '2.5rem',
        'avatar-lg': '3rem',
        'avatar-xl': '4rem',
        'avatar-2xl': '5rem',
      },
      // Semantic height tokens
      height: {
        'icon-xs': '0.75rem',
        'icon-sm': '1rem',
        'icon-md': '1.25rem',
        'icon-lg': '1.5rem',
        'icon-xl': '2rem',
        'icon-2xl': '2.5rem',
        'avatar-xs': '1.5rem',
        'avatar-sm': '2rem',
        'avatar-md': '2.5rem',
        'avatar-lg': '3rem',
        'avatar-xl': '4rem',
        'avatar-2xl': '5rem',
        'input': '2.5rem',
        'input-sm': '2rem',
        'input-lg': '3rem',
        'button': '2.5rem',
        'button-sm': '2rem',
        'button-lg': '3rem',
      },
      // Semantic min-width tokens
      minWidth: {
        'card-sm': '18.75rem', // 300px
        'card-md': '20rem', // 320px
        'card-lg': '24rem', // 384px
        'sidebar': '16rem', // 256px
        'select': '18.75rem', // 300px
      },
      // Semantic max-width tokens
      maxWidth: {
        'container-xs': '20rem',
        'container-sm': '24rem',
        'container-md': '28rem',
        'container-lg': '32rem',
        'container-xl': '36rem',
        'container-2xl': '42rem',
        'container-3xl': '48rem',
        'container-4xl': '56rem',
        'container-5xl': '64rem',
        'container-6xl': '72rem',
        'container-7xl': '80rem',
        'prose': '65ch',
        'content': '80rem',
      },
      // Semantic min-height tokens
      minHeight: {
        'card': '5rem', // 80px
        'calendar-cell': '3.75rem', // 60px
        'panel-sm': '25rem', // 400px
        'panel-md': '31.25rem', // 500px
        'panel-lg': '37.5rem', // 600px
        'chat': '25rem', // 400px
        'map': '31.25rem', // 500px
      },
      // Semantic max-height tokens
      maxHeight: {
        'dropdown': '18.75rem', // 300px
        'modal': '25rem', // 400px
        'panel-sm': '25rem', // 400px
        'panel-md': '31.25rem', // 500px
        'panel-lg': '37.5rem', // 600px
        'chat': '25rem', // 400px
      },
      borderWidth: {
        3: '3px',
        4: '4px'
      },
      borderRadius: {
        none: '0',
        subtle: '2px',
        sm: '4px',
        // Semantic radius tokens
        ...borderRadiusTokens,
      },
      fontWeight: fontWeightTokens,
      zIndex: {
        base: '0',
        dropdown: '1000',
        sticky: '1100',
        fixed: '1200',
        'modal-backdrop': '1300',
        modal: '1400',
        popover: '1500',
        tooltip: '1600'
      },
      transitionDuration: {
        fast: '100ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms'
      },
      // Animation durations - SNAPPY
      transitionTimingFunction: {
        'ease-bounce': 'var(--ease-bounce, cubic-bezier(0.34, 1.56, 0.64, 1))',
        'ease-snap': 'var(--ease-snap, cubic-bezier(0.68, -0.6, 0.32, 1.6))',
        'ease-spring': 'var(--ease-spring, cubic-bezier(0.175, 0.885, 0.32, 1.1))',
      },
      animation: {
        // Legacy
        'hard-fade': 'hardFade 300ms ease-out',
        scanline: 'scanline 1.5s linear infinite',
        // Bold Contemporary Pop Art Adventure animations
        'pop-in': 'pop-in 0.3s var(--ease-bounce) forwards',
        'slide-up-bounce': 'slide-up-bounce 0.4s var(--ease-bounce) forwards',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-shadow': 'pulse-shadow 2s ease-in-out infinite',
        'comic-appear': 'comic-appear 0.4s var(--ease-bounce) forwards',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'fade-out': 'fade-out 0.2s ease-out forwards',
        'zoom-in': 'zoom-in 0.2s var(--ease-bounce) forwards',
        'zoom-out': 'zoom-out 0.15s ease-out forwards',
        'slide-in-top': 'slide-in-from-top 0.2s var(--ease-bounce) forwards',
        'slide-in-bottom': 'slide-in-from-bottom 0.2s var(--ease-bounce) forwards',
      },
      keyframes: {
        // Legacy
        hardFade: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        // Bold Contemporary Pop Art Adventure keyframes
        'pop-in': {
          '0%': { opacity: 0, transform: 'scale(0.9) translateY(10px)' },
          '50%': { transform: 'scale(1.02) translateY(-2px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' }
        },
        'slide-up-bounce': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '60%': { transform: 'translateY(-5px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px) rotate(-1deg)' },
          '40%': { transform: 'translateX(4px) rotate(1deg)' },
          '60%': { transform: 'translateX(-4px) rotate(-1deg)' },
          '80%': { transform: 'translateX(4px) rotate(1deg)' }
        },
        'pulse-shadow': {
          '0%, 100%': { boxShadow: 'var(--shadow-md)' },
          '50%': { boxShadow: 'var(--shadow-lg), 0 0 0 4px hsl(var(--primary) / 0.2)' }
        },
        'comic-appear': {
          '0%': { opacity: 0, transform: 'scale(0.5) rotate(-5deg)' },
          '60%': { transform: 'scale(1.1) rotate(2deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        'fade-out': {
          from: { opacity: 1 },
          to: { opacity: 0 }
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 }
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 }
        },
        'zoom-in': {
          from: { transform: 'scale(0.95)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 }
        },
        'zoom-out': {
          from: { transform: 'scale(1)', opacity: 1 },
          to: { transform: 'scale(0.95)', opacity: 0 }
        }
      },
      backgroundImage: {
        halftone: 'radial-gradient(circle, rgba(0,0,0,0.65) 1px, transparent 1px)',
        'halftone-inverted': 'radial-gradient(circle, rgba(255,255,255,0.65) 1px, transparent 1px)',
        'grid-light': 'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'grid-dark': 'linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.04) 1px, transparent 1px)'
      },
      backgroundSize: {
        halftone: '10px 10px',
        'grid-sm': '20px 20px',
        'grid-md': '40px 40px',
        'grid-lg': '60px 60px'
      }
    }
  },
  plugins: [typographyPlugin]
};

const createTailwindConfig = (overrides = {}) => {
  return {
    ...baseTailwindConfig,
    ...overrides,
    theme: {
      ...baseTailwindConfig.theme,
      ...(overrides.theme || {}),
      extend: {
        ...baseTailwindConfig.theme.extend,
        ...((overrides.theme && overrides.theme.extend) || {})
      }
    }
  };
};

module.exports = {
  // Color palettes
  monochromePalette,
  inkPalette,
  textColorPalette,
  statusPalette,
  accentPalette,
  // Semantic CSS variable-based tokens for theme switching
  semanticSurfaceColors,
  semanticTextColors,
  semanticBorderColors,
  semanticInteractiveColors,
  semanticShadowTokens,
  // Typography tokens
  fontFamilies,
  fontWeightTokens,
  fontSizeScale,
  lineHeightTokens,
  // Layout tokens
  borderRadiusTokens,
  shadowTokens,
  breakpointTokens,
  opacityTokens,
  aspectRatioTokens,
  ringTokens,
  outlineTokens,
  backdropBlurTokens,
  gridRowTokens,
  // Tailwind config
  baseTailwindConfig,
  createTailwindConfig,
};
