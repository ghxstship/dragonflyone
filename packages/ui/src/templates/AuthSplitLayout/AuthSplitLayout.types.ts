import type { ReactNode, HTMLAttributes } from "react";

export interface AuthSplitLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Brand panel content - left side on desktop */
  brandPanel?: ReactNode;
  /** Brand panel background - gradient, image, or solid color */
  brandBackground?: "gradient" | "pattern" | "image" | "solid";
  /** Custom brand background class or image URL */
  brandBackgroundCustom?: string;
  /** Brand logo/name for header */
  brandLogo?: ReactNode;
  /** Brand tagline for brand panel */
  brandTagline?: string;
  /** Brand features/benefits list */
  brandFeatures?: Array<{ icon?: ReactNode; title: string; description?: string }>;
  /** Testimonial for brand panel */
  testimonial?: { quote: string; author: string; role?: string; avatar?: string };
  /** Form panel title */
  title?: string;
  /** Form panel subtitle */
  subtitle?: string;
  /** Footer link (e.g., "Already have an account? Sign in") */
  footer?: { text: string; linkText: string; linkHref: string };
  /** Main form content */
  children: ReactNode;
  /** Footer links */
  footerLinks?: Array<{ label: string; href: string }>;
  /** Copyright text */
  copyright?: string;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Offline state */
  offline?: boolean;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id for skip link */
  mainContentId?: string;
  /** Hide brand panel (single column mode) */
  singleColumn?: boolean;
  /** Form panel max width */
  formMaxWidth?: "sm" | "md" | "lg";
}
