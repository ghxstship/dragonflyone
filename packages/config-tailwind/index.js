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
        ink: inkPalette
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
        ultra: '0.1em'
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
