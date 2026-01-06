/**
 * UI v2 Palette Generator
 * Automatically generates accessible color palettes from a single brand color
 * Includes WCAG AAA contrast checking and state color generation
 */

import type { ColorShades } from './types';

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('')}`;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: r * 255,
    g: g * 255,
    b: b * 255,
  };
}

// ============================================================================
// Contrast Calculation (WCAG)
// ============================================================================

/**
 * Calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }

  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Find the best contrast color (black or white) for a background
 */
export function getBestContrastColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, '#ffffff');
  const blackContrast = getContrastRatio(backgroundColor, '#000000');

  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
}

// ============================================================================
// Palette Generation
// ============================================================================

/**
 * Generate a full color palette from a single base color
 */
export function generateColorPalette(baseColor: string): ColorShades {
  const rgb = hexToRgb(baseColor);
  if (!rgb) {
    throw new Error(`Invalid color: ${baseColor}`);
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Generate shades by adjusting lightness
  const shades: ColorShades = {
    50: generateShade(hsl, 95),
    100: generateShade(hsl, 90),
    200: generateShade(hsl, 80),
    300: generateShade(hsl, 70),
    400: generateShade(hsl, 60),
    500: baseColor, // Base color
    600: generateShade(hsl, 45),
    700: generateShade(hsl, 35),
    800: generateShade(hsl, 25),
    900: generateShade(hsl, 15),
    950: generateShade(hsl, 10),
  };

  return shades;
}

/**
 * Generate a single shade from HSL
 */
function generateShade(hsl: { h: number; s: number; l: number }, targetLightness: number): string {
  // Adjust saturation slightly for very light/dark shades
  let saturation = hsl.s;
  if (targetLightness > 80) {
    saturation = Math.max(hsl.s - (targetLightness - 80) * 0.5, 10);
  } else if (targetLightness < 20) {
    saturation = Math.max(hsl.s - (20 - targetLightness) * 0.3, 10);
  }

  const rgb = hslToRgb(hsl.h, saturation, targetLightness);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Generate state colors (hover, active) from a base color
 */
export function generateStateColors(baseColor: string): {
  base: string;
  hover: string;
  active: string;
  disabled: string;
} {
  const rgb = hexToRgb(baseColor);
  if (!rgb) {
    throw new Error(`Invalid color: ${baseColor}`);
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    base: baseColor,
    hover: generateShade(hsl, Math.max(hsl.l - 10, 10)),
    active: generateShade(hsl, Math.max(hsl.l - 20, 5)),
    disabled: generateShade(hsl, Math.min(hsl.l + 30, 85)),
  };
}

/**
 * Generate a complete accessible palette with text colors
 */
export function generateAccessiblePalette(brandColor: string): {
  palette: ColorShades;
  textColors: {
    onBrand: string;
    onBrandSubtle: string;
  };
  states: {
    hover: string;
    active: string;
    disabled: string;
  };
} {
  const palette = generateColorPalette(brandColor);
  const states = generateStateColors(brandColor);

  // Find best contrast for the base brand color (500)
  const onBrand = getBestContrastColor(brandColor);

  // For subtle backgrounds (50), use a darker text
  const onBrandSubtle = getBestContrastColor(palette[50]);

  return {
    palette,
    textColors: {
      onBrand,
      onBrandSubtle,
    },
    states,
  };
}

/**
 * Validate palette accessibility
 */
export function validatePaletteAccessibility(palette: ColorShades): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if lightest shades have sufficient contrast with white backgrounds
  const lightContrast50 = getContrastRatio(palette[50], '#ffffff');
  if (lightContrast50 < 1.5) {
    issues.push('Shade 50 has insufficient contrast with white backgrounds');
  }

  // Check if darkest shades have sufficient contrast with black backgrounds
  const darkContrast950 = getContrastRatio(palette[950], '#000000');
  if (darkContrast950 < 1.5) {
    issues.push('Shade 950 has insufficient contrast with black backgrounds');
  }

  // Check if base color (500) has good contrast with text
  const whiteContrast = getContrastRatio(palette[500], '#ffffff');
  const blackContrast = getContrastRatio(palette[500], '#000000');

  if (whiteContrast < 4.5 && blackContrast < 4.5) {
    issues.push('Base color (500) does not meet WCAG AA contrast with either black or white text');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

// ============================================================================
// CSS Variable Generation
// ============================================================================

/**
 * Generate CSS variables for a color palette
 */
export function generatePaletteCSSVariables(
  palette: ColorShades,
  prefix: string = 'brand'
): string {
  return Object.entries(palette)
    .map(([shade, color]) => `  --color-${prefix}-${shade}: ${color};`)
    .join('\n');
}
