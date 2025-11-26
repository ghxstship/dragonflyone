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
 * Shadow tokens - hard geometric shadows only
 */
const shadowTokens = {
  none: 'none',
  outline: '0 0 0 1px #404040',
  'outline-bold': '0 0 0 2px #000000',
  hard: '4px 4px 0 0 #000000',
  'hard-lg': '8px 8px 0 0 #000000',
  'hard-white': '4px 4px 0 0 #FFFFFF',
  'hard-lg-white': '8px 8px 0 0 #FFFFFF'
};

const baseTailwindConfig = {
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true
  },
  theme: {
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
      },
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
        comfortable: '1.8'
      },
      spacing: {
        15: '3.75rem',
        18: '4.5rem'
      },
      borderWidth: {
        3: '3px',
        4: '4px'
      },
      borderRadius: {
        none: '0',
        subtle: '2px',
        sm: '4px'
      },
      boxShadow: shadowTokens,
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
      animation: {
        'hard-fade': 'hardFade 300ms ease-out',
        scanline: 'scanline 1.5s linear infinite'
      },
      keyframes: {
        hardFade: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
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
  monochromePalette,
  inkPalette,
  fontFamilies,
  fontSizeScale,
  shadowTokens,
  baseTailwindConfig,
  createTailwindConfig
};
