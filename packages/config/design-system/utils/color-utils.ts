/**
 * APPROVED COLOR USAGE PATTERNS
 * 
 * These are the ONLY ways colors should be applied in components.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CSS VARIABLE REFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

// ✅ CORRECT: Use CSS variables
export const correctExamples = {
  // Accent colors
  accent: 'var(--color-accent-primary)',
  accentHover: 'var(--color-accent-hover)',
  accentSubtle: 'var(--color-accent-subtle)',
  
  // Text colors
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  
  // Backgrounds
  background: 'var(--color-background)',
  card: 'var(--color-card)',
  
  // Borders
  border: 'var(--color-border)',
  borderFocus: 'var(--color-border-focus)',
  
  // Semantic
  error: 'var(--color-error)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

// ❌ WRONG: Hardcoded colors
export const wrongExamples = {
  // Never do this
  wrong1: '#FF10F0',        // Hardcoded hex
  wrong2: 'rgb(255, 16, 240)', // Hardcoded rgb
  wrong3: 'pink',           // Color keyword
  wrong4: 'text-pink-500',  // Tailwind color class
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TAILWIND CLASS MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extend Tailwind config to use our CSS variables.
 * This allows using Tailwind syntax while maintaining token compliance.
 */
export const tailwindColorConfig = {
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
    
    // Semantic text
    muted: {
      DEFAULT: 'var(--color-gray-500)',
      foreground: 'var(--color-text-secondary)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. COLOR REMEDIATION MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════════

// Mapping of old colors to new tokens
export const colorRemediationMap = {
  // GHXSTSHIP Brand Colors
  '#FF10F0': 'var(--color-accent-primary)', // ATLVS Pink
  '#E60ED8': 'var(--color-accent-hover)',   // ATLVS Pink Hover
  '#CC0CC0': 'var(--color-accent-active)',  // ATLVS Pink Active
  
  '#FFD100': 'var(--color-accent-primary)', // COMPVSS Yellow
  '#E6BC00': 'var(--color-accent-hover)',   // COMPVSS Yellow Hover
  '#CCA700': 'var(--color-accent-active)',  // COMPVSS Yellow Active
  
  '#00F0FF': 'var(--color-accent-primary)', // GVTEWAY Cyan
  '#00D8E6': 'var(--color-accent-hover)',   // GVTEWAY Cyan Hover
  '#00C0CC': 'var(--color-accent-active)',  // GVTEWAY Cyan Active
  
  // Semantic Colors
  '#EF4444': 'var(--color-error)',         // Red
  '#DC2626': 'var(--color-error-hover)',   // Red Hover
  '#22C55E': 'var(--color-success)',        // Green
  '#16A34A': 'var(--color-success-hover)',  // Green Hover
  '#F59E0B': 'var(--color-warning)',        // Amber
  '#D97706': 'var(--color-warning-hover)',  // Amber Hover
  
  // Common Tailwind Colors
  'text-red-500': 'text-error',
  'text-green-500': 'text-success',
  'text-yellow-500': 'text-warning',
  'text-blue-500': 'text-info',
  
  'bg-red-500': 'bg-error',
  'bg-green-500': 'bg-success',
  'bg-yellow-500': 'bg-warning',
  'bg-blue-500': 'bg-info',
  
  'bg-red-100': 'bg-error-subtle',
  'bg-green-100': 'bg-success-subtle',
  'bg-yellow-100': 'bg-warning-subtle',
  'bg-blue-100': 'bg-info-subtle',
  
  // Grayscale (map to closest)
  '#F5F5F5': 'var(--color-gray-100)',
  '#E5E5E5': 'var(--color-gray-200)',
  '#D4D4D4': 'var(--color-gray-300)',
  '#A3A3A3': 'var(--color-gray-400)',
  '#737373': 'var(--color-gray-500)',
  '#525252': 'var(--color-gray-600)',
  '#404040': 'var(--color-gray-700)',
  '#262626': 'var(--color-gray-800)',
  '#171717': 'var(--color-gray-900)',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a color value is compliant with our token system
 */
export const isCompliantColor = (value: string): boolean => {
  // CSS variables are compliant
  if (value.startsWith('var(--color-')) return true;
  
  // Grayscale hex values are allowed
  if (/^#(F|E|D|C|B|A|9|8|7|6|5|4|3|2|1|0){3,6}$/.test(value)) return true;
  
  // Transparent/inherit are allowed
  if (value === 'transparent' || value === 'inherit' || value === 'currentColor') return true;
  
  return false;
};

/**
 * Suggest replacement for non-compliant colors
 */
export const suggestColorReplacement = (color: string): string => {
  // Direct mapping
  if (colorRemediationMap[color as keyof typeof colorRemediationMap]) {
    return colorRemediationMap[color as keyof typeof colorRemediationMap];
  }
  
  // Tailwind class patterns
  if (color.includes('text-') || color.includes('bg-') || color.includes('border-')) {
    const semanticMap: Record<string, string> = {
      'red': 'error',
      'green': 'success',
      'yellow': 'warning',
      'blue': 'info',
      'amber': 'warning',
      'orange': 'warning',
      'purple': 'accent', // Would need brand context
      'pink': 'accent',   // Would need brand context
      'cyan': 'accent',   // Would need brand context
    };
    
    for (const [oldColor, newColor] of Object.entries(semanticMap)) {
      if (color.includes(oldColor)) {
        return color.replace(oldColor, newColor);
      }
    }
  }
  
  return '/* REVIEW NEEDED */';
};

/**
 * Generate CSS for a component with proper color tokens
 */
export const generateComponentCSS = (componentName: string, colors: Record<string, string>) => {
  let css = `/* ${componentName} - Color Tokens */\n`;
  
  for (const [property, value] of Object.entries(colors)) {
    if (!isCompliantColor(value)) {
      const replacement = suggestColorReplacement(value);
      css += `  /* WARNING: Non-compliant color detected */\n`;
      css += `  /* ${property}: ${value} → ${replacement} */\n`;
      css += `  ${property}: ${replacement};\n\n`;
    } else {
      css += `  ${property}: ${value};\n`;
    }
  }
  
  return css;
};
