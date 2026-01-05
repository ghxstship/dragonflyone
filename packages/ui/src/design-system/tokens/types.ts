/**
 * Brand Configuration Interface
 * 
 * Defines the complete brand customization options for whitelabeling.
 * All visual tokens can be overridden per-tenant.
 */
export interface BrandConfig {
  name: string;
  logo: {
    primary: string;
    mark: string;
    wordmark?: string;
    favicon: string;
    dark?: {
      primary: string;
      mark: string;
    };
  };
  colors?: {
    primary?: string;
    primaryHover?: string;
    primaryActive?: string;
    primarySubtle?: string;
    secondary?: string;
    accent?: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
    mono?: string;
  };
  /** Override default radius values */
  radius?: {
    none?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
    full?: string;
  };
  /** Override default shadow values */
  shadows?: {
    none?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  content?: {
    appName?: string;
    tagline?: string;
    supportEmail?: string;
    supportUrl?: string;
    docsUrl?: string;
    termsUrl?: string;
    privacyUrl?: string;
    copyrightHolder?: string;
  };
  features?: {
    showPoweredBy?: boolean;
    customDomain?: boolean;
    customEmailTemplates?: boolean;
    /** Use sharp corners (pop-art style) instead of rounded */
    sharpCorners?: boolean;
    /** Use hard offset shadows (pop-art style) instead of subtle */
    hardShadows?: boolean;
  };
}

export interface BrandColorTokens {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primarySubtle: string;
  secondary: string;
  accent: string;
}

export interface SemanticColorTokens {
  success: { base: string; subtle: string; text: string };
  warning: { base: string; subtle: string; text: string };
  error: { base: string; subtle: string; text: string };
  info: { base: string; subtle: string; text: string };
}

export interface SurfaceColors {
  background: { light: string; dark: string };
  elevated: { light: string; dark: string };
  overlay: { light: string; dark: string };
  sidebar: { light: string; dark: string };
  card: { light: string; dark: string };
  input: { light: string; dark: string };
}

export interface TextColors {
  primary: { light: string; dark: string };
  secondary: { light: string; dark: string };
  tertiary: { light: string; dark: string };
  disabled: { light: string; dark: string };
  inverse: { light: string; dark: string };
  link: { light: string; dark: string };
}

export interface BorderColors {
  default: { light: string; dark: string };
  subtle: { light: string; dark: string };
  strong: { light: string; dark: string };
  focus: { light: string; dark: string };
}

export interface StatusColors {
  todo: string;
  inProgress: string;
  review: string;
  blocked: string;
  complete: string;
  archived: string;
}

export interface PriorityColors {
  urgent: string;
  high: string;
  medium: string;
  low: string;
  none: string;
}

export interface ColorTokens {
  brand: BrandColorTokens;
  semantic: SemanticColorTokens;
  neutral: Record<number, string>;
  surface: SurfaceColors;
  text: TextColors;
  border: BorderColors;
  status: StatusColors;
  priority: PriorityColors;
}

export interface TypographyTokens {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
  letterSpacing: Record<string, string>;
  textStyles: Record<string, Record<string, string>>;
}

export interface LayoutTokens {
  sidebar: {
    collapsed: string;
    expanded: string;
    maxWidth: string;
  };
  content: Record<string, string>;
  header: {
    sm: string;
    md: string;
    lg: string;
  };
  card: {
    compact: { padding: string; gap: string };
    default: { padding: string; gap: string };
    spacious: { padding: string; gap: string };
  };
}

export interface MotionTokens {
  duration: Record<string, string>;
  easing: Record<string, string>;
  transitions: Record<string, string>;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: Record<string, string>;
  layout: LayoutTokens;
  radius: Record<string, string>;
  shadows: Record<string, string>;
  motion: MotionTokens;
  zIndex: Record<string, number | string>;
  breakpoints: Record<string, string>;
}
