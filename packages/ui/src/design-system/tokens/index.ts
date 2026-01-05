import type { BrandConfig, DesignTokens } from "./types.js";

/**
 * Default radius values - ClickUp 4.0 style (subtle rounded corners)
 */
const defaultRadius = {
  none: "0",
  xs: "2px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  "3xl": "24px",
  full: "9999px",
};

/**
 * Sharp radius values - Pop Art style (geometric, no rounding)
 */
const sharpRadius = {
  none: "0",
  xs: "0",
  sm: "0",
  md: "0",
  lg: "0",
  xl: "0",
  "2xl": "0",
  "3xl": "0",
  full: "9999px", // Keep full for avatars
};

/**
 * Default shadows - ClickUp 4.0 style (subtle depth)
 */
const defaultShadows = {
  none: "none",
  xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
  md: "0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.03)",
  xl: "0 20px 25px rgba(0, 0, 0, 0.08), 0 8px 10px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px rgba(0, 0, 0, 0.12)",
  inner: "inset 0 2px 4px rgba(0, 0, 0, 0.04)",
  card: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
  cardHover: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
  dropdown: "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)",
  modal: "0 24px 48px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.08)",
  toast: "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.08)",
  focus: "0 0 0 3px rgba(123, 104, 238, 0.25)",
  focusError: "0 0 0 3px rgba(255, 71, 87, 0.25)",
};

/**
 * Hard shadows - Pop Art style (comic book offset)
 */
const hardShadows = {
  none: "none",
  xs: "2px 2px 0 rgba(0, 0, 0, 0.15)",
  sm: "3px 3px 0 rgba(0, 0, 0, 0.2)",
  md: "4px 4px 0 rgba(0, 0, 0, 0.2)",
  lg: "6px 6px 0 rgba(0, 0, 0, 0.25)",
  xl: "8px 8px 0 rgba(0, 0, 0, 0.3)",
  "2xl": "12px 12px 0 rgba(0, 0, 0, 0.35)",
  inner: "inset 2px 2px 0 rgba(0, 0, 0, 0.1)",
  card: "4px 4px 0 rgba(0, 0, 0, 0.15)",
  cardHover: "6px 6px 0 rgba(0, 0, 0, 0.2)",
  dropdown: "4px 4px 0 rgba(0, 0, 0, 0.2)",
  modal: "8px 8px 0 rgba(0, 0, 0, 0.25)",
  toast: "4px 4px 0 rgba(0, 0, 0, 0.2)",
  focus: "0 0 0 3px rgba(0, 0, 0, 0.3)",
  focusError: "0 0 0 3px rgba(255, 71, 87, 0.3)",
};

export const createDesignTokens = (brandConfig: BrandConfig): DesignTokens => {
  // Determine style based on feature flags
  const useSharpCorners = brandConfig.features?.sharpCorners ?? false;
  const useHardShadows = brandConfig.features?.hardShadows ?? false;
  
  // Select radius and shadow presets based on style
  const baseRadius = useSharpCorners ? sharpRadius : defaultRadius;
  const baseShadows = useHardShadows ? hardShadows : defaultShadows;
  
  return {
  colors: {
    brand: {
      primary: brandConfig.colors?.primary ?? "#7B68EE",
      primaryHover: brandConfig.colors?.primaryHover ?? "#6B5BD4",
      primaryActive: brandConfig.colors?.primaryActive ?? "#5B4EC4",
      primarySubtle: brandConfig.colors?.primarySubtle ?? "#7B68EE15",
      secondary: brandConfig.colors?.secondary ?? "#49CCF9",
      accent: brandConfig.colors?.accent ?? "#FF6B6B",
    },
    semantic: {
      success: { base: "#6BC950", subtle: "#6BC95015", text: "#4A9E35" },
      warning: { base: "#FFCC00", subtle: "#FFCC0015", text: "#B38F00" },
      error: { base: "#FF4757", subtle: "#FF475715", text: "#CC3945" },
      info: { base: "#49CCF9", subtle: "#49CCF915", text: "#3AA3C7" },
    },
    neutral: {
      0: "#FFFFFF",
      25: "#FAFAFA",
      50: "#F5F5F5",
      100: "#EBEBEB",
      200: "#D9D9D9",
      300: "#BFBFBF",
      400: "#8C8C8C",
      500: "#595959",
      600: "#434343",
      700: "#2E2E2E",
      800: "#1F1F1F",
      900: "#141414",
      950: "#0A0A0A",
    },
    surface: {
      background: { light: "#FFFFFF", dark: "#1A1A2E" },
      elevated: { light: "#FFFFFF", dark: "#252542" },
      overlay: { light: "#00000080", dark: "#000000B3" },
      sidebar: { light: "#FAFAFA", dark: "#16162A" },
      card: { light: "#FFFFFF", dark: "#252542" },
      input: { light: "#FFFFFF", dark: "#1E1E3A" },
    },
    text: {
      primary: { light: "#1F1F1F", dark: "#FFFFFF" },
      secondary: { light: "#595959", dark: "#BFBFBF" },
      tertiary: { light: "#8C8C8C", dark: "#8C8C8C" },
      disabled: { light: "#BFBFBF", dark: "#595959" },
      inverse: { light: "#FFFFFF", dark: "#1F1F1F" },
      link: { light: "#7B68EE", dark: "#9D8FFF" },
    },
    border: {
      default: { light: "#EBEBEB", dark: "#3D3D5C" },
      subtle: { light: "#F5F5F5", dark: "#2E2E4A" },
      strong: { light: "#D9D9D9", dark: "#4D4D6D" },
      focus: { light: "#7B68EE", dark: "#9D8FFF" },
    },
    status: {
      todo: "#8C8C8C",
      inProgress: "#49CCF9",
      review: "#FFCC00",
      blocked: "#FF4757",
      complete: "#6BC950",
      archived: "#595959",
    },
    priority: {
      urgent: "#FF4757",
      high: "#FF8C42",
      medium: "#FFCC00",
      low: "#49CCF9",
      none: "#8C8C8C",
    },
  },
  typography: {
    fontFamily: {
      primary:
        brandConfig.fonts?.primary ?? '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: brandConfig.fonts?.secondary ?? '"Inter", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.8125rem",
      base: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.333rem",
      "2xl": "1.5rem",
      "3xl": "2rem",
      "4xl": "2.667rem",
      "5xl": "3.556rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
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
      tighter: "-0.02em",
      tight: "-0.01em",
      normal: "0",
      wide: "0.01em",
      wider: "0.02em",
      widest: "0.05em",
    },
    textStyles: {
      displayLg: { size: "3xl", weight: "bold", lineHeight: "tight", tracking: "tighter" },
      displayMd: { size: "2xl", weight: "bold", lineHeight: "tight", tracking: "tight" },
      displaySm: { size: "xl", weight: "semibold", lineHeight: "tight", tracking: "tight" },
      h1: { size: "xl", weight: "semibold", lineHeight: "tight" },
      h2: { size: "lg", weight: "semibold", lineHeight: "snug" },
      h3: { size: "md", weight: "semibold", lineHeight: "snug" },
      h4: { size: "base", weight: "semibold", lineHeight: "normal" },
      bodyLg: { size: "md", weight: "normal", lineHeight: "relaxed" },
      bodyMd: { size: "base", weight: "normal", lineHeight: "relaxed" },
      bodySm: { size: "sm", weight: "normal", lineHeight: "normal" },
      bodyXs: { size: "xs", weight: "normal", lineHeight: "normal" },
      labelLg: { size: "base", weight: "medium", lineHeight: "none" },
      labelMd: { size: "sm", weight: "medium", lineHeight: "none" },
      labelSm: { size: "xs", weight: "medium", lineHeight: "none", tracking: "wide" },
      overline: { size: "xs", weight: "semibold", lineHeight: "none", tracking: "widest", transform: "uppercase" },
      codeLg: { family: "mono", size: "base", weight: "normal" },
      codeSm: { family: "mono", size: "sm", weight: "normal" },
    },
  },
  spacing: {
    px: "1px",
    0: "0",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },
  layout: {
    sidebar: {
      collapsed: "64px",
      expanded: "260px",
      maxWidth: "320px",
    },
    content: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      full: "100%",
    },
    header: {
      sm: "48px",
      md: "56px",
      lg: "64px",
    },
    card: {
      compact: { padding: "12px", gap: "8px" },
      default: { padding: "16px", gap: "12px" },
      spacious: { padding: "24px", gap: "16px" },
    },
  },
  radius: {
    ...baseRadius,
    ...(brandConfig.radius ?? {}),
  },
  shadows: {
    ...baseShadows,
    ...(brandConfig.shadows ?? {}),
  },
  motion: {
    duration: {
      instant: "0ms",
      fast: "100ms",
      normal: "200ms",
      slow: "300ms",
      slower: "400ms",
      slowest: "500ms",
    },
    easing: {
      linear: "linear",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
    transitions: {
      default: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
      fast: "100ms cubic-bezier(0.4, 0, 0.2, 1)",
      slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
      colors: "color 200ms, background-color 200ms, border-color 200ms",
      transform: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      shadow: "box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      all: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    raised: 1,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    toast: 1500,
    tooltip: 1600,
    max: 9999,
  },
  breakpoints: {
    xs: "475px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  };
};

export * from "./types.js";
