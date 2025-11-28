// GHXSTSHIP Auth Theme - Style tokens from STYLE-GUIDE-PREVIEW.jsx
// Bold Contemporary Pop Art Adventure

export const darkTheme = {
  bg: '#0a0a0a',
  bgCard: '#171717',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.6)',
  textFaint: 'rgba(255,255,255,0.4)',
  border: 'rgba(255,255,255,0.2)',
  borderLight: 'rgba(255,255,255,0.1)',
  shadow: 'rgba(255,255,255,0.15)',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  destructive: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const lightTheme = {
  bg: '#fafafa',
  bgCard: '#ffffff',
  text: '#0a0a0a',
  textMuted: 'rgba(0,0,0,0.6)',
  textFaint: 'rgba(0,0,0,0.4)',
  border: 'rgba(0,0,0,0.2)',
  borderLight: 'rgba(0,0,0,0.1)',
  shadow: 'rgba(0,0,0,0.15)',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  destructive: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// Typography tokens
export const typography = {
  display: {
    fontSize: '48px',
    fontWeight: 900,
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.025em',
  },
  h1: {
    fontSize: '36px',
    fontWeight: 900,
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '28px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontSize: '22px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  h4: {
    fontSize: '18px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
  },
  small: {
    fontSize: '14px',
    fontWeight: 500,
  },
  xsmall: {
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  label: {
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
};

// Spacing tokens (4px base unit)
export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
};

// Shadow tokens (hard offset, no blur)
export const shadows = {
  xs: '2px 2px 0',
  sm: '3px 3px 0',
  md: '4px 4px 0',
  lg: '6px 6px 0',
  xl: '8px 8px 0',
};

// Border tokens
export const borders = {
  thin: '1px',
  default: '2px',
  thick: '3px',
  heavy: '4px',
};

// Border radius tokens
export const radii = {
  none: '0px',
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '16px',
  full: '50%',
};

// Animation tokens
export const animations = {
  fast: '100ms',
  normal: '150ms',
  slow: '250ms',
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Component style factories
export const createInputStyles = (theme: typeof darkTheme | typeof lightTheme) => ({
  width: '100%',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 500,
  border: `2px solid ${theme.border}`,
  borderRadius: 0,
  backgroundColor: theme.bgCard,
  color: theme.text,
  boxShadow: `2px 2px 0 ${theme.shadow}`,
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
});

export const createLabelStyles = (theme: typeof darkTheme | typeof lightTheme) => ({
  display: 'block',
  fontSize: '14px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '8px',
  color: theme.text,
});

export const createPrimaryButtonStyles = (theme: typeof darkTheme | typeof lightTheme, disabled = false) => ({
  width: '100%',
  padding: '12px 24px',
  backgroundColor: theme.primary,
  color: '#ffffff',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  fontSize: '14px',
  border: `2px solid ${theme.primary}`,
  borderRadius: 0,
  boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  transition: 'all 0.15s ease',
});

export const createOutlineButtonStyles = (theme: typeof darkTheme | typeof lightTheme, disabled = false) => ({
  width: '100%',
  padding: '12px 24px',
  backgroundColor: 'transparent',
  color: theme.text,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  fontSize: '14px',
  border: `2px solid ${theme.text}`,
  borderRadius: 0,
  boxShadow: `3px 3px 0 ${theme.shadow}`,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  transition: 'all 0.15s ease',
});

export const createGhostButtonStyles = (theme: typeof darkTheme | typeof lightTheme) => ({
  background: 'none',
  border: 'none',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: theme.textMuted,
  cursor: 'pointer',
  padding: 0,
  transition: 'color 0.15s ease',
});

export const createCardStyles = (theme: typeof darkTheme | typeof lightTheme) => ({
  width: '100%',
  maxWidth: '420px',
  border: `2px solid ${theme.border}`,
  borderRadius: '8px',
  backgroundColor: theme.bgCard,
  boxShadow: `4px 4px 0 ${theme.shadow}`,
  padding: '32px',
});

export const createErrorStyles = () => ({
  padding: '12px 16px',
  marginBottom: '24px',
  border: '2px solid #ef4444',
  backgroundColor: 'rgba(239,68,68,0.1)',
  color: '#ef4444',
  fontSize: '14px',
  fontWeight: 500,
});

export const createDividerStyles = (theme: typeof darkTheme | typeof lightTheme) => ({
  container: {
    position: 'relative' as const,
    margin: '32px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute' as const,
    width: '100%',
    height: '2px',
    backgroundColor: theme.border,
  },
  text: {
    position: 'relative' as const,
    padding: '0 16px',
    backgroundColor: theme.bgCard,
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: theme.textMuted,
  },
});
