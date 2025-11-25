/**
 * GHXSTSHIP Design System Tokens
 * Contemporary Minimal Pop Art
 * Monochromatic palette with stark contrast
 */

// Color Palette - Monochromatic Only
export const colors = {
  // Primary
  black: "#000000",
  white: "#FFFFFF",
  
  // Greyscale for depth, texture, and hierarchy
  grey100: "#F5F5F5",
  grey200: "#E5E5E5",
  grey300: "#D4D4D4",
  grey400: "#A3A3A3",
  grey500: "#737373",
  grey600: "#525252",
  grey700: "#404040",
  grey800: "#262626",
  grey900: "#171717",
} as const;

// Typography System
export const typography = {
  display: "'Anton', 'Impact', 'Arial Black', sans-serif",
  heading: "'Bebas Neue', 'Arial Narrow', 'Arial', sans-serif",
  body: "'Share Tech', 'Monaco', 'Consolas', monospace",
  mono: "'Share Tech Mono', 'Courier New', 'Courier', monospace",
} as const;

export const fontSizes = {
  // Display/Title (ANTON)
  displayXL: "7.5rem",    // 120px
  displayLG: "5.625rem",   // 90px
  displayMD: "4.5rem",     // 72px
  
  // H1 (ANTON)
  h1LG: "5rem",            // 80px
  h1MD: "3.5rem",          // 56px
  h1SM: "2.25rem",         // 36px
  
  // H2-H6 (BEBAS NEUE)
  h2LG: "3.5rem",          // 56px
  h2MD: "2.5rem",          // 40px
  h2SM: "1.75rem",         // 28px
  h3LG: "2.5rem",          // 40px
  h3MD: "2rem",            // 32px
  h3SM: "1.5rem",          // 24px
  h4LG: "2rem",            // 32px
  h4MD: "1.5rem",          // 24px
  h4SM: "1.25rem",         // 20px
  h5LG: "1.5rem",          // 24px
  h5MD: "1.25rem",         // 20px
  h5SM: "1.125rem",        // 18px
  h6LG: "1.25rem",         // 20px
  h6MD: "1.125rem",        // 18px
  h6SM: "1rem",            // 16px
  
  // Body (SHARE TECH)
  bodyLG: "1.25rem",       // 20px
  bodyMD: "1.125rem",      // 18px
  bodySM: "1rem",          // 16px
  bodyXS: "0.9375rem",     // 15px
  
  // Mono/Labels (SHARE TECH MONO)
  monoLG: "1rem",          // 16px
  monoMD: "0.875rem",      // 14px
  monoSM: "0.8125rem",     // 13px
  monoXS: "0.75rem",       // 12px
  monoXXS: "0.6875rem",    // 11px
} as const;

export const lineHeights = {
  tight: 0.9,
  snug: 1.0,
  normal: 1.1,
  relaxed: 1.2,
  loose: 1.4,
  body: 1.6,
  comfortable: 1.8,
} as const;

export const letterSpacing = {
  tightest: "-0.02em",
  tight: "-0.01em",
  normal: "0",
  wide: "0.02em",
  wider: "0.04em",
  widest: "0.05em",
  ultra: "0.1em",
  mega: "0.3em",
} as const;

// Spacing System
export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",   // 2px
  1: "0.25rem",      // 4px
  1.5: "0.375rem",   // 6px
  2: "0.5rem",       // 8px
  2.5: "0.625rem",   // 10px
  3: "0.75rem",      // 12px
  3.5: "0.875rem",   // 14px
  4: "1rem",         // 16px
  5: "1.25rem",      // 20px
  6: "1.5rem",       // 24px
  7: "1.75rem",      // 28px
  8: "2rem",         // 32px
  9: "2.25rem",      // 36px
  10: "2.5rem",      // 40px
  11: "2.75rem",     // 44px
  12: "3rem",        // 48px
  14: "3.5rem",      // 56px
  16: "4rem",        // 64px
  20: "5rem",        // 80px
  24: "6rem",        // 96px
  28: "7rem",        // 112px
  32: "8rem",        // 128px
} as const;

// Border Radii (minimal for geometric aesthetic)
export const radii = {
  none: "0",
  subtle: "2px",
  sm: "4px",
} as const;

// Border Widths
export const borderWidths = {
  thin: "1px",
  medium: "2px",
  thick: "3px",
  ultra: "4px",
} as const;

// Shadows (using outlines, not soft shadows)
export const shadows = {
  none: "none",
  outline: `0 0 0 1px ${colors.grey700}`,
  outlineBold: `0 0 0 2px ${colors.black}`,
  hard: `4px 4px 0 0 ${colors.black}`,
} as const;

// Z-index hierarchy
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// Transitions
export const transitions = {
  fast: "100ms ease-in-out",
  base: "200ms ease-in-out",
  slow: "300ms ease-in-out",
  slower: "500ms ease-in-out",
} as const;

// Breakpoints
export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;
