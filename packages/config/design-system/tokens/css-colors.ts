import { 
  grayscale, 
  semantic, 
  surfaces, 
  text, 
  borders,
  AccentColorScale,
  brandAccents,
  BrandId,
  ColorMode
} from './colors';

export const generateColorCSS = (
  accent: AccentColorScale,
  mode: ColorMode
): string => {
  const surface = surfaces[mode];
  const textColors = text[mode];
  const borderColors = borders[mode];
  
  return `
/* ═══════════════════════════════════════════════════════════════════════════════
   COLOR SYSTEM - ${mode.toUpperCase()} MODE
   Generated from design tokens. DO NOT EDIT MANUALLY.
   ═══════════════════════════════════════════════════════════════════════════════ */

:root[data-theme="${mode}"], .${mode} {
  
  /* ─────────────────────────────────────────────────────────────────────────────
     GRAYSCALE (Foundation)
     ───────────────────────────────────────────────────────────────────────────── */
  --color-white: ${grayscale.white};
  --color-black: ${grayscale.black};
  
  --color-gray-25: ${grayscale.gray[25]};
  --color-gray-50: ${grayscale.gray[50]};
  --color-gray-100: ${grayscale.gray[100]};
  --color-gray-150: ${grayscale.gray[150]};
  --color-gray-200: ${grayscale.gray[200]};
  --color-gray-300: ${grayscale.gray[300]};
  --color-gray-400: ${grayscale.gray[400]};
  --color-gray-500: ${grayscale.gray[500]};
  --color-gray-600: ${grayscale.gray[600]};
  --color-gray-700: ${grayscale.gray[700]};
  --color-gray-800: ${grayscale.gray[800]};
  --color-gray-900: ${grayscale.gray[900]};
  --color-gray-950: ${grayscale.gray[950]};

  /* ─────────────────────────────────────────────────────────────────────────────
     ACCENT (Brand Color - Whitelabel Variable)
     ───────────────────────────────────────────────────────────────────────────── */
  --color-accent-primary: ${accent.primary};
  --color-accent-hover: ${accent.hover};
  --color-accent-active: ${accent.active};
  --color-accent-subtle: ${accent.subtle};
  --color-accent-muted: ${accent.muted};
  --color-accent-ring: ${accent.ring};
  --color-accent-foreground: ${accent.foreground};

  /* ─────────────────────────────────────────────────────────────────────────────
     SEMANTIC (System States - Invariant)
     ───────────────────────────────────────────────────────────────────────────── */
  --color-success: ${semantic.success.base};
  --color-success-hover: ${semantic.success.hover};
  --color-success-subtle: ${semantic.success.subtle};
  --color-success-muted: ${semantic.success.muted};
  --color-success-foreground: ${semantic.success.foreground};
  --color-success-text: ${semantic.success.text};

  --color-warning: ${semantic.warning.base};
  --color-warning-hover: ${semantic.warning.hover};
  --color-warning-subtle: ${semantic.warning.subtle};
  --color-warning-muted: ${semantic.warning.muted};
  --color-warning-foreground: ${semantic.warning.foreground};
  --color-warning-text: ${semantic.warning.text};

  --color-error: ${semantic.error.base};
  --color-error-hover: ${semantic.error.hover};
  --color-error-subtle: ${semantic.error.subtle};
  --color-error-muted: ${semantic.error.muted};
  --color-error-foreground: ${semantic.error.foreground};
  --color-error-text: ${semantic.error.text};

  --color-info: ${semantic.info.base};
  --color-info-hover: ${semantic.info.hover};
  --color-info-subtle: ${semantic.info.subtle};
  --color-info-muted: ${semantic.info.muted};
  --color-info-foreground: ${semantic.info.foreground};
  --color-info-text: ${semantic.info.text};

  /* ─────────────────────────────────────────────────────────────────────────────
     SURFACES
     ───────────────────────────────────────────────────────────────────────────── */
  --color-background: ${surface.background};
  --color-background-subtle: ${surface.backgroundSubtle};
  --color-background-elevated: ${surface.backgroundElevated};
  --color-background-overlay: ${surface.backgroundOverlay};
  
  --color-surface-hover: ${surface.surfaceHover};
  --color-surface-active: ${surface.surfaceActive};
  --color-surface-selected: ${surface.surfaceSelected};
  --color-surface-selected-hover: ${surface.surfaceSelectedHover};
  
  --color-sidebar: ${surface.sidebar};
  --color-card: ${surface.card};
  --color-modal: ${surface.modal};
  --color-dropdown: ${surface.dropdown};
  --color-tooltip: ${surface.tooltip};
  --color-input: ${surface.input};
  --color-input-disabled: ${surface.inputDisabled};

  /* ─────────────────────────────────────────────────────────────────────────────
     TEXT
     ───────────────────────────────────────────────────────────────────────────── */
  --color-text-primary: ${textColors.primary};
  --color-text-secondary: ${textColors.secondary};
  --color-text-tertiary: ${textColors.tertiary};
  --color-text-disabled: ${textColors.disabled};
  --color-text-placeholder: ${textColors.placeholder};
  --color-text-inverse: ${textColors.inverse};
  --color-text-link: ${textColors.link};
  --color-text-link-hover: ${textColors.linkHover};

  /* ─────────────────────────────────────────────────────────────────────────────
     BORDERS
     ───────────────────────────────────────────────────────────────────────────── */
  --color-border: ${borderColors.default};
  --color-border-subtle: ${borderColors.subtle};
  --color-border-strong: ${borderColors.strong};
  --color-border-focus: ${borderColors.focus};
  --color-border-focus-ring: ${borderColors.focusRing};
  --color-border-error: ${borderColors.error};
  --color-border-error-ring: ${borderColors.errorRing};
}
`;
};

// Generate CSS for all GHXSTSHIP brands
export const generateAllBrandCSS = (): string => {
  const brands: BrandId[] = ['atlvs', 'compvss', 'gvteway'];
  const modes: ColorMode[] = ['light', 'dark'];
  
  let css = '';
  
  for (const brand of brands) {
    for (const mode of modes) {
      css += `
/* Brand: ${brand.toUpperCase()} | Mode: ${mode} */
[data-brand="${brand}"][data-theme="${mode}"],
[data-brand="${brand}"] .${mode} {
  ${generateColorCSS(brandAccents[brand], mode)}
}
`;
    }
  }
  
  return css;
};

// Generate individual brand CSS
export const generateBrandCSS = (brandId: BrandId, mode: ColorMode): string => {
  return generateColorCSS(brandAccents[brandId], mode);
};

// Generate Tailwind color configuration
export const generateTailwindConfig = () => ({
  colors: {
    // Grayscale
    white: 'var(--color-white)',
    black: 'var(--color-black)',
    gray: {
      25: 'var(--color-gray-25)',
      50: 'var(--color-gray-50)',
      100: 'var(--color-gray-100)',
      150: 'var(--color-gray-150)',
      200: 'var(--color-gray-200)',
      300: 'var(--color-gray-300)',
      400: 'var(--color-gray-400)',
      500: 'var(--color-gray-500)',
      600: 'var(--color-gray-600)',
      700: 'var(--color-gray-700)',
      800: 'var(--color-gray-800)',
      900: 'var(--color-gray-900)',
      950: 'var(--color-gray-950)',
    },
    
    // Accent (single brand color)
    accent: {
      DEFAULT: 'var(--color-accent-primary)',
      hover: 'var(--color-accent-hover)',
      active: 'var(--color-accent-active)',
      subtle: 'var(--color-accent-subtle)',
      muted: 'var(--color-accent-muted)',
      foreground: 'var(--color-accent-foreground)',
    },
    
    // Semantic
    success: {
      DEFAULT: 'var(--color-success)',
      hover: 'var(--color-success-hover)',
      subtle: 'var(--color-success-subtle)',
      muted: 'var(--color-success-muted)',
      foreground: 'var(--color-success-foreground)',
      text: 'var(--color-success-text)',
    },
    warning: {
      DEFAULT: 'var(--color-warning)',
      hover: 'var(--color-warning-hover)',
      subtle: 'var(--color-warning-subtle)',
      muted: 'var(--color-warning-muted)',
      foreground: 'var(--color-warning-foreground)',
      text: 'var(--color-warning-text)',
    },
    error: {
      DEFAULT: 'var(--color-error)',
      hover: 'var(--color-error-hover)',
      subtle: 'var(--color-error-subtle)',
      muted: 'var(--color-error-muted)',
      foreground: 'var(--color-error-foreground)',
      text: 'var(--color-error-text)',
    },
    info: {
      DEFAULT: 'var(--color-info)',
      hover: 'var(--color-info-hover)',
      subtle: 'var(--color-info-subtle)',
      muted: 'var(--color-info-muted)',
      foreground: 'var(--color-info-foreground)',
      text: 'var(--color-info-text)',
    },
    
    // Surfaces
    background: 'var(--color-background)',
    'background-subtle': 'var(--color-background-subtle)',
    'background-elevated': 'var(--color-background-elevated)',
    card: 'var(--color-card)',
    modal: 'var(--color-modal)',
    dropdown: 'var(--color-dropdown)',
    tooltip: 'var(--color-tooltip)',
    input: 'var(--color-input)',
    sidebar: 'var(--color-sidebar)',
    
    // Interactive surfaces
    'surface-hover': 'var(--color-surface-hover)',
    'surface-active': 'var(--color-surface-active)',
    'surface-selected': 'var(--color-surface-selected)',
    'surface-selected-hover': 'var(--color-surface-selected-hover)',
    
    // Text
    'text-primary': 'var(--color-text-primary)',
    'text-secondary': 'var(--color-text-secondary)',
    'text-tertiary': 'var(--color-text-tertiary)',
    'text-disabled': 'var(--color-text-disabled)',
    'text-placeholder': 'var(--color-text-placeholder)',
    'text-inverse': 'var(--color-text-inverse)',
    
    // Borders
    border: 'var(--color-border)',
    'border-subtle': 'var(--color-border-subtle)',
    'border-strong': 'var(--color-border-strong)',
    'border-focus': 'var(--color-border-focus)',
    'border-error': 'var(--color-border-error)',
  },
});

// Legacy brand color mappings for backward compatibility
export const generateLegacyBrandMappings = () => ({
  'brand-pink': 'var(--color-accent-primary)', // ATLVS
  'brand-yellow': 'var(--color-accent-primary)', // COMPVSS  
  'brand-cyan': 'var(--color-accent-primary)', // GVTEWAY
  'brand-primary': 'var(--color-accent-primary)',
  'brand-primary-hover': 'var(--color-accent-hover)',
  'brand-accent': 'var(--color-accent-primary)',
});
