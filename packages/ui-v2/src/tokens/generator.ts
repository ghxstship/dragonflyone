/**
 * UI v2 Token Generator
 * Generates complete design tokens from brand configuration
 */

import type { BrandConfig, DesignTokens, BorderRadius, Shadow } from './types';
import { generateAccessiblePalette, generateColorPalette } from './palette-generator';

// ============================================================================
// Foundation Token Generators
// ============================================================================

/**
 * Generate complete design tokens from brand configuration
 */
export function generateDesignTokens(brand: BrandConfig): DesignTokens {
  // Generate brand color palette
  const brandPalette = generateAccessiblePalette(brand.colors.brand);

  // Generate accent palette if provided
  const accentPalette = brand.colors.accent
    ? generateAccessiblePalette(brand.colors.accent)
    : brandPalette;

  return {
    colors: {
      palette: {
        brand: brandPalette.palette,
        neutral: generateNeutralPalette(),
        success: generateSuccessPalette(),
        warning: generateWarningPalette(),
        error: generateErrorPalette(),
        info: generateInfoPalette(),
      },
      semantic: {
        text: {
          primary: '', // Will be set via CSS variables based on color mode
          secondary: '',
          tertiary: '',
          disabled: '',
          inverse: '',
          link: brandPalette.palette[600],
          linkHover: brandPalette.palette[700],
          onBrand: brandPalette.textColors.onBrand,
          success: '',
          warning: '',
          error: '',
          info: '',
        },
        surface: {
          primary: '',
          secondary: '',
          tertiary: '',
          elevated: '',
          overlay: '',
          inverse: '',
          brand: brandPalette.palette[500],
          brandSubtle: brandPalette.palette[50],
          success: '',
          successSubtle: '',
          warning: '',
          warningSubtle: '',
          error: '',
          errorSubtle: '',
          info: '',
          infoSubtle: '',
        },
        border: {
          primary: '',
          secondary: '',
          tertiary: '',
          focus: brandPalette.palette[500],
          inverse: '',
          brand: brandPalette.palette[500],
          success: '',
          warning: '',
          error: '',
          info: '',
        },
        interactive: {
          primary: brandPalette.palette[500],
          primaryHover: brandPalette.states.hover,
          primaryActive: brandPalette.states.active,
          primaryDisabled: brandPalette.states.disabled,
          secondary: '',
          secondaryHover: '',
          secondaryActive: '',
          tertiary: '',
          tertiaryHover: '',
          danger: '',
          dangerHover: '',
        },
      },
    },
    spacing: generateSpacingScale(brand.typography.scale || 'comfortable'),
    typography: generateTypography(brand),
    effects: generateEffects(brand),
  };
}

// ============================================================================
// Palette Generators
// ============================================================================

function generateNeutralPalette() {
  return generateColorPalette('#737373'); // Neutral gray
}

function generateSuccessPalette() {
  return generateColorPalette('#22c55e'); // Green
}

function generateWarningPalette() {
  return generateColorPalette('#f59e0b'); // Amber
}

function generateErrorPalette() {
  return generateColorPalette('#ef4444'); // Red
}

function generateInfoPalette() {
  return generateColorPalette('#3b82f6'); // Blue
}

// ============================================================================
// Spacing Generator
// ============================================================================

function generateSpacingScale(scale: 'compact' | 'comfortable' | 'spacious') {
  const multipliers = {
    compact: 0.875, // 87.5% of base
    comfortable: 1,  // 100% of base
    spacious: 1.125, // 112.5% of base
  };

  const multiplier = multipliers[scale];

  return {
    0: '0',
    1: `${0.25 * multiplier}rem`,
    2: `${0.5 * multiplier}rem`,
    3: `${0.75 * multiplier}rem`,
    4: `${1 * multiplier}rem`,
    5: `${1.25 * multiplier}rem`,
    6: `${1.5 * multiplier}rem`,
    8: `${2 * multiplier}rem`,
    10: `${2.5 * multiplier}rem`,
    12: `${3 * multiplier}rem`,
    16: `${4 * multiplier}rem`,
    20: `${5 * multiplier}rem`,
    24: `${6 * multiplier}rem`,
    32: `${8 * multiplier}rem`,
  };
}

// ============================================================================
// Typography Generator
// ============================================================================

function generateTypography(brand: BrandConfig) {
  return {
    family: {
      sans: brand.typography.fontFamily,
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      display: brand.typography.fontFamily,
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
    },
    weight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  };
}

// ============================================================================
// Effects Generator
// ============================================================================

function generateEffects(brand: BrandConfig) {
  return {
    radius: generateBorderRadius(brand.design.radius || 'md'),
    shadow: generateShadows(brand.design.shadows || 'soft'),
    transition: {
      fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
      base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    zIndex: {
      0: 0,
      10: 10,
      20: 20,
      30: 30,
      40: 40,
      50: 50,
      dropdown: 1000,
      sticky: 1100,
      fixed: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      tooltip: 1600,
      notification: 1700,
    },
  };
}

function generateBorderRadius(base: keyof BorderRadius): BorderRadius {
  const radiusValues = {
    none: { multiplier: 0, base: '0' },
    xs: { multiplier: 1, base: '0.125rem' },
    sm: { multiplier: 1, base: '0.25rem' },
    md: { multiplier: 1, base: '0.375rem' },
    lg: { multiplier: 1, base: '0.5rem' },
    xl: { multiplier: 1, base: '0.75rem' },
    '2xl': { multiplier: 1, base: '1rem' },
    '3xl': { multiplier: 1, base: '1.5rem' },
    full: { multiplier: 1, base: '9999px' },
  };

  const baseValue = radiusValues[base];

  return {
    none: '0',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  };
}

function generateShadows(style: 'none' | 'subtle' | 'soft' | 'hard'): Shadow {
  const shadowStyles = {
    none: {
      none: 'none',
      xs: 'none',
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
      '2xl': 'none',
      inner: 'none',
    },
    subtle: {
      none: 'none',
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
      md: '0 2px 4px 0 rgb(0 0 0 / 0.06)',
      lg: '0 4px 6px 0 rgb(0 0 0 / 0.07)',
      xl: '0 8px 12px 0 rgb(0 0 0 / 0.08)',
      '2xl': '0 12px 24px 0 rgb(0 0 0 / 0.10)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.03)',
    },
    soft: {
      none: 'none',
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    },
    hard: {
      none: 'none',
      xs: '2px 2px 0 0 rgb(0 0 0 / 1)',
      sm: '3px 3px 0 0 rgb(0 0 0 / 1)',
      md: '4px 4px 0 0 rgb(0 0 0 / 1)',
      lg: '6px 6px 0 0 rgb(0 0 0 / 1)',
      xl: '8px 8px 0 0 rgb(0 0 0 / 1)',
      '2xl': '12px 12px 0 0 rgb(0 0 0 / 1)',
      inner: 'inset 2px 2px 0 0 rgb(0 0 0 / 0.1)',
    },
  };

  return shadowStyles[style];
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generate CSS variables for brand-specific tokens
 */
export function generateBrandCSSVariables(tokens: DesignTokens): string {
  const brandPalette = tokens.colors.palette.brand;

  return `
/* Brand Color Palette */
--color-brand-50: ${brandPalette[50]};
--color-brand-100: ${brandPalette[100]};
--color-brand-200: ${brandPalette[200]};
--color-brand-300: ${brandPalette[300]};
--color-brand-400: ${brandPalette[400]};
--color-brand-500: ${brandPalette[500]};
--color-brand-600: ${brandPalette[600]};
--color-brand-700: ${brandPalette[700]};
--color-brand-800: ${brandPalette[800]};
--color-brand-900: ${brandPalette[900]};
--color-brand-950: ${brandPalette[950]};

/* Brand Interactive States */
--brand-interactive-primary: ${tokens.colors.semantic.interactive.primary};
--brand-interactive-primary-hover: ${tokens.colors.semantic.interactive.primaryHover};
--brand-interactive-primary-active: ${tokens.colors.semantic.interactive.primaryActive};

/* Brand Text */
--brand-text-on-brand: ${tokens.colors.semantic.text.onBrand};
--brand-text-link: ${tokens.colors.semantic.text.link};
--brand-text-link-hover: ${tokens.colors.semantic.text.linkHover};

/* Brand Surfaces */
--brand-surface-brand: ${tokens.colors.semantic.surface.brand};
--brand-surface-brand-subtle: ${tokens.colors.semantic.surface.brandSubtle};

/* Brand Borders */
--brand-border-brand: ${tokens.colors.semantic.border.brand};
--brand-border-focus: ${tokens.colors.semantic.border.focus};
`.trim();
}

/**
 * Generate complete CSS for a brand
 */
export function generateBrandCSS(brand: BrandConfig): string {
  const tokens = generateDesignTokens(brand);
  const brandVars = generateBrandCSSVariables(tokens);

  return `
/* =============================================================================
 * Brand: ${brand.identity.name}
 * Generated: ${new Date().toISOString()}
 * ============================================================================= */

@layer brand {
  [data-tenant="${brand.identity.slug}"] {
    /* Font Family */
    --font-sans: ${tokens.typography.family.sans};
    --font-display: ${tokens.typography.family.display};

    ${brandVars}
  }
}
`.trim();
}
