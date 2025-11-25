const typographyPlugin = require('@tailwindcss/typography');

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

const fontFamilies = {
  display: 'var(--font-anton, "Anton", sans-serif)',
  heading: 'var(--font-bebas, "Bebas Neue", sans-serif)',
  body: 'var(--font-share-tech, "Share Tech", sans-serif)',
  mono: 'var(--font-share-tech-mono, "Share Tech Mono", monospace)'
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
        grey: monochromePalette.grey
      },
      fontFamily: fontFamilies,
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em'
      },
      spacing: {
        15: '3.75rem',
        18: '4.5rem'
      },
      borderWidth: {
        3: '3px'
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
        'halftone-inverted': 'radial-gradient(circle, rgba(255,255,255,0.65) 1px, transparent 1px)'
      },
      backgroundSize: {
        halftone: '10px 10px'
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
  fontFamilies,
  baseTailwindConfig,
  createTailwindConfig
};
